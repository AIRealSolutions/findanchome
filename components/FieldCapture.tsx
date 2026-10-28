'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Camera, Crosshair, ImagePlus, Loader2, MapPin, Search, X } from 'lucide-react';
import { formatDate, formatMoney } from '@/lib/clients';
import {
  deviceLocation, lookupParcel, preparePhotos, researchLinks, reverseGeocode,
  type LatLng, type ParcelRecord, type PendingPhoto,
} from '@/lib/field';

// Leaflet touches `window`, so the map only renders in the browser.
const LocationMap = dynamic(() => import('./LocationMap'), { ssr: false, loading: () => <div className="h-64 rounded-lg bg-gray-100 animate-pulse" /> });

/** Take or choose photos; each keeps the GPS position the camera stored, if any. */
export function PhotoPicker({ photos, onChange }: { photos: PendingPhoto[]; onChange: (p: PendingPhoto[]) => void }) {
  const camera = useRef<HTMLInputElement>(null);
  const library = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const ready = await preparePhotos(files);
    setBusy(false);
    onChange([...photos, ...ready.filter((r) => !photos.some((p) => p.key === r.key))]);
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => camera.current?.click()} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Camera size={18} /> Take a photo
        </button>
        <button type="button" onClick={() => library.current?.click()} className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
          <ImagePlus size={18} /> Choose photos
        </button>
        {busy && <span className="inline-flex items-center gap-1 text-sm text-gray-500"><Loader2 size={16} className="animate-spin" /> Reading photos…</span>}
      </div>
      <input ref={camera} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
      <input ref={library} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
      {photos.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
          {photos.map((p) => (
            <li key={p.key} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- local preview of a picked file */}
              <img src={p.preview} alt="" className="w-full aspect-square object-cover rounded-lg border border-gray-200" />
              {p.point && <span className="absolute bottom-1 left-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px]"><MapPin size={10} /> GPS</span>}
              <button type="button" onClick={() => onChange(photos.filter((x) => x.key !== p.key))} aria-label="Remove photo"
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white"><X size={14} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export interface Located {
  point: LatLng | null;
  source: 'photo' | 'device' | 'map' | 'address' | null;
  parcel: ParcelRecord | null;
  /** Street address from the parcel record, or the map, to fill the form. */
  address: { address: string | null; city: string | null; zip: string | null; county: string | null } | null;
}

/**
 * Where the property is and who owns it: locate from a photo or the phone, fine-tune on the map, then look up the
 * owner of record. Calls `onChange` with the point, its parcel and an address.
 */
export function LocationResearch({ value, onChange, photos = [], autoLocate = false }: {
  value: Located; onChange: (v: Located) => void; photos?: PendingPhoto[]; autoLocate?: boolean;
}) {
  const [busy, setBusy] = useState<'' | 'locating' | 'looking'>('');
  const [error, setError] = useState('');
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  const photoPoint = photos.find((p) => p.point)?.point ?? null;

  const lookup = async (point: LatLng, source: Located['source']) => {
    setBusy('looking');
    setError('');
    const r = await lookupParcel(point);
    let address: Located['address'] = null;
    if (r.parcel?.siteAddress) address = { address: r.parcel.siteAddress, city: r.parcel.city, zip: r.parcel.zip, county: r.parcel.county };
    else address = await reverseGeocode(point);
    if (r.error) setError(r.error);
    else if (!r.parcel) setError('No parcel found exactly here. Drag the pin onto the house (not the street) and look up again.');
    setBusy('');
    onChange({ ...valueRef.current, point, source, parcel: r.parcel ?? null, address });
  };

  const locateMe = async () => {
    setBusy('locating');
    setError('');
    try {
      const p = await deviceLocation();
      onChange({ ...valueRef.current, point: p, source: 'device', parcel: null });
      await lookup(p, 'device');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t get your location.');
      setBusy('');
    }
  };

  // A photo with GPS places the pin by itself; otherwise the phone's location can (field capture).
  const started = useRef(false);
  useEffect(() => {
    if (started.current || value.point) return;
    if (photoPoint) {
      started.current = true;
      lookup(photoPoint, 'photo');
    } else if (autoLocate) {
      started.current = true;
      locateMe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoPoint, autoLocate, value.point]);

  const p = value.parcel;
  const links = researchLinks(value.point, { county: p?.county ?? value.address?.county, owner: p?.owner, parcelId: p?.parcelId, address: p?.siteAddress ?? value.address?.address });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={locateMe} disabled={!!busy} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
          <Crosshair size={16} /> Use my location
        </button>
        {photoPoint && (
          <button type="button" onClick={() => lookup(photoPoint, 'photo')} disabled={!!busy} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
            <MapPin size={16} /> Use the photo’s location
          </button>
        )}
        {value.point && (
          <button type="button" onClick={() => lookup(value.point!, value.source ?? 'map')} disabled={!!busy} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
            <Search size={16} /> Look up owner here
          </button>
        )}
        {busy && <span className="inline-flex items-center gap-1 text-sm text-gray-500"><Loader2 size={16} className="animate-spin" /> {busy === 'locating' ? 'Finding you…' : 'Looking up the owner…'}</span>}
      </div>
      <LocationMap point={value.point} onMove={(pt) => onChange({ ...valueRef.current, point: pt, source: 'map', parcel: null })} photos={photos.filter((x) => x.point).map((x) => x.point!)} />
      <p className="text-xs text-gray-500">
        {value.point ? `Pin at ${value.point.lat.toFixed(5)}, ${value.point.lng.toFixed(5)}${value.source === 'photo' ? ' (from the photo)' : value.source === 'device' ? ' (your location; drag it onto the house)' : ''}. ` : 'No location yet. '}
        Tap the map or drag the pin onto the house, then look up the owner. Switch to Satellite to see roofs.
      </p>
      {error && <p className="text-sm text-amber-700">{error}</p>}
      {p && <ParcelCard parcel={p} />}
      {value.point && (
        <div className="flex flex-wrap gap-2">
          {links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" title={l.hint}
              className="px-2.5 py-1 rounded-full border border-gray-300 text-xs text-gray-700 hover:border-blue-400 hover:text-blue-700">{l.label} ↗</a>
          ))}
        </div>
      )}
    </div>
  );
}

