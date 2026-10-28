'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Check, Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toYmd } from '@/lib/calendar';
import { formatDate } from '@/lib/clients';
import { deletePhoto, locationColumns, photoUrls, researchLinks, uploadPhotos, type ParcelRecord, type PendingPhoto } from '@/lib/field';
import { logListingActivity, type ListingOpportunity, type ListingPhoto, type ListingTask, type Situation } from '@/lib/listings';
import { SITUATIONS, nextDeadline, redateSituationTasks, seedSituationTasks, situationMeta } from '@/lib/situations';
import { LocationResearch, ParcelCard, PhotoPicker, type Located } from './FieldCapture';

const LocationMap = dynamic(() => import('./LocationMap'), { ssr: false, loading: () => <div className="h-56 rounded-lg bg-gray-100 animate-pulse" /> });

type Author = { id: string; name: string };

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// ───────────────────────── Photos ─────────────────────────

export function OpportunityPhotos({ oppId, editable, author }: { oppId: string; editable: boolean; author: Author }) {
  const [photos, setPhotos] = useState<ListingPhoto[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState<PendingPhoto[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data } = await createClient().from('fanc_listing_photos').select('*').eq('opportunity_id', oppId).order('sort').order('created_at');
    const list = (data ?? []) as ListingPhoto[];
    return { list, urls: await photoUrls(list) };
  }, [oppId]);
  const apply = (r: Awaited<ReturnType<typeof load>>) => {
    setPhotos(r.list);
    setUrls(r.urls);
  };
  useEffect(() => {
    let cancelled = false;
    load().then((r) => {
      if (cancelled) return;
      setPhotos(r.list);
      setUrls(r.urls);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const upload = async () => {
    setBusy(true);
    const err = await uploadPhotos(oppId, adding, photos.length);
    if (err) setError(err);
    else await logListingActivity(oppId, [{ kind: 'note', body: `Added ${adding.length} photo${adding.length === 1 ? '' : 's'}` }], author);
    setAdding([]);
    apply(await load());
    setBusy(false);
  };
  const remove = async (p: ListingPhoto) => {
    if (!confirm('Delete this photo?')) return;
    const err = await deletePhoto(p);
    if (err) setError(err);
    apply(await load());
  };

  return (
    <Section title={`Photos${photos.length ? ` (${photos.length})` : ''}`}>
      {photos.length === 0 && !adding.length && <p className="text-sm text-gray-500 mb-3">No photos yet.</p>}
      {photos.length > 0 && (
        <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
          {photos.map((p) => (
            <li key={p.id} className="relative group">
              {urls[p.path] ? (
                <a href={urls[p.path]} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element -- private signed URL */}
                  <img src={urls[p.path]} alt={p.caption ?? 'Property photo'} className="w-full aspect-square object-cover rounded-lg border border-gray-200" />
                </a>
              ) : <div className="w-full aspect-square rounded-lg bg-gray-100" />}
              {p.taken_at && <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px]">{formatDate(p.taken_at, { month: 'short', day: 'numeric' })}</span>}
              {editable && (
                <button onClick={() => remove(p)} aria-label="Delete photo" className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-80 hover:opacity-100"><Trash2 size={12} /></button>
              )}
            </li>
          ))}
        </ul>
      )}
      {editable && (
        <>
          <PhotoPicker photos={adding} onChange={setAdding} />
          {adding.length > 0 && (
            <button onClick={upload} disabled={busy} className="mt-3 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {busy ? 'Uploading…' : `Upload ${adding.length} photo${adding.length === 1 ? '' : 's'}`}
            </button>
          )}
        </>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Section>
  );
}

// ───────────────────────── Location & owner ─────────────────────────

export function LocationOwner({ opp, editable, author, onChanged }: { opp: ListingOpportunity; editable: boolean; author: Author; onChanged: () => void }) {
  const point = opp.latitude != null && opp.longitude != null ? { lat: Number(opp.latitude), lng: Number(opp.longitude) } : null;
  const parcel = opp.parcel_data as unknown as ParcelRecord | null;
  const [editing, setEditing] = useState(false);
  const [loc, setLoc] = useState<Located>({ point, source: opp.location_source, parcel, address: null });
  const [notes, setNotes] = useState(opp.research_notes ?? '');
  const [msg, setMsg] = useState('');

  const save = async () => {
    const updates: Partial<ListingOpportunity> = {
      ...locationColumns(loc),
      // Fill only what's missing on the opportunity.
      ...(!opp.property_address && loc.address?.address ? { property_address: loc.address.address } : {}),
      ...(!opp.city && loc.address?.city ? { city: loc.address.city } : {}),
      ...(!opp.zip_code && loc.address?.zip ? { zip_code: loc.address.zip.slice(0, 10) } : {}),
    };
    const { error } = await createClient().from('fanc_listing_opportunities').update(updates).eq('id', opp.id);
    if (error) return setMsg(error.message);
    if (loc.parcel?.owner && loc.parcel.owner !== parcel?.owner) {
      await logListingActivity(opp.id, [{ kind: 'note', body: `Owner of record: ${loc.parcel.owner}${loc.parcel.absentee ? ' (tax bill mailed elsewhere)' : ''}` }], author);
    }
    setEditing(false);
    onChanged();
  };
  const saveNotes = async () => {
    const { error } = await createClient().from('fanc_listing_opportunities').update({ research_notes: notes.trim() || null }).eq('id', opp.id);
    setMsg(error ? error.message : 'Notes saved.');
    if (!error) onChanged();
  };
  const links = researchLinks(point, { county: parcel?.county ?? opp.county, owner: parcel?.owner ?? opp.owner_name, parcelId: opp.parcel_id, address: opp.property_address });

  return (
    <Section title="Location & ownership" action={editable && !editing && (
      <button onClick={() => { setLoc({ point, source: opp.location_source, parcel, address: null }); setEditing(true); }} className="text-sm text-blue-600 hover:underline">
        {point ? 'Move pin / look up again' : 'Add location'}
      </button>
    )}>
      {editing ? (
        <div>
          <LocationResearch value={loc} onChange={setLoc} />
          <div className="mt-3 flex gap-2">
            <button onClick={save} disabled={!loc.point} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">Save location</button>
            <button onClick={() => setEditing(false)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {point ? <LocationMap point={point} height={220} /> : <p className="text-sm text-gray-500">No location yet. Add one to see the map and look up the owner of record.</p>}
          {parcel ? <ParcelCard parcel={parcel} /> : point && <p className="text-sm text-gray-500">No owner record saved. Use “Move pin / look up again”.</p>}
          {(point || opp.property_address) && (
            <div className="flex flex-wrap gap-2">
              {links.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" title={l.hint}
                  className="px-2.5 py-1 rounded-full border border-gray-300 text-xs text-gray-700 hover:border-blue-400 hover:text-blue-700">{l.label} ↗</a>
              ))}
            </div>
          )}
        </div>
      )}
      {editable && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <label className="block text-sm text-gray-700 font-medium mb-1" htmlFor={`research-${opp.id}`}>Research notes</label>
          <textarea id={`research-${opp.id}`} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Deed book/page, liens found, other properties they own, how you reached them…" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          {notes !== (opp.research_notes ?? '') && <button onClick={saveNotes} className="mt-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Save notes</button>}
        </div>
      )}
      {msg && <p className="mt-2 text-sm text-gray-700">{msg}</p>}
    </Section>
  );
}

// ───────────────────────── Situation workflow ─────────────────────────

export function SituationPanel({ opp, editable, author, onChanged }: { opp: ListingOpportunity; editable: boolean; author: Author; onChanged: () => void }) {
  const [tasks, setTasks] = useState<ListingTask[]>([]);
  const [draft, setDraft] = useState<Partial<ListingOpportunity>>({});
  const [newTask, setNewTask] = useState({ title: '', due: '' });
  const [error, setError] = useState('');
  const meta = situationMeta(opp.situation);
  const deadline = nextDeadline(opp);
  const today = toYmd(new Date());

  const loadTasks = useCallback(async () => {
    const { data } = await createClient().from('fanc_listing_tasks').select('*').eq('opportunity_id', opp.id).order('sort');
    return (data ?? []) as ListingTask[];
  }, [opp.id]);
  useEffect(() => {
    let cancelled = false;
    loadTasks().then((t) => !cancelled && setTasks(t));
    return () => {
      cancelled = true;
    };
  }, [loadTasks]);
  const refresh = async () => setTasks(await loadTasks());

  const changeSituation = async (s: Situation) => {
    if (s === opp.situation) return;
    const { error: err } = await createClient().from('fanc_listing_opportunities').update({ situation: s }).eq('id', opp.id);
    if (err) return setError(err.message);
    await seedSituationTasks({ ...opp, situation: s }, tasks);
    await logListingActivity(opp.id, [{ kind: 'status', body: `Situation: ${situationMeta(s).label}` }], author);
    await refresh();
    onChanged();
  };
  const saveDetails = async () => {
    const { error: err } = await createClient().from('fanc_listing_opportunities').update(draft).eq('id', opp.id);
    if (err) return setError(err.message);
    if ('sale_date' in draft || 'hearing_date' in draft) await redateSituationTasks({ ...opp, ...draft }, tasks);
    const dates = [draft.hearing_date && `hearing ${formatDate(draft.hearing_date)}`, draft.sale_date && `sale ${formatDate(draft.sale_date)}`].filter(Boolean);
    if (dates.length) await logListingActivity(opp.id, [{ kind: 'note', body: `Foreclosure dates: ${dates.join(', ')}` }], author);
    setDraft({});
    await refresh();
    onChanged();
  };
  const toggle = async (t: ListingTask) => {
    const done = !t.done_at;
    await createClient().from('fanc_listing_tasks').update({ done_at: done ? new Date().toISOString() : null }).eq('id', t.id);
    if (done) await logListingActivity(opp.id, [{ kind: 'note', body: `✅ ${t.title}` }], author);
    refresh();
  };
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    await createClient().from('fanc_listing_tasks').insert({ opportunity_id: opp.id, situation: opp.situation, title: newTask.title.trim(), due_date: newTask.due || null, sort: tasks.length });
    setNewTask({ title: '', due: '' });
    refresh();
  };
  const val = (f: keyof ListingOpportunity) => (f in draft ? draft[f] : opp[f]) as string | null;
  const open = tasks.filter((t) => !t.done_at).sort((a, b) => (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999'));
  const done = tasks.filter((t) => t.done_at);

  return (
    <Section title="Situation">
      <div className="flex flex-wrap gap-2">
        {SITUATIONS.map((s) => (
          <button key={s.value} type="button" disabled={!editable} onClick={() => changeSituation(s.value)} aria-pressed={opp.situation === s.value}
            className={`px-3 py-1.5 rounded-full text-sm border disabled:opacity-60 ${opp.situation === s.value ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
            {s.icon} {s.short}
          </button>
        ))}
      </div>
      {deadline && (
        <p className={`mt-3 px-3 py-2 rounded-lg text-sm font-medium ${deadline.days <= 14 ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-amber-50 text-amber-900 border border-amber-200'}`}>
          ⏰ {deadline.label} {deadline.days === 0 ? 'is today' : `in ${deadline.days} day${deadline.days === 1 ? '' : 's'}`} ({formatDate(deadline.on, { weekday: 'short', month: 'short', day: 'numeric' })})
        </p>
      )}
      {meta.hint && <p className="mt-3 text-sm text-gray-600">{meta.hint}</p>}

      {meta.fields.length > 0 && (
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {meta.fields.map((f) => (
            <label key={f.field} className={`text-sm ${f.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
              <span className="block text-gray-500 mb-1">{f.label}</span>
              {f.type === 'textarea' ? (
                <textarea rows={2} disabled={!editable} value={val(f.field) ?? ''} onChange={(e) => setDraft({ ...draft, [f.field]: e.target.value || null })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              ) : (
                <input type={f.type ?? 'text'} disabled={!editable} value={val(f.field) ?? ''} placeholder={f.placeholder}
                  onChange={(e) => setDraft({ ...draft, [f.field]: e.target.value || null })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              )}
            </label>
          ))}
          {Object.keys(draft).length > 0 && (
            <div className="sm:col-span-2"><button onClick={saveDetails} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Save details</button></div>
          )}
        </div>
      )}

      {(tasks.length > 0 || opp.situation !== 'standard') && (
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Checklist</h3>
          <ul className="divide-y divide-gray-100">
            {[...open, ...done].map((t) => {
              const late = !t.done_at && t.due_date && t.due_date < today;
              return (
                <li key={t.id} className="py-2 flex items-start gap-3">
                  <button disabled={!editable} onClick={() => toggle(t)} aria-label={t.done_at ? 'Mark not done' : 'Mark done'}
                    className={`mt-0.5 w-5 h-5 shrink-0 rounded border grid place-items-center ${t.done_at ? 'bg-green-600 border-green-600 text-white' : 'border-gray-400 hover:border-green-600'}`}>
                    {t.done_at && <Check size={14} />}
                  </button>
                  <div className="min-w-0">
                    <p className={`text-sm ${t.done_at ? 'line-through text-gray-400' : 'text-gray-900'}`}>{t.title}</p>
                    {t.detail && !t.done_at && <p className="text-xs text-gray-500">{t.detail}</p>}
                    {t.due_date && !t.done_at && <p className={`text-xs ${late ? 'text-red-600 font-medium' : 'text-gray-500'}`}>{late ? 'Overdue · ' : ''}Due {formatDate(t.due_date, { weekday: 'short', month: 'short', day: 'numeric' })}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
          {editable && (
            <form onSubmit={addTask} className="mt-2 flex gap-2">
              <input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="Add a step…" className="flex-1 min-w-0 px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
              <input type="date" value={newTask.due} onChange={(e) => setNewTask({ ...newTask, due: e.target.value })} className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm" />
              <button className="p-2 bg-blue-600 text-white rounded-lg" aria-label="Add step"><Plus size={16} /></button>
            </form>
          )}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {opp.situation !== 'standard' && <p className="mt-3 text-xs text-gray-500">These are practical steps, not legal advice. Send legal questions to an attorney.</p>}
    </Section>
  );
}
