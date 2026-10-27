-- Admin departments (Executive, Sales, Marketing, Accounting, HR, Operations & Compliance).
-- 1. Annual goals for the company and each broker (Executive).
-- 2. Broker HR records: NC license, continuing education, E&O insurance, contractor paperwork (HR).
-- 3. Commission received / broker paid dates on deals (Accounting's commissions register and 1099s).
-- Run after deal_workspace.sql.

-- ───────────────────────── 1. Goals ─────────────────────────
CREATE TABLE IF NOT EXISTS public.fanc_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  year INTEGER NOT NULL CHECK (year BETWEEN 2000 AND 2100),
  broker_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,   -- null = company goal
  metric TEXT NOT NULL CHECK (metric IN ('units', 'volume', 'gci', 'company_dollar', 'net_profit', 'listings_won')),
  target NUMERIC(14, 2) NOT NULL CHECK (target >= 0)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fanc_goals_unique
  ON public.fanc_goals (year, COALESCE(broker_id, '00000000-0000-0000-0000-000000000000'::uuid), metric);
CREATE OR REPLACE TRIGGER update_fanc_goals_updated_at
  BEFORE UPDATE ON public.fanc_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_fanc_updated_at_column();

-- ───────────────────────── 2. Broker records ─────────────────────────
CREATE TABLE IF NOT EXISTS public.fanc_broker_records (
  broker_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  license_number TEXT CHECK (char_length(license_number) <= 50),
  license_status TEXT CHECK (license_status IN ('broker', 'provisional_broker', 'bic', 'inactive')),
  license_expires DATE,            -- NC licenses renew by June 30 each year
  ce_completed_on DATE,            -- NC continuing education is due by June 10
  eo_carrier TEXT CHECK (char_length(eo_carrier) <= 200),
  eo_expires DATE,
  start_date DATE,
  ica_signed BOOLEAN NOT NULL DEFAULT false,   -- independent contractor agreement
  w9_on_file BOOLEAN NOT NULL DEFAULT false,
  emergency_contact TEXT CHECK (char_length(emergency_contact) <= 300),
  notes TEXT CHECK (char_length(notes) <= 5000)
);
CREATE OR REPLACE TRIGGER update_fanc_broker_records_updated_at
  BEFORE UPDATE ON public.fanc_broker_records
  FOR EACH ROW EXECUTE FUNCTION public.update_fanc_updated_at_column();

-- ───────────────────────── 3. Commission tracking ─────────────────────────
ALTER TABLE public.fanc_deals
  ADD COLUMN IF NOT EXISTS commission_received_on DATE,   -- check received from the closing attorney
  ADD COLUMN IF NOT EXISTS agent_paid_on DATE;            -- broker's share paid out

-- ───────────────────────── Access ─────────────────────────
ALTER TABLE public.fanc_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_broker_records ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_goals' AND policyname = 'Admins manage goals') THEN
    CREATE POLICY "Admins manage goals" ON public.fanc_goals FOR ALL TO authenticated
      USING (private.fanc_is_admin()) WITH CHECK (private.fanc_is_admin());
  END IF;
  -- Brokers see the company's goals and their own.
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_goals' AND policyname = 'Brokers read company and own goals') THEN
    CREATE POLICY "Brokers read company and own goals" ON public.fanc_goals FOR SELECT TO authenticated
      USING (private.fanc_is_staff() AND (broker_id IS NULL OR broker_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_broker_records' AND policyname = 'Admins manage broker records') THEN
    CREATE POLICY "Admins manage broker records" ON public.fanc_broker_records FOR ALL TO authenticated
      USING (private.fanc_is_admin()) WITH CHECK (private.fanc_is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_broker_records' AND policyname = 'Brokers read their own record') THEN
    CREATE POLICY "Brokers read their own record" ON public.fanc_broker_records FOR SELECT TO authenticated
      USING (broker_id = auth.uid() AND private.fanc_is_staff());
  END IF;
END $$;

REVOKE ALL ON public.fanc_goals, public.fanc_broker_records FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fanc_goals, public.fanc_broker_records TO authenticated;

-- Only an admin records that a commission came in or that a broker was paid (deals are otherwise shared by staff).
CREATE OR REPLACE FUNCTION private.fanc_deal_accounting_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT private.fanc_is_admin()
     AND (NEW.commission_received_on IS DISTINCT FROM OLD.commission_received_on OR NEW.agent_paid_on IS DISTINCT FROM OLD.agent_paid_on) THEN
    RAISE EXCEPTION 'Only an admin can record commissions received or paid' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.fanc_deal_accounting_guard() FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE TRIGGER fanc_deal_accounting_guard
  BEFORE UPDATE ON public.fanc_deals
  FOR EACH ROW EXECUTE FUNCTION private.fanc_deal_accounting_guard();