/** The owner-of-record summary from the parcel lookup. */
export function ParcelCard({ parcel: p }: { parcel: ParcelRecord }) {
  const rows: [string, string | null][] = [
    ['Owner of record', [p.owner, p.owner2].filter(Boolean).join(' & ') || null],
    ['Tax bill mailed to', p.mailingAddress],
    ['Property address', [p.siteAddress, p.city, p.zip].filter(Boolean).join(', ') || null],
    ['Parcel #', p.parcelId],
    ['County', p.county],
    ['Tax value', p.totalValue ? `${formatMoney(p.totalValue)}${p.landValue ? ` (land ${formatMoney(p.landValue)})` : ''}` : null],
    ['Last sale', [p.saleDate && formatDate(p.saleDate), p.salePrice && formatMoney(p.salePrice)].filter(Boolean).join(' · ') || null],
    ['Acres', p.acres ? p.acres.toLocaleString(undefined, { maximumFractionDigits: 2 }) : null],
    ['Year built', p.yearBuilt ? String(p.yearBuilt) : null],
  ];
  return (
    <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm">
      {p.absentee && (
        <p className="mb-2 px-2 py-1 rounded bg-amber-100 text-amber-900 text-xs font-medium">🏚️ Tax bill goes to a different address: possibly an absentee owner, landlord or estate.</p>
      )}
      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="flex gap-2"><dt className="text-gray-500 shrink-0">{k}:</dt><dd className="text-gray-900">{v}</dd></div>
        ))}
      </dl>
      <details className="mt-2">
        <summary className="text-xs text-blue-600 cursor-pointer">All public fields</summary>
        <dl className="mt-1 grid sm:grid-cols-2 gap-x-6 text-xs">
          {Object.entries(p.raw).filter(([, v]) => v !== null && v !== '' && v !== ' ').map(([k, v]) => (
            <div key={k} className="flex gap-2"><dt className="text-gray-500">{k}</dt><dd className="text-gray-800 break-all">{String(v)}</dd></div>
          ))}
        </dl>
      </details>
      <p className="mt-2 text-[11px] text-gray-500">From NC OneMap’s statewide parcels (county tax records). Verify ownership with the deed before relying on it.</p>
    </div>
  );
}
