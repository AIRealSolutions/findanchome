import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Bed, Bath, Ruler, Calendar, MapPin, Phone } from 'lucide-react';
import Navigation from '@/components/Navigation';
import {
  formatPrice,
  fullAddress,
  getListing,
  listingAmenities,
  listingImages,
  listingJsonLd,
  listingPath,
  listingTypeLabel,
  propertyTypeLabel,
} from '@/lib/listings';
import { PHONE, PHONE_DISPLAY, SITE_NAME, absoluteUrl } from '@/lib/siteRoutes';
import { usaHudHomes } from '@/lib/sisterSites';

export const revalidate = 3600;

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const listing = await getListing((await params).id);
  if (!listing) return { title: 'Listing not found', robots: { index: false } };

  const facts = [
    listing.bedrooms != null && `${listing.bedrooms} bed`,
    listing.bathrooms != null && `${listing.bathrooms} bath`,
    listing.square_feet != null && `${listing.square_feet.toLocaleString()} sqft`,
  ].filter(Boolean).join(', ');
  const title = listing.meta_title || `${listing.address_line1}, ${listing.city}, NC — ${formatPrice(listing.price)}`;
  const description =
    listing.meta_description ||
    `${listingTypeLabel(listing.listing_type) ?? propertyTypeLabel(listing.property_type)} for sale at ${fullAddress(listing)}${facts ? `: ${facts}` : ''}. Listed at ${formatPrice(listing.price)} by Lightkeeper Realty.`;
  const images = listingImages(listing);

  return {
    title,
    description,
    alternates: { canonical: listingPath(listing) },
    openGraph: { title, description, url: listingPath(listing), siteName: SITE_NAME, type: 'website', images: images.slice(0, 1) },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function ListingPage({ params }: { params: Params }) {
  const listing = await getListing((await params).id);
  if (!listing) notFound();

  const images = listingImages(listing);
  const amenities = listingAmenities(listing);
  const badge = listingTypeLabel(listing.listing_type);
  const countyName = listing.county?.replace(/\s*county$/i, '');
  const countySlug = countyName?.toLowerCase().replace(/\s+/g, '-');
  const jsonLd = listingJsonLd(listing, absoluteUrl(listingPath(listing)));

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="container mx-auto px-4 py-8 flex-1">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-600 mb-4">
          <Link href="/properties" className="hover:text-[#0ea5e9]">Properties</Link>
          {countyName && (
            <>
              {' / '}
              <Link href={`/properties?county=${encodeURIComponent(countyName)}`} className="hover:text-[#0ea5e9]">{countyName} County</Link>
            </>
          )}
          {' / '}
          <span>{listing.city}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 h-72 md:h-96 mb-4">
              {images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[0]} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">🏡</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-6">
                {images.slice(1, 9).map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt={`${listing.title} photo`} className="w-full h-24 object-cover rounded" loading="lazy" />
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-2">
              {badge && <span className="bg-[#fbbf24] text-[#1e3a8a] text-xs font-bold px-2 py-1 rounded">{badge}</span>}
              {listing.status === 'pending' && <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">Pending</span>}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1e3a8a]">{listing.title}</h1>
            <p className="text-gray-700 flex items-center gap-1 mt-2"><MapPin className="w-4 h-4" /> {fullAddress(listing)}</p>
            <div className="text-3xl font-bold text-[#0ea5e9] mt-4">{formatPrice(listing.price)}</div>

            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
              {listing.bedrooms != null && <Fact icon={<Bed className="w-5 h-5" />} label="Bedrooms" value={listing.bedrooms} />}
              {listing.bathrooms != null && <Fact icon={<Bath className="w-5 h-5" />} label="Bathrooms" value={listing.bathrooms} />}
              {listing.square_feet != null && <Fact icon={<Ruler className="w-5 h-5" />} label="Square feet" value={listing.square_feet.toLocaleString()} />}
              {listing.year_built != null && <Fact icon={<Calendar className="w-5 h-5" />} label="Year built" value={listing.year_built} />}
            </dl>

            {listing.description && (
              <section className="mb-6">
                <h2 className="text-2xl font-bold text-[#1e3a8a] mb-3">About this home</h2>
                <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
              </section>
            )}

            {amenities.length > 0 && (
              <section className="mb-6">
                <h2 className="text-2xl font-bold text-[#1e3a8a] mb-3">Features</h2>
                <ul className="grid sm:grid-cols-2 gap-2 list-disc list-inside text-gray-700">
                  {amenities.map((a) => <li key={a}>{a}</li>)}
                </ul>
              </section>
            )}

            <section className="mb-6">
              <h2 className="text-2xl font-bold text-[#1e3a8a] mb-3">Property details</h2>
              <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-gray-700">
                <Detail label="Property type" value={propertyTypeLabel(listing.property_type)} />
                {listing.county && <Detail label="County" value={listing.county} />}
                {listing.lot_size != null && <Detail label="Lot size" value={`${listing.lot_size} acres`} />}
                {listing.hud_case_number && <Detail label="HUD case number" value={listing.hud_case_number} />}
                {listing.original_price != null && listing.original_price > listing.price && (
                  <Detail label="Original price" value={formatPrice(listing.original_price)} />
                )}
              </dl>
              {listing.virtual_tour_url && (
                <a href={listing.virtual_tour_url} target="_blank" rel="noopener" className="inline-block mt-4 text-[#0ea5e9] font-semibold hover:underline">
                  Take the virtual tour →
                </a>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 h-fit bg-blue-50 border-2 border-[#0ea5e9] rounded-lg p-6">
            <h2 className="text-xl font-bold text-[#1e3a8a] mb-2">Interested in this home?</h2>
            <p className="text-gray-700 mb-4">Schedule a showing or ask a question — Lightkeeper Realty answers fast.</p>
            <a href={`tel:${PHONE}`} className="flex items-center justify-center gap-2 bg-[#0ea5e9] text-white px-4 py-3 rounded-lg font-bold hover:bg-[#0284c7] mb-3">
              <Phone className="w-4 h-4" /> Call {PHONE_DISPLAY}
            </a>
            <a href={`sms:${PHONE}`} className="block text-center border-2 border-[#0ea5e9] text-[#0ea5e9] px-4 py-3 rounded-lg font-bold hover:bg-white mb-3">
              Text us about this home
            </a>
            <Link href="/contact" className="block text-center text-[#1e3a8a] font-semibold hover:underline">Send a message</Link>
            {listing.listing_type === 'hud' && (
              <p className="text-sm text-gray-600 mt-4">
                HUD homes are sold by bid through a HUD-registered agent. <Link href="/hud" className="text-[#0ea5e9] hover:underline">How HUD bidding works</Link>
                {' · '}
                <a href={usaHudHomes.ncListings('listing_page')} target="_blank" rel="noopener" className="text-[#0ea5e9] hover:underline">More NC HUD homes</a>
              </p>
            )}
            {countySlug && (
              <p className="text-sm text-gray-600 mt-4">
                <Link href={`/explore/${countySlug}`} className="text-[#0ea5e9] hover:underline">Living in {countyName} County →</Link>
              </p>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white border rounded-lg p-3">
      <dt className="text-xs text-gray-500 flex items-center gap-1">{icon} {label}</dt>
      <dd className="text-lg font-bold text-[#1e3a8a]">{value}</dd>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b py-1">
      <dt className="font-medium">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
