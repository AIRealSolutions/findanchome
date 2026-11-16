import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BROKERAGE, absoluteUrl } from '@/lib/site';
import { deliverEmail, emailConfigured } from '@/lib/email';

// A broker gives a client access to My Home (/dashboard/my-home): switches on fanc_clients.portal_access and
// emails them a sign-in link. Runs with the broker's own session, so the database's access rules apply.
// Without email set up, access is still granted and the link comes back for the broker to send themselves.

export async function POST(request: Request) {
  const auth = request.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : '';
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !key) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  const supabase = createClient(url, key, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: u } = await supabase.auth.getUser(token);
  if (!u.user) return NextResponse.json({ error: 'Your session has expired.' }, { status: 401 });
  const { data: me } = await supabase.from('fanc_user_profiles').select('role, first_name, last_name').eq('id', u.user.id).maybeSingle();
  if (!me || !['broker', 'admin'].includes(me.role)) return NextResponse.json({ error: 'Only brokers can invite.' }, { status: 403 });

  const body = await request.json().catch(() => null);
  const clientId = typeof body?.clientId === 'string' ? body.clientId : '';
  if (!clientId) return NextResponse.json({ error: 'Nothing to send.' }, { status: 400 });

  const { data: c } = await supabase.from('fanc_clients').select('id, first_name, email, do_not_contact').eq('id', clientId).maybeSingle();
  if (!c) return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
  const email = (c.email ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Add an email address to this client first.' }, { status: 400 });

  const { error } = await supabase.from('fanc_clients').update({ portal_access: true, portal_invited_at: new Date().toISOString() }).eq('id', c.id);
  if (error) return NextResponse.json({ error: 'Could not turn on access. Has the My Home database update been applied?' }, { status: 500 });

  const link = absoluteUrl(`/join?email=${encodeURIComponent(email)}&next=${encodeURIComponent('/dashboard/my-home')}`);
  if (c.do_not_contact) return NextResponse.json({ sent: false, link, message: 'Access is on. No email was sent because this client is marked do not contact.' });
  if (!emailConfigured()) return NextResponse.json({ sent: false, link, message: 'Access is on. Email isn’t set up, so send them the link yourself.' });

  const broker = [me.first_name, me.last_name].filter(Boolean).join(' ') || BROKERAGE.agent;
  const text = `Hi ${c.first_name},\n\n${broker} at ${BROKERAGE.name} set up a private page for your home. It keeps your key dates in one place (insurance renewals, warranty, tax deadlines), has a hurricane checklist for our area, and lets you ask what your home is worth with one click.\n\nOpen it here (no password needed): ${link}\n\n${broker}\n${BROKERAGE.name} · ${BROKERAGE.phone}`;
  const r = await deliverEmail([email], 'Your home page at FindaNChome.com', text, u.user.email ?? undefined);
  return NextResponse.json(r.ok ? { sent: true, link } : { sent: false, link, message: `Access is on, but the email failed: ${r.error}` });
}
