'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Send, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime, relativeTime } from '@/lib/leads';
import {
  addMembers, deleteMessage, fetchConversation, fileLinks, fileSize, isImage, markRead, memberName, sendMessage,
  type Conversation, type ConversationMember, type Message,
} from '@/lib/messages';
import { MessagePeoplePicker, type PickedPerson } from '@/components/MessagePeoplePicker';
import { FilePicker } from '@/components/MessageFilePicker';

/** The conversation with signed links for its files. */
async function fetchAll(id: string) {
  const r = await fetchConversation(id);
  return { ...r, links: await fileLinks(r.messages.flatMap((m) => m.attachments.map((a) => a.path))) };
}

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAdmin, isBroker, loading: authLoading } = useAuth();
  const isStaff = isAdmin || isBroker;
  const [conv, setConv] = useState<Conversation | null>(null);
  const [members, setMembers] = useState<ConversationMember[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [links, setLinks] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [body, setBody] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [adding, setAdding] = useState<PickedPerson[] | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const me = members.find((m) => m.user_id === user?.id);

  const apply = useCallback((r: Awaited<ReturnType<typeof fetchAll>>) => {
    setConv(r.conversation);
    setMembers(r.members);
    setMessages(r.messages);
    setLinks(r.links);
    if (r.error) setError(r.error);
    setLoading(false);
  }, []);
  const load = useCallback(() => fetchAll(id).then(apply), [id, apply]);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    fetchAll(id).then((r) => !cancelled && apply(r));
    // New messages appear without a refresh.
    const supabase = createClient();
    const channel = supabase.channel(`conversation:${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fanc_messages', filter: `conversation_id=eq.${id}` },
        () => fetchAll(id).then((r) => !cancelled && apply(r)))
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [authLoading, id, apply]);

  // Reading the conversation marks it read.
  const lastAt = messages[messages.length - 1]?.created_at;
  useEffect(() => {
    if (me && lastAt && (!me.last_read_at || me.last_read_at < lastAt)) markRead(me.id);
  }, [me, lastAt]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user || (!body.trim() && !files.length)) return;
    setSending(true);
    setError('');
    const err = await sendMessage(id, user.id, body, files);
    setSending(false);
    if (err) return setError(err);
    setBody('');
    setFiles([]);
    load();
  };

  const run = async (fn: () => Promise<string | void>) => {
    setError('');
    const err = await fn();
    if (err) setError(err);
    load();
  };

  const removeMember = (m: ConversationMember) => {
    const self = m.user_id === user?.id;
    if (!confirm(self ? 'Leave this conversation? You won’t see new messages.' : `Remove ${memberName(m)} from this conversation?`)) return;
    run(async () => {
      const { error: err } = await createClient().from('fanc_conversation_members').delete().eq('id', m.id);
      if (err) return err.message;
      if (self && !isAdmin) router.push('/dashboard/messages');
    });
  };

  const deleteConversation = async () => {
    if (!conv || !confirm(`Delete “${conv.subject}” with all its messages for everyone? Attached files are deleted too.`)) return;
    const supabase = createClient();
    const paths = messages.flatMap((m) => m.attachments.map((a) => a.path));
    const { data, error: err } = await supabase.from('fanc_conversations').delete().eq('id', conv.id).select('id');
    if (err || !data?.length) return setError(err?.message ?? 'Only the person who started it or an admin can delete this conversation.');
    if (paths.length) await supabase.storage.from('message-files').remove(paths);
    router.push('/dashboard/messages');
  };

  const rename = () => {
    const subject = conv && prompt('Subject', conv.subject)?.trim();
    if (!conv || !subject || subject === conv.subject) return;
    run(async () => (await createClient().from('fanc_conversations').update({ subject }).eq('id', conv.id)).error?.message);
  };

  if (loading) return <p className="text-gray-500">Loading conversation…</p>;
  if (!conv) {
    return (
      <div>
        <Link href="/dashboard/messages" className="inline-flex items-center gap-1 text-sm text-blue-600 mb-4"><ArrowLeft size={16} /> Messages</Link>
        <p className="text-gray-600">{error || 'This conversation was not found, or you are not in it.'}</p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/dashboard/messages" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4"><ArrowLeft size={16} /> Messages</Link>
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="min-w-0 bg-white border border-gray-200 rounded-xl flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 break-words">{conv.subject}</h1>
              <p className="text-sm text-gray-500">{members.length} {members.length === 1 ? 'person' : 'people'} · started {formatDateTime(conv.created_at)}</p>
            </div>
            {isStaff && <button onClick={rename} className="shrink-0 text-sm text-blue-600 hover:underline">Rename</button>}
          </div>

          {!me && (
            <div className="m-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900 flex flex-wrap items-center gap-2">
              You’re viewing this as an admin and aren’t a member.
              <button onClick={() => user && run(() => addMembers(id, [{ user_id: user.id }], false))} className="underline font-medium">Join to reply</button>
            </div>
          )}

          <ol className="p-4 space-y-4 overflow-y-auto max-h-[65vh]">
            {messages.length === 0 && <p className="text-sm text-gray-500">No messages yet.</p>}
            {messages.map((m) => {
              const mine = m.author_id === user?.id;
              return (
                <li key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`group max-w-[85%] rounded-2xl px-4 py-2.5 ${mine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                    <div className={`flex items-baseline justify-between gap-3 text-xs ${mine ? 'text-blue-100' : 'text-gray-500'}`}>
                      <span className="font-medium">{mine ? 'You' : m.author_name ?? 'Someone'}</span>
                      <span className="flex items-center gap-2">
                        <time dateTime={m.created_at} title={formatDateTime(m.created_at)}>{relativeTime(m.created_at)}</time>
                        {(mine || isAdmin) && (
                          <button onClick={() => confirm('Delete this message for everyone?') && run(() => deleteMessage(m))} aria-label="Delete message"
                            className="opacity-60 hover:opacity-100"><Trash2 size={12} /></button>
                        )}
                      </span>
                    </div>
                    {m.body && <p className="mt-1 whitespace-pre-wrap break-words text-sm">{m.body}</p>}
                    {m.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {m.attachments.filter(isImage).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {m.attachments.filter(isImage).map((a) => links.get(a.path) && (
                              <a key={a.path} href={links.get(a.path)} target="_blank" rel="noopener">
                                {/* Signed links expire, so these aren't run through next/image. */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={links.get(a.path)} alt={a.name} className="h-32 w-auto max-w-full rounded-lg object-cover bg-white" />
                              </a>
                            ))}
                          </div>
                        )}
                        {m.attachments.filter((a) => !isImage(a)).map((a) => (
                          <a key={a.path} href={links.get(a.path)} target="_blank" rel="noopener" download={a.name}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${mine ? 'bg-blue-700 hover:bg-blue-800' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}>
                            <FileText size={16} className="shrink-0" />
                            <span className="truncate">{a.name}</span>
                            <span className={`shrink-0 text-xs ${mine ? 'text-blue-100' : 'text-gray-500'}`}>{fileSize(a.size)}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
            <div ref={endRef} />
          </ol>

          {me && (
            <form onSubmit={send} className="p-4 border-t border-gray-200 space-y-2">
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={20000} placeholder="Write a message…"
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <FilePicker files={files} onChange={setFiles} />
                <button disabled={sending || (!body.trim() && !files.length)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
                  <Send size={16} /> {sending ? 'Sending…' : 'Send'}
                </button>
              </div>
            </form>
          )}
          {!me && error && <p className="px-4 pb-4 text-sm text-red-600">{error}</p>}
        </div>

        <aside className="space-y-4">
          <section className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">People</h2>
            <ul className="space-y-2">
              {members.map((m) => (
                <li key={m.id} className="flex items-start justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <p className="text-gray-900 truncate">{memberName(m)}{m.user_id === user?.id && ' (you)'}</p>
                    <p className="text-xs text-gray-500">
                      {m.is_client ? 'Client' : 'Staff'}{!m.user_id && ' · invited, hasn’t signed in yet'}
                    </p>
                  </div>
                  {(isStaff || m.user_id === user?.id) && (
                    <button onClick={() => removeMember(m)} className="shrink-0 text-xs text-gray-500 hover:text-red-600">{m.user_id === user?.id ? 'Leave' : 'Remove'}</button>
                  )}
                </li>
              ))}
            </ul>
            {isStaff && (me || isAdmin) && (adding ? (
              <div className="mt-4 space-y-3">
                <MessagePeoplePicker value={adding} onChange={setAdding} exclude={members.map((m) => m.user_id ?? '')} />
                <div className="flex gap-3">
                  <button disabled={!adding.length} onClick={() => run(() => addMembers(id, adding)).then(() => setAdding(null))}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">Add</button>
                  <button onClick={() => setAdding(null)} className="text-sm text-gray-600 hover:underline">Cancel</button>
                </div>
                <p className="text-xs text-gray-500">New people can read the whole conversation, and get an email with a link.</p>
              </div>
            ) : (
              <button onClick={() => setAdding([])} className="mt-4 text-sm text-blue-600 hover:underline">+ Add people</button>
            ))}
          </section>

          {me && (
            <section className="bg-white border border-gray-200 rounded-xl p-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={me.notify} className="rounded"
                  onChange={(e) => run(async () => (await createClient().from('fanc_conversation_members').update({ notify: e.target.checked }).eq('id', me.id)).error?.message)} />
                Email me about new messages
              </label>
            </section>
          )}

          {isStaff && (conv.created_by === user?.id || isAdmin) && (
            <button onClick={deleteConversation} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"><Trash2 size={14} /> Delete conversation</button>
          )}
        </aside>
      </div>
    </div>
  );
}
