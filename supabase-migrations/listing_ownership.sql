-- Who owns a listing opportunity.
-- A broker who onboards or snaps a house keeps it: it is assigned to them and stays on their dashboard
-- (for as long as they are an active broker; after they leave, an admin can hand their opportunities out).
-- Opportunities entered by the broker-in-charge / an admin, or that came in through the company (the website,
-- client referrals), are the company's: only an admin can give them to a broker or move them to another one.
-- Run after field_capture.sql.

CREATE OR REPLACE FUNCTION private.fanc_listing_opportunity_review()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE r text := private.fanc_current_role();
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by := auth.uid();
    IF NEW.requested_broker_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.fanc_user_profiles p
      WHERE p.id = NEW.requested_broker_id AND p.role IN ('broker', 'admin') AND COALESCE(p.is_active, true)
    ) THEN
      NEW.requested_broker_id := NULL;
    END IF;
    IF r IN ('broker', 'admin') THEN
      NEW.created_by_role := r;
      NEW.review_status := 'approved';
      NEW.reviewed_by := auth.uid();
      NEW.reviewed_at := NOW();
      -- A broker's own opportunity is always theirs; an admin may hand theirs to any broker.
      NEW.assigned_to := CASE WHEN r = 'broker' THEN auth.uid() ELSE COALESCE(NEW.assigned_to, auth.uid()) END;
    ELSE
      NEW.created_by_role := CASE WHEN auth.uid() IS NULL THEN 'public' ELSE 'client' END;
      NEW.review_status := 'pending_review';
      NEW.reviewed_by := NULL;
      NEW.reviewed_at := NULL;
      NEW.review_note := NULL;
      NEW.assigned_to := NULL;
      NEW.stage := 'new';
      NEW.priority := 'warm';
      NEW.follow_up_at := NULL;
      NEW.appointment_at := NULL;
      NEW.last_contacted_at := NULL;
      NEW.lost_reason := NULL;
      NEW.estimated_value := NULL;
      NEW.notes := NULL;
      NEW.client_id := NULL;
      NEW.consultation_id := NULL;
      NEW.deal_id := NULL;
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.created_by IS DISTINCT FROM OLD.created_by OR NEW.created_by_role IS DISTINCT FROM OLD.created_by_role THEN
    RAISE EXCEPTION 'The creator of a listing opportunity cannot be changed' USING ERRCODE = '42501';
  END IF;
  -- Assignment. The SQL editor (no auth.uid()) can always fix things up.
  IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to AND auth.uid() IS NOT NULL THEN
    IF OLD.created_by_role = 'broker' AND EXISTS (
      SELECT 1 FROM public.fanc_user_profiles p
      WHERE p.id = OLD.created_by AND p.role IN ('broker', 'admin') AND COALESCE(p.is_active, true)
    ) THEN
      RAISE EXCEPTION 'This opportunity stays with the broker who brought it in' USING ERRCODE = '42501';
    END IF;
    IF NOT private.fanc_is_admin() THEN
      RAISE EXCEPTION 'Only the broker-in-charge or an admin can assign company opportunities' USING ERRCODE = '42501';
    END IF;
  END IF;
  IF NEW.review_status IS DISTINCT FROM OLD.review_status THEN
    IF auth.uid() IS NOT NULL AND NOT private.fanc_is_admin() THEN
      RAISE EXCEPTION 'Only an admin can review listing opportunities' USING ERRCODE = '42501';
    END IF;
    NEW.reviewed_by := auth.uid();
    NEW.reviewed_at := NOW();
  ELSIF NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
        OR NEW.review_note IS DISTINCT FROM OLD.review_note THEN
    IF auth.uid() IS NOT NULL AND NOT private.fanc_is_admin() THEN
      RAISE EXCEPTION 'Only an admin can review listing opportunities' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.fanc_listing_opportunity_review() FROM PUBLIC, anon, authenticated;
