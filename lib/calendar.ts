// Client calendar (/dashboard/calendar): birthdays, home anniversaries, important dates from
// fanc_client_dates, seasonal touches for past clients, and follow-ups, expanded into dated events.
// Handled reminders are recorded in fanc_calendar_completions (see supabase-migrations/client_calendar.sql).

import { createClient } from './supabase/client';
import { NO_YEAR } from './client-import';
import { clientName, fetchAllClients, formatDate, type Client } from './clients';
import { isOpen, type Lead } from './leads';

export type DateKind =
  | 'wedding_anniversary' | 'insurance_renewal' | 'flood_insurance_renewal' | 'home_warranty_expiration'
  | 'hoa_dues' | 'mortgage_review' | 'lease_end' | 'custom';

export interface ClientDate {
  id: string;
  client_id: string;
  created_at: string;
  kind: DateKind;
  label: string | null;
  date: string;
  repeats: 'yearly' | 'once';
  remind_days: number;
  provider: string | null;
  notes: string | null;
}

export const DATE_KINDS: { value: DateKind; label: string; icon: string; repeats: 'yearly' | 'once'; remind: number; hint: string }[] = [
  { value: 'insurance_renewal', label: 'Homeowners insurance renewal', icon: '🛡️', repeats: 'yearly', remind: 30, hint: 'A month ahead, suggest they shop quotes before it auto-renews.' },
  { value: 'flood_insurance_renewal', label: 'Flood insurance renewal', icon: '🌊', repeats: 'yearly', remind: 30, hint: 'Flood policies lapse if unpaid; a reminder is a real favor.' },
  { value: 'wedding_anniversary', label: 'Wedding anniversary', icon: '💍', repeats: 'yearly', remind: 3, hint: '' },
  { value: 'home_warranty_expiration', label: 'Home warranty ends', icon: '🔧', repeats: 'once', remind: 30, hint: 'Usually one year after closing.' },
  { value: 'mortgage_review', label: 'Mortgage / refinance check-in', icon: '📉', repeats: 'yearly', remind: 14, hint: 'A yearly look at whether refinancing makes sense.' },
  { value: 'hoa_dues', label: 'HOA dues', icon: '🏘️', repeats: 'yearly', remind: 7, hint: '' },
  { value: 'lease_end', label: 'Lease ends', icon: '🔑', repeats: 'once', remind: 60, hint: 'Renters thinking about buying.' },
  { value: 'custom', label: 'Other date', icon: '📌', repeats: 'yearly', remind: 7, hint: '' },
];

export const dateKindMeta = (k: DateKind) => DATE_KINDS.find((x) => x.value === k) ?? DATE_KINDS[DATE_KINDS.length - 1];
export const dateLabel = (d: Pick<ClientDate, 'kind' | 'label'>) => (d.kind === 'custom' && d.label ? d.label : d.label || dateKindMeta(d.kind).label);

/** Yearly reminders to reach out to every past client. Dates are the usual ones for coastal NC. */
export const SEASONAL_TOUCHES = [
  { slug: 'nc-property-tax', month: 1, day: 5, remind: 21, icon: '🧾', title: 'NC property taxes due without interest', detail: 'Remind past clients that the last day to pay county property taxes without interest is about January 5.' },
  { slug: 'spring-value-update', month: 3, day: 15, remind: 7, icon: '🌷', title: 'Spring home-value update', detail: 'Send past clients what homes like theirs are selling for before the spring market.' },
  { slug: 'hurricane-season', month: 6, day: 1, remind: 14, icon: '🌀', title: 'Hurricane season starts', detail: 'Remind past clients to review homeowners and flood coverage and storm-prep their homes.' },
  { slug: 'holiday-check-in', month: 12, day: 1, remind: 7, icon: '🎁', title: 'Holiday check-in', detail: 'Send past clients a holiday card or note.' },
];

export type EventKind = 'birthday' | 'home_anniversary' | DateKind | 'season' | 'client_follow_up' | 'lead_follow_up';

