import Link from 'next/link';
import Navigation from '@/components/Navigation';
import ListingCard from '@/components/ListingCard';
import { getListings } from '@/lib/listings';
import { pageMetadata, PHONE_DISPLAY } from '@/lib/siteRoutes';
import { usaHudHomes } from '@/lib/sisterSites';

export const metadata = pageMetadata('/properties');
export const revalidate = 3600;

const COUNTIES = ['Onslow', 'Pender', 'New Hanover', 'Brunswick', 'Columbus'];

type SearchParams = Promise<{ county?: string; city?: string; type?: string }>;

export default async function PropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  const { county, city, type } = await searchParams;
  const listings = await getListings({ county, city, type });
  const place = city || (county ? `${county} County` : 'Southeastern North Carolina');
  const heading = type === 'hud' ? `HUD Homes for Sale in ${place}` : `Homes for Sale in ${place}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{heading}</h1>
          <p className="text-xl opacity-90">Featured listings from Lightkeeper Realty — HUD, bank-owned and conventional homes.</p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10 flex-1">
        <nav aria-label="Filter by county" className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/properties"
            className={`px-4 py-2 rounded-full border-2 text-sm font-medium ${!county && !city ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]' : 'border-gray-300 hover:border-[#0ea5e9]'}`}
          >
            All counties
          </Link>
          {COUNTIES.map((c) => (
            <Link
              key={c}
              href={`/properties?county=${encodeURIComponent(c)}`}
              className={`px-4 py-2 rounded-full border-2 text-sm font-medium ${county === c ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]' : 'border-gray-300 hover:border-[#0ea5e9]'}`}
            >
              {c}
            </Link>
          ))}
          <Link
            href="/properties?type=hud"
            className={`px-4 py-2 rounded-full border-2 text-sm font-medium ${type === 'hud' ? 'bg-[#fbbf24] text-[#1e3a8a] border-[#fbbf24]' : 'border-gray-300 hover:border-[#fbbf24]'}`}
          >
            HUD homes
          </Link>
        </nav>

        {listings.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="text-6xl mb-4">🏡</div>
            <h2 className="text-2xl font-bold text-[#1e3a8a] mb-3">No featured listings in {place} right now</h2>
            <p className="text-gray-700 mb-6">
              New homes come on the market every day. Tell us what you&apos;re looking for and we&apos;ll send you matches,
              or call or text {PHONE_DISPLAY}.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/education/buyer-preferences" className="bg-[#0ea5e9] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#0284c7]">
                Get matched with homes
              </Link>
              <a href={usaHudHomes.ncListings('properties_empty')} target="_blank" rel="noopener" className="border-2 border-[#0ea5e9] text-[#0ea5e9] px-6 py-3 rounded-lg font-bold hover:bg-[#0ea5e9]/5">
                See NC HUD homes
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
