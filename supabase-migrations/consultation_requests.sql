-- Consultation requests from the site-wide consultation form (components/ConsultationForm.tsx,
-- posted through app/api/consultation/route.ts). Anyone may insert; only brokers and admins may read or update.
CREATE TABLE IF NOT EXISTS public.fanc_consultation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Contact
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 320),
  phone TEXT CHECK (char_length(phone) <= 50),
  preferred_contact TEXT CHECK (preferred_contact IN ('call', 'text', 'email')),

  -- Goals
  intent TEXT[] NOT NULL DEFAULT '{}',          -- buy, sell, invest, relocate, hud, build
  timeframe TEXT,
  price_range TEXT,
  financing TEXT,

  -- Interests in specific areas
  counties TEXT[] NOT NULL DEFAULT '{}',        -- county slugs (lib/lifestyles.ts)
  communities TEXT[] NOT NULL DEFAULT '{}',     -- community slugs (lib/communities.ts)
  neighborhoods TEXT[] NOT NULL DEFAULT '{}',   -- neighborhood slugs (lib/neighborhoods.ts)
  lifestyles TEXT[] NOT NULL DEFAULT '{}',      -- lifestyle slugs (lib/lifestyles.ts)
  must_haves TEXT[] NOT NULL DEFAULT '{}',
  message TEXT CHECK (char_length(message) <= 5000),

  -- Where the request came from
  source_page TEXT,
  user_agent TEXT,

  -- Back office
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'client', 'closed')),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_fanc_consultation_requests_created_at ON public.fanc_consultation_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fanc_consultation_requests_status ON public.fanc_consultation_requests (status);

ALTER TABLE public.fanc_consultation_requests ENABLE ROW LEVEL SECURITY;

-- The public form may only insert new requests (no reads, updates or deletes).
DROP POLICY IF EXISTS "Public can submit consultation requests" ON public.fanc_consultation_requests;
CREATE POLICY "Public can submit consultation requests" ON public.fanc_consultation_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new' AND notes IS NULL);

DROP POLICY IF EXISTS "Brokers and admins can read consultation requests" ON public.fanc_consultation_requests;
CREATE POLICY "Brokers and admins can read consultation requests" ON public.fanc_consultation_requests
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.fanc_user_profiles p
    WHERE p.id = auth.uid() AND p.role IN ('broker', 'admin')
  ));

DROP POLICY IF EXISTS "Brokers and admins can update consultation requests" ON public.fanc_consultation_requests;
CREATE POLICY "Brokers and admins can update consultation requests" ON public.fanc_consultation_requests
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.fanc_user_profiles p
    WHERE p.id = auth.uid() AND p.role IN ('broker', 'admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.fanc_user_profiles p
    WHERE p.id = auth.uid() AND p.role IN ('broker', 'admin')
  ));

GRANT INSERT ON public.fanc_consultation_requests TO anon;
GRANT SELECT, INSERT, UPDATE ON public.fanc_consultation_requests TO authenticated;
