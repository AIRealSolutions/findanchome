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
      name: "Southport, NC",
      description: "Charming and historic, Southport is the heart of coastal living. Stroll through oak-lined streets and vibrant waterfront shops.",
      slug: "southport"
    },
    {
      name: "Wilmington, NC",
      description: "A vibrant port city with riverwalk charm, film history, and a growing real estate market. Close to Wrightsville Beach and UNCW.",
      slug: "wilmington"
    },
    {
      name: "Oak Island & Caswell Beach",
      description: "Family-friendly and laid-back, with miles of beaches and easy access to the Cape Fear River. Great for full-time or vacation living.",
      slug: "oak-island"
    },
    {
      name: "Shallotte & Ocean Isle Beach",
      description: "Convenient shopping and coastal escapes meet here. A growing hub between Wilmington and Myrtle Beach.",
      slug: "shallotte"
    },
    {
      name: "Leland, NC",
      description: "Just outside Wilmington, Leland is booming with new neighborhoods and amenities perfect for commuters and families.",
      slug: "leland"
    },
    {
      name: "Carolina & Wrightsville Beach",
      description: "Your destination for surfing, boating, and beachfront living with strong year-round and seasonal housing appeal.",
      slug: "beach-life"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Coastal Colors */}
      <header className="bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#fbbf24] text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center py-6">
            <Link href="/" className="flex items-center gap-3 mb-2">
              <Image 
                src="/lightkeeper-logo.jpg" 
                alt="Lightkeeper Realty Logo" 
                width={70} 
                height={70}
                className="object-contain drop-shadow-lg"
              />
            </Link>
            <h1 className="text-4xl font-bold drop-shadow-md bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">
              FindAnCHome.com
            </h1>
            <p className="text-sm opacity-90 mt-1 drop-shadow">Where Coastal Carolina Living Begins</p>
            <p className="text-xs mt-2 bg-white/20 px-4 py-1 rounded-full backdrop-blur-sm">
              Presented by Marc Spencer, Lightkeeper Realty
            </p>
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

      {/* Contact Form Section */}
      <section className="py-16 bg-gradient-to-br from-[#0ea5e9]/5 to-[#fbbf24]/5">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#1e3a8a]">Schedule a Private Tour</h2>
          <form className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-[#0ea5e9] space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-[#1e3a8a]">Name</label>
              <input 
                type="text" 
                id="name"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-[#1e3a8a]">Email</label>
              <input 
                type="email" 
                id="email"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2 text-[#1e3a8a]">Phone Number</label>
              <input 
                type="tel" 
                id="phone"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2 text-[#1e3a8a]">Message</label>
              <textarea 
                id="message"
                rows={4}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none transition-all"
              ></textarea>
            </div>
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] text-white px-6 py-3 rounded-lg hover:opacity-90 font-medium transition-opacity shadow-md"
            >
              Submit
            </button>
          </form>
          <div className="text-center mt-8 space-y-2">
            <p className="text-gray-700">
              Call or text Marc Spencer at <a href="tel:9103636147" className="text-[#0ea5e9] font-bold hover:underline">(910) 363-6147</a>
            </p>
            <p className="text-gray-700">
              or email <a href="mailto:marcspencer28461@gmail.com" className="text-[#0ea5e9] hover:underline">marcspencer28461@gmail.com</a>
            </p>
          </div>
        </div>
      </section>

      {/* Communities Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#1e3a8a]">Explore Communities We Serve</h2>
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
