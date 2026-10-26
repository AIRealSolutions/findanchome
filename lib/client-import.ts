// CSV import of contacts into the client database (/dashboard/clients/import). Built for Flexmls contact
// exports, whose column names vary by export type (Flexmls Web contacts export vs. the Spark API field
// names), so every column can be re-mapped by hand before anything is written.

import type { Client, ClientStatus, ClientTransaction } from './clients';

// ───────────────────────── CSV parsing ─────────────────────────

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}

/** File text as UTF-8, falling back to Windows-1252 (what Excel and many CRM exports write). */
export function decodeFile(buf: ArrayBuffer) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch {
    return new TextDecoder('windows-1252').decode(buf);
  }
}

/** RFC 4180 CSV (quoted fields, embedded commas/newlines, "" escapes). Tab-separated files are detected too. */
export function parseCsv(text: string): ParsedCsv {
  const src = text.replace(/^﻿/, '');
  const firstLine = src.slice(0, src.search(/\r?\n|$/));
  const delim = firstLine.includes('\t') && !firstLine.includes(',') ? '\t' : firstLine.split(';').length > firstLine.split(',').length ? ';' : ',';

  const records: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
    } else if (ch === '"' && field === '') quoted = true;
    else if (ch === delim) {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      records.push(row);
      row = [];
      field = '';
    } else field += ch;
  }
  if (field !== '' || row.length) {
    row.push(field);
    records.push(row);
  }

  const nonEmpty = records.filter((r) => r.some((v) => v.trim() !== ''));
  if (nonEmpty.length === 0) return { headers: [], rows: [] };

  const seen = new Map<string, number>();
  const headers = nonEmpty[0].map((h, i) => {
    const base = h.trim() || `Column ${i + 1}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base} (${n})`;
  });
  const rows = nonEmpty.slice(1).map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? '').trim()])));
  return { headers, rows };
}

// ───────────────────────── Field mapping ─────────────────────────

export type FieldKey =
  | 'flexmls_id' | 'full_name' | 'first_name' | 'last_name' | 'email' | 'secondary_email'
  | 'primary_phone' | 'mobile_phone' | 'home_phone' | 'work_phone' | 'address_line1' | 'address_line2' | 'city' | 'state' | 'zip_code'
  | 'company' | 'spouse_name' | 'spouse_last_name' | 'birthday' | 'home_anniversary' | 'lead_type' | 'tags' | 'notes' | 'other_info' | 'referred_by' | 'source_created_at'
  | 'closing_date' | 'sale_price' | 'mls_number' | 'transaction_address';

