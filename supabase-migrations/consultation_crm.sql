-- CRM fields and activity log for consultation leads (dashboard /dashboard/leads).
-- Run after consultation_requests.sql and security_hardening.sql.

ALTER TABLE public.fanc_consultation_requests
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'warm' CHECK (priority IN ('hot', 'warm', 'cold')),
  ADD COLUMN IF NOT EXISTS follow_up_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_fanc_consultation_requests_follow_up ON public.fanc_consultation_requests (follow_up_at)
  WHERE follow_up_at IS NOT NULL;

CREATE OR REPLACE TRIGGER update_fanc_consultation_requests_updated_at
  BEFORE UPDATE ON public.fanc_consultation_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_fanc_updated_at_column();

-- The public form can only create fresh, unassigned leads.
ALTER POLICY "Public can submit consultation requests" ON public.fanc_consultation_requests
  TO anon, authenticated
  WITH CHECK (
    status = 'new' AND notes IS NULL AND priority = 'warm'
    AND follow_up_at IS NULL AND last_contacted_at IS NULL AND assigned_to IS NULL
  );

-- Timeline of calls, texts, emails, meetings, notes and status changes for each lead.
CREATE TABLE IF NOT EXISTS public.fanc_consultation_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.fanc_consultation_requests (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  author_id UUID DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE SET NULL,
  author_name TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('note', 'call', 'text', 'email', 'meeting', 'status')),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000)
);

CREATE INDEX IF NOT EXISTS idx_fanc_consultation_activity_request ON public.fanc_consultation_activity (request_id, created_at DESC);

ALTER TABLE public.fanc_consultation_activity ENABLE ROW LEVEL SECURITY;

-- Brokers and admins can read and add entries; the log is append-only.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_consultation_activity'
                 AND policyname = 'Brokers and admins can read activity') THEN
    CREATE POLICY "Brokers and admins can read activity" ON public.fanc_consultation_activity
      FOR SELECT TO authenticated USING (private.fanc_is_staff());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_consultation_activity'
                 AND policyname = 'Brokers and admins can add activity') THEN
    CREATE POLICY "Brokers and admins can add activity" ON public.fanc_consultation_activity
      FOR INSERT TO authenticated WITH CHECK (private.fanc_is_staff() AND author_id = auth.uid());
  END IF;
END $$;

REVOKE ALL ON public.fanc_consultation_activity FROM anon;
GRANT SELECT, INSERT ON public.fanc_consultation_activity TO authenticated;
