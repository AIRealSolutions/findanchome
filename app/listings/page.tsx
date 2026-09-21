'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { ChevronRight, MapPin, DollarSign, Home, Bed, Bath, Square } from 'lucide-react';
import { useState } from 'react';

export default function ListingsPage() {
  // Sample listings data - replace with Supabase data
  const [listings] = useState([
    {
      id: 1,
      address: '123 Beachfront Blvd',
      city: 'Wrightsville Beach',
      county: 'New Hanover',
      price: 650000,
      beds: 4,
      baths: 3,
      sqft: 2800,
      propertyType: 'Single Family',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=400&fit=crop',
      description: 'Beautiful oceanfront home with direct beach access',
      featured: true
    },
    {
      id: 2,
      address: '456 Oak Island Drive',
      city: 'Oak Island',
      county: 'Brunswick',
      price: 425000,
      beds: 3,
      baths: 2,
      sqft: 1950,
      propertyType: 'Condo',
      image: 'https://images.unsplash.com/photo-1570129477492-45ac003edd18?w=500&h=400&fit=crop',
      description: 'Golf community condo with resort amenities',
      featured: false
    },
    {
      id: 3,
      address: '789 Riverside Lane',
      city: 'Southport',
      county: 'Brunswick',
      price: 550000,
      beds: 4,
      baths: 2.5,
      sqft: 2400,
      propertyType: 'Single Family',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=400&fit=crop',
      description: 'Historic charm with modern updates',
      featured: true
    },
    {
      id: 4,
      address: '321 Topsail Circle',
      city: 'Topsail Beach',
      county: 'Pender',
      price: 375000,
      beds: 3,
      baths: 2,
      sqft: 1600,
      propertyType: 'Townhouse',
      image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&h=400&fit=crop',
      description: 'Cozy beach townhouse, perfect for families',
      featured: false
    },
    {
      id: 5,
      address: '654 Military Ridge',
      city: 'Jacksonville',
      county: 'Onslow',
      price: 325000,
      beds: 3,
      baths: 2,
      sqft: 1750,
      propertyType: 'Single Family',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=400&fit=crop',
      description: 'Military-friendly neighborhood, move-in ready',
      featured: false
    },
    {
      id: 6,
      address: '987 Lakeside Estate',
      city: 'Lake Waccamaw',
      county: 'Columbus',
      price: 275000,
      beds: 2,
      baths: 2,
      sqft: 1400,
      image: 'https://images.unsplash.com/photo-1490684902050-148aa06a86fa?w=500&h=400&fit=crop',
      propertyType: 'Single Family',
      description: 'Waterfront with lake views and dock',
      featured: false
    }
  ]);

  const [filters, setFilters] = useState({
    county: '',
    minPrice: '',
    maxPrice: '',
    beds: '',
    propertyType: '',
    searchTerm: ''
  });

  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  // Filter listings based on current filters
  const filteredListings = listings.filter(listing => {
    if (filters.county && listing.county !== filters.county) return false;
    if (filters.minPrice && listing.price < parseInt(filters.minPrice)) return false;
    if (filters.maxPrice && listing.price > parseInt(filters.maxPrice)) return false;
    if (filters.beds && listing.beds < parseInt(filters.beds)) return false;
    if (filters.propertyType && listing.propertyType !== filters.propertyType) return false;
    if (filters.searchTerm && !listing.address.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    return true;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Header */}
      <section className="bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Available Listings</h1>
          <p className="text-xl opacity-90">Browse homes for sale in Southeastern North Carolina</p>
        </div>
      </section>

      {/* Featured Listings */}
      {listings.filter(l => l.featured).length > 0 && (
        <section className="py-12 bg-[#1e3a8a]/5">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-[#1e3a8a] mb-8">Featured Listings</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
              {listings.filter(l => l.featured).map(listing => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all h-full flex flex-col">
                    <div className="relative overflow-hidden h-48 bg-gray-200">
                      <img
                        src={listing.image}
                        alt={listing.address}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-[#fbbf24] text-[#1e3a8a] px-3 py-1 rounded-full text-sm font-bold">
                        Featured
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-[#1e3a8a] group-hover:text-[#0ea5e9] mb-2 transition-colors">
                        {listing.address}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 flex items-center gap-1">
                        <MapPin size={16} className="text-[#0ea5e9]" />
                        {listing.city}, {listing.county} County
                      </p>
                      <p className="text-gray-700 text-sm mb-4 flex-1">{listing.description}</p>
                      <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-y border-gray-200">
                        <div className="text-center">
                          <Bed size={18} className="text-[#0ea5e9] mx-auto mb-1" />
                          <div className="text-lg font-bold text-[#1e3a8a]">{listing.beds}</div>
                          <div className="text-xs text-gray-600">Beds</div>
                        </div>
                        <div className="text-center">
                          <Bath size={18} className="text-[#0ea5e9] mx-auto mb-1" />
                          <div className="text-lg font-bold text-[#1e3a8a]">{listing.baths}</div>
                          <div className="text-xs text-gray-600">Baths</div>
                        </div>
                        <div className="text-center">
                          <Square size={18} className="text-[#0ea5e9] mx-auto mb-1" />
                          <div className="text-lg font-bold text-[#1e3a8a]">{listing.sqft.toLocaleString()}</div>
                          <div className="text-xs text-gray-600">Sq Ft</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-[#fbbf24]">{formatPrice(listing.price)}</div>
                        <ChevronRight size={20} className="text-[#0ea5e9] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filters and Search */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-[#1e3a8a]/5 to-[#0ea5e9]/5 p-8 rounded-lg border-2 border-[#0ea5e9]/20">
            <h2 className="text-2xl font-bold text-[#1e3a8a] mb-6">Search & Filter</h2>

            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by address..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent"
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
                  <option value="Onslow">Onslow County</option>
                  <option value="Pender">Pender County</option>
                  <option value="New Hanover">New Hanover County</option>
                  <option value="Brunswick">Brunswick County</option>
                  <option value="Columbus">Columbus County</option>
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
                  <option value="Single Family">Single Family</option>
                  <option value="Condo">Condo</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Land">Land</option>
                </select>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-[#1e3a8a] mb-2">
                  <Bed className="w-4 h-4 inline mr-2" />
                  Bedrooms
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent"
                  value={filters.beds}
                  onChange={(e) => setFilters({...filters, beds: e.target.value})}
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
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
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => setFilters({
                county: '',
                minPrice: '',
                maxPrice: '',
                beds: '',
                propertyType: '',
                searchTerm: ''
              })}
              className="text-[#0ea5e9] hover:text-[#1e3a8a] font-medium text-sm"
            >
              Clear All Filters
            </button>
          </div>
        </section>

        {/* Results */}
        <section className="py-12 bg-white flex-1">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#1e3a8a]">
                {filteredListings.length} {filteredListings.length === 1 ? 'Listing' : 'Listings'} Found
              </h2>
            </div>

            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map(listing => (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all h-full flex flex-col border-2 border-gray-200 hover:border-[#0ea5e9]">
                      <div className="relative overflow-hidden h-40 bg-gray-200">
                        <img
                          src={listing.image}
                          alt={listing.address}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-[#1e3a8a] group-hover:text-[#0ea5e9] mb-2 transition-colors text-sm">
                          {listing.address}
                        </h3>
                        <p className="text-gray-600 text-xs mb-3 flex items-center gap-1">
                          <MapPin size={14} className="text-[#0ea5e9]" />
                          {listing.city}, {listing.county} County
                        </p>
                        <div className="flex gap-3 mb-3 text-center text-xs">
                          <div className="flex-1">
                            <Bed size={14} className="text-[#0ea5e9] mx-auto mb-1" />
                            <div className="font-bold text-[#1e3a8a]">{listing.beds}</div>
                          </div>
                          <div className="flex-1">
                            <Bath size={14} className="text-[#0ea5e9] mx-auto mb-1" />
                            <div className="font-bold text-[#1e3a8a]">{listing.baths}</div>
                          </div>
                          <div className="flex-1">
                            <Square size={14} className="text-[#0ea5e9] mx-auto mb-1" />
                            <div className="font-bold text-[#1e3a8a]">{(listing.sqft / 1000).toFixed(1)}k</div>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-[#fbbf24] group-hover:text-[#fcd34d] transition-colors">
                          {formatPrice(listing.price)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-gray-200">
                <Home size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No listings found</h3>
                <p className="text-gray-600">Try adjusting your filters to see more results</p>
              </div>
            )}
          </div>
        </section>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Looking for something specific?</h2>
          <p className="text-lg opacity-90 mb-8">Let our team help you find your perfect home</p>
          <Link
            href="/contact"
            className="inline-block bg-[#fbbf24] text-[#1e3a8a] px-8 py-3 rounded-lg hover:bg-[#fcd34d] transition-colors font-bold"
          >
            Contact an Agent
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
                <Link href="/explore" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Counties</Link>
                <Link href="/listings" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Listings</Link>
                <Link href="/lifestyle" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Lifestyles</Link>
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
