-- Message templates (/dashboard/templates) for texts and emails to clients, with {merge_fields}.
-- One template per category can be the default, which the calendar suggests for that occasion.
-- Starter templates are added by the app (lib/templates.ts) the first time the page is opened.
-- Run after security_hardening.sql.

CREATE TABLE IF NOT EXISTS public.fanc_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
    'general', 'birthday', 'home_anniversary', 'wedding_anniversary', 'insurance_renewal', 'flood_insurance_renewal',
    'home_warranty_expiration', 'mortgage_review', 'hoa_dues', 'lease_end', 'deal'
  )),
  subject TEXT,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
  is_default BOOLEAN NOT NULL DEFAULT false,
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fanc_message_templates_default ON public.fanc_message_templates (category) WHERE is_default;

CREATE OR REPLACE TRIGGER update_fanc_message_templates_updated_at
  BEFORE UPDATE ON public.fanc_message_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_fanc_updated_at_column();

ALTER TABLE public.fanc_message_templates ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_message_templates'
                 AND policyname = 'Brokers and admins have full access') THEN
    CREATE POLICY "Brokers and admins have full access" ON public.fanc_message_templates FOR ALL TO authenticated
      USING (private.fanc_is_staff()) WITH CHECK (private.fanc_is_staff());
  END IF;
END $$;
REVOKE ALL ON public.fanc_message_templates FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fanc_message_templates TO authenticated;
