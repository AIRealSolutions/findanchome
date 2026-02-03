-- Create seller_requests table for CMA and appointment requests
CREATE TABLE IF NOT EXISTS seller_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Contact Information
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  property_address TEXT NOT NULL,
  
  -- Request Type
  request_type VARCHAR(50) NOT NULL, -- 'cma' or 'appointment'
  
  -- Additional Information
  message TEXT,
  
  -- Status for back office
  status VARCHAR(50) DEFAULT 'new', -- new, contacted, scheduled, completed, closed
  assigned_agent_id UUID,
  
  -- Metadata
  source VARCHAR(100) DEFAULT 'seller_page',
  ip_address VARCHAR(50),
  user_agent TEXT
);

-- Create indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_seller_requests_email ON seller_requests(email);
CREATE INDEX IF NOT EXISTS idx_seller_requests_status ON seller_requests(status);
CREATE INDEX IF NOT EXISTS idx_seller_requests_created_at ON seller_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seller_requests_type ON seller_requests(request_type);

-- Enable Row Level Security
ALTER TABLE seller_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone (for form submissions)
CREATE POLICY "Allow public insert" ON seller_requests
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow authenticated users to read all records (for admin)
CREATE POLICY "Allow authenticated read" ON seller_requests
  FOR SELECT
  USING (auth.role() = 'authenticated');
