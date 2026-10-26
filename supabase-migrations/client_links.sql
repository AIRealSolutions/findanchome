-- Links on fanc_clients: the website consultation a client came from, and the client who referred them.
-- Run after client_database.sql and consultation_crm.sql.

ALTER TABLE public.fanc_clients
  ADD COLUMN IF NOT EXISTS consultation_id UUID REFERENCES public.fanc_consultation_requests (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referred_by_id UUID REFERENCES public.fanc_clients (id) ON DELETE SET NULL;

ALTER TABLE public.fanc_clients DROP CONSTRAINT IF EXISTS fanc_clients_not_self_referred;
ALTER TABLE public.fanc_clients ADD CONSTRAINT fanc_clients_not_self_referred CHECK (referred_by_id IS DISTINCT FROM id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fanc_clients_consultation ON public.fanc_clients (consultation_id) WHERE consultation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fanc_clients_referred_by ON public.fanc_clients (referred_by_id) WHERE referred_by_id IS NOT NULL;
