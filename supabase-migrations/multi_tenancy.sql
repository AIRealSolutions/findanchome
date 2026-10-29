-- Multi-brokerage tenancy (October 2026)
-- The platform can now host other brokerages next to Lightkeeper Realty, each seeing only its own data.
-- 1. Brokerages (one row per customer company), platform admins, and offices.
-- 2. Helpers that decide which brokerage a request belongs to:
--    - signed-in brokers and admins work in their profile's brokerage (platform admins in the one they switched into);
--    - the public and clients file into the brokerage whose site they're on (the x-fanc-host header the app sends),
--      falling back to the default brokerage (Lightkeeper) for unknown hosts such as previews and localhost.
-- 3. brokerage_id on every company table, backfilled to Lightkeeper. Child rows (deal tasks, listing photos, client
--    activity, ...) always take their parent's brokerage.
-- 4. A restrictive "Tenant fence" policy on each of those tables: on top of the existing policies, brokers and admins
--    only see and write their own brokerage's rows. Clients and the public stay limited by the existing policies to
--    rows that are theirs.
-- 5. Profiles: brokerage and office, seat limits, and only platform admins can move people between brokerages.
-- 6. Security-definer functions that bypass RLS now filter by brokerage too.
-- 7. Platform functions: switch brokerage, usage overview, add a member to a brokerage.
-- Run after listing_ownership.sql. Existing app code keeps working unchanged: without the header everything lands
-- in Lightkeeper, which is where all current data and users are.

-- ───────────────────────── 1. Brokerages, platform admins, offices ─────────────────────────
CREATE TABLE IF NOT EXISTS public.fanc_brokerages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 150),
  legal_name TEXT CHECK (char_length(legal_name) <= 200),
  firm_license TEXT CHECK (char_length(firm_license) <= 50),
  license_state TEXT NOT NULL DEFAULT 'NC' CHECK (license_state ~ '^[A-Z]{2}$'),
  email TEXT CHECK (char_length(email) <= 320),            -- new leads and seller requests are emailed here
  phone TEXT CHECK (char_length(phone) <= 50),
  website TEXT CHECK (char_length(website) <= 300),
  address TEXT CHECK (char_length(address) <= 300),
  city TEXT CHECK (char_length(city) <= 100),
  state TEXT CHECK (char_length(state) <= 2),
  zip_code TEXT CHECK (char_length(zip_code) <= 10),
  logo_url TEXT CHECK (char_length(logo_url) <= 500),
  primary_color TEXT CHECK (primary_color ~ '^#[0-9a-fA-F]{6}$'),
  billing_email TEXT CHECK (char_length(billing_email) <= 320),
  -- Platform-managed (see fanc_brokerage_guard): which hosts the public site answers on, and the subscription.
  domains TEXT[] NOT NULL DEFAULT '{}',                    -- lowercase hostnames without www.
  plan TEXT NOT NULL DEFAULT 'trial' CHECK (plan IN ('internal', 'trial', 'starter', 'growth', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'past_due', 'suspended', 'cancelled')),
  seat_limit INTEGER CHECK (seat_limit >= 1),              -- active brokers + admins; NULL = unlimited
  trial_ends_at DATE,
  is_default BOOLEAN NOT NULL DEFAULT false                -- unknown hosts (previews, localhost) land here
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fanc_brokerages_default ON public.fanc_brokerages (is_default) WHERE is_default;
CREATE INDEX IF NOT EXISTS idx_fanc_brokerages_domains ON public.fanc_brokerages USING gin (domains);
CREATE OR REPLACE TRIGGER update_fanc_brokerages_updated_at
  BEFORE UPDATE ON public.fanc_brokerages
  FOR EACH ROW EXECUTE FUNCTION public.update_fanc_updated_at_column();

INSERT INTO public.fanc_brokerages (slug, name, email, phone, website, state, domains, plan, status, is_default)
SELECT 'lightkeeper', 'Lightkeeper Realty', 'marcspencer28461@gmail.com', '(910) 363-6147', 'https://findanchome.com', 'NC',
       ARRAY['findanchome.com'], 'internal', 'active', true
WHERE NOT EXISTS (SELECT 1 FROM public.fanc_brokerages WHERE is_default);

-- Platform admins run the SaaS itself. Not exposed through the API: add or remove them in the SQL editor.
CREATE TABLE IF NOT EXISTS private.fanc_platform_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
REVOKE ALL ON private.fanc_platform_admins FROM PUBLIC, anon, authenticated;

ALTER TABLE public.fanc_user_profiles
  ADD COLUMN IF NOT EXISTS brokerage_id UUID REFERENCES public.fanc_brokerages (id),
  ADD COLUMN IF NOT EXISTS acting_brokerage_id UUID REFERENCES public.fanc_brokerages (id) ON DELETE SET NULL;

