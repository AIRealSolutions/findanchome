'use client';

import Link from 'next/link'
import { Search, Map, Heart, Home, DollarSign, Users, BookOpen, ChevronRight } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { useState } from 'react'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  // Five-county service area
  const counties = [
    {
      name: "Onslow County",
      description: "Home to Jacksonville and Camp Lejeune, featuring beach communities like Swansboro and North Topsail Beach.",
      slug: "onslow",
      icon: "🌊"
    },
    {
      name: "Pender County",
      description: "Beach lifestyle with Surf City, Topsail Beach, and quiet communities like Hampstead and Burgaw.",
      slug: "pender",
      icon: "🏖️"
    },
    {
      name: "New Hanover County",
      description: "Urban and coastal living centered around Wilmington with Wrightsville Beach, Carolina Beach, and Kure Beach.",
      slug: "new-hanover",
      icon: "🏙️"
    },
    {
      name: "Brunswick County",
      description: "Charming coastal towns including Southport, Oak Island, and Holden Beach with waterfront and golf opportunities.",
      slug: "brunswick",
      icon: "⛵"
    },
    {
      name: "Columbus County",
      description: "Inland communities with Lake Waccamaw and rural living options including Whiteville and Tabor City.",
      slug: "columbus",
      icon: "🌳"
    }
  ];

  // Lifestyle categories
  const lifestyles = [
    { name: "Beach Living", emoji: "🌊", slug: "beach" },
    { name: "Golf Communities", emoji: "⛳", slug: "golf" },
    { name: "Waterfront & Boating", emoji: "🚤", slug: "waterfront" },
    { name: "Historic Downtown", emoji: "🏛️", slug: "historic" },
    { name: "Military Relocation", emoji: "🎖️", slug: "military" },
    { name: "Retirement Living", emoji: "🌅", slug: "retirement" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-16 md:py-24">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Find Your Place in Southeastern North Carolina
            </h1>
            <p className="text-lg md:text-xl opacity-95 mb-8">
              From coastal communities and historic towns to golf neighborhoods, military relocation, and investment opportunities — FindaNChome.com helps you discover where you fit before you choose a home.
            </p>
          </div>

          {/* Property Search Bar */}
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
            <div className="flex gap-3 items-center">
              <Search className="text-white opacity-70" size={24} />
              <input
                type="text"
                placeholder="Search by city, county, or neighborhood..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
              />
              <Link
                href={`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}
                className="bg-[#fbbf24] text-[#1e3a8a] px-6 py-2 rounded-lg hover:bg-[#fcd34d] transition-colors font-medium whitespace-nowrap"
              >
                Search
              </Link>
            </div>
          </div>

          {/* Quick CTAs */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-center">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <Map size={18} />
              Explore Regions
            </Link>
            <Link
              href="/lifestyle"
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <Heart size={18} />
              Find Your Lifestyle
            </Link>
            <Link
              href="/hud"
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <Home size={18} />
              HUD Homes
            </Link>
          </div>
        </div>
      </section>

      {/* Five-County Service Area */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1e3a8a] mb-4">Discover Southeastern North Carolina</h2>
            <p className="text-gray-700 text-lg">Our five-county service area offers everything from coastal living to historic towns and rural communities.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {counties.map((county) => (
              <Link
                key={county.slug}
                href={`/explore/${county.slug}`}
                className="group p-6 bg-gradient-to-br from-[#0ea5e9]/5 to-[#fbbf24]/5 border-2 border-transparent hover:border-[#0ea5e9] rounded-lg transition-all hover:shadow-lg"
              >
                <div className="text-4xl mb-3">{county.icon}</div>
                <h3 className="font-bold text-xl text-[#1e3a8a] mb-2 group-hover:text-[#0ea5e9] transition-colors">{county.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{county.description}</p>
                <div className="mt-4 flex items-center gap-1 text-[#0ea5e9] font-medium text-sm">
                  Explore <ChevronRight size={16} />
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/explore"
              className="inline-block bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium shadow-md"
            >
              Explore All Communities
            </Link>
          </div>
        </div>
      </section>

      {/* Find Your Lifestyle */}
      <section className="py-16 bg-gradient-to-br from-[#1e3a8a]/5 via-[#0ea5e9]/5 to-[#fbbf24]/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1e3a8a] mb-4">Find Your Lifestyle First</h2>
            <p className="text-gray-700 text-lg">Choose how you want to live, and we'll show you where to find it in Southeastern NC.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {lifestyles.map((lifestyle) => (
              <Link
                key={lifestyle.slug}
                href={`/lifestyle/${lifestyle.slug}`}
                className="group p-8 bg-white rounded-lg border-2 border-transparent hover:border-[#0ea5e9] hover:shadow-lg transition-all text-center"
              >
                <div className="text-5xl mb-4">{lifestyle.emoji}</div>
                <h3 className="font-bold text-lg text-[#1e3a8a] group-hover:text-[#0ea5e9] transition-colors">{lifestyle.name}</h3>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/lifestyle"
              className="inline-block bg-[#fbbf24] text-[#1e3a8a] px-8 py-3 rounded-lg hover:bg-[#fcd34d] transition-colors font-medium shadow-md"
            >
              View All Lifestyles
            </Link>
          </div>
        </div>
      </section>

      {/* Why HUD Homes */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#1e3a8a] mb-4">Statewide HUD Buyer Representation</h2>
              <p className="text-gray-700 text-lg">Wherever a HUD opportunity appears in North Carolina, FindaNChome.com can help you understand the process and pursue the property with qualified representation.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Link
                href="/hud"
                className="p-6 bg-gradient-to-br from-[#0ea5e9]/10 to-[#fbbf24]/10 border-2 border-[#0ea5e9] rounded-lg hover:shadow-lg transition-all group"
              >
                <Home className="w-8 h-8 text-[#0ea5e9] mb-3" />
                <h3 className="font-bold text-xl text-[#1e3a8a] mb-2 group-hover:text-[#0ea5e9]">HUD Homes</h3>
                <p className="text-gray-700 mb-3">Government-owned properties throughout North Carolina at competitive prices.</p>
                <div className="flex items-center gap-1 text-[#0ea5e9] font-medium text-sm">
                  Browse HUD Homes <ChevronRight size={16} />
                </div>
              </Link>
              <Link
                href="/buyers"
                className="p-6 bg-gradient-to-br from-[#fbbf24]/10 to-[#1e3a8a]/10 border-2 border-[#fbbf24] rounded-lg hover:shadow-lg transition-all group"
              >
                <BookOpen className="w-8 h-8 text-[#fbbf24] mb-3" />
                <h3 className="font-bold text-xl text-[#1e3a8a] mb-2 group-hover:text-[#0ea5e9]">Buyer Resources</h3>
                <p className="text-gray-700 mb-3">Learn about financing, the HUD bidding process, and how to prepare your offer.</p>
                <div className="flex items-center gap-1 text-[#0ea5e9] font-medium text-sm">
                  Explore Resources <ChevronRight size={16} />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Home?</h2>
            <p className="text-xl mb-8 opacity-90">Let's start with understanding your lifestyle and needs.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/search"
                className="inline-block bg-[#fbbf24] text-[#1e3a8a] px-8 py-3 rounded-lg hover:bg-[#fcd34d] transition-colors font-bold shadow-lg"
              >
                Search Homes
              </Link>
              <Link
                href="/contact"
                className="inline-block bg-white/20 hover:bg-white/30 px-8 py-3 rounded-lg transition-colors font-bold border border-white/40"
              >
                Schedule a Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#1e3a8a] via-[#0c4a6e] to-[#1e3a8a] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-bold text-lg text-[#fbbf24] mb-4">FindaNChome.com</div>
              <p className="text-gray-300 text-sm">
                Your trusted guide to finding your perfect home in Southeastern North Carolina.
              </p>
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
  )
}
