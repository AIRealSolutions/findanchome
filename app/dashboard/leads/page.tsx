'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Download, RefreshCw, Phone, MessageCircle, Mail, CalendarClock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { COUNTY_NAMES, type CountySlug } from '@/lib/lifestyles';
import { INTENT_OPTIONS } from '@/lib/consultation';
import {
  STATUSES,
  dialable,
  followUpState,
  isOpen,
  labels,
  leadsToCsv,
  priorityMeta,
  relativeTime,
  statusMeta,
  type Lead,
  type LeadStatus,
} from '@/lib/leads';

type View = 'open' | 'due' | LeadStatus | 'all';

async function fetchLeads() {
  const { data, error } = await createClient()
    .from('fanc_consultation_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);
  return { leads: (data ?? []) as Lead[], error: error?.message ?? '' };
}

export default function LeadsPage() {
  const router = useRouter();
  const { isAdmin, isBroker, loading: authLoading } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<View>('open');
  const [search, setSearch] = useState('');
  const [county, setCounty] = useState('');
  const [intent, setIntent] = useState('');

  const apply = useCallback((result: Awaited<ReturnType<typeof fetchLeads>>) => {
    setError(result.error);
    if (!result.error) setLeads(result.leads);
    setLoading(false);
  }, []);

  const load = () => {
    setLoading(true);
    fetchLeads().then(apply);
  };

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    fetchLeads().then((r) => !cancelled && apply(r));
    return () => {
      cancelled = true;
    };
  }, [authLoading, apply]);

  const now = useMemo(() => new Date(), [leads]); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      new: leads.filter((l) => l.status === 'new').length,
      due: leads.filter((l) => {
        const s = followUpState(l, now);
        return s === 'overdue' || s === 'today';
      }).length,
      scheduled: leads.filter((l) => l.status === 'scheduled').length,
      thisMonth: leads.filter((l) => new Date(l.created_at) >= monthStart).length,
    };
  }, [leads, now]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const digits = q.replace(/\D/g, '');
    const list = leads.filter((l) => {
      if (view === 'open' && !isOpen(l)) return false;
      if (view === 'due') {
        const s = followUpState(l, now);
        if (s !== 'overdue' && s !== 'today') return false;
      }
      if (view !== 'open' && view !== 'due' && view !== 'all' && l.status !== view) return false;
      if (county && !l.counties.includes(county)) return false;
      if (intent && !l.intent.includes(intent)) return false;
      if (q) {
        const hay = `${l.name} ${l.email} ${l.message ?? ''}`.toLowerCase();
        const phoneMatch = digits.length >= 3 && (l.phone ?? '').replace(/\D/g, '').includes(digits);
        if (!hay.includes(q) && !phoneMatch) return false;
      }
      return true;
    });
    if (view === 'due') {
      list.sort((a, b) => new Date(a.follow_up_at!).getTime() - new Date(b.follow_up_at!).getTime());
    }
    return list;
  }, [leads, view, search, county, intent, now]);

  const exportCsv = () => {
    const blob = new Blob([leadsToCsv(filtered)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultation-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authLoading && !isAdmin && !isBroker) {
    return <p className="text-gray-600">Leads are available to brokers and admins.</p>;
  }

  const tabs: { value: View; label: string; count?: number }[] = [
    { value: 'open', label: 'Open', count: leads.filter(isOpen).length },
    { value: 'due', label: 'Follow-ups due', count: stats.due },
    ...STATUSES.map((s) => ({ value: s.value as View, label: s.label, count: leads.filter((l) => l.status === s.value).length })),
    { value: 'all', label: 'All', count: leads.length },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Consultation Leads</h1>
          <p className="mt-1 text-gray-600">Requests from the consultation form on FindaNChome.com.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={exportCsv} disabled={filtered.length === 0} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'New leads', value: stats.new, view: 'new' as View, className: 'text-blue-700' },
          { label: 'Follow-ups due', value: stats.due, view: 'due' as View, className: stats.due ? 'text-red-600' : 'text-gray-900' },
          { label: 'Appointments set', value: stats.scheduled, view: 'scheduled' as View, className: 'text-purple-700' },
          { label: 'Received this month', value: stats.thisMonth, view: 'all' as View, className: 'text-gray-900' },
        ].map((s) => (
          <button key={s.label} onClick={() => setView(s.view)} className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300">
            <div className={`text-2xl font-bold ${s.className}`}>{s.value}</div>
            <div className="text-sm text-gray-600">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setView(t.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm border ${
              view === t.value ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
            }`}
          >
            {t.label}{t.count !== undefined && <span className="ml-1 opacity-75">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone or message"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select value={county} onChange={(e) => setCounty(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
          <option value="">All counties</option>
          {(Object.keys(COUNTY_NAMES) as CountySlug[]).map((c) => <option key={c} value={c}>{COUNTY_NAMES[c]}</option>)}
        </select>
        <select value={intent} onChange={(e) => setIntent(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
          <option value="">All goals</option>
          {INTENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {loading && leads.length === 0 ? (
          <p className="p-8 text-center text-gray-500">Loading leads…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-gray-500">
            {leads.length === 0 ? 'No consultation requests yet. They will appear here as soon as someone submits the form.' : 'No leads match these filters.'}
          </p>
        ) : (
          filtered.map((l) => {
            const st = statusMeta(l.status);
            const pr = priorityMeta(l.priority);
            const fu = followUpState(l, now);
            const areas = [...labels('neighborhoods', l.neighborhoods), ...labels('communities', l.communities)];
            const areaText = areas.length ? areas.slice(0, 3).join(', ') + (areas.length > 3 ? ` +${areas.length - 3}` : '') : labels('counties', l.counties).join(', ');
            return (
              <div
                key={l.id}
                role="link"
                tabIndex={0}
                onClick={() => router.push(`/dashboard/leads/${l.id}`)}
                onKeyDown={(e) => e.key === 'Enter' && router.push(`/dashboard/leads/${l.id}`)}
                className="p-4 hover:bg-gray-50 cursor-pointer flex flex-col lg:flex-row lg:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Link href={`/dashboard/leads/${l.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-gray-900 hover:text-blue-600">
                      {l.name}
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${st.className}`}>{st.label}</span>
                    {l.priority !== 'warm' && <span className={`text-xs px-2 py-0.5 rounded-full ${pr.className}`}>{pr.label}</span>}
                    {fu === 'overdue' && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">Follow-up overdue</span>}
                    {fu === 'today' && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Follow up today</span>}
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {labels('intent', l.intent).join(', ') || 'Consultation'}
                    {areaText && <> · {areaText}</>}
                    {l.price_range && <> · {l.price_range}</>}
                    {l.timeframe && <> · {l.timeframe}</>}
                  </div>
                  {l.message && <div className="text-sm text-gray-500 truncate mt-0.5">“{l.message}”</div>}
                </div>
                <div className="flex items-center gap-3 lg:justify-end shrink-0">
                  <div className="text-xs text-gray-500 lg:text-right lg:w-36">
                    <div>Received {relativeTime(l.created_at, now)}</div>
                    {l.follow_up_at && isOpen(l) && (
                      <div className="flex items-center gap-1 lg:justify-end"><CalendarClock size={12} /> {relativeTime(l.follow_up_at, now)}</div>
                    )}
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    {l.phone && (
                      <>
                        <a href={`tel:${dialable(l.phone)}`} title={`Call ${l.phone}`} className="p-2 rounded-lg border border-gray-200 hover:bg-blue-50"><Phone size={16} /></a>
                        <a href={`sms:${dialable(l.phone)}`} title={`Text ${l.phone}`} className="p-2 rounded-lg border border-gray-200 hover:bg-blue-50"><MessageCircle size={16} /></a>
                      </>
                    )}
                    <a href={`mailto:${l.email}`} title={`Email ${l.email}`} className="p-2 rounded-lg border border-gray-200 hover:bg-blue-50"><Mail size={16} /></a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
