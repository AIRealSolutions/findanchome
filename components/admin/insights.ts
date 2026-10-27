// What needs attention in each department. Shared by the department pages and the Executive overview.

import { addDaysYmd, toYmd } from '@/lib/calendar';
import { dealTitle, taskDue, type Deal, type DealTask } from '@/lib/deals';
import type { DealMoney } from '@/lib/finance';
import type { AdminData, BrokerRecord } from './useAdminData';

export type Issue = { tone: 'bad' | 'warn' | 'info'; text: string; href?: string };

/** NC license year runs July 1 – June 30: CE is due June 10 and the license renews by June 30. */
export function licenseYear(today = new Date()) {
  const y = today.getMonth() >= 6 ? today.getFullYear() : today.getFullYear() - 1;
  return { start: `${y}-07-01`, ceDue: `${y + 1}-06-10`, renewBy: `${y + 1}-06-30` };
}

export function brokerIssues(name: string, r: BrokerRecord | undefined, today = toYmd(new Date())): Issue[] {
  const href = '/dashboard/dept/hr?tab=licensing';
  if (!r) return [{ tone: 'info', text: `${name}: no license or compliance record on file`, href }];
  const out: Issue[] = [];
  const ly = licenseYear(new Date(today + 'T12:00'));
  if (r.license_status === 'inactive') out.push({ tone: 'bad', text: `${name}: license is inactive; they can’t practice`, href });
  if (r.license_expires && r.license_expires < today) out.push({ tone: 'bad', text: `${name}: license expired ${r.license_expires}`, href });
  else if (r.license_expires && r.license_expires <= addDaysYmd(today, 60)) out.push({ tone: 'warn', text: `${name}: license renews by ${r.license_expires}`, href });
  const ceDone = !!r.ce_completed_on && r.ce_completed_on >= ly.start;
  // Remind from April 1; overdue after June 10.
  if (!ceDone && today >= `${ly.ceDue.slice(0, 4)}-04-01`) {
    out.push({ tone: today > ly.ceDue ? 'bad' : 'warn', text: `${name}: continuing education not recorded (due ${ly.ceDue})`, href });
  }
  if (!r.eo_expires) out.push({ tone: 'warn', text: `${name}: no E&O insurance on file`, href });
  else if (r.eo_expires < today) out.push({ tone: 'bad', text: `${name}: E&O insurance expired ${r.eo_expires}`, href });
  else if (r.eo_expires <= addDaysYmd(today, 30)) out.push({ tone: 'warn', text: `${name}: E&O insurance expires ${r.eo_expires}`, href });
  if (!r.ica_signed) out.push({ tone: 'warn', text: `${name}: independent contractor agreement not signed`, href });
  if (!r.w9_on_file) out.push({ tone: 'warn', text: `${name}: no W-9 on file`, href });
  return out;
}

const UNDER_CONTRACT = ['under_contract', 'post_dd', 'clear_to_close'];

/** Problems with each open deal, worst first. */
export function dealIssues(deals: Deal[], tasks: DealTask[], today = toYmd(new Date())) {
  const byDeal = new Map<string, DealTask[]>();
  tasks.forEach((t) => byDeal.set(t.deal_id, [...(byDeal.get(t.deal_id) ?? []), t]));
  return deals
    .filter((d) => ['active', ...UNDER_CONTRACT].includes(d.stage))
    .map((d) => {
      const href = `/dashboard/deals/${d.id}`;
      const issues: Issue[] = [];
      const contract = UNDER_CONTRACT.includes(d.stage);
      if (!d.broker_id) issues.push({ tone: 'warn', text: 'No broker assigned', href });
      if (contract) {
        const missing = [!d.effective_date && 'effective date', !d.due_diligence_date && 'due diligence date', !d.closing_date && 'closing date', !(d.contract_price) && 'contract price'].filter(Boolean);
        if (missing.length) issues.push({ tone: 'bad', text: `Missing ${missing.join(', ')}`, href });
        if (d.commission_pct == null && d.gross_commission == null) issues.push({ tone: 'warn', text: 'No commission recorded', href });
        if (d.closing_date && d.closing_date < today) issues.push({ tone: 'bad', text: `Closing date ${d.closing_date} has passed; mark it closed or update it`, href });
        if (d.emd_due_date && d.emd_due_date >= today && d.emd_due_date <= addDaysYmd(today, 3)) issues.push({ tone: 'warn', text: `Earnest money due ${d.emd_due_date}`, href });
        if (d.due_diligence_date && d.due_diligence_date >= today && d.due_diligence_date <= addDaysYmd(today, 3)) issues.push({ tone: 'warn', text: `Due diligence ends ${d.due_diligence_date}`, href });
      }
      const overdue = (byDeal.get(d.id) ?? []).filter((t) => (taskDue(t, d) ?? '9999') < today);
      if (overdue.length) issues.push({ tone: overdue.length > 2 ? 'bad' : 'warn', text: `${overdue.length} overdue checklist item${overdue.length === 1 ? '' : 's'}`, href });
      return { deal: d, title: dealTitle(d), issues };
    })
    .filter((x) => x.issues.length)
    .sort((a, b) => b.issues.filter((i) => i.tone === 'bad').length - a.issues.filter((i) => i.tone === 'bad').length || b.issues.length - a.issues.length);
}

/** Closed deals whose commission hasn't come in, or whose broker hasn't been paid. */
export function commissionIssues(deals: Deal[], dm: Map<string, DealMoney>) {
  const closed = deals.filter((d) => d.stage === 'closed');
  const receivable = closed.filter((d) => !d.commission_received_on && (dm.get(d.id)?.gci ?? 0) > 0);
  const payable = closed.filter((d) => d.commission_received_on && !d.agent_paid_on && (dm.get(d.id)?.agentPayout ?? 0) > 0);
  return {
    receivable, payable,
    receivableTotal: receivable.reduce((n, d) => n + (dm.get(d.id)?.gci ?? 0) - (dm.get(d.id)?.referralFee ?? 0), 0),
    payableTotal: payable.reduce((n, d) => n + (dm.get(d.id)?.agentPayout ?? 0), 0),
  };
}

/** Deals where the client isn't in the workspace yet, or nobody has posted in a week. */
export function serviceIssues(data: AdminData, today = new Date()) {
  const open = data.finance.deals.filter((d) => ['active', ...UNDER_CONTRACT].includes(d.stage));
  const weekAgo = new Date(today.getTime() - 7 * 86400000).toISOString();
  return open.map((d) => {
    const members = data.members.filter((m) => m.deal_id === d.id);
    const last = data.dealPosts.find((p) => p.deal_id === d.id && p.author_role !== 'system');
    return {
      deal: d,
      title: dealTitle(d),
      invited: members.length,
      joined: members.filter((m) => m.user_id).length,
      lastPost: last?.created_at ?? null,
      quiet: UNDER_CONTRACT.includes(d.stage) && (!last || last.created_at < weekAgo),
    };
  });
}
