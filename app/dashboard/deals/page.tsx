'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { addDaysYmd, toYmd } from '@/lib/calendar';
import { clientName, formatDate, formatMoney, type Client } from '@/lib/clients';
import {
  DEAL_SIDES,
  OPEN_STAGES,
  changeStage,
  createDeal,
  dealCommission,
  dealPrice,
  dealTitle,
  isOpenDeal,
  nextKeyDate,
  stageMeta,
  taskDue,
  type DealSide,
  type DealTask,
  type DealWithClient,
} from '@/lib/deals';

type Person = Pick<Client, 'id' | 'first_name' | 'last_name' | 'address_line1' | 'city' | 'zip_code'>;

async function fetchDeals() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('fanc_deals')
    .select('*, client:fanc_clients(id, first_name, last_name, phone, email)')
    .order('updated_at', { ascending: false })
    .limit(1000);
  const deals = (data ?? []) as DealWithClient[];
  const open = deals.filter(isOpenDeal).map((d) => d.id);
  const tasks: DealTask[] = [];
  for (let i = 0; i < open.length; i += 100) {
    const { data: t } = await supabase.from('fanc_deal_tasks').select('*').in('deal_id', open.slice(i, i + 100)).limit(10000);
    tasks.push(...((t ?? []) as DealTask[]));
  }
  return { deals, tasks, error: error?.message ?? '' };
}

