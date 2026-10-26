'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Star, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { clientName, type Client } from '@/lib/clients';
import {
  MERGE_FIELDS,
  SAMPLE_CONTEXT,
  TEMPLATE_CATEGORIES,
  categoryLabel,
  clientContext,
  ensureStarterTemplates,
  fetchTemplates,
  meContext,
  renderTemplate,
  type MessageTemplate,
  type TemplateCategory,
} from '@/lib/templates';

type Draft = { id?: string; name: string; category: TemplateCategory; subject: string; body: string; is_default: boolean };
type Person = Pick<Client, 'id' | 'first_name' | 'last_name' | 'spouse_name' | 'address_line1' | 'city'>;

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const blank = (category: TemplateCategory = 'general'): Draft => ({ name: '', category, subject: '', body: '', is_default: false });
const toDraft = (t: MessageTemplate): Draft => ({ id: t.id, name: t.name, category: t.category, subject: t.subject ?? '', body: t.body, is_default: t.is_default });

export default function TemplatesPage() {
  const { user, profile, isAdmin, isBroker, loading: authLoading } = useAuth();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [previewId, setPreviewId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async (selectId?: string) => {
    const r = await fetchTemplates();
    setError(r.error);
    setTemplates(r.templates);
    setLoading(false);
    const sel = r.templates.find((t) => t.id === selectId) ?? r.templates[0];
    setDraft((d) => (selectId || !d ? (sel ? toDraft(sel) : blank()) : d));
  }, []);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    ensureStarterTemplates().then((err) => {
      if (cancelled) return;
      if (err) setError(err);
      load();
    });
    createClient().from('fanc_clients').select('id, first_name, last_name, spouse_name, address_line1, city')
      .order('last_name', { nullsFirst: false }).limit(5000)
      .then(({ data }) => !cancelled && setPeople((data ?? []) as Person[]));
    return () => {
      cancelled = true;
    };
  }, [authLoading, load]);

  const me = useMemo(
    () => meContext({ name: [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Your Name', phone: profile?.phone, email: user?.email }),
    [profile, user],
  );
  const previewCtx = useMemo(() => {
    const p = people.find((x) => x.id === previewId);
    return { ...SAMPLE_CONTEXT, ...me, ...(p ? clientContext(p) : {}) };
  }, [people, previewId, me]);

  const insertField = (key: string) => {
    if (!draft) return;
    const el = bodyRef.current;
    const token = `{${key}}`;
    const start = el?.selectionStart ?? draft.body.length;
    const end = el?.selectionEnd ?? draft.body.length;
    setDraft({ ...draft, body: draft.body.slice(0, start) + token + draft.body.slice(end) });
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft || !draft.name.trim() || !draft.body.trim()) return;
    setSaving(true);
    setError('');
    const supabase = createClient();
    // Only one default per category.
    if (draft.is_default) {
      const q = supabase.from('fanc_message_templates').update({ is_default: false }).eq('category', draft.category).eq('is_default', true);
      const { error: err } = await (draft.id ? q.neq('id', draft.id) : q);
      if (err) {
        setSaving(false);
        return setError(err.message);
      }
    }
    const row = { name: draft.name.trim(), category: draft.category, subject: draft.subject.trim() || null, body: draft.body.trim(), is_default: draft.is_default };
    const res = draft.id
      ? await supabase.from('fanc_message_templates').update(row).eq('id', draft.id).select('id').single()
      : await supabase.from('fanc_message_templates').insert({ ...row, sort: templates.filter((t) => t.category === draft.category).length }).select('id').single();
    setSaving(false);
    if (res.error) return setError(res.error.message);
    load(res.data.id);
  };

  const remove = async () => {
    if (!draft?.id || !confirm(`Delete the template "${draft.name}"?`)) return;
    const { error: err } = await createClient().from('fanc_message_templates').delete().eq('id', draft.id);
    if (err) return setError(err.message);
    setDraft(null);
    load();
  };

  if (!authLoading && !isAdmin && !isBroker) {
    return <p className="text-gray-600">Message templates are available to brokers and admins.</p>;
  }

  const saved = draft?.id ? templates.find((t) => t.id === draft.id) : undefined;
  const dirty = draft && (!saved || JSON.stringify(toDraft(saved)) !== JSON.stringify(draft));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Message templates</h1>
          <p className="mt-1 text-gray-600">Texts and emails for birthdays, anniversaries, renewals, deals and check-ins. The default in each group is what the calendar suggests.</p>
        </div>
        <button onClick={() => setDraft(blank(draft?.category))} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 self-start">
          <Plus size={16} /> New template
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <nav className="bg-white border border-gray-200 rounded-xl p-3 lg:max-h-[75vh] lg:overflow-y-auto">
          {loading ? (
            <p className="p-3 text-sm text-gray-500">Loading…</p>
          ) : (
            TEMPLATE_CATEGORIES.map((c) => {
              const list = templates.filter((t) => t.category === c.value);
              if (!list.length) return null;
              return (
                <div key={c.value} className="mb-3 last:mb-0">
                  <h2 className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{c.label}</h2>
                  <ul>
                    {list.map((t) => (
                      <li key={t.id}>
                        <button onClick={() => setDraft(toDraft(t))}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-sm flex items-center gap-2 ${draft?.id === t.id ? 'bg-blue-50 text-blue-800' : 'text-gray-800 hover:bg-gray-50'}`}>
                          <span className="flex-1 truncate">{t.name}</span>
                          {t.is_default && <Star size={14} className="shrink-0 fill-amber-400 text-amber-400" aria-label="Default" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </nav>

        {draft && (
          <form onSubmit={save} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 min-w-0">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="block text-gray-500 mb-1">Name</span>
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required maxLength={120} className={inputCls} />
              </label>
              <label className="text-sm">
                <span className="block text-gray-500 mb-1">Used for</span>
                <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as TemplateCategory })} className={`${inputCls} bg-white`}>
                  {TEMPLATE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </label>
            </div>
            <label className="block text-sm">
              <span className="block text-gray-500 mb-1">Email subject <span className="text-gray-400">(texts don&apos;t use it)</span></span>
              <input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} className={inputCls} />
            </label>
            <div>
              <label className="block text-sm">
                <span className="block text-gray-500 mb-1">Message</span>
                <textarea ref={bodyRef} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} required rows={7} maxLength={5000} className={inputCls} />
              </label>
              <div className="mt-2 flex flex-wrap gap-1">
                {MERGE_FIELDS.map((f) => (
                  <button key={f.key} type="button" onClick={() => insertField(f.key)} title={`Insert {${f.key}}`}
                    className="px-2 py-0.5 rounded-full border border-gray-300 text-xs text-gray-700 hover:border-blue-400 hover:text-blue-700">
                    {f.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Click a field to insert it. Put optional words in square brackets, like <code className="px-1 bg-gray-100 rounded">[ with {'{provider}'}]</code>, and
                they&apos;re left out when that field is blank.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={draft.is_default} onChange={(e) => setDraft({ ...draft, is_default: e.target.checked })} className="rounded" />
              Default for {categoryLabel(draft.category).toLowerCase()} (suggested on the calendar)
            </label>

            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Preview</span>
                <select value={previewId} onChange={(e) => setPreviewId(e.target.value)} className="px-2 py-1 border border-gray-300 rounded-lg bg-white text-sm max-w-60">
                  <option value="">Sample client</option>
                  {people.map((p) => <option key={p.id} value={p.id}>{clientName(p)}</option>)}
                </select>
              </div>
              {draft.subject && <p className="text-sm font-medium text-gray-900 mb-1">{renderTemplate(draft.subject, previewCtx)}</p>}
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{renderTemplate(draft.body, previewCtx) || <span className="text-gray-400">Start typing to see a preview.</span>}</p>
              <p className="mt-2 text-xs text-gray-500">Occasion fields (years, date, provider, property) use sample values here.</p>
            </div>

            <div className="flex items-center gap-2">
              <button type="submit" disabled={saving || !dirty} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
                {saving ? 'Saving…' : draft.id ? 'Save changes' : 'Create template'}
              </button>
              {draft.id && (
                <button type="button" onClick={remove} className="ml-auto inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600">
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
