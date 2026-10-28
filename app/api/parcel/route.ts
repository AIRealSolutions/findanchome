import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { normalizeParcel } from '@/lib/parcel';

// Owner of record for a map point, from NC OneMap's statewide parcels (each county's tax data, compiled by the
// state). Brokers and admins only. Field names vary a little between counties and service copies, so we
// normalize the common ones and also return every field as published.

const SERVICES = [
  'https://services.nconemap.gov/secure/rest/services/NC1Map_Parcels/MapServer/1/query',
  'https://services.gis.nc.gov/secure/rest/services/NC1Map_Parcels/MapServer/1/query',
];

type Attrs = Record<string, unknown>;

async function query(url: string, lat: number, lng: number, meters: number) {
  const params = new URLSearchParams({
    geometry: `${lng},${lat}`, geometryType: 'esriGeometryPoint', inSR: '4326', spatialRel: 'esriSpatialRelIntersects',
    outFields: '*', returnGeometry: 'false', f: 'json',
    ...(meters ? { distance: String(meters), units: 'esriSRUnit_Meter' } : {}),
  });
  const res = await fetch(`${url}?${params}`, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`Parcel service responded ${res.status}`);
  const j = await res.json();
  if (j.error) throw new Error(j.error.message ?? 'Parcel service error');
  return ((j.features ?? []) as { attributes: Attrs }[]).map((f) => f.attributes);
}

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : '';
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !key) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  const supabase = createClient(url, key, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: u } = await supabase.auth.getUser(token);
  if (!u.user) return NextResponse.json({ error: 'Your session has expired.' }, { status: 401 });
  const { data: me } = await supabase.from('fanc_user_profiles').select('role').eq('id', u.user.id).maybeSingle();
  if (!me || !['broker', 'admin'].includes(me.role)) return NextResponse.json({ error: 'Brokers only.' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get('lat'));
  const lng = Number(searchParams.get('lng'));
  // North Carolina, roughly.
  if (!(lat > 33.7 && lat < 36.7 && lng > -84.4 && lng < -75.3)) {
    return NextResponse.json({ error: 'That point is outside North Carolina; parcel lookup only covers NC.' }, { status: 400 });
  }

  let lastError = '';
  for (const service of SERVICES) {
    try {
      // The point itself, then a little slack for a pin dropped on the street in front of the house.
      let rows = await query(service, lat, lng, 0);
      if (!rows.length) rows = await query(service, lat, lng, 25);
      return NextResponse.json({ parcel: rows.length ? normalizeParcel(rows[0]) : null, candidates: rows.length });
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  console.error('Parcel lookup failed:', lastError);
  return NextResponse.json({ error: 'The state parcel service didn’t answer. Try again, or use the county links below.' }, { status: 502 });
}
