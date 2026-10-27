'use client';

import Link from 'next/link';
import { pct } from '@/lib/finance';
import { labelFor } from '@/lib/consultation';
import { LISTING_SOURCES, staffName } from '@/lib/listings';
import { WEEKLY_POST_GOAL } from '@/lib/marketing';
import { Card, Progress } from '../ui';
import type { AdminContext } from '../useAdminData';

/** "/community/pender/hampstead" → "Community pages"; the site's sections, as a reader would name them. */
function pageGroup(path: string | null) {
  const p = path ?? '';
  if (!p || p === '/') return 'Home page';
  const first = p.split('/').filter(Boolean)[0];
  return ({ community: 'Community guides', explore: 'County guides', lifestyle: 'Lifestyle pages', hud: 'HUD homes', sell: 'Sell page', sellers: 'Sellers page',
    buyers: 'Buyers page', investments: 'Investments', education: 'Education', contact: 'Contact page', search: 'Home search' } as Record<string, string>)[first] ?? `/${first}`;
}

function Bars({ rows }: { rows: [string, number][] }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  if (!rows.length) return <p className="text-sm text-gray-500">Nothing in this period.</p>;
  return (
    <ul className="space-y-2">
      {rows.map(([k, n]) => (
        <li key={k}>
          <div className="flex justify-between text-sm"><span className="text-gray-700">{k}</span><span className="font-medium text-gray-900">{n}</span></div>
          <div className="mt-1 h-2 rounded bg-gray-100"><div className="h-2 rounded bg-blue-600" style={{ width: `${(n / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}

const tally = (keys: string[]) =>
  [...keys.reduce((m, k) => m.set(k, (m.get(k) ?? 0) + 1), new Map<string, number>())].sort((a, b) => b[1] - a[1]);

export function LeadSources({ ctx }: { ctx: AdminContext }) {
  const leads = ctx.leads.filter((l) => ctx.inPeriod(l.created_at));
  const opps = ctx.opps.filter((o) => ctx.inPeriod(o.created_at) && (!ctx.broker || o.assigned_to === ctx.broker || o.requested_broker_id === ctx.broker));
  const clients = ctx.clientsCreated.filter((c) => ctx.inPeriod(c.created_at));
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title={`Website leads by page · ${leads.length}`}>
        <Bars rows={tally(leads.map((l) => pageGroup(l.source_page)))} />
      </Card>
      <Card title="What website leads want">
        <Bars rows={tally(leads.flatMap((l) => l.intent.map((i) => labelFor('intent', i))))} />
      </Card>
      <Card title={`Listing opportunities by source · ${opps.length}`}>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500"><th className="py-1">Source</th><th className="text-right">In</th><th className="text-right">Listed</th><th className="text-right">Win rate</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {LISTING_SOURCES.map((s) => {
              const rows = opps.filter((o) => o.source === s.value);
              if (!rows.length) return null;
              const w = rows.filter((o) => o.stage === 'listed').length;
              return <tr key={s.value}><td className="py-1.5">{s.icon} {s.label}</td><td className="text-right">{rows.length}</td><td className="text-right">{w}</td><td className="text-right">{pct(w, rows.length)}</td></tr>;
            })}
          </tbody>
        </table>
        {opps.length === 0 && <p className="text-sm text-gray-500">None in this period.</p>}
      </Card>
      <Card title={`New clients by source · ${clients.length}`}>
        <Bars rows={tally(clients.map((c) => c.source || 'Not recorded')).slice(0, 10)} />
      </Card>
    </div>
  );
}

export function BrokerMarketing({ ctx }: { ctx: AdminContext }) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthGoal = WEEKLY_POST_GOAL * 4;
  return (
    <div className="space-y-6">
      <Card title="Social posting this month" action={<Link href="/dashboard/marketing" className="text-xs text-blue-600 hover:underline">Marketing hub →</Link>}>
        <div className="space-y-4">
          {ctx.finance.staff.map((s) => {
            const mine = ctx.posts.filter((p) => p.broker_id === s.id);
            const posted = mine.filter((p) => p.status === 'posted' && p.posted_at && p.posted_at >= monthStart).length;
            const scheduled = mine.filter((p) => p.status === 'scheduled').length;
            return (
              <div key={s.id}>
                <Progress label={`${staffName(s)}${scheduled ? ` · ${scheduled} scheduled` : ''}`} value={posted} target={monthGoal} format={(n) => String(n)} />
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-gray-500">Goal: {WEEKLY_POST_GOAL} posts a week ({monthGoal} a month) per broker.</p>
      </Card>
      <Card title={`Home-value link results · ${ctx.periodLabel}`}>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500"><th className="py-1">Broker</th><th className="text-right">Owners from their link</th><th className="text-right">Listed</th><th className="text-right">Prospecting touches</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {ctx.finance.staff.map((s) => {
              const tagged = ctx.opps.filter((o) => o.requested_broker_id === s.id && ctx.inPeriod(o.created_at));
              return (
                <tr key={s.id}>
                  <td className="py-1.5">{staffName(s)}</td>
                  <td className="text-right">{tagged.length}</td>
                  <td className="text-right">{tagged.filter((o) => o.stage === 'listed').length}</td>
                  <td className="text-right">{ctx.touches.filter((t) => t.author_id === s.id && ctx.inPeriod(t.created_at)).length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-gray-500">Each broker’s link is on their Marketing hub under Links &amp; QR codes.</p>
      </Card>
    </div>
  );
}
