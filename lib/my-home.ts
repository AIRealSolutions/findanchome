// "My Home" in the client portal (/dashboard/my-home): what a past client sees about their own home.
// Data comes from fanc_my_home() and friends (supabase-migrations/my_home.sql), which return only the client's
// own home, purchase and dates. The homeowner calendar and checklists below are general guidance for
// Southeastern NC, not legal, tax or insurance advice; each item says who to confirm with.

import { createClient } from './supabase/client';
import { addDaysYmd, dateKindMeta, occurrences, toYmd, type DateKind } from './calendar';

export interface MyHomePlace {
  id?: string;
  address: string | null;
  city: string | null;
  zip_code: string | null;
  closing_date?: string | null;
  purchase_price?: number | null;
  is_hud?: boolean;
  home_anniversary?: string | null;
}

export interface MyHomeDate {
  id: string;
  kind: DateKind;
  label: string | null;
  date: string;
  repeats: 'yearly' | 'once';
  provider: string | null;
  added_by_client: boolean;
}

export interface MyHome {
  first_name: string | null;
  homes: MyHomePlace[];
  address_on_file: MyHomePlace | null;
  dates: MyHomeDate[];
}

/** Dates a client can add for themselves. */
export const CLIENT_DATE_KINDS: { value: DateKind; label: string; providerLabel: string }[] = [
  { value: 'insurance_renewal', label: 'Homeowners insurance renewal', providerLabel: 'Insurance company' },
  { value: 'flood_insurance_renewal', label: 'Flood insurance renewal', providerLabel: 'Insurance company' },
  { value: 'home_warranty_expiration', label: 'Home warranty ends', providerLabel: 'Warranty company' },
  { value: 'hoa_dues', label: 'HOA dues', providerLabel: 'HOA or management company' },
  { value: 'mortgage_review', label: 'Mortgage check-in', providerLabel: 'Lender' },
  { value: 'custom', label: 'Something else', providerLabel: 'Company or contact' },
];

/** 'ok' with data, 'none' when this login has no client record, 'unavailable' before the migration is applied. */
export async function fetchMyHome(): Promise<{ state: 'ok' | 'none' | 'unavailable'; home?: MyHome }> {
  const supabase = createClient();
  // Pick up access granted since they last signed in.
  await supabase.rpc('fanc_claim_invites');
  const { data, error } = await supabase.rpc('fanc_my_home');
  if (error) return { state: 'unavailable' };
  return data ? { state: 'ok', home: data as MyHome } : { state: 'none' };
}

export async function addMyDate(kind: DateKind, date: string, label: string, provider: string) {
  const { error } = await createClient().rpc('fanc_my_home_add_date', { p_kind: kind, p_date: date, p_label: label || null, p_provider: provider || null });
  return error?.message ?? '';
}

export async function removeMyDate(id: string) {
  const { error } = await createClient().rpc('fanc_my_home_remove_date', { p_id: id });
  return error?.message ?? '';
}

// ───────────────────────── Homeowner calendar (Southeastern NC) ─────────────────────────

export interface HomeownerDate {
  slug: string;
  month: number;
  day: number;
  icon: string;
  title: string;
  detail: string;
}

