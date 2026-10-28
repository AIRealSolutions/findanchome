'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { COUNTY_NAMES } from '@/lib/lifestyles';
import { formatMoney } from '@/lib/clients';
import { PRIORITIES, formatDateTime, type LeadPriority } from '@/lib/leads';
import { EMPTY_INTAKE, intakeToRow, type ListingIntake } from '@/lib/listing-intake';
import {
  CONDITIONS, LISTING_SOURCES, OCCUPANCY, PROPERTY_TYPES, REASONS, RELATIONSHIPS, SELLER_TIMELINES,
  fetchStaff, inDays, logListingActivity, opportunityTitle, sourceMeta, staffName,
  type ListingOpportunity, type Situation, type StaffMember,
} from '@/lib/listings';
import { locationColumns, ownerDisplayName, uploadPhotos, type PendingPhoto } from '@/lib/field';
import { SITUATIONS, seedSituationTasks, situationMeta } from '@/lib/situations';
import { LocationResearch, PhotoPicker, type Located } from './FieldCapture';

type StepKey = 'Owner' | 'Property' | 'Photos & location' | 'Motivation' | 'Review';
const STAFF_STEPS: StepKey[] = ['Owner', 'Property', 'Photos & location', 'Motivation', 'Review'];
const REFERRAL_STEPS: StepKey[] = ['Owner', 'Property', 'Motivation', 'Review'];

const input = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';

