// Workflows for distressed and estate sales on listing opportunities: pre-foreclosure, a scheduled foreclosure
// sale, probate (owner passed away, estate open) and inherited property (heirs already own it).
// These are practical steps for the broker, not legal advice; each workflow points legal questions to an attorney.

import { createClient } from './supabase/client';
import { addDaysYmd, toYmd } from './calendar';
import type { ListingOpportunity, ListingTask, Situation } from './listings';

type Field = keyof Pick<ListingOpportunity,
  'case_number' | 'case_county' | 'hearing_date' | 'sale_date' | 'lender_name' | 'decedent_name' | 'date_of_death'
  | 'representative_name' | 'representative_contact' | 'attorney_name' | 'attorney_contact' | 'heirs'>;

type Template = { title: string; detail?: string; days?: number; from?: 'today' | 'sale' | 'hearing' };

export const SITUATIONS: {
  value: Situation; label: string; icon: string; short: string; hint: string; fields: { field: Field; label: string; type?: 'date' | 'textarea'; placeholder?: string }[];
  tasks: Template[];
}[] = [
  { value: 'standard', label: 'Standard sale', icon: '🏡', short: 'Standard', hint: '', fields: [], tasks: [] },
  {
    value: 'pre_foreclosure', label: 'Pre-foreclosure (behind on payments)', icon: '⚠️', short: 'Pre-foreclosure',
    hint: 'In NC most foreclosures go before the Clerk of Superior Court as a special proceeding, with a hearing before any sale. Time matters: the earlier you help, the more options the owner has.',
    fields: [
      { field: 'case_number', label: 'Foreclosure file # (special proceeding)', placeholder: 'e.g. 26 SP 123' },
      { field: 'case_county', label: 'County' },
      { field: 'hearing_date', label: 'Hearing date', type: 'date' },
      { field: 'sale_date', label: 'Scheduled sale date (if set)', type: 'date' },
      { field: 'lender_name', label: 'Lender / servicer' },
      { field: 'attorney_name', label: 'Owner’s attorney (if any)' },
      { field: 'attorney_contact', label: 'Attorney contact' },
    ],
    tasks: [
      { title: 'Look up the foreclosure file with the Clerk of Superior Court and note the file number and hearing date', detail: 'NC Courts eCourts portal → Smart Search by the owner’s name, or call the Clerk’s office in that county.' },
      { title: 'Reach out with care: a handwritten note and a door hanger, then a call. No pressure.', days: 1 },
      { title: 'Estimate equity: today’s value vs. what’s owed (mortgage, back taxes, liens)', days: 2 },
      { title: 'If they owe more than it’s worth, explain a short sale and suggest a HUD-approved housing counselor', days: 3 },
      { title: 'Recommend they talk with a real estate attorney about their options', days: 3,
        detail: 'Don’t give legal advice, and stay well clear of anything resembling a foreclosure-rescue or equity-purchase arrangement.' },
      { title: 'Get written authorization to talk with their lender or servicer (needed for a short sale)', days: 5 },
      { title: 'Have the listing signed well before the hearing', days: -7, from: 'hearing' },
    ],
  },
  {
    value: 'foreclosure_sale', label: 'Foreclosure sale scheduled', icon: '⏰', short: 'Sale scheduled',
    hint: 'A sale date is a hard deadline. After an NC foreclosure sale there is a 10-day upset bid period before it becomes final.',
    fields: [
      { field: 'sale_date', label: 'Sale date', type: 'date' },
      { field: 'case_number', label: 'Foreclosure file #', placeholder: 'e.g. 26 SP 123' },
      { field: 'case_county', label: 'County' },
      { field: 'lender_name', label: 'Lender / trustee' },
      { field: 'attorney_name', label: 'Owner’s attorney (if any)' },
      { field: 'attorney_contact', label: 'Attorney contact' },
    ],
    tasks: [
      { title: 'Confirm the sale date, time and place from the notice of sale', detail: 'The notice is in the special proceeding file and is posted at the courthouse.' },
      { title: 'Tell the owner plainly how much time is left and what has to happen before the sale', days: 1 },
      { title: 'Recommend they talk with an attorney right away about postponement and their options', days: 1 },
      { title: 'Have a listing signed', days: -21, from: 'sale' },
      { title: 'Have an accepted offer, or ask the lender/trustee about postponing the sale', days: -10, from: 'sale' },
      { title: 'Sale day: confirm whether the sale went ahead', days: 0, from: 'sale' },
      { title: 'Upset bid period ends (10 days after the sale is reported); follow up with the owner about next steps', days: 10, from: 'sale' },
    ],
  },
  {
    value: 'probate', label: 'Probate / estate (owner passed away)', icon: '🕊️', short: 'Probate',
    hint: 'Only the personal representative (or the heirs, with the court’s approval where needed) can sell. Let the family set the pace.',
    fields: [
      { field: 'decedent_name', label: 'Owner who passed away' },
      { field: 'date_of_death', label: 'Date of death', type: 'date' },
      { field: 'case_number', label: 'Estate file #', placeholder: 'e.g. 26 E 456' },
      { field: 'case_county', label: 'County' },
      { field: 'representative_name', label: 'Personal representative (executor / administrator)' },
      { field: 'representative_contact', label: 'Representative contact' },
      { field: 'attorney_name', label: 'Estate attorney' },
      { field: 'attorney_contact', label: 'Attorney contact' },
      { field: 'heirs', label: 'Heirs / devisees and how to reach them', type: 'textarea' },
    ],
    tasks: [
      { title: 'Confirm the name of the owner who passed and the date of death' },
      { title: 'Find the estate file with the Clerk of Superior Court and note the file number', detail: 'NC Courts eCourts portal → Smart Search, or the Clerk’s estates division in that county.' },
      { title: 'Identify the personal representative and get a copy of their Letters (testamentary or of administration)', days: 2 },
      { title: 'Ask the estate attorney whether the representative can sell, or whether a court order or all heirs must sign', days: 3 },
      { title: 'List every heir or devisee and how to reach them', days: 5 },
      { title: 'Ask the estate attorney how the creditor-claim period affects when closing can happen', days: 5,
        detail: 'NC estates publish a notice to creditors with a claim period of at least three months.' },
      { title: 'Secure the property: vacant-home insurance, utilities, lockbox, lawn care', days: 7 },
      { title: 'Plan cleanout, repairs and as-is pricing with the family', days: 10 },
    ],
  },
  {
    value: 'inherited', label: 'Inherited (estate settled, heirs own it)', icon: '🔑', short: 'Inherited',
    hint: 'Everyone on title has to agree and sign. Out-of-town heirs often want a simple, as-is sale.',
    fields: [
      { field: 'decedent_name', label: 'Previous owner' },
      { field: 'heirs', label: 'Owners now on title and how to reach them', type: 'textarea' },
      { field: 'case_number', label: 'Estate file # (if known)' },
      { field: 'attorney_name', label: 'Attorney (if any)' },
      { field: 'attorney_contact', label: 'Attorney contact' },
    ],
    tasks: [
      { title: 'Confirm who is on title now (deed or estate file); every owner must sign the listing agreement' },
      { title: 'Check for property taxes owed and liens', days: 2 },
      { title: 'Find out whether every owner agrees to sell; if not, suggest they talk with an attorney', days: 3 },
      { title: 'Talk through keep, sell or rent, and what each heir wants from the sale', days: 5 },
      { title: 'Plan cleanout, repairs and as-is pricing', days: 7 },
      { title: 'Remind the heirs to ask a tax professional about selling inherited property', days: 7 },
    ],
  },
];

