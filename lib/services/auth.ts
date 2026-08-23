import { createClient } from '@supabase/supabase-js';

// Use consistent env var name for anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'broker' | 'user';
  phone?: string;
  avatar_url?: string;
  created_at?: string;
}

export const authService = {
  // Sign up
  async signUp(email: string, password: string, userData: Partial<AuthUser>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: data.user.id,
            first_name: userData.full_name?.split(' ')[0] || '',
            last_name: userData.full_name?.split(' ').slice(1).join(' ') || '',
            role: userData.role || 'user',
            phone: userData.phone,
            avatar_url: userData.avatar_url,
          },
        ]);

      if (profileError) throw profileError;
    }

    return data;
  },

  // Sign in
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error) throw error;

    if (data.user) {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      return { ...data.user, ...profile } as AuthUser;
    }

    return null;
  },

  // Get user profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as AuthUser;
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<AuthUser>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all users (admin only)
  async getAllUsers() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get brokers
  async getBrokers() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'broker');

    if (error) throw error;
    return data;
  },

  // Create new user (admin only)
  async createUser(email: string, password: string, userData: Partial<AuthUser>) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: data.user.id,
            first_name: userData.full_name?.split(' ')[0] || '',
            last_name: userData.full_name?.split(' ').slice(1).join(' ') || '',
            role: userData.role || 'broker',
            phone: userData.phone,
            avatar_url: userData.avatar_url,
          },
        ]);

      if (profileError) throw profileError;
    }

    return data;
  },

  // Check if user is admin
  async isAdmin(userId?: string) {
    if (!userId) {
      const user = await this.getCurrentUser();
      userId = user?.id;
    }

    if (!userId) return false;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) return false;
    return data?.role === 'admin';
  },

  // Check if user is broker
  async isBroker(userId?: string) {
    if (!userId) {
      const user = await this.getCurrentUser();
      userId = user?.id;
    }

    if (!userId) return false;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) return false;
    return ['admin', 'broker'].includes(data?.role);
  },
};
