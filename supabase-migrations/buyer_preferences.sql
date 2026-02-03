-- Create buyer_preferences table for collecting buyer analysis data
CREATE TABLE IF NOT EXISTS buyer_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Contact Information
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  
  -- Program Interests
  interested_in_hud_homes BOOLEAN DEFAULT false,
  interested_in_reo_properties BOOLEAN DEFAULT false,
  interested_in_conventional BOOLEAN DEFAULT false,
  interested_in_new_construction BOOLEAN DEFAULT false,
  
  -- Financing Programs
  interested_in_fha BOOLEAN DEFAULT false,
  interested_in_va BOOLEAN DEFAULT false,
  interested_in_usda BOOLEAN DEFAULT false,
  interested_in_conventional_loan BOOLEAN DEFAULT false,
  needs_down_payment_assistance BOOLEAN DEFAULT false,
  
  -- Property Type Preferences
  property_type_single_family BOOLEAN DEFAULT false,
  property_type_condo BOOLEAN DEFAULT false,
  property_type_townhouse BOOLEAN DEFAULT false,
  property_type_land BOOLEAN DEFAULT false,
  property_type_manufactured BOOLEAN DEFAULT false,
  
  -- Location Preferences (NC Regions)
  location_coastal BOOLEAN DEFAULT false,
  location_mountains BOOLEAN DEFAULT false,
  location_piedmont BOOLEAN DEFAULT false,
  location_triangle BOOLEAN DEFAULT false,
  location_charlotte BOOLEAN DEFAULT false,
  
  -- Specific Communities (optional text field)
  preferred_communities TEXT,
  
  -- Lifestyle Features
  lifestyle_waterfront BOOLEAN DEFAULT false,
  lifestyle_golf_community BOOLEAN DEFAULT false,
  lifestyle_rural BOOLEAN DEFAULT false,
  lifestyle_urban BOOLEAN DEFAULT false,
  lifestyle_suburban BOOLEAN DEFAULT false,
  lifestyle_retirement BOOLEAN DEFAULT false,
  
  -- Budget Range
  budget_min INTEGER,
  budget_max INTEGER,
  
  -- Bedroom/Bathroom Requirements
  bedrooms_min INTEGER,
  bathrooms_min DECIMAL(3,1),
  
  -- Timeline
  timeline VARCHAR(50), -- e.g., "immediate", "3-6 months", "6-12 months", "just browsing"
  
  -- First Time Buyer
  is_first_time_buyer BOOLEAN DEFAULT false,
  
  -- Additional Notes
  additional_notes TEXT,
  
  -- Status for back office
  status VARCHAR(50) DEFAULT 'new', -- new, contacted, qualified, closed
  assigned_agent_id UUID,
  
  -- Metadata
  source VARCHAR(100) DEFAULT 'buyer_preference_tool',
  ip_address VARCHAR(50),
  user_agent TEXT
);

-- Create index for quick lookups by email and status
CREATE INDEX IF NOT EXISTS idx_buyer_preferences_email ON buyer_preferences(email);
CREATE INDEX IF NOT EXISTS idx_buyer_preferences_status ON buyer_preferences(status);
CREATE INDEX IF NOT EXISTS idx_buyer_preferences_created_at ON buyer_preferences(created_at DESC);

-- Enable Row Level Security
ALTER TABLE buyer_preferences ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone (for form submissions)
CREATE POLICY "Allow public insert" ON buyer_preferences
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow authenticated users to read all records (for admin)
CREATE POLICY "Allow authenticated read" ON buyer_preferences
  FOR SELECT
  USING (auth.role() = 'authenticated');
