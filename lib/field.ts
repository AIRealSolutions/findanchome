// Field capture helpers for listing opportunities: where a photo was taken, the broker's own location, shrinking
// photos before upload, address lookup, owner-of-record lookup (/api/parcel) and public-record research links.

import { createClient } from './supabase/client';
import type { ListingPhoto } from './listings';

export type LatLng = { lat: number; lng: number };

export const PHOTO_BUCKET = 'listing-photos';

/** GPS position and time stored in the photo itself, when the camera recorded them. */
export async function photoGps(file: File): Promise<{ point: LatLng | null; takenAt: string | null }> {
  try {
    const exifr = (await import('exifr')).default;
    const [gps, meta] = await Promise.all([exifr.gps(file).catch(() => null), exifr.parse(file, ['DateTimeOriginal']).catch(() => null)]);
    const point = gps && Number.isFinite(gps.latitude) && Number.isFinite(gps.longitude) ? { lat: gps.latitude, lng: gps.longitude } : null;
    const taken = meta?.DateTimeOriginal instanceof Date ? meta.DateTimeOriginal.toISOString() : null;
    return { point, takenAt: taken };
  } catch {
    return { point: null, takenAt: null };
  }
}

/** The phone's current position (the broker standing at the curb). */
export function deviceLocation(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('This device can’t share its location.'));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => reject(new Error(e.code === e.PERMISSION_DENIED ? 'Location permission was denied. Allow it in your browser settings, or drop the pin on the map.' : 'Couldn’t get your location. Drop the pin on the map instead.')),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  });
}

/** Shrink a photo to at most `max` px on the long side as JPEG. Returns the original if the browser can't decode it. */
export async function shrinkPhoto(file: File, max = 1600, quality = 0.82): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b ?? file), 'image/jpeg', quality));
  } catch {
    return file;
  }
}

export interface PendingPhoto {
  key: string;
  file: File;
  preview: string;
  point: LatLng | null;
  takenAt: string | null;
}

export async function preparePhotos(files: FileList | File[]): Promise<PendingPhoto[]> {
  return Promise.all([...files].filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name)).map(async (file) => {
    const { point, takenAt } = await photoGps(file);
    return { key: `${file.name}-${file.size}-${file.lastModified}`, file, preview: URL.createObjectURL(file), point, takenAt };
  }));
}

/** Upload photos to an opportunity (shrunk first) and record them. Returns an error message or ''. */
export async function uploadPhotos(opportunityId: string, photos: PendingPhoto[], startSort = 0) {
  const supabase = createClient();
  for (const [i, p] of photos.entries()) {
    const blob = await shrinkPhoto(p.file);
    const ext = blob.type === 'image/jpeg' ? 'jpg' : (p.file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${opportunityId}/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: blob.type || p.file.type, upsert: false });
    if (up.error) return up.error.message;
    const { error } = await supabase.from('fanc_listing_photos').insert({
      opportunity_id: opportunityId, path, latitude: p.point?.lat ?? null, longitude: p.point?.lng ?? null, taken_at: p.takenAt, sort: startSort + i,
    });
    if (error) return error.message;
  }
  return '';
}

/** Short-lived links to show private photos. */
export async function photoUrls(photos: ListingPhoto[]) {
  if (!photos.length) return {} as Record<string, string>;
  const { data } = await createClient().storage.from(PHOTO_BUCKET).createSignedUrls(photos.map((p) => p.path), 3600);
  return Object.fromEntries((data ?? []).filter((d) => d.signedUrl).map((d) => [d.path!, d.signedUrl]));
}

export async function deletePhoto(p: ListingPhoto) {
  const supabase = createClient();
  await supabase.storage.from(PHOTO_BUCKET).remove([p.path]);
  const { error } = await supabase.from('fanc_listing_photos').delete().eq('id', p.id);
  return error?.message ?? '';
}

// ───────────────────────── Owner of record ─────────────────────────

/** A parcel from NC OneMap's statewide parcels, normalized (see app/api/parcel/route.ts). */
export interface ParcelRecord {
  parcelId: string | null;
  owner: string | null;
  owner2: string | null;
  mailingAddress: string | null;
  siteAddress: string | null;
  city: string | null;
  zip: string | null;
  county: string | null;
  totalValue: number | null;
  landValue: number | null;
  buildingValue: number | null;
  saleDate: string | null;
  salePrice: number | null;
  acres: number | null;
  yearBuilt: number | null;
  absentee: boolean | null;
  /** Every field the county published, as returned. */
  raw: Record<string, unknown>;
}

