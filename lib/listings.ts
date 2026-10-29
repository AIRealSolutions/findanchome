// Listing opportunities (/dashboard/listings): potential sellers from first contact to a signed listing.
// Rows live in fanc_listing_opportunities and fanc_listing_activity (see supabase-migrations/listing_opportunities.sql).
// Brokers' and admins' entries go straight into the pipeline; anything else waits for an admin to approve it.
// Winning the listing starts a seller deal (lib/deals.ts).

import { createClient } from './supabase/client';
import { cleanEmail, cleanPhone } from './client-import';
import { formatMoney } from './clients';
import { createDeal } from './deals';
import type { LeadPriority } from './leads';

export type ReviewStatus = 'pending_review' | 'approved' | 'rejected';
export type ListingStage = 'new' | 'contacted' | 'appointment' | 'presented' | 'nurture' | 'listed' | 'lost';
export type ListingSource =
  | 'website' | 'sphere' | 'referral' | 'fsbo' | 'expired' | 'probate' | 'pre_foreclosure' | 'absentee' | 'hud'
  | 'door_knock' | 'drive_by' | 'open_house' | 'other';
export type Situation = 'standard' | 'pre_foreclosure' | 'foreclosure_sale' | 'probate' | 'inherited';
export type ListingActivityKind = 'note' | 'call' | 'text' | 'email' | 'meeting' | 'door_knock' | 'mail' | 'status' | 'review';

export interface ListingOpportunity {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  created_by_name: string | null;
  created_by_role: 'public' | 'client' | 'broker' | 'admin';
  /** Branch office; follows the assigned broker. */
  office_id: string | null;
  review_status: ReviewStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  assigned_to: string | null;
  stage: ListingStage;
  priority: LeadPriority;
  source: ListingSource;
  source_detail: string | null;
  follow_up_at: string | null;
  appointment_at: string | null;
  last_contacted_at: string | null;
  lost_reason: string | null;
  owner_name: string;
  owner_email: string | null;
  owner_phone: string | null;
  preferred_contact: 'call' | 'text' | 'email' | null;
  relationship: string | null;
  property_address: string | null;
  city: string | null;
  county: string | null;
  zip_code: string | null;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  year_built: number | null;
  lot_acres: number | null;
  condition: string | null;
  occupancy: 'owner' | 'tenant' | 'vacant' | 'second_home' | null;
  reason: string | null;
  timeline: string | null;
  price_expectation: number | null;
  mortgage_balance: number | null;
  estimated_value: number | null;
  previously_listed: boolean;
  message: string | null;
  notes: string | null;
  client_id: string | null;
  consultation_id: string | null;
  deal_id: string | null;
  source_page: string | null;
  requested_broker_id: string | null;
  // Field capture and owner research
  latitude: number | null;
  longitude: number | null;
  location_source: 'photo' | 'device' | 'map' | 'address' | null;
  parcel_id: string | null;
  parcel_data: Record<string, unknown> | null;
  absentee_owner: boolean | null;
  research_notes: string | null;
  // Distressed and estate sales
  situation: Situation;
  case_number: string | null;
  case_county: string | null;
  hearing_date: string | null;
  sale_date: string | null;
  lender_name: string | null;
  decedent_name: string | null;
  date_of_death: string | null;
  representative_name: string | null;
  representative_contact: string | null;
  attorney_name: string | null;
  attorney_contact: string | null;
  heirs: string | null;
}

export interface ListingPhoto {
  id: string;
  opportunity_id: string;
  created_at: string;
  path: string;
  caption: string | null;
  latitude: number | null;
  longitude: number | null;
  taken_at: string | null;
  sort: number;
}

export interface ListingTask {
  id: string;
  opportunity_id: string;
  situation: string | null;
  title: string;
  detail: string | null;
  due_date: string | null;
  done_at: string | null;
  sort: number;
}

export interface ListingActivity {
  id: string;
  opportunity_id: string;
  created_at: string;
  author_id: string | null;
  author_name: string | null;
  kind: ListingActivityKind;
  body: string;
}

