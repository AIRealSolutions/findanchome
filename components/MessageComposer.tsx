'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Mail, Copy, X, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { dialable } from '@/lib/leads';
import { clientName, type Client } from '@/lib/clients';
import {
  STARTER_TEMPLATES,
  TEMPLATE_CATEGORIES,
  categoryLabel,
  clientContext,
  defaultTemplate,
  fetchTemplates,
  meContext,
  renderTemplate,
  type Me,
  type MergeContext,
  type MessageTemplate,
  type TemplateCategory,
} from '@/lib/templates';

type Recipient = Pick<Client, 'id' | 'first_name'> & Partial<Pick<Client, 'last_name' | 'spouse_name' | 'address_line1' | 'city' | 'phone' | 'email' | 'do_not_contact'>>;
type Tpl = Pick<MessageTemplate, 'name' | 'category' | 'subject' | 'body' | 'is_default'> & { id: string };

/**
 * Pick a template for a client, adjust it, then open it in Messages or Mail (or copy it).
 * Sending is logged on the client's timeline and updates their last-contacted date.
 */
export default function MessageComposer({ client, category = 'general', extra = {}, me, author, onClose, onSent }: {
  client: Recipient;
  category?: TemplateCategory;
  extra?: MergeContext;
  me: Me;
  author: { id: string; name: string };
  onClose: () => void;
  onSent?: () => void;
}) {
  const [templates, setTemplates] = useState<Tpl[] | null>(null);
  const [chosen, setChosen] = useState('');
  const [body, setBody] = useState('');
  const [subject, setSubject] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const ctx = useMemo(() => ({ ...clientContext(client), ...meContext(me), ...extra }), [client, me, extra]);

  const pick = (t: Tpl | undefined) => {
    if (!t) return;
    setChosen(t.id);
    setBody(renderTemplate(t.body, ctx));
    setSubject(t.subject ? renderTemplate(t.subject, ctx) : '');
  };

  useEffect(() => {
    let cancelled = false;
    fetchTemplates().then(({ templates: saved }) => {
      if (cancelled) return;
      const list: Tpl[] = saved.length ? saved : STARTER_TEMPLATES.map((t, i) => ({ ...t, id: `starter-${i}` }));
      setTemplates(list);
      pick((defaultTemplate(list, category) as Tpl | undefined) ?? list[0]);
    });
    return () => {
      cancelled = true;
    };
    // Only on open: re-picking would overwrite edits.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // The occasion's own category first, then general, then the rest.
  const groups = useMemo(() => {
    const order = [category, 'general', ...TEMPLATE_CATEGORIES.map((c) => c.value)].filter((c, i, a) => a.indexOf(c) === i) as TemplateCategory[];
    return order.map((c) => ({ category: c, items: (templates ?? []).filter((t) => t.category === c) })).filter((g) => g.items.length);
  }, [templates, category]);

  const chosenName = templates?.find((t) => t.id === chosen)?.name ?? 'Message';

  const log = async (kind: 'text' | 'email') => {
    const supabase = createClient();
    const [{ error: e1 }] = await Promise.all([
      supabase.from('fanc_client_activity').insert({
        client_id: client.id, kind, author_id: author.id, author_name: author.name,
        body: `${kind === 'text' ? 'Texted' : 'Emailed'} “${chosenName}”:\n${(kind === 'email' && subject ? `${subject}\n\n` : '') + body}`.slice(0, 5000),
      }),
      supabase.from('fanc_clients').update({ last_contacted_at: new Date().toISOString() }).eq('id', client.id),
    ]);
    if (e1) setError(e1.message);
    onSent?.();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Copy is blocked in this browser; select the text and copy it instead.');
    }
  };

  const sms = client.phone ? `sms:${dialable(client.phone)}?&body=${encodeURIComponent(body)}` : '';
  const mail = client.email ? `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : '';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={onClose}>
      <div role="dialog" aria-label={`Message ${clientName(client)}`} onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-xl max-h-[92vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Message {clientName(client)}</h2>
            <p className="text-sm text-gray-500">{[client.phone, client.email].filter(Boolean).join(' · ') || 'No phone or email on file'}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1 text-gray-500 hover:text-gray-800"><X size={20} /></button>
        </div>

        {client.do_not_contact && (
          <p className="mb-3 p-2 rounded bg-red-50 text-sm text-red-800">This client is marked <strong>do not contact</strong>.</p>
        )}
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        {!templates ? (
          <p className="text-sm text-gray-500">Loading templates…</p>
        ) : (
          <>
            <label className="block text-sm mb-3">
              <span className="block text-gray-500 mb-1">Template</span>
              <select value={chosen} onChange={(e) => pick(templates.find((t) => t.id === e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                {groups.map((g) => (
                  <optgroup key={g.category} label={categoryLabel(g.category)}>
                    {g.items.map((t) => <option key={t.id} value={t.id}>{t.name}{t.is_default ? ' (default)' : ''}</option>)}
                  </optgroup>
                ))}
              </select>
            </label>
            {client.email && (
              <label className="block text-sm mb-3">
                <span className="block text-gray-500 mb-1">Email subject</span>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </label>
            )}
            <label className="block text-sm">
              <span className="block text-gray-500 mb-1">Message</span>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={7}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </label>
            <p className="text-xs text-gray-500 mt-1">{body.length} characters. Edits here only change this message. <Link href="/dashboard/templates" className="text-blue-600 hover:underline">Edit templates</Link></p>

            <div className="mt-4 flex flex-wrap gap-2">
              {sms && (
                <a href={sms} onClick={() => log('text')} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  <MessageCircle size={16} /> Text
                </a>
              )}
              {mail && (
                <a href={mail} onClick={() => log('email')} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  <Mail size={16} /> Email
                </a>
              )}
              <button onClick={copy} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy</>}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Text and Email open your phone&apos;s Messages or your mail app with this filled in, and log it on {client.first_name}&apos;s timeline.</p>
          </>
        )}
      </div>
    </div>
  );
}