-- The first admin is Lightkeeper's principal broker, who runs the platform.
INSERT INTO private.fanc_platform_admins (user_id)
SELECT id FROM public.fanc_user_profiles WHERE role = 'admin' ORDER BY created_at LIMIT 1
ON CONFLICT DO NOTHING;

-- ───────────────────────── 2. Which brokerage a request belongs to ─────────────────────────
CREATE OR REPLACE FUNCTION private.fanc_is_platform_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT EXISTS (SELECT 1 FROM private.fanc_platform_admins WHERE user_id = auth.uid()) $$;

-- The brokerage a signed-in user works in: their own, or for a platform admin the one they switched into.
-- NULL when that brokerage is suspended or cancelled (platform admins excepted), which locks its staff out.
CREATE OR REPLACE FUNCTION private.fanc_current_brokerage()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT b.id FROM public.fanc_user_profiles p
  JOIN public.fanc_brokerages b
    ON b.id = CASE WHEN p.acting_brokerage_id IS NOT NULL AND private.fanc_is_platform_admin()
                   THEN p.acting_brokerage_id ELSE p.brokerage_id END
  WHERE p.id = auth.uid() AND COALESCE(p.is_active, true)
    AND (b.status NOT IN ('suspended', 'cancelled') OR private.fanc_is_platform_admin())
$$;

-- The brokerage whose website the request came from (the app sends its hostname as x-fanc-host), else the default.
-- The header only picks where a public form lands and whose listings the public sees, so it needn't be trusted.
CREATE OR REPLACE FUNCTION private.fanc_site_brokerage()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT b.id FROM public.fanc_brokerages b
     WHERE regexp_replace(lower(split_part(NULLIF(current_setting('request.headers', true), '')::json ->> 'x-fanc-host', ':', 1)), '^www\.', '')
           = ANY (b.domains)
       AND b.status NOT IN ('suspended', 'cancelled')
     LIMIT 1),
    (SELECT b.id FROM public.fanc_brokerages b WHERE b.is_default))
$$;

-- Default brokerage for new rows: brokers and admins file into the brokerage they work in, everyone else into the site's.
CREATE OR REPLACE FUNCTION private.fanc_request_brokerage()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT CASE WHEN private.fanc_is_staff() THEN private.fanc_current_brokerage() ELSE private.fanc_site_brokerage() END $$;

-- The tenant fence: brokers and admins are scoped to their brokerage (a brokerage that matches nothing when they have
-- none). NULL for clients and the public, whose own policies already limit them to rows that are theirs.
CREATE OR REPLACE FUNCTION private.fanc_tenant_scope()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT CASE WHEN private.fanc_is_staff()
              THEN COALESCE(private.fanc_current_brokerage(), '00000000-0000-0000-0000-000000000000'::uuid) END
$$;

