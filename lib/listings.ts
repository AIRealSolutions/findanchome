import { createPublicClient } from '@/lib/supabase/public';

// Public listing data from fanc_properties. Only columns safe to show the
// public are selected — never internal fields like notes or created_by.
const PUBLIC_COLUMNS =
  'id, updated_at, title, description, property_type, listing_type, address_line1, address_line2, city, state, zip_code, county, latitude, longitude, bedrooms, bathrooms, square_feet, lot_size, year_built, price, original_price, hud_case_number, images, virtual_tour_url, status, is_featured, meta_title, meta_description, amenities';

// Statuses that get a public page. Sold/inactive listings drop out of the site.
export const PUBLIC_STATUSES = ['active', 'pending'];

export interface Listing {
  id: string;
  updated_at: string;
  title: string;
  description: string | null;
  property_type: string | null;
  listing_type: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip_code: string;
  county: string | null;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  lot_size: number | null;
  year_built: number | null;
  price: number;
  original_price: number | null;
  hud_case_number: string | null;
  images: unknown;
  virtual_tour_url: string | null;
  status: string;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  amenities: unknown;
}

export interface ListingFilters {
  county?: string;
  city?: string;
  type?: string;
}

export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  let query = supabase
    .from('fanc_properties')
    .select(PUBLIC_COLUMNS)
    .in('status', PUBLIC_STATUSES)
    .order('is_featured', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(500);
  if (filters.county) query = query.ilike('county', `${filters.county}%`);
  if (filters.city) query = query.ilike('city', filters.city);
  if (filters.type) query = query.eq('listing_type', filters.type);
  const { data, error } = await query;
  if (error) {
    console.error('getListings failed:', error.message);
    return [];
  }
  return (data ?? []) as Listing[];
}

export async function getListing(id: string): Promise<Listing | null> {
  const supabase = createPublicClient();
  if (!supabase || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await supabase
    .from('fanc_properties')
    .select(PUBLIC_COLUMNS)
    .eq('id', id)
    .in('status', PUBLIC_STATUSES)
    .maybeSingle();
  if (error) {
    console.error('getListing failed:', error.message);
    return null;
  }
  return data as Listing | null;
}

export function listingPath(listing: Pick<Listing, 'id'>) {
  return `/properties/${listing.id}`;
}

// images/amenities are JSONB: accept ["url", ...] or [{ url }, ...].
export function listingImages(listing: Listing): string[] {
  if (!Array.isArray(listing.images)) return [];
  return listing.images
    .map((img) => (typeof img === 'string' ? img : (img as { url?: string })?.url))
    .filter((url): url is string => typeof url === 'string' && url.length > 0);
}

export function listingAmenities(listing: Listing): string[] {
  return Array.isArray(listing.amenities) ? listing.amenities.filter((a): a is string => typeof a === 'string') : [];
}

export function fullAddress(l: Listing) {
  return [l.address_line1, l.address_line2, l.city, `${l.state} ${l.zip_code}`].filter(Boolean).join(', ');
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
}

const TYPE_LABELS: Record<string, string> = {
  single_family: 'Single Family Home',
  condo: 'Condo',
  townhouse: 'Townhouse',
  land: 'Land',
  manufactured: 'Manufactured Home',
  multi_family: 'Multi-Family',
};

export function propertyTypeLabel(type: string | null) {
  return (type && TYPE_LABELS[type]) || 'Home';
}

export function listingTypeLabel(type: string | null) {
  if (type === 'hud') return 'HUD Home';
  if (type === 'reo') return 'Bank-Owned (REO)';
  if (type === 'foreclosure') return 'Foreclosure';
  return null;
}

// schema.org type for the property itself.
function schemaPropertyType(type: string | null) {
  if (type === 'condo') return 'Apartment';
  if (type === 'land') return 'Place';
  if (type === 'multi_family') return 'House';
  return 'SingleFamilyResidence';
}

// RealEstateListing JSON-LD so search engines and AI agents can read price,
// address, size and availability directly.
export function listingJsonLd(l: Listing, url: string) {
  const images = listingImages(l);
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: l.title,
    description: l.meta_description || l.description || undefined,
    url,
    image: images.length ? images : undefined,
    dateModified: l.updated_at,
    offers: {
      '@type': 'Offer',
      price: l.price,
      priceCurrency: 'USD',
      availability: l.status === 'pending' ? 'https://schema.org/LimitedAvailability' : 'https://schema.org/InStock',
      seller: { '@id': `${new URL(url).origin}/#business` },
    },
    about: {
      '@type': schemaPropertyType(l.property_type),
      name: fullAddress(l),
      address: {
        '@type': 'PostalAddress',
        streetAddress: [l.address_line1, l.address_line2].filter(Boolean).join(' '),
        addressLocality: l.city,
        addressRegion: l.state,
        postalCode: l.zip_code,
        addressCountry: 'US',
      },
      geo:
        l.latitude != null && l.longitude != null
          ? { '@type': 'GeoCoordinates', latitude: l.latitude, longitude: l.longitude }
          : undefined,
      numberOfBedrooms: l.bedrooms ?? undefined,
      numberOfBathroomsTotal: l.bathrooms ?? undefined,
      floorSize: l.square_feet ? { '@type': 'QuantitativeValue', value: l.square_feet, unitCode: 'FTK' } : undefined,
      yearBuilt: l.year_built ?? undefined,
      amenityFeature: listingAmenities(l).map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
    },
  };
}