export const IMPORT_FIELDS: { key: FieldKey; label: string; group: 'Contact' | 'Address' | 'Details' | 'Closed sale'; aliases: string[] }[] = [
  { key: 'first_name', label: 'First name', group: 'Contact', aliases: ['firstname', 'first', 'givenname', 'fname', 'contactfirstname', 'buyerfirstname'] },
  { key: 'last_name', label: 'Last name', group: 'Contact', aliases: ['lastname', 'last', 'familyname', 'surname', 'lname', 'contactlastname', 'buyerlastname'] },
  { key: 'full_name', label: 'Full name (split automatically)', group: 'Contact', aliases: ['name', 'fullname', 'displayname', 'primaryname', 'contactname', 'contact', 'clientname'] },
  { key: 'email', label: 'Email', group: 'Contact', aliases: ['email', 'emailaddress', 'primaryemail', 'email1', 'emailaddress1', 'personalemail', 'homeemail'] },
  { key: 'secondary_email', label: 'Second email', group: 'Contact', aliases: ['secondaryemail', 'email2', 'emailaddress2', 'alternateemail', 'otheremail', 'workemail', 'tertiaryemail'] },
  { key: 'primary_phone', label: 'Primary phone', group: 'Contact', aliases: ['phoneprimary', 'primaryphone', 'phone', 'phonenumber', 'phone1', 'mainphone'] },
  { key: 'mobile_phone', label: 'Mobile phone', group: 'Contact', aliases: ['phonemobile', 'mobilephone', 'mobile', 'cellphone', 'cell', 'mobilephonenumber', 'cellphonenumber'] },
  { key: 'home_phone', label: 'Home phone', group: 'Contact', aliases: ['homephone', 'home', 'homephonenumber', 'phone2', 'otherphone', 'otherphonenumber'] },
  { key: 'work_phone', label: 'Work phone', group: 'Contact', aliases: ['workphone', 'work', 'businessphone', 'officephone', 'workphonenumber'] },
  { key: 'address_line1', label: 'Street address', group: 'Address', aliases: ['address', 'streetaddress', 'address1', 'addressline1', 'homeaddress', 'homestreetaddress', 'mailingaddress', 'street', 'homestreet', 'homeaddress1', 'addresshomestreet1', 'addresshomestreet', 'addresshome'] },
  { key: 'address_line2', label: 'Address line 2', group: 'Address', aliases: ['address2', 'addressline2', 'unit', 'apt', 'suite', 'homeaddress2', 'addresshomestreet2'] },
  { key: 'city', label: 'City', group: 'Address', aliases: ['city', 'homecity', 'addresshomecity', 'homelocality', 'locality', 'mailingcity', 'town'] },
  { key: 'state', label: 'State', group: 'Address', aliases: ['state', 'homestate', 'addresshomestate', 'homeregion', 'region', 'stateorprovince', 'mailingstate', 'province'] },
  { key: 'zip_code', label: 'Zip', group: 'Address', aliases: ['zip', 'zipcode', 'postalcode', 'homezip', 'addresshomezip', 'addresshomepostalcode', 'homepostalcode', 'mailingzip', 'postcode', 'zip5'] },
  { key: 'company', label: 'Company', group: 'Details', aliases: ['company', 'companyname', 'organization', 'business', 'employer'] },
  { key: 'spouse_name', label: 'Spouse / partner', group: 'Details', aliases: ['spouse', 'spousename', 'partner', 'spousepartner', 'significantother', 'cobuyer', 'spousefirstname'] },
  { key: 'spouse_last_name', label: 'Spouse last name', group: 'Details', aliases: ['spouselastname', 'partnerlastname'] },
  { key: 'birthday', label: 'Birthday', group: 'Details', aliases: ['birthday', 'birthdate', 'dateofbirth', 'dob', 'bday'] },
  { key: 'home_anniversary', label: 'Home anniversary', group: 'Details', aliases: ['homeanniversary', 'purchaseanniversary', 'closeanniversary'] },
  { key: 'lead_type', label: 'Contact type', group: 'Details', aliases: ['contacttype', 'type', 'clienttype', 'category', 'leadtype', 'role'] },
  { key: 'tags', label: 'Tags / groups', group: 'Details', aliases: ['tags', 'tag', 'groups', 'group', 'contactgroups', 'categories', 'labels', 'lists'] },
  { key: 'notes', label: 'Notes', group: 'Details', aliases: ['notes', 'note', 'comments', 'comment', 'description', 'remarks'] },
  { key: 'other_info', label: 'Other info (added to notes)', group: 'Details', aliases: ['other', 'otherinfo', 'additionalinfo', 'custom'] },
  { key: 'referred_by', label: 'Referred by / lead source (added to notes)', group: 'Details', aliases: ['referredby', 'referral', 'referralsource', 'leadsource'] },
  { key: 'flexmls_id', label: 'Flexmls contact ID', group: 'Details', aliases: ['id', 'contactid', 'flexmlsid', 'contactkey', 'contactnumber', 'recordid'] },
  { key: 'source_created_at', label: 'Flexmls date added / updated', group: 'Details', aliases: ['created', 'datecreated', 'createddate', 'dateadded', 'added', 'createdon', 'createdtimestamp', 'timestamp'] },
  { key: 'closing_date', label: 'Closing date', group: 'Closed sale', aliases: ['closingdate', 'closedate', 'closeddate', 'dateclosed', 'settlementdate', 'purchasedate'] },
  { key: 'sale_price', label: 'Sale price', group: 'Closed sale', aliases: ['saleprice', 'closeprice', 'closedprice', 'soldprice', 'purchaseprice', 'price'] },
  { key: 'mls_number', label: 'MLS #', group: 'Closed sale', aliases: ['mls', 'mlsnumber', 'mlsno', 'listingid', 'listingnumber', 'mlsid'] },
  { key: 'transaction_address', label: 'Sold property address', group: 'Closed sale', aliases: ['propertyaddress', 'soldaddress', 'listingaddress', 'subjectproperty', 'purchasedaddress'] },
];

