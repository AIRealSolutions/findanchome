-- =====================================================
-- FINDANCHOME.COM - COMPLETE DATABASE SCHEMA
-- Role-Based Authentication & CRM System
-- =====================================================

-- =====================================================
-- 1. USERS & AUTHENTICATION
-- =====================================================

-- Extend Supabase auth.users with custom profile data
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Role: client, broker, admin
  role VARCHAR(20) DEFAULT 'client' NOT NULL CHECK (role IN ('client', 'broker', 'admin')),
  
  -- Profile Information
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  avatar_url TEXT,
  
  -- Broker-specific fields
  broker_license VARCHAR(100),
  broker_state VARCHAR(2),
  broker_bio TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 2. PROPERTIES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  
  -- Property Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_type VARCHAR(50), -- single_family, condo, townhouse, land, manufactured
  listing_type VARCHAR(50) DEFAULT 'standard', -- standard, hud, reo, foreclosure
  
  -- Location
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) DEFAULT 'NC' NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  county VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Property Features
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  square_feet INTEGER,
  lot_size DECIMAL(10, 2),
  year_built INTEGER,
  
  -- Pricing
  price DECIMAL(12, 2) NOT NULL,
  original_price DECIMAL(12, 2),
  hud_case_number VARCHAR(50),
  
  -- Media
  images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
  virtual_tour_url TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, pending, sold, withdrawn
  is_featured BOOLEAN DEFAULT false,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  slug VARCHAR(255) UNIQUE,
  
  -- Additional Details
  amenities JSONB DEFAULT '[]'::jsonb,
  notes TEXT
);

-- =====================================================
-- 3. CLIENTS (CRM)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Client Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  secondary_phone VARCHAR(50),
  
  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  
  -- Lead Information
  source VARCHAR(100), -- website, facebook, referral, etc.
  status VARCHAR(50) DEFAULT 'new', -- new, contacted, qualified, active, closed, inactive
  lead_type VARCHAR(50), -- buyer, seller, both
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  
  -- Assignment
  assigned_broker_id UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  accepted_by_broker BOOLEAN DEFAULT false,
  accepted_at TIMESTAMP WITH TIME ZONE,
  
  -- Preferences (for buyers)
  budget_min DECIMAL(12, 2),
  budget_max DECIMAL(12, 2),
  preferred_locations JSONB DEFAULT '[]'::jsonb,
  property_types JSONB DEFAULT '[]'::jsonb,
  min_bedrooms INTEGER,
  min_bathrooms DECIMAL(3, 1),
  interested_in_hud BOOLEAN DEFAULT false,
  interested_in_reo BOOLEAN DEFAULT false,
  
  -- Seller Information
  property_address TEXT,
  estimated_value DECIMAL(12, 2),
  selling_timeline VARCHAR(50),
  
  -- Onboarding
  onboarding_status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  buyer_agreement_signed BOOLEAN DEFAULT false,
  buyer_agreement_signed_at TIMESTAMP WITH TIME ZONE,
  
  -- Tags and Notes
  tags JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  
  -- Linked user account (if client creates account)
  user_id UUID REFERENCES auth.users(id)
);

-- =====================================================
-- 4. EVENTS (Action Logging)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Event Type
  event_type VARCHAR(100) NOT NULL, -- login, property_created, property_updated, client_created, email_sent, text_sent, call_made, etc.
  event_category VARCHAR(50), -- auth, property, client, communication, system
  
  -- Actor (who performed the action)
  actor_id UUID REFERENCES auth.users(id),
  actor_role VARCHAR(20),
  
  -- Target (what was affected)
  target_type VARCHAR(50), -- property, client, user, etc.
  target_id UUID,
  
  -- Related entities
  client_id UUID REFERENCES public.clients(id),
  property_id UUID REFERENCES public.properties(id),
  
  -- Event Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional structured data
  
  -- Communication-specific fields
  communication_method VARCHAR(50), -- email, text, call, social_media
  communication_status VARCHAR(50), -- sent, delivered, failed, answered, no_answer
  communication_content TEXT,
  
  -- IP and User Agent
  ip_address VARCHAR(50),
  user_agent TEXT
);

-- =====================================================
-- 5. COMMUNICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.communications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Participants
  from_user_id UUID REFERENCES auth.users(id) NOT NULL,
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  
  -- Communication Details
  method VARCHAR(50) NOT NULL, -- email, text, call, social_media
  direction VARCHAR(20) NOT NULL, -- outbound, inbound
  subject VARCHAR(255),
  content TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'sent', -- sent, delivered, read, failed, answered, no_answer
  
  -- Related Property
  property_id UUID REFERENCES public.properties(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb
);

-- =====================================================
-- 6. DRIP CAMPAIGNS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.drip_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Campaign Details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Trigger
  trigger_type VARCHAR(50), -- new_lead, property_view, no_response, etc.
  
  -- Steps (array of email/text templates with delays)
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.drip_campaign_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Campaign and Client
  campaign_id UUID REFERENCES public.drip_campaigns(id) NOT NULL,
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  
  -- Progress
  current_step INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- active, paused, completed, cancelled
  
  -- Tracking
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  next_send_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(campaign_id, client_id)
);

