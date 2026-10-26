'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Download, RefreshCw, Phone, MessageCircle, Mail, Upload, Plus, Cake, Home } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import ClientBulkBar from '@/components/ClientBulkBar';
import { createClient } from '@/lib/supabase/client';
import { dialable, relativeTime } from '@/lib/leads';
import {
  CLIENT_STATUSES,
  clientName,
  clientStatusMeta,
  clientTypeLabel,
  clientsToCsv,
  downloadCsv,
  fetchAllClients,
  upcomingDates,
  type Client,
  type ClientStatus,
} from '@/lib/clients';

type View = ClientStatus | 'all' | 'dates' | 'dnc';

export default function ClientsPage() {
  const router = useRouter();
  const { user, profile, isAdmin, isBroker, loading: authLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<View>('all');
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const apply = useCallback((r: Awaited<ReturnType<typeof fetchAllClients>>) => {
    setError(r.error);
    if (!r.error) {
      setClients(r.clients);
      // Drop selections for clients that no longer exist (e.g. after a bulk delete).
      const ids = new Set(r.clients.map((c) => c.id));
      setSelectedIds((sel) => new Set([...sel].filter((id) => ids.has(id))));
    }
    setLoading(false);
  }, []);

  const load = () => {
    setLoading(true);
    fetchAllClients().then(apply);
  };

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    fetchAllClients().then((r) => !cancelled && apply(r));
    return () => {
      cancelled = true;
    };
  }, [authLoading, apply]);

  const now = useMemo(() => new Date(), [clients]); // eslint-disable-line react-hooks/exhaustive-deps

  const allTags = useMemo(() => [...new Set(clients.flatMap((c) => c.tags ?? []))].sort((a, b) => a.localeCompare(b)), [clients]);
  const datesSoon = useMemo(
    () => new Map(clients.map((c) => [c.id, upcomingDates(c, 30, now)] as const).filter(([, d]) => d.length > 0)),
    [clients, now],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const digits = q.replace(/\D/g, '');
    const list = clients.filter((c) => {
      if (view === 'dates' && !datesSoon.has(c.id)) return false;
      if (view === 'dnc' && !c.do_not_contact) return false;
      if (view !== 'all' && view !== 'dates' && view !== 'dnc' && c.status !== view) return false;
      if (tag && !(c.tags ?? []).includes(tag)) return false;
      if (q) {
        const hay = `${clientName(c)} ${c.spouse_name ?? ''} ${c.email ?? ''} ${c.secondary_email ?? ''} ${c.address_line1 ?? ''} ${c.city ?? ''} ${c.company ?? ''} ${(c.tags ?? []).join(' ')}`.toLowerCase();
        const phoneMatch = digits.length >= 3 && `${c.phone ?? ''} ${c.secondary_phone ?? ''}`.replace(/\D/g, '').includes(digits);
        if (!hay.includes(q) && !phoneMatch) return false;
      }
      return true;
    });
    if (view === 'dates') list.sort((a, b) => datesSoon.get(a.id)![0].daysAway - datesSoon.get(b.id)![0].daysAway);
    return list;
  }, [clients, view, search, tag, datesSoon]);

  const addClient = async () => {
    setCreating(true);
    const { data, error: err } = await createClient()
      .from('fanc_clients')
      .insert({ first_name: 'New client', status: 'past_client', source: 'manual' })
      .select('id')
      .single();
    setCreating(false);
    if (err) setError(err.message);
    else router.push(`/dashboard/clients/${data.id}?edit=1`);
  };

  if (!authLoading && !isAdmin && !isBroker) {
    return <p className="text-gray-600">The client database is available to brokers and admins.</p>;
  }

  const tabs: { value: View; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: clients.length },
    ...CLIENT_STATUSES.map((s) => ({ value: s.value as View, label: s.label, count: clients.filter((c) => c.status === s.value).length })),
    { value: 'dates', label: 'Birthdays & anniversaries (30 days)', count: datesSoon.size },
    { value: 'dnc', label: 'Do not contact', count: clients.filter((c) => c.do_not_contact).length },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Clients</h1>
          <p className="mt-1 text-gray-600">Past customers, active clients and your sphere, including contacts imported from Flexmls.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => downloadCsv(clientsToCsv(filtered), `clients-${new Date().toISOString().slice(0, 10)}.csv`)} disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
            <Download size={16} /> Export CSV
          </button>
          <Link href="/dashboard/clients/import" className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <Upload size={16} /> Import from Flexmls
          </Link>
          <button onClick={addClient} disabled={creating} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            <Plus size={16} /> Add client
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total contacts', value: clients.length, view: 'all' as View, className: 'text-gray-900' },
          { label: 'Past clients', value: clients.filter((c) => c.status === 'past_client').length, view: 'past_client' as View, className: 'text-green-700' },
          { label: 'Active clients', value: clients.filter((c) => c.status === 'active').length, view: 'active' as View, className: 'text-blue-700' },
          { label: 'Dates in next 30 days', value: datesSoon.size, view: 'dates' as View, className: datesSoon.size ? 'text-pink-600' : 'text-gray-900' },
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
            {t.label}<span className="ml-1 opacity-75">{t.count}</span>
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
            placeholder="Search name, spouse, email, phone, address or tag"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select value={tag} onChange={(e) => setTag(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white md:max-w-xs">
          <option value="">All tags</option>
          {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {selectedIds.size > 0 && user && (
        <ClientBulkBar
          selected={clients.filter((c) => selectedIds.has(c.id))}
          allTags={allTags}
          author={{ id: user.id, name: [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user.email || 'Broker' }}
          onDone={(err) => { setError(err); load(); }}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      <div className="flex items-center gap-3 mb-2 text-sm text-gray-500">
        {filtered.length > 0 && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded"
              checked={filtered.every((c) => selectedIds.has(c.id))}
              onChange={(e) => {
                const next = new Set(selectedIds);
                filtered.forEach((c) => (e.target.checked ? next.add(c.id) : next.delete(c.id)));
                setSelectedIds(next);
              }}
            />
            Select all shown
          </label>
        )}
        <span>{filtered.length.toLocaleString()} {filtered.length === 1 ? 'contact' : 'contacts'}</span>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {loading && clients.length === 0 ? (
          <p className="p-8 text-center text-gray-500">Loading clients…</p>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {clients.length === 0 ? (
              <>
                <p className="mb-3">No clients yet.</p>
                <Link href="/dashboard/clients/import" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  <Upload size={16} /> Import your Flexmls contacts
                </Link>
              </>
            ) : 'No clients match these filters.'}
          </div>
        ) : (
          filtered.map((c) => {
            const st = clientStatusMeta(c.status);
            const dates = datesSoon.get(c.id) ?? [];
            const place = [c.city, c.state].filter(Boolean).join(', ');
            return (
              <div
                key={c.id}
                role="link"
                tabIndex={0}
                onClick={() => router.push(`/dashboard/clients/${c.id}`)}
                onKeyDown={(e) => e.key === 'Enter' && router.push(`/dashboard/clients/${c.id}`)}
                className={`p-4 hover:bg-gray-50 cursor-pointer flex flex-col lg:flex-row lg:items-center gap-3 ${selectedIds.has(c.id) ? 'bg-blue-50/60' : ''}`}
              >
                <div className="flex-1 min-w-0 flex gap-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${clientName(c)}`}
                    className="rounded mt-1 shrink-0"
                    checked={selectedIds.has(c.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const next = new Set(selectedIds);
                      if (e.target.checked) next.add(c.id);
                      else next.delete(c.id);
                      setSelectedIds(next);
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Link href={`/dashboard/clients/${c.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-gray-900 hover:text-blue-600">
                        {clientName(c)}
                      </Link>
                      {c.spouse_name && <span className="text-sm text-gray-500">& {c.spouse_name}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${st.className}`}>{st.label}</span>
                      {c.do_not_contact && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">Do not contact</span>}
                      {dates.map((d) => (
                        <span key={d.kind} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-800">
                          {d.kind === 'birthday' ? <Cake size={12} /> : <Home size={12} />}
                          {d.kind === 'birthday' ? 'Birthday' : 'Home anniversary'} {d.daysAway === 0 ? 'today' : `in ${d.daysAway}d`}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {[clientTypeLabel(c.lead_type), c.address_line1, place].filter(Boolean).join(' · ') || c.email || c.phone}
                    </div>
                    {(c.tags ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(c.tags ?? []).slice(0, 5).map((t) => <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{t}</span>)}
                        {(c.tags ?? []).length > 5 && <span className="text-xs text-gray-500">+{(c.tags ?? []).length - 5}</span>}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 lg:justify-end shrink-0">
                  <div className="text-xs text-gray-500 lg:text-right lg:w-36">
                    {c.last_contacted_at ? <>Contacted {relativeTime(c.last_contacted_at, now)}</> : 'Not contacted yet'}
                  </div>
                  {!c.do_not_contact && (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      {c.phone && (
                        <>
                          <a href={`tel:${dialable(c.phone)}`} title={`Call ${c.phone}`} className="p-2 rounded-lg border border-gray-200 hover:bg-blue-50"><Phone size={16} /></a>
                          <a href={`sms:${dialable(c.phone)}`} title={`Text ${c.phone}`} className="p-2 rounded-lg border border-gray-200 hover:bg-blue-50"><MessageCircle size={16} /></a>
                        </>
                      )}
                      {c.email && <a href={`mailto:${c.email}`} title={`Email ${c.email}`} className="p-2 rounded-lg border border-gray-200 hover:bg-blue-50"><Mail size={16} /></a>}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
