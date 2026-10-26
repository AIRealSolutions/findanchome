// Client database for past customers and sphere (/dashboard/clients). Rows live in fanc_clients,
// fanc_client_transactions and fanc_client_activity (see supabase-migrations/client_database.sql).

import { createClient } from './supabase/client';

export type ClientStatus = 'prospect' | 'active' | 'past_client' | 'sphere' | 'inactive';
export type ClientActivityKind = 'note' | 'call' | 'text' | 'email' | 'meeting' | 'status' | 'import';
export type TransactionSide = 'buyer' | 'seller' | 'both' | 'referral';

export interface Client {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  secondary_email: string | null;
  phone: string | null;
  secondary_phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  company: string | null;
  spouse_name: string | null;
  birthday: string | null;
  home_anniversary: string | null;
  source: string | null;
  status: ClientStatus;
  lead_type: string | null;
  tags: string[] | null;
  notes: string | null;
  do_not_contact: boolean;
  follow_up_at: string | null;
  last_contacted_at: string | null;
  flexmls_id: string | null;
  source_created_at: string | null;
  import_id: string | null;
  import_raw: Record<string, string> | null;
  consultation_id: string | null;
  referred_by_id: string | null;
}

export interface ClientTransaction {
  id: string;
  client_id: string;
  created_at: string;
  side: TransactionSide;
  property_address: string | null;
  city: string | null;
  zip_code: string | null;
  mls_number: string | null;
  sale_price: number | null;
  closing_date: string | null;
  is_hud: boolean;
  notes: string | null;
}

export interface ClientActivity {
  id: string;
  client_id: string;
  created_at: string;
  author_name: string | null;
  kind: ClientActivityKind;
  body: string;
}

export interface ClientImport {
  id: string;
  created_at: string;
  source: string;
  file_name: string | null;
  total_rows: number;
  created_count: number;
  updated_count: number;
  skipped_count: number;
  undone_at: string | null;
}

export const CLIENT_STATUSES: { value: ClientStatus; label: string; className: string }[] = [
  { value: 'past_client', label: 'Past client', className: 'bg-green-100 text-green-800' },
  { value: 'active', label: 'Active client', className: 'bg-blue-100 text-blue-800' },
  { value: 'prospect', label: 'Prospect', className: 'bg-amber-100 text-amber-800' },
  { value: 'sphere', label: 'Sphere / referral source', className: 'bg-purple-100 text-purple-800' },
  { value: 'inactive', label: 'Inactive', className: 'bg-gray-200 text-gray-700' },
];

export const CLIENT_TYPES = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'both', label: 'Buyer & seller' },
  { value: 'investor', label: 'Investor' },
  { value: 'referral_partner', label: 'Referral partner' },
  { value: 'other', label: 'Other' },
];

export const TRANSACTION_SIDES: { value: TransactionSide; label: string }[] = [
  { value: 'buyer', label: 'Represented buyer' },
  { value: 'seller', label: 'Represented seller' },
  { value: 'both', label: 'Both sides' },
  { value: 'referral', label: 'Referral' },
];

export const clientStatusMeta = (s: ClientStatus) => CLIENT_STATUSES.find((x) => x.value === s) ?? CLIENT_STATUSES[2];
export const clientTypeLabel = (t: string | null) => CLIENT_TYPES.find((x) => x.value === t)?.label ?? t ?? '';

export const clientName = (c: Pick<Client, 'first_name'> & { last_name?: string | null }) =>
  [c.first_name, c.last_name].filter(Boolean).join(' ') || '(no name)';

export const formatMoney = (n: number | null) =>
  n == null ? '' : n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/** "2019-06-14" → "Jun 14, 2019" without shifting the day across time zones. */
export function formatDate(d: string | null, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!d) return '';
  const [y, m, day] = d.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString(undefined, opts);
}

export interface UpcomingDate {
  kind: 'birthday' | 'home_anniversary';
  date: Date;
  daysAway: number;
  years: number;
}

/** Next occurrence of each birthday / home anniversary within `withinDays` (today counts as 0). */
export function upcomingDates(c: Pick<Client, 'birthday' | 'home_anniversary'>, withinDays = 30, now = new Date()): UpcomingDate[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const out: UpcomingDate[] = [];
  for (const kind of ['birthday', 'home_anniversary'] as const) {
    const iso = c[kind];
    if (!iso) continue;
    const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
    let next = new Date(today.getFullYear(), m - 1, d);
    if (next < today) next = new Date(today.getFullYear() + 1, m - 1, d);
    const daysAway = Math.round((next.getTime() - today.getTime()) / 86400000);
    if (daysAway <= withinDays) out.push({ kind, date: next, daysAway, years: next.getFullYear() - y });
  }
  return out.sort((a, b) => a.daysAway - b.daysAway);
}

export function clientsToCsv(clients: Client[]) {
  const cols: [string, (c: Client) => string][] = [
    ['First name', (c) => c.first_name],
    ['Last name', (c) => c.last_name ?? ''],
    ['Email', (c) => c.email ?? ''],
    ['Phone', (c) => c.phone ?? ''],
    ['Secondary phone', (c) => c.secondary_phone ?? ''],
    ['Address', (c) => [c.address_line1, c.address_line2].filter(Boolean).join(', ')],
    ['City', (c) => c.city ?? ''],
    ['State', (c) => c.state ?? ''],
    ['Zip', (c) => c.zip_code ?? ''],
    ['Spouse / partner', (c) => c.spouse_name ?? ''],
    ['Status', (c) => clientStatusMeta(c.status).label],
    ['Type', (c) => clientTypeLabel(c.lead_type)],
    ['Birthday', (c) => c.birthday ?? ''],
    ['Home anniversary', (c) => c.home_anniversary ?? ''],
    ['Tags', (c) => (c.tags ?? []).join('; ')],
    ['Do not contact', (c) => (c.do_not_contact ? 'yes' : '')],
    ['Source', (c) => c.source ?? ''],
    ['Notes', (c) => c.notes ?? ''],
  ];
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [cols.map(([h]) => h).join(','), ...clients.map((c) => cols.map(([, f]) => esc(f(c))).join(','))].join('\n');
}

export function downloadCsv(csv: string, fileName: string, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([csv], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/** All clients, paged past the API's 1000-row cap. */
export async function fetchAllClients() {
  const supabase = createClient();
  const out: Client[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from('fanc_clients').select('*').order('last_name', { ascending: true, nullsFirst: false }).order('first_name').order('id').range(from, from + 999);
    if (error) return { clients: out, error: error.message };
    out.push(...((data ?? []) as Client[]));
    if (!data || data.length < 1000) return { clients: out, error: '' };
  }
}
