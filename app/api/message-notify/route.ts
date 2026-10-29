import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BROKERAGE, absoluteUrl } from '@/lib/site';
import { emailConfigured, sendEmail } from '@/lib/email';
import type { Conversation, ConversationMember, Message } from '@/lib/messages';

// Email alerts for Messages, sent through Resend when RESEND_API_KEY is set:
//  - { messageId }: a new message, to every other member who has alerts on.
//  - { memberIds }: people just added to a conversation.
// People without a login yet get a sign-in link (the /join page); everyone else a link to the conversation.
// Everything is read with the caller's own session, so the database's access rules decide what they can send.

export async function POST(request: Request) {
  const auth = request.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  let body: { messageId?: string; memberIds?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: 'Not configured.' }, { status: 500 });
  const supabase = createClient(url, key, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: u } = await supabase.auth.getUser(token);
  if (!u.user) return NextResponse.json({ error: 'Your session has expired.' }, { status: 401 });
  if (!emailConfigured()) return NextResponse.json({ sent: false, message: 'Email isn’t set up yet (RESEND_API_KEY).' });

  const linkFor = (m: ConversationMember, conversationId: string) => {
    const page = `/dashboard/messages/${conversationId}`;
    return m.user_id ? absoluteUrl(page) : absoluteUrl(`/join?email=${encodeURIComponent(m.email)}&next=${encodeURIComponent(page)}`);
  };
  const footer = `\n\n${BROKERAGE.name} · ${BROKERAGE.phone}\nYou get these emails because you're in this conversation.`;

  if (body.messageId) {
    const { data: msg } = await supabase.from('fanc_messages').select('*').eq('id', body.messageId).maybeSingle<Message>();
    if (!msg || msg.author_id !== u.user.id) return NextResponse.json({ sent: false });
    const [{ data: conv }, { data: members }] = await Promise.all([
      supabase.from('fanc_conversations').select('*').eq('id', msg.conversation_id).maybeSingle<Conversation>(),
      supabase.from('fanc_conversation_members').select('*').eq('conversation_id', msg.conversation_id),
    ]);
    if (!conv) return NextResponse.json({ sent: false });
    const to = ((members ?? []) as ConversationMember[]).filter((m) => m.notify && m.user_id !== u.user.id);
    const who = msg.author_name || 'Someone';
    const files = msg.attachments.length ? `\n\n📎 ${msg.attachments.map((a) => a.name).join(', ')}` : '';
    const preview = msg.body.length > 1500 ? `${msg.body.slice(0, 1500)}…` : msg.body;
    // One email per person: each gets their own link.
    await Promise.all(to.map((m) => sendEmail([m.email], `${who}: ${conv.subject}`,
      `${who} wrote in “${conv.subject}”:\n\n${preview}${files}\n\nRead and reply: ${linkFor(m, conv.id)}${footer}`)));
    return NextResponse.json({ sent: to.length > 0 });
  }

  if (body.memberIds?.length) {
    const { data: members } = await supabase.from('fanc_conversation_members').select('*').in('id', body.memberIds.slice(0, 50));
    const added = ((members ?? []) as ConversationMember[]).filter((m) => m.user_id !== u.user.id);
    if (!added.length) return NextResponse.json({ sent: false });
    const { data: conv } = await supabase.from('fanc_conversations').select('*').eq('id', added[0].conversation_id).maybeSingle<Conversation>();
    if (!conv) return NextResponse.json({ sent: false });
    const { data: me } = await supabase.from('fanc_user_profiles').select('first_name, last_name').eq('id', u.user.id).maybeSingle();
    const who = [me?.first_name, me?.last_name].filter(Boolean).join(' ') || u.user.email || 'Your broker';
    await Promise.all(added.filter((m) => m.conversation_id === conv.id).map((m) => sendEmail([m.email], `You've been added to “${conv.subject}”`,
      `${m.name ? `Hi ${m.name.split(' ')[0]},` : 'Hi,'}\n\n${who} added you to a private conversation: “${conv.subject}”.\n\nOpen it here${m.user_id ? '' : ' (no password needed)'}: ${linkFor(m, conv.id)}${footer}`,
      u.user.email ?? undefined)));
    return NextResponse.json({ sent: true });
  }

  return NextResponse.json({ error: 'Nothing to send.' }, { status: 400 });
}