export async function lookupParcel(point: LatLng): Promise<{ parcel?: ParcelRecord | null; error?: string }> {
  const { data: { session } } = await createClient().auth.getSession();
  if (!session) return { error: 'Sign in again to look up owners.' };
  const res = await fetch(`/api/parcel?lat=${point.lat.toFixed(6)}&lng=${point.lng.toFixed(6)}`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  }).catch(() => null);
  if (!res) return { error: 'Couldn’t reach the parcel lookup.' };
  const j = await res.json().catch(() => ({}));
  return res.ok ? { parcel: j.parcel ?? null } : { error: j.error ?? 'Parcel lookup failed.' };
}

/** Street address for a point when no parcel was found (OpenStreetMap Nominatim). */
export async function reverseGeocode(point: LatLng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${point.lat}&lon=${point.lng}`, {
      headers: { 'Accept-Language': 'en-US' },
    });
    const j = await res.json();
    const a = j.address ?? {};
    return {
      address: [a.house_number, a.road].filter(Boolean).join(' ') || null,
      city: a.city || a.town || a.village || a.hamlet || null,
      zip: a.postcode || null,
      county: (a.county || '').replace(/ County$/, '') || null,
    };
  } catch {
    return null;
  }
}

/** Where to dig deeper: maps, the county's records, the courts. */
export function researchLinks(point: LatLng | null, opts: { county?: string | null; owner?: string | null; parcelId?: string | null; address?: string | null }) {
  const q = encodeURIComponent;
  const county = opts.county ? `${opts.county.replace(/ County$/i, '')} County NC` : 'NC';
  const links: { label: string; href: string; hint: string }[] = [];
  if (point) {
    links.push({ label: 'Street View', href: `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${point.lat},${point.lng}`, hint: 'See the house and street' });
    links.push({ label: 'Google Maps', href: `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`, hint: 'Satellite and directions' });
  }
  links.push({ label: `${county} tax & GIS`, href: `https://www.google.com/search?q=${q(`${county} tax parcel search ${opts.parcelId ?? opts.address ?? ''}`)}`, hint: 'Tax bill, values, sales history' });
  links.push({ label: `${county} Register of Deeds`, href: `https://www.google.com/search?q=${q(`${county} register of deeds search ${opts.owner ?? ''}`)}`, hint: 'Deeds, deeds of trust, liens' });
  links.push({ label: 'NC Courts (eCourts)', href: 'https://www.nccourts.gov/', hint: 'Smart Search the owner for foreclosure (SP) or estate (E) files' });
  return links;
}

/** Opportunity columns for a located pin and its parcel record. */
export function locationColumns(v: { point: LatLng | null; source: 'photo' | 'device' | 'map' | 'address' | null; parcel: ParcelRecord | null }) {
  return {
    latitude: v.point ? Number(v.point.lat.toFixed(6)) : null,
    longitude: v.point ? Number(v.point.lng.toFixed(6)) : null,
    location_source: v.point ? v.source ?? 'map' : null,
    parcel_id: v.parcel?.parcelId ?? null,
    parcel_data: v.parcel ? (v.parcel as unknown as Record<string, unknown>) : null,
    absentee_owner: v.parcel?.absentee ?? null,
  };
}

/** County tax records list owners "LAST FIRST MIDDLE"; turn "SMITH JOHN A" into "John A Smith" for the form. */
export function ownerDisplayName(owner: string | null) {
  if (!owner) return '';
  const cap = (w: string) => (w.length === 1 ? w : w.charAt(0) + w.slice(1).toLowerCase());
  if (/\b(LLC|INC|TRUST|ESTATE|HEIRS|BANK|CORP|COMPANY|CO|LP|LLP|PROPERTIES|HOLDINGS|CHURCH|COUNTY|CITY|STATE|ASSOC)\b/i.test(owner) || owner.includes('&') || owner.includes(',')) {
    return owner.split(' ').map(cap).join(' ');
  }
  const parts = owner.trim().split(/\s+/);
  return parts.length > 1 ? [...parts.slice(1), parts[0]].map(cap).join(' ') : cap(parts[0]);
}
