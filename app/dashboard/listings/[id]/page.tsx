'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CalendarClock, Check, Mail, MessageCircle, Phone, Trophy, UserCheck, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { COUNTY_NAMES, type CountySlug } from '@/lib/lifestyles';
import { formatMoney } from '@/lib/clients';
import { LocationOwner, OpportunityPhotos, SituationPanel } from '@/components/OpportunityField';
import { PRIORITIES, dialable, formatDateTime, relativeTime, toLocalInput, type LeadPriority } from '@/lib/leads';
import {
  LISTING_ACTIVITY_ICONS, LISTING_ACTIVITY_KINDS, LISTING_STAGES, OCCUPANCY, OPEN_LISTING_STAGES, REASONS, SELLER_TIMELINES,
  assignOpportunity, changeListingStage, convertToListing, dueState, equity, fetchStaff, inDays, listingStageMeta, logListingActivity, opportunityTitle,
  isBrokerOwned, propertySummary, recordTouch, reviewOpportunity, sourceMeta, staffName,
  type ListingActivity, type ListingActivityKind, type ListingOpportunity, type ListingStage, type StaffMember,
} from '@/lib/listings';

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 py-1.5 text-sm">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900">{children || <span className="text-gray-400">—</span>}</dd>
    </div>
  );
}

const input = 'w-full px-3 py-2 border border-gray-300 rounded-lg';

async function fetchOpportunity(id: string) {
  const supabase = createClient();
  const [{ data: o, error: e1 }, { data: a, error: e2 }, staff] = await Promise.all([
    supabase.from('fanc_listing_opportunities').select('*').eq('id', id).maybeSingle(),
    supabase.from('fanc_listing_activity').select('*').eq('opportunity_id', id).order('created_at', { ascending: false }),
    fetchStaff(),
  ]);
  return { opp: (o as ListingOpportunity | null) ?? null, activity: (a ?? []) as ListingActivity[], staff, error: (e1 || e2)?.message ?? '' };
}

type EditFields = Pick<ListingOpportunity,
  'property_address' | 'city' | 'zip_code' | 'reason' | 'timeline' | 'occupancy' | 'price_expectation' | 'mortgage_balance' | 'estimated_value' | 'notes'>;

