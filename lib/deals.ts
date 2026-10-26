// Active deals pipeline (/dashboard/deals). Rows live in fanc_deals and fanc_deal_tasks
// (see supabase-migrations/deals_pipeline.sql). Closing a deal records it in fanc_client_transactions.

import { createClient } from './supabase/client';
import { clientName, formatDate, type Client } from './clients';
import { addDaysYmd, daysBetween, toYmd } from './calendar';

export type DealStage = 'active' | 'under_contract' | 'post_dd' | 'clear_to_close' | 'closed' | 'fell_through';
export type DealSide = 'buyer' | 'seller' | 'both';
export type DealDateField = 'effective_date' | 'emd_due_date' | 'inspection_date' | 'due_diligence_date' | 'appraisal_date' | 'closing_date';

export interface Deal {
  id: string;
  created_at: string;
  updated_at: string;
  client_id: string;
  side: DealSide;
  stage: DealStage;
  property_address: string | null;
  city: string | null;
  zip_code: string | null;
  mls_number: string | null;
  is_hud: boolean;
  list_price: number | null;
  contract_price: number | null;
  due_diligence_fee: number | null;
  earnest_money: number | null;
  commission_pct: number | null;
  effective_date: string | null;
  emd_due_date: string | null;
  inspection_date: string | null;
  due_diligence_date: string | null;
  appraisal_date: string | null;
  closing_date: string | null;
  lender: string | null;
  closing_attorney: string | null;
  other_agent: string | null;
  notes: string | null;
  fell_through_reason: string | null;
  closed_at: string | null;
  closed_transaction_id: string | null;
  broker_id: string | null;
  /** Actual commission received; overrides price × commission_pct. */
  gross_commission: number | null;
  /** Share of the commission paid out to a referring agent. */
  referral_fee_pct: number | null;
  /** The broker's plan split and transaction fee, snapshotted when the deal closes. */
  agent_split_pct: number | null;
  transaction_fee: number | null;
}

export interface DealTask {
  id: string;
  deal_id: string;
  created_at: string;
  title: string;
  anchor: DealDateField | null;
  offset_days: number;
  due_date: string | null;
  done_at: string | null;
  sort: number;
}

export type DealWithClient = Deal & { client: Pick<Client, 'id' | 'first_name' | 'last_name' | 'phone' | 'email'> | null };

export const DEAL_STAGES: { value: DealStage; label: string; short: string; className: string }[] = [
  { value: 'active', label: 'Active (searching / listed)', short: 'Active', className: 'bg-sky-100 text-sky-800' },
  { value: 'under_contract', label: 'Under contract (due diligence)', short: 'Under contract', className: 'bg-amber-100 text-amber-800' },
  { value: 'post_dd', label: 'Past due diligence', short: 'Past DD', className: 'bg-orange-100 text-orange-800' },
  { value: 'clear_to_close', label: 'Clear to close', short: 'Clear to close', className: 'bg-purple-100 text-purple-800' },
  { value: 'closed', label: 'Closed', short: 'Closed', className: 'bg-green-100 text-green-800' },
  { value: 'fell_through', label: 'Fell through', short: 'Fell through', className: 'bg-gray-200 text-gray-700' },
];
export const OPEN_STAGES: DealStage[] = ['active', 'under_contract', 'post_dd', 'clear_to_close'];
export const stageMeta = (s: DealStage) => DEAL_STAGES.find((x) => x.value === s) ?? DEAL_STAGES[0];
export const isOpenDeal = (d: Pick<Deal, 'stage'>) => OPEN_STAGES.includes(d.stage);

export const DEAL_SIDES: { value: DealSide; label: string }[] = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller (listing)' },
  { value: 'both', label: 'Both sides' },
];

/** Key dates from the NC Offer to Purchase and Contract, in the order they usually fall. */
export const DEAL_DATES: { field: DealDateField; label: string; icon: string }[] = [
  { field: 'effective_date', label: 'Effective date', icon: '✍️' },
  { field: 'emd_due_date', label: 'Earnest money due', icon: '💵' },
  { field: 'inspection_date', label: 'Home inspection', icon: '🔍' },
  { field: 'due_diligence_date', label: 'Due diligence ends', icon: '⏳' },
  { field: 'appraisal_date', label: 'Appraisal', icon: '📐' },
  { field: 'closing_date', label: 'Closing (settlement)', icon: '🔑' },
];
export const dateFieldLabel = (f: DealDateField) => DEAL_DATES.find((x) => x.field === f)?.label ?? f;

export const dealTitle = (d: Pick<Deal, 'property_address' | 'city'>, c?: Pick<Client, 'first_name' | 'last_name'> | null) =>
  d.property_address ? [d.property_address, d.city].filter(Boolean).join(', ') : c ? `${clientName(c)} (no property yet)` : 'Untitled deal';

export const dealPrice = (d: Pick<Deal, 'contract_price' | 'list_price'>) => d.contract_price ?? d.list_price;

