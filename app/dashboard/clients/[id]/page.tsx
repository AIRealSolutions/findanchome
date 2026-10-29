'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, MessageCircle, Mail, CalendarClock, Pencil, Trash2, Cake, Home, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import ClientDates from '@/components/ClientDates';
import ClientReferrals from '@/components/ClientReferrals';
import ClientDeals from '@/components/ClientDeals';
import { createClient } from '@/lib/supabase/client';
import { ACTIVITY_KINDS, dialable, formatDateTime, relativeTime, toLocalInput } from '@/lib/leads';
import { NO_YEAR, cleanEmail, cleanPhone, cleanState, splitList } from '@/lib/client-import';
import {
  CLIENT_STATUSES,
  CLIENT_TYPES,
  TRANSACTION_SIDES,
  clientName,
  clientStatusMeta,
  clientTypeLabel,
  formatDate,
  formatMoney,
  upcomingDates,
  type Client,
  type ClientActivity,
  type ClientActivityKind,
  type ClientStatus,
  type ClientTransaction,
  type TransactionSide,
} from '@/lib/clients';

const CONTACT_KINDS: ClientActivityKind[] = ['call', 'text', 'email', 'meeting'];
const ICONS: Record<ClientActivityKind, string> = { call: '📞', text: '💬', email: '✉️', meeting: '🤝', note: '📝', status: '🔄', import: '📥' };

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 py-1.5 text-sm">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900 min-w-0 break-words">{children || <span className="text-gray-400">—</span>}</dd>
    </div>
  );
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`text-sm ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="block text-gray-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';

async function fetchClient(id: string) {
  const supabase = createClient();
  const [c, t, a] = await Promise.all([
    supabase.from('fanc_clients').select('*').eq('id', id).maybeSingle(),
    supabase.from('fanc_client_transactions').select('*').eq('client_id', id).order('closing_date', { ascending: false, nullsFirst: false }),
    supabase.from('fanc_client_activity').select('*').eq('client_id', id).order('created_at', { ascending: false }),
  ]);
  return {
    client: (c.data as Client | null) ?? null,
    transactions: (t.data ?? []) as ClientTransaction[],
    activity: (a.data ?? []) as ClientActivity[],
    error: (c.error || t.error || a.error)?.message ?? '',
  };
}

function addDays(days: number, hour = 9) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

const birthdayText = (d: string | null) =>
  d && (d.startsWith(`${NO_YEAR}-`) ? formatDate(d, { month: 'long', day: 'numeric' }) : formatDate(d, { month: 'long', day: 'numeric', year: 'numeric' }));

type Draft = Record<string, string>;
const EDIT_FIELDS = [
  'first_name', 'last_name', 'spouse_name', 'company', 'email', 'secondary_email', 'phone', 'secondary_phone',
  'address_line1', 'address_line2', 'city', 'state', 'zip_code', 'birthday', 'home_anniversary', 'lead_type', 'source', 'notes',
] as const;

const emptyTxn = { side: 'buyer' as TransactionSide, property_address: '', city: '', zip_code: '', mls_number: '', sale_price: '', closing_date: '', is_hud: false, notes: '' };

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [transactions, setTransactions] = useState<ClientTransaction[]>([]);
  const [activity, setActivity] = useState<ClientActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>({});
  const [tagsText, setTagsText] = useState('');
  const [kind, setKind] = useState<Exclude<ClientActivityKind, 'status' | 'import'>>('call');
  const [body, setBody] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [txn, setTxn] = useState<typeof emptyTxn | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const authorName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user?.email || 'Broker';

  const startEdit = useCallback((c: Client) => {
    setDraft(Object.fromEntries(EDIT_FIELDS.map((f) => [f, (c[f] as string | null) ?? ''])));
    setTagsText((c.tags ?? []).join(', '));
    setEditing(true);
  }, []);

  const apply = useCallback((r: Awaited<ReturnType<typeof fetchClient>>) => {
    if (r.error) setError(r.error);
    setClient(r.client);
    setTransactions(r.transactions);
    setActivity(r.activity);
    setFollowUp(toLocalInput(r.client?.follow_up_at ?? null));
    setLoading(false);
    return r;
  }, []);

  const load = useCallback(() => fetchClient(id).then(apply), [id, apply]);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    fetchClient(id).then((r) => {
      if (cancelled) return;
      apply(r);
      if (r.client && new URLSearchParams(window.location.search).get('edit')) startEdit(r.client);
    });
    return () => {
      cancelled = true;
    };
  }, [authLoading, id, apply, startEdit]);

  /** Update the client and append timeline entries, then refresh. */
  const save = async (updates: Partial<Client>, entries: { kind: ClientActivityKind; body: string }[] = []) => {
    if (!client || !user) return false;
    setSaving(true);
    setError('');
    const supabase = createClient();
    if (Object.keys(updates).length) {
      const { error: err } = await supabase.from('fanc_clients').update(updates).eq('id', client.id);
      if (err) {
        setError(err.message);
        setSaving(false);
        return false;
      }
    }
    if (entries.length) {
      const { error: err } = await supabase.from('fanc_client_activity').insert(
        entries.map((e) => ({ ...e, client_id: client.id, author_id: user.id, author_name: authorName })),
      );
      if (err) setError(err.message);
    }
    await load();
    setSaving(false);
    return true;
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = (k: (typeof EDIT_FIELDS)[number]) => draft[k]?.trim() || null;
    if (!v('first_name')) {
      setError('First name is required.');
      return;
    }
    const updates: Partial<Client> = {
      ...Object.fromEntries(EDIT_FIELDS.map((f) => [f, v(f)])),
      email: v('email') && (cleanEmail(v('email')!) ?? v('email')),
      secondary_email: v('secondary_email') && (cleanEmail(v('secondary_email')!) ?? v('secondary_email')),
      phone: v('phone') && (cleanPhone(v('phone')!) ?? v('phone')),
      secondary_phone: v('secondary_phone') && (cleanPhone(v('secondary_phone')!) ?? v('secondary_phone')),
      state: v('state') && cleanState(v('state')!),
      tags: [...new Set(splitList(tagsText))],
    } as Partial<Client>;
    if (await save(updates)) setEditing(false);
  };

  const changeStatus = (status: ClientStatus) => {
    if (!client || status === client.status) return;
    save({ status }, [{ kind: 'status', body: `Status changed from ${clientStatusMeta(client.status).label} to ${clientStatusMeta(status).label}` }]);
  };

  const toggleDnc = () => {
    if (!client) return;
    const next = !client.do_not_contact;
    save({ do_not_contact: next }, [{ kind: 'status', body: next ? 'Marked do not contact' : 'Removed do-not-contact flag' }]);
  };

  const setFollowUpAt = (iso: string | null) => {
    setFollowUp(toLocalInput(iso));
    save({ follow_up_at: iso }, [{ kind: 'note', body: iso ? `Follow-up set for ${formatDateTime(iso)}` : 'Follow-up cleared' }]);
  };

  const logActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !body.trim()) return;
    const updates: Partial<Client> = CONTACT_KINDS.includes(kind) ? { last_contacted_at: new Date().toISOString() } : {};
    if (await save(updates, [{ kind, body: body.trim() }])) setBody('');
  };

  const saveTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !txn) return;
    setSaving(true);
    const price = Number(txn.sale_price.replace(/[$,\s]/g, ''));
    const { error: err } = await createClient().from('fanc_client_transactions').insert({
      client_id: client.id,
      side: txn.side,
      property_address: txn.property_address.trim() || null,
      city: txn.city.trim() || null,
      zip_code: txn.zip_code.trim() || null,
      mls_number: txn.mls_number.trim() || null,
      sale_price: Number.isFinite(price) && price > 0 ? price : null,
      closing_date: txn.closing_date || null,
      is_hud: txn.is_hud,
      notes: txn.notes.trim() || null,
    });
    setSaving(false);
    if (err) return setError(err.message);
    // A first closing doubles as the home anniversary.
    if (!client.home_anniversary && txn.closing_date) await save({ home_anniversary: txn.closing_date });
    else await load();
    setTxn(null);
  };

  const deleteTxn = async (t: ClientTransaction) => {
    if (!confirm(`Delete the ${t.closing_date ? formatDate(t.closing_date) : ''} closing at ${t.property_address ?? 'this property'}?`)) return;
    const { error: err } = await createClient().from('fanc_client_transactions').delete().eq('id', t.id);
    if (err) setError(err.message);
    await load();
  };

  const deleteClient = async () => {
    if (!client) return;
    const { count } = await createClient().from('fanc_deals').select('id', { count: 'exact', head: true }).eq('client_id', client.id);
    const deals = count ? `, their ${count === 1 ? 'deal' : `${count} deals`} (including any commission records)` : '';
    if (!confirm(`Permanently delete ${clientName(client)}${deals}, their closings and their timeline?`)) return;
    const { error: err } = await createClient().from('fanc_clients').delete().eq('id', client.id);
    if (err) return setError(err.message);
    router.push('/dashboard/clients');
  };

  if (loading) return <p className="text-gray-500">Loading client…</p>;
  if (!client) {
    return (
      <div>
        <Link href="/dashboard/clients" className="inline-flex items-center gap-1 text-sm text-blue-600 mb-4"><ArrowLeft size={16} /> All clients</Link>
        <p className="text-gray-600">{error || 'This client was not found, or you do not have access to it.'}</p>
      </div>
    );
  }

  const dates = upcomingDates(client, 30);
  const lastClosing = transactions.map((t) => t.closing_date).filter(Boolean).sort().pop() ?? null;
  const d = (k: string) => draft[k] ?? '';
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setDraft({ ...draft, [k]: e.target.value });
  const address = [client.address_line1, client.address_line2].filter(Boolean).join(', ');
  const cityLine = [[client.city, client.state].filter(Boolean).join(', '), client.zip_code].filter(Boolean).join(' ');

  return (
    <div>
      <Link href="/dashboard/clients" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4">
        <ArrowLeft size={16} /> All clients
      </Link>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {clientName(client)}
              {client.spouse_name && <span className="text-gray-500 font-normal text-xl"> & {client.spouse_name}</span>}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {[clientTypeLabel(client.lead_type), client.company].filter(Boolean).join(' · ')}
              {client.last_contacted_at ? <> · Last contacted {relativeTime(client.last_contacted_at)}</> : <> · Not contacted yet</>}
            </p>
            {client.do_not_contact && (
              <p className="mt-2 inline-block text-sm px-2 py-1 rounded bg-red-100 text-red-800 font-medium">Do not contact</p>
            )}
            {dates.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {dates.map((x) => (
                  <span key={x.kind} className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded-full bg-pink-100 text-pink-800">
                    {x.kind === 'birthday' ? <Cake size={14} /> : <Home size={14} />}
                    {x.kind === 'birthday' ? 'Birthday' : `${x.years}-year home anniversary`} {x.daysAway === 0 ? 'today' : x.daysAway === 1 ? 'tomorrow' : `in ${x.daysAway} days`}
                  </span>
                ))}
              </div>
            )}
            {!client.do_not_contact && (
              <div className="mt-3 flex flex-wrap gap-2">
                {client.phone && (
                  <>
                    <a href={`tel:${dialable(client.phone)}`} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                      <Phone size={16} /> {client.phone}
                    </a>
                    <a href={`sms:${dialable(client.phone)}`} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                      <MessageCircle size={16} /> Text
                    </a>
                  </>
                )}
                {client.email && (
                  <a href={`mailto:${client.email}`} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                    <Mail size={16} /> {client.email}
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="lg:w-80 space-y-3">
            <label className="text-sm block">
              <span className="block text-gray-500 mb-1">Status</span>
              <select value={client.status} disabled={saving} onChange={(e) => changeStatus(e.target.value as ClientStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                {CLIENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={client.do_not_contact} disabled={saving} onChange={toggleDnc} className="rounded" />
              Do not contact
            </label>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6 min-w-0">
          {editing ? (
            <Section title="Edit contact">
              <form onSubmit={saveEdit} className="grid sm:grid-cols-2 gap-3">
                <Field label="First name *"><input value={d('first_name')} onChange={set('first_name')} required className={inputCls} /></Field>
                <Field label="Last name"><input value={d('last_name')} onChange={set('last_name')} className={inputCls} /></Field>
                <Field label="Spouse / partner"><input value={d('spouse_name')} onChange={set('spouse_name')} className={inputCls} /></Field>
                <Field label="Company"><input value={d('company')} onChange={set('company')} className={inputCls} /></Field>
                <Field label="Email"><input type="email" value={d('email')} onChange={set('email')} className={inputCls} /></Field>
                <Field label="Second email"><input type="email" value={d('secondary_email')} onChange={set('secondary_email')} className={inputCls} /></Field>
                <Field label="Phone"><input type="tel" value={d('phone')} onChange={set('phone')} className={inputCls} /></Field>
                <Field label="Second phone"><input type="tel" value={d('secondary_phone')} onChange={set('secondary_phone')} className={inputCls} /></Field>
                <Field label="Street address" wide><input value={d('address_line1')} onChange={set('address_line1')} className={inputCls} /></Field>
                <Field label="Address line 2" wide><input value={d('address_line2')} onChange={set('address_line2')} className={inputCls} /></Field>
                <Field label="City"><input value={d('city')} onChange={set('city')} className={inputCls} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="State"><input value={d('state')} onChange={set('state')} maxLength={2} className={inputCls} /></Field>
                  <Field label="Zip"><input value={d('zip_code')} onChange={set('zip_code')} maxLength={10} className={inputCls} /></Field>
                </div>
                <Field label="Birthday"><input type="date" value={d('birthday')} onChange={set('birthday')} className={inputCls} /></Field>
                <Field label="Home anniversary"><input type="date" value={d('home_anniversary')} onChange={set('home_anniversary')} className={inputCls} /></Field>
                <Field label="Type">
                  <select value={d('lead_type')} onChange={set('lead_type')} className={`${inputCls} bg-white`}>
                    <option value="">—</option>
                    {CLIENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>
                <Field label="Source"><input value={d('source')} onChange={set('source')} placeholder="flexmls, referral, open house…" className={inputCls} /></Field>
                <Field label="Tags (comma separated)" wide><input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className={inputCls} /></Field>
                <Field label="Notes" wide><textarea value={d('notes')} onChange={set('notes')} rows={5} className={inputCls} /></Field>
                <div className="sm:col-span-2 flex gap-2">
                  <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
                  <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
                </div>
              </form>
            </Section>
          ) : (
            <Section title="Contact" action={
              <button onClick={() => startEdit(client)} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"><Pencil size={14} /> Edit</button>
            }>
              <dl>
                <Row label="Email">{[client.email, client.secondary_email].filter(Boolean).join(', ')}</Row>
                <Row label="Phone">{[client.phone, client.secondary_phone].filter(Boolean).join(', ')}</Row>
                <Row label="Address">{address && <>{address}<br />{cityLine}</>}{!address && cityLine}</Row>
                <Row label="Birthday">{birthdayText(client.birthday)}</Row>
                <Row label="Home anniversary">{formatDate(client.home_anniversary, { month: 'long', day: 'numeric', year: 'numeric' })}</Row>
                <Row label="Tags">
                  {(client.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1">{(client.tags ?? []).map((t) => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">{t}</span>)}</div>
                  )}
                </Row>
                <Row label="Source">
                  {client.source}
                  {client.source_created_at && <span className="text-gray-500"> · added {formatDate(client.source_created_at)}</span>}
                  {client.consultation_id && (
                    <Link href={`/dashboard/leads/${client.consultation_id}`} className="block text-blue-600 hover:underline">View their consultation request</Link>
                  )}
                </Row>
              </dl>
              {client.notes && (
                <blockquote className="mt-3 p-3 bg-gray-50 border-l-4 border-blue-300 rounded-r text-gray-800 whitespace-pre-wrap text-sm">{client.notes}</blockquote>
              )}
            </Section>
          )}

          <ClientDeals client={client} author={{ id: user?.id ?? '', name: authorName }} />

          <ClientReferrals client={client} author={{ id: user?.id ?? '', name: authorName }} onChanged={load} />

          <ClientDates clientId={client.id} suggestedWarrantyEnd={lastClosing && `${+lastClosing.slice(0, 4) + 1}${lastClosing.slice(4, 10)}`} />

          <Section title="Closed transactions" action={
            !txn && <button onClick={() => setTxn({ ...emptyTxn, property_address: client.address_line1 ?? '', city: client.city ?? '', zip_code: client.zip_code ?? '' })}
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"><Plus size={14} /> Add closing</button>
          }>
            {txn && (
              <form onSubmit={saveTxn} className="grid sm:grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <Field label="Side">
                  <select value={txn.side} onChange={(e) => setTxn({ ...txn, side: e.target.value as TransactionSide })} className={`${inputCls} bg-white`}>
                    {TRANSACTION_SIDES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </Field>
                <Field label="Closing date"><input type="date" value={txn.closing_date} onChange={(e) => setTxn({ ...txn, closing_date: e.target.value })} className={inputCls} /></Field>
                <Field label="Property address" wide><input value={txn.property_address} onChange={(e) => setTxn({ ...txn, property_address: e.target.value })} className={inputCls} /></Field>
                <Field label="City"><input value={txn.city} onChange={(e) => setTxn({ ...txn, city: e.target.value })} className={inputCls} /></Field>
                <Field label="Zip"><input value={txn.zip_code} onChange={(e) => setTxn({ ...txn, zip_code: e.target.value })} className={inputCls} /></Field>
                <Field label="Sale price"><input inputMode="numeric" value={txn.sale_price} onChange={(e) => setTxn({ ...txn, sale_price: e.target.value })} placeholder="$" className={inputCls} /></Field>
                <Field label="MLS #"><input value={txn.mls_number} onChange={(e) => setTxn({ ...txn, mls_number: e.target.value })} className={inputCls} /></Field>
                <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
                  <input type="checkbox" checked={txn.is_hud} onChange={(e) => setTxn({ ...txn, is_hud: e.target.checked })} className="rounded" /> HUD home
                </label>
                <Field label="Notes" wide><textarea value={txn.notes} onChange={(e) => setTxn({ ...txn, notes: e.target.value })} rows={2} className={inputCls} /></Field>
                <div className="sm:col-span-2 flex gap-2">
                  <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">Save closing</button>
                  <button type="button" onClick={() => setTxn(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
                </div>
              </form>
            )}
            {transactions.length === 0 ? (
              !txn && <p className="text-sm text-gray-500">No closings recorded yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {transactions.map((t) => (
                  <li key={t.id} className="py-3 flex gap-3 items-start">
                    <div className="flex-1 min-w-0 text-sm">
                      <div className="font-medium text-gray-900">
                        {t.property_address || 'Address not recorded'}
                        {t.is_hud && <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">HUD</span>}
                      </div>
                      <div className="text-gray-600">
                        {[TRANSACTION_SIDES.find((s) => s.value === t.side)?.label, t.closing_date && `Closed ${formatDate(t.closing_date)}`, formatMoney(t.sale_price), t.mls_number && `MLS ${t.mls_number}`, [t.city, t.zip_code].filter(Boolean).join(' ')]
                          .filter(Boolean).join(' · ')}
                      </div>
                      {t.notes && <div className="text-gray-500 mt-0.5 whitespace-pre-wrap">{t.notes}</div>}
                    </div>
                    <button onClick={() => deleteTxn(t)} title="Delete closing" className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {client.import_raw && Object.keys(client.import_raw).length > 0 && (
            <Section title="Original import data" action={
              <button onClick={() => setShowRaw(!showRaw)} className="text-sm text-blue-600 hover:text-blue-800">{showRaw ? 'Hide' : 'Show'}</button>
            }>
              {showRaw ? (
                <dl>
                  {Object.entries(client.import_raw).map(([k, v]) => <Row key={k} label={k}><span className="whitespace-pre-wrap">{v}</span></Row>)}
                </dl>
              ) : (
                <p className="text-sm text-gray-500">Every column from the {client.source === 'flexmls' ? 'Flexmls' : 'imported'} row, including ones that weren&apos;t mapped to a field.</p>
              )}
            </Section>
          )}

          <div className="text-right">
            <button onClick={deleteClient} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"><Trash2 size={14} /> Delete client</button>
          </div>
        </div>

        <div className="space-y-6">
          <Section title="Follow-up">
            <div className="flex gap-2">
              <input type="datetime-local" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg" />
              <button disabled={saving || !followUp} onClick={() => setFollowUpAt(new Date(followUp).toISOString())}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">Save</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { label: 'Next week', iso: addDays(7) },
                { label: 'In 3 months', iso: addDays(90) },
                { label: 'In 6 months', iso: addDays(182) },
              ].map((o) => (
                <button key={o.label} disabled={saving} onClick={() => setFollowUpAt(o.iso)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-gray-300 text-xs hover:border-blue-400">
                  <CalendarClock size={12} /> {o.label}
                </button>
              ))}
              {client.follow_up_at && (
                <button disabled={saving} onClick={() => setFollowUpAt(null)} className="px-2.5 py-1 rounded-full text-xs text-gray-500 hover:text-red-600">Clear</button>
              )}
            </div>
          </Section>

          <Section title="Log activity">
            <form onSubmit={logActivity}>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {ACTIVITY_KINDS.map((k) => (
                  <button key={k.value} type="button" onClick={() => setKind(k.value)} aria-pressed={kind === k.value}
                    className={`px-3 py-1.5 rounded-full text-sm border ${kind === k.value ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                    <span aria-hidden>{k.icon}</span> {k.label}
                  </button>
                ))}
              </div>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={5000}
                placeholder={kind === 'note' ? 'Add a note…' : `What happened on the ${kind}?`} className={inputCls} />
              <button type="submit" disabled={saving || !body.trim()} className="mt-2 w-full py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
                {saving ? 'Saving…' : 'Log'}
              </button>
            </form>
          </Section>

          <Section title="Timeline">
            {activity.length === 0 ? (
              <p className="text-sm text-gray-500">No activity yet.</p>
            ) : (
              <ol className="space-y-4">
                {activity.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="text-lg leading-none mt-0.5" aria-hidden>{ICONS[a.kind]}</span>
                    <div className="min-w-0">
                      <p className={`text-sm whitespace-pre-wrap ${a.kind === 'status' || a.kind === 'import' ? 'text-gray-500 italic' : 'text-gray-900'}`}>{a.body}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {a.author_name ?? 'Unknown'} · <time dateTime={a.created_at} title={formatDateTime(a.created_at)}>{relativeTime(a.created_at)}</time>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
            <p className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">Added to the database {formatDateTime(client.created_at)}</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