CREATE OR REPLACE FUNCTION private.fanc_brokerage_open(b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT EXISTS (SELECT 1 FROM public.fanc_brokerages WHERE id = b AND status NOT IN ('suspended', 'cancelled')) $$;

REVOKE ALL ON FUNCTION private.fanc_is_platform_admin(), private.fanc_current_brokerage(), private.fanc_site_brokerage(),
  private.fanc_request_brokerage(), private.fanc_tenant_scope(), private.fanc_brokerage_open(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.fanc_is_platform_admin(), private.fanc_current_brokerage(), private.fanc_site_brokerage(),
  private.fanc_request_brokerage(), private.fanc_tenant_scope(), private.fanc_brokerage_open(uuid) TO anon, authenticated;

-- A child row always belongs to its parent's brokerage. TG_ARGV: parent table, foreign-key column.
CREATE OR REPLACE FUNCTION private.fanc_inherit_brokerage()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  parent UUID := (to_jsonb(NEW) ->> TG_ARGV[1])::uuid;
  b UUID;
BEGIN
  IF parent IS NOT NULL THEN
    EXECUTE format('SELECT brokerage_id FROM public.%I WHERE id = $1', TG_ARGV[0]) INTO b USING parent;
    IF b IS NOT NULL THEN
      NEW.brokerage_id := b;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.fanc_inherit_brokerage() FROM PUBLIC, anon, authenticated;

-- Offices within a brokerage. Brokers can be assigned to one; reports can roll up by office.
CREATE TABLE IF NOT EXISTS public.fanc_offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  brokerage_id UUID NOT NULL DEFAULT private.fanc_request_brokerage() REFERENCES public.fanc_brokerages (id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 150),
  address TEXT CHECK (char_length(address) <= 300),
  city TEXT CHECK (char_length(city) <= 100),
  state TEXT DEFAULT 'NC' CHECK (char_length(state) <= 2),
  zip_code TEXT CHECK (char_length(zip_code) <= 10),
  phone TEXT CHECK (char_length(phone) <= 50),
  manager_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,   -- the office's broker-in-charge
  is_main BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_fanc_offices_brokerage ON public.fanc_offices (brokerage_id);
CREATE OR REPLACE TRIGGER update_fanc_offices_updated_at
  BEFORE UPDATE ON public.fanc_offices
  FOR EACH ROW EXECUTE FUNCTION public.update_fanc_updated_at_column();

ALTER TABLE public.fanc_user_profiles
  ADD COLUMN IF NOT EXISTS office_id UUID REFERENCES public.fanc_offices (id) ON DELETE SET NULL;

-- ───────────────────────── 3. brokerage_id on every company table ─────────────────────────
DO $$
DECLARE
  home UUID := (SELECT id FROM public.fanc_brokerages WHERE is_default);
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'fanc_user_profiles', 'fanc_broker_plans', 'fanc_broker_records', 'fanc_calendar_completions', 'fanc_client_activity',
    'fanc_client_dates', 'fanc_client_imports', 'fanc_client_transactions', 'fanc_clients', 'fanc_communications',
    'fanc_consultation_activity', 'fanc_consultation_requests', 'fanc_deal_members', 'fanc_deal_posts', 'fanc_deal_tasks',
    'fanc_deals', 'fanc_drip_campaign_enrollments', 'fanc_drip_campaigns', 'fanc_events', 'fanc_goals', 'fanc_ledger',
    'fanc_listing_activity', 'fanc_listing_opportunities', 'fanc_listing_photos', 'fanc_listing_tasks',
    'fanc_marketing_posts', 'fanc_message_templates', 'fanc_properties', 'fanc_property_shares', 'fanc_saved_properties',
    'seller_requests', 'buyer_preferences'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS brokerage_id UUID REFERENCES public.fanc_brokerages (id)', t);
    EXECUTE format('UPDATE public.%I SET brokerage_id = $1 WHERE brokerage_id IS NULL', t) USING home;
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN brokerage_id SET DEFAULT private.fanc_request_brokerage(), '
                   'ALTER COLUMN brokerage_id SET NOT NULL', t);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (brokerage_id)', 'idx_' || t || '_brokerage', t);
  END LOOP;
END $$;

-- Child tables follow their parent.
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('fanc_calendar_completions', 'fanc_clients', 'client_id'),
    ('fanc_client_activity', 'fanc_clients', 'client_id'),
    ('fanc_client_dates', 'fanc_clients', 'client_id'),
    ('fanc_client_transactions', 'fanc_clients', 'client_id'),
    ('fanc_communications', 'fanc_clients', 'client_id'),
    ('fanc_events', 'fanc_clients', 'client_id'),
    ('fanc_saved_properties', 'fanc_clients', 'client_id'),
    ('fanc_deals', 'fanc_clients', 'client_id'),
    ('fanc_consultation_activity', 'fanc_consultation_requests', 'request_id'),
    ('fanc_deal_members', 'fanc_deals', 'deal_id'),
    ('fanc_deal_posts', 'fanc_deals', 'deal_id'),
    ('fanc_deal_tasks', 'fanc_deals', 'deal_id'),
    ('fanc_ledger', 'fanc_deals', 'deal_id'),
    ('fanc_marketing_posts', 'fanc_deals', 'deal_id'),
    ('fanc_drip_campaign_enrollments', 'fanc_drip_campaigns', 'campaign_id'),
    ('fanc_listing_activity', 'fanc_listing_opportunities', 'opportunity_id'),
    ('fanc_listing_photos', 'fanc_listing_opportunities', 'opportunity_id'),
    ('fanc_listing_tasks', 'fanc_listing_opportunities', 'opportunity_id'),
    ('fanc_property_shares', 'fanc_properties', 'property_id')
  ) AS v (child, parent, fk) LOOP
    EXECUTE format('CREATE OR REPLACE TRIGGER fanc_inherit_brokerage BEFORE INSERT OR UPDATE OF %I, brokerage_id ON public.%I '
                   'FOR EACH ROW EXECUTE FUNCTION private.fanc_inherit_brokerage(%L, %L)', r.fk, r.child, r.parent, r.fk);
  END LOOP;
END $$;

