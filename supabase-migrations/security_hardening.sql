-- Security hardening (applied October 2026)
-- 1. Role helpers in a private (non-API) schema that policies can call without recursing into
--    fanc_user_profiles' own RLS.
-- 2. Stop users from promoting themselves (role / is_active) on fanc_user_profiles.
-- 3. Lock down the legacy tables that had RLS disabled (brokers/admins only).
-- 4. Create the seller_requests and buyer_preferences tables the Sell page and Buyer Preference Tool write to
--    (public insert-only, brokers/admins read and update). Supersedes the policies in seller_requests.sql
--    and buyer_preferences.sql.
-- Run after consultation_requests.sql.

-- ───────────────────────── 1. Role helpers ─────────────────────────
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO anon, authenticated;

CREATE OR REPLACE FUNCTION private.fanc_current_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT role::text FROM public.fanc_user_profiles WHERE id = auth.uid() AND COALESCE(is_active, true) $$;

CREATE OR REPLACE FUNCTION private.fanc_is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT COALESCE(private.fanc_current_role() = 'admin', false) $$;

CREATE OR REPLACE FUNCTION private.fanc_is_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT COALESCE(private.fanc_current_role() IN ('broker', 'admin'), false) $$;

REVOKE ALL ON FUNCTION private.fanc_current_role(), private.fanc_is_admin(), private.fanc_is_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.fanc_current_role(), private.fanc_is_admin(), private.fanc_is_staff() TO anon, authenticated;

-- ───────────────────────── 2. fanc_user_profiles ─────────────────────────
ALTER POLICY "Users can update own profile" ON public.fanc_user_profiles
  TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- The previous admin policies queried fanc_user_profiles from inside its own policies (recursive RLS).
ALTER POLICY "Admins can manage all profiles" ON public.fanc_user_profiles
  TO authenticated USING (private.fanc_is_admin()) WITH CHECK (private.fanc_is_admin());

ALTER POLICY "Admins can view all profiles" ON public.fanc_user_profiles
  TO authenticated USING (private.fanc_is_admin());

-- Only admins (or the service role / SQL editor, where auth.uid() is null) may change privileges.
CREATE OR REPLACE FUNCTION private.fanc_protect_profile_privileges()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL OR private.fanc_is_admin() THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.role := 'client';
    NEW.is_active := true;
  ELSIF NEW.role IS DISTINCT FROM OLD.role OR NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    RAISE EXCEPTION 'Only an admin can change a user''s role or active status' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.fanc_protect_profile_privileges() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE TRIGGER fanc_protect_profile_privileges
  BEFORE INSERT OR UPDATE ON public.fanc_user_profiles
  FOR EACH ROW EXECUTE FUNCTION private.fanc_protect_profile_privileges();

ALTER POLICY "Brokers and admins can read consultation requests" ON public.fanc_consultation_requests
  TO authenticated USING (private.fanc_is_staff());

ALTER POLICY "Brokers and admins can update consultation requests" ON public.fanc_consultation_requests
  TO authenticated USING (private.fanc_is_staff()) WITH CHECK (private.fanc_is_staff());

ALTER FUNCTION public.update_fanc_updated_at_column() SET search_path = '';

-- ───────────────────────── 3. Legacy tables ─────────────────────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'activities', 'agents', 'clients', 'communities', 'email_templates', 'events', 'favorites',
    'leads', 'news', 'properties', 'property_inquiries', 'saved_searches', 'users'
  ] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t
                     AND policyname = 'Brokers and admins have full access') THEN
        EXECUTE format('CREATE POLICY "Brokers and admins have full access" ON public.%I FOR ALL TO authenticated '
                       'USING (private.fanc_is_staff()) WITH CHECK (private.fanc_is_staff())', t);
      END IF;
    END IF;
  END LOOP;
END $$;

-- ───────────────────────── 4. Public form tables ─────────────────────────
CREATE TABLE IF NOT EXISTS public.seller_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  property_address TEXT NOT NULL,
  request_type VARCHAR(50) NOT NULL,
  message TEXT,
  status VARCHAR(50) DEFAULT 'new',
  assigned_agent_id UUID,
  source VARCHAR(100) DEFAULT 'seller_page',
  ip_address VARCHAR(50),
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_seller_requests_created_at ON public.seller_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seller_requests_status ON public.seller_requests (status);

CREATE TABLE IF NOT EXISTS public.buyer_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name VARCHAR(255), email VARCHAR(255), phone VARCHAR(50),
  interested_in_hud_homes BOOLEAN DEFAULT false, interested_in_reo_properties BOOLEAN DEFAULT false,
  interested_in_conventional BOOLEAN DEFAULT false, interested_in_new_construction BOOLEAN DEFAULT false,
  interested_in_fha BOOLEAN DEFAULT false, interested_in_va BOOLEAN DEFAULT false,
  interested_in_usda BOOLEAN DEFAULT false, interested_in_conventional_loan BOOLEAN DEFAULT false,
  needs_down_payment_assistance BOOLEAN DEFAULT false,
  property_type_single_family BOOLEAN DEFAULT false, property_type_condo BOOLEAN DEFAULT false,
  property_type_townhouse BOOLEAN DEFAULT false, property_type_land BOOLEAN DEFAULT false,
  property_type_manufactured BOOLEAN DEFAULT false,
  location_coastal BOOLEAN DEFAULT false, location_mountains BOOLEAN DEFAULT false,
  location_piedmont BOOLEAN DEFAULT false, location_triangle BOOLEAN DEFAULT false,
  location_charlotte BOOLEAN DEFAULT false,
  preferred_communities TEXT,
  lifestyle_waterfront BOOLEAN DEFAULT false, lifestyle_golf_community BOOLEAN DEFAULT false,
  lifestyle_rural BOOLEAN DEFAULT false, lifestyle_urban BOOLEAN DEFAULT false,
  lifestyle_suburban BOOLEAN DEFAULT false, lifestyle_retirement BOOLEAN DEFAULT false,
  budget_min INTEGER, budget_max INTEGER, bedrooms_min INTEGER, bathrooms_min DECIMAL(3,1),
  timeline VARCHAR(50), is_first_time_buyer BOOLEAN DEFAULT false, additional_notes TEXT,
  status VARCHAR(50) DEFAULT 'new', assigned_agent_id UUID,
  source VARCHAR(100) DEFAULT 'buyer_preference_tool', ip_address VARCHAR(50), user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_buyer_preferences_created_at ON public.buyer_preferences (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_buyer_preferences_status ON public.buyer_preferences (status);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['seller_requests', 'buyer_preferences'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t AND policyname = 'Public can submit') THEN
      EXECUTE format('CREATE POLICY "Public can submit" ON public.%I FOR INSERT TO anon, authenticated '
                     'WITH CHECK (status = ''new'' AND assigned_agent_id IS NULL)', t);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t AND policyname = 'Brokers and admins can read') THEN
      EXECUTE format('CREATE POLICY "Brokers and admins can read" ON public.%I FOR SELECT TO authenticated '
                     'USING (private.fanc_is_staff())', t);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t AND policyname = 'Brokers and admins can update') THEN
      EXECUTE format('CREATE POLICY "Brokers and admins can update" ON public.%I FOR UPDATE TO authenticated '
                     'USING (private.fanc_is_staff()) WITH CHECK (private.fanc_is_staff())', t);
    END IF;
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT INSERT ON public.%I TO anon', t);
  END LOOP;
END $$;
