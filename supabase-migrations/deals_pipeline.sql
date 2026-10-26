-- Active deals pipeline (/dashboard/deals): one row per buyer or seller transaction in progress, with the
-- NC Offer to Purchase dates, and a checklist whose due dates can follow those dates.
-- Run after client_database.sql.

CREATE TABLE IF NOT EXISTS public.fanc_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_id UUID NOT NULL REFERENCES public.fanc_clients (id) ON DELETE CASCADE,
  side TEXT NOT NULL DEFAULT 'buyer' CHECK (side IN ('buyer', 'seller', 'both')),
  stage TEXT NOT NULL DEFAULT 'active'
    CHECK (stage IN ('active', 'under_contract', 'post_dd', 'clear_to_close', 'closed', 'fell_through')),
  property_address TEXT,
  city VARCHAR(100),
  zip_code VARCHAR(10),
  mls_number VARCHAR(50),
  is_hud BOOLEAN NOT NULL DEFAULT false,
  list_price NUMERIC(12, 2),
  contract_price NUMERIC(12, 2),
  due_diligence_fee NUMERIC(12, 2),
  earnest_money NUMERIC(12, 2),
  commission_pct NUMERIC(5, 3),
  effective_date DATE,
  emd_due_date DATE,
  inspection_date DATE,
  due_diligence_date DATE,
  appraisal_date DATE,
  closing_date DATE,
  lender TEXT,
  closing_attorney TEXT,
  other_agent TEXT,
  notes TEXT,
  fell_through_reason TEXT,
  closed_at TIMESTAMPTZ,
  closed_transaction_id UUID REFERENCES public.fanc_client_transactions (id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_fanc_deals_client ON public.fanc_deals (client_id);
CREATE INDEX IF NOT EXISTS idx_fanc_deals_stage ON public.fanc_deals (stage);

CREATE OR REPLACE TRIGGER update_fanc_deals_updated_at
  BEFORE UPDATE ON public.fanc_deals
  FOR EACH ROW EXECUTE FUNCTION public.update_fanc_updated_at_column();

-- A task is due on a fixed date, or `offset_days` from one of the deal's dates (anchor), so it moves with it.
CREATE TABLE IF NOT EXISTS public.fanc_deal_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.fanc_deals (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 300),
  anchor TEXT CHECK (anchor IN ('effective_date', 'emd_due_date', 'inspection_date', 'due_diligence_date', 'appraisal_date', 'closing_date')),
  offset_days INTEGER NOT NULL DEFAULT 0 CHECK (offset_days BETWEEN -365 AND 365),
  due_date DATE,
  done_at TIMESTAMPTZ,
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_fanc_deal_tasks_deal ON public.fanc_deal_tasks (deal_id, sort);

ALTER TABLE public.fanc_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_deal_tasks ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['fanc_deals', 'fanc_deal_tasks'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t
                   AND policyname = 'Brokers and admins have full access') THEN
      EXECUTE format('CREATE POLICY "Brokers and admins have full access" ON public.%I FOR ALL TO authenticated '
                     'USING (private.fanc_is_staff()) WITH CHECK (private.fanc_is_staff())', t);
    END IF;
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
  END LOOP;
END $$;
