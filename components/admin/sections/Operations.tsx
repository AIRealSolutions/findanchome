'use client';

import Link from 'next/link';
import { addDaysYmd, toYmd } from '@/lib/calendar';
import { formatDate } from '@/lib/clients';
import { dealTitle, stageMeta, taskDue } from '@/lib/deals';
import { relativeTime } from '@/lib/leads';
import { dealIssues, serviceIssues } from '../insights';
import { Alert, Card, Tile } from '../ui';
import type { AdminContext } from '../useAdminData';

export function Transactions({ ctx }: { ctx: AdminContext }) {
  const deals = ctx.finance.deals.filter((d) => !ctx.broker || d.broker_id === ctx.broker);
  const issues = dealIssues(deals, ctx.openTasks);
  const today = toYmd(new Date());
  const soon = addDaysYmd(today, 14);
  // Money and contract deadlines in the next two weeks.
  const deadlines = deals
    .filter((d) => ['under_contract', 'post_dd', 'clear_to_close'].includes(d.stage))
    .flatMap((d) => ([['💵 Earnest money due', d.emd_due_date], ['⏳ Due diligence ends', d.due_diligence_date], ['📐 Appraisal', d.appraisal_date], ['🔑 Closing', d.closing_date]] as [string, string | null][])
      .filter(([, on]) => on && on >= today && on <= soon).map(([label, on]) => ({ d, label, on: on! })))
    .sort((a, b) => a.on.localeCompare(b.on));
  const open = deals.filter((d) => ['active', 'under_contract', 'post_dd', 'clear_to_close'].includes(d.stage));
  const overdueTasks = ctx.openTasks.filter((t) => {
    const d = deals.find((x) => x.id === t.deal_id);
    const on = d && taskDue(t, d);
    return !!on && on < today;
  }).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile label="Open deals" value={String(open.length)} sub={`${open.filter((d) => d.stage !== 'active').length} under contract`} />
        <Tile label="Deals needing attention" value={String(issues.length)} tone={issues.some((x) => x.issues.some((i) => i.tone === 'bad')) ? 'bad' : undefined} />
        <Tile label="Deadlines in 14 days" value={String(deadlines.length)} />
        <Tile label="Overdue checklist items" value={String(overdueTasks)} tone={overdueTasks ? 'bad' : undefined} />
      </div>
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <Card title="Transaction health">
          {issues.length === 0 ? <p className="text-sm text-green-700">✅ Every open deal has its dates, commission and checklist in order.</p> : (
            <ul className="space-y-4">
              {issues.map((x) => (
                <li key={x.deal.id}>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Link href={`/dashboard/deals/${x.deal.id}`} className="font-medium text-gray-900 hover:text-blue-600">{x.title}</Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${stageMeta(x.deal.stage).className}`}>{stageMeta(x.deal.stage).short}</span>
                    <span className="text-xs text-gray-500">{ctx.nameOf(x.deal.broker_id)}</span>
                  </div>
                  <div className="space-y-1">{x.issues.map((i) => <Alert key={i.text} tone={i.tone}>{i.text}</Alert>)}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Deadlines, next 14 days">
          {deadlines.length === 0 ? <p className="text-sm text-gray-500">Nothing due.</p> : (
            <ol className="space-y-2 text-sm">
              {deadlines.map((x) => (
                <li key={`${x.d.id}${x.label}`} className="flex gap-3">
                  <span className="w-14 shrink-0 font-medium text-gray-900">{formatDate(x.on, { month: 'short', day: 'numeric' })}</span>
                  <span className="min-w-0"><span className="block">{x.label}</span>
                    <Link href={`/dashboard/deals/${x.d.id}`} className="text-xs text-gray-500 hover:text-blue-600">{dealTitle(x.d)}</Link></span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
}

export function ClientService({ ctx }: { ctx: AdminContext }) {
  const rows = serviceIssues(ctx).filter((r) => !ctx.broker || r.deal.broker_id === ctx.broker);
  const notInvited = rows.filter((r) => r.invited === 0);
  const quiet = rows.filter((r) => r.quiet);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile label="Clients in their workspace" value={`${rows.filter((r) => r.joined).length} / ${rows.length}`} sub="open deals" />
        <Tile label="Not invited yet" value={String(notInvited.length)} tone={notInvited.length ? 'bad' : undefined} />
        <Tile label="No update in 7+ days" value={String(quiet.length)} sub="under contract" tone={quiet.length ? 'bad' : undefined} />
      </div>
      <Card title="Workspaces">
        {rows.length === 0 ? <p className="text-sm text-gray-500">No open deals.</p> : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm min-w-[640px]">
              <thead><tr className="text-left text-gray-500 border-b border-gray-200"><th className="py-2 pr-3">Deal</th><th className="pr-3">Broker</th><th className="pr-3">Client access</th><th>Last update</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.deal.id}>
                    <td className="py-2 pr-3"><Link href={`/dashboard/deals/${r.deal.id}/workspace`} className="font-medium text-gray-900 hover:text-blue-600">{r.title}</Link>
                      <div className="text-xs text-gray-500">{stageMeta(r.deal.stage).short}</div></td>
                    <td className="pr-3">{ctx.nameOf(r.deal.broker_id)}</td>
                    <td className="pr-3">{r.invited === 0 ? <span className="text-red-700">Not invited</span> : r.joined ? <span className="text-green-700">{r.joined} joined</span> : <span className="text-amber-700">Invited, not joined</span>}</td>
                    <td className={r.quiet ? 'text-red-700' : 'text-gray-700'}>{r.lastPost ? relativeTime(r.lastPost) : 'Never'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-gray-500">Clients who see a daily update stay calm and refer friends. Invite them from the deal’s workspace (Details &amp; sharing).</p>
      </Card>
    </div>
  );
}