export interface StaffMember {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

export const staffName = (s: Pick<StaffMember, 'first_name' | 'last_name'> | undefined) =>
  s ? [s.first_name, s.last_name].filter(Boolean).join(' ') || 'Unnamed' : 'Unassigned';

export async function fetchStaff() {
  const { data } = await createClient().rpc('fanc_staff_directory');
  return (data ?? []) as StaffMember[];
}

// ───────────────────────── Options ─────────────────────────

export const LISTING_STAGES: { value: ListingStage; label: string; short: string; className: string; hint: string }[] = [
  { value: 'new', label: 'New (not yet contacted)', short: 'New', className: 'bg-blue-100 text-blue-800', hint: 'Reach out today; speed wins listings.' },
  { value: 'contacted', label: 'Contacted', short: 'Contacted', className: 'bg-amber-100 text-amber-800', hint: 'Keep following up until you book the appointment.' },
  { value: 'appointment', label: 'Listing appointment set', short: 'Appointment', className: 'bg-purple-100 text-purple-800', hint: 'Prepare the CMA and listing presentation.' },
  { value: 'presented', label: 'Presented (awaiting decision)', short: 'Presented', className: 'bg-orange-100 text-orange-800', hint: 'Follow up within a day of the presentation.' },
  { value: 'nurture', label: 'Nurture (selling later)', short: 'Nurture', className: 'bg-slate-100 text-slate-700', hint: 'Check in monthly until they are ready.' },
  { value: 'listed', label: 'Listed (won)', short: 'Listed', className: 'bg-green-100 text-green-800', hint: '' },
  { value: 'lost', label: 'Lost / not selling', short: 'Lost', className: 'bg-gray-200 text-gray-700', hint: '' },
];
export const OPEN_LISTING_STAGES: ListingStage[] = ['new', 'contacted', 'appointment', 'presented', 'nurture'];
export const listingStageMeta = (s: ListingStage) => LISTING_STAGES.find((x) => x.value === s) ?? LISTING_STAGES[0];
export const isOpenOpportunity = (o: Pick<ListingOpportunity, 'stage' | 'review_status'>) =>
  o.review_status === 'approved' && OPEN_LISTING_STAGES.includes(o.stage);

/** When to follow up next after moving to a stage (days from now), so nothing stalls. */
export const STAGE_FOLLOW_UP_DAYS: Partial<Record<ListingStage, number>> = {
  new: 0, contacted: 2, presented: 1, nurture: 30,
};

export const LISTING_SOURCES: { value: ListingSource; label: string; icon: string }[] = [
  { value: 'website', label: 'Website request', icon: '🌐' },
  { value: 'sphere', label: 'Sphere / past client', icon: '🤝' },
  { value: 'referral', label: 'Referral', icon: '🔁' },
  { value: 'fsbo', label: 'For sale by owner', icon: '🪧' },
  { value: 'expired', label: 'Expired / withdrawn listing', icon: '⌛' },
  { value: 'probate', label: 'Probate / estate', icon: '📜' },
  { value: 'pre_foreclosure', label: 'Pre-foreclosure / distressed', icon: '⚠️' },
  { value: 'absentee', label: 'Absentee owner / tired landlord', icon: '🏚️' },
  { value: 'hud', label: 'HUD / investor-owned', icon: '🏛️' },
  { value: 'door_knock', label: 'Door knocking / farm area', icon: '🚪' },
  { value: 'drive_by', label: 'Spotted in the field (driving for dollars)', icon: '📸' },
  { value: 'open_house', label: 'Open house', icon: '🏠' },
  { value: 'other', label: 'Other', icon: '📌' },
];
export const sourceMeta = (s: ListingSource) => LISTING_SOURCES.find((x) => x.value === s) ?? LISTING_SOURCES[LISTING_SOURCES.length - 1];

export const PROPERTY_TYPES = ['Single-family', 'Townhouse', 'Condo', 'Manufactured / mobile', 'Multi-family', 'Land / lot', 'Other'];
export const CONDITIONS = ['Move-in ready', 'Updated', 'Average', 'Needs some work', 'Needs major repairs'];
export const OCCUPANCY: { value: NonNullable<ListingOpportunity['occupancy']>; label: string }[] = [
  { value: 'owner', label: 'Owner lives there' },
  { value: 'tenant', label: 'Rented to a tenant' },
  { value: 'vacant', label: 'Vacant' },
  { value: 'second_home', label: 'Second home / vacation' },
];
export const REASONS = [
  'Relocating', 'Military PCS', 'Upsizing', 'Downsizing', 'Retiring', 'Divorce / separation', 'Inherited / estate',
  'Financial hardship', 'Selling a rental / investment', 'Testing the market', 'Other',
];
export const SELLER_TIMELINES = ['As soon as possible', 'Within 3 months', '3–6 months', '6–12 months', '12+ months / just curious'];
export const RELATIONSHIPS = ['Owner', 'Co-owner / spouse', 'Heir / executor', 'Family member', 'Referral partner', 'Other'];

export const LISTING_ACTIVITY_KINDS: { value: Exclude<ListingActivityKind, 'status' | 'review'>; label: string; icon: string }[] = [
  { value: 'call', label: 'Call', icon: '📞' },
  { value: 'text', label: 'Text', icon: '💬' },
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'door_knock', label: 'Door knock', icon: '🚪' },
  { value: 'mail', label: 'Mailer / note', icon: '📬' },
  { value: 'meeting', label: 'Meeting', icon: '🤝' },
  { value: 'note', label: 'Note', icon: '📝' },
];
export const LISTING_ACTIVITY_ICONS: Record<ListingActivityKind, string> = {
  call: '📞', text: '💬', email: '✉️', door_knock: '🚪', mail: '📬', meeting: '🤝', note: '📝', status: '🔄', review: '🛡️',
};
/** Kinds that count as reaching out (for "last contacted" and the daily touch goal). */
export const TOUCH_KINDS: ListingActivityKind[] = ['call', 'text', 'email', 'door_knock', 'mail', 'meeting'];

