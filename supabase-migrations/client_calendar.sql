-- Calendar for the client database (/dashboard/calendar): important dates per client (insurance renewals,
-- warranties, anniversaries…) and a record of which reminders were handled.
-- Run after client_database.sql.

CREATE TABLE IF NOT EXISTS public.fanc_client_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.fanc_clients (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  kind TEXT NOT NULL CHECK (kind IN (
    'wedding_anniversary', 'insurance_renewal', 'flood_insurance_renewal', 'home_warranty_expiration',
    'hoa_dues', 'mortgage_review', 'lease_end', 'custom'
  )),
  label TEXT,
  date DATE NOT NULL,
  repeats TEXT NOT NULL DEFAULT 'yearly' CHECK (repeats IN ('yearly', 'once')),
  remind_days INTEGER NOT NULL DEFAULT 7 CHECK (remind_days BETWEEN 0 AND 120),
  provider TEXT,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_fanc_client_dates_client ON public.fanc_client_dates (client_id);

-- One row per handled reminder occurrence, e.g. ('birthday:<client id>', 2027-03-15).
CREATE TABLE IF NOT EXISTS public.fanc_calendar_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_key TEXT NOT NULL,
  occurs_on DATE NOT NULL,
  client_id UUID REFERENCES public.fanc_clients (id) ON DELETE CASCADE,
  completed_by UUID DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE SET NULL,
  UNIQUE (event_key, occurs_on)
);
CREATE INDEX IF NOT EXISTS idx_fanc_calendar_completions_on ON public.fanc_calendar_completions (occurs_on);

ALTER TABLE public.fanc_client_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_calendar_completions ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['fanc_client_dates', 'fanc_calendar_completions'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t
                   AND policyname = 'Brokers and admins have full access') THEN
      EXECUTE format('CREATE POLICY "Brokers and admins have full access" ON public.%I FOR ALL TO authenticated '
                     'USING (private.fanc_is_staff()) WITH CHECK (private.fanc_is_staff())', t);
    END IF;
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
  END LOOP;
END $$;
