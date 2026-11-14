import Link from 'next/link'
import Navigation from '@/components/Navigation'
import SiteFooter from '@/components/SiteFooter'
import { BookOpen, DollarSign, Home, Users, TrendingUp, FileText } from 'lucide-react'
import ConsultationCTA from '@/components/ConsultationCTA';

export default function EducationPage() {
  const resources = [
    {
      icon: <Home className="w-8 h-8" />,
      title: "Buyer Preference Tool",
      description: "Tell us what you're looking for and get personalized property recommendations matched to your needs.",
      link: "/education/buyer-preferences",
      color: "bg-[#0369a1]",
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
      color: "bg-[#0369a1]"
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
      <Navigation />
      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col focus:outline-none">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1e3a8a] via-[#0369a1] to-[#1e3a8a] text-white py-20">
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
                <h2 className="font-bold text-xl mb-3 text-[#1e3a8a]">{resource.title}</h2>
                <p className="text-gray-700 mb-4">
                  {resource.description}
                </p>
                <div className="text-[#0369a1] font-medium group-hover:underline inline-flex items-center gap-1">
                  Learn More →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#0369a1]/5 to-[#fbbf24]/5">
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
              className="inline-block bg-gradient-to-r from-[#1e3a8a] to-[#0369a1] text-white px-8 py-4 rounded-lg hover:opacity-90 transition-opacity font-bold text-lg shadow-lg"
            >
              Start Your Home Search →
            </Link>
          </div>
        </div>
      </section>

      <ConsultationCTA title="Ready to Put a Plan Together?" />

      </main>
      <SiteFooter />
    </div>
  )
}
