-- Lightkeeper Realty control center (/dashboard for admins) and broker marketing (/dashboard/marketing).
-- 1. Broker commission plans (admin-only; a broker can read their own).
-- 2. Deals get an assigned broker and the money fields the P&L needs; the split is snapshotted at closing.
-- 3. A company ledger for income and expenses outside of deals (admin-only).
-- 4. Social posts / content calendar for each broker.
-- 5. Brokers' own lead-capture links: listing opportunities can name the broker the owner asked for
--    (still reviewed by the admin first), and the public page can show that broker's name.
-- Run after listing_opportunities.sql.

-- ───────────────────────── 1. Broker plans ─────────────────────────
CREATE TABLE IF NOT EXISTS public.fanc_broker_plans (
  broker_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  split_pct NUMERIC(5, 2) NOT NULL DEFAULT 70 CHECK (split_pct BETWEEN 0 AND 100),   -- broker's share of net commission
  annual_cap NUMERIC(12, 2) CHECK (annual_cap >= 0),                                -- company dollar cap per calendar year
  transaction_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (transaction_fee >= 0),   -- per closed deal, from the broker's share
  monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (monthly_fee >= 0),           -- desk fee
  starts_on DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT CHECK (char_length(notes) <= 2000)
);
CREATE OR REPLACE TRIGGER update_fanc_broker_plans_updated_at
  BEFORE UPDATE ON public.fanc_broker_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_fanc_updated_at_column();

-- ───────────────────────── 2. Deal money ─────────────────────────
ALTER TABLE public.fanc_deals
  ADD COLUMN IF NOT EXISTS broker_id UUID DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS gross_commission NUMERIC(12, 2) CHECK (gross_commission >= 0),      -- actual check, overrides price × %
  ADD COLUMN IF NOT EXISTS referral_fee_pct NUMERIC(5, 2) CHECK (referral_fee_pct BETWEEN 0 AND 100), -- paid out to a referring agent
  ADD COLUMN IF NOT EXISTS agent_split_pct NUMERIC(5, 2) CHECK (agent_split_pct BETWEEN 0 AND 100),   -- plan split at closing
  ADD COLUMN IF NOT EXISTS transaction_fee NUMERIC(10, 2) CHECK (transaction_fee >= 0);             -- plan fee at closing
CREATE INDEX IF NOT EXISTS idx_fanc_deals_broker ON public.fanc_deals (broker_id);

-- Deals that predate this belong to the principal broker.
UPDATE public.fanc_deals SET broker_id = (SELECT id FROM public.fanc_user_profiles WHERE role = 'admin' ORDER BY created_at LIMIT 1)
WHERE broker_id IS NULL;

-- ───────────────────────── 3. Company ledger ─────────────────────────
CREATE TABLE IF NOT EXISTS public.fanc_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE SET NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  kind TEXT NOT NULL CHECK (kind IN ('income', 'expense')),
  category TEXT NOT NULL CHECK (char_length(category) BETWEEN 1 AND 100),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT CHECK (char_length(description) <= 500),
  broker_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,   -- charged to / earned by a broker; null = company
  deal_id UUID REFERENCES public.fanc_deals (id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_fanc_ledger_date ON public.fanc_ledger (entry_date);

-- ───────────────────────── 4. Social posts ─────────────────────────
CREATE TABLE IF NOT EXISTS public.fanc_marketing_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  broker_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (char_length(kind) BETWEEN 1 AND 50),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
  link TEXT CHECK (char_length(link) <= 500),
  platforms TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'posted')),
  scheduled_for DATE,
  posted_at TIMESTAMPTZ,
  deal_id UUID REFERENCES public.fanc_deals (id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_fanc_marketing_posts_broker ON public.fanc_marketing_posts (broker_id, created_at DESC);
CREATE OR REPLACE TRIGGER update_fanc_marketing_posts_updated_at
  BEFORE UPDATE ON public.fanc_marketing_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_fanc_updated_at_column();

-- ───────────────────────── 5. Brokers' lead-capture links ─────────────────────────
ALTER TABLE public.fanc_listing_opportunities
  ADD COLUMN IF NOT EXISTS requested_broker_id UUID REFERENCES auth.users (id) ON DELETE SET NULL;

-- Same routing as before; a requested broker is kept only if it names an active broker or admin.
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
    ) THEN
      NEW.requested_broker_id := NULL;
    END IF;
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

-- The name, phone and license a broker's own link shows to the public. Only brokers and admins resolve.
CREATE OR REPLACE FUNCTION public.fanc_public_broker(broker UUID)
RETURNS TABLE (id UUID, first_name TEXT, last_name TEXT, phone TEXT, broker_license TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT p.id, p.first_name::text, p.last_name::text, p.phone::text, p.broker_license::text FROM public.fanc_user_profiles p
  WHERE p.id = broker AND p.role IN ('broker', 'admin') AND COALESCE(p.is_active, true)
$$;
REVOKE ALL ON FUNCTION public.fanc_public_broker(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fanc_public_broker(UUID) TO anon, authenticated;

-- ───────────────────────── Access ─────────────────────────
ALTER TABLE public.fanc_broker_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_marketing_posts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_broker_plans' AND policyname = 'Admins manage plans') THEN
    CREATE POLICY "Admins manage plans" ON public.fanc_broker_plans FOR ALL TO authenticated
      USING (private.fanc_is_admin()) WITH CHECK (private.fanc_is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_broker_plans' AND policyname = 'Brokers read their own plan') THEN
    CREATE POLICY "Brokers read their own plan" ON public.fanc_broker_plans FOR SELECT TO authenticated
      USING (broker_id = auth.uid() AND private.fanc_is_staff());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_ledger' AND policyname = 'Admins manage the ledger') THEN
    CREATE POLICY "Admins manage the ledger" ON public.fanc_ledger FOR ALL TO authenticated
      USING (private.fanc_is_admin()) WITH CHECK (private.fanc_is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_marketing_posts' AND policyname = 'Brokers manage their own posts') THEN
    CREATE POLICY "Brokers manage their own posts" ON public.fanc_marketing_posts FOR ALL TO authenticated
      USING (private.fanc_is_staff() AND (broker_id = auth.uid() OR private.fanc_is_admin()))
      WITH CHECK (private.fanc_is_staff() AND (broker_id = auth.uid() OR private.fanc_is_admin()));
  END IF;
END $$;

REVOKE ALL ON public.fanc_broker_plans, public.fanc_ledger, public.fanc_marketing_posts FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fanc_broker_plans, public.fanc_ledger, public.fanc_marketing_posts TO authenticated;
