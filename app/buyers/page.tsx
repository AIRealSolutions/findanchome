'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { BookOpen, Users, Home, FileText } from 'lucide-react';

export default function BuyersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <section className="bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Buyer Resources & Guides</h1>
          <p className="text-xl opacity-90">Everything you need to know about buying a home in Southeastern North Carolina</p>
        </div>
      </section>

      <section className="py-16 bg-white flex-1">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              { icon: BookOpen, title: "First-Time Buyer Guide", desc: "Learn the basics of buying your first home" },
              { icon: FileText, title: "Financing Guide", desc: "Understand FHA, VA, USDA, and conventional loans" },
              { icon: Home, title: "Regional Guides", desc: "Explore each county and community in detail" },
              { icon: Users, title: "Buyer Services", desc: "Learn about representation and support" }
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-gradient-to-br from-[#0ea5e9]/10 to-[#fbbf24]/10 border-l-4 border-[#0ea5e9] rounded-lg">
                <item.icon className="w-8 h-8 text-[#0ea5e9] mb-4" />
                <h3 className="font-bold text-lg text-[#1e3a8a] mb-2">{item.title}</h3>
                <p className="text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border-l-4 border-[#0ea5e9] p-8 rounded-lg mb-8">
            <h2 className="text-2xl font-bold text-[#1e3a8a] mb-4">Ready to Start Your Search?</h2>
            <p className="text-gray-700 mb-6">
              We offer full buyer representation to help you navigate the home buying process. From initial consultation to closing, we're here to help you find the right home.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/search" className="bg-[#0ea5e9] text-white px-6 py-2 rounded-lg hover:opacity-90 font-medium">
                Search Homes
              </Link>
              <Link href="/lifestyle" className="bg-white text-[#0ea5e9] border-2 border-[#0ea5e9] px-6 py-2 rounded-lg hover:bg-[#0ea5e9]/5 font-medium">
                Find Your Lifestyle
              </Link>
            </div>
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
