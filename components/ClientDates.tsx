'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, CalendarPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/clients';
import { DATE_KINDS, dateKindMeta, dateLabel, occurrences, toYmd, addDaysYmd, type ClientDate, type DateKind } from '@/lib/calendar';

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';

const emptyDraft = (kind: DateKind = 'insurance_renewal') => {
  const meta = dateKindMeta(kind);
  return { kind, label: '', date: '', repeats: meta.repeats, remind_days: String(meta.remind), provider: '', notes: '' };
};

/** Important dates for one client (insurance renewals, warranties, anniversaries…), shown on the calendar. */
export default function ClientDates({ clientId, suggestedWarrantyEnd }: { clientId: string; suggestedWarrantyEnd?: string | null }) {
  const [dates, setDates] = useState<ClientDate[]>([]);
  const [draft, setDraft] = useState<ReturnType<typeof emptyDraft> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data, error: err } = await createClient().from('fanc_client_dates').select('*').eq('client_id', clientId).order('date');
    if (err) setError(err.message);
    setDates((data ?? []) as ClientDate[]);
  }, [clientId]);

  useEffect(() => {
    let cancelled = false;
    createClient().from('fanc_client_dates').select('*').eq('client_id', clientId).order('date').then(({ data, error: err }) => {
      if (cancelled) return;
      if (err) setError(err.message);
      setDates((data ?? []) as ClientDate[]);
    });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const pickKind = (kind: DateKind) => {
    const meta = dateKindMeta(kind);
    setDraft((d) => ({ ...(d ?? emptyDraft(kind)), kind, repeats: meta.repeats, remind_days: String(meta.remind) }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft?.date) return;
    setSaving(true);
    setError('');
    const { error: err } = await createClient().from('fanc_client_dates').insert({
      client_id: clientId,
      kind: draft.kind,
      label: draft.label.trim() || null,
      date: draft.date,
      repeats: draft.repeats,
      remind_days: Math.min(120, Math.max(0, Number(draft.remind_days) || 0)),
      provider: draft.provider.trim() || null,
      notes: draft.notes.trim() || null,
    });
    setSaving(false);
    if (err) return setError(err.message);
    setDraft(null);
    load();
  };

  const remove = async (d: ClientDate) => {
    if (!confirm(`Delete "${dateLabel(d)}"?`)) return;
    const { error: err } = await createClient().from('fanc_client_dates').delete().eq('id', d.id);
    if (err) setError(err.message);
    load();
  };

  const today = toYmd(new Date());
  const nextOn = (d: ClientDate) => occurrences(d.date, d.repeats, today, addDaysYmd(today, 366))[0];
  const meta = draft && dateKindMeta(draft.kind);
  const hasWarranty = dates.some((d) => d.kind === 'home_warranty_expiration');

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Important dates</h2>
        {!draft && (
          <button onClick={() => setDraft(emptyDraft())} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
            <Plus size={14} /> Add date
          </button>
        )}
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {draft && meta && (
        <form onSubmit={save} className="grid sm:grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <label className="text-sm sm:col-span-2">
            <span className="block text-gray-500 mb-1">What</span>
            <select value={draft.kind} onChange={(e) => pickKind(e.target.value as DateKind)} className={`${inputCls} bg-white`}>
              {DATE_KINDS.map((k) => <option key={k.value} value={k.value}>{k.icon} {k.label}</option>)}
            </select>
            {meta.hint && <span className="block text-xs text-gray-500 mt-1">{meta.hint}</span>}
          </label>
          {draft.kind === 'custom' && (
            <label className="text-sm sm:col-span-2">
              <span className="block text-gray-500 mb-1">Name</span>
              <input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} required placeholder="e.g. Septic inspection" className={inputCls} />
            </label>
          )}
          <label className="text-sm">
            <span className="block text-gray-500 mb-1">Date</span>
            <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} required className={inputCls} />
          </label>
          <label className="text-sm">
            <span className="block text-gray-500 mb-1">Repeats</span>
            <select value={draft.repeats} onChange={(e) => setDraft({ ...draft, repeats: e.target.value as 'yearly' | 'once' })} className={`${inputCls} bg-white`}>
              <option value="yearly">Every year</option>
              <option value="once">Just once</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="block text-gray-500 mb-1">Remind me (days before)</span>
            <input type="number" min={0} max={120} value={draft.remind_days} onChange={(e) => setDraft({ ...draft, remind_days: e.target.value })} className={inputCls} />
          </label>
          {draft.kind !== 'wedding_anniversary' && (
            <label className="text-sm">
              <span className="block text-gray-500 mb-1">Company / provider</span>
              <input value={draft.provider} onChange={(e) => setDraft({ ...draft, provider: e.target.value })} placeholder={draft.kind.includes('insurance') ? 'e.g. NC Farm Bureau' : ''} className={inputCls} />
            </label>
          )}
          <label className="text-sm sm:col-span-2">
            <span className="block text-gray-500 mb-1">Notes</span>
            <input value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder="Policy #, premium, anything useful" className={inputCls} />
          </label>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">Save date</button>
            <button type="button" onClick={() => setDraft(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      {dates.length === 0 ? (
        !draft && (
          <p className="text-sm text-gray-500">
            No dates yet. Insurance renewals, warranty end dates and anniversaries added here appear on the{' '}
            <Link href="/dashboard/calendar" className="text-blue-600 hover:underline">calendar</Link> with a reminder.
          </p>
        )
      ) : (
        <ul className="divide-y divide-gray-100">
          {dates.map((d) => {
            const next = nextOn(d);
            return (
              <li key={d.id} className="py-2.5 flex gap-3 items-start text-sm">
                <span className="text-lg leading-none" aria-hidden>{dateKindMeta(d.kind).icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{dateLabel(d)}</div>
                  <div className="text-gray-600">
                    {d.repeats === 'yearly' ? `Every ${formatDate(d.date, { month: 'long', day: 'numeric' })}` : formatDate(d.date)}
                    {next ? ` · next ${formatDate(next)}` : d.repeats === 'once' && d.date < today ? ' · passed' : ''}
                    {` · remind ${d.remind_days}d before`}
                  </div>
                  {(d.provider || d.notes) && <div className="text-gray-500">{[d.provider, d.notes].filter(Boolean).join(' · ')}</div>}
                </div>
                <button onClick={() => remove(d)} title="Delete date" className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
              </li>
            );
          })}
        </ul>
      )}

      {!draft && suggestedWarrantyEnd && !hasWarranty && suggestedWarrantyEnd >= today && (
        <button
          onClick={() => setDraft({ ...emptyDraft('home_warranty_expiration'), date: suggestedWarrantyEnd })}
          className="mt-3 inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-gray-300 hover:border-blue-400 text-gray-700"
        >
          <CalendarPlus size={12} /> Add home warranty end ({formatDate(suggestedWarrantyEnd)}, a year after closing)
        </button>
      )}
    </section>
  );
}