export const situationMeta = (s: Situation) => SITUATIONS.find((x) => x.value === s) ?? SITUATIONS[0];

function dueFor(t: Template, o: Pick<ListingOpportunity, 'sale_date' | 'hearing_date'>, today: string) {
  const base = t.from === 'sale' ? o.sale_date : t.from === 'hearing' ? o.hearing_date : today;
  if (!base) return t.from && t.from !== 'today' ? null : addDaysYmd(today, t.days ?? 0);
  const due = addDaysYmd(base, t.days ?? 0);
  // A step anchored before a date that has already passed is due now.
  return t.from && t.from !== 'today' && due < today && (t.days ?? 0) < 0 ? today : due;
}

/** Add the situation's checklist once (it isn't duplicated if the situation is set again). */
export async function seedSituationTasks(o: Pick<ListingOpportunity, 'id' | 'situation' | 'sale_date' | 'hearing_date'>, existing: ListingTask[]) {
  const meta = situationMeta(o.situation);
  if (!meta.tasks.length || existing.some((t) => t.situation === o.situation)) return '';
  const today = toYmd(new Date());
  const start = existing.length;
  const { error } = await createClient().from('fanc_listing_tasks').insert(meta.tasks.map((t, i) => ({
    opportunity_id: o.id, situation: o.situation, title: t.title, detail: t.detail ?? null, due_date: dueFor(t, o, today), sort: start + i,
  })));
  return error?.message ?? '';
}

/** Re-date open steps anchored to the hearing or sale date after those dates change. */
export async function redateSituationTasks(o: Pick<ListingOpportunity, 'situation' | 'sale_date' | 'hearing_date'>, tasks: ListingTask[]) {
  const meta = situationMeta(o.situation);
  const today = toYmd(new Date());
  const supabase = createClient();
  for (const t of tasks.filter((x) => !x.done_at && x.situation === o.situation)) {
    const tpl = meta.tasks.find((x) => x.title === t.title);
    if (!tpl?.from || tpl.from === 'today') continue;
    const due = dueFor(tpl, o, today);
    if (due !== t.due_date) await supabase.from('fanc_listing_tasks').update({ due_date: due }).eq('id', t.id);
  }
}

/** Days until a foreclosure hearing or sale, for the most urgent one on an opportunity. */
export function nextDeadline(o: Pick<ListingOpportunity, 'situation' | 'sale_date' | 'hearing_date'>, today = toYmd(new Date())) {
  const dates = [
    o.hearing_date && { label: 'Foreclosure hearing', on: o.hearing_date },
    o.sale_date && { label: 'Foreclosure sale', on: o.sale_date },
  ].filter((x): x is { label: string; on: string } => !!x && x.on >= today).sort((a, b) => a.on.localeCompare(b.on));
  if (!dates.length || !['pre_foreclosure', 'foreclosure_sale'].includes(o.situation)) return null;
  const days = Math.round((new Date(dates[0].on + 'T12:00').getTime() - new Date(today + 'T12:00').getTime()) / 86400000);
  return { ...dates[0], days };
}