export type FieldMapping = Partial<Record<FieldKey, string>>;

const normKey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Best-guess column for each field, by header name. Each column is used for at most one field. */
export function autoMap(headers: string[]): FieldMapping {
  const mapping: FieldMapping = {};
  const used = new Set<string>();
  for (const f of IMPORT_FIELDS) {
    for (const alias of f.aliases) {
      const h = headers.find((x) => !used.has(x) && normKey(x) === alias);
      if (h) {
        mapping[f.key] = h;
        used.add(h);
        break;
      }
    }
  }
  return mapping;
}

// ───────────────────────── Value cleanup ─────────────────────────

const STATES: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO', connecticut: 'CT',
  delaware: 'DE', districtofcolumbia: 'DC', florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID', illinois: 'IL',
  indiana: 'IN', iowa: 'IA', kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO', montana: 'MT',
  nebraska: 'NE', nevada: 'NV', newhampshire: 'NH', newjersey: 'NJ', newmexico: 'NM', newyork: 'NY',
  northcarolina: 'NC', northdakota: 'ND', ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA',
  rhodeisland: 'RI', southcarolina: 'SC', southdakota: 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT',
  vermont: 'VT', virginia: 'VA', washington: 'WA', westvirginia: 'WV', wisconsin: 'WI', wyoming: 'WY',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** Year stored for birthdays exported without one ("03/15"); a leap year so Feb 29 survives. */
export const NO_YEAR = 1904;

export const cleanEmail = (v: string) => {
  const e = v.trim().toLowerCase().replace(/^mailto:/, '');
  return EMAIL_RE.test(e) ? e : null;
};