export interface CalEvent {
  key: string; // stable per source; with occursOn identifies a completion
  occursOn: string; // YYYY-MM-DD
  kind: EventKind;
  icon: string;
  title: string;
  detail?: string;
  client?: Client;
  href: string;
  remindFrom: string; // YYYY-MM-DD the reminder starts showing
  completable: boolean;
  done: boolean;
  sms?: string;
  emailSubject?: string;
}

// ───────────────────────── Date helpers (all-day, local time) ─────────────────────────

const pad = (n: number) => String(n).padStart(2, '0');
export const toYmd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseYmd = (s: string) => {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDaysYmd = (s: string, days: number) => {
  const d = parseYmd(s);
  d.setDate(d.getDate() + days);
  return toYmd(d);
};
export const daysBetween = (a: string, b: string) => Math.round((parseYmd(b).getTime() - parseYmd(a).getTime()) / 86400000);

/** Same month/day in `year`; Feb 29 falls on Feb 28 in other years. */
function onYear(month: number, day: number, year: number) {
  const d = new Date(year, month - 1, day);
  return d.getMonth() === month - 1 ? d : new Date(year, month, 0);
}

/** Occurrences of a date between from and to (inclusive). Yearly dates start in their own year. */
export function occurrences(date: string, repeats: 'yearly' | 'once', from: string, to: string) {
  if (repeats === 'once') return date >= from && date <= to ? [date] : [];
  const [y, m, d] = date.slice(0, 10).split('-').map(Number);
  const out: string[] = [];
  for (let year = Math.max(parseYmd(from).getFullYear(), y === NO_YEAR ? 0 : y); year <= parseYmd(to).getFullYear(); year++) {
    const occ = toYmd(onYear(m, d, year));
    if (occ >= from && occ <= to && occ >= date.slice(0, 10).replace(/^1904/, String(year))) out.push(occ);
  }
  return out;
}

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

// ───────────────────────── Building events ─────────────────────────

export interface CalendarData {
  clients: Client[];
  dates: ClientDate[];
  leads: Pick<Lead, 'id' | 'name' | 'status' | 'follow_up_at'>[];
  done: Set<string>;
}

export async function fetchCalendarData(from: string, to: string): Promise<CalendarData & { error: string }> {
  const supabase = createClient();
  const [c, d, l, k] = await Promise.all([
    fetchAllClients(),
    supabase.from('fanc_client_dates').select('*').limit(10000),
    supabase.from('fanc_consultation_requests').select('id, name, status, follow_up_at').not('follow_up_at', 'is', null).limit(1000),
    supabase.from('fanc_calendar_completions').select('event_key, occurs_on').gte('occurs_on', from).lte('occurs_on', to).limit(10000),
  ]);
  return {
    clients: c.clients,
    dates: (d.data ?? []) as ClientDate[],
    leads: (l.data ?? []) as CalendarData['leads'],
    done: new Set((k.data ?? []).map((x) => `${x.event_key}|${x.occurs_on}`)),
    error: c.error || (d.error || l.error || k.error)?.message || '',
  };
}

/**
 * Every event between from and to. Follow-ups are dated by their due day; with `overdueFollowUps`, ones due
 * before `from` are included too, since they stay open until cleared.
 */
export function buildEvents(data: CalendarData, from: string, to: string, sender: string, overdueFollowUps = false): CalEvent[] {
  const events: CalEvent[] = [];
  const sign = sender ? ` – ${sender}` : '';
  const push = (e: Omit<CalEvent, 'done'>) => events.push({ ...e, done: data.done.has(`${e.key}|${e.occursOn}`) });
  const byId = new Map(data.clients.map((c) => [c.id, c]));

  for (const c of data.clients) {
    if (c.do_not_contact) continue;
    const first = c.first_name;
    const href = `/dashboard/clients/${c.id}`;
    if (c.birthday) {
      const year = +c.birthday.slice(0, 4);
      for (const on of occurrences(c.birthday, 'yearly', from, to)) {
        const age = year === NO_YEAR ? 0 : +on.slice(0, 4) - year;
        push({
          key: `birthday:${c.id}`, occursOn: on, kind: 'birthday', icon: '🎂', client: c, href, completable: true,
          title: `${clientName(c)}'s birthday`, detail: age > 0 && age < 120 ? `Turns ${age}` : undefined,
          remindFrom: addDaysYmd(on, -2),
          sms: `Happy birthday, ${first}! 🎉 Wishing you a wonderful year ahead.${sign}`, emailSubject: `Happy birthday, ${first}!`,
        });
      }
    }
    if (c.home_anniversary) {
      const year = +c.home_anniversary.slice(0, 4);
      for (const on of occurrences(c.home_anniversary, 'yearly', from, to)) {
        const n = +on.slice(0, 4) - year;
        if (n < 1) continue;
        push({
          key: `home_anniversary:${c.id}`, occursOn: on, kind: 'home_anniversary', icon: '🏡', client: c, href, completable: true,
          title: `${clientName(c)}: ${plural(n, 'year')} in their home`, detail: c.address_line1 ?? undefined,
          remindFrom: addDaysYmd(on, -7),
          sms: `Happy ${n}-year home anniversary, ${first}! Hard to believe it's been ${plural(n, 'year')} since you got the keys. If you're ever curious what your home is worth today, I'm happy to run the numbers.${sign}`,
          emailSubject: `Happy ${n}-year home anniversary!`,
        });
      }
    }
    if (c.follow_up_at) {
      const on = toYmd(new Date(c.follow_up_at));
      if ((on >= from || overdueFollowUps) && on <= to) {
        push({ key: `client_follow_up:${c.id}`, occursOn: on, kind: 'client_follow_up', icon: '📞', client: c, href, completable: false, title: `Follow up with ${clientName(c)}`, remindFrom: on });
      }
    }
  }

  for (const d of data.dates) {
    const c = byId.get(d.client_id);
    if (!c || c.do_not_contact) continue;
    const meta = dateKindMeta(d.kind);
    for (const on of occurrences(d.date, d.repeats, from, to)) {
      const when = formatDate(on, { month: 'long', day: 'numeric' });
      const first = c.first_name;
      const sms: Partial<Record<DateKind, string>> = {
        insurance_renewal: `Hi ${first}, your homeowners insurance${d.provider ? ` with ${d.provider}` : ''} renews around ${when}. Rates have been moving on the coast, so it may be worth getting a couple of quotes first. Happy to connect you with local agents.${sign}`,
        flood_insurance_renewal: `Hi ${first}, a reminder that your flood insurance${d.provider ? ` with ${d.provider}` : ''} renews around ${when}. Make sure it doesn't lapse, especially heading into storm season.${sign}`,
        wedding_anniversary: `Happy anniversary to you both, ${first}! Hope you have a great day.${sign}`,
        home_warranty_expiration: `Hi ${first}, your home warranty${d.provider ? ` with ${d.provider}` : ''} ends ${when}. Let me know if you'd like to renew or compare plans.${sign}`,
        mortgage_review: `Hi ${first}, checking in on your mortgage. It may be worth a quick look at whether refinancing makes sense right now. Happy to connect you with a lender.${sign}`,
        hoa_dues: `Hi ${first}, a friendly reminder that your HOA dues are coming up ${when}.${sign}`,
        lease_end: `Hi ${first}, your lease is up ${when}. If you're thinking about buying instead of renewing, I'd love to help.${sign}`,
      };
      push({
        key: `date:${d.id}`, occursOn: on, kind: d.kind, icon: meta.icon, client: c, href: `/dashboard/clients/${c.id}`, completable: true,
        title: `${clientName(c)}: ${dateLabel(d)}`, detail: [d.provider, d.notes].filter(Boolean).join(' · ') || undefined,
        remindFrom: addDaysYmd(on, -d.remind_days),
        sms: sms[d.kind], emailSubject: dateLabel(d),
      });
    }
  }

  const pastClients = data.clients.filter((c) => c.status === 'past_client' && !c.do_not_contact).length;
  for (const s of SEASONAL_TOUCHES) {
    for (let year = parseYmd(from).getFullYear(); year <= parseYmd(to).getFullYear(); year++) {
      const on = toYmd(onYear(s.month, s.day, year));
      if (on < from || on > to) continue;
      push({
        key: `season:${s.slug}`, occursOn: on, kind: 'season', icon: s.icon, href: '/dashboard/clients', completable: true,
        title: s.title, detail: `${s.detail} (${plural(pastClients, 'past client')})`, remindFrom: addDaysYmd(on, -s.remind),
      });
    }
  }

  for (const l of data.leads) {
    if (!l.follow_up_at || !isOpen(l)) continue;
    const on = toYmd(new Date(l.follow_up_at));
    if ((on >= from || overdueFollowUps) && on <= to) {
      push({ key: `lead_follow_up:${l.id}`, occursOn: on, kind: 'lead_follow_up', icon: '📥', href: `/dashboard/leads/${l.id}`, completable: false, title: `Follow up with lead ${l.name}`, remindFrom: on });
    }
  }

  return events.sort((a, b) => a.occursOn.localeCompare(b.occursOn) || a.title.localeCompare(b.title));
}

/** Mark an occurrence handled (or not); handled ones are also logged on the client's timeline. */
export async function setDone(e: CalEvent, done: boolean, author: { id: string; name: string }, how = 'Reached out') {
  const supabase = createClient();
  if (!done) {
    const { error } = await supabase.from('fanc_calendar_completions').delete().eq('event_key', e.key).eq('occurs_on', e.occursOn);
    return error?.message ?? '';
  }
  const { error } = await supabase.from('fanc_calendar_completions').insert({ event_key: e.key, occurs_on: e.occursOn, client_id: e.client?.id ?? null });
  if (error) return error.message;
  if (e.client) {
    await supabase.from('fanc_client_activity').insert({
      client_id: e.client.id, kind: 'note', author_id: author.id, author_name: author.name,
      body: `${how}: ${e.title.replace(`${clientName(e.client)}: `, '').replace(`${clientName(e.client)}'s `, '')} (${formatDate(e.occursOn)})`,
    });
  }
  return '';
}

// ───────────────────────── iCalendar export ─────────────────────────

const icsText = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** All-day events for Google Calendar, Apple Calendar or Outlook, with a reminder alarm. */
export function eventsToIcs(events: CalEvent[]) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FindaNChome//Client Calendar//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:FindaNChome clients'];
  for (const e of events) {
    const start = e.occursOn.replace(/-/g, '');
    const end = addDaysYmd(e.occursOn, 1).replace(/-/g, '');
    const lead = Math.max(0, daysBetween(e.remindFrom, e.occursOn));
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.key.replace(/[^a-z0-9_-]/gi, '-')}-${start}@findanchome.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${icsText(`${e.icon} ${e.title}`)}`,
      ...(e.detail || e.sms ? [`DESCRIPTION:${icsText([e.detail, e.sms && `Suggested message: ${e.sms}`].filter(Boolean).join('\n\n'))}`] : []),
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsText(e.title)}`, `TRIGGER:-P${lead}DT0H0M0S`, 'END:VALARM',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/** RFC 5545: lines longer than 75 octets continue on the next line after a space. */
function foldLine(line: string) {
  const enc = new TextEncoder();
  const parts: string[] = [];
  let cur = '';
  let bytes = 0;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    if (bytes + n > (parts.length ? 74 : 75)) {
      parts.push(cur);
      cur = '';
      bytes = 0;
    }
    cur += ch;
    bytes += n;
  }
  parts.push(cur);
  return parts.join('\r\n ');
}