export const DEFAULT_DAILY_GOAL = 10;

/** Each broker's daily touch goal is a per-browser preference. */
export function readDailyGoal() {
  try {
    return Number(localStorage.getItem('listing-daily-goal')) || DEFAULT_DAILY_GOAL;
  } catch {
    return DEFAULT_DAILY_GOAL;
  }
}

export function saveDailyGoal(n: number) {
  try {
    localStorage.setItem('listing-daily-goal', String(n));
  } catch {}
}

// ───────────────────────── Display helpers ─────────────────────────

export const opportunityTitle = (o: Pick<ListingOpportunity, 'property_address' | 'city' | 'owner_name'>) =>
  o.property_address ? [o.property_address, o.city].filter(Boolean).join(', ') : `${o.owner_name} (no address yet)`;

/** Rough equity, when both a value and the mortgage balance are known. */
export function equity(o: Pick<ListingOpportunity, 'estimated_value' | 'price_expectation' | 'mortgage_balance'>) {
  const v = o.estimated_value ?? o.price_expectation;
  return v != null && o.mortgage_balance != null ? v - o.mortgage_balance : null;
}

export const propertySummary = (o: ListingOpportunity) =>
  [
    o.property_type,
    o.bedrooms != null && `${o.bedrooms} bd`,
    o.bathrooms != null && `${o.bathrooms} ba`,
    o.sqft && `${o.sqft.toLocaleString()} sq ft`,
    o.year_built && `built ${o.year_built}`,
    o.lot_acres != null && `${o.lot_acres} ac`,
  ].filter(Boolean).join(' · ');

