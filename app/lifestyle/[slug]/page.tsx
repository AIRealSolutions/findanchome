import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, MapPin } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { getLifestyle, lifestyles } from '@/lib/lifestyles';
import { PHONE, PHONE_DISPLAY, SITE_NAME, absoluteUrl } from '@/lib/siteRoutes';

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return lifestyles.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const lifestyle = getLifestyle((await params).slug);
  if (!lifestyle) return {};
  const path = `/lifestyle/${lifestyle.slug}`;
  return {
    title: lifestyle.seoTitle,
    description: lifestyle.seoDescription,
    alternates: { canonical: path },
    openGraph: { title: lifestyle.seoTitle, description: lifestyle.seoDescription, url: path, siteName: SITE_NAME, type: 'article' },
    twitter: { card: 'summary_large_image', title: lifestyle.seoTitle, description: lifestyle.seoDescription },
  };
}

const COUNTY_NAMES: Record<string, string> = {
  onslow: 'Onslow',
  pender: 'Pender',
  'new-hanover': 'New Hanover',
  brunswick: 'Brunswick',
  columbus: 'Columbus',
};

export default async function LifestyleDetailPage({ params }: { params: Params }) {
  const lifestyle = getLifestyle((await params).slug);
  if (!lifestyle) notFound();

  const url = absoluteUrl(`/lifestyle/${lifestyle.slug}`);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: lifestyle.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Lifestyles', item: absoluteUrl('/lifestyle') },
          { '@type': 'ListItem', position: 3, name: lifestyle.name, item: url },
        ],
      },
    ],
  };
  const others = lifestyles.filter((l) => l.slug !== lifestyle.slug);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <nav aria-label="Breadcrumb" className="text-sm opacity-90 mb-4">
            <Link href="/lifestyle" className="hover:underline">Lifestyles</Link> / <span>{lifestyle.name}</span>
          </nav>
          <div className="text-6xl mb-3">{lifestyle.emoji}</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{lifestyle.name} in Southeastern NC</h1>
          <p className="text-xl opacity-90">{lifestyle.description}</p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 max-w-4xl flex-1">
        <p className="text-lg text-gray-700 mb-10">{lifestyle.intro}</p>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-[#1e3a8a] mb-6">Where to find it</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {lifestyle.towns.map((t) => (
              <div key={t.name} className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg">
                <h3 className="font-bold text-lg text-[#1e3a8a] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#0ea5e9]" /> {t.name}
                </h3>
                <div className="text-xs uppercase text-gray-500 mb-2">{t.county} County</div>
                <p className="text-gray-700">{t.note}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            {lifestyle.countySlugs.map((slug) => (
              <Link key={slug} href={`/explore/${slug}`} className="px-4 py-2 rounded-full border-2 border-[#0ea5e9] text-[#0ea5e9] text-sm font-medium hover:bg-[#0ea5e9]/5">
                Explore {COUNTY_NAMES[slug]} County
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-[#1e3a8a] mb-6">What to know before you buy</h2>
          <ul className="space-y-3">
            {lifestyle.tips.map((tip) => (
              <li key={tip} className="flex gap-3 text-gray-700">
                <span className="text-[#fbbf24] font-bold">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-[#1e3a8a] mb-6">Frequently asked questions</h2>
          <div className="space-y-4">
            {lifestyle.faqs.map((f) => (
              <details key={f.q} className="group border-2 border-gray-200 rounded-lg p-5 open:border-[#0ea5e9]" open>
                <summary className="font-semibold text-[#1e3a8a] cursor-pointer">{f.q}</summary>
                <p className="text-gray-700 mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mb-12 bg-blue-50 border-2 border-[#0ea5e9] rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-[#1e3a8a] mb-3">Ready to find your {lifestyle.name.toLowerCase()} home?</h2>
          <p className="text-gray-700 mb-6">Tell us what you want and we&apos;ll send you homes that fit — or call or text {PHONE_DISPLAY}.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={lifestyle.listingFilter ?? '/properties'} className="bg-[#0ea5e9] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#0284c7]">
              Browse homes
            </Link>
            <Link href="/education/buyer-preferences" className="border-2 border-[#0ea5e9] text-[#0ea5e9] px-6 py-3 rounded-lg font-bold hover:bg-white">
              Get matched
            </Link>
            <a href={`tel:${PHONE}`} className="border-2 border-[#1e3a8a] text-[#1e3a8a] px-6 py-3 rounded-lg font-bold hover:bg-white">
              Call {PHONE_DISPLAY}
            </a>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-[#1e3a8a] mb-4">Other lifestyles</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {others.map((o) => (
              <Link key={o.slug} href={`/lifestyle/${o.slug}`} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-[#0ea5e9] group">
                <span><span className="mr-2">{o.emoji}</span>{o.name}</span>
                <ChevronRight className="w-4 h-4 text-[#0ea5e9] group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
