'use client';

// Everything the admin departments read, loaded once and shared by every department page.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { DealTask } from '@/lib/deals';
import { closedDealMoney, fetchFinance, periodRange, planLookup, type FinanceData } from '@/lib/finance';
import { OPEN_STAGES } from '@/lib/deals';
import { TOUCH_KINDS, type ListingOpportunity } from '@/lib/listings';

export interface BrokerRecord {
  broker_id: string;
  license_number: string | null;
  license_status: 'broker' | 'provisional_broker' | 'bic' | 'inactive' | null;
  license_expires: string | null;
  ce_completed_on: string | null;
  eo_carrier: string | null;
  eo_expires: string | null;
  start_date: string | null;
  ica_signed: boolean;
  w9_on_file: boolean;
  emergency_contact: string | null;
  notes: string | null;
}

export type GoalMetric = 'units' | 'volume' | 'gci' | 'company_dollar' | 'net_profit' | 'listings_won';
export interface Goal { id: string; year: number; broker_id: string | null; metric: GoalMetric; target: number }

export interface AdminData {
  finance: FinanceData;
  leads: { created_at: string; status: string; source_page: string | null; intent: string[] }[];
  opps: Pick<ListingOpportunity, 'id' | 'created_at' | 'updated_at' | 'stage' | 'review_status' | 'assigned_to' | 'source' | 'requested_broker_id' | 'last_contacted_at'
    | 'created_by' | 'created_by_role' | 'created_by_name' | 'owner_name' | 'property_address' | 'city' | 'priority' | 'follow_up_at'>[];
  touches: { created_at: string; author_id: string | null }[];
  profiles: { id: string; role: string; first_name: string | null; last_name: string | null; is_active: boolean; phone: string | null; broker_license: string | null }[];
  records: BrokerRecord[];
  goals: Goal[];
  posts: { broker_id: string; status: string; posted_at: string | null; created_at: string }[];
  openTasks: DealTask[];
  members: { deal_id: string; user_id: string | null }[];
  clientsCreated: { created_at: string; source: string | null }[];
  /** Latest workspace posts, for "gone quiet" checks. */
  dealPosts: { deal_id: string; created_at: string; author_role: string }[];
}

async function load(): Promise<AdminData> {
  const supabase = createClient();
  const since = new Date(+periodRange('last_year').from.slice(0, 4), 0, 1).toISOString();
  const finance = await fetchFinance();
  const openIds = finance.deals.filter((d) => OPEN_STAGES.includes(d.stage)).map((d) => d.id);
  const [leads, opps, touches, profiles, records, goals, posts, members, clients, dealPosts, ...taskPages] = await Promise.all([
    supabase.from('fanc_consultation_requests').select('created_at, status, source_page, intent').gte('created_at', since).limit(5000),
    supabase.from('fanc_listing_opportunities').select('id, created_at, updated_at, stage, review_status, assigned_to, source, requested_broker_id, last_contacted_at, created_by, created_by_role, created_by_name, owner_name, property_address, city, priority, follow_up_at').limit(5000),
    supabase.from('fanc_listing_activity').select('created_at, author_id').in('kind', TOUCH_KINDS).gte('created_at', since).limit(10000),
    supabase.from('fanc_user_profiles').select('id, role, first_name, last_name, is_active, phone, broker_license').order('role').limit(1000),
    supabase.from('fanc_broker_records').select('*'),
    supabase.from('fanc_goals').select('*'),
    supabase.from('fanc_marketing_posts').select('broker_id, status, posted_at, created_at').gte('created_at', since).limit(5000),
    supabase.from('fanc_deal_members').select('deal_id, user_id').limit(5000),
    supabase.from('fanc_clients').select('created_at, source').gte('created_at', since).limit(10000),
    supabase.from('fanc_deal_posts').select('deal_id, created_at, author_role').order('created_at', { ascending: false }).limit(5000),
    ...Array.from({ length: Math.ceil(openIds.length / 100) }, (_, i) =>
      supabase.from('fanc_deal_tasks').select('*').in('deal_id', openIds.slice(i * 100, i * 100 + 100)).is('done_at', null).limit(10000)),
  ]);
  return {
    finance,
    leads: (leads.data ?? []) as AdminData['leads'],
    opps: (opps.data ?? []) as AdminData['opps'],
    touches: (touches.data ?? []) as AdminData['touches'],
    profiles: (profiles.data ?? []) as AdminData['profiles'],
    records: (records.data ?? []) as BrokerRecord[],
    goals: ((goals.data ?? []) as Goal[]).map((g) => ({ ...g, target: Number(g.target) })),
    posts: (posts.data ?? []) as AdminData['posts'],
    openTasks: taskPages.flatMap((p) => (p.data ?? []) as DealTask[]),
    members: (members.data ?? []) as AdminData['members'],
    clientsCreated: (clients.data ?? []) as AdminData['clientsCreated'],
    dealPosts: (dealPosts.data ?? []) as AdminData['dealPosts'],
  };
}

export function useAdminData() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    return load().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    load().then((d) => {
      if (cancelled) return;
      setData(d);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const derived = useMemo(() => {
    if (!data) return null;
    const roles = new Map(data.finance.staff.map((s) => [s.id, s.role]));
    const plan = planLookup(data.finance.plans, roles);
    return { plan, dm: closedDealMoney(data.finance.deals, plan) };
  }, [data]);

  return { data, derived, loading, reload };
}

export type AdminContext = NonNullable<ReturnType<typeof useAdminData>['data']> & NonNullable<ReturnType<typeof useAdminData>['derived']> & {
  from: string;
  to: string;
  periodLabel: string;
  broker?: string;
  nameOf: (id: string | null) => string;
  inPeriod: (iso: string | null) => boolean;
  reload: () => Promise<void>;
  setBroker: (id: string) => void;
};
