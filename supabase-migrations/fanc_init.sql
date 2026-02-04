-- FINDANCHOME.COM - SAFE DATABASE SCHEMA
-- Using fanc_ prefix to avoid conflicts with existing tables

-- 1. USER PROFILES
CREATE TABLE IF NOT EXISTS public.fanc_user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  role VARCHAR(20) DEFAULT 'client' NOT NULL CHECK (role IN ('client', 'broker', 'admin')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  avatar_url TEXT,
  broker_license VARCHAR(100),
  broker_state VARCHAR(2),
  broker_bio TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE
);

-- 2. PROPERTIES
CREATE TABLE IF NOT EXISTS public.fanc_properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_type VARCHAR(50),
  listing_type VARCHAR(50) DEFAULT 'standard',
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) DEFAULT 'NC' NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  county VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  square_feet INTEGER,
  lot_size DECIMAL(10, 2),
  year_built INTEGER,
  price DECIMAL(12, 2) NOT NULL,
  original_price DECIMAL(12, 2),
  hud_case_number VARCHAR(50),
  images JSONB DEFAULT '[]'::jsonb,
  virtual_tour_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  is_featured BOOLEAN DEFAULT false,
  meta_title VARCHAR(255),
  meta_description TEXT,
  slug VARCHAR(255) UNIQUE,
  amenities JSONB DEFAULT '[]'::jsonb,
  notes TEXT
);

-- 3. CLIENTS
CREATE TABLE IF NOT EXISTS public.fanc_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  secondary_phone VARCHAR(50),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  source VARCHAR(100),
  status VARCHAR(50) DEFAULT 'new',
  lead_type VARCHAR(50),
  priority VARCHAR(20) DEFAULT 'normal',
  assigned_broker_id UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  accepted_by_broker BOOLEAN DEFAULT false,
  accepted_at TIMESTAMP WITH TIME ZONE,
  budget_min DECIMAL(12, 2),
  budget_max DECIMAL(12, 2),
  preferred_locations JSONB DEFAULT '[]'::jsonb,
  property_types JSONB DEFAULT '[]'::jsonb,
  min_bedrooms INTEGER,
  min_bathrooms DECIMAL(3, 1),
  interested_in_hud BOOLEAN DEFAULT false,
  interested_in_reo BOOLEAN DEFAULT false,
  property_address TEXT,
  estimated_value DECIMAL(12, 2),
  selling_timeline VARCHAR(50),
  onboarding_status VARCHAR(50) DEFAULT 'pending',
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  buyer_agreement_signed BOOLEAN DEFAULT false,
  buyer_agreement_signed_at TIMESTAMP WITH TIME ZONE,
  tags JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  user_id UUID REFERENCES auth.users(id)
);

-- 4. EVENTS
CREATE TABLE IF NOT EXISTS public.fanc_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_category VARCHAR(50),
  actor_id UUID REFERENCES auth.users(id),
  actor_role VARCHAR(20),
  target_type VARCHAR(50),
  target_id UUID,
  client_id UUID REFERENCES public.fanc_clients(id),
  property_id UUID REFERENCES public.fanc_properties(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  communication_method VARCHAR(50),
  communication_status VARCHAR(50),
  communication_content TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT
);

-- 5. COMMUNICATIONS
CREATE TABLE IF NOT EXISTS public.fanc_communications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  from_user_id UUID REFERENCES auth.users(id) NOT NULL,
  client_id UUID REFERENCES public.fanc_clients(id) NOT NULL,
  method VARCHAR(50) NOT NULL,
  direction VARCHAR(20) NOT NULL,
  subject VARCHAR(255),
  content TEXT,
  status VARCHAR(50) DEFAULT 'sent',
  property_id UUID REFERENCES public.fanc_properties(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb
);

-- 6. DRIP CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.fanc_drip_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  trigger_type VARCHAR(50),
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.fanc_drip_campaign_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  campaign_id UUID REFERENCES public.fanc_drip_campaigns(id) NOT NULL,
  client_id UUID REFERENCES public.fanc_clients(id) NOT NULL,
  current_step INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  next_send_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(campaign_id, client_id)
);

-- 7. PROPERTY SHARES
CREATE TABLE IF NOT EXISTS public.fanc_property_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  property_id UUID REFERENCES public.fanc_properties(id) NOT NULL,
  shared_by UUID REFERENCES auth.users(id) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  share_url TEXT,
  share_text TEXT,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0
);

-- 8. SAVED PROPERTIES
CREATE TABLE IF NOT EXISTS public.fanc_saved_properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  client_id UUID REFERENCES public.fanc_clients(id) NOT NULL,
  property_id UUID REFERENCES public.fanc_properties(id) NOT NULL,
  notes TEXT,
  UNIQUE(client_id, property_id)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_fanc_user_profiles_role ON public.fanc_user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_fanc_user_profiles_active ON public.fanc_user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_fanc_properties_status ON public.fanc_properties(status);
