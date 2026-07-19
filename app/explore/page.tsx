'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { ChevronRight, MapPin, Users, Home, ShoppingCart, Briefcase, Heart } from 'lucide-react';

export default function ExplorePage() {
  const counties = [
    {
      name: "Onslow County",
      slug: "onslow",
      icon: "🌊",
      description: "Home to Jacksonville and Camp Lejeune, featuring beach communities like Swansboro and North Topsail Beach.",
      highlights: [
        "Jacksonville (county seat)",
        "Swansboro - charming historic town",
        "North Topsail Beach",
        "Sneads Ferry",
        "Richlands"
      ],
      lifestyle: "Military, Beach, Waterfront",
      population: "~186,000",
      image_accent: "from-blue-400 to-cyan-400"
    },
    {
      name: "Pender County",
      slug: "pender",
      icon: "🏖️",
      description: "Beach lifestyle with Surf City, Topsail Beach, and quiet communities like Hampstead and Burgaw.",
      highlights: [
        "Surf City",
        "Topsail Beach",
        "Hampstead - family-friendly",
        "Burgaw",
        "Rocky Point"
      ],
      lifestyle: "Beach, Family, Outdoor",
      population: "~52,000",
      image_accent: "from-amber-400 to-yellow-400"
    },
    {
      name: "New Hanover County",
      slug: "new-hanover",
      icon: "🏙️",
      description: "Urban and coastal living centered around Wilmington with Wrightsville Beach, Carolina Beach, and Kure Beach.",
      highlights: [
        "Wilmington - vibrant city",
        "Wrightsville Beach",
        "Carolina Beach",
        "Kure Beach",
        "Port City living"
      ],
      lifestyle: "Urban, Beach, Entertainment",
      population: "~230,000",
      image_accent: "from-purple-400 to-pink-400"
    },
    {
      name: "Brunswick County",
      slug: "brunswick",
      icon: "⛵",
      description: "Charming coastal towns including Southport, Oak Island, and Holden Beach with waterfront and golf opportunities.",
      highlights: [
        "Southport - historic charm",
        "Oak Island",
        "Holden Beach",
        "Ocean Isle Beach",
        "Golf communities"
      ],
      lifestyle: "Golf, Waterfront, Retirement",
      population: "~116,000",
      image_accent: "from-green-400 to-teal-400"
    },
    {
      name: "Columbus County",
      slug: "columbus",
      icon: "🌳",
      description: "Inland communities with Lake Waccamaw and rural living options including Whiteville and Tabor City.",
      highlights: [
        "Lake Waccamaw",
        "Whiteville - county seat",
        "Tabor City",
        "Chadbourn",
        "Rural & acreage"
      ],
      lifestyle: "Rural, Lake, Farming",
      population: "~~54,000",
      image_accent: "from-orange-400 to-red-400"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Southeastern North Carolina</h1>
            <p className="text-xl opacity-90">Discover the five counties that make up our service area</p>
          </div>
        </div>
      </section>

      {/* Counties Grid */}
      <section className="py-16 bg-white flex-1">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {counties.map((county) => (
              <Link
                key={county.slug}
                href={`/explore/${county.slug}`}
                className="group h-full"
              >
                <div className="h-full bg-white border-2 border-gray-200 hover:border-[#0ea5e9] rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col">
                  {/* Image Accent */}
                  <div className={`h-32 bg-gradient-to-br ${county.image_accent} opacity-80`}></div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-2">
                      <div className="text-4xl mb-2">{county.icon}</div>
                      <h2 className="text-2xl font-bold text-[#1e3a8a] group-hover:text-[#0ea5e9] transition-colors">{county.name}</h2>
                    </div>

                    <p className="text-gray-700 text-sm mb-4 flex-1">{county.description}</p>

                    {/* Key Stats */}
                    <div className="space-y-3 mb-4 text-sm">
                      <div className="flex items-start gap-2">
                        <Users size={16} className="text-[#0ea5e9] mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-[#1e3a8a]">Population</div>
                          <div className="text-gray-600">{county.population}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Heart size={16} className="text-[#fbbf24] mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-[#1e3a8a]">Lifestyle</div>
                          <div className="text-gray-600">{county.lifestyle}</div>
                        </div>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="mb-4">
                      <div className="font-medium text-[#1e3a8a] text-sm mb-2">Key Communities</div>
                      <div className="flex flex-wrap gap-2">
                        {county.highlights.slice(0, 3).map((highlight, idx) => (
                          <span key={idx} className="text-xs bg-[#0ea5e9]/10 text-[#0ea5e9] px-2 py-1 rounded">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-1 text-[#0ea5e9] font-medium text-sm group-hover:gap-2 transition-all">
                      Explore County <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-700 mb-6">Not sure where to start?</p>
            <Link
              href="/lifestyle"
              className="inline-block bg-[#fbbf24] text-[#1e3a8a] px-8 py-3 rounded-lg hover:bg-[#fcd34d] transition-colors font-medium shadow-md"
            >
              Find Your Lifestyle
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
