import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, DollarSign, Home, Users, TrendingUp, FileText } from 'lucide-react'

export default function EducationPage() {
  const resources = [
    {
      icon: <Home className="w-8 h-8" />,
      title: "Buyer Preference Tool",
      description: "Tell us what you're looking for and get personalized property recommendations matched to your needs.",
      link: "/education/buyer-preferences",
      color: "bg-[#0ea5e9]",
      featured: true
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Financing Options",
      description: "Learn about FHA, VA, USDA loans, and down payment assistance programs available to NC home buyers.",
      link: "/education/financing",
      color: "bg-[#fbbf24]"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "HUD Home Buying Guide",
      description: "Everything you need to know about purchasing HUD homes, from bidding to closing.",
      link: "/education/hud-guide",
      color: "bg-[#1e3a8a]"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "First-Time Buyer Resources",
      description: "Step-by-step guidance for first-time home buyers in North Carolina.",
      link: "/education/first-time-buyers",
      color: "bg-[#0ea5e9]"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "NC Market Insights",
      description: "Current market trends, pricing data, and neighborhood information across North Carolina.",
      link: "/education/market-insights",
      color: "bg-[#fbbf24]"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Home Buying Checklist",
      description: "A comprehensive checklist to guide you through every step of the home buying process.",
      link: "/education/checklist",
      color: "bg-[#1e3a8a]"
    }
  ]

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
      <section className="bg-gradient-to-br from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Home Buyer Education Center
            </h1>
            <p className="text-xl opacity-90">
              Everything you need to know about buying a home in North Carolina. From financing options to market insights, we're here to guide you every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {resources.map((resource, index) => (
              <Link 
                key={index}
                href={resource.link}
                className={`bg-white p-6 rounded-lg shadow-lg border-t-4 ${
                  resource.featured 
                    ? 'border-[#fbbf24] ring-2 ring-[#fbbf24]/20' 
                    : 'border-[#0ea5e9]'
                } hover:shadow-xl transition-all group`}
              >
                {resource.featured && (
                  <div className="inline-block bg-[#fbbf24] text-[#1e3a8a] text-xs font-bold px-3 py-1 rounded-full mb-3">
                    ⭐ FEATURED
                  </div>
                )}
                <div className={`w-14 h-14 ${resource.color} rounded-full flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform`}>
                  {resource.icon}
                </div>
                <h3 className="font-bold text-xl mb-3 text-[#1e3a8a]">{resource.title}</h3>
                <p className="text-gray-700 mb-4">
                  {resource.description}
                </p>
                <div className="text-[#0ea5e9] font-medium group-hover:underline inline-flex items-center gap-1">
                  Learn More →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#0ea5e9]/5 to-[#fbbf24]/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-[#1e3a8a]">
              Ready to Start Your Home Search?
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Use our buyer preference tool to tell us what you're looking for, and we'll match you with properties that fit your needs.
            </p>
            <Link 
              href="/education/buyer-preferences"
              className="inline-block bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] text-white px-8 py-4 rounded-lg hover:opacity-90 transition-opacity font-bold text-lg shadow-lg"
            >
              Start Your Home Search →
            </Link>
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
                <Link href="/education/buyer-preferences" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Buyer Preferences</Link>
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
