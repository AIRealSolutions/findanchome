'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { addDaysYmd, toYmd } from '@/lib/calendar';
import { formatDate, formatMoney } from '@/lib/clients';
import { dealTitle } from '@/lib/deals';
import { TOUCH_KINDS, staffName } from '@/lib/listings';
import {
  EXPENSE_CATEGORIES, INCOME_CATEGORIES, PERIODS,
  capProgress, closedDealMoney, defaultPlan, fetchFinance, monthlySeries, pct, periodRange, planLookup, profitAndLoss, salesStats,
  type BrokerPlan, type FinanceData, type PeriodKey,
} from '@/lib/finance';
import MonthlyChart from './MonthlyChart';
import LeadsSummaryCard from '@/components/LeadsSummaryCard';
import ListingsSummaryCard from '@/components/ListingsSummaryCard';

type Tab = 'overview' | 'pl' | 'brokers' | 'ledger' | 'team';
const TABS: { value: Tab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'pl', label: 'Profit & loss' },
  { value: 'brokers', label: 'Brokers' },
  { value: 'ledger', label: 'Income & expenses' },
  { value: 'team', label: 'Team & plans' },
];

interface Pipeline {
  leads: { created_at: string; status: string }[];
  opps: { created_at: string; updated_at: string; stage: string; review_status: string; assigned_to: string | null }[];
  touches: { created_at: string; author_id: string | null }[];
  profiles: { id: string; role: string; first_name: string | null; last_name: string | null; is_active: boolean }[];
}

async function fetchPipeline(from: string): Promise<Pipeline> {
  const supabase = createClient();
  const since = new Date(+from.slice(0, 4), +from.slice(5, 7) - 1, +from.slice(8, 10)).toISOString();
  const [leads, opps, touches, profiles] = await Promise.all([
    supabase.from('fanc_consultation_requests').select('created_at, status').gte('created_at', since).limit(5000),
    supabase.from('fanc_listing_opportunities').select('created_at, updated_at, stage, review_status, assigned_to').limit(5000),
    supabase.from('fanc_listing_activity').select('created_at, author_id').in('kind', TOUCH_KINDS).gte('created_at', since).limit(10000),
    supabase.from('fanc_user_profiles').select('id, role, first_name, last_name, is_active').order('role').limit(1000),
  ]);
  return {
    leads: (leads.data ?? []) as Pipeline['leads'],
    opps: (opps.data ?? []) as Pipeline['opps'],
    touches: (touches.data ?? []) as Pipeline['touches'],
    profiles: (profiles.data ?? []) as Pipeline['profiles'],
  };
}

