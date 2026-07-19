'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Home, Hammer, TrendingUp, FileText } from 'lucide-react';

export default function SellersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <section className="bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Seller Services</h1>
          <p className="text-xl opacity-90">Prepare, market, and sell your home for maximum value</p>
        </div>
      </section>

      <section className="py-16 bg-white flex-1">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              { icon: Home, title: "Home Preparation", desc: "Get your home ready for sale with our guidance" },
              { icon: Hammer, title: "Repair Services", desc: "Connect with vetted contractors for repairs and updates" },
              { icon: TrendingUp, title: "Pricing Strategy", desc: "Professional pricing analysis for your market" },
              { icon: FileText, title: "Marketing Plan", desc: "Strategic marketing to attract buyers" }
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-gradient-to-br from-[#0ea5e9]/10 to-[#fbbf24]/10 border-l-4 border-[#0ea5e9] rounded-lg">
                <item.icon className="w-8 h-8 text-[#0ea5e9] mb-4" />
                <h3 className="font-bold text-lg text-[#1e3a8a] mb-2">{item.title}</h3>
                <p className="text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border-l-4 border-[#fbbf24] p-8 rounded-lg mb-8">
            <h2 className="text-2xl font-bold text-[#1e3a8a] mb-4">Ready to Sell?</h2>
            <p className="text-gray-700 mb-6">
              We provide comprehensive seller services including home preparation, marketing, and listing representation. Our goal is to maximize your property's value and get it sold quickly.
            </p>
            <Link href="/contact" className="inline-block bg-[#fbbf24] text-[#1e3a8a] px-8 py-3 rounded-lg hover:bg-[#fcd34d] font-bold transition-colors">
              Get a Free Consultation
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
