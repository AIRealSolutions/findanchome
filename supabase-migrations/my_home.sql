-- "My Home" for past clients (/dashboard/my-home): their home, their own key dates (insurance, warranty, HOA…)
-- and the homeowner calendar, in the client portal.
--   * A broker switches on "My Home access" for a client (fanc_clients.portal_access). That client's email can
--     then get a sign-in link on /join, and their first sign-in links the login to their client record.
--   * Clients never read fanc_clients or its related tables directly: fanc_my_home() returns only what is theirs to
--     see (no broker notes, tags, import data or other clients). The old "Clients can view own record" policy is
--     dropped for that reason; it would have shown a signed-in client the broker's private notes about them.
--   * Clients can add and remove their own dates; those show on the broker's calendar like any other date.
-- Run after client_calendar.sql, messaging.sql and unified_intake.sql. Safe to run more than once.

ALTER TABLE public.fanc_clients
  ADD COLUMN IF NOT EXISTS portal_access BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS portal_invited_at TIMESTAMPTZ;
ALTER TABLE public.fanc_client_dates
  ADD COLUMN IF NOT EXISTS added_by_client BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_fanc_clients_user ON public.fanc_clients (user_id) WHERE user_id IS NOT NULL;

DROP POLICY IF EXISTS "Clients can view own record" ON public.fanc_clients;

-- The join page also accepts clients who were given My Home access.
CREATE OR REPLACE FUNCTION public.fanc_invite_exists(addr text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.fanc_deal_members WHERE email = lower(trim(addr)))
      OR EXISTS (SELECT 1 FROM public.fanc_conversation_members WHERE email = lower(trim(addr)))
      OR EXISTS (SELECT 1 FROM public.fanc_clients WHERE portal_access AND lower(email) = lower(trim(addr)))
$$;
REVOKE ALL ON FUNCTION public.fanc_invite_exists(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fanc_invite_exists(text) TO anon, authenticated;

-- Signing in links the login to deal invites, conversation invites and now the person's client record.
-- A client record is linked when the broker gave it My Home access, or when the person is already on one of
-- that client's deals. The sign-in link proves they own the email address.
CREATE OR REPLACE FUNCTION public.fanc_claim_invites()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  me UUID := auth.uid();
  my_email TEXT := lower(auth.jwt() ->> 'email');
  fname TEXT;
  n integer;
  c integer;
  h integer;
BEGIN
  IF me IS NULL OR my_email IS NULL THEN RETURN 0; END IF;
  UPDATE public.fanc_deal_members SET user_id = me, last_seen_at = NOW()
  WHERE email = my_email AND (user_id IS NULL OR user_id = me);
  GET DIAGNOSTICS n = ROW_COUNT;
  UPDATE public.fanc_conversation_members SET user_id = me WHERE email = my_email AND user_id IS NULL;
  GET DIAGNOSTICS c = ROW_COUNT;
  UPDATE public.fanc_clients cl SET user_id = me
  WHERE cl.user_id IS NULL AND lower(cl.email) = my_email
    AND (cl.portal_access OR EXISTS (
      SELECT 1 FROM public.fanc_deal_members m JOIN public.fanc_deals d ON d.id = m.deal_id
      WHERE m.user_id = me AND d.client_id = cl.id));
  GET DIAGNOSTICS h = ROW_COUNT;
  IF n + c + h > 0 AND NOT EXISTS (SELECT 1 FROM public.fanc_user_profiles WHERE id = me) THEN
    SELECT split_part(x.name, ' ', 1) INTO fname FROM (
      SELECT m.name FROM public.fanc_deal_members m WHERE m.user_id = me AND m.name IS NOT NULL
      UNION ALL
      SELECT m.name FROM public.fanc_conversation_members m WHERE m.user_id = me AND m.name IS NOT NULL
      UNION ALL
      SELECT cl.first_name::text FROM public.fanc_clients cl WHERE cl.user_id = me
    ) x LIMIT 1;
    INSERT INTO public.fanc_user_profiles (id, role, first_name, is_active) VALUES (me, 'client', fname, true);
  END IF;
  RETURN n + c + h;
END;
$$;
REVOKE ALL ON FUNCTION public.fanc_claim_invites() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fanc_claim_invites() TO authenticated;

-- Everything the signed-in client may see about their own home. NULL when they have no client record.
CREATE OR REPLACE FUNCTION public.fanc_my_home()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  WITH mine AS (
    SELECT cl.* FROM public.fanc_clients cl WHERE cl.user_id = auth.uid() AND auth.uid() IS NOT NULL
  )
  SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM mine) THEN NULL ELSE jsonb_build_object(
    'first_name', (SELECT first_name FROM mine ORDER BY created_at LIMIT 1),
    'homes', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', t.id, 'address', t.property_address, 'city', t.city, 'zip_code', t.zip_code,
        'closing_date', t.closing_date, 'purchase_price', t.sale_price, 'is_hud', t.is_hud
      ) ORDER BY t.closing_date DESC NULLS LAST)
      FROM public.fanc_client_transactions t
      WHERE t.client_id IN (SELECT id FROM mine) AND t.side IN ('buyer', 'both')
    ), '[]'::jsonb),
    -- No recorded purchase: fall back to the address on file.
    'address_on_file', (
      SELECT jsonb_build_object('address', address_line1, 'city', city, 'zip_code', zip_code, 'home_anniversary', home_anniversary)
      FROM mine WHERE address_line1 IS NOT NULL ORDER BY created_at LIMIT 1
    ),
    'dates', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', d.id, 'kind', d.kind, 'label', d.label, 'date', d.date, 'repeats', d.repeats,
        'provider', d.provider, 'added_by_client', d.added_by_client
      ) ORDER BY d.date)
      FROM public.fanc_client_dates d
      WHERE d.client_id IN (SELECT id FROM mine) AND d.kind <> 'wedding_anniversary'
    ), '[]'::jsonb)
  ) END
