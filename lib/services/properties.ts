import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Property {
  id?: string;
  address: string;
  city: string;
  county: string;
  state?: string;
  zip_code?: string;
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  lot_size?: number;
  property_type?: string;
  status?: 'active' | 'pending' | 'sold' | 'inactive';
  description?: string;
  features?: Record<string, any>;
  images?: string[];
  mls_number?: string;
  agent_assigned_to?: string;
  created_at?: string;
  updated_at?: string;
}

export const propertiesService = {
  // Get all properties
  async getProperties(limit = 50, offset = 0, filters?: Record<string, any>) {
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.county) {
      query = query.eq('county', filters.county);
    }
    if (filters?.agent_assigned_to) {
      query = query.eq('agent_assigned_to', filters.agent_assigned_to);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  },

  // Get single property
  async getProperty(propertyId: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create property
  async createProperty(property: Property) {
    const { data, error } = await supabase
      .from('properties')
      .insert([property])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update property
  async updateProperty(propertyId: string, updates: Partial<Property>) {
    const { data, error } = await supabase
      .from('properties')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', propertyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete property
  async deleteProperty(propertyId: string) {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);

    if (error) throw error;
  },

  // Get properties by county
  async getPropertiesByCounty(county: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('county', county)
      .eq('status', 'active');

    if (error) throw error;
    return data;
  },

  // Search properties
  async searchProperties(query: string, county?: string) {
    let q = supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .or(`address.ilike.%${query}%,city.ilike.%${query}%`);

    if (county) {
      q = q.eq('county', county);
    }

    const { data, error } = await q;

    if (error) throw error;
    return data;
  },
};
