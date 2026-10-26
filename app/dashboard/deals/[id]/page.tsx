'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, MessageCircle, Mail, Plus, Trash2, CheckCircle2, XCircle, PenLine } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import MessageComposer from '@/components/MessageComposer';
import { createClient } from '@/lib/supabase/client';
import { dialable } from '@/lib/leads';
import { daysBetween, toYmd } from '@/lib/calendar';
import { clientName, formatDate, formatMoney } from '@/lib/clients';
import {
  DEAL_DATES,
  DEAL_SIDES,
  OPEN_STAGES,
  addChecklist,
  changeStage,
  closeDeal,
  dealCommission,
  dealContext,
  dealTitle,
  isOpenDeal,
  markFellThrough,
  stageMeta,
  taskDue,
  type Deal,
  type DealSide,
  type DealStage,
  type DealTask,
  type DealWithClient,
} from '@/lib/deals';

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">{title}</h2>
      {children}
    </section>
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

const TEXT_FIELDS = ['property_address', 'city', 'zip_code', 'mls_number', 'lender', 'closing_attorney', 'other_agent', 'notes'] as const;
const MONEY_FIELDS = ['list_price', 'contract_price', 'due_diligence_fee', 'earnest_money', 'commission_pct'] as const;
type Draft = Record<string, string>;

const toDraft = (d: Deal): Draft => ({
  ...Object.fromEntries(TEXT_FIELDS.map((f) => [f, d[f] ?? ''])),
  ...Object.fromEntries(MONEY_FIELDS.map((f) => [f, d[f] == null ? '' : String(d[f])])),
  ...Object.fromEntries(DEAL_DATES.map((x) => [x.field, d[x.field] ?? ''])),
});

