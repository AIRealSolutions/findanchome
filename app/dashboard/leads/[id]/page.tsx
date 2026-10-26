'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, MessageCircle, Mail, ExternalLink, CalendarClock, UserPlus, UserCheck, House } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { communities, communityPath } from '@/lib/communities';
import { neighborhoods } from '@/lib/neighborhoods';
import { lifestyles } from '@/lib/lifestyles';
import { absoluteUrl } from '@/lib/site';
import { convertLead } from '@/lib/lead-conversion';
import {
  ACTIVITY_ICONS,
  ACTIVITY_KINDS,
  PRIORITIES,
  STATUSES,
  dialable,
  followUpState,
  formatDateTime,
  labels,
  relativeTime,
  statusMeta,
  toLocalInput,
  type ActivityKind,
  type Lead,
  type LeadActivity,
  type LeadPriority,
  type LeadStatus,
} from '@/lib/leads';

const CONTACT_KINDS: ActivityKind[] = ['call', 'text', 'email', 'meeting'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 py-1.5 text-sm">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900">{children || <span className="text-gray-400">—</span>}</dd>
    </div>
  );
}

function Chips({ items }: { items: { key: string; label: string; href?: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) =>
        i.href ? (
          <a key={i.key} href={i.href} target="_blank" rel="noopener" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-xs hover:bg-blue-100">
            {i.label} <ExternalLink size={10} />
          </a>
        ) : (
          <span key={i.key} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 text-xs">{i.label}</span>
        ),
      )}
    </div>
  );
}

async function fetchLead(id: string) {
  const supabase = createClient();
  const [{ data: l, error: e1 }, { data: a, error: e2 }] = await Promise.all([
    supabase.from('fanc_consultation_requests').select('*').eq('id', id).maybeSingle(),
    supabase.from('fanc_consultation_activity').select('*').eq('request_id', id).order('created_at', { ascending: false }),
  ]);
  const { data: c } = await supabase.from('fanc_clients').select('id').eq('consultation_id', id).maybeSingle();
  return {
    lead: (l as Lead | null) ?? null,
    activity: (a ?? []) as LeadActivity[],
    clientId: (c?.id as string | undefined) ?? null,
    error: (e1 || e2)?.message ?? '',
  };
}