-- Uniqueness that was company-wide is now per brokerage.
ALTER TABLE public.fanc_calendar_completions DROP CONSTRAINT IF EXISTS fanc_calendar_completions_event_key_occurs_on_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_fanc_calendar_completions_unique ON public.fanc_calendar_completions (brokerage_id, event_key, occurs_on);
DROP INDEX IF EXISTS public.idx_fanc_clients_flexmls_id;
CREATE UNIQUE INDEX IF NOT EXISTS idx_fanc_clients_flexmls_id ON public.fanc_clients (brokerage_id, flexmls_id) WHERE flexmls_id IS NOT NULL;
DROP INDEX IF EXISTS public.idx_fanc_goals_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_fanc_goals_unique
  ON public.fanc_goals (brokerage_id, year, COALESCE(broker_id, '00000000-0000-0000-0000-000000000000'::uuid), metric);
DROP INDEX IF EXISTS public.idx_fanc_message_templates_default;
CREATE UNIQUE INDEX IF NOT EXISTS idx_fanc_message_templates_default ON public.fanc_message_templates (brokerage_id, category) WHERE is_default;

-- ───────────────────────── 4. Tenant fence ─────────────────────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'fanc_broker_plans', 'fanc_broker_records', 'fanc_calendar_completions', 'fanc_client_activity',
    'fanc_client_dates', 'fanc_client_imports', 'fanc_client_transactions', 'fanc_clients', 'fanc_communications',
    'fanc_consultation_activity', 'fanc_consultation_requests', 'fanc_deal_members', 'fanc_deal_posts', 'fanc_deal_tasks',
    'fanc_deals', 'fanc_drip_campaign_enrollments', 'fanc_drip_campaigns', 'fanc_events', 'fanc_goals', 'fanc_ledger',
    'fanc_listing_activity', 'fanc_listing_opportunities', 'fanc_listing_photos', 'fanc_listing_tasks',
    'fanc_marketing_posts', 'fanc_message_templates', 'fanc_properties', 'fanc_property_shares', 'fanc_saved_properties',
    'seller_requests', 'buyer_preferences', 'fanc_offices'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('DROP POLICY IF EXISTS "Tenant fence" ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY "Tenant fence" ON public.%I AS RESTRICTIVE FOR ALL TO public '
      'USING ((SELECT private.fanc_tenant_scope()) IS NULL OR brokerage_id = (SELECT private.fanc_tenant_scope())) '
      'WITH CHECK (CASE WHEN (SELECT private.fanc_tenant_scope()) IS NULL THEN private.fanc_brokerage_open(brokerage_id) '
      'ELSE brokerage_id = (SELECT private.fanc_tenant_scope()) END)', t);
  END LOOP;
END $$;

-- Profiles: everyone keeps their own; brokers and admins otherwise only see their brokerage's people.
DROP POLICY IF EXISTS "Tenant fence" ON public.fanc_user_profiles;
CREATE POLICY "Tenant fence" ON public.fanc_user_profiles AS RESTRICTIVE FOR ALL TO public
  USING (id = auth.uid() OR (SELECT private.fanc_tenant_scope()) IS NULL OR brokerage_id = (SELECT private.fanc_tenant_scope()))
  WITH CHECK (id = auth.uid() OR (SELECT private.fanc_tenant_scope()) IS NULL OR brokerage_id = (SELECT private.fanc_tenant_scope()));

-- Public listings: each site shows its own brokerage's active and pending listings. The old "Anyone can view active
-- properties" policy let anyone read every listing, drafts included.
DROP POLICY IF EXISTS "Anyone can view active properties" ON public.fanc_properties;
DROP POLICY IF EXISTS "Public can view live listings" ON public.fanc_properties;
CREATE POLICY "Public can view live listings" ON public.fanc_properties FOR SELECT TO anon, authenticated
  USING (status IN ('active', 'pending') AND brokerage_id = (SELECT private.fanc_site_brokerage()));

-- The pre-Lightkeeper legacy tables aren't used by the app and hold no brokerage: platform admins only.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'activities', 'agents', 'clients', 'communities', 'email_templates', 'events', 'favorites',
    'leads', 'news', 'properties', 'property_inquiries', 'saved_searches', 'users'
  ] LOOP
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t
               AND policyname = 'Brokers and admins have full access') THEN
      EXECUTE format('ALTER POLICY "Brokers and admins have full access" ON public.%I TO authenticated '
                     'USING (private.fanc_is_platform_admin()) WITH CHECK (private.fanc_is_platform_admin())', t);
    END IF;
  END LOOP;
END $$;

-- Brokerages: members read their own; its admins edit its profile; platform admins manage all of them.
ALTER TABLE public.fanc_brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_offices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff read their brokerage" ON public.fanc_brokerages;
CREATE POLICY "Staff read their brokerage" ON public.fanc_brokerages FOR SELECT TO authenticated
  USING (private.fanc_is_staff() AND id = (SELECT private.fanc_current_brokerage()));
