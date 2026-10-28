-- Field capture for listing opportunities: photos, map location, owner research from public parcel records,
-- and the foreclosure / probate / inherited-property workflows.
-- Run after admin_departments.sql.

-- ───────────────────────── Opportunity fields ─────────────────────────
ALTER TABLE public.fanc_listing_opportunities
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(9, 6) CHECK (latitude BETWEEN -90 AND 90),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(9, 6) CHECK (longitude BETWEEN -180 AND 180),
  ADD COLUMN IF NOT EXISTS location_source TEXT CHECK (location_source IN ('photo', 'device', 'map', 'address')),
  -- Owner research (NC OneMap parcels): the parcel number, the record as looked up, and whether the owner gets
  -- their tax bill somewhere other than the property.
  ADD COLUMN IF NOT EXISTS parcel_id TEXT CHECK (char_length(parcel_id) <= 100),
  ADD COLUMN IF NOT EXISTS parcel_data JSONB CHECK (pg_column_size(parcel_data) < 20000),
  ADD COLUMN IF NOT EXISTS absentee_owner BOOLEAN,
  ADD COLUMN IF NOT EXISTS research_notes TEXT CHECK (char_length(research_notes) <= 10000),
  -- Distressed and estate sales.
  ADD COLUMN IF NOT EXISTS situation TEXT NOT NULL DEFAULT 'standard'
    CHECK (situation IN ('standard', 'pre_foreclosure', 'foreclosure_sale', 'probate', 'inherited')),
  ADD COLUMN IF NOT EXISTS case_number TEXT CHECK (char_length(case_number) <= 100),   -- e.g. 26 SP 123 or 26 E 456
  ADD COLUMN IF NOT EXISTS case_county TEXT CHECK (char_length(case_county) <= 100),
  ADD COLUMN IF NOT EXISTS hearing_date DATE,       -- foreclosure hearing before the Clerk of Superior Court
  ADD COLUMN IF NOT EXISTS sale_date DATE,          -- scheduled foreclosure sale
  ADD COLUMN IF NOT EXISTS lender_name TEXT CHECK (char_length(lender_name) <= 200),
  ADD COLUMN IF NOT EXISTS decedent_name TEXT CHECK (char_length(decedent_name) <= 200),
  ADD COLUMN IF NOT EXISTS date_of_death DATE,
  ADD COLUMN IF NOT EXISTS representative_name TEXT CHECK (char_length(representative_name) <= 200),   -- executor / administrator
  ADD COLUMN IF NOT EXISTS representative_contact TEXT CHECK (char_length(representative_contact) <= 300),
  ADD COLUMN IF NOT EXISTS attorney_name TEXT CHECK (char_length(attorney_name) <= 200),
  ADD COLUMN IF NOT EXISTS attorney_contact TEXT CHECK (char_length(attorney_contact) <= 300),
  ADD COLUMN IF NOT EXISTS heirs TEXT CHECK (char_length(heirs) <= 2000);

ALTER TABLE public.fanc_listing_opportunities DROP CONSTRAINT IF EXISTS fanc_listing_opportunities_source_check;
ALTER TABLE public.fanc_listing_opportunities ADD CONSTRAINT fanc_listing_opportunities_source_check CHECK (source IN (
  'website', 'sphere', 'referral', 'fsbo', 'expired', 'probate', 'pre_foreclosure', 'absentee', 'hud', 'door_knock',
  'drive_by', 'open_house', 'other'));

CREATE INDEX IF NOT EXISTS idx_fanc_listing_opps_sale_date ON public.fanc_listing_opportunities (sale_date) WHERE sale_date IS NOT NULL;

-- ───────────────────────── Photos ─────────────────────────
CREATE TABLE IF NOT EXISTS public.fanc_listing_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.fanc_listing_opportunities (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE SET NULL,
  path TEXT NOT NULL UNIQUE CHECK (char_length(path) <= 300),   -- <opportunity id>/<file> in the listing-photos bucket
  caption TEXT CHECK (char_length(caption) <= 300),
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),
  taken_at TIMESTAMPTZ,
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_fanc_listing_photos_opp ON public.fanc_listing_photos (opportunity_id, sort);

-- ───────────────────────── Situation checklist ─────────────────────────
CREATE TABLE IF NOT EXISTS public.fanc_listing_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.fanc_listing_opportunities (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  situation TEXT,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 300),
  detail TEXT CHECK (char_length(detail) <= 1000),
  due_date DATE,
  done_at TIMESTAMPTZ,
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_fanc_listing_tasks_opp ON public.fanc_listing_tasks (opportunity_id, sort);

-- Both follow the opportunity's own visibility (the subquery runs under its RLS): brokers never see photos or
-- tasks of opportunities still waiting for admin review.
ALTER TABLE public.fanc_listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_listing_tasks ENABLE ROW LEVEL SECURITY;
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['fanc_listing_photos', 'fanc_listing_tasks'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t AND policyname = 'Staff work on visible opportunities') THEN
      EXECUTE format('CREATE POLICY "Staff work on visible opportunities" ON public.%I FOR ALL TO authenticated '
                     'USING (private.fanc_is_staff() AND EXISTS (SELECT 1 FROM public.fanc_listing_opportunities o WHERE o.id = opportunity_id)) '
                     'WITH CHECK (private.fanc_is_staff() AND EXISTS (SELECT 1 FROM public.fanc_listing_opportunities o WHERE o.id = opportunity_id))', t);
    END IF;
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
  END LOOP;
END $$;

-- ───────────────────────── Photo storage ─────────────────────────
-- Private bucket; the app shows photos through short-lived signed URLs.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('listing-photos', 'listing-photos', false, 15728640,
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
ON CONFLICT (id) DO NOTHING;

DO $$
DECLARE op text;
BEGIN
  FOREACH op IN ARRAY ARRAY['SELECT', 'INSERT', 'DELETE'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Staff ' || lower(op) || ' listing photos') THEN
      EXECUTE format('CREATE POLICY %I ON storage.objects FOR %s TO authenticated %s (bucket_id = ''listing-photos'' AND private.fanc_is_staff() '
                     'AND EXISTS (SELECT 1 FROM public.fanc_listing_opportunities o WHERE o.id::text = (storage.foldername(name))[1]))',
                     'Staff ' || lower(op) || ' listing photos', op, CASE WHEN op = 'INSERT' THEN 'WITH CHECK' ELSE 'USING' END);
    END IF;
  END LOOP;
END $$;
