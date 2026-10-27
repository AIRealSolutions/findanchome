'use client';

import { capProgress, pct, profitAndLoss, salesStats } from '@/lib/finance';
import { LISTING_SOURCES, staffName } from '@/lib/listings';
import { Card, Tile, money } from '../ui';
import type { AdminContext } from '../useAdminData';

export function Production({ ctx }: { ctx: AdminContext }) {
  const { finance: data, dm, plan, from, to } = ctx;
  return (
    <Card title={`Production by broker · ${ctx.periodLabel}`}>
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
                  <td className="py-2 pr-3"><button onClick={() => ctx.setBroker(s.id)} className="font-medium text-gray-900 hover:text-blue-600">{staffName(s)}</button>
                    <div className="text-xs text-gray-500 capitalize">{s.role}</div></td>
                  <td className="pr-3 text-xs text-gray-600">{bp.split_pct}% split{cap && <div>{money(cap.paid)} / {money(cap.cap)} cap</div>}</td>
                  <td className="pr-3 text-right">{st.units}</td>
                  <td className="pr-3 text-right">{money(st.volume)}</td>
                  <td className="pr-3 text-right">{money(p.gci)}</td>
                  <td className="pr-3 text-right font-medium">{money(p.agentPayouts)}</td>
                  <td className="pr-3 text-right">{money(p.companyDollar)}</td>
                  <td className="pr-3 text-right">{st.pendingUnits}</td>
                  <td className="pr-3 text-right">{money(st.pendingAgentPayout)}</td>
                  <td className="pr-3 text-right">{ctx.opps.filter((o) => o.assigned_to === s.id && o.review_status === 'approved' && !['listed', 'lost'].includes(o.stage)).length}</td>
                  <td className="text-right">{ctx.touches.filter((t) => t.author_id === s.id && ctx.inPeriod(t.created_at)).length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {data.deals.some((d) => !d.broker_id) && <p className="mt-3 text-xs text-amber-700">Some deals have no broker assigned; set one on the deal page so they count here.</p>}
      <p className="mt-3 text-xs text-gray-500">Click a broker to see every department’s numbers for them (the broker filter above switches back). Broker earnings are their share after referral fees, the plan split (until the annual cap) and transaction fees.</p>
    </Card>
  );
}

function Funnel({ steps }: { steps: { label: string; n: number }[] }) {
  const max = Math.max(1, ...steps.map((s) => s.n));
  return (
    <ol className="space-y-2">
      {steps.map((s, i) => (
        <li key={s.label}>
          <div className="flex justify-between text-sm"><span className="text-gray-700">{s.label}</span>
            <span className="font-medium text-gray-900">{s.n}{i > 0 && <span className="ml-2 text-xs font-normal text-gray-500">{pct(s.n, steps[i - 1].n)} of previous</span>}</span></div>
          <div className="mt-1 h-3 rounded bg-gray-100"><div className="h-3 rounded bg-blue-600" style={{ width: `${(s.n / max) * 100}%` }} /></div>
        </li>
      ))}
    </ol>
  );
}

export function Pipeline({ ctx }: { ctx: AdminContext }) {
  const b = ctx.broker;
  const deals = ctx.finance.deals.filter((d) => !b || d.broker_id === b);
  const opps = ctx.opps.filter((o) => o.review_status === 'approved' && (!b || o.assigned_to === b));
  const oppsIn = opps.filter((o) => ctx.inPeriod(o.created_at));
  const leadsIn = ctx.leads.filter((l) => ctx.inPeriod(l.created_at));
  const dealsOpened = deals.filter((d) => ctx.inPeriod(d.created_at));
  const contracts = deals.filter((d) => d.effective_date && ctx.inPeriod(d.effective_date));
  const closed = deals.filter((d) => d.stage === 'closed' && ctx.inPeriod(d.closing_date));
  const fell = deals.filter((d) => d.stage === 'fell_through' && ctx.inPeriod(d.updated_at));
  const contacted = oppsIn.filter((o) => o.last_contacted_at || o.stage !== 'new');
  const appt = oppsIn.filter((o) => ['appointment', 'presented', 'listed'].includes(o.stage));
  const listed = oppsIn.filter((o) => o.stage === 'listed');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile label="Website leads in" value={String(leadsIn.length)} sub={`${pct(leadsIn.filter((l) => l.status === 'client').length, leadsIn.length)} became clients`} />
        <Tile label="Deals opened" value={String(dealsOpened.length)} />
        <Tile label="Went under contract" value={String(contracts.length)} sub={`${fell.length} fell through`} />
        <Tile label="Closed" value={String(closed.length)} sub={`${pct(closed.length, closed.length + fell.length)} of finished deals closed`} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title={`Listing opportunities · ${ctx.periodLabel}`}>
          <Funnel steps={[
            { label: 'Came in', n: oppsIn.length },
            { label: 'Contacted', n: contacted.length },
            { label: 'Listing appointment', n: appt.length },
            { label: 'Listing won', n: listed.length },
          ]} />
        </Card>
        <Card title="Win rate by source">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500"><th className="py-1">Source</th><th className="text-right">In</th><th className="text-right">Won</th><th className="text-right">Win rate</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {LISTING_SOURCES.map((s) => {
                const rows = oppsIn.filter((o) => o.source === s.value);
                if (!rows.length) return null;
                const w = rows.filter((o) => o.stage === 'listed').length;
                return <tr key={s.value}><td className="py-1.5">{s.icon} {s.label}</td><td className="text-right">{rows.length}</td><td className="text-right">{w}</td><td className="text-right">{pct(w, rows.length)}</td></tr>;
              })}
            </tbody>
          </table>
          {oppsIn.length === 0 && <p className="text-sm text-gray-500">No listing opportunities in this period.</p>}
        </Card>
      </div>
    </div>
  );
}