-- =====================================================
-- 7. PROPERTY SHARES (Social Media Tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.property_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Property and User
  property_id UUID REFERENCES public.properties(id) NOT NULL,
  shared_by UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Platform
  platform VARCHAR(50) NOT NULL, -- facebook, twitter, instagram, linkedin
  
  -- Share Details
  share_url TEXT,
  share_text TEXT,
  
  -- Tracking
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0
);

-- =====================================================
-- 8. SAVED PROPERTIES (Client Favorites)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.saved_properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Client and Property
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  property_id UUID REFERENCES public.properties(id) NOT NULL,
  
  -- Notes
  notes TEXT,
  
  UNIQUE(client_id, property_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- User Profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON public.user_profiles(is_active);

-- Properties
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_state ON public.properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug);

-- Clients
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_assigned_broker ON public.clients(assigned_broker_id);
CREATE INDEX IF NOT EXISTS idx_clients_source ON public.clients(source);
CREATE INDEX IF NOT EXISTS idx_clients_priority ON public.clients(priority);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients(created_at DESC);

-- Events
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(event_category);
CREATE INDEX IF NOT EXISTS idx_events_actor ON public.events(actor_id);
CREATE INDEX IF NOT EXISTS idx_events_client ON public.events(client_id);
CREATE INDEX IF NOT EXISTS idx_events_property ON public.events(property_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at DESC);

-- Communications
CREATE INDEX IF NOT EXISTS idx_communications_client ON public.communications(client_id);
CREATE INDEX IF NOT EXISTS idx_communications_from_user ON public.communications(from_user_id);
CREATE INDEX IF NOT EXISTS idx_communications_method ON public.communications(method);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON public.communications(created_at DESC);

-- Drip Campaigns
CREATE INDEX IF NOT EXISTS idx_drip_enrollments_client ON public.drip_campaign_enrollments(client_id);
CREATE INDEX IF NOT EXISTS idx_drip_enrollments_campaign ON public.drip_campaign_enrollments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_drip_enrollments_status ON public.drip_campaign_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_drip_enrollments_next_send ON public.drip_campaign_enrollments(next_send_at);

-- Property Shares
CREATE INDEX IF NOT EXISTS idx_property_shares_property ON public.property_shares(property_id);
CREATE INDEX IF NOT EXISTS idx_property_shares_user ON public.property_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_property_shares_platform ON public.property_shares(platform);

-- Saved Properties
CREATE INDEX IF NOT EXISTS idx_saved_properties_client ON public.saved_properties(client_id);
CREATE INDEX IF NOT EXISTS idx_saved_properties_property ON public.saved_properties(property_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drip_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drip_campaign_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Properties Policies
CREATE POLICY "Anyone can view active properties" ON public.properties
  FOR SELECT USING (status = 'active');

CREATE POLICY "Brokers and admins can manage properties" ON public.properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('broker', 'admin')
    )
  );

-- Clients Policies
CREATE POLICY "Clients can view own record" ON public.clients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Brokers can view assigned clients" ON public.clients
  FOR SELECT USING (
    assigned_broker_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins and brokers can manage clients" ON public.clients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('broker', 'admin')
    )
  );

-- Events Policies
CREATE POLICY "Users can view own events" ON public.events
  FOR SELECT USING (actor_id = auth.uid());

CREATE POLICY "Admins can view all events" ON public.events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Communications Policies
CREATE POLICY "Users can view related communications" ON public.communications
  FOR SELECT USING (
    from_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE id = communications.client_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Brokers and admins can create communications" ON public.communications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('broker', 'admin')
    )
  );

-- Drip Campaigns Policies
CREATE POLICY "Brokers and admins can manage campaigns" ON public.drip_campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('broker', 'admin')
    )
  );

CREATE POLICY "Brokers and admins can manage enrollments" ON public.drip_campaign_enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('broker', 'admin')
    )
  );

-- Property Shares Policies
CREATE POLICY "Users can view own shares" ON public.property_shares
  FOR SELECT USING (shared_by = auth.uid());

CREATE POLICY "Brokers and admins can create shares" ON public.property_shares
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('broker', 'admin')
    )
  );

-- Saved Properties Policies
CREATE POLICY "Clients can manage own saved properties" ON public.saved_properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE id = saved_properties.client_id AND user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drip_campaigns_updated_at BEFORE UPDATE ON public.drip_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, role)
  VALUES (NEW.id, 'client');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- Insert admin user profile (you'll need to create the auth user first via Supabase dashboard)
-- INSERT INTO public.user_profiles (id, role, first_name, last_name, phone)
-- VALUES ('your-admin-user-id-here', 'admin', 'Marc', 'Spencer', '(910) 363-6147');
