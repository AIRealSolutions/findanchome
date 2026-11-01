import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, Bath, BedDouble, Calendar, Home, MapPin, Ruler, Trees } from 'lucide-react';
import Navigation from '@/components/Navigation';
import SiteFooter from '@/components/SiteFooter';
import ListingInquiry from '@/components/ListingInquiry';
import { BROKERAGE } from '@/lib/site';
import { countySlugFor, formatPrice, getListing, mlsConfigured, type MlsListing } from '@/lib/mls';

type Params = { params: Promise<{ key: string }> };

async function load(key: string): Promise<MlsListing | null> {
  if (!mlsConfigured()) return null;
  try {
    return await getListing(decodeURIComponent(key));
  } catch (err) {
    console.error('MLS listing lookup failed:', err);
    return null;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const l = await load((await params).key);
  if (!l) return { title: 'Listing not found', robots: { index: false } };
  const place = [l.address, l.city].filter(Boolean).join(', ');
  return {
    title: `${place} | ${formatPrice(l.price)}`,
    description: [l.beds != null && `${l.beds} bed`, l.baths != null && `${l.baths} bath`, l.sqft && `${l.sqft.toLocaleString()} sqft`, `home for sale in ${l.city}, NC`]
      .filter(Boolean).join(', '),
    alternates: { canonical: `/listings/${encodeURIComponent(l.key)}` },
    openGraph: l.photos[0] ? { images: [l.photos[0]] } : undefined,
  };
}

export default async function ListingPage({ params }: Params) {
  const { key } = await params;
  const l = await load(key);
  if (!l) notFound();

  const summary = `MLS #${l.mlsNumber || l.key}, ${[l.address, l.city].filter(Boolean).join(', ')} (${formatPrice(l.price)})`;
  const facts: [React.ReactNode, string, string | null][] = [
    [<BedDouble key="b" size={18} />, 'Bedrooms', l.beds != null ? String(l.beds) : null],
    [<Bath key="ba" size={18} />, 'Bathrooms', l.baths != null ? String(l.baths) : null],
    [<Ruler key="r" size={18} />, 'Living area', l.sqft != null ? `${l.sqft.toLocaleString()} sqft` : null],
    [<Trees key="t" size={18} />, 'Lot', l.acres != null ? `${l.acres} acres` : null],
    [<Calendar key="c" size={18} />, 'Year built', l.yearBuilt != null ? String(l.yearBuilt) : null],
    [<Home key="h" size={18} />, 'Type', l.propertySubType || l.propertyType || null],
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 max-w-6xl py-6">
          <Link href="/search" className="inline-flex items-center gap-1 text-sm text-[#0ea5e9] hover:underline mb-4">
            <ArrowLeft size={16} /> Back to search
          </Link>

          <Gallery photos={l.photos} alt={l.address} />

          <div className="grid lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-2">
              <p className="text-3xl font-bold text-[#1e3a8a]">{formatPrice(l.price)}</p>
              <h1 className="text-2xl font-semibold text-gray-900 mt-1">{l.address}</h1>
              <p className="text-gray-600 flex items-center gap-1 mt-1">
                <MapPin size={16} /> {[l.city, l.state, l.zip].filter(Boolean).join(', ')}{l.county && ` · ${l.county.replace(/ County$/, '')} County`}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                MLS #{l.mlsNumber}{l.status && ` · ${l.status}`}{l.daysOnMarket != null && ` · ${l.daysOnMarket} days on market`}
              </p>

              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                {facts.filter(([, , v]) => v).map(([icon, label, value]) => (
                  <div key={label} className="p-3 rounded-lg bg-gradient-to-br from-[#1e3a8a]/5 to-[#0ea5e9]/5">
                    <dt className="text-xs text-gray-600 flex items-center gap-1">{icon} {label}</dt>
                    <dd className="font-semibold text-gray-900 mt-1">{value}</dd>
                  </div>
                ))}
              </dl>

              {l.remarks && (
                <section className="mt-8">
                  <h2 className="text-xl font-bold text-[#1e3a8a] mb-2">About this home</h2>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{l.remarks}</p>
                </section>
              )}

              {l.lat != null && l.lng != null && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${l.lat},${l.lng}`}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1 mt-6 text-[#0ea5e9] font-medium hover:underline"
                >
                  <MapPin size={16} /> View on map
                </a>
              )}

              <div className="mt-8 pt-4 border-t text-xs text-gray-500 space-y-1">
                {(l.listOffice || l.listAgent) && (
                  <p className="text-sm text-gray-700">
                    Listing courtesy of {[l.listAgent, l.listOffice].filter(Boolean).join(', ')}.
                  </p>
                )}
                <p>
                  Listing information is provided by the MLS through Flexmls for consumers&apos; personal, non-commercial
                  use and is deemed reliable but not guaranteed.{l.updatedAt && ` Last updated ${new Date(l.updatedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}.`}
                </p>
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 self-start bg-white border-2 border-[#0ea5e9]/20 rounded-lg p-5 shadow-sm">
              <h2 className="text-lg font-bold text-[#1e3a8a] mb-1">Interested in this home?</h2>
              <p className="text-sm text-gray-600 mb-4">{BROKERAGE.agent}, {BROKERAGE.name} · {BROKERAGE.phone}</p>
              <ListingInquiry summary={summary} county={countySlugFor(l.county)} sourcePage={`/listings/${encodeURIComponent(l.key)}`} />
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  if (!photos.length) {
    return <div className="aspect-[16/7] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"><Home className="w-16 h-16" /></div>;
  }
  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element -- MLS photo hosts vary */}
      <img src={photos[0]} alt={alt || 'Listing photo'} className="w-full aspect-[16/9] md:aspect-[16/7] object-cover rounded-lg" />
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto mt-2 pb-2 snap-x">
          {photos.slice(1, 40).map((src, i) => (
            <a key={src} href={src} target="_blank" rel="noopener" className="shrink-0 snap-start">
              {/* eslint-disable-next-line @next/next/no-img-element -- MLS photo hosts vary */}
              <img src={src} alt={`${alt} photo ${i + 2}`} loading="lazy" className="h-24 w-36 object-cover rounded" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
