import type { Metadata } from 'next';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import SiteFooter from '@/components/SiteFooter';
import { ChevronRight } from 'lucide-react';
import { lifestyles } from '@/lib/lifestyles';
import { SITE_NAME, absoluteUrl } from '@/lib/site';

const title = 'Coastal NC Lifestyles: Beach, Golf, Waterfront & More';
const description =
  'Find where you fit in Southeastern NC: beach towns, golf communities, waterfront, historic downtowns, Camp Lejeune relocation, retirement, acreage & more.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/lifestyle' },
  openGraph: { type: 'website', url: '/lifestyle', siteName: SITE_NAME, title, description, locale: 'en_US' },
  twitter: { card: 'summary_large_image', title, description },
};

export default function LifestylePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Find Your Lifestyle in Southeastern North Carolina',
    description,
    url: absoluteUrl('/lifestyle'),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: lifestyles.map((l, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: l.name,
        url: absoluteUrl(`/lifestyle/${l.slug}`),
      })),
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <Navigation />

      {/* Header */}
      <section className="bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Lifestyle in Southeastern North Carolina</h1>
            <p className="text-xl opacity-90">
              Before choosing a home, choose how you want to live. We&apos;ll show you where to find it along the Cape Fear coast.
            </p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="pt-14 bg-white">
        <div className="container mx-auto px-4 max-w-3xl text-gray-700 text-lg leading-relaxed space-y-4">
          <p>
            Southeastern North Carolina packs a remarkable range of lifestyles into five counties — Onslow, Pender,
            New Hanover, Brunswick, and Columbus. Within an hour&apos;s drive you can go from the surf at Wrightsville
            Beach to the golf courses of Brunswick County, the historic streets of downtown Wilmington and Southport,
            the military community around Camp Lejeune, or quiet farmland and lake country inland.
          </p>
          <p>
            Each guide below covers the best towns and neighborhoods for that lifestyle, what daily life is really
            like, what to check before you buy, and answers to the questions buyers ask most. When you&apos;re ready,
            Marc Spencer with Lightkeeper Realty can help you narrow it down to the right home.
          </p>
        </div>
      </section>

      {/* Lifestyle Grid */}
      <section className="py-14 bg-white flex-1">
        <div className="container mx-auto px-4">
          <h2 className="sr-only">Lifestyle guides</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {lifestyles.map((lifestyle) => (
              <Link key={lifestyle.slug} href={`/lifestyle/${lifestyle.slug}`} className="group h-full">
                <div className="h-full bg-white border-2 border-gray-200 hover:border-[#0ea5e9] rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col p-6">
                  <div className="text-6xl mb-4" aria-hidden>{lifestyle.emoji}</div>

                  <h3 className="text-2xl font-bold text-[#1e3a8a] group-hover:text-[#0ea5e9] transition-colors mb-3">
                    {lifestyle.name}
                  </h3>
                  <p className="text-gray-700 text-sm flex-1 mb-4">{lifestyle.description}</p>

                  <div className="mb-4">
                    <div className="text-xs font-medium text-[#1e3a8a] mb-2 uppercase">Where to find it</div>
                    <div className="flex flex-wrap gap-1">
                      {lifestyle.areas.map((area) => (
                        <span key={area} className="text-xs bg-[#0ea5e9]/10 text-[#0ea5e9] px-2 py-1 rounded">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="text-xs font-medium text-[#1e3a8a] mb-2 uppercase">Features</div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {lifestyle.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-1">
                          <span className="text-[#fbbf24] mt-0.5">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-xs text-gray-600 mb-4">
                    <span className="font-medium text-[#1e3a8a]">Best for: </span>
                    {lifestyle.bestFor}
                  </div>

                  <div className="flex items-center gap-1 text-[#0ea5e9] font-medium text-sm group-hover:gap-2 transition-all mt-auto">
                    Read the {lifestyle.name} guide <ChevronRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-700 mb-6 text-lg">Found your lifestyle? Let&apos;s find your home.</p>
            <Link
              href="/search"
              className="inline-block bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium shadow-md"
            >
              Start Your Search
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