/** Gross commission for this side of the deal, when a price and percentage are known. */
export const dealCommission = (d: Pick<Deal, 'contract_price' | 'list_price' | 'commission_pct'>) => {
  const p = dealPrice(d);
  return p && d.commission_pct ? (p * d.commission_pct) / 100 : null;
};

export const taskDue = (t: Pick<DealTask, 'anchor' | 'offset_days' | 'due_date'>, d: Deal) => {
  if (!t.anchor) return t.due_date;
  const base = d[t.anchor];
  return base ? addDaysYmd(base, t.offset_days) : null;
};

/** The next upcoming key date (or the most recent missed one) on an open deal. */
export function nextKeyDate(d: Deal, today = toYmd(new Date())) {
  const dates = DEAL_DATES.filter((x) => x.field !== 'effective_date' && d[x.field]).map((x) => ({ ...x, on: d[x.field]! }));
  const next = dates.filter((x) => x.on >= today).sort((a, b) => a.on.localeCompare(b.on))[0];
  return next ? { ...next, days: daysBetween(today, next.on) } : null;
}

// ───────────────────────── Checklists ─────────────────────────

type Template = { title: string; anchor?: DealDateField; offset?: number };

const ACTIVE_TASKS: Record<'buyer' | 'seller', Template[]> = {
  buyer: [
    { title: 'Signed buyer agency agreement on file' },
    { title: 'Pre-approval letter (or proof of funds) received' },
    { title: 'Set up a saved search / listing alerts in Flexmls' },
  ],
  seller: [
    { title: 'Signed listing agreement on file' },
    { title: 'Residential Property and Owners’ Association Disclosure completed' },
    { title: 'Photos scheduled' },
    { title: 'Listing entered in Flexmls' },
  ],
};

const CONTRACT_TASKS: Record<'buyer' | 'seller', Template[]> = {
  buyer: [
    { title: 'Send the signed contract to the lender, closing attorney and buyer', anchor: 'effective_date' },
    { title: 'Confirm the due diligence fee was paid to the seller', anchor: 'effective_date' },
    { title: 'Confirm earnest money was delivered to the escrow agent', anchor: 'emd_due_date' },
    { title: 'Schedule the home inspection', anchor: 'effective_date', offset: 2 },
    { title: 'Order the survey and wood-destroying insect report (if wanted)', anchor: 'effective_date', offset: 5 },
    { title: 'Confirm the appraisal is ordered', anchor: 'effective_date', offset: 7 },
    { title: 'Review the inspection report with the buyer', anchor: 'inspection_date', offset: 1 },
    { title: 'Send the repair request and negotiate', anchor: 'due_diligence_date', offset: -5 },
    { title: 'Buyer decision: proceed or terminate before due diligence ends', anchor: 'due_diligence_date', offset: -1 },
    { title: 'Review the appraisal', anchor: 'appraisal_date', offset: 1 },
    { title: 'Confirm homeowners (and flood) insurance is bound', anchor: 'closing_date', offset: -10 },
    { title: 'Remind the buyer to set up utilities', anchor: 'closing_date', offset: -7 },
    { title: 'Confirm clear to close with the lender', anchor: 'closing_date', offset: -5 },
    { title: 'Final walk-through', anchor: 'closing_date', offset: -1 },
    { title: 'Closing day', anchor: 'closing_date' },
  ],
  seller: [
    { title: 'Send the signed contract to the closing attorney and seller', anchor: 'effective_date' },
    { title: 'Confirm the buyer paid the due diligence fee', anchor: 'effective_date' },
    { title: 'Confirm the buyer’s earnest money was delivered', anchor: 'emd_due_date' },
    { title: 'Arrange access for inspections and the appraisal', anchor: 'effective_date', offset: 2 },
    { title: 'Respond to the repair request', anchor: 'due_diligence_date', offset: -3 },
    { title: 'Confirm the buyer is proceeding after due diligence', anchor: 'due_diligence_date', offset: 1 },
    { title: 'Send seller information and payoff details to the closing attorney', anchor: 'closing_date', offset: -14 },
    { title: 'Remind the seller about utilities, keys and garage remotes', anchor: 'closing_date', offset: -3 },
    { title: 'Closing day', anchor: 'closing_date' },
  ],
};

const HUD_BUYER_TASKS: Template[] = [
  { title: 'Send the signed HUD contract package to the asset manager (usually due within 2 business days)', anchor: 'effective_date', offset: 2 },
];

function templates(kind: 'active' | 'contract', side: DealSide, isHud: boolean): Template[] {
  const sides: ('buyer' | 'seller')[] = side === 'both' ? ['buyer', 'seller'] : [side];
  const list = sides.flatMap((s) => (kind === 'active' ? ACTIVE_TASKS : CONTRACT_TASKS)[s]);
  if (kind === 'contract' && isHud && side !== 'seller') list.splice(1, 0, ...HUD_BUYER_TASKS);
  // "Both sides" would otherwise list Closing day twice.
  return list.filter((t, i) => list.findIndex((x) => x.title === t.title) === i);
}