function NewDeal({ onCancel, author }: { onCancel: () => void; author: { id: string; name: string } }) {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [query, setQuery] = useState('');
  const [side, setSide] = useState<DealSide>('buyer');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    createClient().from('fanc_clients').select('id, first_name, last_name, address_line1, city, zip_code')
      .order('last_name', { nullsFirst: false }).limit(5000)
      .then(({ data }) => setPeople((data ?? []) as Person[]));
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? people.filter((p) => clientName(p).toLowerCase().includes(q)).slice(0, 8) : [];
  }, [people, query]);

  const start = async (p: Person) => {
    setBusy(true);
    const r = await createDeal(p, side, author);
    setBusy(false);
    if (!r.id) return setError(r.error ?? 'Could not create the deal');
    router.push(`/dashboard/deals/${r.id}`);
  };

  return (
    <div className="mb-6 p-4 bg-white border border-blue-200 rounded-xl">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Which client? Search by name"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <select value={side} onChange={(e) => setSide(e.target.value as DealSide)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
          {DEAL_SIDES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button onClick={onCancel} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {matches.length > 0 && (
        <ul className="mt-2 border border-gray-200 rounded-lg divide-y divide-gray-100">
          {matches.map((p) => (
            <li key={p.id}>
              <button disabled={busy} onClick={() => start(p)} className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 disabled:opacity-50">
                <span className="font-medium text-gray-900">{clientName(p)}</span>
                {p.address_line1 && <span className="text-gray-500"> · {p.address_line1}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.trim() && matches.length === 0 && people.length > 0 && (
        <p className="mt-2 text-sm text-gray-500">
          No client by that name. <Link href="/dashboard/clients" className="text-blue-600 hover:underline">Add them to your clients</Link> first.
        </p>
      )}
    </div>
  );
}

export default function DealsPage() {
  const { user, profile, isAdmin, isBroker, loading: authLoading } = useAuth();
  const [deals, setDeals] = useState<DealWithClient[]>([]);
  const [tasks, setTasks] = useState<DealTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
  const [busy, setBusy] = useState(false);

  const author = { id: user?.id ?? '', name: [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user?.email || 'Broker' };

  const apply = useCallback((r: Awaited<ReturnType<typeof fetchDeals>>) => {
    setError(r.error);
    setDeals(r.deals);
    setTasks(r.tasks);
    setLoading(false);
  }, []);
  const load = useCallback(() => {
    setLoading(true);
    return fetchDeals().then(apply);
  }, [apply]);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    fetchDeals().then((r) => !cancelled && apply(r));
    return () => {
      cancelled = true;
    };
  }, [authLoading, apply]);

  const today = toYmd(new Date());
  const tasksByDeal = useMemo(() => {
    const m = new Map<string, DealTask[]>();
    tasks.forEach((t) => m.set(t.deal_id, [...(m.get(t.deal_id) ?? []), t]));
    return m;
  }, [tasks]);

  const stats = useMemo(() => {
    const pending = deals.filter((d) => ['under_contract', 'post_dd', 'clear_to_close'].includes(d.stage));
    const year = today.slice(0, 4);
    const closedYear = deals.filter((d) => d.stage === 'closed' && (d.closing_date ?? '').startsWith(year));
    const sum = (list: DealWithClient[], f: (d: DealWithClient) => number | null) => list.reduce((n, d) => n + (f(d) ?? 0), 0);
    return {
      open: deals.filter(isOpenDeal).length,
      pendingVolume: sum(pending, dealPrice),
      pendingCommission: sum(pending, dealCommission),
      closingSoon: pending.filter((d) => d.closing_date && d.closing_date >= today && d.closing_date <= addDaysYmd(today, 30)).length,
      closedYear: closedYear.length,
      closedVolume: sum(closedYear, dealPrice),
    };
  }, [deals, today]);

  const move = async (d: DealWithClient, dir: -1 | 1) => {
    const i = OPEN_STAGES.indexOf(d.stage);
    const next = OPEN_STAGES[i + dir];
    if (!next) return;
    setBusy(true);
    const err = await changeStage(d, next, tasksByDeal.get(d.id) ?? [], author);
    if (err) setError(err);
    await load();
    setBusy(false);
  };

  if (!authLoading && !isAdmin && !isBroker) {
    return <p className="text-gray-600">Deals are available to brokers and admins.</p>;
  }

  const finished = deals.filter((d) => !isOpenDeal(d));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Deals</h1>
          <p className="mt-1 text-gray-600">Every buyer and listing in progress, from first showing to closing day.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={16} /> New deal
          </button>
        </div>
      </div>

      {adding && <NewDeal onCancel={() => setAdding(false)} author={author} />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Open deals', value: stats.open.toString() },
          { label: 'Under contract volume', value: formatMoney(stats.pendingVolume) || '$0', sub: stats.pendingCommission ? `${formatMoney(stats.pendingCommission)} est. commission` : undefined },
          { label: 'Closing in 30 days', value: stats.closingSoon.toString() },
          { label: `Closed in ${today.slice(0, 4)}`, value: stats.closedYear.toString(), sub: stats.closedVolume ? `${formatMoney(stats.closedVolume)} volume` : undefined },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-600">{s.label}</div>
            {s.sub && <div className="text-xs text-gray-500 mt-0.5">{s.sub}</div>}
          </div>
        ))}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {loading && deals.length === 0 ? (
        <p className="p-8 text-center text-gray-500 bg-white border border-gray-200 rounded-xl">Loading deals…</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
          {OPEN_STAGES.map((stage) => {
            const list = deals.filter((d) => d.stage === stage).sort((a, b) => (nextKeyDate(a)?.on ?? '9999').localeCompare(nextKeyDate(b)?.on ?? '9999'));
            const meta = stageMeta(stage);
            return (
              <section key={stage} className="w-72 shrink-0 snap-start bg-gray-100 rounded-xl p-3">
                <h2 className="flex items-center justify-between mb-3 text-sm font-semibold text-gray-700">
                  <span>{meta.label}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-gray-600 text-xs">{list.length}</span>
                </h2>
                <div className="space-y-2">
                  {list.length === 0 && <p className="text-xs text-gray-500 px-1 py-4 text-center">No deals here</p>}
                  {list.map((d) => {
                    const key = nextKeyDate(d, today);
                    const dt = tasksByDeal.get(d.id) ?? [];
                    const overdue = dt.filter((t) => !t.done_at && (taskDue(t, d) ?? '9999') < today).length;
                    const i = OPEN_STAGES.indexOf(d.stage);
                    return (
                      <div key={d.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                        <Link href={`/dashboard/deals/${d.id}`} className="block">
                          <div className="font-medium text-gray-900 hover:text-blue-600 leading-snug">{dealTitle(d, d.client)}</div>
                          <div className="text-sm text-gray-600 mt-0.5">
                            {d.client ? clientName(d.client) : 'No client'} · {DEAL_SIDES.find((s) => s.value === d.side)?.label}
                            {d.is_hud && <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">HUD</span>}
                          </div>
                          {dealPrice(d) && <div className="text-sm text-gray-900 mt-1">{formatMoney(dealPrice(d))}</div>}
                          {key && (
                            <div className={`text-xs mt-1 ${key.days <= 2 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                              {key.icon} {key.label} {key.days === 0 ? 'today' : key.days === 1 ? 'tomorrow' : `in ${key.days} days`} ({formatDate(key.on, { month: 'short', day: 'numeric' })})
                            </div>
                          )}
                          {dt.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {dt.filter((t) => t.done_at).length}/{dt.length} tasks done
                              {overdue > 0 && <span className="text-red-600"> · {overdue} overdue</span>}
                            </div>
                          )}
                        </Link>
                        <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
                          <button disabled={busy || i === 0} onClick={() => move(d, -1)} aria-label="Move back a stage"
                            className="p-1 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={16} /></button>
                          {stage === 'clear_to_close' ? (
                            <Link href={`/dashboard/deals/${d.id}#close`} className="text-xs font-medium text-green-700 hover:text-green-900 self-center">Mark closed →</Link>
                          ) : (
                            <button disabled={busy} onClick={() => move(d, 1)} aria-label="Move to the next stage"
                              className="inline-flex items-center gap-0.5 px-1.5 py-1 rounded text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-30">
                              {stageMeta(OPEN_STAGES[i + 1]).short} <ChevronRight size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {finished.length > 0 && (
        <div className="mt-6">
          <button onClick={() => setShowFinished(!showFinished)} className="text-sm text-blue-600 hover:underline">
            {showFinished ? 'Hide' : 'Show'} closed and fell-through deals ({finished.length})
          </button>
          {showFinished && (
            <ul className="mt-3 bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
              {finished.map((d) => (
                <li key={d.id} className="p-3 flex flex-wrap items-center gap-2 text-sm">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${stageMeta(d.stage).className}`}>{stageMeta(d.stage).short}</span>
                  <Link href={`/dashboard/deals/${d.id}`} className="font-medium text-gray-900 hover:text-blue-600">{dealTitle(d, d.client)}</Link>
                  <span className="text-gray-600">{d.client ? clientName(d.client) : ''}</span>
                  <span className="text-gray-500 ml-auto">
                    {[formatMoney(dealPrice(d)), d.stage === 'closed' && d.closing_date && `closed ${formatDate(d.closing_date)}`].filter(Boolean).join(' · ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

    </div>
  );
}