DROP POLICY IF EXISTS "Admins update their brokerage" ON public.fanc_brokerages;
CREATE POLICY "Admins update their brokerage" ON public.fanc_brokerages FOR UPDATE TO authenticated
  USING (private.fanc_is_admin() AND id = (SELECT private.fanc_current_brokerage()))
  WITH CHECK (private.fanc_is_admin() AND id = (SELECT private.fanc_current_brokerage()));
DROP POLICY IF EXISTS "Platform admins manage brokerages" ON public.fanc_brokerages;
CREATE POLICY "Platform admins manage brokerages" ON public.fanc_brokerages FOR ALL TO authenticated
  USING (private.fanc_is_platform_admin()) WITH CHECK (private.fanc_is_platform_admin());

DROP POLICY IF EXISTS "Staff read offices" ON public.fanc_offices;
CREATE POLICY "Staff read offices" ON public.fanc_offices FOR SELECT TO authenticated USING (private.fanc_is_staff());
DROP POLICY IF EXISTS "Admins manage offices" ON public.fanc_offices;
CREATE POLICY "Admins manage offices" ON public.fanc_offices FOR ALL TO authenticated
  USING (private.fanc_is_admin()) WITH CHECK (private.fanc_is_admin());

REVOKE ALL ON public.fanc_brokerages, public.fanc_offices FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fanc_brokerages, public.fanc_offices TO authenticated;

-- A brokerage's own admins edit its profile; its domains, plan, status and seats are the platform's to set.
CREATE OR REPLACE FUNCTION private.fanc_brokerage_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.domains := COALESCE((
    SELECT array_agg(DISTINCT d ORDER BY d) FROM (
      SELECT regexp_replace(lower(trim(x)), '^(https?://)?(www\.)?([^/:]+).*$', '\3') AS d FROM unnest(NEW.domains) x
    ) s WHERE d <> ''), '{}');
  IF EXISTS (SELECT 1 FROM public.fanc_brokerages b WHERE b.id <> NEW.id AND b.domains && NEW.domains) THEN
    RAISE EXCEPTION 'One of those domains already belongs to another brokerage' USING ERRCODE = '23505';
  END IF;
  IF TG_OP = 'UPDATE' AND auth.uid() IS NOT NULL AND NOT private.fanc_is_platform_admin()
     AND (NEW.slug, NEW.domains, NEW.plan, NEW.status, NEW.seat_limit, NEW.trial_ends_at, NEW.is_default)
         IS DISTINCT FROM (OLD.slug, OLD.domains, OLD.plan, OLD.status, OLD.seat_limit, OLD.trial_ends_at, OLD.is_default) THEN
    RAISE EXCEPTION 'Domains, plan, status and seats are managed by the platform' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.fanc_brokerage_guard() FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE TRIGGER fanc_brokerage_guard
  BEFORE INSERT OR UPDATE ON public.fanc_brokerages
  FOR EACH ROW EXECUTE FUNCTION private.fanc_brokerage_guard();

-- ───────────────────────── 5. Profiles ─────────────────────────
-- Only admins change roles and active status; only platform admins move people between brokerages or switch
-- brokerage; an office must be in the person's brokerage; and a brokerage can't exceed its broker seats.
CREATE OR REPLACE FUNCTION private.fanc_protect_profile_privileges()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  seats INTEGER;
  used INTEGER;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT private.fanc_is_platform_admin() THEN
    IF TG_OP = 'INSERT' THEN
      NEW.acting_brokerage_id := NULL;
      IF NOT private.fanc_is_admin() THEN
        NEW.role := 'client';
        NEW.is_active := true;
        -- A client invited to a deal joins that deal's brokerage; anyone else the brokerage of the site they're on.
        NEW.brokerage_id := COALESCE(
          (SELECT m.brokerage_id FROM public.fanc_deal_members m WHERE m.user_id = NEW.id ORDER BY m.created_at DESC LIMIT 1),
          private.fanc_site_brokerage());
      END IF;
    ELSE
      IF NEW.acting_brokerage_id IS DISTINCT FROM OLD.acting_brokerage_id THEN
        RAISE EXCEPTION 'Only a platform admin can switch brokerages' USING ERRCODE = '42501';
      END IF;
      IF NEW.brokerage_id IS DISTINCT FROM OLD.brokerage_id THEN
        RAISE EXCEPTION 'Only a platform admin can move someone to another brokerage' USING ERRCODE = '42501';
      END IF;
      IF NOT private.fanc_is_admin() AND (NEW.role IS DISTINCT FROM OLD.role OR NEW.is_active IS DISTINCT FROM OLD.is_active
                                           OR NEW.office_id IS DISTINCT FROM OLD.office_id) THEN
        RAISE EXCEPTION 'Only an admin can change a user''s role, office or active status' USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;

  IF NEW.office_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.fanc_offices o WHERE o.id = NEW.office_id AND o.brokerage_id = NEW.brokerage_id
  ) THEN
    RAISE EXCEPTION 'That office belongs to another brokerage' USING ERRCODE = '23514';
  END IF;

  -- Seats: active brokers and admins. The SQL editor (no auth.uid()) can always override.
  IF auth.uid() IS NOT NULL AND NEW.role IN ('broker', 'admin') AND COALESCE(NEW.is_active, true)
     AND (TG_OP = 'INSERT' OR OLD.role NOT IN ('broker', 'admin') OR NOT COALESCE(OLD.is_active, true)
          OR OLD.brokerage_id IS DISTINCT FROM NEW.brokerage_id) THEN
    SELECT seat_limit INTO seats FROM public.fanc_brokerages WHERE id = NEW.brokerage_id;
    IF seats IS NOT NULL THEN
      SELECT count(*) INTO used FROM public.fanc_user_profiles p
      WHERE p.brokerage_id = NEW.brokerage_id AND p.id <> NEW.id AND p.role IN ('broker', 'admin') AND COALESCE(p.is_active, true);
      IF used >= seats THEN
        RAISE EXCEPTION 'This brokerage is using all % of its broker seats', seats USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ───────────────────────── 6. Functions that bypass RLS ─────────────────────────
