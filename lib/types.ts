export type UserRole = 'end_user' | 'broker' | 'admin'

export type PropertyStatus = 'active' | 'pending' | 'sold' | 'withdrawn'

export type PropertyProgram = 'conventional' | 'hud' | 'reo' | 'foreclosure' | 'va' | 'fha'

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'showing' | 'offer' | 'closed' | 'lost'

export type LeadSource = 'website' | 'referral' | 'social_media' | 'advertising' | 'other'

export interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  user_id: string
  license_name: string
  license_number: string | null
  bio: string | null
  photo_url: string | null
  phone: string | null
  email: string | null
  states: string[] // States where agent does business
  communities: string[] | null
  specialties: string[] | null
  years_experience: number | null
  properties_sold: number | null
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  title: string
  description: string | null
  price: string // numeric stored as string
  address: string
  city: string
  state: string
  zip: string
  latitude: string | null
  longitude: string | null
  bedrooms: number | null
  bathrooms: number | null
  sqft: number | null
  lot_size: number | null
  year_built: number | null
  property_type: string | null
  status: PropertyStatus
  program_type: PropertyProgram
  primary_image_url: string | null
  images: string[] | null
  features: string[] | null
  hud_case_number: string | null
  hud_bid_open_date: string | null
  hud_bid_close_date: string | null
  is_owner_occupant: boolean
  repair_escrow: string | null
  agent_id: string | null
  community_ids: string[] | null
  created_at: string
  updated_at: string
}

export interface Community {
  id: string
  name: string
  slug: string
  state: string
  county: string | null
  description: string | null
  excerpt: string | null
  image_url: string | null
  population: number | null
  median_home_price: string | null
  schools_rating: number | null
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  status: LeadStatus
  source: LeadSource
  interested_in_state: string | null
  budget_min: string | null
  budget_max: string | null
  bedrooms_min: number | null
  notes: string | null
  assigned_broker_id: string | null
  accepted_by_broker: boolean
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  lead_id: string | null
  name: string
  email: string
  phone: string | null
  address: string | null
  broker_id: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  lead_id: string | null
  client_id: string | null
  broker_id: string
  activity_type: 'call' | 'email' | 'text' | 'meeting' | 'showing' | 'note'
  description: string
  result: string | null
  created_at: string
}

export interface NewsArticle {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  image_url: string | null
  community_ids: string[] | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  location: string | null
  start_date: string
  end_date: string | null
  community_ids: string[] | null
  created_at: string
  updated_at: string
}