export default function ListingOpportunityPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const [opp, setOpp] = useState<ListingOpportunity | null>(null);
  const [activity, setActivity] = useState<ListingActivity[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [kind, setKind] = useState<Exclude<ListingActivityKind, 'status' | 'review'>>('call');
  const [body, setBody] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [appointment, setAppointment] = useState('');
  const [edit, setEdit] = useState<EditFields | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [lostReason, setLostReason] = useState('');
  const [closing, setClosing] = useState<'won' | 'lost' | null>(null);

  const author = { id: user?.id ?? '', name: [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user?.email || 'Broker' };

  const apply = useCallback((r: Awaited<ReturnType<typeof fetchOpportunity>>) => {
    if (r.error) setError(r.error);
    setOpp(r.opp);
    setActivity(r.activity);
    setStaff(r.staff);
    setFollowUp(toLocalInput(r.opp?.follow_up_at ?? null));
    setAppointment(toLocalInput(r.opp?.appointment_at ?? null));
    setAssignTo(r.opp?.assigned_to ?? r.opp?.requested_broker_id ?? user?.id ?? '');
    setListPrice(String(r.opp?.estimated_value ?? r.opp?.price_expectation ?? ''));
    setLoading(false);
  }, [user]);
  const load = useCallback(() => fetchOpportunity(id).then(apply), [id, apply]);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    fetchOpportunity(id).then((r) => !cancelled && apply(r));
    return () => {
      cancelled = true;
    };
  }, [authLoading, id, apply]);

  /** Run a write, show its error, and refresh. */
  const run = async (fn: () => Promise<string | undefined | void>) => {
    setSaving(true);
    setError('');
    const err = await fn();
    if (err) setError(err);
    await load();
    setSaving(false);
    return !err;
  };

  const update = (updates: Partial<ListingOpportunity>, note?: string) =>
    run(async () => {
      const { error: err } = await createClient().from('fanc_listing_opportunities').update(updates).eq('id', id);
      if (err) return err.message;
      if (note) await logListingActivity(id, [{ kind: 'note', body: note }], author);
    });

  if (loading) return <p className="text-gray-500">Loading opportunity…</p>;
  if (!opp) {
    return (
      <div>
        <Link href="/dashboard/listings" className="inline-flex items-center gap-1 text-sm text-blue-600 mb-4"><ArrowLeft size={16} /> Listing opportunities</Link>
        <p className="text-gray-600">{error || 'This opportunity was not found, it is waiting for admin review, or you do not have access to it.'}</p>
      </div>
    );
  }

  const meta = listingStageMeta(opp.stage);
  const open = opp.review_status === 'approved' && OPEN_LISTING_STAGES.includes(opp.stage);
  const due = dueState(opp.follow_up_at);
  const eq = equity(opp);

  const logActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    if (await run(() => recordTouch(opp, kind, body.trim(), author))) setBody('');
  };

  const setFollowUpAt = (iso: string | null) =>
    update({ follow_up_at: iso }, iso ? `Follow-up set for ${formatDateTime(iso)}` : 'Follow-up cleared');

  const saveAppointment = () => {
    if (!appointment) return;
    const iso = new Date(appointment).toISOString();
    run(async () => {
      if (opp.stage !== 'appointment') {
        const err = await changeListingStage(opp, 'appointment', author, { appointment_at: iso, follow_up_at: null }, `listing appointment ${formatDateTime(iso)}`);
        if (err) return err;
      } else {
        const { error: err } = await createClient().from('fanc_listing_opportunities').update({ appointment_at: iso }).eq('id', id);
        if (err) return err.message;
        await logListingActivity(id, [{ kind: 'note', body: `Listing appointment moved to ${formatDateTime(iso)}` }], author);
      }
    });
  };

  const win = async () => {
    const price = Number(listPrice.replace(/[$,\s]/g, '')) || null;
    setSaving(true);
    setError('');
    const r = await convertToListing(opp, price, author);
    setSaving(false);
    if (r.error) return setError(r.error);
    router.push(`/dashboard/deals/${r.dealId}`);
  };

  const saveEdit = () => {
    if (!edit) return;
    update(edit, 'Updated the property and motivation details').then((ok) => ok && setEdit(null));
  };

  return (
    <div>
      <Link href="/dashboard/listings" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4">
        <ArrowLeft size={16} /> Listing opportunities
      </Link>

      {opp.review_status === 'pending_review' && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="font-medium text-amber-900">Waiting for admin review</p>
          <p className="text-sm text-amber-800">
            Submitted by {opp.created_by_name || (opp.created_by_role === 'public' ? 'a website visitor' : 'a client')} {relativeTime(opp.created_at)}. Brokers see it once it is approved.
          </p>
          {isAdmin && (
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <select value={assignTo} onChange={(e) => setAssignTo(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                {staff.map((s) => <option key={s.id} value={s.id}>Assign to {staffName(s)}{s.id === user?.id ? ' (me)' : ''}</option>)}
              </select>
              <input value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Note (optional)" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <button disabled={saving} onClick={() => run(() => reviewOpportunity(opp, 'approved', assignTo, reviewNote, author, staffName(staff.find((s) => s.id === assignTo))))}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"><Check size={16} /> Approve</button>
              <button disabled={saving} onClick={() => run(() => reviewOpportunity(opp, 'rejected', null, reviewNote, author))}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm disabled:opacity-50"><X size={16} /> Reject</button>
            </div>
          )}
        </div>
      )}
      {opp.review_status === 'rejected' && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
          Rejected{opp.reviewed_at && ` ${relativeTime(opp.reviewed_at)}`}{opp.review_note && `: ${opp.review_note}`}
          {isAdmin && (
            <button disabled={saving} onClick={() => run(() => reviewOpportunity(opp, 'approved', assignTo || user!.id, 'Reconsidered', author))} className="ml-3 underline">Approve after all</button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{opp.owner_name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full ${meta.className}`}>{meta.short}</span>
            </div>
            <p className="text-gray-700 mt-1">{opportunityTitle(opp)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {sourceMeta(opp.source).icon} {sourceMeta(opp.source).label}{opp.source_detail && `: ${opp.source_detail}`} · added {relativeTime(opp.created_at)}
              {opp.last_contacted_at && <> · last contacted {relativeTime(opp.last_contacted_at)}</>}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {opp.owner_phone && (
                <>
                  <a href={`tel:${dialable(opp.owner_phone)}`} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"><Phone size={16} /> {opp.owner_phone}</a>
                  <a href={`sms:${dialable(opp.owner_phone)}`} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"><MessageCircle size={16} /> Text</a>
                </>
              )}
              {opp.owner_email && (
                <a href={`mailto:${opp.owner_email}?subject=${encodeURIComponent(`Your home${opp.property_address ? ` at ${opp.property_address}` : ''}`)}`}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"><Mail size={16} /> {opp.owner_email}</a>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              {opp.client_id && <Link href={`/dashboard/clients/${opp.client_id}`} className="inline-flex items-center gap-1 text-green-700 hover:text-green-900"><UserCheck size={16} /> Client record</Link>}
              {opp.consultation_id && <Link href={`/dashboard/leads/${opp.consultation_id}`} className="text-blue-600 hover:underline">Consultation lead</Link>}
              {opp.deal_id && <Link href={`/dashboard/deals/${opp.deal_id}`} className="text-blue-600 hover:underline font-medium">Listing deal →</Link>}
            </div>
            {opp.preferred_contact && <p className="text-sm text-gray-600 mt-2">Prefers: <strong>{opp.preferred_contact === 'call' ? 'phone call' : opp.preferred_contact}</strong></p>}
          </div>

          {opp.review_status === 'approved' && (
            <div className="grid grid-cols-2 gap-3 lg:w-96">
              <label className="text-sm">
                <span className="block text-gray-500 mb-1">Stage</span>
                <select value={opp.stage} disabled={saving || !open} onChange={(e) => run(() => changeListingStage(opp, e.target.value as ListingStage, author))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                  {LISTING_STAGES.filter((s) => OPEN_LISTING_STAGES.includes(s.value) || s.value === opp.stage).map((s) => <option key={s.value} value={s.value}>{s.short}</option>)}
                </select>
              </label>
              <label className="text-sm">
                <span className="block text-gray-500 mb-1">Priority</span>
                <select value={opp.priority} disabled={saving} onChange={(e) => update({ priority: e.target.value as LeadPriority })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                  {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </label>
              <label className="text-sm col-span-2">
                <span className="block text-gray-500 mb-1">Assigned to</span>
                {isAdmin && !isBrokerOwned(opp, staff) ? (
                  <select value={opp.assigned_to ?? ''} disabled={saving}
                    onChange={(e) => run(() => assignOpportunity(opp, e.target.value || null, author, staffName(staff.find((s) => s.id === e.target.value))))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                    <option value="">Unassigned</option>
                    {staff.map((s) => <option key={s.id} value={s.id}>{staffName(s)}{s.id === user?.id ? ' (me)' : ''}</option>)}
                  </select>
                ) : (
                  <p className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                    {opp.assigned_to ? staffName(staff.find((s) => s.id === opp.assigned_to)) : 'Unassigned'}{opp.assigned_to === user?.id ? ' (me)' : ''}
                  </p>
                )}
                <span className="block text-xs text-gray-500 mt-1">
                  {isBrokerOwned(opp, staff)
                    ? `Brought in by ${opp.created_by === user?.id ? 'you' : opp.created_by_name || 'this broker'}, so it stays on their dashboard.`
                    : isAdmin ? 'Company opportunity: give it to any broker.' : 'Company opportunity: the broker-in-charge assigns it.'}
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6 min-w-0">
          <Section title="Property & motivation">
            {edit ? (
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <label className="sm:col-span-2">Address<input value={edit.property_address ?? ''} onChange={(e) => setEdit({ ...edit, property_address: e.target.value || null })} className={input} /></label>
                <label>City<input value={edit.city ?? ''} onChange={(e) => setEdit({ ...edit, city: e.target.value || null })} className={input} /></label>
                <label>ZIP<input value={edit.zip_code ?? ''} onChange={(e) => setEdit({ ...edit, zip_code: e.target.value || null })} className={input} /></label>
                <label>Reason<select value={edit.reason ?? ''} onChange={(e) => setEdit({ ...edit, reason: e.target.value || null })} className={`${input} bg-white`}><option value="">—</option>{REASONS.map((r) => <option key={r}>{r}</option>)}</select></label>
                <label>Timeline<select value={edit.timeline ?? ''} onChange={(e) => setEdit({ ...edit, timeline: e.target.value || null })} className={`${input} bg-white`}><option value="">—</option>{SELLER_TIMELINES.map((r) => <option key={r}>{r}</option>)}</select></label>
                <label>Occupancy<select value={edit.occupancy ?? ''} onChange={(e) => setEdit({ ...edit, occupancy: (e.target.value || null) as EditFields['occupancy'] })} className={`${input} bg-white`}><option value="">—</option>{OCCUPANCY.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select></label>
                {(['price_expectation', 'mortgage_balance', 'estimated_value'] as const).map((f) => (
                  <label key={f}>{{ price_expectation: 'Price they hope for', mortgage_balance: 'Mortgage balance', estimated_value: 'Your CMA value' }[f]}
                    <input inputMode="numeric" value={edit[f] ?? ''} onChange={(e) => setEdit({ ...edit, [f]: Number(e.target.value.replace(/[$,\s]/g, '')) || null })} className={input} />
                  </label>
                ))}
                <label className="sm:col-span-2">Private notes<textarea rows={3} value={edit.notes ?? ''} onChange={(e) => setEdit({ ...edit, notes: e.target.value || null })} className={input} /></label>
                <div className="sm:col-span-2 flex gap-2">
                  <button disabled={saving} onClick={saveEdit} className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">Save</button>
                  <button onClick={() => setEdit(null)} className="px-3 py-2 border border-gray-300 rounded-lg">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <dl>
                  <Row label="Property">{propertySummary(opp)}</Row>
                  <Row label="County">{opp.county ? COUNTY_NAMES[opp.county as CountySlug] ?? opp.county : ''}</Row>
                  <Row label="Condition">{opp.condition}</Row>
                  <Row label="Occupancy">{OCCUPANCY.find((x) => x.value === opp.occupancy)?.label}</Row>
                  <Row label="Reason">{opp.reason}</Row>
                  <Row label="Timeline">{opp.timeline}</Row>
                  <Row label="Hoping for">{formatMoney(opp.price_expectation)}</Row>
                  <Row label="Your CMA value">{formatMoney(opp.estimated_value)}</Row>
                  <Row label="Mortgage">{formatMoney(opp.mortgage_balance)}</Row>
                  <Row label="Est. equity">{eq != null && <span className={eq < 0 ? 'text-red-700 font-medium' : ''}>{formatMoney(eq)}{eq < 0 && ' (may be a short sale)'}</span>}</Row>
                  <Row label="Listed before">{opp.previously_listed ? 'Yes (expired, withdrawn or FSBO)' : ''}</Row>
                  <Row label="Relationship">{opp.relationship}</Row>
                </dl>
                {opp.message && <blockquote className="mt-3 p-3 bg-gray-50 border-l-4 border-blue-300 rounded-r text-gray-800 whitespace-pre-wrap">{opp.message}</blockquote>}
                {opp.notes && <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap"><span className="text-gray-500">Notes: </span>{opp.notes}</p>}
                {opp.review_status === 'approved' && (
                  <button onClick={() => setEdit({
                    property_address: opp.property_address, city: opp.city, zip_code: opp.zip_code, reason: opp.reason, timeline: opp.timeline,
                    occupancy: opp.occupancy, price_expectation: opp.price_expectation, mortgage_balance: opp.mortgage_balance,
                    estimated_value: opp.estimated_value, notes: opp.notes,
                  })} className="mt-3 text-sm text-blue-600 hover:underline">Edit details</button>
                )}
              </>
            )}
          </Section>

          <SituationPanel key={`sit:${opp.updated_at}`} opp={opp} editable={opp.review_status === 'approved' || isAdmin} author={author} onChanged={load} />
          <OpportunityPhotos oppId={opp.id} editable={opp.review_status === 'approved' || isAdmin} author={author} />
          <LocationOwner key={`loc:${opp.updated_at}`} opp={opp} editable={opp.review_status === 'approved' || isAdmin} author={author} onChanged={load} />

          {open && (
            <Section title="Listing appointment">
              <p className="text-sm text-gray-600 mb-3">
                {opp.appointment_at ? <>Booked for <strong>{formatDateTime(opp.appointment_at)}</strong>. Bring the CMA, net sheet, and listing agreement.</> : 'Book it as soon as they agree to meet; it moves the opportunity to Appointment set.'}
              </p>
              <div className="flex gap-2">
                <input type="datetime-local" value={appointment} onChange={(e) => setAppointment(e.target.value)} className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg" />
                <button disabled={saving || !appointment} onClick={saveAppointment} className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {opp.appointment_at ? 'Move' : 'Book'}
                </button>
              </div>
              {opp.stage === 'appointment' && (
                <button disabled={saving} onClick={() => run(() => changeListingStage(opp, 'presented', author, {}, 'listing presentation done'))}
                  className="mt-3 text-sm text-blue-600 hover:underline">Presentation done → awaiting their decision</button>
              )}
            </Section>
          )}

          {open && (
            <Section title="Outcome" id="outcome">
              {closing === 'won' ? (
                <div className="space-y-2">
                  <label className="block text-sm text-gray-700">List price
                    <input inputMode="numeric" value={listPrice} onChange={(e) => setListPrice(e.target.value)} placeholder="$" className={input} />
                  </label>
                  <p className="text-xs text-gray-500">Adds the owner to your clients (if they aren’t already) and starts a seller deal with the listing checklist.</p>
                  <div className="flex gap-2">
                    <button disabled={saving} onClick={win} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">Start the listing</button>
                    <button onClick={() => setClosing(null)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
                  </div>
                </div>
              ) : closing === 'lost' ? (
                <div className="space-y-2">
                  <input value={lostReason} onChange={(e) => setLostReason(e.target.value)} placeholder="Why? (listed with another agent, decided not to sell…)" className={input} />
                  <div className="flex gap-2">
                    <button disabled={saving} onClick={() => run(() => changeListingStage(opp, 'lost', author, { lost_reason: lostReason.trim() || null }, lostReason.trim())).then(() => setClosing(null))}
                      className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">Mark lost</button>
                    <button disabled={saving} onClick={() => run(() => changeListingStage(opp, 'nurture', author, {}, lostReason.trim() || 'selling later')).then(() => setClosing(null))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm">Nurture instead</button>
                    <button onClick={() => setClosing(null)} className="px-3 py-2 text-sm text-gray-500">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setClosing('won')} className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"><Trophy size={16} /> Won the listing</button>
                  <button onClick={() => setClosing('lost')} className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Not listing / lost</button>
                </div>
              )}
            </Section>
          )}
          {opp.stage === 'lost' && opp.review_status === 'approved' && (
            <Section title="Outcome">
              <p className="text-sm text-gray-700">Lost{opp.lost_reason && `: ${opp.lost_reason}`}</p>
              <button disabled={saving} onClick={() => run(() => changeListingStage(opp, 'contacted', author, { lost_reason: null }, 'reopened'))} className="mt-2 text-sm text-blue-600 hover:underline">Reopen</button>
            </Section>
          )}
        </div>

        <div className="space-y-6">
          {open && (
            <Section title="Next follow-up">
              {due === 'overdue' && <p className="mb-2 text-sm font-medium text-red-700">Overdue: {formatDateTime(opp.follow_up_at!)}</p>}
              {due === 'today' && <p className="mb-2 text-sm font-medium text-yellow-700">Due today: {formatDateTime(opp.follow_up_at!)}</p>}
              <div className="flex gap-2">
                <input type="datetime-local" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg" />
                <button disabled={saving || !followUp} onClick={() => setFollowUpAt(new Date(followUp).toISOString())} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">Save</button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {[{ label: 'Tomorrow 9am', d: 1 }, { label: 'In 3 days', d: 3 }, { label: 'Next week', d: 7 }, { label: 'In a month', d: 30 }].map((o) => (
                  <button key={o.label} disabled={saving} onClick={() => setFollowUpAt(inDays(o.d))}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-gray-300 text-xs hover:border-blue-400">
                    <CalendarClock size={12} /> {o.label}
                  </button>
                ))}
                {opp.follow_up_at && <button disabled={saving} onClick={() => setFollowUpAt(null)} className="px-2.5 py-1 rounded-full text-xs text-gray-500 hover:text-red-600">Clear</button>}
              </div>
            </Section>
          )}

          {opp.review_status === 'approved' && (
            <Section title="Log activity">
              <form onSubmit={logActivity}>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {LISTING_ACTIVITY_KINDS.map((k) => (
                    <button key={k.value} type="button" onClick={() => setKind(k.value)} aria-pressed={kind === k.value}
                      className={`px-3 py-1.5 rounded-full text-sm border ${kind === k.value ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                      <span aria-hidden>{k.icon}</span> {k.label}
                    </button>
                  ))}
                </div>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={5000}
                  placeholder={kind === 'note' ? 'Add a note…' : 'What happened?'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <button type="submit" disabled={saving || !body.trim()} className="mt-2 w-full py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
                  {saving ? 'Saving…' : 'Log'}
                </button>
                {kind !== 'note' && open && <p className="mt-2 text-xs text-gray-500">Counts toward today’s touch goal and schedules the next follow-up.</p>}
              </form>
            </Section>
          )}

          <Section title="Timeline">
            {activity.length === 0 ? (
              <p className="text-sm text-gray-500">No activity yet.</p>
            ) : (
              <ol className="space-y-4">
                {activity.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="text-lg leading-none mt-0.5" aria-hidden>{LISTING_ACTIVITY_ICONS[a.kind]}</span>
                    <div className="min-w-0">
                      <p className={`text-sm whitespace-pre-wrap ${a.kind === 'status' || a.kind === 'review' ? 'text-gray-500 italic' : 'text-gray-900'}`}>{a.body}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {a.author_name ?? 'Unknown'} · <time dateTime={a.created_at} title={formatDateTime(a.created_at)}>{relativeTime(a.created_at)}</time>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
            <p className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
              Entered {formatDateTime(opp.created_at)} by {opp.created_by_name || (opp.created_by_role === 'public' ? 'a website visitor' : 'a client')}
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
