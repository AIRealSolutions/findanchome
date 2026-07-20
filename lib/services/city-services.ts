import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface CityService {
  id?: string;
  city_name: string;
  county: string;
  service_type: 'power' | 'water' | 'trash' | 'internet';
  provider_name: string;
  website_url?: string;
  phone_number?: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessPartner {
  id?: string;
  city_name: string;
  county: string;
  business_name: string;
  category: string;
  description?: string;
  website_url?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  image_url?: string;
  is_featured?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const cityServicesService = {
  // Get services for a specific city
  async getServicesByCity(cityName: string, county: string) {
    const { data, error } = await supabase
      .from('city_services')
      .select('*')
      .eq('city_name', cityName)
      .eq('county', county)
      .eq('is_active', true)
      .order('service_type', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get all services grouped by type
  async getServicesByType(cityName: string, county: string) {
    const services = await this.getServicesByCity(cityName, county);
    return services.reduce((acc, service) => {
      if (!acc[service.service_type]) {
        acc[service.service_type] = [];
      }
      acc[service.service_type].push(service);
      return acc;
    }, {} as Record<string, CityService[]>);
  },

  // Get all services for admin
  async getAllServices(limit = 50, offset = 0, filters?: Record<string, any>) {
    let query = supabase
      .from('city_services')
      .select('*', { count: 'exact' })
      .order('city_name', { ascending: true });

    if (filters?.city_name) {
      query = query.eq('city_name', filters.city_name);
    }
    if (filters?.county) {
      query = query.eq('county', filters.county);
    }
    if (filters?.service_type) {
      query = query.eq('service_type', filters.service_type);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  },

  // Create a new service
  async createService(service: CityService) {
    const { data, error } = await supabase
      .from('city_services')
      .insert([service])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a service
  async updateService(serviceId: string, updates: Partial<CityService>) {
    const { data, error } = await supabase
      .from('city_services')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', serviceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a service
  async deleteService(serviceId: string) {
    const { error } = await supabase
      .from('city_services')
      .delete()
      .eq('id', serviceId);

    if (error) throw error;
  },

  // Bulk create services
  async bulkCreateServices(services: CityService[]) {
    const { data, error } = await supabase
      .from('city_services')
      .insert(services)
      .select();

    if (error) throw error;
    return data;
  },
};

export const businessPartnersService = {
  // Get business partners for a specific city
  async getPartnersByCity(cityName: string, county: string, featured = false) {
    let query = supabase
      .from('business_partners')
      .select('*')
      .eq('city_name', cityName)
      .eq('county', county)
      .eq('is_active', true);

    if (featured) {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query.order('is_featured', { ascending: false }).order('business_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get business partners by category
  async getPartnersByCategory(cityName: string, county: string, category: string) {
    const { data, error } = await supabase
      .from('business_partners')
      .select('*')
      .eq('city_name', cityName)
      .eq('county', county)
      .eq('category', category)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('business_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get all partners for admin
  async getAllPartners(limit = 50, offset = 0, filters?: Record<string, any>) {
    let query = supabase
      .from('business_partners')
      .select('*', { count: 'exact' })
      .order('city_name', { ascending: true });

    if (filters?.city_name) {
      query = query.eq('city_name', filters.city_name);
    }
    if (filters?.county) {
      query = query.eq('county', filters.county);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  },

  // Create a new business partner
  async createPartner(partner: BusinessPartner) {
    const { data, error } = await supabase
      .from('business_partners')
      .insert([partner])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a business partner
  async updatePartner(partnerId: string, updates: Partial<BusinessPartner>) {
    const { data, error } = await supabase
      .from('business_partners')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', partnerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a business partner
  async deletePartner(partnerId: string) {
    const { error } = await supabase
      .from('business_partners')
      .delete()
      .eq('id', partnerId);

    if (error) throw error;
  },

  // Bulk create partners
  async bulkCreatePartners(partners: BusinessPartner[]) {
    const { data, error } = await supabase
      .from('business_partners')
      .insert(partners)
      .select();

    if (error) throw error;
    return data;
  },
};