CREATE INDEX IF NOT EXISTS idx_fanc_properties_city ON public.fanc_properties(city);
CREATE INDEX IF NOT EXISTS idx_fanc_properties_state ON public.fanc_properties(state);
CREATE INDEX IF NOT EXISTS idx_fanc_properties_price ON public.fanc_properties(price);
CREATE INDEX IF NOT EXISTS idx_fanc_properties_listing_type ON public.fanc_properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_fanc_properties_featured ON public.fanc_properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_fanc_properties_slug ON public.fanc_properties(slug);
CREATE INDEX IF NOT EXISTS idx_fanc_clients_email ON public.fanc_clients(email);
CREATE INDEX IF NOT EXISTS idx_fanc_clients_status ON public.fanc_clients(status);
CREATE INDEX IF NOT EXISTS idx_fanc_clients_assigned_broker ON public.fanc_clients(assigned_broker_id);
CREATE INDEX IF NOT EXISTS idx_fanc_clients_source ON public.fanc_clients(source);
CREATE INDEX IF NOT EXISTS idx_fanc_clients_priority ON public.fanc_clients(priority);
CREATE INDEX IF NOT EXISTS idx_fanc_clients_created_at ON public.fanc_clients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fanc_events_type ON public.fanc_events(event_type);
CREATE INDEX IF NOT EXISTS idx_fanc_events_category ON public.fanc_events(event_category);
CREATE INDEX IF NOT EXISTS idx_fanc_events_actor ON public.fanc_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_fanc_events_client ON public.fanc_events(client_id);
CREATE INDEX IF NOT EXISTS idx_fanc_events_property ON public.fanc_events(property_id);
CREATE INDEX IF NOT EXISTS idx_fanc_events_created_at ON public.fanc_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fanc_communications_client ON public.fanc_communications(client_id);
CREATE INDEX IF NOT EXISTS idx_fanc_communications_from_user ON public.fanc_communications(from_user_id);
CREATE INDEX IF NOT EXISTS idx_fanc_communications_method ON public.fanc_communications(method);
CREATE INDEX IF NOT EXISTS idx_fanc_communications_created_at ON public.fanc_communications(created_at DESC);

-- ROW LEVEL SECURITY
ALTER TABLE public.fanc_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_drip_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_drip_campaign_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_property_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fanc_saved_properties ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR USER PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.fanc_user_profiles;
CREATE POLICY "Users can view own profile" ON public.fanc_user_profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.fanc_user_profiles;
CREATE POLICY "Users can update own profile" ON public.fanc_user_profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.fanc_user_profiles;
CREATE POLICY "Admins can view all profiles" ON public.fanc_user_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.fanc_user_profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.fanc_user_profiles;
CREATE POLICY "Admins can manage all profiles" ON public.fanc_user_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.fanc_user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS POLICIES FOR PROPERTIES
DROP POLICY IF EXISTS "Anyone can view active properties" ON public.fanc_properties;
CREATE POLICY "Anyone can view active properties" ON public.fanc_properties FOR SELECT USING (true);

DROP POLICY IF EXISTS "Brokers and admins can manage properties" ON public.fanc_properties;
CREATE POLICY "Brokers and admins can manage properties" ON public.fanc_properties FOR ALL USING (
  EXISTS (SELECT 1 FROM public.fanc_user_profiles WHERE id = auth.uid() AND role IN ('broker', 'admin'))
);

-- RLS POLICIES FOR CLIENTS
DROP POLICY IF EXISTS "Clients can view own record" ON public.fanc_clients;
CREATE POLICY "Clients can view own record" ON public.fanc_clients FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Brokers can view assigned clients" ON public.fanc_clients;
CREATE POLICY "Brokers can view assigned clients" ON public.fanc_clients FOR SELECT USING (
  assigned_broker_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.fanc_user_profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins and brokers can manage clients" ON public.fanc_clients;
CREATE POLICY "Admins and brokers can manage clients" ON public.fanc_clients FOR ALL USING (
  EXISTS (SELECT 1 FROM public.fanc_user_profiles WHERE id = auth.uid() AND role IN ('broker', 'admin'))
);

-- RLS POLICIES FOR EVENTS
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.fanc_events;
CREATE POLICY "Authenticated users can create events" ON public.fanc_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view own events" ON public.fanc_events;
CREATE POLICY "Users can view own events" ON public.fanc_events FOR SELECT USING (actor_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all events" ON public.fanc_events;
CREATE POLICY "Admins can view all events" ON public.fanc_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.fanc_user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS POLICIES FOR COMMUNICATIONS
DROP POLICY IF EXISTS "Users can view related communications" ON public.fanc_communications;
CREATE POLICY "Users can view related communications" ON public.fanc_communications FOR SELECT USING (
  from_user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.fanc_clients WHERE id = fanc_communications.client_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.fanc_user_profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Brokers and admins can create communications" ON public.fanc_communications;
CREATE POLICY "Brokers and admins can create communications" ON public.fanc_communications FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.fanc_user_profiles WHERE id = auth.uid() AND role IN ('broker', 'admin'))
);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_fanc_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_fanc_user_profiles_updated_at ON public.fanc_user_profiles;
CREATE TRIGGER update_fanc_user_profiles_updated_at BEFORE UPDATE ON public.fanc_user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_fanc_updated_at_column();

DROP TRIGGER IF EXISTS update_fanc_properties_updated_at ON public.fanc_properties;
CREATE TRIGGER update_fanc_properties_updated_at BEFORE UPDATE ON public.fanc_properties
  FOR EACH ROW EXECUTE FUNCTION update_fanc_updated_at_column();

DROP TRIGGER IF EXISTS update_fanc_clients_updated_at ON public.fanc_clients;
CREATE TRIGGER update_fanc_clients_updated_at BEFORE UPDATE ON public.fanc_clients
  FOR EACH ROW EXECUTE FUNCTION update_fanc_updated_at_column();

DROP TRIGGER IF EXISTS update_fanc_drip_campaigns_updated_at ON public.fanc_drip_campaigns;
CREATE TRIGGER update_fanc_drip_campaigns_updated_at BEFORE UPDATE ON public.fanc_drip_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_fanc_updated_at_column();
