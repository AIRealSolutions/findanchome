'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toYmd } from '@/lib/calendar';
import { downloadCsv, formatDate } from '@/lib/clients';
import { dealTitle, type Deal } from '@/lib/deals';
import { PERIODS, profitAndLoss } from '@/lib/finance';
import { staffName } from '@/lib/listings';
import { commissionIssues } from '../insights';
import { Card, Tile, money } from '../ui';
import { NO_BRANCH, type AdminContext } from '../useAdminData';
import { LedgerView, ProfitAndLossView } from './accounting-views';

const csvCell = (v: string | number) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const toCsv = (rows: (string | number)[][]) => rows.map((r) => r.map(csvCell).join(',')).join('\n');

export function ProfitAndLoss({ ctx, period }: { ctx: AdminContext; period: string }) {
  const pl = profitAndLoss(ctx.finance, ctx.dm, ctx.from, ctx.to, ctx.broker);
  return <ProfitAndLossView pl={pl} label={`${PERIODS.find((p) => p.value === period)?.label} (${formatDate(ctx.from)} – ${formatDate(ctx.to)})${ctx.broker ? ` · ${ctx.nameOf(ctx.broker)}` : ''}`} />;
}

export function Ledger({ ctx }: { ctx: AdminContext }) {
  return <LedgerView data={ctx.finance} from={ctx.from} to={ctx.to} broker={ctx.broker} branches={ctx.branches} branch={ctx.branch && ctx.branch !== NO_BRANCH ? ctx.branch : undefined} onChanged={ctx.reload} nameOf={ctx.nameOf} />;
}

