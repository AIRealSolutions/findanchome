'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ConsultationForm from '@/components/ConsultationForm';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Request a Free Consultation</h1>
          <p className="text-xl opacity-90">Have questions? Let&apos;s talk about your real estate goals and the areas you love.</p>
        </div>
      </section>

      <section className="py-16 bg-white flex-1">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-[#1e3a8a] mb-2">Request a Free Consultation</h2>
              <p className="text-gray-600 mb-6">Tell us about your goals and the areas you&apos;re interested in, and we&apos;ll be in touch within one business day.</p>
              <Suspense fallback={<ConsultationForm />}>
                <ContactConsultationForm />
              </Suspense>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-[#1e3a8a] mb-6">Contact Information</h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <Phone className="w-6 h-6 text-[#0ea5e9] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-[#1e3a8a] mb-1">Phone</h3>
                    <a href="tel:+19103636147" className="text-gray-700 hover:text-[#0ea5e9] font-medium">
                      (910) 363-6147
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Mail className="w-6 h-6 text-[#fbbf24] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-[#1e3a8a] mb-1">Email</h3>
                    <a href="mailto:marcspencer28461@gmail.com" className="text-gray-700 hover:text-[#0ea5e9] font-medium">
                      marcspencer28461@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <MapPin className="w-6 h-6 text-[#0ea5e9] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-[#1e3a8a] mb-1">Location</h3>
                    <p className="text-gray-700">Southport, North Carolina</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Clock className="w-6 h-6 text-[#fbbf24] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-[#1e3a8a] mb-1">Availability</h3>
                    <p className="text-gray-700">Monday - Friday: 9am - 6pm</p>
                    <p className="text-gray-700">Saturday - Sunday: By appointment</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-bold text-[#1e3a8a] mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <Link href="/search" className="block text-[#0ea5e9] hover:underline">
                    Search Homes →
                  </Link>
                  <Link href="/lifestyle" className="block text-[#0ea5e9] hover:underline">
                    Find Your Lifestyle →
                  </Link>
                  <Link href="/hud" className="block text-[#0ea5e9] hover:underline">
                    HUD Homes →
                  </Link>
                </div>
              </div>
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

// Lets other pages deep-link with interests pre-selected, e.g. /contact?community=southport&neighborhood=st-james-plantation
function ContactConsultationForm() {
  const params = useSearchParams();
  const get = (key: string) => params.getAll(key).flatMap((v) => v.split(',')).filter(Boolean);
  return (
    <ConsultationForm
      context={{
        counties: get('county'),
        communities: get('community'),
        neighborhoods: get('neighborhood'),
        lifestyles: get('lifestyle'),
        intent: get('intent'),
      }}
    />
  );
}
