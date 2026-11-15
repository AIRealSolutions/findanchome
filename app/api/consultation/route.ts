import { NextResponse } from 'next/server';
import { absoluteUrl } from '@/lib/site';
import { VALID, labelFor, type ConsultationPayload } from '@/lib/consultation';
import { CALL_US, alertTeam, fail, intakeDb, isBot, readBody, userAgent } from '@/lib/intake-server';

// Consultation requests and buyer preference answers. Saved to fanc_consultation_requests (insert-only for the
// public), attached to the person's contact record by the database, and emailed to the team (lib/intake-server.ts).

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
  const body = await readBody<ConsultationPayload>(request);
  if (!body) return fail('Invalid request.');
  if (isBot(body)) return NextResponse.json({ ok: true });

  const name = str(body.name, 200);
  const email = str(body.email, 320);
  if (!name) return fail('Please enter your name.');
  if (!EMAIL_RE.test(email)) return fail('Please enter a valid email address.');

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
    user_agent: userAgent(request),
  };

  const db = await intakeDb(request, { anonymous: true });
  if ('error' in db) return db.error;
  const { error } = await db.supabase.from('fanc_consultation_requests').insert(row);
  if (error) {
    console.error('Consultation request insert failed:', error.message);
    return fail(CALL_US, 500);
  }

  const join = (kind: Parameters<typeof labelFor>[0], values: string[]) => values.map((v) => labelFor(kind, v)).join(', ') || '—';
  await alertTeam({
    subject: `New consultation request: ${row.name}`,
    heading: 'New consultation request',
    replyTo: row.email,
    action: { label: 'Open Leads in the dashboard', url: absoluteUrl('/dashboard/leads') },
    lines: [
      ['Name', row.name],
      ['Email', row.email],
      ['Phone', row.phone ?? '—'],
      ['Preferred contact', row.preferred_contact ?? '—'],
      ['Looking to', join('intent', row.intent)],
      ['Timeframe', row.timeframe ?? '—'],
      ['Price range', row.price_range ?? '—'],
      ['Financing', row.financing ?? '—'],
      ['Counties', join('counties', row.counties)],
      ['Communities', join('communities', row.communities)],
      ['Neighborhoods', join('neighborhoods', row.neighborhoods)],
      ['Lifestyles', join('lifestyles', row.lifestyles)],
      ['Must-haves', row.must_haves.join(', ') || '—'],
      ['Message', row.message ?? '—'],
      ['Submitted from', row.source_page ? absoluteUrl(row.source_page) : '—'],
    ],
  });

  return NextResponse.json({ ok: true });
}