/** Closed deals: commission check received from closing, and the broker's share paid out. */
export function Commissions({ ctx }: { ctx: AdminContext }) {
  const [show, setShow] = useState<'outstanding' | 'period'>('outstanding');
  const [error, setError] = useState('');
  const issues = commissionIssues(ctx.finance.deals, ctx.dm);
  const outstanding = new Set([...issues.receivable, ...issues.payable].map((d) => d.id));
  const rows = ctx.finance.deals
    .filter((d) => d.stage === 'closed' && (!ctx.broker || d.broker_id === ctx.broker))
    .filter((d) => (show === 'outstanding' ? outstanding.has(d.id) : ctx.inPeriod(d.closing_date)))
    .sort((a, b) => (b.closing_date ?? '').localeCompare(a.closing_date ?? ''));

  const mark = async (d: Deal, field: 'commission_received_on' | 'agent_paid_on', on: string | null) => {
    const { error: err } = await createClient().from('fanc_deals').update({ [field]: on }).eq('id', d.id);
    setError(err?.message ?? '');
    ctx.reload();
  };
  const exportCsv = () => downloadCsv(toCsv([
    ['Closed', 'Property', 'Broker', 'GCI', 'Referral fee', 'Broker payout', 'Company dollar', 'Commission received', 'Broker paid'],
    ...rows.map((d) => {
      const m = ctx.dm.get(d.id)!;
      return [d.closing_date ?? '', dealTitle(d), ctx.nameOf(d.broker_id), m.gci.toFixed(2), m.referralFee.toFixed(2), m.agentPayout.toFixed(2), m.companyDollar.toFixed(2), d.commission_received_on ?? '', d.agent_paid_on ?? ''];
    }),
  ]), `commissions-${toYmd(new Date())}.csv`);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile label="Awaiting commission checks" value={money(issues.receivableTotal)} sub={`${issues.receivable.length} closed deal${issues.receivable.length === 1 ? '' : 's'}`} tone={issues.receivable.length ? 'bad' : undefined} />
        <Tile label="Owed to brokers" value={money(issues.payableTotal)} sub={`${issues.payable.length} deal${issues.payable.length === 1 ? '' : 's'} received, not yet paid out`} tone={issues.payable.length ? 'bad' : undefined} />
      </div>
      <Card title="Commission register" action={
        <div className="flex items-center gap-2">
          <select value={show} onChange={(e) => setShow(e.target.value as typeof show)} className="px-2 py-1 border border-gray-300 rounded-lg bg-white text-sm">
            <option value="outstanding">Outstanding only</option><option value="period">Closed {ctx.periodLabel}</option>
          </select>
          <button onClick={exportCsv} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"><Download size={14} /> CSV</button>
        </div>
      }>
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        {rows.length === 0 ? <p className="text-sm text-gray-500">{show === 'outstanding' ? '✅ Every closed deal is received and paid out.' : 'No closings in this period.'}</p> : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="py-2 pr-3">Deal</th><th className="pr-3">Broker</th><th className="pr-3 text-right">GCI</th><th className="pr-3 text-right">Broker payout</th>
                  <th className="pr-3 text-right">Company $</th><th className="pr-3">Commission received</th><th>Broker paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((d) => {
                  const m = ctx.dm.get(d.id)!;
                  return (
                    <tr key={d.id}>
                      <td className="py-2 pr-3"><Link href={`/dashboard/deals/${d.id}`} className="font-medium text-gray-900 hover:text-blue-600">{dealTitle(d)}</Link>
                        <div className="text-xs text-gray-500">Closed {formatDate(d.closing_date)}</div></td>
                      <td className="pr-3">{ctx.nameOf(d.broker_id)}</td>
                      <td className="pr-3 text-right">{money(m.gci)}{m.gci === 0 && <div className="text-xs text-amber-700">no commission set</div>}</td>
                      <td className="pr-3 text-right">{money(m.agentPayout)}</td>
                      <td className="pr-3 text-right">{money(m.companyDollar)}</td>
                      <td className="pr-3">{d.commission_received_on
                        ? <button onClick={() => mark(d, 'commission_received_on', null)} title="Undo" className="text-green-700">✓ {formatDate(d.commission_received_on, { month: 'short', day: 'numeric' })}</button>
                        : <button onClick={() => mark(d, 'commission_received_on', toYmd(new Date()))} className="px-2 py-1 border border-gray-300 rounded-lg text-xs hover:bg-gray-50">Mark received</button>}</td>
                      <td>{d.agent_paid_on
                        ? <button onClick={() => mark(d, 'agent_paid_on', null)} title="Undo" className="text-green-700">✓ {formatDate(d.agent_paid_on, { month: 'short', day: 'numeric' })}</button>
                        : m.agentPayout > 0
                          ? <button onClick={() => mark(d, 'agent_paid_on', toYmd(new Date()))} disabled={!d.commission_received_on} className="px-2 py-1 border border-gray-300 rounded-lg text-xs hover:bg-gray-50 disabled:opacity-40">Mark paid</button>
                          : <span className="text-xs text-gray-400">nothing owed</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-gray-500">Record the check from the closing attorney first; then mark the broker’s share paid. Dates are today’s; click a ✓ to undo.</p>
      </Card>
    </div>
  );
}

/** What each broker was paid in a year (commission payouts by paid date, plus bonuses), for 1099-NEC filing. */
export function Form1099({ ctx }: { ctx: AdminContext }) {
  const [year, setYear] = useState(new Date().getFullYear() - (new Date().getMonth() < 2 ? 1 : 0));
  const rows = ctx.finance.staff.map((s) => {
    const deals = ctx.finance.deals.filter((d) => d.broker_id === s.id && d.stage === 'closed');
    const paid = deals.filter((d) => d.agent_paid_on?.startsWith(String(year))).reduce((n, d) => n + (ctx.dm.get(d.id)?.agentPayout ?? 0), 0);
    const unpaid = deals.filter((d) => !d.agent_paid_on && d.closing_date?.startsWith(String(year))).reduce((n, d) => n + (ctx.dm.get(d.id)?.agentPayout ?? 0), 0);
    const bonuses = ctx.finance.ledger.filter((e) => e.kind === 'expense' && e.category === 'Broker bonuses' && e.broker_id === s.id && e.entry_date.startsWith(String(year))).reduce((n, e) => n + Number(e.amount), 0);
    const rec = ctx.records.find((r) => r.broker_id === s.id);
    return { s, paid, unpaid, bonuses, total: paid + bonuses, w9: !!rec?.w9_on_file };
  });
  const exportCsv = () => downloadCsv(toCsv([
    ['Broker', 'Commissions paid', 'Bonuses', 'Total', 'W-9 on file', 'Closed but not yet paid'],
    ...rows.map((r) => [staffName(r.s), r.paid.toFixed(2), r.bonuses.toFixed(2), r.total.toFixed(2), r.w9 ? 'yes' : 'no', r.unpaid.toFixed(2)]),
  ]), `1099-summary-${year}.csv`);

  return (
    <Card title={`1099-NEC summary · ${year}`} action={
      <div className="flex items-center gap-2">
        <select value={year} onChange={(e) => setYear(+e.target.value)} className="px-2 py-1 border border-gray-300 rounded-lg bg-white text-sm">
          {[0, 1, 2].map((i) => new Date().getFullYear() - i).map((y) => <option key={y}>{y}</option>)}
        </select>
        <button onClick={exportCsv} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"><Download size={14} /> CSV</button>
      </div>
    }>
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm min-w-[640px]">
          <thead><tr className="text-left text-gray-500 border-b border-gray-200"><th className="py-2 pr-3">Broker</th><th className="pr-3 text-right">Commissions paid</th><th className="pr-3 text-right">Bonuses</th><th className="pr-3 text-right">Total</th><th>W-9</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.s.id}>
                <td className="py-2 pr-3">{staffName(r.s)}<div className="text-xs text-gray-500 capitalize">{r.s.role}</div></td>
                <td className="pr-3 text-right">{money(r.paid)}{r.unpaid > 0 && <div className="text-xs text-amber-700">+{money(r.unpaid)} closed, not yet paid</div>}</td>
                <td className="pr-3 text-right">{money(r.bonuses)}</td>
                <td className="pr-3 text-right font-semibold">{money(r.total)}</td>
                <td>{r.w9 ? <span className="text-green-700">On file</span> : <Link href="/dashboard/dept/hr?tab=licensing" className="text-amber-700 underline">Missing</Link>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Counts commission payouts by the date you marked them paid, plus “Broker bonuses” recorded for the broker under Income &amp; expenses. Confirm the reporting threshold and what to include with your accountant before filing; the owner’s own deals usually aren’t 1099 income.
      </p>
    </Card>
  );
}