async function fetchDeal(id: string) {
  const supabase = createClient();
  const [d, t] = await Promise.all([
    supabase.from('fanc_deals').select('*, client:fanc_clients(id, first_name, last_name, spouse_name, address_line1, city, phone, email, do_not_contact)').eq('id', id).maybeSingle(),
    supabase.from('fanc_deal_tasks').select('*').eq('deal_id', id).order('sort'),
  ]);
  return { deal: (d.data as DealWithClient | null) ?? null, tasks: (t.data ?? []) as DealTask[], error: (d.error || t.error)?.message ?? '' };
}

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [deal, setDeal] = useState<DealWithClient | null>(null);
  const [tasks, setTasks] = useState<DealTask[]>([]);
  const [draft, setDraft] = useState<Draft>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newTask, setNewTask] = useState({ title: '', due: '' });
  const [closingOn, setClosingOn] = useState('');
  const [composing, setComposing] = useState(false);

  const author = { id: user?.id ?? '', name: [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user?.email || 'Broker' };

  const apply = useCallback((r: Awaited<ReturnType<typeof fetchDeal>>) => {
    if (r.error) setError(r.error);
    setDeal(r.deal);
    setTasks(r.tasks);
    if (r.deal) {
      setDraft(toDraft(r.deal));
      setClosingOn(r.deal.closing_date ?? toYmd(new Date()));
    }
    setLoading(false);
  }, []);
  const load = useCallback(() => fetchDeal(id).then(apply), [id, apply]);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    fetchDeal(id).then((r) => !cancelled && apply(r));
    return () => {
      cancelled = true;
    };
  }, [authLoading, id, apply]);

  const dirty = useMemo(() => deal && JSON.stringify(toDraft(deal)) !== JSON.stringify(draft), [deal, draft]);

  const run = async (fn: () => Promise<string>) => {
    setSaving(true);
    setError('');
    const err = await fn();
    if (err) setError(err);
    await load();
    setSaving(false);
  };

  const save = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!deal) return;
    const updates: Record<string, string | number | null> = {};
    TEXT_FIELDS.forEach((f) => (updates[f] = draft[f]?.trim() || null));
    DEAL_DATES.forEach((x) => (updates[x.field] = draft[x.field] || null));
    for (const f of MONEY_FIELDS) {
      const n = Number((draft[f] ?? '').replace(/[$,%\s]/g, ''));
      updates[f] = draft[f]?.trim() && Number.isFinite(n) ? n : null;
    }
    run(async () => (await createClient().from('fanc_deals').update(updates).eq('id', deal.id)).error?.message ?? '');
  };

  const setField = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft({ ...draft, [f]: e.target.value });

  if (loading) return <p className="text-gray-500">Loading deal…</p>;
  if (!deal) {
    return (
      <div>
        <Link href="/dashboard/deals" className="inline-flex items-center gap-1 text-sm text-blue-600 mb-4"><ArrowLeft size={16} /> All deals</Link>
        <p className="text-gray-600">{error || 'This deal was not found, or you do not have access to it.'}</p>
      </div>
    );
  }

  const today = toYmd(new Date());
  const c = deal.client;
  const open = isOpenDeal(deal);
  const commission = dealCommission(deal);
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!!a.done_at !== !!b.done_at) return a.done_at ? 1 : -1;
    return (taskDue(a, deal) ?? '9999').localeCompare(taskDue(b, deal) ?? '9999') || a.sort - b.sort;
  });
  const hasContractList = tasks.some((t) => t.anchor);

  return (
    <div>
      <Link href="/dashboard/deals" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4">
        <ArrowLeft size={16} /> All deals
      </Link>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${stageMeta(deal.stage).className}`}>{stageMeta(deal.stage).label}</span>
              {deal.is_hud && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">HUD home</span>}
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">{dealTitle(deal, c)}</h1>
            {c && (
              <p className="mt-1 text-gray-600">
                <Link href={`/dashboard/clients/${c.id}`} className="text-blue-600 hover:underline">{clientName(c)}</Link>
                {' · '}{DEAL_SIDES.find((s) => s.value === deal.side)?.label}
              </p>
            )}
            {c && (
              <div className="mt-3 flex flex-wrap gap-2">
                {c.phone && (
                  <>
                    <a href={`tel:${dialable(c.phone)}`} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"><Phone size={16} /> {c.phone}</a>
                    <a href={`sms:${dialable(c.phone)}`} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"><MessageCircle size={16} /> Text</a>
                  </>
                )}
                {c.email && <a href={`mailto:${c.email}`} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"><Mail size={16} /> Email</a>}
                <button onClick={() => setComposing(true)} className="inline-flex items-center gap-2 px-3 py-2 border border-blue-300 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50">
                  <PenLine size={16} /> Message from template
                </button>
              </div>
            )}
          </div>

          <div className="lg:w-80 space-y-3">
            {open && (
              <label className="text-sm block">
                <span className="block text-gray-500 mb-1">Stage</span>
                <select value={deal.stage} disabled={saving} onChange={(e) => run(() => changeStage(deal, e.target.value as DealStage, tasks, author))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                  {OPEN_STAGES.map((s) => <option key={s} value={s}>{stageMeta(s).label}</option>)}
                </select>
              </label>
            )}
            <label className="text-sm block">
              <span className="block text-gray-500 mb-1">Side</span>
              <select value={deal.side} disabled={saving}
                onChange={(e) => run(async () => (await createClient().from('fanc_deals').update({ side: e.target.value as DealSide }).eq('id', deal.id)).error?.message ?? '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                {DEAL_SIDES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={deal.is_hud} disabled={saving} className="rounded"
                onChange={(e) => run(async () => (await createClient().from('fanc_deals').update({ is_hud: e.target.checked }).eq('id', deal.id)).error?.message ?? '')} />
              HUD home
            </label>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        <form onSubmit={save} className="space-y-6 min-w-0">
          <Section title="Key dates">
            <div className="grid sm:grid-cols-2 gap-3">
              {DEAL_DATES.map((x) => {
                const v = draft[x.field];
                const n = v ? daysBetween(today, v) : null;
                return (
                  <Field key={x.field} label={`${x.icon} ${x.label}`}>
                    <input type="date" value={v ?? ''} onChange={setField(x.field)} className={inputCls} />
                    {n != null && open && x.field !== 'effective_date' && (
                      <span className={`block text-xs mt-1 ${n < 0 ? 'text-gray-400' : n <= 2 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                        {n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : n > 0 ? `In ${n} days` : `${-n} days ago`}
                      </span>
                    )}
                  </Field>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-gray-500">Checklist items tied to these dates move when you change them. Dates show on the calendar.</p>
          </Section>

          <Section title="Property & money">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Property address" wide><input value={draft.property_address ?? ''} onChange={setField('property_address')} className={inputCls} /></Field>
              <Field label="City"><input value={draft.city ?? ''} onChange={setField('city')} className={inputCls} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Zip"><input value={draft.zip_code ?? ''} onChange={setField('zip_code')} maxLength={10} className={inputCls} /></Field>
                <Field label="MLS #"><input value={draft.mls_number ?? ''} onChange={setField('mls_number')} className={inputCls} /></Field>
              </div>
              <Field label="List price"><input inputMode="decimal" value={draft.list_price ?? ''} onChange={setField('list_price')} placeholder="$" className={inputCls} /></Field>
              <Field label="Contract price"><input inputMode="decimal" value={draft.contract_price ?? ''} onChange={setField('contract_price')} placeholder="$" className={inputCls} /></Field>
              <Field label="Due diligence fee"><input inputMode="decimal" value={draft.due_diligence_fee ?? ''} onChange={setField('due_diligence_fee')} placeholder="$" className={inputCls} /></Field>
              <Field label="Earnest money"><input inputMode="decimal" value={draft.earnest_money ?? ''} onChange={setField('earnest_money')} placeholder="$" className={inputCls} /></Field>
              <Field label="Commission %">
                <input inputMode="decimal" value={draft.commission_pct ?? ''} onChange={setField('commission_pct')} placeholder="e.g. 2.5" className={inputCls} />
                {commission && <span className="block text-xs text-gray-500 mt-1">≈ {formatMoney(commission)} gross</span>}
              </Field>
            </div>
          </Section>

          <Section title="People & notes">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Lender"><input value={draft.lender ?? ''} onChange={setField('lender')} placeholder="Name, company, phone" className={inputCls} /></Field>
              <Field label="Closing attorney"><input value={draft.closing_attorney ?? ''} onChange={setField('closing_attorney')} className={inputCls} /></Field>
              <Field label={deal.side === 'seller' ? "Buyer's agent" : deal.side === 'buyer' ? 'Listing agent' : 'Other agent'} wide>
                <input value={draft.other_agent ?? ''} onChange={setField('other_agent')} className={inputCls} />
              </Field>
              <Field label="Notes" wide><textarea value={draft.notes ?? ''} onChange={setField('notes')} rows={4} className={inputCls} /></Field>
            </div>
          </Section>

          <div className="sticky bottom-0 py-3 bg-gray-50/90 backdrop-blur flex items-center gap-3">
            <button type="submit" disabled={saving || !dirty} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {dirty && <span className="text-sm text-amber-700">Unsaved changes</span>}
          </div>
        </form>

        <div className="space-y-6">
          <Section title="Checklist">
            {!hasContractList && (
              <button disabled={saving} onClick={() => run(() => addChecklist(deal, 'contract', tasks.length))}
                className="mb-3 w-full py-2 border border-dashed border-blue-300 rounded-lg text-sm text-blue-700 hover:bg-blue-50">
                + Add the under-contract checklist
              </button>
            )}
            {sortedTasks.length === 0 ? (
              <p className="text-sm text-gray-500">No tasks yet.</p>
            ) : (
              <ul className="space-y-1">
                {sortedTasks.map((t) => {
                  const due = taskDue(t, deal);
                  const late = !t.done_at && due && due < today;
                  return (
                    <li key={t.id} className="flex items-start gap-2 py-1 group">
                      <input type="checkbox" checked={!!t.done_at} disabled={saving} className="rounded mt-1"
                        onChange={(e) => run(async () => (await createClient().from('fanc_deal_tasks').update({ done_at: e.target.checked ? new Date().toISOString() : null }).eq('id', t.id)).error?.message ?? '')} />
                      <div className="flex-1 min-w-0 text-sm">
                        <span className={t.done_at ? 'line-through text-gray-400' : 'text-gray-900'}>{t.title}</span>
                        {due ? (
                          <span className={`block text-xs ${late ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {formatDate(due, { weekday: 'short', month: 'short', day: 'numeric' })}{late && ' · overdue'}
                          </span>
                        ) : t.anchor ? (
                          <span className="block text-xs text-gray-400">Set the {DEAL_DATES.find((x) => x.field === t.anchor)?.label.toLowerCase()} to date this</span>
                        ) : null}
                      </div>
                      <button title="Delete task" disabled={saving} className="p-1 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        onClick={() => run(async () => (await createClient().from('fanc_deal_tasks').delete().eq('id', t.id)).error?.message ?? '')}>
                        <Trash2 size={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <form className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTask.title.trim()) return;
                const row = { deal_id: deal.id, title: newTask.title.trim(), due_date: newTask.due || null, sort: tasks.length };
                setNewTask({ title: '', due: '' });
                run(async () => (await createClient().from('fanc_deal_tasks').insert(row)).error?.message ?? '');
              }}>
              <input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="Add a task" className={`${inputCls} text-sm`} />
              <input type="date" value={newTask.due} onChange={(e) => setNewTask({ ...newTask, due: e.target.value })} className="px-2 py-2 border border-gray-300 rounded-lg text-sm w-36" />
              <button type="submit" disabled={!newTask.title.trim()} className="p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50" aria-label="Add task"><Plus size={16} /></button>
            </form>
          </Section>

          {open ? (
            <Section title="Finish" id="close">
              <p className="text-sm text-gray-600 mb-2">
                Closing records the sale on {c ? clientName(c) : 'the client'}&apos;s record, makes them a past client
                {deal.side !== 'seller' && ' and sets their home anniversary'}.
              </p>
              <div className="flex gap-2">
                <input type="date" value={closingOn} onChange={(e) => setClosingOn(e.target.value)} className={`${inputCls} text-sm`} />
                <button disabled={saving || !closingOn || !!dirty} onClick={() => run(() => closeDeal(deal, closingOn, author))}
                  className="shrink-0 inline-flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                  <CheckCircle2 size={16} /> Mark closed
                </button>
              </div>
              {dirty && <p className="mt-1 text-xs text-amber-700">Save your changes first.</p>}
              <button disabled={saving}
                onClick={() => {
                  const reason = prompt('What happened? (optional)');
                  if (reason !== null) run(() => markFellThrough(deal, reason.trim(), author));
                }}
                className="mt-3 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-red-700">
                <XCircle size={16} /> Fell through
              </button>
            </Section>
          ) : (
            <Section title={deal.stage === 'closed' ? 'Closed' : 'Fell through'}>
              <p className="text-sm text-gray-700">
                {deal.stage === 'closed'
                  ? <>Closed {deal.closing_date && formatDate(deal.closing_date)}. The sale is recorded on the <Link href={`/dashboard/clients/${deal.client_id}`} className="text-blue-600 hover:underline">client&apos;s page</Link>.</>
                  : deal.fell_through_reason || 'No reason recorded.'}
              </p>
              {deal.stage === 'fell_through' && (
                <button disabled={saving} onClick={() => run(async () => (await createClient().from('fanc_deals').update({ stage: 'active', fell_through_reason: null }).eq('id', deal.id)).error?.message ?? '')}
                  className="mt-2 text-sm text-blue-600 hover:underline">Reopen as active</button>
              )}
            </Section>
          )}

          <div className="text-right">
            <button
              onClick={async () => {
                if (!confirm('Delete this deal and its checklist? A closed sale already recorded on the client stays.')) return;
                const { error: err } = await createClient().from('fanc_deals').delete().eq('id', deal.id);
                if (err) return setError(err.message);
                router.push('/dashboard/deals');
              }}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600">
              <Trash2 size={14} /> Delete deal
            </button>
          </div>
        </div>
      </div>

      {composing && c && user && (
        <MessageComposer
          client={c}
          category="deal"
          extra={dealContext(deal)}
          me={{ name: [profile?.first_name, profile?.last_name].filter(Boolean).join(' '), phone: profile?.phone, email: user.email }}
          author={author}
          onClose={() => setComposing(false)}
        />
      )}
    </div>
  );
}
