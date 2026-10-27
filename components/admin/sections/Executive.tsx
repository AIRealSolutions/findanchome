'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatMoney } from '@/lib/clients';
import { staffName } from '@/lib/listings';
import { monthlySeries, pct, profitAndLoss, salesStats } from '@/lib/finance';
import MonthlyChart from '../MonthlyChart';
import { DEPARTMENTS } from '../departments';
import { brokerIssues, commissionIssues, dealIssues, serviceIssues } from '../insights';
import { Alert, Card, Progress, Tile, money } from '../ui';
import type { AdminContext, GoalMetric } from '../useAdminData';

export const GOAL_METRICS: { value: GoalMetric; label: string; money: boolean; company: boolean }[] = [
  { value: 'units', label: 'Closed sales', money: false, company: true },
  { value: 'volume', label: 'Sales volume', money: true, company: true },
  { value: 'gci', label: 'Gross commission (GCI)', money: true, company: true },
  { value: 'company_dollar', label: 'Company dollar', money: true, company: true },
  { value: 'net_profit', label: 'Net profit', money: true, company: true },
  { value: 'listings_won', label: 'Listings won', money: false, company: true },
];

/** Year-to-date actuals for each goal metric, for the company or one broker. */
function actuals(ctx: AdminContext, year: number, brokerId?: string): Record<GoalMetric, number> {
  const from = `${year}-01-01`;
  const to = `${year}-12-31`;
  const pl = profitAndLoss(ctx.finance, ctx.dm, from, to, brokerId);
  const st = salesStats(ctx.finance, ctx.dm, ctx.plan, from, to, brokerId);
  return {
    units: st.units, volume: st.volume, gci: pl.gci,
    // A broker's "company dollar" goal counts what their deals brought the company.
    company_dollar: pl.companyDollar, net_profit: pl.netProfit,
    listings_won: ctx.opps.filter((o) => o.stage === 'listed' && o.updated_at.startsWith(String(year)) && (!brokerId || o.assigned_to === brokerId)).length,
  };
}

/** Everything that needs the owner's attention, rolled up from every department. */
export function departmentAlerts(ctx: AdminContext) {
  const hr = ctx.finance.staff.flatMap((s) => brokerIssues(staffName(s), ctx.records.find((r) => r.broker_id === s.id)));
  const ops = dealIssues(ctx.finance.deals, ctx.openTasks);
  const comm = commissionIssues(ctx.finance.deals, ctx.dm);
  const service = serviceIssues(ctx);
  const pending = ctx.opps.filter((o) => o.review_status === 'pending_review').length;
  const newLeads = ctx.leads.filter((l) => l.status === 'new').length;
  return [
    { dept: 'sales', items: [
      ...(pending ? [{ tone: 'warn' as const, text: `${pending} listing ${pending === 1 ? 'opportunity' : 'opportunities'} waiting for your review`, href: '/dashboard/listings?view=review' }] : []),
      ...(newLeads ? [{ tone: 'info' as const, text: `${newLeads} new website lead${newLeads === 1 ? '' : 's'} not yet contacted`, href: '/dashboard/leads' }] : []),
    ] },
    { dept: 'accounting', items: [
      ...(comm.receivable.length ? [{ tone: 'warn' as const, text: `${comm.receivable.length} closed deal${comm.receivable.length === 1 ? '' : 's'} without the commission check recorded (${money(comm.receivableTotal)})`, href: '/dashboard/dept/accounting?tab=commissions' }] : []),
      ...(comm.payable.length ? [{ tone: 'warn' as const, text: `${money(comm.payableTotal)} owed to brokers on ${comm.payable.length} deal${comm.payable.length === 1 ? '' : 's'}`, href: '/dashboard/dept/accounting?tab=commissions' }] : []),
    ] },
    { dept: 'hr', items: hr },
    { dept: 'operations', items: [
      ...ops.slice(0, 5).map((x) => ({ tone: x.issues.some((i) => i.tone === 'bad') ? 'bad' as const : 'warn' as const, text: `${x.title}: ${x.issues.map((i) => i.text.toLowerCase()).join('; ')}`, href: `/dashboard/deals/${x.deal.id}` })),
      ...(ops.length > 5 ? [{ tone: 'info' as const, text: `${ops.length - 5} more deals need attention`, href: '/dashboard/dept/operations' }] : []),
      ...(service.filter((s) => s.quiet).length ? [{ tone: 'info' as const, text: `${service.filter((s) => s.quiet).length} deal${service.filter((s) => s.quiet).length === 1 ? '' : 's'} under contract with no client update in a week`, href: '/dashboard/dept/operations?tab=service' }] : []),
    ] },
  ].filter((g) => g.items.length);
}

