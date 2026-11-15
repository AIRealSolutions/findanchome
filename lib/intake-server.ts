// The one way website requests come in. Every public form (consultation request, buyer preference tool,
// sell / home-value request, a client's seller referral) posts to an API route that uses these helpers to
// read the request, save it and alert the team. The database then attaches the request to the person's
// contact record in fanc_clients, matching an existing client or creating a prospect
// (see supabase-migrations/unified_intake.sql), so there is one record per person however they reached us.

import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { BROKERAGE } from './site';
import { deliverEmail, emailConfigured, escapeHtml } from './email';

export const CALL_US = 'We could not send your request. Please call us instead.';

export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

/** The JSON body, or null when it isn't JSON. */
export async function readBody<T>(request: Request): Promise<Partial<T> | null> {
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? (body as Partial<T>) : null;
  } catch {
    return null;
  }
}

/** Bots fill in the hidden "company" field; real visitors never see it. */
export const isBot = (body: { company?: unknown }) => typeof body.company === 'string' && body.company.trim() !== '';

export const userAgent = (request: Request) => (request.headers.get('user-agent') ?? '').slice(0, 500) || null;

/**
 * A database connection for the request: anonymous for website visitors, or as the signed-in person when the
 * browser sent their session (a client referring a seller), so the database's own access rules apply.
 * `anonymous` ignores any session: the request is filed as a plain website request.
 */
export async function intakeDb(request: Request, opts: { anonymous?: boolean } = {}): Promise<{ supabase: SupabaseClient; submittedBy: string } | { error: NextResponse }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('Intake: Supabase environment variables are missing');
    return { error: fail(CALL_US, 500) };
  }
  const auth = request.headers.get('authorization');
  const token = !opts.anonymous && auth?.startsWith('Bearer ') ? auth.slice(7) : '';
  const supabase = createClient(url, key, {
    auth: { persistSession: false },
    ...(token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}),
  });
  if (!token) return { supabase, submittedBy: '' };

  const { data: u } = await supabase.auth.getUser(token);
  if (!u.user) return { error: fail('Your session has expired. Please sign in again.', 401) };
  const { data: p } = await supabase.from('fanc_user_profiles').select('first_name, last_name').eq('id', u.user.id).maybeSingle();
  return { supabase, submittedBy: [p?.first_name, p?.last_name].filter(Boolean).join(' ') || u.user.email || '' };
}

/** Emails the team a summary of a new request. Never throws: a request is saved even when email is down. */
export async function alertTeam(opts: {
  subject: string;
  heading: string;
  lines: [string, string][];
  replyTo?: string | null;
  /** A dashboard link shown under the summary. */
  action?: { label: string; url: string };
  /** Overrides the usual lead-alert address. */
  to?: string;
}) {
  if (!emailConfigured()) return;
  const to = opts.to || process.env.CONSULTATION_NOTIFY_EMAIL || BROKERAGE.email;
  const text = [...opts.lines.map(([k, v]) => `${k}: ${v}`), ...(opts.action ? ['', `${opts.action.label}: ${opts.action.url}`] : [])].join('\n');
  const html = `<h2>${escapeHtml(opts.heading)}</h2><table cellpadding="6">${opts.lines
    .map(([k, v]) => `<tr><td><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(v).replace(/\n/g, '<br>')}</td></tr>`)
    .join('')}</table>${opts.action ? `<p><a href="${escapeHtml(opts.action.url)}">${escapeHtml(opts.action.label)}</a></p>` : ''}`;
  const r = await deliverEmail([to], opts.subject, text, opts.replyTo || undefined, html);
  if (!r.ok) console.error('Intake alert failed:', r.error, opts.subject);
}
