-- Brokers can delete listing opportunities they entered themselves (admins already can delete any).
-- Timeline, tasks and photo rows go with it (ON DELETE CASCADE); the app removes the photo files first.
-- Safe to run more than once.

DROP POLICY IF EXISTS "Brokers can delete their own" ON public.fanc_listing_opportunities;
CREATE POLICY "Brokers can delete their own" ON public.fanc_listing_opportunities
  FOR DELETE TO authenticated
  USING (private.fanc_is_staff() AND created_by = auth.uid());
