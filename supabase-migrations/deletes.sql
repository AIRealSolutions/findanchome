-- Deleting leads and clients (October 2026)
-- 1. Brokers and admins can delete consultation leads (their timeline goes with them; a client or listing
--    opportunity made from the lead stays, unlinked).
-- 2. A client's emails/texts log, saved homes and drip enrollments go with the client, and their audit events stay
--    without the link, so those rows no longer block deleting a client. (Deals, closings, dates and timeline
--    already cascade.)
-- Run after branches.sql.

-- ───────────────────────── 1. Leads ─────────────────────────
DROP POLICY IF EXISTS "Brokers and admins can delete consultation requests" ON public.fanc_consultation_requests;
CREATE POLICY "Brokers and admins can delete consultation requests" ON public.fanc_consultation_requests
  FOR DELETE TO authenticated USING (private.fanc_is_staff());

-- ───────────────────────── 2. Clients ─────────────────────────
ALTER TABLE public.fanc_communications DROP CONSTRAINT IF EXISTS fanc_communications_client_id_fkey,
  ADD CONSTRAINT fanc_communications_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.fanc_clients (id) ON DELETE CASCADE;
ALTER TABLE public.fanc_saved_properties DROP CONSTRAINT IF EXISTS fanc_saved_properties_client_id_fkey,
  ADD CONSTRAINT fanc_saved_properties_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.fanc_clients (id) ON DELETE CASCADE;
ALTER TABLE public.fanc_drip_campaign_enrollments DROP CONSTRAINT IF EXISTS fanc_drip_campaign_enrollments_client_id_fkey,
  ADD CONSTRAINT fanc_drip_campaign_enrollments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.fanc_clients (id) ON DELETE CASCADE;
ALTER TABLE public.fanc_events DROP CONSTRAINT IF EXISTS fanc_events_client_id_fkey,
  ADD CONSTRAINT fanc_events_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.fanc_clients (id) ON DELETE SET NULL;