function Field({ label, hint, children, wide }: { label: string; hint?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`block text-sm ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="block text-gray-700 font-medium mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-gray-500 mt-1">{hint}</span>}
    </label>
  );
}

function Select({ value, onChange, options, placeholder = 'Choose…' }: {
  value: string; onChange: (v: string) => void; options: (string | { value: string; label: string })[]; placeholder?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${input} bg-white`}>
      <option value="">{placeholder}</option>
      {options.map((o) => (typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
    </select>
  );
}

type Triage = { priority: LeadPriority; assignedTo: string; followUp: 'today' | 'tomorrow' | 'week' | 'none'; appointment: string; notes: string };

/**
 * Four-step onboarding for a potential listing. Brokers and admins (`staff`) add it straight to the pipeline;
 * anyone else (`referral`) sends it to the admin to review first.
 */
export default function ListingOnboardingForm({ mode, initial, links, author }: {
  mode: 'staff' | 'referral';
  initial?: Partial<ListingIntake>;
  links?: { clientId?: string; consultationId?: string };
  author: { id: string; name: string };
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ListingIntake>({ ...EMPTY_INTAKE, ...(mode === 'referral' ? { source: 'referral' } : {}), ...initial });
  const STEPS = mode === 'staff' ? STAFF_STEPS : REFERRAL_STEPS;
  // Staff only: photos, the map pin and owner of record, and the distressed / estate situation.
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [loc, setLoc] = useState<Located>({ point: null, source: null, parcel: null, address: null });
  const [sit, setSit] = useState<Partial<ListingOpportunity>>({ situation: 'standard' });
  const [triage, setTriage] = useState<Triage>({ priority: 'warm', assignedTo: author.id, followUp: 'today', appointment: '', notes: '' });
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [dupes, setDupes] = useState<Pick<ListingOpportunity, 'id' | 'owner_name' | 'property_address' | 'city' | 'stage'>[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const set = <K extends keyof ListingIntake>(k: K, v: ListingIntake[K]) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (mode === 'staff') fetchStaff().then(setStaff);
  }, [mode]);

  /** Before saving, look for the same owner or property already in the pipeline. */
  const checkDupes = async () => {
    // Quoted so commas and parentheses (as in phone numbers) don't break PostgREST's filter syntax.
    const q = (v: string) => `"${v.replace(/["\\]/g, '')}"`;
    const ors = [
      form.ownerEmail.trim() && `owner_email.eq.${q(form.ownerEmail.trim().toLowerCase())}`,
      form.ownerPhone.trim() && `owner_phone.eq.${q(form.ownerPhone.trim())}`,
      form.propertyAddress.trim().length > 5 && `property_address.ilike.${q(form.propertyAddress.trim().replace(/[*%]/g, ''))}`,
    ].filter(Boolean);
    if (!ors.length) return setDupes([]);
    const { data } = await createClient().from('fanc_listing_opportunities').select('id, owner_name, property_address, city, stage').or(ors.join(',')).limit(5);
    setDupes((data ?? []) as typeof dupes);
  };

  const next = () => {
    setError('');
    if (STEPS[step] === 'Owner') {
      const { error: e } = intakeToRow(form, { requireContact: mode === 'referral' });
      if (e && /owner|phone|email/i.test(e)) return setError(e);
    }
    if (mode === 'staff' && step === STEPS.length - 2) checkDupes();
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = async () => {
    const { row, error: invalid } = intakeToRow(form, { requireContact: mode === 'referral' });
    if (!row) return setError(invalid ?? 'Please check the form');
    setBusy(true);
    setError('');

    if (mode === 'referral') {
      const { data: { session } } = await createClient().auth.getSession();
      const res = await fetch('/api/listing-opportunity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({ ...form, sourcePage: '/dashboard/listings/new' }),
      });
      setBusy(false);
      if (!res.ok) return setError((await res.json().catch(() => ({}))).error ?? 'Could not send it. Please try again.');
      return setSent(true);
    }

    const followUp = { today: inDays(0), tomorrow: inDays(1), week: inDays(7), none: null }[triage.followUp];
    const appointment = triage.appointment ? new Date(triage.appointment).toISOString() : null;
    const { data, error: err } = await createClient().from('fanc_listing_opportunities').insert({
      ...row,
      created_by_name: author.name,
      priority: triage.priority,
      assigned_to: triage.assignedTo || author.id,
      stage: appointment ? 'appointment' : 'new',
      appointment_at: appointment,
      follow_up_at: followUp,
      notes: triage.notes.trim() || null,
      client_id: links?.clientId ?? null,
      consultation_id: links?.consultationId ?? null,
      ...(loc.point ? locationColumns(loc) : {}),
      ...sit,
    }).select('id, situation, sale_date, hearing_date').single();
    if (err) {
      setBusy(false);
      return setError(err.message);
    }
    if (photos.length) {
      const upErr = await uploadPhotos(data.id, photos);
      if (upErr) console.error('Photo upload failed:', upErr);
    }
    await seedSituationTasks(data, []);
    const assignee = staff.find((s) => s.id === triage.assignedTo);
    await logListingActivity(data.id, [{
      kind: 'note',
      body: `Onboarded from ${sourceMeta(row.source!).label.toLowerCase()}${assignee && assignee.id !== author.id ? `; assigned to ${staffName(assignee)}` : ''}`,
    }], author);
    router.push(`/dashboard/listings/${data.id}`);
  };

  if (sent) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h2 className="text-xl font-semibold text-gray-900">Thank you! We received it.</h2>
        <p className="mt-2 text-gray-600">Our team will review it and reach out to {form.ownerName.split(' ')[0] || 'the owner'} shortly.</p>
        <button onClick={() => { setForm({ ...EMPTY_INTAKE, source: 'referral' }); setStep(0); setSent(false); }}
          className="mt-5 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Refer another seller</button>
      </div>
    );
  }

  const summary = intakeToRow(form, { requireContact: mode === 'referral' }).row;

  return (
    <div className="bg-white border border-gray-200 rounded-xl">
      <ol className="flex border-b border-gray-200 text-sm">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1">
            <button type="button" onClick={() => i < step && setStep(i)} disabled={i > step}
              className={`w-full px-2 py-3 border-b-2 ${i === step ? 'border-blue-600 text-blue-700 font-medium' : i < step ? 'border-green-500 text-gray-700' : 'border-transparent text-gray-400'}`}>
              <span className="hidden sm:inline">{i + 1}. </span>{s}
            </button>
          </li>
        ))}
      </ol>

      <div className="p-5">
        {STEPS[step] === 'Owner' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Owner’s name *" wide><input autoFocus value={form.ownerName} onChange={(e) => set('ownerName', e.target.value)} className={input} /></Field>
            <Field label="Phone"><input type="tel" value={form.ownerPhone} onChange={(e) => set('ownerPhone', e.target.value)} className={input} /></Field>
            <Field label="Email"><input type="email" value={form.ownerEmail} onChange={(e) => set('ownerEmail', e.target.value)} className={input} /></Field>
            <Field label="Best way to reach them">
              <Select value={form.preferredContact} onChange={(v) => set('preferredContact', v as ListingIntake['preferredContact'])}
                options={[{ value: 'call', label: 'Phone call' }, { value: 'text', label: 'Text' }, { value: 'email', label: 'Email' }]} placeholder="No preference" />
            </Field>
            <Field label="Relationship to the property"><Select value={form.relationship} onChange={(v) => set('relationship', v)} options={RELATIONSHIPS} /></Field>
          </div>
        )}

        {STEPS[step] === 'Property' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Property address" wide><input value={form.propertyAddress} onChange={(e) => set('propertyAddress', e.target.value)} placeholder="123 Shore Dr" className={input} /></Field>
            <Field label="City"><input value={form.city} onChange={(e) => set('city', e.target.value)} className={input} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="County">
                <Select value={form.county} onChange={(v) => set('county', v)} options={Object.entries(COUNTY_NAMES).map(([value, label]) => ({ value, label: label.replace(' County', '') }))} placeholder="Other" />
              </Field>
              <Field label="ZIP"><input inputMode="numeric" value={form.zipCode} onChange={(e) => set('zipCode', e.target.value)} className={input} /></Field>
            </div>
            <Field label="Property type"><Select value={form.propertyType} onChange={(v) => set('propertyType', v)} options={PROPERTY_TYPES} /></Field>
            <Field label="Occupancy"><Select value={form.occupancy} onChange={(v) => set('occupancy', v)} options={OCCUPANCY} /></Field>
            <div className="grid grid-cols-3 gap-3 sm:col-span-2">
              <Field label="Beds"><input inputMode="decimal" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} className={input} /></Field>
              <Field label="Baths"><input inputMode="decimal" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} className={input} /></Field>
              <Field label="Sq ft"><input inputMode="numeric" value={form.sqft} onChange={(e) => set('sqft', e.target.value)} className={input} /></Field>
              <Field label="Year built"><input inputMode="numeric" value={form.yearBuilt} onChange={(e) => set('yearBuilt', e.target.value)} className={input} /></Field>
              <Field label="Acres"><input inputMode="decimal" value={form.lotAcres} onChange={(e) => set('lotAcres', e.target.value)} className={input} /></Field>
            </div>
            <Field label="Condition"><Select value={form.condition} onChange={(v) => set('condition', v)} options={CONDITIONS} /></Field>
          </div>
        )}

        {STEPS[step] === 'Photos & location' && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Photos of the property</p>
              <PhotoPicker photos={photos} onChange={setPhotos} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Where it is and who owns it</p>
              <LocationResearch value={loc} photos={photos} onChange={(v) => {
                setLoc(v);
                // Fill blanks from the owner-of-record lookup; never overwrite what was typed.
                setForm((f) => ({
                  ...f,
                  propertyAddress: f.propertyAddress || v.address?.address || '',
                  city: f.city || v.address?.city || '',
                  zipCode: f.zipCode || v.address?.zip?.slice(0, 10) || '',
                  county: f.county || (v.address?.county ?? '').toLowerCase().replace(/ county$/, '').replace(/\s+/g, '-'),
                  ownerName: f.ownerName || ownerDisplayName(v.parcel?.owner ?? null),
                  lotAcres: f.lotAcres || (v.parcel?.acres ? String(v.parcel.acres) : ''),
                  yearBuilt: f.yearBuilt || (v.parcel?.yearBuilt ? String(v.parcel.yearBuilt) : ''),
                }));
              }} />
            </div>
            <p className="text-xs text-gray-500">Optional. Photos and the owner lookup stay private to Lightkeeper brokers.</p>
          </div>
        )}

        {STEPS[step] === 'Motivation' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Why are they selling?"><Select value={form.reason} onChange={(v) => set('reason', v)} options={REASONS} /></Field>
            <Field label="When do they want to move?"><Select value={form.timeline} onChange={(v) => set('timeline', v)} options={SELLER_TIMELINES} /></Field>
            <Field label="Price they hope to get"><input inputMode="numeric" value={form.priceExpectation} onChange={(e) => set('priceExpectation', e.target.value)} placeholder="$" className={input} /></Field>
            <Field label="Mortgage balance (if known)"><input inputMode="numeric" value={form.mortgageBalance} onChange={(e) => set('mortgageBalance', e.target.value)} placeholder="$" className={input} /></Field>
            <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
              <input type="checkbox" checked={form.previouslyListed} onChange={(e) => set('previouslyListed', e.target.checked)} className="rounded" />
              Listed before (expired, withdrawn or FSBO)
            </label>
            {mode === 'staff' && (
              <Field label="Where did this opportunity come from?">
                <Select value={form.source} onChange={(v) => set('source', v)} options={LISTING_SOURCES.map((s) => ({ value: s.value, label: `${s.icon} ${s.label}` }))} />
              </Field>
            )}
            <Field label={mode === 'staff' ? 'Source details' : 'How do you know them?'} hint={mode === 'staff' ? 'Who referred them, the expired MLS #, the farm area…' : undefined}>
              <input value={form.sourceDetail} onChange={(e) => set('sourceDetail', e.target.value)} className={input} />
            </Field>
            <Field label={mode === 'staff' ? 'What they told you' : 'Anything else we should know?'} wide>
              <textarea rows={3} value={form.message} onChange={(e) => set('message', e.target.value)} maxLength={5000} className={input} />
            </Field>
          </div>
        )}

        {STEPS[step] === 'Motivation' && mode === 'staff' && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Situation</p>
            <div className="flex flex-wrap gap-2">
              {SITUATIONS.map((x) => (
                <button key={x.value} type="button" onClick={() => setSit({ ...sit, situation: x.value as Situation })} aria-pressed={sit.situation === x.value}
                  className={`px-3 py-1.5 rounded-full text-sm border ${sit.situation === x.value ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                  {x.icon} {x.short}
                </button>
              ))}
            </div>
            {sit.situation && sit.situation !== 'standard' && (
              <>
                <p className="mt-2 text-xs text-gray-600">{situationMeta(sit.situation).hint} Its checklist is added when you save.</p>
                <div className="mt-3 grid sm:grid-cols-2 gap-3">
                  {situationMeta(sit.situation).fields.map((f) => (
                    <Field key={f.field} label={f.label} wide={f.type === 'textarea'}>
                      {f.type === 'textarea' ? (
                        <textarea rows={2} value={(sit[f.field] as string) ?? ''} onChange={(e) => setSit({ ...sit, [f.field]: e.target.value || null })} className={input} />
                      ) : (
                        <input type={f.type ?? 'text'} value={(sit[f.field] as string) ?? ''} placeholder={f.placeholder}
                          onChange={(e) => setSit({ ...sit, [f.field]: e.target.value || null })} className={input} />
                      )}
                    </Field>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {STEPS[step] === 'Review' && summary && (
          <div className="space-y-5">
            {dupes.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
                <p className="flex items-center gap-2 font-medium"><AlertTriangle size={16} /> Possible duplicate already in the pipeline:</p>
                <ul className="mt-1 ml-6 list-disc">
                  {dupes.map((d) => <li key={d.id}><Link href={`/dashboard/listings/${d.id}`} className="underline">{d.owner_name}: {opportunityTitle(d)}</Link> ({d.stage})</li>)}
                </ul>
              </div>
            )}
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
              {([
                ['Owner', [summary.owner_name, summary.relationship && `(${summary.relationship})`].filter(Boolean).join(' ')],
                ['Contact', [summary.owner_phone, summary.owner_email].filter(Boolean).join(' · ')],
                ['Property', [summary.property_address, summary.city, summary.zip_code].filter(Boolean).join(', ')],
                ['Details', [summary.property_type, summary.bedrooms != null && `${summary.bedrooms} bd`, summary.bathrooms != null && `${summary.bathrooms} ba`, summary.sqft && `${summary.sqft} sq ft`, summary.condition].filter(Boolean).join(' · ')],
                ['Motivation', [summary.reason, summary.timeline].filter(Boolean).join(' · ')],
                ['Price hoped for', formatMoney(summary.price_expectation ?? null)],
                ...(mode === 'staff' ? [
                  ['Source', [sourceMeta(summary.source!).label, summary.source_detail].filter(Boolean).join(': ')],
                  ['Situation', sit.situation && sit.situation !== 'standard' ? `${situationMeta(sit.situation).icon} ${situationMeta(sit.situation).short}` : ''],
                  ['Photos', photos.length ? `${photos.length} to upload` : ''],
                  ['Owner of record', loc.parcel?.owner ? `${loc.parcel.owner}${loc.parcel.absentee ? ' (mailing address differs)' : ''}` : ''],
                ] : []),
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[110px_1fr] gap-2 py-1">
                  <dt className="text-gray-500">{k}</dt><dd className="text-gray-900">{v || <span className="text-gray-400">—</span>}</dd>
                </div>
              ))}
            </dl>

            {mode === 'staff' ? (
              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <Field label="Priority">
                  <Select value={triage.priority} onChange={(v) => setTriage({ ...triage, priority: (v || 'warm') as LeadPriority })} options={PRIORITIES} />
                </Field>
                <Field label="Assigned to">
                  <Select value={triage.assignedTo} onChange={(v) => setTriage({ ...triage, assignedTo: v })}
                    options={staff.length ? staff.map((s) => ({ value: s.id, label: `${staffName(s)}${s.id === author.id ? ' (me)' : ''}` })) : [{ value: author.id, label: `${author.name} (me)` }]} placeholder="Me" />
                </Field>
                <Field label="First follow-up">
                  <Select value={triage.followUp} onChange={(v) => setTriage({ ...triage, followUp: (v || 'none') as Triage['followUp'] })}
                    options={[{ value: 'today', label: 'Today' }, { value: 'tomorrow', label: 'Tomorrow morning' }, { value: 'week', label: 'In a week' }]} placeholder="No follow-up" />
                </Field>
                <Field label="Listing appointment (if booked)" hint={triage.appointment ? formatDateTime(new Date(triage.appointment).toISOString()) : undefined}>
                  <input type="datetime-local" value={triage.appointment} onChange={(e) => setTriage({ ...triage, appointment: e.target.value })} className={input} />
                </Field>
                <Field label="Private notes" wide>
                  <textarea rows={2} value={triage.notes} onChange={(e) => setTriage({ ...triage, notes: e.target.value })} className={input} />
                </Field>
              </div>
            ) : (
              <p className="text-sm text-gray-600 pt-4 border-t border-gray-100">
                This goes to our admin team to review first. Once approved, a broker will reach out to the owner.
              </p>
            )}
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="flex justify-between mt-6">
          <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || busy}
            className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40">
            <ChevronLeft size={16} /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={busy}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
              {busy ? 'Saving…' : mode === 'staff' ? 'Add to my pipeline' : 'Send for review'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
