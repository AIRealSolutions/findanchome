// Messages: interoffice and client conversations with files (supabase-migrations/messaging.sql).
// Members read and post; admins can read every conversation. Files go to the private message-files bucket under
// <conversation id>/ and are listed on the message; they're shown through short-lived signed links.

import { createClient } from './supabase/client';

export const FILES_BUCKET = 'message-files';
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

export interface Attachment {
  path: string;
  name: string;
  type: string;
  size: number;
}

export interface Conversation {
  id: string;
  created_at: string;
  subject: string;
  created_by: string | null;
  client_id: string | null;
  last_message_at: string;
  last_message_preview: string | null;
}

export interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string | null;
  email: string;
  name: string | null;
  is_client: boolean;
  last_read_at: string | null;
  notify: boolean;
}

export interface Message {
  id: string;
  created_at: string;
  conversation_id: string;
  author_id: string | null;
  author_name: string | null;
  body: string;
  attachments: Attachment[];
}

export interface InboxItem extends Conversation {
  members: ConversationMember[];
  /** My membership; missing when an admin is looking in on someone else's conversation. */
  me?: ConversationMember;
  unread: boolean;
}

export const memberName = (m: Pick<ConversationMember, 'name' | 'email'>) => m.name || m.email;
export const isImage = (a: Pick<Attachment, 'type'>) => a.type.startsWith('image/');
export const fileSize = (n: number) =>
  n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

const unread = (c: Conversation, me?: ConversationMember) => !!me && (!me.last_read_at || me.last_read_at < c.last_message_at);

export async function fetchInbox(userId: string): Promise<{ items: InboxItem[]; error: string }> {
  const supabase = createClient();
  // A client invited by email gets linked here on their next visit.
  await supabase.rpc('fanc_claim_invites');
  const [convs, members] = await Promise.all([
    supabase.from('fanc_conversations').select('*').order('last_message_at', { ascending: false }).limit(500),
    supabase.from('fanc_conversation_members').select('*').limit(5000),
  ]);
  const all = (members.data ?? []) as ConversationMember[];
  const items = ((convs.data ?? []) as Conversation[]).map((c) => {
    const ms = all.filter((m) => m.conversation_id === c.id);
    const me = ms.find((m) => m.user_id === userId);
    return { ...c, members: ms, me, unread: unread(c, me) };
  });
  return { items, error: (convs.error || members.error)?.message ?? '' };
}

/** Conversations with messages I haven't read, for the sidebar badge. */
export async function unreadCount(userId: string) {
  const supabase = createClient();
  const { data: mine } = await supabase.from('fanc_conversation_members').select('conversation_id, last_read_at').eq('user_id', userId).limit(1000);
  if (!mine?.length) return 0;
  const { data: convs } = await supabase.from('fanc_conversations').select('id, last_message_at')
    .in('id', mine.map((m) => m.conversation_id));
  const read = new Map(mine.map((m) => [m.conversation_id, m.last_read_at as string | null]));
  return (convs ?? []).filter((c) => { const r = read.get(c.id); return !r || r < c.last_message_at; }).length;
}

export async function fetchConversation(id: string) {
  const supabase = createClient();
  const [conv, members, messages] = await Promise.all([
    supabase.from('fanc_conversations').select('*').eq('id', id).maybeSingle(),
    supabase.from('fanc_conversation_members').select('*').eq('conversation_id', id).order('created_at'),
    supabase.from('fanc_messages').select('*').eq('conversation_id', id).order('created_at').limit(2000),
  ]);
  return {
    conversation: (conv.data ?? null) as Conversation | null,
    members: (members.data ?? []) as ConversationMember[],
    messages: (messages.data ?? []) as Message[],
    error: (conv.error || members.error || messages.error)?.message ?? '',
  };
}

