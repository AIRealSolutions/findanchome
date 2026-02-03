import Link from 'next/link'
import Image from 'next/image'
import BuyerPreferenceTool from '@/components/BuyerPreferenceTool'

export default function BuyerPreferencesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#1e3a8a] text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
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
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/properties" className="hover:text-[#fbbf24] transition-colors">Properties</Link>
              <Link href="/communities" className="hover:text-[#fbbf24] transition-colors">Communities</Link>
              <Link href="/agents" className="hover:text-[#fbbf24] transition-colors">Agents</Link>
              <Link href="/education" className="hover:text-[#fbbf24] transition-colors">Education</Link>
              <Link href="/contact" className="bg-[#fbbf24] text-[#1e3a8a] px-4 py-2 rounded-lg hover:bg-[#fcd34d] transition-colors font-medium">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Your Perfect Home
            </h1>
            <p className="text-xl opacity-90 mb-4">
              Tell us what you're looking for and we'll match you with properties that fit your needs
            </p>
            <p className="text-lg opacity-80">
              This quick 7-step questionnaire helps us understand your home buying preferences so we can provide personalized recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Buyer Preference Tool */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <BuyerPreferenceTool />
        </div>
      </section>

      {/* Why Use This Tool Section */}
      <section className="py-16 bg-gradient-to-br from-[#0ea5e9]/5 to-[#fbbf24]/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#1e3a8a]">
              Why Share Your Preferences?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#0ea5e9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#1e3a8a]">Personalized Matches</h3>
                <p className="text-gray-700 text-sm">
                  Receive property recommendations tailored specifically to your needs and preferences
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#fbbf24] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#1e3a8a]">Save Time</h3>
                <p className="text-gray-700 text-sm">
                  Skip browsing hundreds of listings - we'll send you only homes that match your criteria
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#1e3a8a] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🤝</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#1e3a8a]">Expert Guidance</h3>
                <p className="text-gray-700 text-sm">
                  Get connected with our team who specializes in your preferred programs and locations
                </p>
              </div>
            </div>
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
