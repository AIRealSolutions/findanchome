// Shared deal workspace (/dashboard/deals/[id]/workspace): what the broker and their clients see together —
// a newsfeed, a shared to-do list, a calendar of key dates, and the deal's details without the money side.
// Tables and access rules: supabase-migrations/deal_workspace.sql.

import { createClient } from './supabase/client';
import { addDaysYmd, type CalEvent } from './calendar';
import { DEAL_DATES, taskDue, type Deal, type DealDateField, type DealStage, type DealTask } from './deals';

/** A deal as fanc_workspace_deals() returns it: no commission, split or private notes. */
export interface WorkspaceDeal {
  id: string;
  side: Deal['side'];
  stage: DealStage;
  property_address: string | null;
  city: string | null;
  zip_code: string | null;
  mls_number: string | null;
  is_hud: boolean;
  list_price: number | null;
  contract_price: number | null;
  effective_date: string | null;
  emd_due_date: string | null;
  inspection_date: string | null;
  due_diligence_date: string | null;
  appraisal_date: string | null;
  closing_date: string | null;
  lender: string | null;
  closing_attorney: string | null;
  other_agent: string | null;
  updated_at: string;
  client_first_name: string | null;
  client_last_name: string | null;
  broker_id: string | null;
  broker_name: string | null;
  broker_phone: string | null;
  broker_email: string | null;
}

export type PostKind = 'update' | 'showing' | 'offer' | 'inspection' | 'appraisal' | 'repair' | 'document' | 'marketing' | 'question' | 'milestone';

export interface DealPost {
  id: string;
  deal_id: string;
  created_at: string;
  author_id: string | null;
  author_name: string | null;
  author_role: 'broker' | 'client' | 'system';
  kind: PostKind;
  body: string;
  link_url: string | null;
  internal: boolean;
  parent_id: string | null;
}

export interface DealMember {
  id: string;
  deal_id: string;
  created_at: string;
  email: string;
  name: string | null;
  user_id: string | null;
  last_seen_at: string | null;
}

export const POST_KINDS: { value: Exclude<PostKind, 'milestone'>; label: string; icon: string; staffOnly?: boolean }[] = [
  { value: 'update', label: 'Update', icon: '📝' },
  { value: 'showing', label: 'Showing', icon: '🏠' },
  { value: 'offer', label: 'Offer', icon: '✍️' },
  { value: 'inspection', label: 'Inspection', icon: '🔍' },
  { value: 'appraisal', label: 'Appraisal', icon: '📐' },
  { value: 'repair', label: 'Repairs', icon: '🔧' },
  { value: 'document', label: 'Document', icon: '📄' },
  { value: 'marketing', label: 'Marketing', icon: '📣', staffOnly: true },
  { value: 'question', label: 'Question', icon: '❓' },
];
export const postKindMeta = (k: PostKind) =>
  k === 'milestone' ? { value: 'milestone', label: 'Milestone', icon: '🎯' } : POST_KINDS.find((x) => x.value === k) ?? POST_KINDS[0];

/** The client-facing journey; "Past due diligence" reads better for clients as "Financing & appraisal". */
export const JOURNEY: { stage: DealStage; label: string }[] = [
  { stage: 'active', label: 'Getting started' },
  { stage: 'under_contract', label: 'Under contract' },
  { stage: 'post_dd', label: 'Financing & appraisal' },
  { stage: 'clear_to_close', label: 'Clear to close' },
  { stage: 'closed', label: 'Closed' },
];

export const workspaceTitle = (d: Pick<WorkspaceDeal, 'property_address' | 'city' | 'side' | 'client_first_name'>) =>
  d.property_address
    ? [d.property_address, d.city].filter(Boolean).join(', ')
    : d.side === 'buyer' ? `${d.client_first_name ?? 'Your'}’s home search` : 'Your home sale';

export async function fetchWorkspace(dealId: string) {
  const supabase = createClient();
  const [deal, tasks, posts, members] = await Promise.all([
    supabase.rpc('fanc_workspace_deals', { only_deal: dealId }),
    supabase.from('fanc_deal_tasks').select('*').eq('deal_id', dealId).order('sort'),
    supabase.from('fanc_deal_posts').select('*').eq('deal_id', dealId).order('created_at', { ascending: false }).limit(1000),
    supabase.from('fanc_deal_members').select('*').eq('deal_id', dealId).order('created_at'),
  ]);
  return {
    deal: ((deal.data ?? []) as WorkspaceDeal[])[0] ?? null,
    tasks: (tasks.data ?? []) as DealTask[],
    posts: (posts.data ?? []) as DealPost[],
    members: (members.data ?? []) as DealMember[],
    error: (deal.error || tasks.error || posts.error || members.error)?.message ?? '',
  };
}

/** Tell the other side about a post (broker → invited clients, client → broker). No-op without email set up. */
export async function notifyPost(postId: string) {
  const { data: { session } } = await createClient().auth.getSession();
  if (!session) return;
  await fetch('/api/deal-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ postId }),
  }).catch(() => {});
}

export async function sendInvite(memberId: string) {
  const { data: { session } } = await createClient().auth.getSession();
  if (!session) return 'Not signed in';
  const res = await fetch('/api/deal-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ inviteMemberId: memberId }),
  }).catch(() => null);
  if (!res) return 'Could not reach the server';
  const j = await res.json().catch(() => ({}));
  return res.ok ? (j.sent ? '' : j.message ?? 'Email isn’t set up; copy the invite instead.') : j.error ?? 'Could not send the invite';
}

// ───────────────────────── Shared calendar ─────────────────────────

/** Key dates and shared to-dos with a due date, as calendar events (also used for the .ics download). */
export function workspaceEvents(d: WorkspaceDeal, tasks: DealTask[]): CalEvent[] {
  const href = `/dashboard/deals/${d.id}/workspace`;
  const asDeal = d as unknown as Deal;
  const events: CalEvent[] = [];
  for (const f of DEAL_DATES) {
    const on = d[f.field as DealDateField];
    if (!on) continue;
    events.push({
      key: `ws_date:${d.id}:${f.field}`, occursOn: on, kind: 'deal_date', icon: f.icon, title: f.label, detail: workspaceTitle(d),
      href, remindFrom: addDaysYmd(on, -2), completable: false, done: false,
    });
  }
  for (const t of tasks) {
    const on = taskDue(t, asDeal);
    if (!on || !t.shared) continue;
    events.push({
      key: `ws_task:${t.id}`, occursOn: on, kind: 'deal_task', icon: t.assignee === 'client' ? '🙋' : '☑️', title: t.title,
      detail: t.assignee === 'client' ? 'Your to-do' : 'Your broker’s to-do', href, remindFrom: on, completable: true, done: !!t.done_at,
    });
  }
  return events.sort((a, b) => a.occursOn.localeCompare(b.occursOn) || a.title.localeCompare(b.title));
}