/** Signed links (an hour) for every attachment path. */
export async function fileLinks(paths: string[]) {
  if (!paths.length) return new Map<string, string>();
  const { data } = await createClient().storage.from(FILES_BUCKET).createSignedUrls(paths, 3600);
  return new Map((data ?? []).filter((d) => d.signedUrl && d.path).map((d) => [d.path!, d.signedUrl]));
}

const safeName = (name: string) => name.replace(/[^\w.\- ]+/g, '_').replace(/\s+/g, ' ').trim().slice(0, 120) || 'file';

async function upload(conversationId: string, files: File[]) {
  const supabase = createClient();
  const out: Attachment[] = [];
  for (const f of files) {
    if (f.size > MAX_FILE_BYTES) return { attachments: out, error: `${f.name} is over 25 MB.` };
    const path = `${conversationId}/${crypto.randomUUID()}/${safeName(f.name)}`;
    const { error } = await supabase.storage.from(FILES_BUCKET).upload(path, f, { contentType: f.type || 'application/octet-stream', upsert: false });
    if (error) return { attachments: out, error: `${f.name}: ${error.message}` };
    out.push({ path, name: f.name, type: f.type || 'application/octet-stream', size: f.size });
  }
  return { attachments: out, error: '' };
}

export async function sendMessage(conversationId: string, authorId: string, body: string, files: File[]) {
  const up = await upload(conversationId, files);
  if (up.error) {
    if (up.attachments.length) await createClient().storage.from(FILES_BUCKET).remove(up.attachments.map((a) => a.path));
    return up.error;
  }
  const id = crypto.randomUUID();
  const { error } = await createClient().from('fanc_messages').insert({
    id, conversation_id: conversationId, author_id: authorId, body: body.trim(), attachments: up.attachments,
  });
  if (error) return error.message;
  notify({ messageId: id });
  return '';
}

export async function deleteMessage(m: Message) {
  const supabase = createClient();
  const { data, error } = await supabase.from('fanc_messages').delete().eq('id', m.id).select('id');
  if (error || !data?.length) return error?.message ?? 'This message could not be deleted.';
  if (m.attachments.length) await supabase.storage.from(FILES_BUCKET).remove(m.attachments.map((a) => a.path));
  return '';
}

export interface NewMember { user_id?: string; email?: string; name?: string | null }

/** Start a conversation with these people and a first message. Returns its id. */
export async function startConversation(subject: string, people: NewMember[], authorId: string, body: string, files: File[], clientId?: string | null) {
  const supabase = createClient();
  const id = crypto.randomUUID();
  const { error } = await supabase.from('fanc_conversations').insert({ id, subject: subject.trim(), client_id: clientId || null });
  if (error) return { id: '', error: error.message };
  const err = await addMembers(id, people, false);
  if (err) return { id, error: err };
  return { id, error: await sendMessage(id, authorId, body, files) };
}

/** Add people; with announce, they get an email (with a sign-in link if they're new). */
export async function addMembers(conversationId: string, people: NewMember[], announce = true) {
  if (!people.length) return '';
  const rows = people.map((p) => ({ conversation_id: conversationId, user_id: p.user_id ?? null, email: (p.email ?? '').trim().toLowerCase(), name: p.name ?? null }));
  const { data, error } = await createClient().from('fanc_conversation_members')
    .upsert(rows, { onConflict: 'conversation_id,email', ignoreDuplicates: true }).select('id');
  if (error) return error.message;
  if (announce && data?.length) notify({ memberIds: data.map((m) => m.id) });
  return '';
}

export async function markRead(memberId: string) {
  await createClient().from('fanc_conversation_members').update({ last_read_at: new Date().toISOString() }).eq('id', memberId);
}

/** Email the other members (or the newly added ones). Fire and forget; does nothing until email is set up. */
async function notify(payload: { messageId?: string; memberIds?: string[] }) {
  const { data: { session } } = await createClient().auth.getSession();
  if (!session) return;
  await fetch('/api/message-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
