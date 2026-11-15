-- One contact record for every request. Whatever form a person uses (consultation request, buyer preference
-- tool, sell / home-value request, client referral), the request is attached to their record in fanc_clients:
--   * someone already in the client database (same email or phone) → the request is linked to them, and a
--     note goes on their timeline, so a past client coming back is obvious;
--   * someone new, from the website or a client referral → a prospect record is created for them.
-- A broker's own listing opportunities (door knocks, snapped houses) are only matched, never used to create
-- clients, so owners of record don't fill up the client database.
-- Existing client details are never changed by a submission. Run after client_links.sql and multi_tenancy.sql.

ALTER TABLE public.fanc_consultation_requests
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.fanc_clients (id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_fanc_consultation_requests_client ON public.fanc_consultation_requests (client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fanc_listing_opportunities_client ON public.fanc_listing_opportunities (client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fanc_clients_email_lower ON public.fanc_clients (lower(email)) WHERE email IS NOT NULL;

CREATE OR REPLACE FUNCTION private.fanc_intake_contact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  is_lead   boolean := TG_TABLE_NAME = 'fanc_consultation_requests';
  staff     boolean := private.fanc_is_staff();
  v_name    text;
  v_email   text;
  v_phone   text;
  v_digits  text;
  v_broker  uuid := COALESCE(NEW.brokerage_id, private.fanc_request_brokerage());
  v_client  uuid;
  v_type    text;
  v_what    text;
  v_parts   text[];
  v_created boolean := false;
BEGIN
  IF is_lead THEN
    v_name := NEW.name; v_email := NEW.email; v_phone := NEW.phone;
    v_what := 'Website consultation request';
    v_type := CASE
      WHEN NEW.intent && ARRAY['buy', 'hud', 'relocate', 'build'] AND 'sell' = ANY (NEW.intent) THEN 'both'
      WHEN 'sell' = ANY (NEW.intent) THEN 'seller'
      WHEN NEW.intent && ARRAY['buy', 'hud', 'relocate', 'build'] THEN 'buyer'
      WHEN 'invest' = ANY (NEW.intent) THEN 'investor'
    END;
  ELSE
    v_name := NEW.owner_name; v_email := NEW.owner_email; v_phone := NEW.owner_phone;
    v_what := 'Listing request' || COALESCE(': ' || NULLIF(concat_ws(', ', NEW.property_address, NEW.city), ''), '');
    v_type := 'seller';
  END IF;

  -- Only staff may choose the client themselves.
  IF NOT staff THEN
    NEW.client_id := NULL;
  ELSIF NEW.client_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_email := NULLIF(lower(btrim(v_email)), '');
  v_digits := right(regexp_replace(COALESCE(v_phone, ''), '\D', '', 'g'), 10);
  IF length(v_digits) < 10 THEN v_digits := NULL; END IF;
  IF v_email IS NULL AND v_digits IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT c.id INTO v_client
  FROM public.fanc_clients c
  WHERE c.brokerage_id = v_broker
    AND ((v_email IS NOT NULL AND (lower(c.email) = v_email OR lower(c.secondary_email) = v_email))
      OR (v_digits IS NOT NULL AND (right(regexp_replace(COALESCE(c.phone, ''), '\D', '', 'g'), 10) = v_digits
                                 OR right(regexp_replace(COALESCE(c.secondary_phone, ''), '\D', '', 'g'), 10) = v_digits)))
  ORDER BY (v_email IS NOT NULL AND lower(c.email) = v_email) DESC, c.created_at
  LIMIT 1;

  IF v_client IS NULL THEN
    IF staff AND NOT is_lead THEN
      RETURN NEW;
    END IF;
    v_parts := regexp_split_to_array(btrim(COALESCE(v_name, '')), '\s+');
    INSERT INTO public.fanc_clients (brokerage_id, first_name, last_name, email, phone, status, lead_type, source, tags)
    VALUES (
      v_broker,
      COALESCE(NULLIF(CASE WHEN array_length(v_parts, 1) > 1 THEN array_to_string(v_parts[1:array_length(v_parts, 1) - 1], ' ') ELSE v_parts[1] END, ''), 'Unknown'),
      CASE WHEN array_length(v_parts, 1) > 1 THEN v_parts[array_length(v_parts, 1)] END,
      v_email,
      NULLIF(btrim(v_phone), ''),
      'prospect',
      v_type,
      CASE WHEN is_lead THEN 'findanchome.com consultation' ELSE 'findanchome.com listing request' END,
      to_jsonb(ARRAY[CASE WHEN is_lead THEN 'Website consultation' ELSE 'Listing request' END])
    )
    RETURNING id INTO v_client;
    v_created := true;
  END IF;

  NEW.client_id := v_client;
  INSERT INTO public.fanc_client_activity (brokerage_id, client_id, kind, body, author_id, author_name)
  VALUES (v_broker, v_client, 'note',
          CASE WHEN v_created THEN 'Added from: ' ELSE 'New request: ' END || left(v_what, 500),
          auth.uid(), 'FindaNChome.com');
  RETURN NEW;
END;
$$;

-- Named to run after the review and branch triggers (triggers fire in name order).
DROP TRIGGER IF EXISTS fanc_zz_intake_contact ON public.fanc_consultation_requests;
CREATE TRIGGER fanc_zz_intake_contact BEFORE INSERT ON public.fanc_consultation_requests
  FOR EACH ROW EXECUTE FUNCTION private.fanc_intake_contact();

DROP TRIGGER IF EXISTS fanc_zz_intake_contact ON public.fanc_listing_opportunities;
CREATE TRIGGER fanc_zz_intake_contact BEFORE INSERT ON public.fanc_listing_opportunities
  FOR EACH ROW EXECUTE FUNCTION private.fanc_intake_contact();

-- Leads that were already added to the client database by hand.
UPDATE public.fanc_consultation_requests r
SET client_id = c.id
FROM public.fanc_clients c
WHERE c.consultation_id = r.id AND r.client_id IS NULL;
