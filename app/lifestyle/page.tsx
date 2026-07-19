'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { ChevronRight, MapPin } from 'lucide-react';

export default function LifestylePage() {
  const lifestyles = [
    {
      slug: "beach",
      emoji: "🌊",
      name: "Beach Living",
      description: "Wake up to ocean views, enjoy sandy beaches, and embrace coastal culture.",
      counties: ["Pender", "New Hanover", "Brunswick"],
      features: ["Beach access", "Waterfront views", "Seafood restaurants", "Water sports"],
      bestFor: "Retirees, families seeking outdoor lifestyle"
    },
    {
      slug: "golf",
      emoji: "⛳",
      name: "Golf Communities",
      description: "Championship courses, resort amenities, and communities built around the game.",
      counties: ["Brunswick", "New Hanover"],
      features: ["18-hole courses", "Golf clubs", "Resort amenities", "Active lifestyle"],
      bestFor: "Golf enthusiasts, retirees"
    },
    {
      slug: "waterfront",
      emoji: "🚤",
      name: "Waterfront & Boating",
      description: "Direct water access for boating, fishing, and water recreation.",
      counties: ["Onslow", "Pender", "Brunswick"],
      features: ["Boat docks", "River access", "Fishing piers", "Waterfront dining"],
      bestFor: "Boaters, fishermen, water enthusiasts"
    },
    {
      slug: "historic",
      emoji: "🏛️",
      name: "Historic Downtown Living",
      description: "Charming downtowns with architecture, culture, and local community.",
      counties: ["Wilmington", "Southport", "Burgaw"],
      features: ["Historic homes", "Local culture", "Walkable streets", "Fine dining"],
      bestFor: "Culture seekers, urban dwellers"
    },
    {
      slug: "military",
      emoji: "🎖️",
      name: "Military Relocation",
      description: "Communities with military focus, base proximity, and military services.",
      counties: ["Onslow"],
      features: ["Base proximity", "Military services", "Family support", "Economy"],
      bestFor: "Military families, active duty, veterans"
    },
    {
      slug: "retirement",
      emoji: "🌅",
      name: "Retirement Living",
      description: "Communities designed for active retirement with amenities and services.",
      counties: ["Brunswick", "New Hanover"],
      features: ["55+ communities", "Golf access", "Healthcare", "Social clubs"],
      bestFor: "Retirees, empty nesters"
    },
    {
      slug: "new-construction",
      emoji: "🏗️",
      name: "New Construction",
      description: "Modern homes with latest features, energy efficiency, and warranties.",
      counties: ["Onslow", "Pender", "New Hanover"],
      features: ["Modern design", "Warranty", "Energy efficient", "Master planned"],
      bestFor: "Buyers wanting new, families"
    },
    {
      slug: "acreage",
      emoji: "🌳",
      name: "Acreage & Country Living",
      description: "Rural properties with land, privacy, and connection to nature.",
      counties: ["Columbus", "Onslow", "Pender"],
      features: ["Large lots", "Privacy", "Nature access", "Farming possible"],
      bestFor: "Families seeking space, nature lovers"
    },
    {
      slug: "investment",
      emoji: "💰",
      name: "Investment Properties",
      description: "Rental properties, fix-and-flip opportunities, and income-generating assets.",
      counties: ["All"],
      features: ["Rental income", "Appreciation", "Cash flow", "Portfolio building"],
      bestFor: "Investors, business owners"
    },
    {
      slug: "first-time",
      emoji: "🏠",
      name: "First-Time Buyers",
      description: "Affordable options, starter homes, and programs to help first-time buyers.",
      counties: ["All"],
      features: ["Affordable", "Starter homes", "FHA programs", "Buyer support"],
      bestFor: "First-time homebuyers, young families"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Header */}
      <section className="bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Lifestyle First</h1>
            <p className="text-xl opacity-90">
              Before choosing a home, choose how you want to live. We'll show you where to find it in Southeastern North Carolina.
            </p>
          </div>
        </div>
      </section>

      {/* Lifestyle Grid */}
      <section className="py-16 bg-white flex-1">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {lifestyles.map((lifestyle) => (
              <Link
                key={lifestyle.slug}
                href={`/lifestyle/${lifestyle.slug}`}
                className="group h-full"
              >
                <div className="h-full bg-white border-2 border-gray-200 hover:border-[#0ea5e9] rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col p-6">
                  {/* Emoji Header */}
                  <div className="text-6xl mb-4">{lifestyle.emoji}</div>

                  {/* Content */}
                  <h2 className="text-2xl font-bold text-[#1e3a8a] group-hover:text-[#0ea5e9] transition-colors mb-3">
                    {lifestyle.name}
                  </h2>
                  <p className="text-gray-700 text-sm flex-1 mb-4">{lifestyle.description}</p>

                  {/* Counties */}
                  <div className="mb-4">
                    <div className="text-xs font-medium text-[#1e3a8a] mb-2 uppercase">Available in</div>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(lifestyle.counties) && lifestyle.counties.map((county, idx) => (
                        <span key={idx} className="text-xs bg-[#0ea5e9]/10 text-[#0ea5e9] px-2 py-1 rounded">
                          {county}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="text-xs font-medium text-[#1e3a8a] mb-2 uppercase">Features</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {lifestyle.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-1">
                          <span className="text-[#fbbf24] mt-0.5">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best For */}
                  <div className="text-xs text-gray-600 mb-4">
                    <span className="font-medium text-[#1e3a8a]">Best for: </span>
                    {lifestyle.bestFor}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-1 text-[#0ea5e9] font-medium text-sm group-hover:gap-2 transition-all mt-auto">
                    Explore <ChevronRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-700 mb-6 text-lg">Found your lifestyle? Let's find your home.</p>
            <Link
              href="/search"
              className="inline-block bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium shadow-md"
            >
              Start Your Search
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
