import Link from 'next/link'
import { Search, Home, DollarSign, Users, BookOpen } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[oklch(55%_0.2_240)] rounded-full flex items-center justify-center text-white font-bold text-xl">
                L
              </div>
              <span className="font-bold text-xl">Lightkeeper Realty</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="hover:text-[oklch(55%_0.2_240)]">Home</Link>
              <Link href="/properties" className="hover:text-[oklch(55%_0.2_240)]">Properties</Link>
              <Link href="/communities" className="hover:text-[oklch(55%_0.2_240)]">Communities</Link>
              <Link href="/agents" className="hover:text-[oklch(55%_0.2_240)]">Agents</Link>
              <Link href="/education" className="hover:text-[oklch(55%_0.2_240)]">Education</Link>
              <Link href="/contact" className="hover:text-[oklch(55%_0.2_240)]">Contact</Link>
            </nav>
            <Link 
              href="/login"
              className="bg-[oklch(55%_0.2_240)] text-white px-4 py-2 rounded-lg hover:opacity-90"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[oklch(55%_0.2_240)] to-[oklch(45%_0.2_240)] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Find Your Dream Home in North Carolina
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Lightkeeper Realty - Your trusted HUD Buyer's Agency helping families find affordable homes for over 25 years.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-lg p-2 flex gap-2">
              <input
                type="text"
                placeholder="Search by city, ZIP, or address..."
                className="flex-1 px-4 py-3 text-black outline-none"
              />
              <button className="bg-[oklch(55%_0.2_240)] text-white px-8 py-3 rounded-lg hover:opacity-90 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12">
              <div>
                <div className="text-4xl font-bold">25+</div>
                <div className="opacity-80">Years Experience</div>
              </div>
              <div>
                <div className="text-4xl font-bold">1000+</div>
                <div className="opacity-80">Homes Sold</div>
              </div>
              <div>
                <div className="text-4xl font-bold">100%</div>
                <div className="opacity-80">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Affordable Home Programs
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Home className="w-12 h-12 text-[oklch(55%_0.2_240)] mb-4" />
              <h3 className="font-bold text-lg mb-2">HUD Homes</h3>
              <p className="text-gray-600">
                Government-owned properties with $100 down payment options
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <DollarSign className="w-12 h-12 text-[oklch(55%_0.2_240)] mb-4" />
              <h3 className="font-bold text-lg mb-2">REO Properties</h3>
              <p className="text-gray-600">
                Bank-owned homes at below-market prices
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Users className="w-12 h-12 text-[oklch(55%_0.2_240)] mb-4" />
              <h3 className="font-bold text-lg mb-2">VA & FHA</h3>
              <p className="text-gray-600">
                Special financing for veterans and first-time buyers
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <BookOpen className="w-12 h-12 text-[oklch(55%_0.2_240)] mb-4" />
              <h3 className="font-bold text-lg mb-2">Education</h3>
              <p className="text-gray-600">
                Free resources and guides for buyers and sellers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Placeholder */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Properties</h2>
          <p className="text-gray-600 mb-8">
            Properties will be loaded from Supabase database. Connect your database and add properties to see them here.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border rounded-lg overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="text-2xl font-bold text-[oklch(55%_0.2_240)] mb-2">$XXX,XXX</div>
                  <div className="font-semibold mb-2">Property Title</div>
                  <div className="text-sm text-gray-600">City, NC</div>
                  <div className="flex gap-4 mt-4 text-sm">
                    <span>X beds</span>
                    <span>X baths</span>
                    <span>X sqft</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="font-bold text-lg mb-4">Lightkeeper Realty</div>
              <p className="text-gray-400">
                Your trusted HUD Buyer's Agency in North Carolina
              </p>
            </div>
            <div>
              <div className="font-bold mb-4">Quick Links</div>
              <div className="space-y-2">
                <Link href="/properties" className="block text-gray-400 hover:text-white">Properties</Link>
                <Link href="/communities" className="block text-gray-400 hover:text-white">Communities</Link>
                <Link href="/agents" className="block text-gray-400 hover:text-white">Agents</Link>
              </div>
            </div>
            <div>
              <div className="font-bold mb-4">Resources</div>
              <div className="space-y-2">
                <Link href="/education" className="block text-gray-400 hover:text-white">Education Center</Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white">Contact Us</Link>
              </div>
            </div>
            <div>
              <div className="font-bold mb-4">Contact</div>
              <div className="text-gray-400 space-y-2">
                <div>Phone: (XXX) XXX-XXXX</div>
                <div>Email: info@lightkeeperrealty.com</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            © 2026 Lightkeeper Realty. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
