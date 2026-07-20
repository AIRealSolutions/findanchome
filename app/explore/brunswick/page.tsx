'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { MapPin } from 'lucide-react';

export default function BrunswickPage() {
  const communities = [
    { name: "Southport", description: "Historic port town with charming downtown, riverfront dining, and cultural appeal.", population: "~3,500" },
    { name: "Oak Island", description: "Family-friendly beach community with golf courses and waterfront living.", population: "~7,500" },
    { name: "Holden Beach", description: "Quiet residential beach community perfect for families and retirees.", population: "~750" },
    { name: "Ocean Isle Beach", description: "Upscale beach community with excellent golf and resort amenities.", population: "~600" },
    { name: "Sunset Beach", description: "Small exclusive community with bridge access and residential charm.", population: "~350" }
  ];

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
            {communities.map((community, idx) => {
              const cityPath = community.name
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/'/g, '');
              return (
                <Link
                  key={idx}
                  href={`/explore/brunswick/${cityPath}`}
                  className="p-6 bg-green-50 border-2 border-green-200 rounded-lg hover:shadow-lg hover:border-green-400 transition-all group"
                >
                  <MapPin className="w-5 h-5 text-[#0ea5e9] mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-xl text-[#1e3a8a] mb-2 group-hover:text-green-600 transition-colors">{community.name}</h3>
                  <p className="text-gray-700 mb-3">{community.description}</p>
                  <div className="text-sm text-gray-600">Population: {community.population}</div>
                  <div className="text-sm text-green-600 font-semibold mt-3">Learn More →</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-green-500 to-teal-400 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Home in Brunswick County?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search" className="bg-[#fbbf24] text-[#1e3a8a] px-8 py-3 rounded-lg hover:opacity-90 font-bold">
              Search Brunswick Homes
            </Link>
            <Link href="/contact" className="bg-white/20 hover:bg-white/30 px-8 py-3 rounded-lg border border-white/40 font-bold">
              Schedule Consultation
            </Link>
          </div>
        </div>
      </section>

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
