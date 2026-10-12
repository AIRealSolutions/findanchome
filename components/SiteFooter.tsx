import Link from 'next/link';
import { BROKERAGE } from '@/lib/site';
import { lifestyles } from '@/lib/lifestyles';

export default function SiteFooter() {
  return (
    <footer className="bg-gradient-to-r from-[#1e3a8a] via-[#0c4a6e] to-[#1e3a8a] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div>
            <div className="font-bold text-lg text-[#fbbf24] mb-4">FindaNChome.com</div>
            <p className="text-gray-300 text-sm">Your trusted guide to finding your perfect home in Southeastern North Carolina.</p>
          </div>
          <div>
            <div className="font-bold mb-4 text-[#fbbf24]">Explore</div>
            <div className="space-y-2 text-sm">
              <Link href="/explore" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Counties</Link>
              <Link href="/lifestyle" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Lifestyles</Link>
              <Link href="/search" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Search Homes</Link>
            </div>
          </div>
          <div>
            <div className="font-bold mb-4 text-[#fbbf24]">Lifestyles</div>
            <div className="space-y-2 text-sm">
              {lifestyles.map((l) => (
                <Link key={l.slug} href={`/lifestyle/${l.slug}`} className="block text-gray-300 hover:text-[#fbbf24] transition-colors">
                  {l.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="font-bold mb-4 text-[#fbbf24]">Help</div>
            <div className="space-y-2 text-sm">
              <Link href="/buyers" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Buyers</Link>
              <Link href="/sellers" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Sellers</Link>
              <Link href="/hud" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">HUD Homes</Link>
              <Link href="/contact" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Contact</Link>
            </div>
          </div>
          <div>
            <div className="font-bold mb-4 text-[#fbbf24]">Contact</div>
            <div className="text-gray-300 space-y-2 text-sm">
              <div>{BROKERAGE.agent}, {BROKERAGE.name}</div>
              <div>Phone: <a href={`tel:${BROKERAGE.phoneE164}`} className="hover:text-[#fbbf24]">{BROKERAGE.phone}</a></div>
              <div>Email: <a href={`mailto:${BROKERAGE.email}`} className="hover:text-[#fbbf24] break-all">{BROKERAGE.email}</a></div>
            </div>
          </div>
        </div>
        <div className="border-t border-[#0ea5e9]/30 pt-8 text-center text-gray-300 text-sm">
          © {new Date().getFullYear()} {BROKERAGE.name}. All rights reserved. | Fair Housing Opportunity
        </div>
      </div>
    </footer>
  );
}
