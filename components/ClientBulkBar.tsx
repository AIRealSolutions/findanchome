'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { CLIENT_STATUSES, clientStatusMeta, type Client, type ClientStatus } from '@/lib/clients';

const chunks = <T,>(arr: T[], n: number) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

/** Actions for the clients selected on /dashboard/clients. */
export default function ClientBulkBar({
  selected,
  allTags,
  author,
  onDone,
  onClear,
}: {
  selected: Client[];
  allTags: string[];
  author: { id: string; name: string };
  onDone: (error: string) => void;
  onClear: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [newTag, setNewTag] = useState('');
  const n = selected.length;
  const ids = selected.map((c) => c.id);
  const presentTags = allTags.filter((t) => selected.some((c) => (c.tags ?? []).includes(t)));

  const run = async (fn: (supabase: ReturnType<typeof createClient>) => Promise<string>) => {
    setBusy(true);
    const err = await fn(createClient());
    setBusy(false);
    onDone(err);
  };

  const log = async (supabase: ReturnType<typeof createClient>, rows: { client_id: string; body: string; kind: 'status' | 'note' }[]) => {
    for (const part of chunks(rows, 250)) {
      const { error } = await supabase.from('fanc_client_activity').insert(part.map((r) => ({ ...r, author_id: author.id, author_name: author.name })));
      if (error) return error.message;
    }
    return '';
  };

  const setStatus = (status: ClientStatus) =>
    run(async (supabase) => {
      const changing = selected.filter((c) => c.status !== status);
      for (const part of chunks(changing.map((c) => c.id), 200)) {
        const { error } = await supabase.from('fanc_clients').update({ status }).in('id', part);
        if (error) return error.message;
      }
      return log(supabase, changing.map((c) => ({
        client_id: c.id, kind: 'status', body: `Status changed from ${clientStatusMeta(c.status).label} to ${clientStatusMeta(status).label}`,
      })));
    });

  /** Tags differ per client, so each row is written on its own (a few at a time). */
  const editTags = (fn: (tags: string[]) => string[]) =>
    run(async (supabase) => {
      const changes = selected
        .map((c) => ({ c, next: fn(c.tags ?? []) }))
        .filter(({ c, next }) => next.join('|') !== (c.tags ?? []).join('|'));
      for (const part of chunks(changes, 20)) {
        const results = await Promise.all(part.map(({ c, next }) => supabase.from('fanc_clients').update({ tags: next }).eq('id', c.id)));
        const failed = results.find((r) => r.error);
        if (failed?.error) return failed.error.message;
      }
      return '';
    });

  const addTag = () => {
    const t = newTag.trim();
    if (!t) return;
    setNewTag('');
    editTags((tags) => (tags.includes(t) ? tags : [...tags, t]));
  };

  const setDnc = (on: boolean) =>
    run(async (supabase) => {
      const changing = selected.filter((c) => c.do_not_contact !== on);
      for (const part of chunks(changing.map((c) => c.id), 200)) {
        const { error } = await supabase.from('fanc_clients').update({ do_not_contact: on }).in('id', part);
        if (error) return error.message;
      }
      return log(supabase, changing.map((c) => ({ client_id: c.id, kind: 'status', body: on ? 'Marked do not contact' : 'Removed do-not-contact flag' })));
    });

  const remove = async () => {
    let deals = 0;
    for (const part of chunks(ids, 200)) {
      const { count } = await createClient().from('fanc_deals').select('id', { count: 'exact', head: true }).in('client_id', part);
      deals += count ?? 0;
    }
    const withDeals = deals ? `, ${deals} ${deals === 1 ? 'deal' : 'deals'} (including any commission records)` : '';
    if (!confirm(`Permanently delete ${n} ${n === 1 ? 'client' : 'clients'}, with their closings, dates and timelines${withDeals}?`)) return;
    run(async (supabase) => {
      for (const part of chunks(ids, 200)) {
        const { error } = await supabase.from('fanc_clients').delete().in('id', part);
        if (error) return error.message;
      }
      return '';
    });
  };

  const sel = 'px-2 py-1.5 border border-gray-300 rounded-lg bg-white text-sm disabled:opacity-50';

  return (
    <div className="sticky top-14 lg:top-0 z-20 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex flex-wrap items-center gap-2 text-sm">
      <span className="font-medium text-blue-900">{n} selected</span>
      <button onClick={onClear} title="Clear selection" className="p-1 text-blue-700 hover:text-blue-900"><X size={16} /></button>
      <span className="hidden sm:block w-px h-6 bg-blue-200 mx-1" />

      <select value="" disabled={busy} onChange={(e) => e.target.value && setStatus(e.target.value as ClientStatus)} className={sel}>
        <option value="">Set status…</option>
        {CLIENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>

      <form onSubmit={(e) => { e.preventDefault(); addTag(); }} className="flex gap-1">
        <input value={newTag} onChange={(e) => setNewTag(e.target.value)} list="bulk-tags" placeholder="Add tag" disabled={busy}
          className="w-32 px-2 py-1.5 border border-gray-300 rounded-lg text-sm" />
        <datalist id="bulk-tags">{allTags.map((t) => <option key={t} value={t} />)}</datalist>
        <button type="submit" disabled={busy || !newTag.trim()} className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg disabled:opacity-50">Add</button>
      </form>

      {presentTags.length > 0 && (
        <select value="" disabled={busy} onChange={(e) => { const t = e.target.value; if (t) editTags((tags) => tags.filter((x) => x !== t)); }} className={sel}>
          <option value="">Remove tag…</option>
          {presentTags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      )}

      <select value="" disabled={busy} onChange={(e) => e.target.value && setDnc(e.target.value === 'on')} className={sel}>
        <option value="">Do not contact…</option>
        <option value="on">Mark do not contact</option>
        <option value="off">Clear do not contact</option>
      </select>

      <button onClick={remove} disabled={busy} className="sm:ml-auto px-2.5 py-1.5 text-red-700 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50">Delete</button>
      {busy && <span className="text-blue-800">Saving…</span>}
    </div>
  );
}
