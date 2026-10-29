-- One company, many branches (October 2026)
-- Lightkeeper Realty runs as a single company with branch offices (fanc_offices, from multi_tenancy.sql).
-- 1. Only one company: a second brokerage can't be created.
-- 2. One main office.
-- 3. Deals, leads, listing opportunities and ledger entries carry a branch. When none is given it follows the
--    broker the record belongs to (the deal's broker, the assigned broker, the broker a ledger entry is charged to),
--    and moves with them when the record is reassigned, unless the branch is changed in the same update.
-- Run after multi_tenancy.sql.

-- ───────────────────────── 1–2. One company, one main office ─────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_fanc_brokerages_single ON public.fanc_brokerages ((true));
CREATE UNIQUE INDEX IF NOT EXISTS idx_fanc_offices_main ON public.fanc_offices (brokerage_id) WHERE is_main;

-- ───────────────────────── 3. Branch on company records ─────────────────────────
CREATE OR REPLACE FUNCTION private.fanc_set_branch()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  person UUID := (to_jsonb(NEW) ->> TG_ARGV[0])::uuid;
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.office_id IS NULL AND person IS NOT NULL)
     OR (TG_OP = 'UPDATE' AND person IS DISTINCT FROM (to_jsonb(OLD) ->> TG_ARGV[0])::uuid
         AND NEW.office_id IS NOT DISTINCT FROM OLD.office_id) THEN
    NEW.office_id := (SELECT p.office_id FROM public.fanc_user_profiles p WHERE p.id = person);
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.fanc_set_branch() FROM PUBLIC, anon, authenticated;

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('fanc_deals', 'broker_id'),
    ('fanc_listing_opportunities', 'assigned_to'),
    ('fanc_consultation_requests', 'assigned_to'),
    ('fanc_ledger', 'broker_id')
  ) AS v (tbl, person) LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS office_id UUID REFERENCES public.fanc_offices (id) ON DELETE SET NULL', r.tbl);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (office_id)', 'idx_' || r.tbl || '_office', r.tbl);
    -- Runs after the other BEFORE triggers (alphabetical), so it sees the broker the review trigger assigned.
    EXECUTE format('CREATE OR REPLACE TRIGGER fanc_set_branch BEFORE INSERT OR UPDATE ON public.%I '
                   'FOR EACH ROW EXECUTE FUNCTION private.fanc_set_branch(%L)', r.tbl, r.person);
    EXECUTE format('UPDATE public.%1$I t SET office_id = p.office_id FROM public.fanc_user_profiles p '
                   'WHERE t.office_id IS NULL AND p.id = t.%2$I AND p.office_id IS NOT NULL', r.tbl, r.person);
  END LOOP;
END $$;
