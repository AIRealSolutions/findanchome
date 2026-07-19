'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Home, BookOpen, DollarSign, CheckCircle } from 'lucide-react';

export default function HUDPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">HUD Homes Throughout North Carolina</h1>
          <p className="text-xl opacity-90">Statewide buyer representation for HUD properties at competitive prices</p>
        </div>
      </section>

      <section className="py-16 bg-white flex-1">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[
              { icon: Home, title: "Browse HUD Listings", desc: "Search all available HUD homes throughout North Carolina" },
              { icon: BookOpen, title: "HUD Education", desc: "Learn about the HUD bidding process and buyer requirements" },
              { icon: DollarSign, title: "Financing Options", desc: "Explore FHA loans and down payment assistance programs" },
              { icon: CheckCircle, title: "Expert Guidance", desc: "Get representation from an experienced HUD specialist" }
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-gradient-to-br from-[#0ea5e9]/10 to-[#fbbf24]/10 border-l-4 border-[#0ea5e9] rounded-lg">
                <item.icon className="w-8 h-8 text-[#0ea5e9] mb-4" />
                <h3 className="font-bold text-lg text-[#1e3a8a] mb-2">{item.title}</h3>
                <p className="text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#0ea5e9]/5 p-8 rounded-lg border-2 border-[#0ea5e9]/20 mb-8">
            <h2 className="text-2xl font-bold text-[#1e3a8a] mb-6">Why Choose Lightkeeper Realty for HUD Homes?</h2>
            <ul className="space-y-4">
              {[
                "Specialized HUD buyer's agency with years of experience",
                "Statewide coverage throughout North Carolina",
                "Expert guidance through the entire bidding and closing process",
                "Help with prequalification and proof of funds",
                "Support with FHA inspections and repair estimates",
                "Coordination of closing and property condition assessments"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-[#fbbf24] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/search" className="block p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-[#0ea5e9] rounded-lg hover:shadow-lg transition-all text-center">
              <Home className="w-8 h-8 text-[#0ea5e9] mx-auto mb-3" />
              <h3 className="font-bold text-[#1e3a8a] mb-2">Search HUD Listings</h3>
              <p className="text-gray-700 text-sm mb-4">Browse available HUD homes across NC</p>
              <div className="text-[#0ea5e9] font-medium">Browse →</div>
            </Link>

            <Link href="/contact" className="block p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-[#fbbf24] rounded-lg hover:shadow-lg transition-all text-center">
              <BookOpen className="w-8 h-8 text-[#fbbf24] mx-auto mb-3" />
              <h3 className="font-bold text-[#1e3a8a] mb-2">Get Buyer Representation</h3>
              <p className="text-gray-700 text-sm mb-4">Request representation for a property</p>
              <div className="text-[#0ea5e9] font-medium">Contact Marc →</div>
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
