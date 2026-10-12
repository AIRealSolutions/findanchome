import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BROKERAGE, absoluteUrl } from '@/lib/site';
import { VALID, labelFor, type ConsultationPayload } from '@/lib/consultation';

// Saves consultation requests to Supabase (fanc_consultation_requests, insert-only for the public)
// and, when RESEND_API_KEY is set, emails a summary to CONSULTATION_NOTIFY_EMAIL (default: the broker).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown, max: number) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function list(v: unknown, allowed: Set<string>) {
  return Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string' && allowed.has(x)))] : [];
}

function pick(v: unknown, allowed: Set<string>) {
  return typeof v === 'string' && allowed.has(v) ? v : null;
}

export async function POST(request: Request) {
  let body: Partial<ConsultationPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Bots fill in the hidden field; pretend it worked.
  if (str(body.company, 200)) return NextResponse.json({ ok: true });

  const name = str(body.name, 200);
  const email = str(body.email, 320);
  if (!name) return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });

  const row = {
    name,
    email,
    phone: str(body.phone, 50) || null,
    preferred_contact: pick(body.preferredContact, new Set(['call', 'text', 'email'])),
    intent: list(body.intent, VALID.intent),
    timeframe: pick(body.timeframe, VALID.timeframe),
    price_range: pick(body.priceRange, VALID.priceRange),
    financing: pick(body.financing, VALID.financing),
    counties: list(body.counties, VALID.counties),
    communities: list(body.communities, VALID.communities),
    neighborhoods: list(body.neighborhoods, VALID.neighborhoods),
    lifestyles: list(body.lifestyles, VALID.lifestyles),
    must_haves: list(body.mustHaves, VALID.mustHaves),
    message: str(body.message, 5000) || null,
    source_page: str(body.sourcePage, 300) || null,
    user_agent: str(request.headers.get('user-agent'), 500) || null,
  };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('Consultation request: Supabase environment variables are missing');
    return NextResponse.json({ error: 'We could not send your request. Please call us instead.' }, { status: 500 });
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from('fanc_consultation_requests').insert(row);
  if (error) {
    console.error('Consultation request insert failed:', error.message);
    return NextResponse.json({ error: 'We could not send your request. Please call us instead.' }, { status: 500 });
  }

  await notify(row).catch((err) => console.error('Consultation notification failed:', err));

  return NextResponse.json({ ok: true });
}

async function notify(row: Record<string, unknown>) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const join = (kind: Parameters<typeof labelFor>[0], values: unknown) =>
    (values as string[]).map((v) => labelFor(kind, v)).join(', ') || '—';
  const lines: [string, string][] = [
    ['Name', String(row.name)],
    ['Email', String(row.email)],
    ['Phone', String(row.phone ?? '—')],
    ['Preferred contact', String(row.preferred_contact ?? '—')],
    ['Looking to', join('intent', row.intent)],
    ['Timeframe', String(row.timeframe ?? '—')],
    ['Price range', String(row.price_range ?? '—')],
    ['Financing', String(row.financing ?? '—')],
    ['Counties', join('counties', row.counties)],
    ['Communities', join('communities', row.communities)],
    ['Neighborhoods', join('neighborhoods', row.neighborhoods)],
    ['Lifestyles', join('lifestyles', row.lifestyles)],
    ['Must-haves', (row.must_haves as string[]).join(', ') || '—'],
    ['Message', String(row.message ?? '—')],
    ['Submitted from', row.source_page ? absoluteUrl(String(row.source_page)) : '—'],
  ];
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONSULTATION_FROM_EMAIL || 'FindaNChome.com <onboarding@resend.dev>',
      to: [process.env.CONSULTATION_NOTIFY_EMAIL || BROKERAGE.email],
      reply_to: String(row.email),
      subject: `New consultation request: ${row.name}`,
      text: lines.map(([k, v]) => `${k}: ${v}`).join('\n'),
      html: `<h2>New consultation request</h2><table cellpadding="6">${lines
        .map(([k, v]) => `<tr><td><strong>${esc(k)}</strong></td><td>${esc(v).replace(/\n/g, '<br>')}</td></tr>`)
        .join('')}</table>`,
    }),
  }).then((res) => {
    if (!res.ok) throw new Error(`Resend responded ${res.status}`);
  });
}