/** Ten-digit US numbers become (910) 555-1234; anything else is kept as typed. */
export function cleanPhone(v: string) {
  const t = v.trim();
  if (!t) return null;
  const [main, ext] = t.split(/\s*(?:x|ext\.?|extension)\s*/i);
  let d = main.replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1);
  if (d.length !== 10) return d.length >= 7 ? t : null;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}${ext ? ` x${ext.replace(/\D/g, '')}` : ''}`;
}

export const phoneKey = (v: string | null) => {
  const d = (v ?? '').replace(/\D/g, '');
  return d.length >= 10 ? d.slice(-10) : '';
};

export function cleanState(v: string) {
  const t = v.trim();
  if (/^[a-z]{2}$/i.test(t)) return t.toUpperCase();
  return STATES[normKey(t)] ?? (t ? t.slice(0, 2).toUpperCase() : null);
}

const pad = (n: number) => String(n).padStart(2, '0');
const validYmd = (y: number, m: number, d: number) => {
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d ? `${y}-${pad(m)}-${pad(d)}` : null;
};
const fullYear = (y: number) => (y >= 100 ? y : y + (y > (new Date().getFullYear() % 100) + 1 ? 1900 : 2000));

/** Parses 2019-06-14, 6/14/2019, 6/14/19, 6-14-2019, "June 14, 2019", "14 Jun 2019", "Sat Apr 24 13:52:49 2021" and yearless 6/14 → YYYY-MM-DD. */
export function parseDate(v: string): string | null {
  const t = v.trim();
  if (!t) return null;
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return validYmd(+m[1], +m[2], +m[3]);
  m = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\b/);
  if (m) return validYmd(fullYear(+m[3]), +m[1], +m[2]);
  m = t.match(/^(\d{1,2})[/.-](\d{1,2})$/);
  if (m) return validYmd(NO_YEAR, +m[1], +m[2]);
  m = t.match(/^([a-z]{3})[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i);
  if (m && MONTHS.includes(m[1].toLowerCase())) return validYmd(+m[3], MONTHS.indexOf(m[1].toLowerCase()) + 1, +m[2]);
  m = t.match(/^(?:[a-z]{3},?\s+)?([a-z]{3})[a-z]*\.?\s+(\d{1,2})\s+\d{1,2}:\d{2}(?::\d{2})?\s+(?:[a-z]{3,4}\s+)?(\d{4})$/i);
  if (m && MONTHS.includes(m[1].toLowerCase())) return validYmd(+m[3], MONTHS.indexOf(m[1].toLowerCase()) + 1, +m[2]);
  m = t.match(/^(\d{1,2})\s+([a-z]{3})[a-z]*\.?,?\s+(\d{4})/i);
  if (m && MONTHS.includes(m[2].toLowerCase())) return validYmd(+m[3], MONTHS.indexOf(m[2].toLowerCase()) + 1, +m[1]);
  return null;
}

export function parsePrice(v: string) {
  const n = Number(v.replace(/[$,\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const splitList = (v: string) => v.split(/[;,|]/).map((s) => s.trim()).filter(Boolean);

export function contactType(v: string) {
  const t = v.toLowerCase();
  if (!t) return null;
  if (/buy/.test(t) && /sell|list/.test(t)) return 'both';
  if (/buy|purchas/.test(t)) return 'buyer';
  if (/sell|list|vendor of property/.test(t)) return 'seller';
  if (/invest/.test(t)) return 'investor';
  if (/agent|lender|attorney|inspector|referr|partner|vendor|broker/.test(t)) return 'referral_partner';
  return 'other';
}

function splitName(full: string) {
  const t = full.trim();
  if (!t) return { first: '', last: '' };
  if (t.includes(',')) {
    const [last, first] = t.split(',', 2).map((s) => s.trim());
    return { first, last };
  }
  const parts = t.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
}

// ───────────────────────── Rows → records ─────────────────────────

export type NewClient = Omit<Client, 'id' | 'created_at' | 'updated_at' | 'import_id' | 'follow_up_at' | 'last_contacted_at'>;
export type NewTransaction = Omit<ClientTransaction, 'id' | 'client_id' | 'created_at'>;

/** Flexmls groups / tags that mean the contact already bought or sold with you. */
export const PAST_CLIENT_TAG = /\b(bought|closed|sold|past clients?|former clients?)\b/i;

export interface ImportOptions {
  status: ClientStatus;
  tag: string;
  source: string;
}

export interface ImportRecord {
  row: number; // 1-based data row, matching the spreadsheet line minus the header
  client: NewClient | null;
  txn: NewTransaction | null;
  warnings: string[];
}

export function rowToRecord(raw: Record<string, string>, row: number, mapping: FieldMapping, opts: ImportOptions): ImportRecord {
  const get = (k: FieldKey) => (mapping[k] ? (raw[mapping[k]!] ?? '').trim() : '');
  const warnings: string[] = [];

  let first = get('first_name');
  let last = get('last_name');
  if (!first && !last && get('full_name')) ({ first, last } = splitName(get('full_name')));

  const emailRaw = get('email');
  const email = emailRaw ? cleanEmail(emailRaw) : null;
  if (emailRaw && !email) warnings.push(`Email "${emailRaw}" is not valid and was left off`);
  let secondary = get('secondary_email') ? cleanEmail(get('secondary_email')) : null;
  if (secondary === email) secondary = null;

  const phones = [get('primary_phone'), get('mobile_phone'), get('home_phone'), get('work_phone')]
    .map(cleanPhone)
    .filter((p): p is string => !!p)
    .filter((p, i, all) => all.findIndex((q) => (phoneKey(q) || q) === (phoneKey(p) || p)) === i);

  const company = get('company') || null;
  if (!first && !last) {
    if (company) first = company;
    else if (email) first = email.split('@')[0];
  }
  if (!first && !last && !email && phones.length === 0) {
    return { row, client: null, txn: null, warnings: ['No name, email or phone'] };
  }
  if (!first) {
    first = last;
    last = '';
  }

  const dateField = (k: FieldKey, label: string) => {
    const v = get(k);
    const d = v ? parseDate(v) : null;
    if (v && !d) warnings.push(`${label} "${v}" was not understood`);
    return d;
  };
  const birthday = dateField('birthday', 'Birthday');
  const closingDate = dateField('closing_date', 'Closing date');
  const anniversary = dateField('home_anniversary', 'Home anniversary') ?? closingDate;
  const created = dateField('source_created_at', 'Date added');

  const typeRaw = get('lead_type');
  const tags = [...splitList(get('tags')), ...(typeRaw ? [typeRaw] : []), ...(opts.tag.trim() ? [opts.tag.trim()] : [])];

  // Flexmls form leads often carry only a submission timestamp in "other"; that isn't worth a note.
  const otherInfo = /^\d{4}-\d{2}-\d{2}T[\d:.]+(Z|[+-]\d{2}:?\d{2})?$/.test(get('other_info')) ? '' : get('other_info');
  const importRaw = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== ''));

  const client: NewClient = {
    first_name: first,
    last_name: last || null,
    email,
    secondary_email: secondary,
    phone: phones[0] ?? null,
    secondary_phone: phones[1] ?? null,
    address_line1: get('address_line1') || null,
    address_line2: get('address_line2') || null,
    city: get('city') || null,
    state: get('state') ? cleanState(get('state')) : null,
    zip_code: get('zip_code') ? get('zip_code').slice(0, 10) : null,
    company,
    spouse_name: [get('spouse_name'), get('spouse_last_name')].filter(Boolean).join(' ') || null,
    birthday,
    home_anniversary: anniversary,
    source: opts.source,
    status: PAST_CLIENT_TAG.test(tags.join(' ')) ? 'past_client' : opts.status,
    lead_type: contactType(typeRaw),
    tags: [...new Set(tags)],
    notes: [get('notes'), otherInfo && `Other: ${otherInfo}`, get('referred_by') && `Referred by: ${get('referred_by')}`]
      .filter(Boolean).join('\n') || null,
    do_not_contact: false,
    flexmls_id: get('flexmls_id') || null,
    source_created_at: created ? `${created}T12:00:00Z` : null,
    import_raw: importRaw,
  };
  if (phones.length > 2) warnings.push(`Only the first two phone numbers are kept (${phones.slice(2).join(', ')} is in the original row)`);

  const price = get('sale_price') ? parsePrice(get('sale_price')) : null;
  const mls = get('mls_number') || null;
  const txnAddress = get('transaction_address') || null;
  const txn: NewTransaction | null =
    closingDate || price || mls || txnAddress
      ? {
          side: client.lead_type === 'seller' ? 'seller' : client.lead_type === 'both' ? 'both' : 'buyer',
          property_address: txnAddress ?? client.address_line1,
          city: txnAddress ? null : client.city,
          zip_code: txnAddress ? null : client.zip_code,
          mls_number: mls,
          sale_price: price,
          closing_date: closingDate,
          is_hud: /hud/i.test(tags.join(' ')),
          notes: null,
        }
      : null;

  return { row, client, txn, warnings };
}

// ───────────────────────── Matching against existing clients ─────────────────────────

export type MergeMode = 'fill' | 'overwrite';

export interface PlannedRow extends ImportRecord {
  action: 'create' | 'update' | 'unchanged' | 'duplicate' | 'skip';
  id?: string; // existing client id for updates
  matchedBy?: 'Flexmls ID' | 'email' | 'phone + last name';
  duplicateOf?: number; // earlier row in the same file
  merged?: Client;
  changes: string[];
}

const MERGE_FIELDS: (keyof NewClient)[] = [
  'first_name', 'last_name', 'email', 'secondary_email', 'phone', 'secondary_phone', 'address_line1', 'address_line2',
  'city', 'state', 'zip_code', 'company', 'spouse_name', 'birthday', 'home_anniversary', 'lead_type', 'flexmls_id',
  'source_created_at',
];

const FIELD_LABELS: Partial<Record<keyof NewClient, string>> = {
  first_name: 'first name', last_name: 'last name', secondary_email: 'second email', secondary_phone: 'second phone',
  address_line1: 'address', address_line2: 'address line 2', zip_code: 'zip', spouse_name: 'spouse', lead_type: 'type',
  home_anniversary: 'home anniversary', flexmls_id: 'Flexmls ID', source_created_at: 'date added',
};

/** Merge an incoming record into an existing client. Status, follow-ups and do-not-contact are never touched. */
export function mergeClient(existing: Client, incoming: NewClient, mode: MergeMode) {
  const merged: Client = { ...existing };
  const changes: string[] = [];
  for (const k of MERGE_FIELDS) {
    const next = incoming[k];
    const cur = existing[k];
    if (next == null || next === '' || next === cur) continue;
    if (mode === 'fill' && cur != null && cur !== '') continue;
    (merged as unknown as Record<string, unknown>)[k] = next;
    changes.push(FIELD_LABELS[k] ?? k);
  }
  const tags = [...new Set([...(existing.tags ?? []), ...(incoming.tags ?? [])])];
  if (tags.length !== (existing.tags ?? []).length) {
    merged.tags = tags;
    changes.push('tags');
  }
  if (incoming.notes && !(existing.notes ?? '').includes(incoming.notes)) {
    merged.notes = existing.notes ? `${existing.notes}\n\n— From ${incoming.source ?? 'import'} —\n${incoming.notes}` : incoming.notes;
    changes.push('notes');
  }
  if (changes.length) merged.import_raw = incoming.import_raw;
  return { merged, changes };
}

class MatchIndex<T> {
  byFlex = new Map<string, T>();
  byEmail = new Map<string, T>();
  byPhoneName = new Map<string, T>();

  add(c: Pick<Client, 'flexmls_id' | 'email' | 'secondary_email' | 'phone' | 'secondary_phone' | 'last_name' | 'first_name'>, value: T) {
    if (c.flexmls_id && !this.byFlex.has(c.flexmls_id)) this.byFlex.set(c.flexmls_id, value);
    for (const e of [c.email, c.secondary_email]) if (e && !this.byEmail.has(e.toLowerCase())) this.byEmail.set(e.toLowerCase(), value);
    const surname = (c.last_name || c.first_name || '').toLowerCase();
    for (const p of [c.phone, c.secondary_phone]) {
      const key = phoneKey(p) && `${phoneKey(p)}|${surname}`;
      if (key && !this.byPhoneName.has(key)) this.byPhoneName.set(key, value);
    }
  }

  find(c: NewClient): { value: T; by: NonNullable<PlannedRow['matchedBy']> } | null {
    if (c.flexmls_id && this.byFlex.has(c.flexmls_id)) return { value: this.byFlex.get(c.flexmls_id)!, by: 'Flexmls ID' };
    for (const e of [c.email, c.secondary_email]) if (e && this.byEmail.has(e)) return { value: this.byEmail.get(e)!, by: 'email' };
    const surname = (c.last_name || c.first_name || '').toLowerCase();
    for (const p of [c.phone, c.secondary_phone]) {
      const key = phoneKey(p) && `${phoneKey(p)}|${surname}`;
      if (key && this.byPhoneName.has(key)) return { value: this.byPhoneName.get(key)!, by: 'phone + last name' };
    }
    return null;
  }
}

/**
 * Decide what happens to each row: matched to an existing client by Flexmls ID, then email, then
 * phone + last name; otherwise created. A row matching an earlier row of the same file is a duplicate.
 */
export function planImport(records: ImportRecord[], existing: Client[], mode: MergeMode): PlannedRow[] {
  const db = new MatchIndex<Client>();
  existing.forEach((c) => db.add(c, c));
  const inFile = new MatchIndex<number>();
  const mergedById = new Map<string, Client>();

  return records.map((r): PlannedRow => {
    if (!r.client) return { ...r, action: 'skip', changes: [] };
    const earlier = inFile.find(r.client);
    if (earlier) return { ...r, action: 'duplicate', duplicateOf: earlier.value, changes: [] };
    inFile.add(r.client, r.row);

    const hit = db.find(r.client);
    if (!hit) return { ...r, action: 'create', changes: [] };
    const base = mergedById.get(hit.value.id) ?? hit.value;
    const { merged, changes } = mergeClient(base, r.client, mode);
    mergedById.set(hit.value.id, merged);
    return { ...r, action: changes.length || r.txn ? 'update' : 'unchanged', id: hit.value.id, matchedBy: hit.by, merged, changes };
  });
}

/** True if an equivalent closed sale is already on file for the client. */
export function hasTransaction(existing: Pick<ClientTransaction, 'closing_date' | 'mls_number' | 'property_address'>[], t: NewTransaction) {
  const addr = (s: string | null) => (s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return existing.some(
    (e) =>
      (t.mls_number && e.mls_number === t.mls_number) ||
      (e.closing_date === t.closing_date && (!t.property_address || addr(e.property_address) === addr(t.property_address))),
  );
}
