import Link from 'next/link';
import type { Metadata } from 'next';
import { Search, ExternalLink } from 'lucide-react';
import Navigation from '@/components/Navigation';
import ConsultationCTA from '@/components/ConsultationCTA';
import SiteFooter from '@/components/SiteFooter';
import FlexmlsSearch from '@/components/FlexmlsSearch';
import ListingCard from '@/components/ListingCard';
import { BROKERAGE } from '@/lib/site';
import { COUNTY_NAMES } from '@/lib/lifestyles';
import { FLEXMLS_SEARCH_URL } from '@/lib/flexmls';
import { PAGE_SIZE, PROPERTY_TYPES, SORTS, mlsConfigured, searchListings, type MlsFilters } from '@/lib/mls';

export const metadata: Metadata = {
  title: 'Search Homes for Sale in Southeastern NC',
  description:
    'Search live MLS listings in Onslow, Pender, New Hanover, Brunswick and Columbus counties with Marc Spencer of Lightkeeper Realty.',
  alternates: { canonical: '/search' },
};

const field = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent bg-white';
const lbl = 'block text-xs font-semibold text-[#1e3a8a] mb-1';
const FILTER_KEYS = ['q', 'county', 'type', 'minPrice', 'maxPrice', 'beds', 'baths', 'sort'] as const;

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const f: MlsFilters = {};
  for (const k of [...FILTER_KEYS, 'page'] as const) {
    const v = raw[k];
    if (typeof v === 'string' && v) f[k] = v;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Search Homes in Southeastern North Carolina</h1>
          <p className="text-xl opacity-90">Live MLS listings for Onslow, Pender, New Hanover, Brunswick and Columbus counties</p>
        </div>
      </section>

      <section className="py-10 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          {mlsConfigured() ? <NativeSearch f={f} /> : <FallbackSearch q={f.q} />}
          <Tips />
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Not Sure Where to Start?</h2>
          <p className="text-lg opacity-90 mb-6">Let&apos;s find your lifestyle first, then your perfect home.</p>
          <Link href="/lifestyle" className="inline-block bg-[#fbbf24] text-[#1e3a8a] px-8 py-3 rounded-lg hover:bg-[#fcd34d] font-bold transition-colors">
            Explore Your Lifestyle
          </Link>
        </div>
      </section>

      <ConsultationCTA title="Can't Find the Right Home?" />
      <SiteFooter />
    </div>
  );
}