CREATE OR REPLACE FUNCTION public.fanc_staff_directory()
RETURNS TABLE (id UUID, first_name TEXT, last_name TEXT, role TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT p.id, p.first_name::text, p.last_name::text, p.role::text FROM public.fanc_user_profiles p
  WHERE private.fanc_is_staff() AND p.role IN ('broker', 'admin') AND COALESCE(p.is_active, true)
    AND p.brokerage_id = private.fanc_current_brokerage()
  ORDER BY p.first_name, p.last_name
$$;

CREATE OR REPLACE FUNCTION public.fanc_workspace_deals(only_deal uuid DEFAULT NULL::uuid)
RETURNS TABLE(id uuid, side text, stage text, property_address text, city text, zip_code text, mls_number text, is_hud boolean,
  list_price numeric, contract_price numeric, effective_date date, emd_due_date date, inspection_date date,
  due_diligence_date date, appraisal_date date, closing_date date, lender text, closing_attorney text, other_agent text,
  updated_at timestamp with time zone, client_first_name text, client_last_name text, broker_id uuid, broker_name text,
  broker_phone text, broker_email text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT d.id, d.side, d.stage, d.property_address, d.city::text, d.zip_code::text, d.mls_number::text, d.is_hud,
         d.list_price, d.contract_price, d.effective_date, d.emd_due_date, d.inspection_date, d.due_diligence_date,
         d.appraisal_date, d.closing_date, d.lender, d.closing_attorney, d.other_agent, d.updated_at,
         c.first_name::text, c.last_name::text,
         d.broker_id, NULLIF(concat_ws(' ', p.first_name, p.last_name), ''), p.phone::text, u.email::text
  FROM public.fanc_deals d
  JOIN public.fanc_clients c ON c.id = d.client_id
  LEFT JOIN public.fanc_user_profiles p ON p.id = d.broker_id
  LEFT JOIN auth.users u ON u.id = d.broker_id
  WHERE (only_deal IS NULL OR d.id = only_deal)
    AND ((private.fanc_is_staff() AND d.brokerage_id = private.fanc_current_brokerage()) OR private.fanc_is_deal_member(d.id))
  ORDER BY d.updated_at DESC
$$;

-- Same review rules as listing_ownership.sql; the requested and assigned brokers must be in the opportunity's brokerage.
CREATE OR REPLACE FUNCTION private.fanc_listing_opportunity_review()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE r text := private.fanc_current_role();
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by := auth.uid();
    IF NEW.requested_broker_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.fanc_user_profiles p
      WHERE p.id = NEW.requested_broker_id AND p.role IN ('broker', 'admin') AND COALESCE(p.is_active, true)
        AND p.brokerage_id = NEW.brokerage_id
    ) THEN
      NEW.requested_broker_id := NULL;
    END IF;
    IF r IN ('broker', 'admin') THEN
      NEW.created_by_role := r;
      NEW.review_status := 'approved';
      NEW.reviewed_by := auth.uid();
      NEW.reviewed_at := NOW();
      -- A broker's own opportunity is always theirs; an admin may hand theirs to any broker.
      NEW.assigned_to := CASE WHEN r = 'broker' THEN auth.uid() ELSE COALESCE(NEW.assigned_to, auth.uid()) END;
    ELSE
      NEW.created_by_role := CASE WHEN auth.uid() IS NULL THEN 'public' ELSE 'client' END;
      NEW.review_status := 'pending_review';
      NEW.reviewed_by := NULL;
      NEW.reviewed_at := NULL;
      NEW.review_note := NULL;
      NEW.assigned_to := NULL;
      NEW.stage := 'new';
      NEW.priority := 'warm';
      NEW.follow_up_at := NULL;
      NEW.appointment_at := NULL;
      NEW.last_contacted_at := NULL;
      NEW.lost_reason := NULL;
      NEW.estimated_value := NULL;
      NEW.notes := NULL;
      NEW.client_id := NULL;
      NEW.consultation_id := NULL;
      NEW.deal_id := NULL;
    END IF;
  ELSE
    IF NEW.created_by IS DISTINCT FROM OLD.created_by OR NEW.created_by_role IS DISTINCT FROM OLD.created_by_role THEN
      RAISE EXCEPTION 'The creator of a listing opportunity cannot be changed' USING ERRCODE = '42501';
    END IF;
    -- Assignment. The SQL editor (no auth.uid()) can always fix things up.
    IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to AND auth.uid() IS NOT NULL THEN
      IF OLD.created_by_role = 'broker' AND EXISTS (
        SELECT 1 FROM public.fanc_user_profiles p
        WHERE p.id = OLD.created_by AND p.role IN ('broker', 'admin') AND COALESCE(p.is_active, true)
      ) THEN
        RAISE EXCEPTION 'This opportunity stays with the broker who brought it in' USING ERRCODE = '42501';
      END IF;
      IF NOT private.fanc_is_admin() THEN
        RAISE EXCEPTION 'Only the broker-in-charge or an admin can assign company opportunities' USING ERRCODE = '42501';
      END IF;
    END IF;
    IF NEW.review_status IS DISTINCT FROM OLD.review_status THEN
      IF auth.uid() IS NOT NULL AND NOT private.fanc_is_admin() THEN
        RAISE EXCEPTION 'Only an admin can review listing opportunities' USING ERRCODE = '42501';
      END IF;
      NEW.reviewed_by := auth.uid();
      NEW.reviewed_at := NOW();
    ELSIF NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
          OR NEW.review_note IS DISTINCT FROM OLD.review_note THEN
      IF auth.uid() IS NOT NULL AND NOT private.fanc_is_admin() THEN
        RAISE EXCEPTION 'Only an admin can review listing opportunities' USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;
  IF NEW.assigned_to IS NOT NULL AND auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.fanc_user_profiles p
    WHERE p.id = NEW.assigned_to AND p.role IN ('broker', 'admin') AND p.brokerage_id = NEW.brokerage_id
  ) THEN
    RAISE EXCEPTION 'Assign opportunities to a broker in the same brokerage' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

