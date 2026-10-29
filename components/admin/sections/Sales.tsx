'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { capProgress, pct, profitAndLoss, salesStats } from '@/lib/finance';
import { LISTING_SOURCES, assignOpportunity, isBrokerOwned, isOpenOpportunity, opportunityTitle, sourceMeta, staffName } from '@/lib/listings';
import { relativeTime } from '@/lib/leads';
import { Card, Tile, money } from '../ui';
import { NO_BRANCH, scopeToBranch, type AdminContext } from '../useAdminData';

/** Each branch side by side: production, pipeline, leads and the branch's own P&L. */
function BranchComparison({ ctx }: { ctx: AdminContext }) {
  const { dm, plan, from, to } = ctx;
  const unbranched = ctx.finance.deals.some((d) => !d.office_id) || ctx.opps.some((o) => !o.office_id)
    || ctx.leads.some((l) => !l.office_id) || ctx.finance.ledger.some((e) => !e.office_id);
  const rows = [...ctx.branches.map((b) => ({ id: b.id, name: b.name })), ...(unbranched ? [{ id: NO_BRANCH, name: 'No branch' }] : [])];
  return (
    <Card title={`Branches · ${ctx.periodLabel}`}>
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 pr-3">Branch</th><th className="pr-3 text-right">Brokers</th><th className="pr-3 text-right">Closed</th><th className="pr-3 text-right">Volume</th>
              <th className="pr-3 text-right">GCI</th><th className="pr-3 text-right">Company $</th><th className="pr-3 text-right">Pending</th>
              <th className="pr-3 text-right">Open opps</th><th className="pr-3 text-right">New leads</th><th className="text-right">Net profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => {
              const b = scopeToBranch(ctx, r.id);
              const st = salesStats(b.finance, dm, plan, from, to);
              const p = profitAndLoss(b.finance, dm, from, to);
              return (
                <tr key={r.id}>
                  <td className="py-2 pr-3"><button onClick={() => ctx.setBranch(r.id)} className="font-medium text-gray-900 hover:text-blue-600">{r.name}</button></td>
                  <td className="pr-3 text-right">{b.finance.staff.length}</td>
                  <td className="pr-3 text-right">{st.units}</td>
                  <td className="pr-3 text-right">{money(st.volume)}</td>
                  <td className="pr-3 text-right">{money(p.gci)}</td>
                  <td className="pr-3 text-right">{money(p.companyDollar)}</td>
                  <td className="pr-3 text-right">{st.pendingUnits}</td>
                  <td className="pr-3 text-right">{b.opps.filter((o) => o.review_status === 'approved' && !['listed', 'lost'].includes(o.stage)).length}</td>
                  <td className="pr-3 text-right">{b.leads.filter((l) => ctx.inPeriod(l.created_at)).length + b.opps.filter((o) => ctx.inPeriod(o.created_at)).length}</td>
                  <td className={`text-right font-medium ${p.netProfit < 0 ? 'text-red-700' : 'text-gray-900'}`}>{money(p.netProfit)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-gray-500">Click a branch to see every department’s numbers for it. Net profit is the branch’s company dollar and desk fees less the expenses booked to it; company-wide expenses sit under “No branch”.</p>
    </Card>
  );
}

export function Production({ ctx }: { ctx: AdminContext }) {
  return (
    <div className="space-y-6">
      {!ctx.branch && ctx.branches.length > 0 && <BranchComparison ctx={ctx} />}
      <BrokerProduction ctx={ctx} />
    </div>
  );
}

function BrokerProduction({ ctx }: { ctx: AdminContext }) {
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

type Opp = AdminContext['opps'][number];

function AssignRow({ o, ctx, author }: { o: Opp; ctx: AdminContext; author: { id: string; name: string } }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const assign = async (to: string) => {
    setBusy(true);
    setError('');
    const err = await assignOpportunity(o, to || null, author, ctx.nameOf(to || null));
    if (err) {
      setBusy(false);
      return setError(err);
    }
    await ctx.reload();
    setBusy(false);
  };
  return (
    <li className="py-3 flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex-1 min-w-0">
        <Link href={`/dashboard/listings/${o.id}`} className="font-medium text-gray-900 hover:text-blue-600">{o.owner_name}</Link>
        <div className="text-sm text-gray-600 truncate">{sourceMeta(o.source).icon} {o.property_address ? opportunityTitle(o) : sourceMeta(o.source).label}</div>
        <div className="text-xs text-gray-500">
          From {o.created_by_name || (o.created_by_role === 'public' ? 'the website' : o.created_by_role === 'client' ? 'a client' : 'the company')} · {relativeTime(o.created_at)}
          {o.priority === 'hot' && <span className="ml-1 text-red-700 font-medium">· Hot</span>}
        </div>
        {error && <div className="text-xs text-red-600">{error}</div>}
      </div>
      <select value={o.assigned_to ?? ''} disabled={busy} onChange={(e) => assign(e.target.value)} aria-label={`Assign ${o.owner_name}`}
        className={`sm:w-60 px-3 py-2 border rounded-lg bg-white text-sm ${o.assigned_to ? 'border-gray-300' : 'border-amber-400'}`}>
        <option value="">Unassigned</option>
        {ctx.finance.staff.map((s) => <option key={s.id} value={s.id}>{staffName(s)}{s.id === author.id ? ' (me)' : ''}</option>)}
      </select>
    </li>
  );
}

/**
 * The broker-in-charge hands out company opportunities: ones entered by an admin or that came in through the
 * website and client referrals. A broker's own onboarded or snapped opportunities stay with them and aren't listed.
 */
export function AssignOpportunities({ ctx }: { ctx: AdminContext }) {
  const { user, profile } = useAuth();
  const author = { id: user?.id ?? '', name: [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user?.email || 'Admin' };
  const admins = new Set(ctx.finance.staff.filter((s) => s.role === 'admin').map((s) => s.id));
  const open = ctx.opps.filter(isOpenOpportunity);
  const owned = (o: Opp) => isBrokerOwned(o, ctx.finance.staff);
  const company = open.filter((o) => !owned(o) && (!ctx.broker || o.assigned_to === ctx.broker))
    // Unassigned first, then ones still sitting with an admin, then everything already with a broker; newest first within each.
    .sort((a, b) => {
      const rank = (o: Opp) => (!o.assigned_to ? 0 : admins.has(o.assigned_to) ? 1 : 2);
      return rank(a) - rank(b) || b.created_at.localeCompare(a.created_at);
    });
  const unassigned = company.filter((o) => !o.assigned_to).length;
  const withAdmin = company.filter((o) => o.assigned_to && admins.has(o.assigned_to)).length;
  const pending = ctx.opps.filter((o) => o.review_status === 'pending_review').length;
  const brokerOwned = open.filter(owned);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile label="Unassigned" value={String(unassigned)} tone={unassigned ? 'bad' : undefined} />
        <Tile label="Held by the broker-in-charge / admin" value={String(withAdmin)} />
        <Tile label="Waiting for review" value={String(pending)} sub="Website requests and client referrals" />
        <Tile label="Brokers' own opportunities" value={String(brokerOwned.length)} sub="Onboarded or snapped by the broker" />
      </div>
      {pending > 0 && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
          {pending} new submission{pending === 1 ? ' is' : 's are'} waiting for review. <Link href="/dashboard/listings?view=review" className="font-medium underline">Approve and assign them in the review queue →</Link>
        </p>
      )}
      <Card title={`Company opportunities${ctx.broker ? ` · ${ctx.nameOf(ctx.broker)}` : ''} (${company.length})`}>
        {company.length === 0 ? (
          <p className="text-sm text-gray-500">No open company opportunities{ctx.broker ? ' for this broker' : ''}.</p>
        ) : (
          <ul className="divide-y divide-gray-100">{company.map((o) => <AssignRow key={o.id} o={o} ctx={ctx} author={author} />)}</ul>
        )}
        <p className="mt-3 text-xs text-gray-500">
          These were entered by you or another admin, came in through the company, or belonged to a broker who has left. Pick a broker to give them the opportunity; it moves to their dashboard with a follow-up for today.
          Opportunities a broker onboarded or snapped themselves stay with that broker and can&apos;t be reassigned.
        </p>
      </Card>
      {brokerOwned.length > 0 && !ctx.broker && (
        <Card title="Brokers' own opportunities">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500"><th className="py-1">Broker</th><th className="text-right">Open opportunities they brought in</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {ctx.finance.staff.map((s) => {
                const n = brokerOwned.filter((o) => o.assigned_to === s.id).length;
                return n ? <tr key={s.id}><td className="py-1.5">{staffName(s)}</td><td className="text-right">{n}</td></tr> : null;
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
