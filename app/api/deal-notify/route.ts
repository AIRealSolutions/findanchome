import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BROKERAGE, absoluteUrl } from '@/lib/site';

// Emails for the shared deal workspace, sent through Resend when RESEND_API_KEY is set:
//  - { postId }: a new post or reply. Broker posts go to the invited clients, client posts to the broker.
//  - { inviteMemberId }: a broker invites a client to the workspace.
// Everything is read with the caller's own session, so the database's access rules decide what they can send.

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export async function POST(request: Request) {
  const auth = request.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  let body: { postId?: string; inviteMemberId?: string };
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
  const myEmail = (u.user.email ?? '').toLowerCase();

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ sent: false, message: 'Email isn’t set up yet (RESEND_API_KEY); copy the join link instead.' });
  }

  if (body.inviteMemberId) {
    const { data: me } = await supabase.from('fanc_user_profiles').select('role, first_name, last_name').eq('id', u.user.id).maybeSingle();
    if (!me || !['broker', 'admin'].includes(me.role)) return NextResponse.json({ error: 'Only brokers can invite.' }, { status: 403 });
    const { data: m } = await supabase.from('fanc_deal_members').select('email, name, deal_id').eq('id', body.inviteMemberId).maybeSingle();
    if (!m) return NextResponse.json({ error: 'Invite not found.' }, { status: 404 });
    const { data: deals } = await supabase.rpc('fanc_workspace_deals', { only_deal: m.deal_id });
    const d = deals?.[0];
    const broker = [me.first_name, me.last_name].filter(Boolean).join(' ') || BROKERAGE.agent;
    const what = d?.property_address ? `${d.property_address}${d.city ? `, ${d.city}` : ''}` : d?.side === 'seller' ? 'your home sale' : 'your home purchase';
    const link = absoluteUrl(`/join?email=${encodeURIComponent(m.email)}`);
    const hello = m.name ? `Hi ${m.name.split(' ')[0]},` : 'Hi,';
    const text = `${hello}\n\n${broker} has set up a private workspace for ${what}. You'll see daily updates, a shared to-do list and every key date in one place.\n\nOpen it here (no password needed): ${link}\n\n${broker}\n${BROKERAGE.name} · ${BROKERAGE.phone}`;
    await send([m.email], `Your deal workspace for ${what}`, text, myEmail || undefined);
    return NextResponse.json({ sent: true });
  }

  if (body.postId) {
    const { data: post } = await supabase.from('fanc_deal_posts').select('*').eq('id', body.postId).maybeSingle();
    if (!post || post.internal) return NextResponse.json({ sent: false });
    const { data: deals } = await supabase.rpc('fanc_workspace_deals', { only_deal: post.deal_id });
    const d = deals?.[0];
    if (!d) return NextResponse.json({ sent: false });
    let to: string[];
    if (post.author_role === 'client') {
      to = [d.broker_email || BROKERAGE.email];
    } else {
      const { data: members } = await supabase.from('fanc_deal_members').select('email').eq('deal_id', post.deal_id);
      to = (members ?? []).map((m) => m.email);
    }
    to = [...new Set(to.filter((e) => e && e.toLowerCase() !== myEmail))];
    if (!to.length) return NextResponse.json({ sent: false });
    const what = d.property_address || (d.side === 'seller' ? 'your home sale' : 'your home purchase');
    const link = absoluteUrl(`/dashboard/deals/${d.id}/workspace`);
    const who = post.author_name || (post.author_role === 'client' ? 'Your client' : 'Your broker');
    await send(to, `${post.parent_id ? 'New reply' : 'New update'}: ${what}`, `${who} posted:\n\n${post.body}${post.link_url ? `\n\n${post.link_url}` : ''}\n\nSee the full workspace: ${link}`, myEmail || undefined);
    return NextResponse.json({ sent: true });
  }

  return NextResponse.json({ error: 'Nothing to send.' }, { status: 400 });
}

async function send(to: string[], subject: string, text: string, replyTo?: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONSULTATION_FROM_EMAIL || 'FindaNChome.com <onboarding@resend.dev>',
      to,
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      text,
      html: `<div style="font-family:sans-serif;line-height:1.5">${esc(text).replace(/\n/g, '<br>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')}</div>`,
    }),
  });
  if (!res.ok) console.error('Deal workspace email failed:', res.status);
}
