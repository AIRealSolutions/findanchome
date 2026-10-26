-- Listing opportunities (/dashboard/listings): potential sellers, from first contact to a signed listing.
-- Opportunities entered by a broker or admin go straight into their pipeline. Everything else (the Sell page,
-- client-portal referrals) waits for an admin to approve and assign it; brokers never see those until then.
-- Run after deals_pipeline.sql and security_hardening.sql.

CREATE TABLE IF NOT EXISTS public.fanc_listing_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Who entered it and the admin review (set by the trigger below, not by the client).
  created_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  created_by_name TEXT CHECK (char_length(created_by_name) <= 200),
  created_by_role TEXT NOT NULL DEFAULT 'public' CHECK (created_by_role IN ('public', 'client', 'broker', 'admin')),
  review_status TEXT NOT NULL DEFAULT 'pending_review' CHECK (review_status IN ('pending_review', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_note TEXT CHECK (char_length(review_note) <= 2000),
  assigned_to UUID REFERENCES auth.users (id) ON DELETE SET NULL,

  -- Pipeline
  stage TEXT NOT NULL DEFAULT 'new' CHECK (stage IN ('new', 'contacted', 'appointment', 'presented', 'nurture', 'listed', 'lost')),
  priority TEXT NOT NULL DEFAULT 'warm' CHECK (priority IN ('hot', 'warm', 'cold')),
  source TEXT NOT NULL DEFAULT 'other' CHECK (source IN (
    'website', 'sphere', 'referral', 'fsbo', 'expired', 'probate', 'pre_foreclosure', 'absentee', 'hud', 'door_knock', 'open_house', 'other')),
  source_detail TEXT CHECK (char_length(source_detail) <= 300),
  follow_up_at TIMESTAMPTZ,
  appointment_at TIMESTAMPTZ,
  last_contacted_at TIMESTAMPTZ,
  lost_reason TEXT CHECK (char_length(lost_reason) <= 500),

  -- Owner
  owner_name TEXT NOT NULL CHECK (char_length(owner_name) BETWEEN 1 AND 200),
  owner_email VARCHAR(320),
  owner_phone VARCHAR(50),
  preferred_contact TEXT CHECK (preferred_contact IN ('call', 'text', 'email')),
  relationship TEXT CHECK (char_length(relationship) <= 100),

  -- Property
  property_address TEXT CHECK (char_length(property_address) <= 300),
  city VARCHAR(100),
  county VARCHAR(50),
  zip_code VARCHAR(10),
  property_type TEXT CHECK (char_length(property_type) <= 50),
  bedrooms NUMERIC(4, 1),
  bathrooms NUMERIC(4, 1),
  sqft INTEGER CHECK (sqft BETWEEN 0 AND 100000),
  year_built INTEGER CHECK (year_built BETWEEN 1700 AND 2100),
  lot_acres NUMERIC(10, 2),
  condition TEXT CHECK (char_length(condition) <= 50),
  occupancy TEXT CHECK (occupancy IN ('owner', 'tenant', 'vacant', 'second_home')),

  -- Motivation
  reason TEXT CHECK (char_length(reason) <= 100),
  timeline TEXT CHECK (char_length(timeline) <= 50),
  price_expectation NUMERIC(12, 2),
  mortgage_balance NUMERIC(12, 2),
  estimated_value NUMERIC(12, 2),
  previously_listed BOOLEAN NOT NULL DEFAULT false,
  message TEXT CHECK (char_length(message) <= 5000),
  notes TEXT CHECK (char_length(notes) <= 10000),

  -- Links
  client_id UUID REFERENCES public.fanc_clients (id) ON DELETE SET NULL,
  consultation_id UUID REFERENCES public.fanc_consultation_requests (id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.fanc_deals (id) ON DELETE SET NULL,
  source_page TEXT CHECK (char_length(source_page) <= 300),
  user_agent TEXT CHECK (char_length(user_agent) <= 500)
);
CREATE INDEX IF NOT EXISTS idx_fanc_listing_opps_review ON public.fanc_listing_opportunities (review_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fanc_listing_opps_stage ON public.fanc_listing_opportunities (stage);
CREATE INDEX IF NOT EXISTS idx_fanc_listing_opps_assigned ON public.fanc_listing_opportunities (assigned_to);
CREATE INDEX IF NOT EXISTS idx_fanc_listing_opps_follow_up ON public.fanc_listing_opportunities (follow_up_at) WHERE follow_up_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fanc_listing_opps_client ON public.fanc_listing_opportunities (client_id);

CREATE OR REPLACE TRIGGER update_fanc_listing_opportunities_updated_at
  BEFORE UPDATE ON public.fanc_listing_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_fanc_updated_at_column();

-- Review routing. Brokers and admins: approved and assigned to themselves unless they pick someone.
-- Anyone else: pending review, with every pipeline field reset so a submission can't skip the queue.
CREATE OR REPLACE FUNCTION private.fanc_listing_opportunity_review()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE r text := private.fanc_current_role();
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by := auth.uid();
    IF r IN ('broker', 'admin') THEN
      NEW.created_by_role := r;
      NEW.review_status := 'approved';
      NEW.reviewed_by := auth.uid();
      NEW.reviewed_at := NOW();
      NEW.assigned_to := COALESCE(NEW.assigned_to, auth.uid());
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
    RETURN NEW;
  END IF;

  -- Updates: only an admin (or the SQL editor) can review, and nobody rewrites who entered it.
  IF NEW.created_by IS DISTINCT FROM OLD.created_by OR NEW.created_by_role IS DISTINCT FROM OLD.created_by_role THEN
    RAISE EXCEPTION 'The creator of a listing opportunity cannot be changed' USING ERRCODE = '42501';
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
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.fanc_listing_opportunity_review() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE TRIGGER fanc_listing_opportunity_review
  BEFORE INSERT OR UPDATE ON public.fanc_listing_opportunities
  FOR EACH ROW EXECUTE FUNCTION private.fanc_listing_opportunity_review();

-- Timeline of calls, texts, door knocks, mailers, meetings, notes, stage changes and the review decision.
CREATE TABLE IF NOT EXISTS public.fanc_listing_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.fanc_listing_opportunities (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  author_id UUID DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE SET NULL,
  author_name TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('note', 'call', 'text', 'email', 'meeting', 'door_knock', 'mail', 'status', 'review')),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000)
);
CREATE INDEX IF NOT EXISTS idx_fanc_listing_activity_opp ON public.fanc_listing_activity (opportunity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fanc_listing_activity_author ON public.fanc_listing_activity (author_id, created_at DESC);

ALTER TABLE public.fanc_listing_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_listing_activity ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_listing_opportunities' AND policyname = 'Admins have full access') THEN
    CREATE POLICY "Admins have full access" ON public.fanc_listing_opportunities FOR ALL TO authenticated
      USING (private.fanc_is_admin()) WITH CHECK (private.fanc_is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_listing_opportunities' AND policyname = 'Brokers can read approved') THEN
    CREATE POLICY "Brokers can read approved" ON public.fanc_listing_opportunities FOR SELECT TO authenticated
      USING (private.fanc_is_staff() AND review_status = 'approved');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_listing_opportunities' AND policyname = 'Brokers can update approved') THEN
    CREATE POLICY "Brokers can update approved" ON public.fanc_listing_opportunities FOR UPDATE TO authenticated
      USING (private.fanc_is_staff() AND review_status = 'approved')
      WITH CHECK (private.fanc_is_staff() AND review_status = 'approved');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_listing_opportunities' AND policyname = 'Brokers can add') THEN
    CREATE POLICY "Brokers can add" ON public.fanc_listing_opportunities FOR INSERT TO authenticated
      WITH CHECK (private.fanc_is_staff());
  END IF;
  -- Checked after the trigger, so this only ever admits pending, unassigned rows.
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_listing_opportunities' AND policyname = 'Anyone can submit for review') THEN
    CREATE POLICY "Anyone can submit for review" ON public.fanc_listing_opportunities FOR INSERT TO anon, authenticated
      WITH CHECK (review_status = 'pending_review' AND assigned_to IS NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_listing_opportunities' AND policyname = 'Submitters can read their own') THEN
    CREATE POLICY "Submitters can read their own" ON public.fanc_listing_opportunities FOR SELECT TO authenticated
      USING (created_by = auth.uid());
  END IF;

  -- Activity follows the opportunity's visibility (the subquery runs under the opportunity's RLS); append-only.
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_listing_activity' AND policyname = 'Staff can read activity') THEN
    CREATE POLICY "Staff can read activity" ON public.fanc_listing_activity FOR SELECT TO authenticated
      USING (private.fanc_is_staff() AND EXISTS (SELECT 1 FROM public.fanc_listing_opportunities o WHERE o.id = opportunity_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_listing_activity' AND policyname = 'Staff can add activity') THEN
    CREATE POLICY "Staff can add activity" ON public.fanc_listing_activity FOR INSERT TO authenticated
      WITH CHECK (private.fanc_is_staff() AND author_id = auth.uid()
                  AND EXISTS (SELECT 1 FROM public.fanc_listing_opportunities o WHERE o.id = opportunity_id));
  END IF;
END $$;

REVOKE ALL ON public.fanc_listing_opportunities FROM anon;
GRANT INSERT ON public.fanc_listing_opportunities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fanc_listing_opportunities TO authenticated;
REVOKE ALL ON public.fanc_listing_activity FROM anon;
GRANT SELECT, INSERT ON public.fanc_listing_activity TO authenticated;

-- Staff need names for the "assigned to" picker; profiles are otherwise only readable by their owner and admins.
CREATE OR REPLACE FUNCTION public.fanc_staff_directory()
RETURNS TABLE (id UUID, first_name TEXT, last_name TEXT, role TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT p.id, p.first_name::text, p.last_name::text, p.role::text FROM public.fanc_user_profiles p
  WHERE private.fanc_is_staff() AND p.role IN ('broker', 'admin') AND COALESCE(p.is_active, true)
  ORDER BY p.first_name, p.last_name
$$;
REVOKE ALL ON FUNCTION public.fanc_staff_directory() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fanc_staff_directory() TO authenticated;
