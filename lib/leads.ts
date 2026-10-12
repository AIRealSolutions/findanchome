// Consultation leads for the dashboard CRM (/dashboard/leads). Rows come from fanc_consultation_requests
// (see supabase-migrations/consultation_requests.sql and consultation_crm.sql).

import { labelFor } from './consultation';

export type LeadStatus = 'new' | 'contacted' | 'scheduled' | 'client' | 'closed';
export type LeadPriority = 'hot' | 'warm' | 'cold';
export type ActivityKind = 'note' | 'call' | 'text' | 'email' | 'meeting' | 'status';

export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  phone: string | null;
  preferred_contact: 'call' | 'text' | 'email' | null;
  intent: string[];
  timeframe: string | null;
  price_range: string | null;
  financing: string | null;
  counties: string[];
  communities: string[];
  neighborhoods: string[];
  lifestyles: string[];
  must_haves: string[];
  message: string | null;
  source_page: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  follow_up_at: string | null;
  last_contacted_at: string | null;
  notes: string | null;
}

export interface LeadActivity {
  id: string;
  request_id: string;
  created_at: string;
  author_name: string | null;
  kind: ActivityKind;
  body: string;
}

export const STATUSES: { value: LeadStatus; label: string; className: string }[] = [
  { value: 'new', label: 'New', className: 'bg-blue-100 text-blue-800' },
  { value: 'contacted', label: 'Contacted', className: 'bg-amber-100 text-amber-800' },
  { value: 'scheduled', label: 'Appointment set', className: 'bg-purple-100 text-purple-800' },
  { value: 'client', label: 'Client', className: 'bg-green-100 text-green-800' },
  { value: 'closed', label: 'Closed / not a fit', className: 'bg-gray-200 text-gray-700' },
];

export const PRIORITIES: { value: LeadPriority; label: string; className: string }[] = [
  { value: 'hot', label: '🔥 Hot', className: 'bg-red-100 text-red-800' },
  { value: 'warm', label: 'Warm', className: 'bg-orange-50 text-orange-800' },
  { value: 'cold', label: 'Cold', className: 'bg-slate-100 text-slate-700' },
];

export const ACTIVITY_KINDS: { value: Exclude<ActivityKind, 'status'>; label: string; icon: string }[] = [
  { value: 'call', label: 'Call', icon: '📞' },
  { value: 'text', label: 'Text', icon: '💬' },
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'meeting', label: 'Meeting', icon: '🤝' },
  { value: 'note', label: 'Note', icon: '📝' },
];

export const ACTIVITY_ICONS: Record<ActivityKind, string> = {
  call: '📞', text: '💬', email: '✉️', meeting: '🤝', note: '📝', status: '🔄',
};

export const statusMeta = (s: LeadStatus) => STATUSES.find((x) => x.value === s) ?? STATUSES[0];
export const priorityMeta = (p: LeadPriority) => PRIORITIES.find((x) => x.value === p) ?? PRIORITIES[1];

/** Leads still being worked (not yet a client or closed). */
export const isOpen = (l: Pick<Lead, 'status'>) => l.status === 'new' || l.status === 'contacted' || l.status === 'scheduled';

export function followUpState(l: Pick<Lead, 'follow_up_at' | 'status'>, now = new Date()) {
  if (!l.follow_up_at || !isOpen(l)) return null;
  const due = new Date(l.follow_up_at);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  if (due < now && due.toDateString() !== now.toDateString()) return 'overdue' as const;
  if (due <= endOfToday) return 'today' as const;
  return 'upcoming' as const;
}

export function relativeTime(iso: string, now = new Date()) {
  const diff = (now.getTime() - new Date(iso).getTime()) / 1000;
  const abs = Math.abs(diff);
  const fmt = (n: number, unit: string) => `${Math.round(n)} ${unit}${Math.round(n) === 1 ? '' : 's'}`;
  const text =
    abs < 60 ? 'just now'
    : abs < 3600 ? fmt(abs / 60, 'minute')
    : abs < 86400 ? fmt(abs / 3600, 'hour')
    : abs < 86400 * 30 ? fmt(abs / 86400, 'day')
    : new Date(iso).toLocaleDateString();
  if (text === 'just now' || abs >= 86400 * 30) return text;
  return diff >= 0 ? `${text} ago` : `in ${text}`;
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/** Value for <input type="datetime-local"> in the viewer's time zone. */
export function toLocalInput(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const labels = (kind: Parameters<typeof labelFor>[0], values: string[]) => values.map((v) => labelFor(kind, v));

/** Phone number suitable for tel:/sms: links. */
export const dialable = (phone: string) => phone.replace(/[^\d+]/g, '');

export function leadsToCsv(leads: Lead[]) {
  const cols: [string, (l: Lead) => string][] = [
    ['Received', (l) => new Date(l.created_at).toISOString()],
    ['Name', (l) => l.name],
    ['Email', (l) => l.email],
    ['Phone', (l) => l.phone ?? ''],
    ['Preferred contact', (l) => l.preferred_contact ?? ''],
    ['Status', (l) => statusMeta(l.status).label],
    ['Priority', (l) => priorityMeta(l.priority).label.replace('🔥 ', '')],
    ['Follow-up', (l) => (l.follow_up_at ? new Date(l.follow_up_at).toISOString() : '')],
    ['Last contacted', (l) => (l.last_contacted_at ? new Date(l.last_contacted_at).toISOString() : '')],
    ['Looking to', (l) => labels('intent', l.intent).join('; ')],
    ['Timeframe', (l) => l.timeframe ?? ''],
    ['Price range', (l) => l.price_range ?? ''],
    ['Financing', (l) => l.financing ?? ''],
    ['Counties', (l) => labels('counties', l.counties).join('; ')],
    ['Communities', (l) => labels('communities', l.communities).join('; ')],
    ['Neighborhoods', (l) => labels('neighborhoods', l.neighborhoods).join('; ')],
    ['Lifestyles', (l) => labels('lifestyles', l.lifestyles).join('; ')],
    ['Must-haves', (l) => l.must_haves.join('; ')],
    ['Message', (l) => l.message ?? ''],
    ['Source page', (l) => l.source_page ?? ''],
  ];
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [cols.map(([h]) => h).join(','), ...leads.map((l) => cols.map(([, f]) => esc(f(l))).join(','))].join('\n');
}