-- ───────────────────────── 7. App and platform functions ─────────────────────────
-- The public face of the site's brokerage, for page footers and lead emails.
CREATE OR REPLACE FUNCTION public.fanc_site_info()
RETURNS TABLE (id UUID, slug TEXT, name TEXT, firm_license TEXT, email TEXT, phone TEXT, website TEXT, logo_url TEXT,
               primary_color TEXT, is_default BOOLEAN)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT b.id, b.slug, b.name, b.firm_license, b.email, b.phone, b.website, b.logo_url, b.primary_color, b.is_default
  FROM public.fanc_brokerages b WHERE b.id = private.fanc_site_brokerage()
$$;

-- Who am I working for: the brokerage the signed-in user is in (or switched into) and whether they run the platform.
CREATE OR REPLACE FUNCTION public.fanc_my_tenant()
RETURNS TABLE (id UUID, slug TEXT, name TEXT, logo_url TEXT, primary_color TEXT, plan TEXT, status TEXT,
               home_brokerage_id UUID, is_platform_admin BOOLEAN)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT b.id, b.slug, b.name, b.logo_url, b.primary_color, b.plan, b.status, p.brokerage_id, private.fanc_is_platform_admin()
  FROM public.fanc_user_profiles p
  LEFT JOIN public.fanc_brokerages b ON b.id = COALESCE(private.fanc_current_brokerage(), p.brokerage_id)
  WHERE p.id = auth.uid()
$$;

-- Platform admins step into another brokerage (NULL or their own brokerage = back home).
CREATE OR REPLACE FUNCTION public.fanc_switch_brokerage(target UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NOT private.fanc_is_platform_admin() THEN
    RAISE EXCEPTION 'Only a platform admin can switch brokerages' USING ERRCODE = '42501';
  END IF;
  IF target IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.fanc_brokerages WHERE id = target) THEN
    RAISE EXCEPTION 'No such brokerage' USING ERRCODE = '22023';
  END IF;
  UPDATE public.fanc_user_profiles SET acting_brokerage_id = NULLIF(target, brokerage_id) WHERE id = auth.uid();
