-- Client database for past customers and sphere (dashboard /dashboard/clients), including contacts
-- imported from Flexmls. Builds on the fanc_clients table from fanc_init.sql.
-- Run after security_hardening.sql.

-- ───────────────────────── fanc_clients ─────────────────────────
-- CRM exports often have contacts without an email or last name.
ALTER TABLE public.fanc_clients
  ALTER COLUMN last_name DROP NOT NULL,
  ALTER COLUMN email DROP NOT NULL,
  ALTER COLUMN status SET DEFAULT 'prospect',
  ADD COLUMN IF NOT EXISTS secondary_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS spouse_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS company VARCHAR(200),
  ADD COLUMN IF NOT EXISTS birthday DATE,
  ADD COLUMN IF NOT EXISTS home_anniversary DATE,
  ADD COLUMN IF NOT EXISTS do_not_contact BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS follow_up_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS flexmls_id TEXT,
  ADD COLUMN IF NOT EXISTS source_created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS import_id UUID,
  ADD COLUMN IF NOT EXISTS import_raw JSONB;

UPDATE public.fanc_clients SET status = 'prospect' WHERE status IS NULL OR status NOT IN ('prospect', 'active', 'past_client', 'sphere', 'inactive');
ALTER TABLE public.fanc_clients ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.fanc_clients DROP CONSTRAINT IF EXISTS fanc_clients_status_check;
ALTER TABLE public.fanc_clients ADD CONSTRAINT fanc_clients_status_check
  CHECK (status IN ('prospect', 'active', 'past_client', 'sphere', 'inactive'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_fanc_clients_flexmls_id ON public.fanc_clients (flexmls_id) WHERE flexmls_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fanc_clients_import ON public.fanc_clients (import_id) WHERE import_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fanc_clients_email_lower ON public.fanc_clients (lower(email));

-- Replace the original policies (they query fanc_user_profiles from inside RLS) with the private helpers.
DROP POLICY IF EXISTS "Admins and brokers can manage clients" ON public.fanc_clients;
DROP POLICY IF EXISTS "Brokers can view assigned clients" ON public.fanc_clients;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_clients'
                 AND policyname = 'Brokers and admins have full access') THEN
    CREATE POLICY "Brokers and admins have full access" ON public.fanc_clients FOR ALL TO authenticated
      USING (private.fanc_is_staff()) WITH CHECK (private.fanc_is_staff());
  END IF;
END $$;
ALTER TABLE public.fanc_clients ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.fanc_clients FROM anon;

-- ───────────────────────── Closed transactions ─────────────────────────
CREATE TABLE IF NOT EXISTS public.fanc_client_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.fanc_clients (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  side TEXT NOT NULL DEFAULT 'buyer' CHECK (side IN ('buyer', 'seller', 'both', 'referral')),
  property_address TEXT,
  city VARCHAR(100),
  zip_code VARCHAR(10),
  mls_number VARCHAR(50),
  sale_price NUMERIC(12, 2),
  closing_date DATE,
  is_hud BOOLEAN NOT NULL DEFAULT false,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_fanc_client_transactions_client ON public.fanc_client_transactions (client_id, closing_date DESC);

-- ───────────────────────── Activity timeline ─────────────────────────
CREATE TABLE IF NOT EXISTS public.fanc_client_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.fanc_clients (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  author_id UUID DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE SET NULL,
  author_name TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('note', 'call', 'text', 'email', 'meeting', 'status', 'import')),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 20000)
);
CREATE INDEX IF NOT EXISTS idx_fanc_client_activity_client ON public.fanc_client_activity (client_id, created_at DESC);

-- ───────────────────────── Import batches ─────────────────────────
CREATE TABLE IF NOT EXISTS public.fanc_client_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'flexmls',
  file_name TEXT,
  total_rows INTEGER NOT NULL DEFAULT 0,
  created_count INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  mapping JSONB,
  undone_at TIMESTAMPTZ
);

ALTER TABLE public.fanc_clients DROP CONSTRAINT IF EXISTS fanc_clients_import_id_fkey;
ALTER TABLE public.fanc_clients ADD CONSTRAINT fanc_clients_import_id_fkey
  FOREIGN KEY (import_id) REFERENCES public.fanc_client_imports (id) ON DELETE SET NULL;

-- ───────────────────────── RLS for the new tables ─────────────────────────
ALTER TABLE public.fanc_client_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_client_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_client_imports ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_client_transactions'
                 AND policyname = 'Brokers and admins have full access') THEN
    CREATE POLICY "Brokers and admins have full access" ON public.fanc_client_transactions FOR ALL TO authenticated
      USING (private.fanc_is_staff()) WITH CHECK (private.fanc_is_staff());
  END IF;
  -- The activity log is append-only.
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_client_activity'
                 AND policyname = 'Brokers and admins can read activity') THEN
    CREATE POLICY "Brokers and admins can read activity" ON public.fanc_client_activity
      FOR SELECT TO authenticated USING (private.fanc_is_staff());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_client_activity'
                 AND policyname = 'Brokers and admins can add activity') THEN
    CREATE POLICY "Brokers and admins can add activity" ON public.fanc_client_activity
      FOR INSERT TO authenticated WITH CHECK (private.fanc_is_staff() AND author_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fanc_client_imports'
                 AND policyname = 'Brokers and admins have full access') THEN
    CREATE POLICY "Brokers and admins have full access" ON public.fanc_client_imports FOR ALL TO authenticated
      USING (private.fanc_is_staff()) WITH CHECK (private.fanc_is_staff());
  END IF;
END $$;

REVOKE ALL ON public.fanc_client_transactions, public.fanc_client_activity, public.fanc_client_imports FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fanc_client_transactions, public.fanc_client_imports TO authenticated;
GRANT SELECT, INSERT ON public.fanc_client_activity TO authenticated;
