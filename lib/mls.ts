// Live MLS listings from the Flexmls Spark API (RESO Web API / OData), shown in findanchome's own search
// (/search) and listing pages (/listings/[key]) so visitors never hit a Flexmls login and every inquiry lands
// in the Leads CRM.
//
// Server-only: the access token must never reach the browser.
//   SPARK_ACCESS_TOKEN  IDX access token from Spark Platform (sparkplatform.com). Without it /search falls
//                       back to the embedded Flexmls portal.
//   SPARK_API_BASE      optional, defaults to https://sparkapi.com/Reso/OData

import { COUNTY_NAMES, type CountySlug } from './lifestyles';

const BASE = (process.env.SPARK_API_BASE || 'https://sparkapi.com/Reso/OData').replace(/\/$/, '');
const REVALIDATE_SECONDS = 15 * 60; // IDX rules want data refreshed at least daily; 15 minutes keeps it fresh.
export const PAGE_SIZE = 24;

export const mlsConfigured = () => Boolean(process.env.SPARK_ACCESS_TOKEN);

export interface MlsListing {
  key: string;
  mlsNumber: string;
  status: string;
  price: number | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  acres: number | null;
  yearBuilt: number | null;
  propertyType: string;
  propertySubType: string;
  remarks: string;
  listOffice: string;
  listAgent: string;
  lat: number | null;
  lng: number | null;
  photos: string[];
  daysOnMarket: number | null;
  updatedAt: string | null;
}

export interface MlsFilters {
  q?: string;
  county?: string;
  type?: string;
  minPrice?: string;
  maxPrice?: string;
  beds?: string;
  baths?: string;
  sort?: string;
  page?: string;
}

export const PROPERTY_TYPES = [
  { value: 'single', label: 'Single Family' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'land', label: 'Land / Lots' },
  { value: 'manufactured', label: 'Manufactured' },
] as const;

export const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price (low to high)' },
  { value: 'price-desc', label: 'Price (high to low)' },
] as const;

const SELECT = [
  'ListingKey', 'ListingId', 'StandardStatus', 'ListPrice', 'UnparsedAddress', 'City', 'StateOrProvince',
  'PostalCode', 'CountyOrParish', 'BedroomsTotal', 'BathroomsTotalInteger', 'LivingArea', 'LotSizeAcres',
  'YearBuilt', 'PropertyType', 'PropertySubType', 'PublicRemarks', 'ListOfficeName', 'ListAgentFullName',
  'Latitude', 'Longitude', 'DaysOnMarket', 'ModificationTimestamp',
].join(',');

