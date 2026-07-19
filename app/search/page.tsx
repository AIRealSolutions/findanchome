'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Search, MapPin, DollarSign, Home } from 'lucide-react';
import { useState } from 'react';

export default function SearchPage() {
  const [filters, setFilters] = useState({
    county: '',
    minPrice: '',
    maxPrice: '',
    beds: '',
    propertyType: ''
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Header */}
      <section className="bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Search Homes in Southeastern North Carolina</h1>
          <p className="text-xl opacity-90">Find your perfect home with our advanced search tools</p>
        </div>
      </section>

      {/* Search Form */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-gradient-to-br from-[#1e3a8a]/5 to-[#0ea5e9]/5 p-8 rounded-lg border-2 border-[#0ea5e9]/20">
            <h2 className="text-2xl font-bold text-[#1e3a8a] mb-6">Refine Your Search</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* County */}
              <div>
                <label className="block text-sm font-medium text-[#1e3a8a] mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  County
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent"
                  value={filters.county}
                  onChange={(e) => setFilters({...filters, county: e.target.value})}
                >
                  <option value="">All Counties</option>
                  <option value="onslow">Onslow County</option>
                  <option value="pender">Pender County</option>
                  <option value="new-hanover">New Hanover County</option>
                  <option value="brunswick">Brunswick County</option>
                  <option value="columbus">Columbus County</option>
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-[#1e3a8a] mb-2">
                  <Home className="w-4 h-4 inline mr-2" />
                  Property Type
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent"
                  value={filters.propertyType}
                  onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                >
                  <option value="">All Types</option>
                  <option value="single">Single Family</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="land">Land</option>
                  <option value="farm">Farm/Acreage</option>
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm font-medium text-[#1e3a8a] mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Min Price
                </label>
                <input
                  type="number"
                  placeholder="No minimum"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-[#1e3a8a] mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Max Price
                </label>
                <input
                  type="number"
                  placeholder="No maximum"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                />
              </div>

              {/* Bedrooms */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#1e3a8a] mb-2">Bedrooms</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent"
                  value={filters.beds}
                  onChange={(e) => setFilters({...filters, beds: e.target.value})}
                >
                  <option value="">Any</option>
                  <option value="1">1+ Bedroom</option>
                  <option value="2">2+ Bedrooms</option>
                  <option value="3">3+ Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                </select>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] text-white py-3 rounded-lg hover:opacity-90 font-bold flex items-center justify-center gap-2 transition-opacity">
              <Search size={20} />
              Search Homes
            </button>

            <p className="text-sm text-gray-600 text-center mt-4">
              Homes are pulled from MLS data and updated daily
            </p>
          </div>

          {/* Info Boxes */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg border-l-4 border-[#0ea5e9] shadow-sm">
              <h3 className="font-bold text-[#1e3a8a] mb-2">Advanced Filters</h3>
              <p className="text-gray-700 text-sm">Filter by waterfront, golf communities, new construction, and more.</p>
            </div>
            <div className="bg-white p-6 rounded-lg border-l-4 border-[#fbbf24] shadow-sm">
              <h3 className="font-bold text-[#1e3a8a] mb-2">Save Your Search</h3>
              <p className="text-gray-700 text-sm">Save searches and get alerts when new homes match your criteria.</p>
            </div>
            <div className="bg-white p-6 rounded-lg border-l-4 border-[#0ea5e9] shadow-sm">
              <h3 className="font-bold text-[#1e3a8a] mb-2">Get Expert Help</h3>
              <p className="text-gray-700 text-sm">Chat with Marc about your search or schedule a consultation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Not Sure Where to Start?</h2>
          <p className="text-lg opacity-90 mb-6">Let's find your lifestyle first, then your perfect home.</p>
          <Link
            href="/lifestyle"
            className="inline-block bg-[#fbbf24] text-[#1e3a8a] px-8 py-3 rounded-lg hover:bg-[#fcd34d] font-bold transition-colors"
          >
            Explore Your Lifestyle
          </Link>
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
