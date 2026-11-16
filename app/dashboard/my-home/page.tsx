'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarPlus, FileText, HousePlus, LineChart, Phone, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatMoney } from '@/lib/clients';
import { daysBetween, toYmd, type DateKind } from '@/lib/calendar';
import { BROKERAGE } from '@/lib/site';
import {
  CLIENT_DATE_KINDS, HURRICANE_CHECKLIST, addMyDate, fetchMyHome, removeMyDate, upcomingForHome,
  type MyHome, type MyHomePlace, type UpcomingItem,
} from '@/lib/my-home';

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const cardCls = 'bg-white border border-gray-200 rounded-xl p-5';
const h2Cls = 'text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3';

const placeLine = (p: MyHomePlace) => [p.address, p.city, p.zip_code].filter(Boolean).join(', ');

function when(on: string, today: string) {
  const n = daysBetween(today, on);
  return n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : n < 60 ? `In ${n} days` : `In about ${Math.round(n / 30)} months`;
}

/** A past client's own page: their home, their key dates, the homeowner calendar and ways to reach us. */
export default function MyHomePage() {
  const { user, profile, loading } = useAuth();
  const [state, setState] = useState<'loading' | 'ok' | 'none' | 'unavailable'>('loading');
  const [home, setHome] = useState<MyHome | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<{ kind: DateKind; date: string; label: string; provider: string } | null>(null);
  const [confirmRemove, setConfirmRemove] = useState('');
  const [valueAsk, setValueAsk] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  const load = useCallback(async () => {
    const r = await fetchMyHome();
    setHome(r.home ?? null);
    setState(r.state);
  }, []);

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    fetchMyHome().then((r) => {
      if (cancelled) return;
      setHome(r.home ?? null);
      setState(r.state);
    });
    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  const today = toYmd(new Date());
  const upcoming = upcomingForHome(home);
  const place = home?.homes[0] ?? home?.address_on_file ?? null;
  const bought = place?.closing_date ?? place?.home_anniversary ?? null;
  const years = bought ? Math.floor(daysBetween(bought, today) / 365.25) : null;
  const kindMeta = CLIENT_DATE_KINDS.find((k) => k.value === draft?.kind) ?? CLIENT_DATE_KINDS[0];

  const saveDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft?.date) return;
    setBusy(true);
    setError('');
    const err = await addMyDate(draft.kind, draft.date, draft.label.trim(), draft.provider.trim());
    setBusy(false);
    if (err) return setError(err);
    setDraft(null);
    load();
  };

  const remove = async (id: string) => {
    setBusy(true);
    const err = await removeMyDate(id);
    setBusy(false);
    setConfirmRemove('');
    if (err) return setError(err);
    load();
  };

  // Goes in as a request under Leads and is attached to their client record, like any website request.
  const askValue = async () => {
    if (!user?.email) return;
    setValueAsk('sending');
    const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || home?.first_name || user.email;
    const res = await fetch('/api/consultation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, email: user.email, intent: [], counties: [], communities: [], neighborhoods: [], lifestyles: [], mustHaves: [],
        message: `Home value check-up requested from My Home${place ? ` for ${placeLine(place)}` : ''}.`,
        sourcePage: '/dashboard/my-home',
      }),
    }).catch(() => null);
    setValueAsk(res?.ok ? 'sent' : 'failed');
  };

  if (state === 'loading') return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My home</h1>
      <p className="mt-1 mb-6 text-gray-600">Your home, the dates that matter, and what to do through the year in Southeastern NC.</p>

      {error && <p role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</p>}

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* The home */}
          <section className={cardCls}>
            <h2 className={h2Cls}>Your home</h2>
            {place && placeLine(place) ? (
              <>
                <p className="text-xl font-semibold text-gray-900">{placeLine(place)}</p>
                <dl className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
                  {bought && (
                    <div>
                      <dt className="text-gray-500">Closed on</dt>
                      <dd className="font-medium text-gray-900">{formatDate(bought)}</dd>
                    </div>
                  )}
                  {years != null && years >= 0 && (
                    <div>
                      <dt className="text-gray-500">Time in the home</dt>
                      <dd className="font-medium text-gray-900">{years < 1 ? 'Less than a year' : `${years} year${years === 1 ? '' : 's'}`}</dd>
                    </div>
                  )}
                  {place.purchase_price != null && (
                    <div>
                      <dt className="text-gray-500">Purchase price</dt>
                      <dd className="font-medium text-gray-900">{formatMoney(place.purchase_price)}</dd>
                    </div>
                  )}
                </dl>
                {(home?.homes.length ?? 0) > 1 && (
                  <p className="mt-3 text-sm text-gray-600">Also bought with us: {home!.homes.slice(1).map(placeLine).filter(Boolean).join('; ')}</p>
                )}
              </>
            ) : (
              <p className="text-gray-600">
                {state === 'ok'
                  ? 'We don’t have a home on file for you yet. Call or message us and we’ll add it.'
                  : 'Once your broker links your home to this login, its details will appear here. The calendar and checklists below are ready to use now.'}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {valueAsk === 'sent' ? (
                <p role="status" className="text-sm font-medium text-green-700">Request sent. {BROKERAGE.agent} will send you a current value estimate.</p>
              ) : (
                <button onClick={askValue} disabled={valueAsk === 'sending'} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  <LineChart size={16} /> {valueAsk === 'sending' ? 'Sending…' : 'What is my home worth now?'}
                </button>
              )}
              {valueAsk === 'failed' && <p role="alert" className="text-sm text-red-700">That didn’t go through. Please call {BROKERAGE.phone}.</p>}
            </div>
          </section>

          {/* Coming up */}
          <section className={cardCls}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Coming up</h2>
              {state === 'ok' && !draft && (
                <button onClick={() => setDraft({ kind: 'insurance_renewal', date: '', label: '', provider: '' })} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                  <CalendarPlus size={14} /> Add a date
                </button>
              )}
            </div>

            {draft && (
              <form onSubmit={saveDate} className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg grid sm:grid-cols-2 gap-3 text-sm">
                <label>
                  <span className="block text-gray-600 mb-1">What is it?</span>
                  <select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as DateKind })} className={`${inputCls} bg-white`}>
                    {CLIENT_DATE_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                  </select>
                </label>
                <label>
                  <span className="block text-gray-600 mb-1">Date</span>
                  <input type="date" required value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className={inputCls} />
                </label>
                {draft.kind === 'custom' && (
                  <label className="sm:col-span-2">
                    <span className="block text-gray-600 mb-1">Name for this date</span>
                    <input required maxLength={120} value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} className={inputCls} placeholder="Termite bond renewal" />
                  </label>
                )}
                <label className="sm:col-span-2">
                  <span className="block text-gray-600 mb-1">{kindMeta.providerLabel} (optional)</span>
                  <input maxLength={120} value={draft.provider} onChange={(e) => setDraft({ ...draft, provider: e.target.value })} className={inputCls} />
                </label>
                <p className="sm:col-span-2 text-xs text-gray-500">
                  {draft.kind === 'home_warranty_expiration' ? 'We’ll show this once.' : 'We’ll show this every year.'} Your broker can see the dates you add, so we can remind you too.
                </p>
                <div className="sm:col-span-2 flex gap-2">
                  <button disabled={busy} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">{busy ? 'Saving…' : 'Save date'}</button>
                  <button type="button" onClick={() => setDraft(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white">Cancel</button>
                </div>
              </form>
            )}

            <ul className="divide-y divide-gray-100">
              {upcoming.slice(0, 12).map((it: UpcomingItem) => (
                <li key={it.key} className="py-3 flex gap-3">
                  <span className="text-xl leading-6" aria-hidden>{it.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {it.title}
                      {it.mine && <span className="ml-2 align-middle text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Yours</span>}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(it.on, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })} · {when(it.on, today)}</p>
                    {it.detail && <p className="text-sm text-gray-600 mt-0.5">{it.detail}</p>}
                  </div>
                  {it.mine?.added_by_client && (
                    confirmRemove === it.mine.id ? (
                      <span className="shrink-0 text-sm flex items-center gap-2">
                        <button onClick={() => remove(it.mine!.id)} disabled={busy} className="text-red-700 font-medium hover:underline">Remove</button>
                        <button onClick={() => setConfirmRemove('')} className="text-gray-600 hover:underline">Keep</button>
                      </span>
                    ) : (
                      <button onClick={() => setConfirmRemove(it.mine!.id)} aria-label={`Remove ${it.title}`} className="shrink-0 p-2 text-gray-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    )
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-gray-500">
              Tax and insurance dates are general guidance for North Carolina. Confirm deadlines with your county tax office and your insurance agent.
            </p>
          </section>

          {/* Hurricane readiness */}
          <section className={cardCls}>
            <h2 className={h2Cls}>Hurricane readiness</h2>
            <div className="space-y-2">
              {HURRICANE_CHECKLIST.map((g, i) => (
                <details key={g.title} open={i === 0} className="border border-gray-200 rounded-lg">
                  <summary className="px-4 py-3 font-medium text-gray-900 cursor-pointer">{g.title}</summary>
                  <ul className="px-4 pb-3 space-y-2 text-sm text-gray-700 list-disc list-inside">
                    {g.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </details>
              ))}
            </div>
          </section>
        </div>

        {/* Side column */}
        <div className="space-y-5">
          <section className="bg-gradient-to-br from-blue-700 to-sky-600 text-white rounded-xl p-5">
            <p className="font-semibold">Need something for your home?</p>
            <p className="text-sm opacity-90 mt-1">A contractor name, a copy of a document, a question about refinancing or selling. Ask {BROKERAGE.agent} any time.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`tel:${BROKERAGE.phoneE164}`} className="inline-flex items-center gap-2 px-3 py-2 bg-white text-blue-800 rounded-lg text-sm font-medium"><Phone size={16} /> {BROKERAGE.phone}</a>
              <Link href="/dashboard/messages" className="inline-flex items-center gap-2 px-3 py-2 border border-white/60 rounded-lg text-sm font-medium">Send a message</Link>
            </div>
          </section>

          <section className={cardCls}>
            <h2 className={h2Cls}>Your records</h2>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/dashboard/messages" className="flex gap-3 text-gray-900 hover:text-blue-700">
                  <FileText size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  <span><span className="font-medium block">Documents and messages</span><span className="text-gray-600">Files we’ve shared with you, such as your closing papers.</span></span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/my-deals" className="flex gap-3 text-gray-900 hover:text-blue-700">
                  <FileText size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  <span><span className="font-medium block">Your purchase or sale</span><span className="text-gray-600">The updates, to-dos and dates from your transaction.</span></span>
                </Link>
              </li>
            </ul>
          </section>

          <section className={cardCls}>
            <h2 className={h2Cls}>Know someone moving?</h2>
            <p className="text-sm text-gray-600">Most of our business comes from people like you. If a friend or neighbor is thinking of selling, send them our way.</p>
            <Link href="/dashboard/listings/new" className="mt-3 inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50">
              <HousePlus size={16} /> Refer a seller
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
