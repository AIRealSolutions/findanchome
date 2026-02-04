import Link from 'next/link'
import Image from 'next/image'
import { Search, Home, DollarSign, Users, BookOpen, Phone, Mail, Facebook, Twitter } from 'lucide-react'
import HeroCarousel from '@/components/HeroCarousel'

export default function HomePage() {
  // Sample featured properties - will be replaced with IDX/database data
  const featuredProperties = [
    {
      id: 1,
      address: "955 Mt Pisgah Rd SW, Supply, NC",
      beds: 3,
      baths: 2.5,
      sqft: 4201,
      price: 624900,
      description: "+/- 2.5 acres with a pool, pool house, and outdoor kitchen. Over 4,000 sq ft with metal frame construction, 2 kitchens, and an ideal setup for multi-generational living.",
      image: "/placeholder-property.jpg"
    },
    {
      id: 2,
      address: "129 Cape Fear Drive, Southport, NC",
      beds: 3,
      baths: 2,
      sqft: 1441,
      price: 479000,
      description: "Classic brick home on a high, well-drained 1.5-lot site with majestic live oaks. Updated kitchen, 2-car carport, and large workshop.",
      image: "/placeholder-property.jpg"
    }
  ]

  const communities = [
    {
      name: "Asheville, NC",
      description: "Nestled in the Blue Ridge Mountains, Asheville offers vibrant arts, craft breweries, and stunning mountain views with four-season living.",
      slug: "asheville",
      region: "Mountains"
    },
    {
      name: "Boone & Blowing Rock",
      description: "High country living at its finest with ski resorts, hiking trails, and charming mountain towns. Perfect for outdoor enthusiasts.",
      slug: "boone",
      region: "Mountains"
    },
    {
      name: "Wilmington, NC",
      description: "A vibrant port city with riverwalk charm, film history, and a growing real estate market. Close to Wrightsville Beach and UNCW.",
      slug: "wilmington",
      region: "Coast"
    },
    {
      name: "Southport & Oak Island",
      description: "Charming coastal communities with historic downtown, beautiful beaches, and easy access to the Cape Fear River.",
      slug: "southport",
      region: "Coast"
    },
    {
      name: "Charlotte Metro",
      description: "North Carolina's largest city offers urban amenities, strong job market, and diverse neighborhoods from uptown to suburban communities.",
      slug: "charlotte",
      region: "Piedmont"
    },
    {
      name: "Raleigh-Durham-Chapel Hill",
      description: "The Research Triangle combines top universities, tech jobs, and excellent schools with diverse housing options and cultural attractions.",
      slug: "triangle",
      region: "Piedmont"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#1e3a8a] text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo and Site Name */}
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/lightkeeper-logo.jpg" 
                alt="Lightkeeper Realty Logo" 
                width={50} 
                height={50}
                className="object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold">FindaNChome.com</h1>
                <p className="text-xs opacity-90">From the Coast to the Mountains - Your NC Real Estate Connection</p>
              </div>
            </Link>
            
            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/properties" className="hover:text-[#fbbf24] transition-colors">Properties</Link>
              <Link href="/communities" className="hover:text-[#fbbf24] transition-colors">Communities</Link>
              <Link href="/sell" className="hover:text-[#fbbf24] transition-colors">Sell</Link>
              <Link href="/agents" className="hover:text-[#fbbf24] transition-colors">Agents</Link>
              <Link href="/education" className="hover:text-[#fbbf24] transition-colors">Education</Link>
              <Link href="/login" className="hover:text-[#fbbf24] transition-colors">Login</Link>
              <Link href="/contact" className="bg-[#fbbf24] text-[#1e3a8a] px-4 py-2 rounded-lg hover:bg-[#fcd34d] transition-colors font-medium">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Featured Properties */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#1e3a8a]">Featured Properties</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {featuredProperties.map((property) => (
              <div key={property.id} className="bg-white border-2 border-[#0ea5e9]/20 rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:border-[#0ea5e9] transition-all">
                <div className="h-64 bg-gradient-to-br from-[#0ea5e9]/10 to-[#fbbf24]/10"></div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-[#1e3a8a]">{property.address}</h3>
                  <div className="flex gap-4 text-sm text-gray-600 mb-3">
                    <span>{property.beds} Bed</span>
                    <span>|</span>
                    <span>{property.baths} Bath</span>
                    <span>|</span>
                    <span>{property.sqft.toLocaleString()} sq ft</span>
                  </div>
                  <div className="text-2xl font-bold text-[#0ea5e9] mb-3">
                    ${property.price.toLocaleString()}
                  </div>
                  <p className="text-gray-700 text-sm mb-4">{property.description}</p>
                  <div className="flex gap-3">
                    <Link 
                      href={`/property/${property.id}`}
                      className="flex-1 bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] text-white px-4 py-2 rounded text-center hover:opacity-90 transition-opacity"
                    >
                      View Details
                    </Link>
                    <Link 
                      href="/contact"
                      className="flex-1 border-2 border-[#0ea5e9] text-[#0ea5e9] px-4 py-2 rounded text-center hover:bg-[#0ea5e9] hover:text-white transition-colors"
                    >
                      Contact
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HUD Homes & REO Programs Section */}
      <section className="py-16 bg-gradient-to-br from-[#1e3a8a]/5 via-[#0ea5e9]/5 to-[#fbbf24]/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4 text-[#1e3a8a]">
              Affordable Home Opportunities
            </h2>
            <p className="text-center text-gray-700 mb-12 text-lg">
              Discover HUD homes, REO properties, and special financing programs designed to help you find your dream home.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* HUD Homes */}
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-[#0ea5e9] hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-[#0ea5e9] rounded-full flex items-center justify-center mb-4">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-[#1e3a8a]">HUD Homes</h3>
                <p className="text-gray-700 mb-4">
                  Government-owned properties available at competitive prices. Perfect for first-time buyers and investors.
                </p>
                <Link 
                  href="/properties?type=hud"
                  className="text-[#0ea5e9] font-medium hover:underline inline-flex items-center gap-1"
                >
                  Browse HUD Homes →
                </Link>
              </div>

              {/* REO Properties */}
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-[#fbbf24] hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-[#fbbf24] rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-[#1e3a8a]" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-[#1e3a8a]">REO Properties</h3>
                <p className="text-gray-700 mb-4">
                  Bank-owned real estate at below-market prices. Great opportunities for buyers seeking value.
                </p>
                <Link 
                  href="/properties?type=reo"
                  className="text-[#0ea5e9] font-medium hover:underline inline-flex items-center gap-1"
                >
                  View REO Listings →
                </Link>
              </div>

              {/* First-Time Buyer Programs */}
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-[#1e3a8a] hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-[#1e3a8a] rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-[#1e3a8a]">Buyer Programs</h3>
                <p className="text-gray-700 mb-4">
                  Learn about FHA, VA, USDA loans, and down payment assistance programs available to you.
                </p>
                <Link 
                  href="/education/financing"
                  className="text-[#0ea5e9] font-medium hover:underline inline-flex items-center gap-1"
                >
                  Explore Financing Options →
                </Link>
              </div>
            </div>

            <div className="mt-12 bg-white p-8 rounded-lg shadow-lg text-center">
              <h3 className="text-2xl font-bold mb-4 text-[#1e3a8a]">
                Why Choose Lightkeeper Realty for HUD Homes?
              </h3>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                As a specialized HUD Buyer's Agency, we guide you through every step of purchasing government-owned properties. 
                From finding the right home to navigating the bidding process, we're here to help you succeed.
              </p>
              <Link 
                href="/contact"
                className="inline-block bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] text-white px-8 py-3 rounded-lg hover:opacity-90 font-medium transition-opacity shadow-md"
              >
                Get Started Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Buyer Preference Tool CTA */}
      <section className="py-16 bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Find Your Perfect NC Home
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Tell us what you're looking for and we'll match you with properties that fit your needs and budget.
            </p>
            <Link 
              href="/education/buyer-preferences"
              className="inline-block bg-[#fbbf24] text-[#1e3a8a] px-8 py-4 rounded-lg hover:bg-[#fcd34d] transition-colors font-bold text-lg shadow-lg"
            >
              Start Your Home Search →
            </Link>
            <p className="text-sm mt-4 opacity-80">
              Quick 7-step questionnaire • Get personalized recommendations • Free consultation
            </p>
          </div>
        </div>
      </section>

      {/* Communities Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-[#1e3a8a]">Explore Communities Across North Carolina</h2>
          <p className="text-center text-gray-700 mb-12 text-lg">From the mountains to the coast, we serve communities throughout the state</p>
          <div className="grid md:grid-cols-3 gap-6">
            {communities.map((community) => (
              <div key={community.slug} className="bg-gradient-to-br from-[#0ea5e9]/5 to-[#fbbf24]/5 p-6 rounded-lg border-2 border-transparent hover:border-[#0ea5e9] transition-all">
                <h3 className="font-bold text-xl mb-3 text-[#1e3a8a]">{community.name}</h3>
                <p className="text-gray-700 mb-4">{community.description}</p>
                <Link 
                  href={`/communities/${community.slug}`}
                  className="text-[#0ea5e9] font-medium hover:underline inline-flex items-center gap-1"
                >
                  Explore {community.name.split(',')[0]} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Sharing */}
      <section className="py-8 bg-gradient-to-r from-[#1e3a8a]/5 via-[#0ea5e9]/5 to-[#fbbf24]/5 border-t-2 border-[#0ea5e9]/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-700 mb-4 font-medium">Share FindAnCHome.com</p>
          <div className="flex justify-center gap-4">
            <a 
              href="https://www.facebook.com/sharer/sharer.php?u=https://findanchome.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Facebook className="w-5 h-5" />
              Share on Facebook
            </a>
            <a 
              href="https://twitter.com/intent/tweet?url=https://findanchome.com&text=Check%20out%20FindAnCHome.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors shadow-md"
            >
              <Twitter className="w-5 h-5" />
              Tweet This
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#1e3a8a] via-[#0c4a6e] to-[#1e3a8a] text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image 
                  src="/lightkeeper-logo.jpg" 
                  alt="Lightkeeper Realty Logo" 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
                <div className="font-bold text-lg">Lightkeeper Realty</div>
              </div>
              <p className="text-gray-300">
                Your trusted HUD Buyer's Agency in North Carolina
              </p>
            </div>
            <div>
              <div className="font-bold mb-4 text-[#fbbf24]">Quick Links</div>
              <div className="space-y-2">
                <Link href="/properties" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Properties</Link>
                <Link href="/communities" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Communities</Link>
                <Link href="/agents" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Agents</Link>
              </div>
            </div>
            <div>
              <div className="font-bold mb-4 text-[#fbbf24]">Resources</div>
              <div className="space-y-2">
                <Link href="/education" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Education Center</Link>
                <Link href="/contact" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Contact Us</Link>
              </div>
            </div>
            <div>
              <div className="font-bold mb-4 text-[#fbbf24]">Contact</div>
              <div className="text-gray-300 space-y-2">
                <div>Phone: (910) 363-6147</div>
                <div>Email: marcspencer28461@gmail.com</div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#0ea5e9]/30 mt-8 pt-8 text-center text-gray-300">
            © 2026 Lightkeeper Realty. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
