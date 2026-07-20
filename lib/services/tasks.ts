import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Task {
  id?: string;
  title: string;
  description?: string;
  status?: 'pending' | 'completed' | 'overdue';
  priority?: 'high' | 'medium' | 'low';
  due_date: string;
  lead_id?: string;
  property_id?: string;
  assigned_to: string;
  created_by: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export const tasksService = {
  // Get tasks for a user
  async getTasks(userId: string, limit = 50, offset = 0) {
    const { data, error, count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('assigned_to', userId)
      .order('due_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  },

  // Get task
  async getTask(taskId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create task
  async createTask(task: Task) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update task
  async updateTask(taskId: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Complete task
  async completeTask(taskId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete task
  async deleteTask(taskId: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  },

  // Get overdue tasks
  async getOverdueTasks(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', userId)
      .eq('status', 'pending')
      .lt('due_date', today);

    if (error) throw error;
    return data;
  },

  // Get tasks for lead
  async getTasksForLead(leadId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('lead_id', leadId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  },
};
