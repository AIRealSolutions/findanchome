'use client';

import Link from 'next/link';
import { Building2, GraduationCap, HousePlus, Mail, Phone, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { BROKERAGE } from '@/lib/site';

/** A client's home: ways to search, learn, refer a seller, and reach the team. */
export default function ClientHome() {
  const { profile } = useAuth();
  const links = [
    { href: '/search', label: 'Search homes', text: 'Browse homes for sale in Southeastern NC.', icon: Search },
    { href: '/hud', label: 'HUD homes', text: 'Government-owned homes, often below market value.', icon: Building2 },
    { href: '/education', label: 'Buyer & seller guides', text: 'Financing, the buying process, and selling tips.', icon: GraduationCap },
    { href: '/dashboard/listings/new', label: 'Refer a seller', text: 'Know someone thinking of selling? Send them our way.', icon: HousePlus },
  ];
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome, {profile?.first_name || 'friend'}!</h1>
      <p className="mt-1 mb-6 text-gray-600">Thanks for working with {BROKERAGE.name}. Here’s everything in one place.</p>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="flex gap-3 p-5 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow">
            <l.icon className="w-8 h-8 text-blue-600 shrink-0" />
            <div><p className="font-semibold text-gray-900">{l.label}</p><p className="text-sm text-gray-600">{l.text}</p></div>
          </Link>
        ))}
      </div>
      <section className="bg-gradient-to-r from-blue-700 to-sky-600 text-white rounded-xl p-6">
        <p className="text-lg font-semibold">Questions? We’re here to help.</p>
        <p className="text-sm opacity-90 mb-3">{BROKERAGE.agent}, {BROKERAGE.name}</p>
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${BROKERAGE.phoneE164}`} className="inline-flex items-center gap-2 px-3 py-2 bg-white text-blue-800 rounded-lg text-sm font-medium"><Phone size={16} /> {BROKERAGE.phone}</a>
          <a href={`mailto:${BROKERAGE.email}`} className="inline-flex items-center gap-2 px-3 py-2 border border-white/60 rounded-lg text-sm font-medium"><Mail size={16} /> Email us</a>
        </div>
      </section>
    </div>
  );
}
