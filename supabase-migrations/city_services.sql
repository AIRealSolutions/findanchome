-- Create city_services table
CREATE TABLE IF NOT EXISTS city_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name VARCHAR(255) NOT NULL,
  county VARCHAR(255) NOT NULL,
  service_type VARCHAR(50) NOT NULL, -- 'power', 'water', 'trash', 'internet'
  provider_name VARCHAR(255) NOT NULL,
  website_url VARCHAR(500),
  phone_number VARCHAR(20),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(city_name, county, service_type, provider_name)
);

-- Create business_partners table
CREATE TABLE IF NOT EXISTS business_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name VARCHAR(255) NOT NULL,
  county VARCHAR(255) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- e.g., 'Real Estate', 'Restaurant', 'Retail', 'Services', etc.
  description TEXT,
  website_url VARCHAR(500),
  phone_number VARCHAR(20),
  email VARCHAR(255),
  address VARCHAR(255),
  image_url VARCHAR(500),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_city_services_city_county ON city_services(city_name, county);
CREATE INDEX idx_city_services_service_type ON city_services(service_type);
CREATE INDEX idx_business_partners_city_county ON business_partners(city_name, county);
CREATE INDEX idx_business_partners_category ON business_partners(category);

-- Enable Row Level Security
ALTER TABLE city_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_partners ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view active city services
CREATE POLICY "city_services_public_select" ON city_services
  FOR SELECT
  USING (is_active = true);

-- RLS Policy: Only authenticated users (admins) can insert/update/delete city services
CREATE POLICY "city_services_admin_insert" ON city_services
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "city_services_admin_update" ON city_services
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "city_services_admin_delete" ON city_services
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- RLS Policy: Anyone can view active business partners
CREATE POLICY "business_partners_public_select" ON business_partners
  FOR SELECT
  USING (is_active = true);

-- RLS Policy: Only authenticated users (admins) can insert/update/delete business partners
CREATE POLICY "business_partners_admin_insert" ON business_partners
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "business_partners_admin_update" ON business_partners
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "business_partners_admin_delete" ON business_partners
  FOR DELETE
  USING (auth.role() = 'authenticated');
