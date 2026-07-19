'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { ChevronRight, MapPin, Briefcase, ShoppingCart, Home, Users } from 'lucide-react';

export default function OnslowPage() {
  const communities = [
    {
      name: "Jacksonville",
      description: "County seat and largest city, home to Camp Lejeune. Offers urban amenities with military family focus.",
      population: "~70,000"
    },
    {
      name: "Swansboro",
      description: "Historic coastal town with charming downtown, waterfront dining, and beach access.",
      population: "~2,500"
    },
    {
      name: "North Topsail Beach",
      description: "Quiet beach community perfect for families. Pristine beaches and residential neighborhoods.",
      population: "~1,200"
    },
    {
      name: "Sneads Ferry",
      description: "Small coastal village with beach access, fishing opportunities, and outdoor recreation.",
      population: "~2,000"
    },
    {
      name: "Richlands",
      description: "Inland community offering more affordable options with rural charm and local amenities.",
      population: "~1,000"
    }
  ];

  const lifestyle_highlights = [
    {
      icon: "🎖️",
      title: "Military-Friendly",
      description: "Home to Camp Lejeune, with abundant resources and community for military families."
    },
    {
      icon: "🌊",
      title: "Beach Access",
      description: "Multiple beach communities from Swansboro to North Topsail Beach."
    },
    {
      icon: "⛵",
      title: "Water Recreation",
      description: "Boating, fishing, and water sports throughout the county."
    },
    {
      icon: "👨‍👩‍👧‍👦",
      title: "Family Communities",
      description: "Schools, parks, and family-oriented neighborhoods."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-16">
        <div className="container mx-auto px-4">
          <Link href="/explore" className="text-blue-100 hover:text-white mb-4 inline-flex items-center gap-1">
            ← Back to Counties
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">🌊 Onslow County</h1>
          <p className="text-xl opacity-90">Home to Camp Lejeune, Beach Communities, and Military-Friendly Living</p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-[#1e3a8a] mb-6">About Onslow County</h2>
            <p className="text-gray-700 text-lg mb-4">
              Onslow County is a dynamic blend of military culture, beach lifestyle, and small-town charm. Home to the largest military installation on the East Coast, Camp Lejeune, the county offers excellent amenities and services for military families while maintaining beautiful coastal communities perfect for anyone seeking beach living.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 bg-blue-50 p-6 rounded-lg">
              <div>
                <div className="text-2xl font-bold text-[#0ea5e9]">~186,000</div>
                <div className="text-gray-700 text-sm">Population</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#fbbf24]">~745 sq mi</div>
                <div className="text-gray-700 text-sm">Area</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#1e3a8a]">20 min</div>
                <div className="text-gray-700 text-sm">to Wilmington</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lifestyle Highlights */}
      <section className="py-16 bg-gradient-to-br from-[#1e3a8a]/5 to-[#0ea5e9]/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1e3a8a] mb-12 text-center">What Makes Onslow County Special</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {lifestyle_highlights.map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#0ea5e9]">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-lg text-[#1e3a8a] mb-2">{item.title}</h3>
                <p className="text-gray-700">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Communities */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1e3a8a] mb-12 text-center">Key Communities</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {communities.map((community, idx) => (
              <Link
                key={idx}
                href={`/community/onslow/${community.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 hover:border-[#0ea5e9] rounded-lg hover:shadow-lg transition-all group"
              >
                <MapPin className="w-5 h-5 text-[#0ea5e9] mb-3" />
                <h3 className="font-bold text-xl text-[#1e3a8a] mb-2 group-hover:text-[#0ea5e9]">{community.name}</h3>
                <p className="text-gray-700 mb-3">{community.description}</p>
                <div className="text-sm text-gray-600">Population: {community.population}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Home in Onslow County?</h2>
          <p className="text-lg opacity-90 mb-8">Let's explore what's available and find the perfect fit for your lifestyle.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="bg-[#fbbf24] text-[#1e3a8a] px-8 py-3 rounded-lg hover:bg-[#fcd34d] transition-colors font-bold"
            >
              Search Onslow Homes
            </Link>
            <Link
              href="/contact"
              className="bg-white/20 hover:bg-white/30 px-8 py-3 rounded-lg transition-colors font-bold border border-white/40"
            >
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
                <Link href="/explore" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Counties</Link>
                <Link href="/lifestyle" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Lifestyles</Link>
                <Link href="/search" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Search Homes</Link>
              </div>
            </div>
            <div>
              <div className="font-bold mb-4 text-[#fbbf24]">Help</div>
              <div className="space-y-2 text-sm">
                <Link href="/buyers" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Buyers</Link>
                <Link href="/sellers" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Sellers</Link>
                <Link href="/hud" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">HUD Homes</Link>
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
