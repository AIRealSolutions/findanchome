-- Lock down public access to fanc_properties.
-- Before: any visitor (anon key) could read every row and every column,
-- including internal notes, drafts and sold/inactive listings.
-- After:
--   * anon (the public website) sees only active/pending listings, and only
--     the columns the public pages need (no notes, created_by or created_at).
--   * Signed-in non-brokers get no direct access (the public pages use anon).
--   * Brokers and admins keep full access via the existing
--     "Brokers and admins can manage properties" policy.

DROP POLICY IF EXISTS "Anyone can view active properties" ON public.fanc_properties;
DROP POLICY IF EXISTS "Public can view live listings" ON public.fanc_properties;
CREATE POLICY "Public can view live listings" ON public.fanc_properties
  FOR SELECT TO anon
  USING (status IN ('active', 'pending'));

-- Column-level privileges: anon may read only public listing columns
-- (keep in sync with PUBLIC_COLUMNS in lib/listings.ts) and never write.
REVOKE ALL ON public.fanc_properties FROM anon;
GRANT SELECT (
  id, updated_at, title, description, property_type, listing_type,
  address_line1, address_line2, city, state, zip_code, county,
  latitude, longitude, bedrooms, bathrooms, square_feet, lot_size,
  year_built, price, original_price, hud_case_number, images,
  virtual_tour_url, status, is_featured, meta_title, meta_description,
  slug, amenities
) ON public.fanc_properties TO anon;

-- Signed-in users only need ordinary DML (RLS decides which rows).
REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.fanc_properties FROM authenticated;