export function ExecutiveOverview({ ctx }: { ctx: AdminContext }) {
  const b = ctx.broker;
  const pl = profitAndLoss(ctx.finance, ctx.dm, ctx.from, ctx.to, b);
  const st = salesStats(ctx.finance, ctx.dm, ctx.plan, ctx.from, ctx.to, b);
  const year = +ctx.to.slice(0, 4);
  const series = useMemo(() => monthlySeries(ctx.finance, ctx.dm, year, b), [ctx.finance, ctx.dm, year, b]);
  const opps = ctx.opps.filter((o) => !b || o.assigned_to === b);
  const won = opps.filter((o) => o.stage === 'listed' && ctx.inPeriod(o.updated_at)).length;
  const lost = opps.filter((o) => o.stage === 'lost' && ctx.inPeriod(o.updated_at)).length;
  const alerts = departmentAlerts(ctx);
  const thisYear = new Date().getFullYear();
  const goals = ctx.goals.filter((g) => g.year === thisYear && (g.broker_id ?? undefined) === b);
  const act = actuals(ctx, thisYear, b);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile label="Net profit" value={money(pl.netProfit)} sub={`${pct(pl.netProfit, pl.revenue)} margin · ${ctx.periodLabel}`} tone={pl.netProfit < 0 ? 'bad' : undefined} />
        <Tile label="Company revenue" value={money(pl.revenue)} sub={`${money(pl.companyDollar)} company dollar`} />
        <Tile label="Closed sales" value={st.units.toString()} sub={`${money(st.volume)} volume`} />
        <Tile label="Under contract" value={st.pendingUnits.toString()} sub={`${money(st.pendingCompanyDollar)} company $ projected`} />
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <Card title="Needs your attention">
          {alerts.length === 0 ? <p className="text-sm text-green-700">✅ All clear across every department.</p> : (
            <div className="space-y-4">
              {alerts.map((g) => {
                const d = DEPARTMENTS.find((x) => x.key === g.dept)!;
                return (
                  <div key={g.dept}>
                    <Link href={d.href} className="text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-blue-600">{d.icon} {d.label}</Link>
                    <div className="mt-1.5 space-y-1.5">{g.items.slice(0, 6).map((i, k) => <Alert key={k} tone={i.tone} href={i.href}>{i.text}</Alert>)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
        <Card title={`${thisYear} goals${b ? ` · ${ctx.nameOf(b)}` : ''}`} action={<Link href="/dashboard?tab=goals" className="text-xs text-blue-600 hover:underline">Set goals</Link>}>
          {goals.length === 0 ? <p className="text-sm text-gray-500">No goals set for {thisYear}. <Link href="/dashboard?tab=goals" className="text-blue-600 hover:underline">Set them</Link> to track progress here.</p> : (
            <div className="space-y-4">
              {GOAL_METRICS.filter((m) => goals.some((g) => g.metric === m.value)).map((m) => (
                <Progress key={m.value} label={m.label} value={act[m.value]} target={goals.find((g) => g.metric === m.value)!.target} format={m.money ? money : (n) => n.toLocaleString()} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title={`Revenue vs expenses, ${year}`}>
        <MonthlyChart data={series} year={year} />
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {DEPARTMENTS.filter((d) => d.key !== 'executive').map((d) => {
          const line = {
            sales: `${won} listings won · ${pct(won, won + lost)} win rate`,
            marketing: `${ctx.leads.filter((l) => ctx.inPeriod(l.created_at)).length} website leads · ${opps.filter((o) => ctx.inPeriod(o.created_at)).length} listing opportunities`,
            accounting: `${money(pl.expenses)} expenses · ${money(pl.agentPayouts)} broker pay`,
            hr: `${ctx.finance.staff.length} on the team`,
            operations: `${dealIssues(ctx.finance.deals, ctx.openTasks).length} deals need attention`,
          }[d.key as Exclude<typeof d.key, 'executive'>];
          return (
            <Link key={d.key} href={d.href} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow">
              <p className="font-semibold text-gray-900">{d.icon} {d.label}</p>
              <p className="text-sm text-gray-600 mt-0.5">{line}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function GoalsEditor({ ctx }: { ctx: AdminContext }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [who, setWho] = useState('');
  const [msg, setMsg] = useState('');
  const current = (m: GoalMetric) => ctx.goals.find((g) => g.year === year && (g.broker_id ?? '') === who && g.metric === m);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const key = (m: GoalMetric) => `${year}|${who}|${m}`;
  const valueOf = (m: GoalMetric) => draft[key(m)] ?? (current(m) ? String(current(m)!.target) : '');
  const act = actuals(ctx, year, who || undefined);

  const save = async () => {
    const supabase = createClient();
    for (const m of GOAL_METRICS) {
      const raw = draft[key(m.value)];
      if (raw === undefined) continue;
      const n = Number(raw.replace(/[$,\s]/g, ''));
      const existing = current(m.value);
      const res = !raw.trim()
        ? existing ? await supabase.from('fanc_goals').delete().eq('id', existing.id) : null
        : existing
          ? await supabase.from('fanc_goals').update({ target: n }).eq('id', existing.id)
          : await supabase.from('fanc_goals').insert({ year, broker_id: who || null, metric: m.value, target: n });
      if (res?.error) return setMsg(res.error.message);
    }
    setDraft({});
    setMsg('Goals saved.');
    ctx.reload();
  };

  return (
    <Card title="Annual goals">
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={year} onChange={(e) => setYear(+e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
          {[year - 1, new Date().getFullYear(), new Date().getFullYear() + 1].filter((y, i, a) => a.indexOf(y) === i).map((y) => <option key={y}>{y}</option>)}
        </select>
        <select value={who} onChange={(e) => setWho(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
          <option value="">Company</option>
          {ctx.finance.staff.map((s) => <option key={s.id} value={s.id}>{staffName(s)}</option>)}
        </select>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GOAL_METRICS.filter((m) => who === '' || m.value !== 'net_profit').map((m) => (
          <label key={m.value} className="text-sm">
            <span className="block text-gray-700 font-medium">{m.label}</span>
            <input inputMode="decimal" value={valueOf(m.value)} onChange={(e) => setDraft({ ...draft, [key(m.value)]: e.target.value })}
              placeholder={m.money ? '$' : '#'} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg" />
            <span className="block text-xs text-gray-500 mt-1">So far: {m.money ? formatMoney(act[m.value]) || '$0' : act[m.value].toLocaleString()}</span>
          </label>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} disabled={!Object.keys(draft).length} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">Save goals</button>
        {msg && <span className="text-sm text-gray-700">{msg}</span>}
      </div>
      <p className="mt-3 text-xs text-gray-500">Brokers see the company’s goals and their own on their dashboard. Leave a box empty to remove that goal.</p>
    </Card>
  );
}
