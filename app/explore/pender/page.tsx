'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { MapPin } from 'lucide-react';

export default function PenderPage() {
  const communities = [
    { name: "Surf City", description: "Popular beach town with vibrant community and family attractions.", population: "~2,800" },
    { name: "Topsail Beach", description: "Upscale beach community known for its pristine beaches and aquarium.", population: "~1,700" },
    { name: "Hampstead", description: "Family-friendly inland community with excellent schools and parks.", population: "~3,500" },
    { name: "Burgaw", description: "Historic county seat with downtown charm and rural character.", population: "~3,600" },
    { name: "Rocky Point", description: "Quiet residential area with outdoor recreation and lake access.", population: "~1,500" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Header */}
      <section className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white py-16">
        <div className="container mx-auto px-4">
          <Link href="/explore" className="text-amber-100 hover:text-white mb-4 inline-flex items-center gap-1">
            ← Back to Counties
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">🏖️ Pender County</h1>
          <p className="text-xl opacity-90">Beach Living, Family Communities, and Coastal Charm</p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-[#1e3a8a] mb-6">About Pender County</h2>
          <p className="text-gray-700 text-lg mb-4">
            Pender County offers the perfect balance of beach lifestyle and family-friendly communities. From the popular beach towns of Surf City and Topsail Beach to the family-oriented neighborhoods of Hampstead and Burgaw, Pender County provides diverse options for buyers seeking coastal living.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 bg-amber-50 p-6 rounded-lg">
            <div>
              <div className="text-2xl font-bold text-[#0ea5e9]">~52,000</div>
              <div className="text-gray-700 text-sm">Population</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#fbbf24]">~874 sq mi</div>
              <div className="text-gray-700 text-sm">Area</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1e3a8a]">15 min</div>
              <div className="text-gray-700 text-sm">to Wilmington</div>
            </div>
          </div>
        </div>
      </section>

      {/* Communities */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1e3a8a] mb-12 text-center">Key Communities</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {communities.map((community, idx) => (
              <div key={idx} className="p-6 bg-amber-50 border-2 border-amber-200 rounded-lg hover:shadow-lg transition-all">
                <MapPin className="w-5 h-5 text-[#0ea5e9] mb-3" />
                <h3 className="font-bold text-xl text-[#1e3a8a] mb-2">{community.name}</h3>
                <p className="text-gray-700 mb-3">{community.description}</p>
                <div className="text-sm text-gray-600">Population: {community.population}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-amber-500 to-yellow-400 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Home in Pender County?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search" className="bg-[#1e3a8a] text-white px-8 py-3 rounded-lg hover:opacity-90 font-bold">
              Search Pender Homes
            </Link>
            <Link href="/contact" className="bg-white/20 hover:bg-white/30 px-8 py-3 rounded-lg border border-white/40 font-bold">
              Schedule Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
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