async function NativeSearch({ f }: { f: MlsFilters }) {
  let result: Awaited<ReturnType<typeof searchListings>> | null = null;
  try {
    result = await searchListings(f);
  } catch (err) {
    console.error('MLS search failed:', err);
  }

  const pageHref = (page: number) => {
    const p = new URLSearchParams();
    for (const k of FILTER_KEYS) if (f[k]) p.set(k, f[k]!);
    if (page > 1) p.set('page', String(page));
    const qs = p.toString();
    return `/search${qs ? `?${qs}` : ''}`;
  };
  const pages = result ? Math.max(1, Math.ceil(result.total / PAGE_SIZE)) : 1;

  return (
    <>
      <form action="/search" method="get" className="bg-gradient-to-br from-[#1e3a8a]/5 to-[#0ea5e9]/5 p-5 rounded-lg border-2 border-[#0ea5e9]/20 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label htmlFor="q" className={lbl}>City, ZIP or MLS #</label>
            <input id="q" name="q" defaultValue={f.q} placeholder="e.g. Wilmington, 28460, 100123456" className={field} />
          </div>
          <div>
            <label htmlFor="county" className={lbl}>County</label>
            <select id="county" name="county" defaultValue={f.county ?? ''} className={field}>
              <option value="">All 5 counties</option>
              {Object.entries(COUNTY_NAMES).map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="type" className={lbl}>Property type</label>
            <select id="type" name="type" defaultValue={f.type ?? ''} className={field}>
              <option value="">All types</option>
              {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="minPrice" className={lbl}>Min price</label>
            <input id="minPrice" name="minPrice" type="number" min={0} step={5000} defaultValue={f.minPrice} placeholder="No min" className={field} />
          </div>
          <div>
            <label htmlFor="maxPrice" className={lbl}>Max price</label>
            <input id="maxPrice" name="maxPrice" type="number" min={0} step={5000} defaultValue={f.maxPrice} placeholder="No max" className={field} />
          </div>
          <div>
            <label htmlFor="beds" className={lbl}>Beds</label>
            <select id="beds" name="beds" defaultValue={f.beds ?? ''} className={field}>
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="baths" className={lbl}>Baths</label>
            <select id="baths" name="baths" defaultValue={f.baths ?? ''} className={field}>
              <option value="">Any</option>
              {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-4 mt-4">
          <div className="w-48">
            <label htmlFor="sort" className={lbl}>Sort by</label>
            <select id="sort" name="sort" defaultValue={f.sort ?? 'newest'} className={field}>
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <button className="flex-1 min-w-[10rem] bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] text-white py-2.5 rounded-lg hover:opacity-90 font-bold inline-flex items-center justify-center gap-2">
            <Search size={18} /> Search Homes
          </button>
          <Link href="/search" className="text-sm text-gray-600 hover:text-[#0ea5e9] py-2.5">Clear</Link>
        </div>
      </form>

      {!result ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="font-semibold text-gray-900 mb-2">Listings are temporarily unavailable.</p>
          <p className="text-gray-600 mb-4">Please try again in a few minutes, or use the full MLS search.</p>
          <a href={FLEXMLS_SEARCH_URL} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-[#0ea5e9] font-medium hover:underline">
            Open MLS search <ExternalLink size={14} />
          </a>
        </div>
      ) : result.listings.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="font-semibold text-gray-900 mb-2">No homes match those filters.</p>
          <p className="text-gray-600">Try widening your price range or area, or <Link href="/contact" className="text-[#0ea5e9] hover:underline">tell Marc what you&apos;re looking for</Link> and he&apos;ll watch for it, including off-market and HUD homes.</p>
        </div>
      ) : (
        <>
          <p className="text-gray-700 mb-4"><strong>{result.total.toLocaleString()}</strong> {result.total === 1 ? 'home' : 'homes'} for sale</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.listings.map((l) => <ListingCard key={l.key} listing={l} />)}
          </div>
          {pages > 1 && (
            <nav className="flex items-center justify-center gap-4 mt-8" aria-label="Pages">
              {result.page > 1 && <Link href={pageHref(result.page - 1)} className="px-4 py-2 border rounded-lg hover:border-[#0ea5e9]">← Previous</Link>}
              <span className="text-sm text-gray-600">Page {result.page} of {pages.toLocaleString()}</span>
              {result.page < pages && <Link href={pageHref(result.page + 1)} className="px-4 py-2 border rounded-lg hover:border-[#0ea5e9]">Next →</Link>}
            </nav>
          )}
        </>
      )}

      <p className="text-xs text-gray-500 mt-6">
        Listing information is provided by the MLS through Flexmls for consumers&apos; personal, non-commercial use and is
        deemed reliable but not guaranteed. Listings may be held by brokerages other than {BROKERAGE.name}. Updated
        every 15 minutes.
      </p>
    </>
  );
}

function FallbackSearch({ q }: { q?: string }) {
  return (
    <>
      {q && <p className="mb-4 text-gray-700">Looking for <strong>&ldquo;{q}&rdquo;</strong>? Enter it in the location search below.</p>}
      <FlexmlsSearch />
      <p className="text-xs text-gray-500 mt-3">
        Listing data is provided by the MLS through Flexmls and is deemed reliable but not guaranteed. Listings may be
        held by brokerages other than {BROKERAGE.name}.
      </p>
    </>
  );
}

function Tips() {
  return (
    <div className="grid md:grid-cols-3 gap-6 mt-10">
      <div className="bg-white p-6 rounded-lg border-l-4 border-[#0ea5e9] shadow-sm">
        <h3 className="font-bold text-[#1e3a8a] mb-2">Tour Any Home</h3>
        <p className="text-gray-700 text-sm">Open a listing and request a tour. No account needed, and it goes straight to Marc.</p>
      </div>
      <div className="bg-white p-6 rounded-lg border-l-4 border-[#fbbf24] shadow-sm">
        <h3 className="font-bold text-[#1e3a8a] mb-2">Looking for a HUD Home?</h3>
        <p className="text-gray-700 text-sm">
          Government-owned homes are listed separately. <Link href="/hud" className="text-[#0ea5e9] hover:underline">See how HUD homes work</Link>.
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg border-l-4 border-[#0ea5e9] shadow-sm">
        <h3 className="font-bold text-[#1e3a8a] mb-2">Get Expert Help</h3>
        <p className="text-gray-700 text-sm">
          Call Marc at <a href={`tel:${BROKERAGE.phoneE164}`} className="text-[#0ea5e9] hover:underline">{BROKERAGE.phone}</a> to talk through your search.
        </p>
      </div>
    </div>
  );
}
