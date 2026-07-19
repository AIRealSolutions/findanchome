'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { MapPin } from 'lucide-react';

export default function NewHanoverPage() {
  const communities = [
    { name: "Wilmington", description: "Vibrant city with riverwalk, film history, and urban amenities.", population: "~125,000" },
    { name: "Wrightsville Beach", description: "Upscale beach community with championship golf courses and fine dining.", population: "~2,600" },
    { name: "Carolina Beach", description: "Family-friendly beach town with boardwalk attractions and entertainment.", population: "~3,500" },
    { name: "Kure Beach", description: "Quiet, residential beach area with aquarium and natural beauty.", population: "~1,400" },
    { name: "Landfall", description: "Master-planned golf and waterfront community near Wrightsville Beach.", population: "~5,000" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-16">
        <div className="container mx-auto px-4">
          <Link href="/explore" className="text-purple-100 hover:text-white mb-4 inline-flex items-center gap-1">
            ← Back to Counties
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">🏙️ New Hanover County</h1>
          <p className="text-xl opacity-90">Urban Living, Beaches, Entertainment, and Cultural Hub</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-[#1e3a8a] mb-6">About New Hanover County</h2>
          <p className="text-gray-700 text-lg mb-4">
            New Hanover County is the cultural and commercial hub of Southeastern North Carolina. Anchored by Wilmington, the county offers everything from urban living and entertainment to world-class beaches and championship golf communities. Home to universities, hospitals, and film production, it's perfect for those seeking urban convenience with coastal access.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 bg-purple-50 p-6 rounded-lg">
            <div>
              <div className="text-2xl font-bold text-[#0ea5e9]">~230,000</div>
              <div className="text-gray-700 text-sm">Population</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#fbbf24]">~201 sq mi</div>
              <div className="text-gray-700 text-sm">Area</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1e3a8a]">0 min</div>
              <div className="text-gray-700 text-sm">To Center</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1e3a8a] mb-12 text-center">Key Communities</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {communities.map((community, idx) => (
              <div key={idx} className="p-6 bg-purple-50 border-2 border-purple-200 rounded-lg hover:shadow-lg transition-all">
                <MapPin className="w-5 h-5 text-[#0ea5e9] mb-3" />
                <h3 className="font-bold text-xl text-[#1e3a8a] mb-2">{community.name}</h3>
                <p className="text-gray-700 mb-3">{community.description}</p>
                <div className="text-sm text-gray-600">Population: {community.population}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Home in New Hanover County?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search" className="bg-[#fbbf24] text-[#1e3a8a] px-8 py-3 rounded-lg hover:opacity-90 font-bold">
              Search New Hanover Homes
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
