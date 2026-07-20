import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Lead {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  status: 'new' | 'contacted' | 'qualified' | 'scheduled' | 'offer_pending' | 'closed' | 'lost';
  county?: string;
  source?: string;
  interested_counties?: string[];
  interested_lifestyles?: string[];
  budget?: string;
  buyer_type?: string;
  assigned_to?: string;
  created_by: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  last_contacted_at?: string;
}

export const leadsService = {
  // Get all leads for a broker
  async getLeads(brokerId: string, limit = 50, offset = 0) {
    const { data, error, count } = await supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('assigned_to', brokerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  },

  // Get single lead
  async getLead(leadId: string) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new lead
  async createLead(lead: Lead) {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update lead
  async updateLead(leadId: string, updates: Partial<Lead>) {
    const { data, error } = await supabase
      .from('leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete lead
  async deleteLead(leadId: string) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);

    if (error) throw error;
  },

  // Get leads by status
  async getLeadsByStatus(brokerId: string, status: string) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('assigned_to', brokerId)
      .eq('status', status);

    if (error) throw error;
    return data;
  },

  // Search leads
  async searchLeads(brokerId: string, query: string) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('assigned_to', brokerId)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`);

    if (error) throw error;
    return data;
  },

  // Get all leads (admin only)
  async getAllLeads(limit = 100, offset = 0) {
    const { data, error, count } = await supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  },
};
