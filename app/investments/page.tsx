'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { TrendingUp, Building2, Percent, Target } from 'lucide-react';

export default function InvestmentsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <section className="bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Investment Properties</h1>
          <p className="text-xl opacity-90">Identify and analyze investment opportunities throughout Southeastern North Carolina</p>
        </div>
      </section>

      <section className="py-16 bg-white flex-1">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              { icon: TrendingUp, title: "Fix & Flip", desc: "Identify undervalued properties for renovation" },
              { icon: Building2, title: "Rental Properties", desc: "Find properties for long-term rental income" },
              { icon: Percent, title: "Cash Flow Analysis", desc: "Detailed returns and investment metrics" },
              { icon: Target, title: "Portfolio Building", desc: "Develop diversified investment strategies" }
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-gradient-to-br from-[#0ea5e9]/10 to-[#fbbf24]/10 border-l-4 border-[#0ea5e9] rounded-lg">
                <item.icon className="w-8 h-8 text-[#0ea5e9] mb-4" />
                <h3 className="font-bold text-lg text-[#1e3a8a] mb-2">{item.title}</h3>
                <p className="text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-[#0ea5e9] p-8 rounded-lg mb-8">
            <h2 className="text-2xl font-bold text-[#1e3a8a] mb-4">Investment Opportunities</h2>
            <p className="text-gray-700 mb-4">
              Southeastern North Carolina offers diverse investment opportunities from coastal rental properties to inland fix-and-flip projects. Our market knowledge helps you identify properties with the best potential returns.
            </p>
            <p className="text-gray-700 mb-6">
              We analyze investment metrics including cash flow, cap rates, appreciation potential, and market trends to help you make informed decisions.
            </p>
            <Link href="/contact" className="inline-block bg-[#0ea5e9] text-white px-8 py-3 rounded-lg hover:opacity-90 font-bold transition-opacity">
              Discuss Investment Strategy
            </Link>
          </div>
        </div>
      </section>

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