END;
$$;

-- Usage per brokerage, for the platform console and for pricing: seats, records and storage that drive cost.
CREATE OR REPLACE FUNCTION public.fanc_platform_overview()
RETURNS TABLE (id UUID, slug TEXT, name TEXT, plan TEXT, status TEXT, seat_limit INTEGER, domains TEXT[], trial_ends_at DATE,
               created_at TIMESTAMPTZ, is_default BOOLEAN, seats_used BIGINT, client_logins BIGINT, clients BIGINT,
               open_deals BIGINT, closed_deals_12m BIGINT, listing_opportunities BIGINT, photos BIGINT,
               leads_30d BIGINT, last_activity TIMESTAMPTZ)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NOT private.fanc_is_platform_admin() THEN
    RAISE EXCEPTION 'Only a platform admin can see the platform overview' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  SELECT b.id, b.slug, b.name, b.plan, b.status, b.seat_limit, b.domains, b.trial_ends_at, b.created_at, b.is_default,
    (SELECT count(*) FROM public.fanc_user_profiles p WHERE p.brokerage_id = b.id AND p.role IN ('broker', 'admin') AND COALESCE(p.is_active, true)),
    (SELECT count(*) FROM public.fanc_user_profiles p WHERE p.brokerage_id = b.id AND p.role = 'client'),
    (SELECT count(*) FROM public.fanc_clients c WHERE c.brokerage_id = b.id),
    (SELECT count(*) FROM public.fanc_deals d WHERE d.brokerage_id = b.id AND d.stage NOT IN ('closed', 'fell_through')),
    (SELECT count(*) FROM public.fanc_deals d WHERE d.brokerage_id = b.id AND d.stage = 'closed' AND COALESCE(d.closing_date, d.updated_at::date) > CURRENT_DATE - 365),
    (SELECT count(*) FROM public.fanc_listing_opportunities o WHERE o.brokerage_id = b.id),
    (SELECT count(*) FROM public.fanc_listing_photos f WHERE f.brokerage_id = b.id),
    (SELECT count(*) FROM public.fanc_consultation_requests r WHERE r.brokerage_id = b.id AND r.created_at > NOW() - INTERVAL '30 days')
      + (SELECT count(*) FROM public.fanc_listing_opportunities o WHERE o.brokerage_id = b.id AND o.created_at > NOW() - INTERVAL '30 days'),
    GREATEST(
      (SELECT max(a.created_at) FROM public.fanc_client_activity a WHERE a.brokerage_id = b.id),
      (SELECT max(d.updated_at) FROM public.fanc_deals d WHERE d.brokerage_id = b.id),
      (SELECT max(o.updated_at) FROM public.fanc_listing_opportunities o WHERE o.brokerage_id = b.id))
  FROM public.fanc_brokerages b
  ORDER BY b.is_default DESC, b.name;
END;
$$;

-- Platform admins put an existing login into a brokerage with a role (the person signs in once first, or is created
-- in Supabase Authentication → Add user).
CREATE OR REPLACE FUNCTION public.fanc_platform_add_member(addr TEXT, target UUID, new_role TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE uid UUID;
BEGIN
  IF NOT private.fanc_is_platform_admin() THEN
    RAISE EXCEPTION 'Only a platform admin can add people to a brokerage' USING ERRCODE = '42501';
  END IF;
  IF new_role NOT IN ('client', 'broker', 'admin') THEN
    RAISE EXCEPTION 'Role must be client, broker or admin' USING ERRCODE = '22023';
  END IF;
  SELECT u.id INTO uid FROM auth.users u WHERE lower(u.email) = lower(trim(addr));
  IF uid IS NULL THEN
    RAISE EXCEPTION 'No login exists for %. Create it in Supabase (Authentication → Add user) first.', trim(addr) USING ERRCODE = 'P0002';
  END IF;
  IF uid = auth.uid() THEN
    RAISE EXCEPTION 'Use the brokerage switcher to work in another brokerage' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.fanc_user_profiles (id, role, brokerage_id, is_active)
  VALUES (uid, new_role, target, true)
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, brokerage_id = EXCLUDED.brokerage_id, office_id = NULL, is_active = true;
  RETURN uid;
END;
$$;

REVOKE ALL ON FUNCTION public.fanc_site_info(), public.fanc_my_tenant(), public.fanc_switch_brokerage(UUID),
  public.fanc_platform_overview(), public.fanc_platform_add_member(TEXT, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fanc_site_info() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fanc_my_tenant(), public.fanc_switch_brokerage(UUID), public.fanc_platform_overview(),
  public.fanc_platform_add_member(TEXT, UUID, TEXT) TO authenticated;