const quote = (s: string) => `'${s.replace(/'/g, "''")}'`;
const num = (v?: string) => {
  const n = Number(String(v ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};

// MLSs differ on whether the county carries the word "County", so match both forms.
function countyClause(slug: CountySlug) {
  const full = COUNTY_NAMES[slug];
  const bare = full.replace(/ County$/, '');
  return `(CountyOrParish eq ${quote(bare)} or CountyOrParish eq ${quote(full)})`;
}

function titleCase(s: string) {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Build the OData $filter for a search. Defaults to active listings in the five counties Marc serves. */
export function buildFilter(f: MlsFilters) {
  const parts: string[] = ["StandardStatus eq 'Active'"];

  const county = f.county && f.county in COUNTY_NAMES ? (f.county as CountySlug) : null;
  if (county) parts.push(countyClause(county));
  else parts.push(`(${(Object.keys(COUNTY_NAMES) as CountySlug[]).map(countyClause).join(' or ')})`);

  const q = (f.q ?? '').trim().slice(0, 80);
  if (q) {
    if (/^\d{5}$/.test(q)) parts.push(`PostalCode eq ${quote(q)}`);
    else if (/^[A-Za-z]{0,3}\d{5,}$/.test(q)) parts.push(`ListingId eq ${quote(q.toUpperCase())}`);
    else {
      const asCounty = (Object.keys(COUNTY_NAMES) as CountySlug[]).find(
        (s) => COUNTY_NAMES[s].toLowerCase().startsWith(q.toLowerCase().replace(/ county$/, '')),
      );
      parts.push(asCounty && /county/i.test(q) ? countyClause(asCounty) : `City eq ${quote(titleCase(q))}`);
    }
  }

  const min = num(f.minPrice);
  const max = num(f.maxPrice);
  if (min) parts.push(`ListPrice ge ${min}`);
  if (max) parts.push(`ListPrice le ${max}`);
  const beds = num(f.beds);
  const baths = num(f.baths);
  if (beds) parts.push(`BedroomsTotal ge ${Math.floor(beds)}`);
  if (baths) parts.push(`BathroomsTotalInteger ge ${Math.floor(baths)}`);

  switch (f.type) {
    case 'single': parts.push("PropertyType eq 'Residential' and PropertySubType eq 'Single Family Residence'"); break;
    case 'condo': parts.push("PropertySubType eq 'Condominium'"); break;
    case 'townhouse': parts.push("PropertySubType eq 'Townhouse'"); break;
    case 'land': parts.push("PropertyType eq 'Land'"); break;
    case 'manufactured': parts.push("PropertySubType eq 'Manufactured Home'"); break;
  }

  return parts.join(' and ');
}

function orderBy(sort?: string) {
  if (sort === 'price-asc') return 'ListPrice asc';
  if (sort === 'price-desc') return 'ListPrice desc';
  return 'ModificationTimestamp desc';
}

type Raw = Record<string, unknown> & { Media?: { MediaURL?: string; Order?: number; MediaCategory?: string }[] };

const s = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));
const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

function normalize(r: Raw): MlsListing {
  const photos = (r.Media ?? [])
    .filter((m) => m.MediaURL && (!m.MediaCategory || /photo/i.test(m.MediaCategory)))
    .sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0))
    .map((m) => m.MediaURL!);
  return {
    key: s(r.ListingKey),
    mlsNumber: s(r.ListingId),
    status: s(r.StandardStatus),
    price: n(r.ListPrice),
    address: s(r.UnparsedAddress),
    city: s(r.City),
    state: s(r.StateOrProvince) || 'NC',
    zip: s(r.PostalCode),
    county: s(r.CountyOrParish),
    beds: n(r.BedroomsTotal),
    baths: n(r.BathroomsTotalInteger),
    sqft: n(r.LivingArea),
    acres: n(r.LotSizeAcres),
    yearBuilt: n(r.YearBuilt),
    propertyType: s(r.PropertyType),
    propertySubType: s(r.PropertySubType),
    remarks: s(r.PublicRemarks),
    listOffice: s(r.ListOfficeName),
    listAgent: s(r.ListAgentFullName),
    lat: n(r.Latitude),
    lng: n(r.Longitude),
    photos,
    daysOnMarket: n(r.DaysOnMarket),
    updatedAt: s(r.ModificationTimestamp) || null,
  };
}

async function spark<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = `${BASE}${path}?${new URLSearchParams(params).toString().replace(/\+/g, '%20')}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.SPARK_ACCESS_TOKEN}`,
      Accept: 'application/json',
      'X-SparkApi-User-Agent': 'FindaNChome',
    },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Spark API ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

export async function searchListings(f: MlsFilters) {
  const page = Math.max(1, Math.min(200, Math.floor(num(f.page) ?? 1)));
  const data = await spark<{ value: Raw[]; '@odata.count'?: number }>('/Property', {
    $filter: buildFilter(f),
    $orderby: orderBy(f.sort),
    $top: String(PAGE_SIZE),
    $skip: String((page - 1) * PAGE_SIZE),
    $count: 'true',
    $select: SELECT,
    $expand: 'Media($select=MediaURL,Order,MediaCategory)',
  });
  const listings = (data.value ?? []).map(normalize);
  return { listings, total: data['@odata.count'] ?? listings.length, page };
}

export async function getListing(key: string): Promise<MlsListing | null> {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(key)) return null;
  try {
    const data = await spark<Raw>(`/Property(${quote(key)})`, {
      $select: SELECT,
      $expand: 'Media($select=MediaURL,Order,MediaCategory)',
    });
    return normalize(data);
  } catch (err) {
    if (err instanceof Error && /Spark API 404/.test(err.message)) return null;
    throw err;
  }
}

export const formatPrice = (p: number | null) =>
  p == null ? 'Price on request' : p.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/** The county slug (lib/lifestyles.ts) for a listing, so inquiries carry the county into the CRM. */
export function countySlugFor(county: string): CountySlug | null {
  const bare = county.toLowerCase().replace(/ county$/, '').trim();
  return (Object.keys(COUNTY_NAMES) as CountySlug[]).find((s) => COUNTY_NAMES[s].toLowerCase().replace(/ county$/, '') === bare) ?? null;
}
