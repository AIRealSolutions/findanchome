import { NextResponse } from 'next/server';
import { absoluteUrl } from '@/lib/site';
import { intakeToRow, type ListingIntake } from '@/lib/listing-intake';
import { formatMoney } from '@/lib/clients';
import { sourceMeta } from '@/lib/listings';
import { CALL_US, alertTeam, fail, intakeDb, isBot, readBody, userAgent } from '@/lib/intake-server';

// Listing opportunities from anyone who isn't a broker: the Sell page and client-portal referrals. The database
// files them as pending review (see supabase-migrations/listing_opportunities.sql) and attaches them to the
// owner's contact record; the admin gets an email to review it (lib/intake-server.ts).

export async function POST(request: Request) {
  const body = await readBody<ListingIntake>(request);
  if (!body) return fail('Invalid request.');
  if (isBot(body)) return NextResponse.json({ ok: true });

  const { row, error: invalid } = intakeToRow(body);
  if (!row) return fail(invalid ?? 'Invalid request.');

  // Signed-in clients submit as themselves, so the record shows who referred it.
  const db = await intakeDb(request);
  if ('error' in db) return db.error;
  const { supabase, submittedBy } = db;

  // The public form is always a website request; a signed-in client is referring someone.
  if (!submittedBy) row.source = 'website';
  else if (row.source === 'website' || row.source === 'other') row.source = 'referral';

  const { error } = await supabase.from('fanc_listing_opportunities').insert({
    ...row,
    created_by_name: submittedBy || null,
    user_agent: userAgent(request),
  });
  if (error) {
    console.error('Listing opportunity insert failed:', error.message);
    return fail(CALL_US, 500);
  }

  await alertTeam({
    subject: `Listing opportunity to review: ${row.owner_name}`,
    heading: 'New listing opportunity to review',
    replyTo: row.owner_email,
    to: process.env.LISTING_NOTIFY_EMAIL,
    action: { label: 'Approve or reject it in the dashboard', url: absoluteUrl('/dashboard/listings?view=review') },
    lines: [
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
    ],
  });
  return NextResponse.json({ ok: true });
}