$$;

CREATE OR REPLACE FUNCTION public.fanc_my_home_add_date(p_kind text, p_date date, p_label text DEFAULT NULL, p_provider text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  cid uuid;
  bid uuid;
  new_id uuid;
BEGIN
  SELECT cl.id, cl.brokerage_id INTO cid, bid FROM public.fanc_clients cl
  WHERE cl.user_id = auth.uid() AND auth.uid() IS NOT NULL ORDER BY cl.created_at LIMIT 1;
  IF cid IS NULL THEN RAISE EXCEPTION 'No client record for this login' USING ERRCODE = '42501'; END IF;
  IF p_kind NOT IN ('insurance_renewal', 'flood_insurance_renewal', 'home_warranty_expiration', 'hoa_dues', 'mortgage_review', 'custom') THEN
    RAISE EXCEPTION 'That kind of date cannot be added here' USING ERRCODE = '22023';
  END IF;
  IF p_date IS NULL OR p_date < DATE '1950-01-01' OR p_date > CURRENT_DATE + 3660 THEN
    RAISE EXCEPTION 'Please enter a valid date' USING ERRCODE = '22023';
  END IF;
  IF (SELECT count(*) FROM public.fanc_client_dates d WHERE d.client_id = cid AND d.added_by_client) >= 40 THEN
    RAISE EXCEPTION 'You have reached the limit for saved dates' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.fanc_client_dates (brokerage_id, client_id, kind, label, date, repeats, remind_days, provider, added_by_client)
  VALUES (
    bid, cid, p_kind, NULLIF(left(btrim(COALESCE(p_label, '')), 120), ''), p_date,
    CASE WHEN p_kind = 'home_warranty_expiration' THEN 'once' ELSE 'yearly' END,
    CASE WHEN p_kind IN ('insurance_renewal', 'flood_insurance_renewal', 'home_warranty_expiration') THEN 30 ELSE 14 END,
    NULLIF(left(btrim(COALESCE(p_provider, '')), 120), ''), true
  ) RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- Clients remove only the dates they added themselves.
CREATE OR REPLACE FUNCTION public.fanc_my_home_remove_date(p_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE n integer;
BEGIN
  DELETE FROM public.fanc_client_dates d
  WHERE d.id = p_id AND d.added_by_client
    AND d.client_id IN (SELECT cl.id FROM public.fanc_clients cl WHERE cl.user_id = auth.uid() AND auth.uid() IS NOT NULL);
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.fanc_my_home(), public.fanc_my_home_add_date(text, date, text, text), public.fanc_my_home_remove_date(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fanc_my_home(), public.fanc_my_home_add_date(text, date, text, text), public.fanc_my_home_remove_date(uuid) TO authenticated;