export const HOMEOWNER_CALENDAR: HomeownerDate[] = [
  { slug: 'tax-interest', month: 1, day: 5, icon: '🧾', title: 'Last day to pay property taxes without interest',
    detail: 'County property tax bills are due September 1 and can be paid without interest through about January 5. If your lender escrows taxes, check that the payment was made.' },
  { slug: 'tax-listing', month: 1, day: 31, icon: '📋', title: 'January tax listing period ends',
    detail: 'In January, tell your county tax office about boats, trailers and other personal property, and about additions or major improvements to your home. Confirm what applies to you with the county.' },
  { slug: 'spring-service', month: 3, day: 15, icon: '🌷', title: 'Spring check: HVAC service and termite inspection',
    detail: 'Have the air conditioning serviced before the heat, renew your termite bond inspection, and look over the roof and crawl space after winter.' },
  { slug: 'tax-relief', month: 6, day: 1, icon: '🏡', title: 'Deadline to apply for property tax relief',
    detail: 'North Carolina has no general homestead exemption, but there are programs for homeowners 65 and older, people with a disability, and disabled veterans. Applications are due to the county tax office by June 1.' },
  { slug: 'hurricane-start', month: 6, day: 1, icon: '🌀', title: 'Hurricane season begins',
    detail: 'Review your homeowners, wind and flood coverage now. New flood policies usually take 30 days to start, so do not wait for a storm in the forecast.' },
  { slug: 'tax-due', month: 9, day: 1, icon: '🧾', title: 'Property tax bills are due',
    detail: 'Bills go out in late summer and are due September 1. They can be paid without interest through about January 5.' },
  { slug: 'fall-service', month: 10, day: 15, icon: '🍂', title: 'Fall check: heating, gutters and smoke alarms',
    detail: 'Service the heat, clean gutters and the dryer vent, and test smoke and carbon monoxide alarms.' },
  { slug: 'hurricane-end', month: 11, day: 30, icon: '🌤️', title: 'Hurricane season ends',
    detail: 'A good time to restock supplies, repair any storm wear and photograph your home and belongings for insurance records.' },
];

export const HURRICANE_CHECKLIST: { title: string; items: string[] }[] = [
  { title: 'Before the season (by June 1)', items: [
    'Read your homeowners policy for the wind or named-storm deductible; in coastal counties wind is often a separate policy.',
    'Check that flood insurance is in force. Standard homeowners policies do not cover flooding.',
    'Photograph or video every room and the outside of the home, and store the files online.',
    'Know your evacuation zone and route (see your county emergency management site).',
    'Trim trees and limbs near the house; check shutters or panels and how they mount.',
    'Service the generator and store fuel safely.',
  ] },
  { title: 'When a storm is forecast', items: [
    'Bring in or tie down outdoor furniture, grills and trash cans.',
    'Fill vehicles with fuel, charge phones and power banks, and get cash.',
    'Stock water (one gallon per person per day), food, medicines and pet supplies for several days.',
    'Put insurance papers, IDs and closing documents in a waterproof bag.',
    'Follow evacuation orders from your county.',
  ] },
  { title: 'After the storm', items: [
    'Stay away from downed lines and standing water.',
    'Photograph all damage before cleaning up or making temporary repairs.',
    'Report claims to your insurance company quickly and keep receipts for repairs.',
    'Use licensed, insured contractors; be wary of anyone who knocks asking for cash up front.',
  ] },
];

export interface UpcomingItem {
  key: string;
  on: string;
  icon: string;
  title: string;
  detail: string;
  /** The client's own date (has an id when they may remove it). */
  mine?: MyHomeDate;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Personal dates and the homeowner calendar for the next `days`, soonest first. */
export function upcomingForHome(home: MyHome | null, days = 365, now = new Date()): UpcomingItem[] {
  const from = toYmd(now);
  const to = addDaysYmd(from, days);
  const items: UpcomingItem[] = [];

  for (const d of home?.dates ?? []) {
    const meta = dateKindMeta(d.kind);
    for (const on of occurrences(d.date, d.repeats, from, to)) {
      items.push({
        key: `mine-${d.id}-${on}`, on, icon: meta.icon,
        title: d.label || meta.label,
        detail: d.provider ?? '',
        mine: d,
      });
    }
  }
  const place = home?.homes[0] ?? home?.address_on_file;
  const bought = place?.closing_date ?? place?.home_anniversary;
  if (bought) {
    for (const on of occurrences(bought, 'yearly', from, to)) {
      const years = Number(on.slice(0, 4)) - Number(bought.slice(0, 4));
      if (years > 0) items.push({ key: `anniversary-${on}`, on, icon: '🏠', title: `${years} year${years === 1 ? '' : 's'} in your home`, detail: 'A good day to ask us what it is worth now.' });
    }
  }
  for (const h of HOMEOWNER_CALENDAR) {
    for (const on of occurrences(`2000-${pad(h.month)}-${pad(h.day)}`, 'yearly', from, to)) {
      items.push({ key: `${h.slug}-${on}`, on, icon: h.icon, title: h.title, detail: h.detail });
    }
  }
  return items.sort((a, b) => a.on.localeCompare(b.on));
}