export async function addChecklist(d: Deal, kind: 'active' | 'contract', startSort = 0) {
  const rows = templates(kind, d.side, d.is_hud).map((t, i) => ({
    deal_id: d.id, title: t.title, anchor: t.anchor ?? null, offset_days: t.offset ?? 0, sort: startSort + i,
  }));
  const { error } = await createClient().from('fanc_deal_tasks').insert(rows);
  return error?.message ?? '';
}

// ───────────────────────── Writes ─────────────────────────

type Author = { id: string; name: string };

const logOnClient = (clientId: string, body: string, author: Author) =>
  createClient().from('fanc_client_activity').insert({ client_id: clientId, kind: 'note', body, author_id: author.id, author_name: author.name });

export async function createDeal(client: Pick<Client, 'id' | 'first_name' | 'last_name' | 'address_line1' | 'city' | 'zip_code'>, side: DealSide, author: Author) {
  const supabase = createClient();
  const { data, error } = await supabase.from('fanc_deals').insert({
    client_id: client.id,
    side,
    stage: 'active',
    // A listing is usually the client's own home.
    ...(side === 'seller' ? { property_address: client.address_line1, city: client.city, zip_code: client.zip_code } : {}),
  }).select('*').single();
  if (error) return { error: error.message };
  const err = await addChecklist(data as Deal, 'active');
  await supabase.from('fanc_clients').update({ status: 'active' }).eq('id', client.id).in('status', ['prospect', 'sphere', 'inactive']);
  await logOnClient(client.id, `Started a ${side === 'seller' ? 'listing' : side === 'both' ? 'deal (both sides)' : 'buyer deal'}`, author);
  return { id: data.id as string, error: err };
}

/** Move a deal to another open stage, adding the contract checklist the first time it goes under contract. */
export async function changeStage(d: Deal, stage: DealStage, tasks: DealTask[], author: Author) {
  const supabase = createClient();
  const { error } = await supabase.from('fanc_deals').update({ stage }).eq('id', d.id);
  if (error) return error.message;
  if (stage !== 'active' && !tasks.some((t) => t.anchor)) {
    const err = await addChecklist(d, 'contract', tasks.length);
    if (err) return err;
  }
  await logOnClient(d.client_id, `${dealTitle(d)}: ${stageMeta(d.stage).short} → ${stageMeta(stage).short}`, author);
  return '';
}

/** Record the closing: a closed sale on the client, past-client status and the home anniversary. */
export async function closeDeal(d: Deal, closingDate: string, author: Author) {
  const supabase = createClient();
  const { data: txn, error: e1 } = await supabase.from('fanc_client_transactions').insert({
    client_id: d.client_id,
    side: d.side,
    property_address: d.property_address,
    city: d.city,
    zip_code: d.zip_code,
    mls_number: d.mls_number,
    sale_price: d.contract_price ?? d.list_price,
    closing_date: closingDate,
    is_hud: d.is_hud,
    notes: [d.lender && `Lender: ${d.lender}`, d.closing_attorney && `Closing attorney: ${d.closing_attorney}`].filter(Boolean).join(' · ') || null,
  }).select('id').single();
  if (e1) return e1.message;

  // Snapshot the broker's split and fee so later plan changes don't rewrite this deal's numbers. Without a
  // readable plan they stay empty and reports use the plan in effect then.
  const { data: plan } = d.broker_id
    ? await supabase.from('fanc_broker_plans').select('split_pct, transaction_fee').eq('broker_id', d.broker_id).maybeSingle()
    : { data: null };
  const { error: e2 } = await supabase.from('fanc_deals').update({
    stage: 'closed', closing_date: closingDate, closed_at: new Date().toISOString(), closed_transaction_id: txn.id,
    ...(plan ? { agent_split_pct: d.agent_split_pct ?? plan.split_pct, transaction_fee: d.transaction_fee ?? plan.transaction_fee } : {}),
  }).eq('id', d.id);
  if (e2) return e2.message;

  const { data: c } = await supabase.from('fanc_clients').select('home_anniversary').eq('id', d.client_id).single();
  const updates: Partial<Client> = { status: 'past_client' };
  if (d.side !== 'seller' && !c?.home_anniversary) updates.home_anniversary = closingDate;
  await supabase.from('fanc_clients').update(updates).eq('id', d.client_id);
  await logOnClient(d.client_id, `Closed: ${dealTitle(d)} on ${formatDate(closingDate)}`, author);
  return '';
}

export async function markFellThrough(d: Deal, reason: string, author: Author) {
  const { error } = await createClient().from('fanc_deals').update({ stage: 'fell_through', fell_through_reason: reason || null }).eq('id', d.id);
  if (error) return error.message;
  await logOnClient(d.client_id, `${dealTitle(d)} fell through${reason ? `: ${reason}` : ''}`, author);
  return '';
}