function addDays(days: number, hour = 9) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [activity, setActivity] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [kind, setKind] = useState<Exclude<ActivityKind, 'status'>>('call');
  const [body, setBody] = useState('');
  const [followUp, setFollowUp] = useState('');

  const authorName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user?.email || 'Broker';

  const apply = useCallback((r: Awaited<ReturnType<typeof fetchLead>>) => {
    if (r.error) setError(r.error);
    setLead(r.lead);
    setFollowUp(toLocalInput(r.lead?.follow_up_at ?? null));
    setActivity(r.activity);
    setClientId(r.clientId);
    setLoading(false);
  }, []);

  const load = useCallback(() => fetchLead(id).then(apply), [id, apply]);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    fetchLead(id).then((r) => !cancelled && apply(r));
    return () => {
      cancelled = true;
    };
  }, [authLoading, id, apply]);

  /** Update the lead and append timeline entries, then refresh. */
  const save = async (updates: Partial<Lead>, entries: { kind: ActivityKind; body: string }[] = []) => {
    if (!lead || !user) return false;
    setSaving(true);
    setError('');
    const supabase = createClient();
    if (Object.keys(updates).length) {
      const { error: err } = await supabase.from('fanc_consultation_requests').update(updates).eq('id', lead.id);
      if (err) {
        setError(err.message);
        setSaving(false);
        return false;
      }
    }
    if (entries.length) {
      const { error: err } = await supabase.from('fanc_consultation_activity').insert(
        entries.map((e) => ({ ...e, request_id: lead.id, author_id: user.id, author_name: authorName })),
      );
      if (err) setError(err.message);
    }
    await load();
    setSaving(false);
    return true;
  };

  const toClient = async () => {
    if (!lead || !user) return;
    setSaving(true);
    setError('');
    const r = await convertLead(lead, { id: user.id, name: authorName });
    setSaving(false);
    if (r.error) return setError(r.error);
    router.push(`/dashboard/clients/${r.id}`);
  };

  const changeStatus = (status: LeadStatus) => {
    if (!lead || status === lead.status) return;
    save({ status }, [{ kind: 'status', body: `Status changed from ${statusMeta(lead.status).label} to ${statusMeta(status).label}` }]);
  };

  const changePriority = (priority: LeadPriority) => {
    if (lead && priority !== lead.priority) save({ priority });
  };

  const setFollowUpAt = (iso: string | null) => {
    setFollowUp(toLocalInput(iso));
    save({ follow_up_at: iso }, [
      { kind: 'note', body: iso ? `Follow-up set for ${formatDateTime(iso)}` : 'Follow-up cleared' },
    ]);
  };

  const logActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !body.trim()) return;
    const updates: Partial<Lead> = {};
    const entries: { kind: ActivityKind; body: string }[] = [{ kind, body: body.trim() }];
    if (CONTACT_KINDS.includes(kind)) {
      updates.last_contacted_at = new Date().toISOString();
      if (lead.status === 'new') {
        updates.status = 'contacted';
        entries.push({ kind: 'status', body: 'Status changed from New to Contacted' });
      }
    }
    if (await save(updates, entries)) setBody('');
  };

  if (loading) return <p className="text-gray-500">Loading lead…</p>;
  if (!lead) {
    return (
      <div>
        <Link href="/dashboard/leads" className="inline-flex items-center gap-1 text-sm text-blue-600 mb-4"><ArrowLeft size={16} /> All leads</Link>
        <p className="text-gray-600">{error || 'This lead was not found, or you do not have access to it.'}</p>
      </div>
    );
  }

  const fu = followUpState(lead);
  const communityChips = lead.communities.map((slug) => {
    const c = communities.find((x) => x.slug === slug);
    return { key: slug, label: c?.name ?? slug, href: c ? absoluteUrl(communityPath(c)) : undefined };
  });
  const neighborhoodChips = lead.neighborhoods.map((slug) => {
    const n = neighborhoods.find((x) => x.slug === slug);
    return { key: slug, label: n ? `${n.name} (${n.town})` : slug, href: n ? absoluteUrl(`/explore/${n.county}#new-construction`) : undefined };
  });
  const lifestyleChips = lead.lifestyles.map((slug) => {
    const l = lifestyles.find((x) => x.slug === slug);
    return { key: slug, label: l ? `${l.emoji} ${l.name}` : slug, href: l ? absoluteUrl(`/lifestyle/${l.slug}`) : undefined };
  });

  return (
    <div>
      <Link href="/dashboard/leads" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4">
        <ArrowLeft size={16} /> All leads
      </Link>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{lead.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Received {formatDateTime(lead.created_at)} ({relativeTime(lead.created_at)})
              {lead.last_contacted_at && <> · Last contacted {relativeTime(lead.last_contacted_at)}</>}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {lead.phone && (
                <>
                  <a href={`tel:${dialable(lead.phone)}`} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    <Phone size={16} /> {lead.phone}
                  </a>
                  <a href={`sms:${dialable(lead.phone)}`} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                    <MessageCircle size={16} /> Text
                  </a>
                </>
              )}
              <a href={`mailto:${lead.email}?subject=${encodeURIComponent('Your FindaNChome.com consultation request')}`} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                <Mail size={16} /> {lead.email}
              </a>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {lead.intent.includes('sell') && (
                <Link href={`/dashboard/listings/new?lead=${lead.id}`} className="inline-flex items-center gap-2 px-3 py-2 border border-indigo-300 text-indigo-800 rounded-lg text-sm font-medium hover:bg-indigo-50">
                  <House size={16} /> Onboard as a listing opportunity
                </Link>
              )}
              {clientId ? (
                <Link href={`/dashboard/clients/${clientId}`} className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-900">
                  <UserCheck size={16} /> In the client database: view client record
                </Link>
              ) : (
                <button onClick={toClient} disabled={saving} className="inline-flex items-center gap-2 px-3 py-2 border border-green-300 text-green-800 rounded-lg text-sm font-medium hover:bg-green-50 disabled:opacity-50">
                  <UserPlus size={16} /> Add to client database
                </button>
              )}
            </div>
            {lead.preferred_contact && (
              <p className="text-sm text-gray-600 mt-2">
                Prefers: <strong>{lead.preferred_contact === 'call' ? 'phone call' : lead.preferred_contact}</strong>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 lg:w-80">
            <label className="text-sm">
              <span className="block text-gray-500 mb-1">Status</span>
              <select value={lead.status} disabled={saving} onChange={(e) => changeStatus(e.target.value as LeadStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
            <label className="text-sm">
              <span className="block text-gray-500 mb-1">Priority</span>
              <select value={lead.priority} disabled={saving} onChange={(e) => changePriority(e.target.value as LeadPriority)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </label>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Left: what they told us */}
        <div className="space-y-6 min-w-0">
          <Section title="Goals">
            <dl>
              <Row label="Looking to">{labels('intent', lead.intent).join(', ')}</Row>
              <Row label="Timeframe">{lead.timeframe}</Row>
              <Row label="Price range">{lead.price_range}</Row>
              <Row label="Financing">{lead.financing}</Row>
            </dl>
            {lead.message && (
              <blockquote className="mt-3 p-3 bg-gray-50 border-l-4 border-blue-300 rounded-r text-gray-800 whitespace-pre-wrap">
                {lead.message}
              </blockquote>
            )}
          </Section>

          <Section title="Areas & interests">
            <dl>
              <Row label="Counties">{labels('counties', lead.counties).join(', ')}</Row>
              <Row label="Communities"><Chips items={communityChips} /></Row>
              <Row label="Neighborhoods"><Chips items={neighborhoodChips} /></Row>
              <Row label="Lifestyles"><Chips items={lifestyleChips} /></Row>
              <Row label="Must-haves"><Chips items={lead.must_haves.map((m) => ({ key: m, label: m }))} /></Row>
            </dl>
          </Section>

          <Section title="Source">
            <dl>
              <Row label="Submitted from">
                {lead.source_page && (
                  <a href={absoluteUrl(lead.source_page)} target="_blank" rel="noopener" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                    {lead.source_page} <ExternalLink size={12} />
                  </a>
                )}
              </Row>
              <Row label="Lead ID"><span className="font-mono text-xs">{lead.id}</span></Row>
            </dl>
          </Section>
        </div>

        {/* Right: working the lead */}
        <div className="space-y-6">
          <Section title="Follow-up">
            {fu === 'overdue' && <p className="mb-2 text-sm font-medium text-red-700">Overdue: {formatDateTime(lead.follow_up_at!)}</p>}
            {fu === 'today' && <p className="mb-2 text-sm font-medium text-yellow-700">Due today: {formatDateTime(lead.follow_up_at!)}</p>}
            <div className="flex gap-2">
              <input type="datetime-local" value={followUp} onChange={(e) => setFollowUp(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg" />
              <button disabled={saving || !followUp} onClick={() => setFollowUpAt(new Date(followUp).toISOString())}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                Save
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { label: 'Tomorrow 9am', iso: addDays(1) },
                { label: 'In 3 days', iso: addDays(3) },
                { label: 'Next week', iso: addDays(7) },
              ].map((o) => (
                <button key={o.label} disabled={saving} onClick={() => setFollowUpAt(o.iso)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-gray-300 text-xs hover:border-blue-400">
                  <CalendarClock size={12} /> {o.label}
                </button>
              ))}
              {lead.follow_up_at && (
                <button disabled={saving} onClick={() => setFollowUpAt(null)} className="px-2.5 py-1 rounded-full text-xs text-gray-500 hover:text-red-600">
                  Clear
                </button>
              )}
            </div>
          </Section>

          <Section title="Log activity">
            <form onSubmit={logActivity}>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {ACTIVITY_KINDS.map((k) => (
                  <button key={k.value} type="button" onClick={() => setKind(k.value)} aria-pressed={kind === k.value}
                    className={`px-3 py-1.5 rounded-full text-sm border ${kind === k.value ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                    <span aria-hidden>{k.icon}</span> {k.label}
                  </button>
                ))}
              </div>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={5000}
                placeholder={kind === 'note' ? 'Add a note…' : `What happened on the ${kind}?`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <button type="submit" disabled={saving || !body.trim()}
                className="mt-2 w-full py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
                {saving ? 'Saving…' : 'Log'}
              </button>
              {lead.status === 'new' && CONTACT_KINDS.includes(kind) && (
                <p className="mt-2 text-xs text-gray-500">Logging a {kind} moves this lead to Contacted.</p>
              )}
            </form>
          </Section>

          <Section title="Timeline">
            {activity.length === 0 ? (
              <p className="text-sm text-gray-500">No activity yet.</p>
            ) : (
              <ol className="space-y-4">
                {activity.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="text-lg leading-none mt-0.5" aria-hidden>{ACTIVITY_ICONS[a.kind]}</span>
                    <div className="min-w-0">
                      <p className={`text-sm whitespace-pre-wrap ${a.kind === 'status' ? 'text-gray-500 italic' : 'text-gray-900'}`}>{a.body}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {a.author_name ?? 'Unknown'} · <time dateTime={a.created_at} title={formatDateTime(a.created_at)}>{relativeTime(a.created_at)}</time>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
            <p className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">Lead submitted {formatDateTime(lead.created_at)}</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
