// Turning a website consultation lead (fanc_consultation_requests) into a client database record
// (fanc_clients), linked through fanc_clients.consultation_id (see supabase-migrations/client_links.sql).

import { createClient } from './supabase/client';
import { cleanEmail, cleanPhone } from './client-import';
import { formatDate } from './clients';
import { labels, type Lead } from './leads';

function leadType(intent: string[]) {
  const buy = intent.some((i) => ['buy', 'hud', 'relocate', 'build'].includes(i));
  const sell = intent.includes('sell');
  if (buy && sell) return 'both';
  if (sell) return 'seller';
  if (buy) return 'buyer';
  if (intent.includes('invest')) return 'investor';
  return null;
}

/** Everything the lead told us, as a notes block for the client record. */
export function leadSummary(l: Lead) {
  const areas = [...labels('neighborhoods', l.neighborhoods), ...labels('communities', l.communities), ...labels('counties', l.counties)];
  return [
    `Website consultation request (${formatDate(l.created_at)})`,
    l.intent.length && `Looking to: ${labels('intent', l.intent).join(', ')}`,
    l.timeframe && `Timeframe: ${l.timeframe}`,
    l.price_range && `Price range: ${l.price_range}`,
    l.financing && `Financing: ${l.financing}`,
    areas.length && `Areas: ${areas.join(', ')}`,
    l.lifestyles.length && `Lifestyles: ${labels('lifestyles', l.lifestyles).join(', ')}`,
    l.must_haves.length && `Must-haves: ${l.must_haves.join(', ')}`,
    l.message && `Message: ${l.message}`,
    l.notes && `Lead notes: ${l.notes}`,
  ].filter(Boolean).join('\n');
}

/**
 * Create the client record for a lead, or link the existing client with the same email.
 * Returns the client id.
 */
export async function convertLead(l: Lead, author: { id: string; name: string }): Promise<{ id?: string; linked?: boolean; error?: string }> {
  const supabase = createClient();
  const { data: already } = await supabase.from('fanc_clients').select('id').eq('consultation_id', l.id).maybeSingle();
  if (already) return { id: already.id, linked: true };

  const email = cleanEmail(l.email);
  const note = (client_id: string, body: string) =>
    supabase.from('fanc_client_activity').insert({ client_id, kind: 'note', body, author_id: author.id, author_name: author.name });
  const leadNote = (body: string) =>
    supabase.from('fanc_consultation_activity').insert({ request_id: l.id, kind: 'note', body, author_id: author.id, author_name: author.name });

  if (email) {
    const { data: match } = await supabase.from('fanc_clients').select('id, consultation_id, notes').eq('email', email).limit(1).maybeSingle();
    if (match) {
      const summary = leadSummary(l);
      const { error } = await supabase.from('fanc_clients').update({
        consultation_id: match.consultation_id ?? l.id,
        notes: match.notes?.includes(summary) ? match.notes : [match.notes, summary].filter(Boolean).join('\n\n'),
      }).eq('id', match.id);
      if (error) return { error: error.message };
      await note(match.id, 'Linked to a website consultation request');
      await leadNote('Linked to an existing client record');
      return { id: match.id, linked: true };
    }
  }

  const parts = l.name.trim().split(/\s+/);
  const { data, error } = await supabase.from('fanc_clients').insert({
    first_name: parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0] || l.name,
    last_name: parts.length > 1 ? parts[parts.length - 1] : null,
    email: email ?? l.email,
    phone: l.phone ? cleanPhone(l.phone) ?? l.phone : null,
    status: l.status === 'client' ? 'active' : 'prospect',
    lead_type: leadType(l.intent),
    source: 'findanchome.com consultation',
    tags: ['Website consultation', ...labels('intent', l.intent)],
    notes: leadSummary(l),
    consultation_id: l.id,
  }).select('id').single();
  if (error) return { error: error.message };
  await note(data.id, 'Added from a website consultation request');
  await leadNote('Added to the client database');
  return { id: data.id };
}
