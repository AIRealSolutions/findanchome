import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BROKERAGE, absoluteUrl } from '@/lib/site';
import { intakeToRow, type ListingIntake } from '@/lib/listing-intake';
import { formatMoney } from '@/lib/clients';
import { sourceMeta } from '@/lib/listings';

// Listing opportunities from anyone who isn't a broker: the Sell page and client-portal referrals. The database
// trigger files them as pending review (see supabase-migrations/listing_opportunities.sql), so this route never
// decides that. When RESEND_API_KEY is set, the admin gets an email to review it.

export async function POST(request: Request) {
  let body: Partial<ListingIntake>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Bots fill in the hidden field; pretend it worked.
  if (typeof body.company === 'string' && body.company.trim()) return NextResponse.json({ ok: true });

  const { row, error: invalid } = intakeToRow(body);
  if (!row) return NextResponse.json({ error: invalid }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('Listing opportunity: Supabase environment variables are missing');
    return NextResponse.json({ error: 'We could not send your request. Please call us instead.' }, { status: 500 });
  }

  // Signed-in clients submit as themselves, so the record shows who referred it.
  const auth = request.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : '';
  const supabase = createClient(url, key, {
    auth: { persistSession: false },
    ...(token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}),
  });

  let submittedBy = '';
  if (token) {
    const { data: u } = await supabase.auth.getUser(token);
    if (!u.user) return NextResponse.json({ error: 'Your session has expired. Please sign in again.' }, { status: 401 });
    const { data: p } = await supabase.from('fanc_user_profiles').select('first_name, last_name').eq('id', u.user.id).maybeSingle();
    submittedBy = [p?.first_name, p?.last_name].filter(Boolean).join(' ') || u.user.email || '';
  }
  // The public form is always a website request; a signed-in client is referring someone.
  if (!token) row.source = 'website';
  else if (row.source === 'website' || row.source === 'other') row.source = 'referral';

  const { error } = await supabase.from('fanc_listing_opportunities').insert({
    ...row,
    created_by_name: submittedBy || null,
    user_agent: (request.headers.get('user-agent') ?? '').slice(0, 500) || null,
  });
  if (error) {
    console.error('Listing opportunity insert failed:', error.message);
    return NextResponse.json({ error: 'We could not send your request. Please call us instead.' }, { status: 500 });
  }

  await notify(row, submittedBy).catch((err) => console.error('Listing opportunity notification failed:', err));
  return NextResponse.json({ ok: true });
}

async function notify(row: NonNullable<ReturnType<typeof intakeToRow>['row']>, submittedBy: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const lines: [string, string][] = [
    ['Owner', row.owner_name ?? ''],
    ['Phone', row.owner_phone ?? '—'],
    ['Email', row.owner_email ?? '—'],
    ['Property', [row.property_address, row.city, row.zip_code].filter(Boolean).join(', ') || '—'],
    ['Reason', row.reason ?? '—'],
    ['Timeline', row.timeline ?? '—'],
    ['Hoping for', formatMoney(row.price_expectation ?? null) || '—'],
    ['Source', [sourceMeta(row.source!).label, row.source_detail].filter(Boolean).join(': ')],
    ['Submitted by', submittedBy || 'Website visitor'],
    ['Message', row.message ?? '—'],
  ];
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
  const reviewUrl = absoluteUrl('/dashboard/listings?view=review');

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONSULTATION_FROM_EMAIL || 'FindaNChome.com <onboarding@resend.dev>',
      to: [process.env.LISTING_NOTIFY_EMAIL || process.env.CONSULTATION_NOTIFY_EMAIL || BROKERAGE.email],
      ...(row.owner_email ? { reply_to: row.owner_email } : {}),
      subject: `Listing opportunity to review: ${row.owner_name}`,
      text: [...lines.map(([k, v]) => `${k}: ${v}`), '', `Review it: ${reviewUrl}`].join('\n'),
      html: `<h2>New listing opportunity to review</h2><table cellpadding="6">${lines
        .map(([k, v]) => `<tr><td><strong>${esc(k)}</strong></td><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`)
        .join('')}</table><p><a href="${reviewUrl}">Approve or reject it in the dashboard</a></p>`,
    }),
  }).then((res) => {
    if (!res.ok) throw new Error(`Resend responded ${res.status}`);
  });
}