const dayStart = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** overdue / today / upcoming for a follow-up timestamp, or null when none is set. */
export function dueState(iso: string | null, now = new Date()) {
  if (!iso) return null;
  const t = new Date(iso);
  const today = dayStart(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (t < today) return 'overdue' as const;
  if (t < tomorrow) return 'today' as const;
  return 'upcoming' as const;
}

/** ISO timestamp `days` from today at `hour` local time (today if days is 0 and the hour has passed: now). */
export function inDays(days: number, hour = 9) {
  const d = dayStart();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return days === 0 && d < new Date() ? new Date().toISOString() : d.toISOString();
}

// ───────────────────────── The daily routine ─────────────────────────

const PRIORITY_ORDER: Record<LeadPriority, number> = { hot: 0, warm: 1, cold: 2 };
const byPriority = (a: ListingOpportunity, b: ListingOpportunity) =>
  PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || (a.follow_up_at ?? a.created_at).localeCompare(b.follow_up_at ?? b.created_at);

/**
 * Today's listing work, in the order to do it: approve what came in, prepare for appointments, call new
 * opportunities first (speed to lead), then due follow-ups, then anything with no next step.
 */
export function dailyRoutine(opps: ListingOpportunity[], now = new Date()) {
  const open = opps.filter(isOpenOpportunity);
  const today = dayStart(now);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  return {
    review: opps.filter((o) => o.review_status === 'pending_review').sort((a, b) => a.created_at.localeCompare(b.created_at)),
    appointments: open
      .filter((o) => o.appointment_at && new Date(o.appointment_at) >= today && new Date(o.appointment_at) < dayAfter)
      .sort((a, b) => a.appointment_at!.localeCompare(b.appointment_at!)),
    newToCall: open.filter((o) => o.stage === 'new' && !o.last_contacted_at).sort(byPriority),
    followUps: open
      .filter((o) => !(o.stage === 'new' && !o.last_contacted_at))
      .filter((o) => ['overdue', 'today'].includes(dueState(o.follow_up_at, now) ?? ''))
      .sort(byPriority),
    noNextStep: open.filter((o) => !o.follow_up_at && !(o.appointment_at && new Date(o.appointment_at) >= now) && o.stage !== 'new').sort(byPriority),
  };
}

// ───────────────────────── Writes ─────────────────────────

type Author = { id: string; name: string };

export const logListingActivity = (opportunityId: string, entries: { kind: ListingActivityKind; body: string }[], author: Author) =>
  createClient().from('fanc_listing_activity').insert(
    entries.map((e) => ({ ...e, opportunity_id: opportunityId, author_id: author.id, author_name: author.name })),
  );

/**
 * Log an activity. Reaching out (a call, text, door knock…) records the contact, moves a New opportunity to
 * Contacted, and schedules the next follow-up for the stage unless `nextFollowUp` is given (null clears it).
 */
export async function recordTouch(
  o: ListingOpportunity, kind: Exclude<ListingActivityKind, 'status' | 'review'>, body: string, author: Author, nextFollowUp?: string | null,
) {
  const entries: { kind: ListingActivityKind; body: string }[] = [{ kind, body }];
  const updates: Partial<ListingOpportunity> = {};
  if (TOUCH_KINDS.includes(kind)) {
    updates.last_contacted_at = new Date().toISOString();
    const stage = o.stage === 'new' ? 'contacted' : o.stage;
    if (stage !== o.stage) {
      updates.stage = stage;
      entries.push({ kind: 'status', body: `${listingStageMeta(o.stage).short} → ${listingStageMeta(stage).short}` });
    }
    const days = STAGE_FOLLOW_UP_DAYS[stage];
    // At the appointment stage the booked appointment is the next step.
    updates.follow_up_at = nextFollowUp !== undefined ? nextFollowUp : days != null ? inDays(days) : null;
  } else if (nextFollowUp !== undefined) {
    updates.follow_up_at = nextFollowUp;
  }
  if (Object.keys(updates).length) {
    const { error } = await createClient().from('fanc_listing_opportunities').update(updates).eq('id', o.id);
    if (error) return error.message;
  }
  const { error } = await logListingActivity(o.id, entries, author);
  return error?.message ?? '';
}

/** Move to another stage, logging it and scheduling the stage's usual follow-up. */
export async function changeListingStage(o: ListingOpportunity, stage: ListingStage, author: Author, extra: Partial<ListingOpportunity> = {}, why = '') {
  const days = STAGE_FOLLOW_UP_DAYS[stage];
  const updates: Partial<ListingOpportunity> = {
    stage,
    follow_up_at: stage === 'lost' || stage === 'listed' ? null : days != null ? inDays(days) : o.follow_up_at,
    ...extra,
  };
  const { error } = await createClient().from('fanc_listing_opportunities').update(updates).eq('id', o.id);
  if (error) return error.message;
  await logListingActivity(o.id, [{ kind: 'status', body: `${listingStageMeta(o.stage).short} → ${listingStageMeta(stage).short}${why ? `: ${why}` : ''}` }], author);
  return '';
}

/**
 * A broker's own opportunity (one they onboarded or snapped) stays with them while they're an active broker
 * (`staff` is the active staff directory). Everything else, entered by the broker-in-charge / an admin or coming
 * in through the company, is the company's for an admin to assign.
 */
export const isBrokerOwned = (o: Pick<ListingOpportunity, 'created_by' | 'created_by_role'>, staff: Pick<StaffMember, 'id'>[]) =>
  o.created_by_role === 'broker' && !!o.created_by && staff.some((s) => s.id === o.created_by);

/** Admin gives a company opportunity to a broker (or moves it), with a first follow-up if it has none. */
export async function assignOpportunity(
  o: Pick<ListingOpportunity, 'id' | 'follow_up_at'>, assignTo: string | null, author: Author, assigneeName = '',
) {
  const { error } = await createClient().from('fanc_listing_opportunities')
    .update({ assigned_to: assignTo, follow_up_at: o.follow_up_at ?? (assignTo ? inDays(0) : null) }).eq('id', o.id);
  if (error) return error.message;
  await logListingActivity(o.id, [{ kind: 'status', body: assignTo ? `Assigned to ${assigneeName || 'a broker'}` : 'Unassigned' }], author);
  return '';
}

/** Admin decision on a submission: approve and assign (with a first follow-up today), or reject. */
export async function reviewOpportunity(
  o: ListingOpportunity, decision: 'approved' | 'rejected', assignTo: string | null, note: string, author: Author, assigneeName = '',
) {
  const updates: Partial<ListingOpportunity> = { review_status: decision, review_note: note.trim() || null };
  if (decision === 'approved') {
    updates.assigned_to = assignTo;
    updates.follow_up_at = o.follow_up_at ?? inDays(0);
  }
  const { error } = await createClient().from('fanc_listing_opportunities').update(updates).eq('id', o.id);
  if (error) return error.message;
  const body = decision === 'approved'
    ? `Approved${assigneeName ? ` and assigned to ${assigneeName}` : ''}${note.trim() ? `: ${note.trim()}` : ''}`
    : `Rejected${note.trim() ? `: ${note.trim()}` : ''}`;
  await logListingActivity(o.id, [{ kind: 'review', body }], author);
  return '';
}

/**
 * Won the listing: make sure the owner is in the client database (matching by email), start a seller deal for
 * this property, and mark the opportunity listed. Returns the new deal's id.
 */
export async function convertToListing(o: ListingOpportunity, listPrice: number | null, author: Author): Promise<{ dealId?: string; error?: string }> {
  const supabase = createClient();
  let clientId = o.client_id;
  const email = o.owner_email ? cleanEmail(o.owner_email) : null;

  if (!clientId && email) {
    const { data } = await supabase.from('fanc_clients').select('id').eq('email', email).limit(1).maybeSingle();
    clientId = data?.id ?? null;
  }
  if (!clientId) {
    const parts = o.owner_name.trim().split(/\s+/);
    const { data, error } = await supabase.from('fanc_clients').insert({
      first_name: parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0] || o.owner_name,
      last_name: parts.length > 1 ? parts[parts.length - 1] : null,
      email: email ?? o.owner_email,
      phone: o.owner_phone ? cleanPhone(o.owner_phone) ?? o.owner_phone : null,
      address_line1: o.occupancy === 'owner' ? o.property_address : null,
      city: o.occupancy === 'owner' ? o.city : null,
      zip_code: o.occupancy === 'owner' ? o.zip_code : null,
      status: 'active',
      lead_type: 'seller',
      source: `Listing opportunity: ${sourceMeta(o.source).label}`,
      tags: ['Listing opportunity'],
      consultation_id: o.consultation_id,
    }).select('id').single();
    if (error) return { error: error.message };
    clientId = data.id as string;
    await supabase.from('fanc_client_activity').insert({
      client_id: clientId, kind: 'note', body: 'Added from a listing opportunity', author_id: author.id, author_name: author.name,
    });
  }

  const deal = await createDeal(
    { id: clientId!, first_name: '', last_name: null, address_line1: o.property_address, city: o.city, zip_code: o.zip_code },
    'seller', author,
  );
  if (!deal.id) return { error: deal.error || 'Could not start the listing deal' };
  await supabase.from('fanc_deals').update({
    property_address: o.property_address, city: o.city, zip_code: o.zip_code, list_price: listPrice,
    is_hud: o.source === 'hud',
    notes: [o.reason && `Reason for selling: ${o.reason}`, o.timeline && `Timeline: ${o.timeline}`].filter(Boolean).join('\n') || null,
  }).eq('id', deal.id);

  const { error } = await supabase.from('fanc_listing_opportunities').update({
    stage: 'listed', client_id: clientId, deal_id: deal.id, follow_up_at: null,
  }).eq('id', o.id);
  if (error) return { error: error.message };
  await logListingActivity(o.id, [{ kind: 'status', body: `Won the listing${listPrice ? ` at ${formatMoney(listPrice)}` : ''}; started the seller deal` }], author);
  return { dealId: deal.id };
}
