'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { clientName } from '@/lib/clients';
import { relativeTime } from '@/lib/leads';
import { fetchInbox, memberName, startConversation, type InboxItem } from '@/lib/messages';
import { MessagePeoplePicker, type PickedPerson } from '@/components/MessagePeoplePicker';
import { FilePicker } from '@/components/MessageFilePicker';

export default function MessagesPage() {
  return (
    <Suspense>
      <Inbox />
    </Suspense>
  );
}

function Inbox() {
  const { user, isAdmin, isBroker, loading: authLoading } = useAuth();
  const params = useSearchParams();
  const isStaff = isAdmin || isBroker;
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [showAll, setShowAll] = useState(false);
  // Opened from a client's page: start a conversation with them.
  const [composing, setComposing] = useState(!!params.get('client'));

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    fetchInbox(user.id).then((r) => {
      if (cancelled) return;
      setItems(r.items);
      setError(r.error);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const term = q.trim().toLowerCase();
  const shown = items
    .filter((c) => showAll || c.me)
    .filter((c) => !term || c.subject.toLowerCase().includes(term) || c.members.some((m) => memberName(m).toLowerCase().includes(term)));
  const others = items.filter((c) => !c.me).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Messages</h1>
          <p className="mt-1 text-gray-600">{isStaff ? 'Private conversations with your team and your clients, with documents and photos.' : 'Your private conversations with us, with documents and photos.'}</p>
        </div>
        {isStaff && !composing && (
          <button onClick={() => setComposing(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            <Plus size={18} /> New conversation
          </button>
        )}
      </div>

      {composing && user && <NewConversation meId={user.id} clientId={params.get('client')} onCancel={() => setComposing(false)} />}

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <label className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by subject or person" aria-label="Search conversations"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </label>
        {isAdmin && others > 0 && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="rounded" />
            Include the company’s other conversations ({others})
          </label>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {loading ? <p className="p-6 text-center text-gray-500">Loading…</p> : shown.length === 0 ? (
          <p className="p-6 text-center text-gray-500">{items.length ? 'No conversations match.' : isStaff ? 'No conversations yet. Start one with a broker or a client.' : 'No messages yet.'}</p>
        ) : shown.map((c) => {
          const people = c.members.filter((m) => m.user_id !== user?.id).map(memberName);
          return (
            <Link key={c.id} href={`/dashboard/messages/${c.id}`} className="flex items-start gap-3 p-4 hover:bg-gray-50">
              <span className={`mt-2 w-2 h-2 rounded-full shrink-0 ${c.unread ? 'bg-blue-600' : 'bg-transparent'}`} aria-label={c.unread ? 'Unread' : undefined} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className={`truncate ${c.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>{c.subject}</p>
                  <time dateTime={c.last_message_at} className="shrink-0 text-xs text-gray-500">{relativeTime(c.last_message_at)}</time>
                </div>
                <p className="text-sm text-gray-600 truncate">{people.join(', ') || 'Just you'}{!c.me && <span className="ml-2 text-xs text-amber-700">not a member</span>}</p>
                {c.last_message_preview && <p className="text-sm text-gray-500 truncate">{c.last_message_preview}</p>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function NewConversation({ meId, clientId, onCancel }: { meId: string; clientId: string | null; onCancel: () => void }) {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [people, setPeople] = useState<PickedPerson[]>([]);
  const [body, setBody] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Starting from a client's page: that client is already picked.
  useEffect(() => {
    if (!clientId) return;
    createClient().from('fanc_clients').select('id, first_name, last_name, email').eq('id', clientId).maybeSingle().then(({ data: c }) => {
      if (!c?.email) return setError(c ? 'This client has no email address on file; add one to message them.' : '');
      setPeople([{ key: `email:${c.email.toLowerCase()}`, email: c.email, name: clientName(c), label: clientName(c), isClient: true, clientId: c.id }]);
      setSubject((s) => s || `${clientName(c)}`);
    });
  }, [clientId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return setError('Add a subject.');
    if (!people.length) return setError('Add at least one person.');
    if (!body.trim() && !files.length) return setError('Write a message or attach a file.');
    setBusy(true);
    setError('');
    const linked = people.find((p) => p.clientId)?.clientId ?? null;
    const r = await startConversation(subject, people, meId, body, files, linked);
    setBusy(false);
    if (r.error && !r.id) return setError(r.error);
    if (r.error) setError(r.error);
    router.push(`/dashboard/messages/${r.id}`);
  };

  return (
    <form onSubmit={submit} className="mb-6 bg-white border border-blue-200 rounded-xl p-5 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">New conversation</h2>
      <label className="block text-sm">
        <span className="block text-gray-600 mb-1">Subject</span>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} placeholder="e.g. 123 Ocean Blvd inspection report"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
      </label>
      <div className="text-sm">
        <span className="block text-gray-600 mb-1">People</span>
        <MessagePeoplePicker value={people} onChange={setPeople} exclude={[meId]} />
      </div>
      <label className="block text-sm">
        <span className="block text-gray-600 mb-1">Message</span>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={20000} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
      </label>
      <FilePicker files={files} onChange={setFiles} />
      {people.some((p) => p.isClient) && <p className="text-xs text-gray-500">Clients get an email with a link to read and reply (a sign-in link if they don’t have a login yet).</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <button disabled={busy} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">{busy ? 'Sending…' : 'Start conversation'}</button>
        <button type="button" onClick={onCancel} className="text-sm text-gray-600 hover:underline">Cancel</button>
      </div>
    </form>
  );
}
