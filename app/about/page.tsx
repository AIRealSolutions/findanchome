'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Award, Users, Heart, Target } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <section className="bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Marc Spencer</h1>
          <p className="text-xl opacity-90">Local real estate expert serving Southeastern North Carolina</p>
        </div>
      </section>

      <section className="py-16 bg-white flex-1">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-12 text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-[#0ea5e9] to-[#fbbf24] rounded-full mx-auto mb-6 flex items-center justify-center">
              <div className="text-6xl">👨‍💼</div>
            </div>
            <h2 className="text-3xl font-bold text-[#1e3a8a] mb-2">Marc Spencer</h2>
            <p className="text-xl text-[#0ea5e9] font-medium mb-4">Broker & HUD Specialist</p>
            <p className="text-gray-700">Based in Southport, North Carolina</p>
          </div>

          <div className="prose prose-lg max-w-none mb-12">
            <h3 className="text-2xl font-bold text-[#1e3a8a] mb-4">Professional Background</h3>
            <p className="text-gray-700 mb-6">
              With years of experience in real estate and a deep knowledge of Southeastern North Carolina, Marc Spencer is your trusted guide to finding the right home. As a specialized HUD Buyer's Agency representative, Marc has helped hundreds of families navigate the home buying process and find their perfect property.
            </p>

            <h3 className="text-2xl font-bold text-[#1e3a8a] mb-4">Our Mission</h3>
            <p className="text-gray-700 mb-6">
              At Lightkeeper Realty, we believe home buying should be straightforward and stress-free. Our mission is to help you understand where you want to live before choosing a home, then guide you through the entire buying process with expertise, integrity, and care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              { icon: Award, title: "Expertise", desc: "Years of experience in residential and HUD properties" },
              { icon: Heart, title: "Commitment", desc: "Dedicated to your success and satisfaction" },
              { icon: Target, title: "Focus", desc: "Specialized in Southeastern North Carolina markets" },
              { icon: Users, title: "Support", desc: "Full-service representation and guidance" }
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-gradient-to-br from-[#0ea5e9]/10 to-[#fbbf24]/10 border-l-4 border-[#0ea5e9] rounded-lg">
                <item.icon className="w-8 h-8 text-[#0ea5e9] mb-4" />
                <h3 className="font-bold text-lg text-[#1e3a8a] mb-2">{item.title}</h3>
                <p className="text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border-l-4 border-[#0ea5e9] p-8 rounded-lg mb-8">
            <h3 className="text-2xl font-bold text-[#1e3a8a] mb-4">Ready to Work Together?</h3>
            <p className="text-gray-700 mb-6">
              Whether you're looking to buy, sell, or invest in property, Marc is here to help. Contact us to discuss your real estate goals and discover how we can assist you.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/contact" className="bg-[#0ea5e9] text-white px-8 py-3 rounded-lg hover:opacity-90 font-bold">
                Schedule a Consultation
              </Link>
              <Link href="tel:+19103636147" className="bg-white text-[#0ea5e9] border-2 border-[#0ea5e9] px-8 py-3 rounded-lg hover:bg-[#0ea5e9]/5 font-bold">
                Call Marc
              </Link>
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <h3 className="font-bold text-lg text-[#1e3a8a] mb-4">Contact Information</h3>
            <div className="space-y-2 text-gray-700">
              <p>Phone: <span className="font-bold">(910) 363-6147</span></p>
              <p>Email: <span className="font-bold">marcspencer28461@gmail.com</span></p>
              <p>Location: Southport, North Carolina</p>
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
