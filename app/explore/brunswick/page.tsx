'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import ConsultationCTA from '@/components/ConsultationCTA';
import { getCommunitiesByCounty, communityPath } from '@/lib/communities';
import { MapPin } from 'lucide-react';
import NeighborhoodSection from '@/components/NeighborhoodSection';
import { getNeighborhoodsByCounty } from '@/lib/neighborhoods';

export default function BrunswickPage() {
  const communities = getCommunitiesByCounty('brunswick');

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="bg-gradient-to-r from-green-500 to-teal-400 text-white py-16">
        <div className="container mx-auto px-4">
          <Link href="/explore" className="text-green-100 hover:text-white mb-4 inline-flex items-center gap-1">
            ← Back to Counties
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">⛵ Brunswick County</h1>
          <p className="text-xl opacity-90">Golf Communities, Waterfront Living, and Coastal Charm</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-[#1e3a8a] mb-6">About Brunswick County</h2>
          <p className="text-gray-700 text-lg mb-4">
            Brunswick County is known for its charming coastal towns, world-class golf communities, and upscale waterfront living. Anchored by historic Southport, the county attracts retirees, golf enthusiasts, and families seeking a blend of small-town hospitality with resort-quality amenities and beautiful beaches.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 bg-green-50 p-6 rounded-lg">
            <div>
              <div className="text-2xl font-bold text-[#0ea5e9]">~116,000</div>
              <div className="text-gray-700 text-sm">Population</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#fbbf24]">~860 sq mi</div>
              <div className="text-gray-700 text-sm">Area</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1e3a8a]">30 min</div>
              <div className="text-gray-700 text-sm">to Wilmington</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1e3a8a] mb-12 text-center">Key Communities</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {communities.map((community) => (
              <Link key={community.slug} href={communityPath(community)} className="block p-6 bg-green-50 border-2 border-green-200 rounded-lg hover:shadow-lg transition-all group">
                <MapPin className="w-5 h-5 text-[#0ea5e9] mb-3" />
                <h3 className="font-bold text-xl text-[#1e3a8a] mb-2 group-hover:text-[#0ea5e9]">{community.name}</h3>
                <p className="text-gray-700 mb-3">{community.summary}</p>
                <div className="text-sm text-gray-600">{community.population.startsWith('~') ? `Population: ${community.population}` : community.type}</div>
                <div className="mt-3 text-sm font-semibold text-[#0ea5e9]">Explore {community.name} →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="new-construction" className="py-16 bg-gradient-to-br from-green-50 to-teal-50 scroll-mt-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <NeighborhoodSection
            neighborhoods={getNeighborhoodsByCounty('brunswick')}
            title="New Construction & Golf Communities in Brunswick County"
            intro="Brunswick County is one of the fastest-growing counties in North Carolina, with master-planned golf communities, 55+ neighborhoods and new home builders from Leland to Calabash. Here are the communities buyers ask us about most."
          />
        </div>
      </section>

      <ConsultationCTA
        title="Ready to Find Your Home in Brunswick County?"
        text="Tell us which towns, neighborhoods and lifestyles you're considering in Brunswick County, and we'll follow up with homes and a plan that fit your goals."
        context={{ counties: ['brunswick'] }}
      />

      <footer className="bg-gradient-to-r from-[#1e3a8a] via-[#0c4a6e] to-[#1e3a8a] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-bold text-lg text-[#fbbf24] mb-4">FindaNChome.com</div>
              <p className="text-gray-300 text-sm">Your trusted guide to finding your perfect home in Southeastern North Carolina.</p>
            </div>
            <div>
              <div className="font-bold mb-4 text-[#fbbf24]">Explore</div>
              <div className="space-y-2 text-sm">
                <Link href="/explore" className="block text-gray-300 hover:text-[#fbbf24]">Counties</Link>
                <Link href="/lifestyle" className="block text-gray-300 hover:text-[#fbbf24]">Lifestyles</Link>
                <Link href="/search" className="block text-gray-300 hover:text-[#fbbf24]">Search Homes</Link>
              </div>
            </div>
            <div>
              <div className="font-bold mb-4 text-[#fbbf24]">Help</div>
              <div className="space-y-2 text-sm">
                <Link href="/buyers" className="block text-gray-300 hover:text-[#fbbf24]">Buyers</Link>
                <Link href="/sellers" className="block text-gray-300 hover:text-[#fbbf24]">Sellers</Link>
                <Link href="/hud" className="block text-gray-300 hover:text-[#fbbf24]">HUD Homes</Link>
              </div>
            </div>
            <div>
              <div className="font-bold mb-4 text-[#fbbf24]">Contact</div>
              <div className="text-gray-300 space-y-2 text-sm">
                <div>Phone: (910) 363-6147</div>
                <div>Email: marcspencer28461@gmail.com</div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#0ea5e9]/30 pt-8 text-center text-gray-300 text-sm">
            © 2026 Lightkeeper Realty. All rights reserved. | Fair Housing Opportunity
          </div>
        </div>
      </footer>
    </div>
  );
}
