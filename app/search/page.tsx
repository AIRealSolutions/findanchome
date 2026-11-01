import Link from 'next/link';
import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import ConsultationCTA from '@/components/ConsultationCTA';
import SiteFooter from '@/components/SiteFooter';
import FlexmlsSearch from '@/components/FlexmlsSearch';
import { BROKERAGE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Search Homes for Sale in Southeastern NC',
  description:
    'Search live MLS listings in Onslow, Pender, New Hanover, Brunswick and Columbus counties with Marc Spencer of Lightkeeper Realty.',
  alternates: { canonical: '/search' },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;

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
          {q && (
            <p className="mb-4 text-gray-700">
              Looking for <strong>&ldquo;{q}&rdquo;</strong>? Enter it in the location search below.
            </p>
          )}

          <FlexmlsSearch />

          <p className="text-xs text-gray-500 mt-3">
            Listing data is provided by the MLS through Flexmls and is deemed reliable but not guaranteed. Listings may
            be held by brokerages other than {BROKERAGE.name}.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            <div className="bg-white p-6 rounded-lg border-l-4 border-[#0ea5e9] shadow-sm">
              <h3 className="font-bold text-[#1e3a8a] mb-2">Save Your Search</h3>
              <p className="text-gray-700 text-sm">Create a free account in the search to save homes and get emailed when new listings match.</p>
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
                Found one you like? Call Marc at <a href={`tel:${BROKERAGE.phoneE164}`} className="text-[#0ea5e9] hover:underline">{BROKERAGE.phone}</a> to schedule a showing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Not Sure Where to Start?</h2>
          <p className="text-lg opacity-90 mb-6">Let&apos;s find your lifestyle first, then your perfect home.</p>
          <Link
            href="/lifestyle"
            className="inline-block bg-[#fbbf24] text-[#1e3a8a] px-8 py-3 rounded-lg hover:bg-[#fcd34d] font-bold transition-colors"
          >
            Explore Your Lifestyle
          </Link>
        </div>
      </section>

      <ConsultationCTA title="Can't Find the Right Home?" />

      <SiteFooter />
    </div>
  );
}
