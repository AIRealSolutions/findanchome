'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { locationColumns, ownerDisplayName, uploadPhotos, type PendingPhoto } from '@/lib/field';
import { inDays, logListingActivity, type ListingSource, type Situation } from '@/lib/listings';
import { SITUATIONS, seedSituationTasks } from '@/lib/situations';
import { LocationResearch, PhotoPicker, type Located } from '@/components/FieldCapture';

const SIGNS = ['Looks vacant', 'Overgrown yard', 'Needs repairs', 'Mail piling up', 'FSBO sign', 'For-rent sign', 'Code violation notice', 'Boarded windows'];

/**
 * Spotted a house that might sell? Snap it, pin it, see who owns it, and save it as a listing opportunity,
 * all from the phone.
 */
export default function CapturePage() {
  const router = useRouter();
  const { user, profile, isAdmin, isBroker } = useAuth();
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [loc, setLoc] = useState<Located>({ point: null, source: null, parcel: null, address: null });
  const [owner, setOwner] = useState('');
  const [ownerEdited, setOwnerEdited] = useState(false);
  const [situation, setSituation] = useState<Situation>('standard');
  const [source, setSource] = useState<ListingSource>('drive_by');
  const [signs, setSigns] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const author = { id: user?.id ?? '', name: [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user?.email || 'Broker' };

  if (!isAdmin && !isBroker) return <p className="text-gray-600">Field capture is for brokers.</p>;

  const onLocated = (v: Located) => {
    setLoc(v);
    // Prefill the owner from the parcel unless the broker typed one.
    if (!ownerEdited && v.parcel?.owner) setOwner(ownerDisplayName(v.parcel.owner));
  };

  const save = async () => {
    if (!photos.length && !loc.point) return setError('Add a photo or a location first.');
    setBusy('Saving…');
    setError('');
    const p = loc.parcel;
    const what = [...signs, note.trim()].filter(Boolean).join('. ');
    const { data, error: err } = await createClient().from('fanc_listing_opportunities').insert({
      owner_name: owner.trim() || 'Owner unknown',
      created_by_name: author.name,
      source,
      situation,
      property_address: loc.address?.address ?? null,
      city: loc.address?.city ?? null,
      zip_code: loc.address?.zip?.slice(0, 10) ?? null,
      county: loc.address?.county?.toLowerCase().replace(/ county$/, '').replace(/\s+/g, '-') ?? null,
      lot_acres: p?.acres ?? null,
      year_built: p?.yearBuilt && p.yearBuilt > 1700 ? p.yearBuilt : null,
      estimated_value: null,
      message: what || null,
      follow_up_at: inDays(0),
      ...locationColumns(loc),
    }).select('id, situation, sale_date, hearing_date').single();
    if (err) {
      setBusy('');
      return setError(err.message);
    }
    if (photos.length) {
      setBusy(`Uploading ${photos.length} photo${photos.length === 1 ? '' : 's'}…`);
      const upErr = await uploadPhotos(data.id, photos);
      if (upErr) setError(`Saved, but a photo didn’t upload: ${upErr}`);
    }
    await seedSituationTasks(data, []);
    await logListingActivity(data.id, [{ kind: 'note', body: `Spotted in the field${loc.parcel?.owner ? `; owner of record ${loc.parcel.owner}` : ''}${what ? `. ${what}` : ''}` }], author);
    router.push(`/dashboard/listings/${data.id}`);
  };

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/listings" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4"><ArrowLeft size={16} /> Listing opportunities</Link>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Snap a house</h1>
      <p className="mt-1 mb-6 text-gray-600">See a house that might sell? Take a photo, confirm the pin, and see who owns it.</p>

      <div className="space-y-5">
        <section className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="font-semibold text-gray-900 mb-3">1. Photos</h2>
          <PhotoPicker photos={photos} onChange={setPhotos} />
          <p className="mt-2 text-xs text-gray-500">Photos with location turned on place the pin for you. Photos stay private to Lightkeeper brokers.</p>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="font-semibold text-gray-900 mb-3">2. Location & owner</h2>
          <LocationResearch value={loc} onChange={onLocated} photos={photos} autoLocate />
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
          <h2 className="font-semibold text-gray-900">3. What you know</h2>
          <label className="block text-sm">
            <span className="block text-gray-700 font-medium mb-1">Owner’s name</span>
            <input value={owner} onChange={(e) => { setOwner(e.target.value); setOwnerEdited(true); }} placeholder="From the owner lookup, or leave blank"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </label>
          <div>
            <span className="block text-sm text-gray-700 font-medium mb-1">Situation</span>
            <div className="flex flex-wrap gap-2">
              {SITUATIONS.map((s) => (
                <button key={s.value} type="button" onClick={() => setSituation(s.value)} aria-pressed={situation === s.value}
                  className={`px-3 py-1.5 rounded-full text-sm border ${situation === s.value ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-700'}`}>
                  {s.icon} {s.short}
                </button>
              ))}
            </div>
            {situation !== 'standard' && <p className="mt-1 text-xs text-gray-500">The {SITUATIONS.find((s) => s.value === situation)!.short.toLowerCase()} checklist is added when you save.</p>}
          </div>
          <div>
            <span className="block text-sm text-gray-700 font-medium mb-1">What you noticed</span>
            <div className="flex flex-wrap gap-2">
              {SIGNS.map((s) => (
                <button key={s} type="button" onClick={() => setSigns(signs.includes(s) ? signs.filter((x) => x !== s) : [...signs, s])} aria-pressed={signs.includes(s)}
                  className={`px-3 py-1.5 rounded-full text-sm border ${signs.includes(s) ? 'bg-amber-500 border-amber-500 text-white' : 'border-gray-300 text-gray-700'}`}>{s}</button>
              ))}
            </div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Anything else (a neighbor mentioned…, estate sale sign…)"
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <label className="block text-sm">
            <span className="block text-gray-700 font-medium mb-1">How you found it</span>
            <select value={source} onChange={(e) => setSource(e.target.value as ListingSource)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
              <option value="drive_by">📸 Spotted in the field</option>
              <option value="door_knock">🚪 Door knocking</option>
              <option value="fsbo">🪧 For sale by owner sign</option>
              <option value="absentee">🏚️ Absentee owner / tired landlord</option>
              <option value="pre_foreclosure">⚠️ Pre-foreclosure notice</option>
              <option value="probate">📜 Estate / probate</option>
              <option value="other">📌 Other</option>
            </select>
          </label>
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button onClick={save} disabled={!!busy} className="w-full inline-flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-60">
          {busy ? <><Loader2 size={18} className="animate-spin" /> {busy}</> : 'Save opportunity'}
        </button>
        <p className="text-xs text-gray-500 text-center">It goes straight into your pipeline with a follow-up for today.</p>
      </div>
    </div>
  );
}
