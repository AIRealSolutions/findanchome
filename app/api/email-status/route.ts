import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BROKERAGE } from '@/lib/site';
import { deliverEmail, emailConfigured, emailSender, usingTestSender } from '@/lib/email';

// Admin-only check of the email setup that carries new-lead alerts, client invites and message alerts.
//  GET  → whether RESEND_API_KEY is set and which address emails are sent from.
//  POST → sends a test email to the lead-alert address and reports what the email service answered.

async function adminOnly(request: Request) {
  const auth = request.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : '';
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !key) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  const supabase = createClient(url, key, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: u } = await supabase.auth.getUser(token);
  if (!u.user) return NextResponse.json({ error: 'Your session has expired.' }, { status: 401 });
  const { data: me } = await supabase.from('fanc_user_profiles').select('role').eq('id', u.user.id).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Admins only.' }, { status: 403 });
  return null;
}

const notifyAddress = () => process.env.CONSULTATION_NOTIFY_EMAIL || BROKERAGE.email;

export async function GET(request: Request) {
  const denied = await adminOnly(request);
  if (denied) return denied;
  return NextResponse.json({
    configured: emailConfigured(),
    testSender: usingTestSender(),
    sender: emailSender(),
    notifyTo: notifyAddress(),
  });
}

export async function POST(request: Request) {
  const denied = await adminOnly(request);
  if (denied) return denied;
  const to = notifyAddress();
  const r = await deliverEmail([to], 'Test: FindaNChome.com email alerts are working',
    `This is a test from your FindaNChome.com dashboard.\n\nNew-lead alerts are sent to this address (${to}) from ${emailSender()}.`);
  return NextResponse.json({ ...r, to });
}