function Tile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'good' | 'bad' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className={`text-2xl font-bold ${tone === 'bad' ? 'text-red-700' : 'text-gray-900'}`}>{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const money = (n: number) => formatMoney(n) || '$0';

/** Lightkeeper Realty's control center: company P&L, sales and earnings, company-wide and by broker. */
export default function ControlCenter() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, profile } = useAuth();
  const tab = (params.get('tab') as Tab) || 'overview';
  const [period, setPeriod] = useState<PeriodKey>('ytd');
  const [broker, setBroker] = useState('');
  const [data, setData] = useState<FinanceData | null>(null);
  const [pipe, setPipe] = useState<Pipeline | null>(null);
  const [loading, setLoading] = useState(true);
  const { from, to } = periodRange(period);
  // Ledger and pipeline need the whole last 12 months / last year at most.
  const earliest = periodRange('last_year').from;

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([fetchFinance(), fetchPipeline(earliest)]).then(([f, p]) => {
      setData(f);
      setPipe(p);
      setLoading(false);
    });
  }, [earliest]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchFinance(), fetchPipeline(earliest)]).then(([f, p]) => {
      if (cancelled) return;
      setData(f);
      setPipe(p);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [earliest]);

  const roles = useMemo(() => new Map((data?.staff ?? []).map((s) => [s.id, s.role])), [data]);
  const plan = useMemo(() => planLookup(data?.plans ?? [], roles), [data, roles]);
  const dm = useMemo(() => (data ? closedDealMoney(data.deals, plan) : new Map()), [data, plan]);
  const b = broker || undefined;
  const pl = useMemo(() => (data ? profitAndLoss(data, dm, from, to, b) : null), [data, dm, from, to, b]);
  const stats = useMemo(() => (data ? salesStats(data, dm, plan, from, to, b) : null), [data, dm, plan, from, to, b]);
  const year = +to.slice(0, 4);
  const series = useMemo(() => (data ? monthlySeries(data, dm, year, b) : []), [data, dm, year, b]);

  const setTab = (t: Tab) => router.replace(t === 'overview' ? '/dashboard' : `/dashboard?tab=${t}`);
  const nameOf = (id: string | null) => (id ? staffName(data?.staff.find((s) => s.id === id)) : 'Unassigned');
  const inPeriod = (iso: string) => iso.slice(0, 10) >= from && iso.slice(0, 10) <= to;

  if (!data || !pl || !stats || !pipe) {
    return <p className="p-8 text-center text-gray-500 bg-white border border-gray-200 rounded-xl">Loading the control center…</p>;
  }

  const opps = pipe.opps.filter((o) => !b || o.assigned_to === b);
  const leadsIn = pipe.leads.filter((l) => inPeriod(l.created_at));
  const oppsIn = opps.filter((o) => inPeriod(o.created_at));
  const won = opps.filter((o) => o.stage === 'listed' && inPeriod(o.updated_at)).length;
  const lost = opps.filter((o) => o.stage === 'lost' && inPeriod(o.updated_at)).length;
  const pendingReview = pipe.opps.filter((o) => o.review_status === 'pending_review').length;
  const today = toYmd(new Date());
  const closingSoon = data.deals
    .filter((d) => (!b || d.broker_id === b) && ['under_contract', 'post_dd', 'clear_to_close'].includes(d.stage) && d.closing_date && d.closing_date >= today && d.closing_date <= addDaysYmd(today, 45))
    .sort((x, y) => x.closing_date!.localeCompare(y.closing_date!));
  const recentClosings = data.deals.filter((d) => d.stage === 'closed' && (!b || d.broker_id === b)).sort((x, y) => (y.closing_date ?? '').localeCompare(x.closing_date ?? '')).slice(0, 6);
  const periodLabel = PERIODS.find((p) => p.value === period)!.label.toLowerCase();

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div>
          <p className="text-sm font-medium text-blue-700">Lightkeeper Realty</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Control Center</h1>
          <p className="mt-1 text-gray-600">Welcome back, {profile?.first_name || 'Admin'}. Profit, sales and earnings for the company and every broker.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={period} onChange={(e) => setPeriod(e.target.value as PeriodKey)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
            {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <select value={broker} onChange={(e) => setBroker(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
            <option value="">Company-wide</option>
            {data.staff.map((s) => <option key={s.id} value={s.id}>{staffName(s)}{s.id === user?.id ? ' (me)' : ''}</option>)}
          </select>
          <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {data.error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{data.error}</div>}

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${tab === t.value ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Tile label="Net profit" value={money(pl.netProfit)} sub={`${pct(pl.netProfit, pl.revenue)} margin · ${periodLabel}`} tone={pl.netProfit < 0 ? 'bad' : undefined} />
            <Tile label="Company revenue" value={money(pl.revenue)} sub={`${money(pl.companyDollar)} company dollar`} />
            <Tile label="Gross commission (GCI)" value={money(pl.gci)} sub={`${money(pl.agentPayouts)} paid to brokers`} />
            <Tile label="Expenses" value={money(pl.expenses)} sub={pl.expensesByCategory[0] ? `Top: ${pl.expensesByCategory[0][0]}` : undefined} />
            <Tile label="Closed sales" value={stats.units.toString()} sub={`${money(stats.volume)} volume`} />
            <Tile label="Average sale price" value={money(stats.avgPrice)} sub={stats.avgDaysToClose != null ? `${stats.avgDaysToClose} days contract to close` : undefined} />
            <Tile label="Under contract" value={stats.pendingUnits.toString()} sub={`${money(stats.pendingVolume)} · ${money(stats.pendingCompanyDollar)} company $ projected`} />
            <Tile label="Listings won" value={won.toString()} sub={`${oppsIn.length} opportunities in · ${pct(won, won + lost)} win rate`} />
          </div>

          {(pendingReview > 0) && (
            <Link href="/dashboard/listings?view=review" className="block p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100">
              <strong>{pendingReview}</strong> listing {pendingReview === 1 ? 'opportunity is' : 'opportunities are'} waiting for your review →
            </Link>
          )}

          <Card title={`Revenue vs expenses, ${year}`}>
            <MonthlyChart data={series} year={year} />
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card title="Sales statistics">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {([
                  ['Buyer sides closed', stats.sides.buyer],
                  ['Listing sides closed', stats.sides.seller],
                  ['HUD homes closed', stats.hud],
                  ['Deals fell through', stats.fellThrough],
                  ['Active listings', stats.activeListings],
                  ['Active buyers', stats.activeBuyers],
                  ['Website leads in', leadsIn.length],
                  ['Leads became clients', `${leadsIn.filter((l) => l.status === 'client').length} (${pct(leadsIn.filter((l) => l.status === 'client').length, leadsIn.length)})`],
                  ['Listing opportunities in', oppsIn.length],
                  ['Prospecting touches', pipe.touches.filter((t) => inPeriod(t.created_at) && (!b || t.author_id === b)).length],
                ] as [string, string | number][]).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-gray-100 py-1"><dt className="text-gray-600">{k}</dt><dd className="font-medium text-gray-900">{v}</dd></div>
                ))}
              </dl>
            </Card>
            <Card title="Closing in the next 45 days" action={<Link href="/dashboard/deals" className="text-xs text-blue-600 hover:underline">All deals →</Link>}>
              {closingSoon.length === 0 ? <p className="text-sm text-gray-500">No closings scheduled.</p> : (
                <ul className="divide-y divide-gray-100 text-sm">
                  {closingSoon.map((d) => (
                    <li key={d.id} className="py-2 flex items-center gap-2">
                      <Link href={`/dashboard/deals/${d.id}`} className="flex-1 min-w-0 truncate text-gray-900 hover:text-blue-600">{dealTitle(d)}</Link>
                      <span className="text-gray-500 shrink-0">{nameOf(d.broker_id)}</span>
                      <span className="shrink-0 font-medium">{formatDate(d.closing_date, { month: 'short', day: 'numeric' })}</span>
                    </li>
                  ))}
                </ul>
              )}
              <h3 className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Recent closings</h3>
              {recentClosings.length === 0 ? <p className="text-sm text-gray-500">None yet.</p> : (
                <ul className="divide-y divide-gray-100 text-sm">
                  {recentClosings.map((d) => (
                    <li key={d.id} className="py-2 flex items-center gap-2">
                      <Link href={`/dashboard/deals/${d.id}`} className="flex-1 min-w-0 truncate text-gray-900 hover:text-blue-600">{dealTitle(d)}</Link>
                      <span className="text-gray-500 shrink-0">{formatDate(d.closing_date, { month: 'short', day: 'numeric' })}</span>
                      <span className="shrink-0 font-medium">{money(dm.get(d.id)?.companyDollar ?? 0)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <LeadsSummaryCard />
            <ListingsSummaryCard />
          </div>
        </div>
      )}

      {tab === 'pl' && <ProfitAndLossView pl={pl} label={`${PERIODS.find((p) => p.value === period)!.label} (${formatDate(from)} – ${formatDate(to)})${b ? ` · ${nameOf(b)}` : ''}`} />}

      {tab === 'brokers' && (
        <Card title={`Production by broker · ${periodLabel}`}>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="py-2 pr-3">Broker</th><th className="pr-3">Plan</th><th className="pr-3 text-right">Closed</th><th className="pr-3 text-right">Volume</th>
                  <th className="pr-3 text-right">GCI</th><th className="pr-3 text-right">Broker earnings</th><th className="pr-3 text-right">Company $</th>
                  <th className="pr-3 text-right">Pending</th><th className="pr-3 text-right">Projected earnings</th><th className="pr-3 text-right">Open opps</th><th className="text-right">Touches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.staff.map((s) => {
                  const st = salesStats(data, dm, plan, from, to, s.id);
                  const p = profitAndLoss(data, dm, from, to, s.id);
                  const bp = plan(s.id);
                  const cap = capProgress(data, dm, bp);
                  return (
                    <tr key={s.id}>
                      <td className="py-2 pr-3"><button onClick={() => { setBroker(s.id); setTab('overview'); }} className="font-medium text-gray-900 hover:text-blue-600">{staffName(s)}</button>
                        <div className="text-xs text-gray-500 capitalize">{s.role}</div></td>
                      <td className="pr-3 text-xs text-gray-600">{bp.split_pct}% split{cap && <div>{money(cap.paid)} / {money(cap.cap)} cap</div>}</td>
                      <td className="pr-3 text-right">{st.units}</td>
                      <td className="pr-3 text-right">{money(st.volume)}</td>
                      <td className="pr-3 text-right">{money(p.gci)}</td>
                      <td className="pr-3 text-right font-medium">{money(p.agentPayouts)}</td>
                      <td className="pr-3 text-right">{money(p.companyDollar)}</td>
                      <td className="pr-3 text-right">{st.pendingUnits}</td>
                      <td className="pr-3 text-right">{money(st.pendingAgentPayout)}</td>
                      <td className="pr-3 text-right">{opps.filter((o) => o.assigned_to === s.id && o.review_status === 'approved' && !['listed', 'lost'].includes(o.stage)).length}</td>
                      <td className="text-right">{pipe.touches.filter((t) => t.author_id === s.id && inPeriod(t.created_at)).length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {data.deals.some((d) => !d.broker_id) && <p className="mt-3 text-xs text-amber-700">Some deals have no broker assigned; set one on the deal page so they count here.</p>}
          <p className="mt-3 text-xs text-gray-500">Broker earnings are their share after referral fees, the plan split (until the annual cap) and transaction fees.</p>
        </Card>
      )}

      {tab === 'ledger' && <LedgerView data={data} from={from} to={to} broker={b} onChanged={load} nameOf={nameOf} />}

      {tab === 'team' && <TeamView data={data} profiles={pipe.profiles} meId={user?.id ?? ''} onChanged={load} dm={dm} />}

      {tab === 'overview' && stats.units === 0 && data.deals.filter((d) => d.stage === 'closed').length === 0 && (
        <p className="mt-6 text-sm text-gray-500">Numbers fill in as deals close. Record each deal’s commission on its deal page, and other income and expenses under Income &amp; expenses.</p>
      )}
    </div>
  );
}

function Row({ k, v, bold, indent, neg }: { k: string; v: number; bold?: boolean; indent?: boolean; neg?: boolean }) {
  return (
    <div className={`flex justify-between py-1.5 ${bold ? 'font-semibold border-t border-gray-200' : ''} ${indent ? 'pl-4 text-gray-700' : ''}`}>
      <span>{k}</span><span className={v < 0 ? 'text-red-700' : ''}>{neg && v ? `(${money(v)})` : money(v)}</span>
    </div>
  );
}

function ProfitAndLossView({ pl, label }: { pl: NonNullable<ReturnType<typeof profitAndLoss>>; label: string }) {
  return (
    <Card title="Profit & loss statement">
      <p className="text-sm text-gray-500 mb-4">{label}</p>
      <div className="max-w-xl text-sm">
        <p className="font-semibold text-gray-900">Commission income</p>
        <Row k="Gross commission income" v={pl.gci} indent />
        <Row k="Less referral fees paid" v={pl.referralFees} indent neg />
        <Row k="Less broker commissions" v={pl.agentPayouts} indent neg />
        <Row k="Company dollar" v={pl.companyDollar} bold />
        <p className="text-xs text-gray-500 pl-4">Includes {money(pl.transactionFees)} in transaction fees</p>
        <p className="mt-4 font-semibold text-gray-900">Other income</p>
        <Row k="Broker desk fees" v={pl.deskFees} indent />
        {pl.incomeByCategory.map(([k, v]) => <Row key={k} k={k} v={v} indent />)}
        <Row k="Total revenue" v={pl.revenue} bold />
        <p className="mt-4 font-semibold text-gray-900">Expenses</p>
        {pl.expensesByCategory.length === 0 && <p className="pl-4 py-1.5 text-gray-500">None recorded</p>}
        {pl.expensesByCategory.map(([k, v]) => <Row key={k} k={k} v={v} indent />)}
        <Row k="Total expenses" v={pl.expenses} bold />
        <div className={`mt-4 flex justify-between py-2 px-3 rounded-lg text-base font-bold ${pl.netProfit < 0 ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-900'}`}>
          <span>Net profit</span><span>{money(pl.netProfit)}</span>
        </div>
        <p className="mt-2 text-xs text-gray-500">Margin {pct(pl.netProfit, pl.revenue)} of revenue. Cash basis: commissions count on the closing date.</p>
      </div>
    </Card>
  );
}

function LedgerView({ data, from, to, broker, onChanged, nameOf }: {
  data: FinanceData; from: string; to: string; broker?: string; onChanged: () => void; nameOf: (id: string | null) => string;
}) {
  const [form, setForm] = useState({ entry_date: toYmd(new Date()), kind: 'expense' as 'income' | 'expense', category: EXPENSE_CATEGORIES[0], amount: '', description: '', broker_id: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const rows = data.ledger.filter((e) => e.entry_date >= from && e.entry_date <= to && (!broker || e.broker_id === broker));
  const cats = form.kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount.replace(/[$,\s]/g, ''));
    if (!(amount > 0)) return setError('Enter an amount');
    setBusy(true);
    const { error: err } = await createClient().from('fanc_ledger').insert({
      entry_date: form.entry_date, kind: form.kind, category: form.category, amount, description: form.description.trim() || null, broker_id: form.broker_id || null,
    });
    setBusy(false);
    if (err) return setError(err.message);
    setError('');
    setForm({ ...form, amount: '', description: '' });
    onChanged();
  };
  const remove = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    await createClient().from('fanc_ledger').delete().eq('id', id);
    onChanged();
  };

  return (
    <div className="space-y-6">
      <Card title="Record income or an expense">
        <form onSubmit={add} className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3 text-sm">
          <input type="date" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" />
          <select value={form.kind} onChange={(e) => { const kind = e.target.value as 'income' | 'expense'; setForm({ ...form, kind, category: (kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)[0] }); }}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white"><option value="expense">Expense</option><option value="income">Income</option></select>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg bg-white lg:col-span-2">
            {cats.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Amount $" className="px-3 py-2 border border-gray-300 rounded-lg" />
          <select value={form.broker_id} onChange={(e) => setForm({ ...form, broker_id: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
            <option value="">Company</option>
            {data.staff.map((s) => <option key={s.id} value={s.id}>{staffName(s)}</option>)}
          </select>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description (vendor, what it was for)" className="px-3 py-2 border border-gray-300 rounded-lg sm:col-span-2 lg:col-span-5" />
          <button disabled={busy} className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">Add</button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </Card>
      <Card title={`Entries (${rows.length})`}>
        {rows.length === 0 ? <p className="text-sm text-gray-500">Nothing recorded in this period.</p> : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm min-w-[640px]">
              <tbody className="divide-y divide-gray-100">
                {rows.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2 pr-3 whitespace-nowrap text-gray-600">{formatDate(e.entry_date)}</td>
                    <td className="pr-3">{e.category}<div className="text-xs text-gray-500">{e.description}</div></td>
                    <td className="pr-3 text-gray-600">{e.broker_id ? nameOf(e.broker_id) : 'Company'}</td>
                    <td className={`pr-3 text-right font-medium ${e.kind === 'expense' ? 'text-gray-900' : 'text-green-800'}`}>{e.kind === 'expense' ? `(${money(Number(e.amount))})` : money(Number(e.amount))}</td>
                    <td className="text-right"><button onClick={() => remove(e.id)} aria-label="Delete entry" className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function TeamView({ data, profiles, meId, onChanged, dm }: {
  data: FinanceData; profiles: Pipeline['profiles']; meId: string; onChanged: () => void; dm: ReturnType<typeof closedDealMoney>;
}) {
  const [error, setError] = useState('');
  const staff = profiles.filter((p) => p.role !== 'client');
  const clients = profiles.filter((p) => p.role === 'client');

  const setRole = async (id: string, role: string) => {
    if (id === meId && role !== 'admin' && !confirm('Remove your own admin access?')) return;
    const { error: err } = await createClient().from('fanc_user_profiles').update({ role }).eq('id', id);
    if (err) setError(err.message);
    onChanged();
  };

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
      <Card title="Brokers & commission plans">
        <div className="space-y-4">
          {staff.map((p) => (
            <PlanEditor key={p.id} person={p} plan={data.plans.find((x) => x.broker_id === p.id)} meId={meId} onChanged={onChanged} onRole={setRole}
              cap={capProgress(data, dm, data.plans.find((x) => x.broker_id === p.id) ?? defaultPlan(p.id, p.role))} />
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500">
          To add a broker: create their login in Supabase (Authentication → Add user), have them sign in once, then promote them below.
        </p>
      </Card>
      <Card title={`Client accounts (${clients.length})`}>
        {clients.length === 0 ? <p className="text-sm text-gray-500">No client logins yet.</p> : (
          <ul className="divide-y divide-gray-100 text-sm">
            {clients.map((p) => (
              <li key={p.id} className="py-2 flex items-center justify-between gap-2">
                <span>{[p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unnamed'}</span>
                <button onClick={() => setRole(p.id, 'broker')} className="text-xs text-blue-600 hover:underline">Make broker</button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function PlanEditor({ person, plan, meId, onChanged, onRole, cap }: {
  person: Pipeline['profiles'][number]; plan?: BrokerPlan; meId: string; onChanged: () => void;
  onRole: (id: string, role: string) => void; cap: ReturnType<typeof capProgress>;
}) {
  const base = plan ?? defaultPlan(person.id, person.role);
  const [f, setF] = useState({
    split_pct: String(base.split_pct), annual_cap: base.annual_cap == null ? '' : String(base.annual_cap),
    transaction_fee: String(base.transaction_fee), monthly_fee: String(base.monthly_fee), starts_on: plan?.starts_on ?? toYmd(new Date()),
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const num = (v: string) => Number(v.replace(/[$,%\s]/g, '')) || 0;

  const save = async () => {
    setBusy(true);
    const { error } = await createClient().from('fanc_broker_plans').upsert({
      broker_id: person.id, split_pct: Math.min(100, num(f.split_pct)), annual_cap: f.annual_cap.trim() ? num(f.annual_cap) : null,
      transaction_fee: num(f.transaction_fee), monthly_fee: num(f.monthly_fee), starts_on: f.starts_on,
    });
    setBusy(false);
    setMsg(error ? error.message : 'Saved');
    if (!error) onChanged();
  };
  const field = (k: keyof typeof f, label: string, hint?: string) => (
    <label className="text-xs text-gray-600">{label}
      <input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} type={k === 'starts_on' ? 'date' : 'text'} inputMode={k === 'starts_on' ? undefined : 'decimal'}
        placeholder={hint} className="mt-0.5 w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900" />
    </label>
  );

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <span className="font-medium text-gray-900">{[person.first_name, person.last_name].filter(Boolean).join(' ') || 'Unnamed'}{person.id === meId && ' (me)'}</span>
          {!plan && <span className="ml-2 text-xs text-amber-700">Using the default plan</span>}
          {cap && <span className="ml-2 text-xs text-gray-500">Cap: {money(cap.paid)} of {money(cap.cap)} paid this year</span>}
        </div>
        <select value={person.role} onChange={(e) => onRole(person.id, e.target.value)} className="px-2 py-1 border border-gray-300 rounded-lg bg-white text-sm">
          <option value="admin">Admin</option><option value="broker">Broker</option><option value="client">Client (remove access)</option>
        </select>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {field('split_pct', 'Broker split %', '70')}
        {field('annual_cap', 'Annual cap $', 'none')}
        {field('transaction_fee', 'Transaction fee $')}
        {field('monthly_fee', 'Monthly desk fee $')}
        {field('starts_on', 'Plan starts')}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button disabled={busy} onClick={save} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">Save plan</button>
        {msg && <span className={`text-xs ${msg === 'Saved' ? 'text-green-700' : 'text-red-600'}`}>{msg}</span>}
      </div>
    </div>
  );
}

