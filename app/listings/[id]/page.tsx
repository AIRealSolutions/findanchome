'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { ChevronLeft, MapPin, DollarSign, Bed, Bath, Square, Heart, Share2, Phone, Mail } from 'lucide-react';
import { useState } from 'react';

// Sample listings data - replace with Supabase query
const LISTINGS_DATA = [
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
    yearBuilt: 2015,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&h=800&fit=crop',
    ],
    description: 'Beautiful oceanfront home with direct beach access and stunning views. Completely renovated with modern amenities while maintaining coastal charm.',
    features: [
      'Direct Beach Access',
      'Ocean Views',
      'Renovated Kitchen',
      'Master Suite with Spa Bathroom',
      'Multiple Decks',
      'Garage',
      'Hardwood Floors',
      'Fireplace'
    ],
    details: [
      { label: 'Year Built', value: '2015' },
      { label: 'Property Type', value: 'Single Family' },
      { label: 'Lot Size', value: '0.5 acres' },
      { label: 'Stories', value: '2' },
      { label: 'Garage', value: '2-car' },
      { label: 'HOA Fee', value: '$350/month' }
    ],
    fullDescription: `
      Welcome to this exceptional oceanfront property in Wrightsville Beach. This stunning 4-bedroom, 3-bathroom home offers the perfect blend of coastal living and modern luxury.

      The home features beautiful hardwood floors throughout, a completely renovated gourmet kitchen with granite countertops and stainless steel appliances, and multiple living spaces perfect for entertaining. The master suite is a true retreat with spa-like bathroom including a soaking tub and separate shower.

      With direct beach access and panoramic ocean views, this property is perfect for your dream beach getaway or investment opportunity. Multiple decks provide the ideal space for enjoying the coastal breeze and stunning sunsets.

      Located in one of North Carolina's most desirable beach communities, you'll enjoy excellent schools, world-class dining, and endless recreational opportunities.
    `,
    agentName: 'Marc Spencer',
    agentPhone: '(910) 363-6147',
    agentEmail: 'marcspencer28461@gmail.com'
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
    yearBuilt: 2012,
    image: 'https://images.unsplash.com/photo-1570129477492-45ac003edd18?w=1000&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1570129477492-45ac003edd18?w=1000&h=800&fit=crop',
      'https://images.unsplash.com/photo-1570129477492-45ac003edd18?w=1000&h=800&fit=crop',
    ],
    description: 'Golf community condo with resort amenities and excellent investment potential.',
    features: [
      'Golf Course Views',
      'Pool Access',
      'Fitness Center',
      'Clubhouse',
      'Updated Kitchen',
      'Balcony',
      'Parking'
    ],
    details: [
      { label: 'Year Built', value: '2012' },
      { label: 'Property Type', value: 'Condo' },
      { label: 'HOA Fee', value: '$280/month' },
      { label: 'Parking', value: 'Covered' },
      { label: 'Pet Policy', value: 'Allowed' }
    ],
    fullDescription: `
      Enjoy the perfect golf course lifestyle in this beautiful Oak Island condo. This 3-bedroom, 2-bathroom home is located in a premier golf community with excellent amenities.

      The property has been well-maintained and updated with modern finishes. It offers a great location within the community with views of the golf course and walking distance to all amenities.

      Community amenities include an 18-hole championship golf course, resort-style pool, fitness center, and clubhouse. Perfect for golf enthusiasts or anyone looking for an active retirement or vacation lifestyle.
    `,
    agentName: 'Marc Spencer',
    agentPhone: '(910) 363-6147',
    agentEmail: 'marcspencer28461@gmail.com'
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
    yearBuilt: 1998,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1000&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1000&h=800&fit=crop',
    ],
    description: 'Historic charm with modern updates and riverfront views.',
    features: [
      'Riverfront Views',
      'Renovated',
      'Mature Landscaping',
      'Brick Exterior',
      'Spacious Deck',
      'Detached Garage',
      'Storage Building'
    ],
    details: [
      { label: 'Year Built', value: '1998' },
      { label: 'Property Type', value: 'Single Family' },
      { label: 'Lot Size', value: '1.2 acres' },
      { label: 'Garage', value: 'Detached 2-car' },
      { label: 'Stories', value: '2' }
    ],
    fullDescription: `
      This charming Southport home combines historic appeal with modern updates. Located on a beautiful 1.2-acre lot with mature landscaping and riverfront views.

      The home features 4 spacious bedrooms, 2.5 bathrooms, and an open floor plan that has been updated while preserving the home's original character. The kitchen has been renovated with new appliances and countertops.

      Perfect for those seeking the charm of historic Southport with the comfort of modern amenities. Close to downtown shops, restaurants, and the Cape Fear River.
    `,
    agentName: 'Marc Spencer',
    agentPhone: '(910) 363-6147',
    agentEmail: 'marcspencer28461@gmail.com'
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
    yearBuilt: 2018,
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1000&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1000&h=800&fit=crop',
    ],
    description: 'Cozy beach townhouse, perfect for families and vacation rentals.',
    features: [
      'Beach Community',
      'Modern Updates',
      'Low Maintenance',
      'Outdoor Shower',
      'Patio',
      'Furnished Option',
      'Vacation Rental Income'
    ],
    details: [
      { label: 'Year Built', value: '2018' },
      { label: 'Property Type', value: 'Townhouse' },
      { label: 'Stories', value: '3' },
      { label: 'HOA Fee', value: '$220/month' }
    ],
    fullDescription: `
      Welcome to this delightful 3-bedroom townhouse in the heart of Topsail Beach. This recently built property is perfect for families, couples, or investors looking for vacation rental income.

      The townhouse features modern finishes throughout, an open floor plan, and all the amenities you need for beach living. An outdoor shower and covered patio are perfect for enjoying the coastal breeze.

      Located in a family-friendly beach community with easy beach access, walkable to shops and restaurants, and excellent schools nearby. The potential for vacation rental income makes this an attractive investment property.
    `,
    agentName: 'Marc Spencer',
    agentPhone: '(910) 363-6147',
    agentEmail: 'marcspencer28461@gmail.com'
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
    yearBuilt: 2010,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000&h=800&fit=crop',
    ],
    description: 'Military-friendly neighborhood, move-in ready with excellent schools.',
    features: [
      'Move-In Ready',
      'Updated Systems',
      'Open Floor Plan',
      'Large Yard',
      'Mature Trees',
      'Fenced Yard',
      'Near Base'
    ],
    details: [
      { label: 'Year Built', value: '2010' },
      { label: 'Property Type', value: 'Single Family' },
      { label: 'Lot Size', value: '0.75 acres' },
      { label: 'Garage', value: '2-car attached' }
    ],
    fullDescription: `
      This wonderful 3-bedroom, 2-bathroom home in Jacksonville is perfectly located for military families and everyone else. The home is move-in ready with updated systems and modern finishes.

      The open floor plan is great for family living, and the large, fenced backyard with mature trees provides the perfect space for kids and pets to play. Close to excellent schools, shopping, and military base facilities.

      Whether you're relocating or looking for a solid residential investment, this home offers great value in a family-friendly neighborhood.
    `,
    agentName: 'Marc Spencer',
    agentPhone: '(910) 363-6147',
    agentEmail: 'marcspencer28461@gmail.com'
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
    propertyType: 'Single Family',
    yearBuilt: 2008,
    image: 'https://images.unsplash.com/photo-1490684902050-148aa06a86fa?w=1000&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1490684902050-148aa06a86fa?w=1000&h=800&fit=crop',
    ],
    description: 'Waterfront with lake views and private dock for water enthusiasts.',
    features: [
      'Waterfront',
      'Private Dock',
      'Lake Views',
      'Wrap-Around Porch',
      'Updated Interior',
      'Peaceful Setting',
      'Recreation Access'
    ],
    details: [
      { label: 'Year Built', value: '2008' },
      { label: 'Property Type', value: 'Single Family' },
      { label: 'Lot Size', value: '1 acre waterfront' },
      { label: 'Dock', value: 'Private' }
    ],
    fullDescription: `
      Experience lakeside living at its finest in this charming 2-bedroom, 2-bathroom home on Lake Waccamaw. The property features a private dock perfect for boating, fishing, and water activities.

      The home boasts beautiful lake views from a wrap-around porch, an updated interior, and peaceful natural surroundings. The 1-acre waterfront lot provides plenty of space to enjoy outdoor activities and nature.

      Lake Waccamaw is known for its pristine waters and outdoor recreation opportunities. Perfect for those seeking a quiet, natural lifestyle away from the hustle and bustle of city living.
    `,
    agentName: 'Marc Spencer',
    agentPhone: '(910) 363-6147',
    agentEmail: 'marcspencer28461@gmail.com'
  }
];

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = LISTINGS_DATA.find(l => l.id === parseInt(params.id));
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <section className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#1e3a8a] mb-2">Listing Not Found</h1>
            <p className="text-gray-600 mb-6">The listing you're looking for doesn't exist.</p>
            <Link href="/listings" className="text-[#0ea5e9] hover:text-[#1e3a8a] font-medium">
              Back to Listings
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />

      {/* Header with Back Button */}
      <section className="bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-6">
        <div className="container mx-auto px-4">
          <Link
            href="/listings"
            className="flex items-center gap-2 text-blue-100 hover:text-white mb-4 inline-flex"
          >
            <ChevronLeft size={20} />
            Back to Listings
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">{listing.address}</h1>
          <p className="text-blue-100 mt-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            {listing.city}, {listing.county} County
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Gallery */}
            <div className="mb-8">
              <div className="relative mb-4 overflow-hidden rounded-lg h-96 bg-gray-200">
                <img
                  src={listing.images[selectedImage]}
                  alt={`${listing.address} - Image ${selectedImage + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {listing.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {listing.images.map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`rounded-lg overflow-hidden h-20 border-2 transition-all ${
                        selectedImage === idx ? 'border-[#0ea5e9]' : 'border-gray-300 hover:border-[#0ea5e9]'
                      }`}
                    >
                      <img src={image} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Key Details */}
            <div className="bg-[#1e3a8a]/5 p-6 rounded-lg border-2 border-[#0ea5e9]/20 mb-8">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <Bed size={24} className="text-[#0ea5e9] mx-auto mb-2" />
                  <div className="text-lg font-bold text-[#1e3a8a]">{listing.beds}</div>
                  <div className="text-xs text-gray-600">Bedrooms</div>
                </div>
                <div>
                  <Bath size={24} className="text-[#0ea5e9] mx-auto mb-2" />
                  <div className="text-lg font-bold text-[#1e3a8a]">{listing.baths}</div>
                  <div className="text-xs text-gray-600">Bathrooms</div>
                </div>
                <div>
                  <Square size={24} className="text-[#0ea5e9] mx-auto mb-2" />
                  <div className="text-lg font-bold text-[#1e3a8a]">{listing.sqft.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Sq Ft</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#fbbf24] mb-2">📅</div>
                  <div className="text-lg font-bold text-[#1e3a8a]">{listing.yearBuilt}</div>
                  <div className="text-xs text-gray-600">Year Built</div>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="mb-8">
              <div className="text-4xl font-bold text-[#fbbf24] mb-2">{formatPrice(listing.price)}</div>
              <div className="text-xl text-[#1e3a8a] font-semibold">{listing.propertyType}</div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#1e3a8a] mb-4">About This Home</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{listing.fullDescription}</p>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#1e3a8a] mb-4">Property Features</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {listing.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-[#0ea5e9]/10 rounded-lg">
                    <div className="w-5 h-5 rounded-full bg-[#0ea5e9] flex items-center justify-center text-white text-xs">✓</div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#1e3a8a] mb-4">Property Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {listing.details.map((detail, idx) => (
                  <div key={idx} className="border-b border-gray-200 pb-3">
                    <div className="text-sm text-gray-600 font-medium">{detail.label}</div>
                    <div className="text-lg text-[#1e3a8a] font-bold">{detail.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Agent Contact */}
            <div className="bg-gradient-to-br from-[#1e3a8a] to-[#0ea5e9] text-white p-8 rounded-lg shadow-lg mb-6 sticky top-4">
              <h3 className="text-xl font-bold mb-6">Contact Agent</h3>

              <div className="mb-6">
                <div className="text-3xl mb-2">🏘️</div>
                <div className="font-semibold text-lg">{listing.agentName}</div>
              </div>

              <div className="space-y-4">
                <a
                  href={`tel:${listing.agentPhone}`}
                  className="flex items-center gap-3 bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors"
                >
                  <Phone size={20} />
                  <span className="text-sm">{listing.agentPhone}</span>
                </a>
                <a
                  href={`mailto:${listing.agentEmail}`}
                  className="flex items-center gap-3 bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors"
                >
                  <Mail size={20} />
                  <span className="text-sm">{listing.agentEmail}</span>
                </a>
              </div>

              <button className="w-full mt-6 bg-[#fbbf24] text-[#1e3a8a] font-bold py-3 rounded-lg hover:bg-[#fcd34d] transition-colors">
                Schedule Showing
              </button>
            </div>

            {/* Save & Share */}
            <div className="space-y-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  isFavorite
                    ? 'bg-[#fbbf24] text-[#1e3a8a] hover:bg-[#fcd34d]'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                {isFavorite ? 'Saved' : 'Save Listing'}
              </button>
              <button className="w-full py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all flex items-center justify-center gap-2">
                <Share2 size={20} />
                Share Listing
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-[#0ea5e9] p-6 rounded-lg mt-6">
              <h4 className="font-bold text-[#1e3a8a] mb-2">Questions?</h4>
              <p className="text-sm text-gray-700 mb-4">
                Our real estate expert is ready to help you find the perfect home or answer any questions about this property.
              </p>
              <Link
                href="/contact"
                className="text-[#0ea5e9] font-medium text-sm hover:text-[#1e3a8a]"
              >
                Get in Touch →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Listings */}
      <section className="py-12 bg-[#1e3a8a]/5 mt-8">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1e3a8a] mb-8">Similar Properties</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {LISTINGS_DATA.filter(l => l.id !== listing.id && l.county === listing.county).slice(0, 3).map(sim => (
              <Link key={sim.id} href={`/listings/${sim.id}`} className="group">
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all border-2 border-gray-200 hover:border-[#0ea5e9] h-full flex flex-col">
                  <div className="relative overflow-hidden h-40 bg-gray-200">
                    <img
                      src={sim.image}
                      alt={sim.address}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-[#1e3a8a] group-hover:text-[#0ea5e9] mb-1 transition-colors">
                      {sim.address}
                    </h3>
                    <p className="text-gray-600 text-xs mb-3">{sim.city}, {sim.county} County</p>
                    <div className="text-lg font-bold text-[#fbbf24] group-hover:text-[#fcd34d] transition-colors">
                      {formatPrice(sim.price)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#1e3a8a] via-[#0c4a6e] to-[#1e3a8a] text-white py-12 mt-12">
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
