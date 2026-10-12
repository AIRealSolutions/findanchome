import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, MapPin, CheckCircle2, AlertTriangle, ExternalLink, Phone } from 'lucide-react';
import Navigation from '@/components/Navigation';
import SiteFooter from '@/components/SiteFooter';
import { lifestyles, getLifestyle, COUNTY_NAMES } from '@/lib/lifestyles';
import { BROKERAGE, SITE_NAME, absoluteUrl } from '@/lib/site';
import { usaHudHomes } from '@/lib/sisterSites';
import { findCommunityByName, communityPath } from '@/lib/communities';
import NeighborhoodSection from '@/components/NeighborhoodSection';
import { getNeighborhoodsForLifestyle } from '@/lib/neighborhoods';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return lifestyles.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lifestyle = getLifestyle(slug);
  if (!lifestyle) return {};

  const path = `/lifestyle/${lifestyle.slug}`;
  return {
    title: { absolute: lifestyle.seoTitle },
    description: lifestyle.metaDescription,
    keywords: lifestyle.keywords,
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      url: path,
      siteName: SITE_NAME,
      title: lifestyle.heroTitle,
      description: lifestyle.metaDescription,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: lifestyle.heroTitle,
      description: lifestyle.metaDescription,
    },
  };
}

export default async function LifestyleDetailPage({ params }: Props) {
  const { slug } = await params;
  const lifestyle = getLifestyle(slug);
  if (!lifestyle) notFound();

  const url = absoluteUrl(`/lifestyle/${lifestyle.slug}`);
  const related = lifestyle.related
    .map((s) => getLifestyle(s))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));

  const neighborhoods = getNeighborhoodsForLifestyle(lifestyle.slug);

  const toc = [
    { id: 'overview', label: 'Overview' },
    { id: 'communities', label: lifestyle.communitiesHeading },
    ...(neighborhoods.length > 0 ? [{ id: 'neighborhoods', label: 'Brunswick County Neighborhoods' }] : []),
    { id: 'living', label: lifestyle.livingHeading },
    { id: 'before-you-buy', label: lifestyle.considerationsHeading },
    { id: 'faq', label: 'Frequently Asked Questions' },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: lifestyle.heroTitle,
        description: lifestyle.metaDescription,
        inLanguage: 'en-US',
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: absoluteUrl('/') },
        about: lifestyle.communities.map((c) => ({
          '@type': 'Place',
          name: `${c.name}, North Carolina`,
          containedInPlace: { '@type': 'AdministrativeArea', name: `${COUNTY_NAMES[c.county]}, NC` },
        })),
        breadcrumb: { '@id': `${url}#breadcrumb` },
        publisher: { '@id': `${absoluteUrl('/')}#agent` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Find Your Lifestyle', item: absoluteUrl('/lifestyle') },
          { '@type': 'ListItem', position: 3, name: lifestyle.name, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: lifestyle.faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      },
      {
        '@type': 'RealEstateAgent',
        '@id': `${absoluteUrl('/')}#agent`,
        name: BROKERAGE.name,
        url: absoluteUrl('/'),
        telephone: BROKERAGE.phoneE164,
        email: BROKERAGE.email,
        employee: { '@type': 'Person', name: BROKERAGE.agent },
        areaServed: BROKERAGE.areaServed.map((name) => ({ '@type': 'AdministrativeArea', name })),
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-14 md:py-20">
        <div className="container mx-auto px-4">
          <nav aria-label="Breadcrumb" className="text-sm mb-6 text-white/80">
            <ol className="flex flex-wrap items-center gap-1">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden><ChevronRight size={14} /></li>
              <li><Link href="/lifestyle" className="hover:text-white">Find Your Lifestyle</Link></li>
              <li aria-hidden><ChevronRight size={14} /></li>
              <li aria-current="page" className="text-white font-medium">{lifestyle.name}</li>
            </ol>
          </nav>
          <div className="max-w-4xl">
            <div className="text-5xl mb-4" aria-hidden>{lifestyle.emoji}</div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{lifestyle.heroTitle}</h1>
            <p className="text-lg md:text-xl opacity-95">{lifestyle.heroSubtitle}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/search"
                className="inline-flex justify-center items-center gap-2 bg-[#fbbf24] text-[#1e3a8a] px-6 py-3 rounded-lg hover:bg-[#fcd34d] font-bold"
              >
                Search Homes <ChevronRight size={18} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex justify-center items-center gap-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg border border-white/40 font-bold"
              >
                Talk to a Local Agent
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick facts */}
      <section className="bg-[#0c4a6e] text-white">
        <div className="container mx-auto px-4 py-6">
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {lifestyle.quickFacts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-xs uppercase tracking-wide text-[#fbbf24]">{fact.label}</dt>
                <dd className="font-semibold mt-1">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="grid lg:grid-cols-[1fr_280px] gap-12 max-w-6xl mx-auto">
            <article className="min-w-0">
              {/* Overview */}
              <section id="overview" className="scroll-mt-24 mb-14">
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] mb-6">
                  {lifestyle.name} in Southeastern North Carolina
                </h2>
                <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                  {lifestyle.intro.map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </section>

              {/* Communities */}
              <section id="communities" className="scroll-mt-24 mb-14">
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] mb-6">{lifestyle.communitiesHeading}</h2>
                <div className="grid md:grid-cols-2 gap-5">
                  {lifestyle.communities.map((c) => {
                    const guide = findCommunityByName(c.county, c.name);
                    return (
                    <div key={c.name} className="p-5 bg-sky-50 border border-sky-100 rounded-lg">
                      <h3 className="font-bold text-lg text-[#1e3a8a] mb-1">
                        {guide ? <Link href={communityPath(guide)} className="hover:text-[#0ea5e9]">{c.name}</Link> : c.name}
                      </h3>
                      <Link
                        href={`/explore/${c.county}`}
                        className="inline-flex items-center gap-1 text-sm text-[#0ea5e9] hover:underline mb-3"
                      >
                        <MapPin size={14} /> {COUNTY_NAMES[c.county]}
                      </Link>
                      <p className="text-gray-700 text-sm leading-relaxed">{c.description}</p>
                      {guide && (
                        <Link href={communityPath(guide)} className="inline-block mt-3 text-sm font-semibold text-[#0ea5e9] hover:underline">
                          {c.name} community guide →
                        </Link>
                      )}
                    </div>
                    );
                  })}
                </div>
              </section>

              {/* Brunswick County neighborhoods */}
              {neighborhoods.length > 0 && (
                <section id="neighborhoods" className="scroll-mt-24 mb-14">
                  <NeighborhoodSection
                    neighborhoods={neighborhoods}
                    title={`Brunswick County Neighborhoods for ${lifestyle.name}`}
                    intro="Specific Brunswick County communities that fit this lifestyle, with golf courses, builders and amenities at a glance."
                  />
                </section>
              )}

              {/* Living */}
              <section id="living" className="scroll-mt-24 mb-14">
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] mb-6">{lifestyle.livingHeading}</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {lifestyle.living.map((item) => (
                    <div key={item.title} className="flex gap-3">
                      <CheckCircle2 className="text-[#0ea5e9] shrink-0 mt-1" size={22} />
                      <div>
                        <h3 className="font-bold text-[#1e3a8a] mb-1">{item.title}</h3>
                        <p className="text-gray-700 text-sm leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Before you buy */}
              <section id="before-you-buy" className="scroll-mt-24 mb-14">
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] mb-6">{lifestyle.considerationsHeading}</h2>
                <div className="space-y-4">
                  {lifestyle.considerations.map((item) => (
                    <div key={item.title} className="p-5 border-l-4 border-[#fbbf24] bg-amber-50 rounded-r-lg">
                      <h3 className="font-bold text-[#1e3a8a] mb-1 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-[#d97706] shrink-0" /> {item.title}
                      </h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* HUD call-out */}
              {lifestyle.showHud && (
                <section className="mb-14 p-6 rounded-lg bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] text-white">
                  <h2 className="text-xl md:text-2xl font-bold mb-2">HUD Homes: A Lightkeeper Realty Specialty</h2>
                  <p className="opacity-95 mb-4">
                    HUD homes can offer below-market prices, priority bidding for owner-occupants, and the $100 down FHA
                    incentive for eligible buyers. Browse current North Carolina HUD listings or learn how bidding works.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/hud" className="inline-flex justify-center bg-[#fbbf24] text-[#1e3a8a] px-5 py-2 rounded-lg font-bold hover:bg-[#fcd34d]">
                      HUD Homes Guide
                    </Link>
                    <a
                      href={usaHudHomes.ncListings(`lifestyle_${lifestyle.slug}`)}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex justify-center items-center gap-2 bg-white/20 hover:bg-white/30 px-5 py-2 rounded-lg border border-white/40 font-bold"
                    >
                      NC HUD Listings on USAhudhomes.com <ExternalLink size={16} />
                    </a>
                  </div>
                </section>
              )}

              {/* FAQ */}
              <section id="faq" className="scroll-mt-24 mb-14">
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] mb-6">
                  {lifestyle.name}: Frequently Asked Questions
                </h2>
                <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  {lifestyle.faqs.map((f) => (
                    <details key={f.question} className="group p-5">
                      <summary className="cursor-pointer list-none flex justify-between items-start gap-4 font-semibold text-[#1e3a8a]">
                        <h3>{f.question}</h3>
                        <ChevronRight size={20} className="shrink-0 mt-0.5 transition-transform group-open:rotate-90" />
                      </summary>
                      <p className="mt-3 text-gray-700 leading-relaxed">{f.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              {/* Related */}
              <section>
                <h2 className="text-2xl font-bold text-[#1e3a8a] mb-6">Explore Related Lifestyles</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/lifestyle/${r.slug}`}
                      className="group flex items-center gap-4 p-4 border-2 border-gray-200 hover:border-[#0ea5e9] rounded-lg transition-colors"
                    >
                      <span className="text-3xl" aria-hidden>{r.emoji}</span>
                      <span>
                        <span className="block font-bold text-[#1e3a8a] group-hover:text-[#0ea5e9]">{r.name}</span>
                        <span className="block text-sm text-gray-600">{r.description}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                <nav aria-label="On this page" className="border border-gray-200 rounded-lg p-5">
                  <div className="text-xs font-semibold uppercase text-gray-500 mb-3">On this page</div>
                  <ul className="space-y-2 text-sm">
                    {toc.map((t) => (
                      <li key={t.id}>
                        <a href={`#${t.id}`} className="text-[#1e3a8a] hover:text-[#0ea5e9]">{t.label}</a>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="rounded-lg p-5 bg-[#1e3a8a] text-white">
                  <div className="font-bold text-lg mb-2">Questions about {lifestyle.name.toLowerCase()}?</div>
                  <p className="text-sm opacity-90 mb-4">
                    {BROKERAGE.agent} with {BROKERAGE.name} knows Southeastern NC communities firsthand.
                  </p>
                  <a
                    href={`tel:${BROKERAGE.phoneE164}`}
                    className="flex items-center justify-center gap-2 bg-[#fbbf24] text-[#1e3a8a] px-4 py-2 rounded-lg font-bold hover:bg-[#fcd34d]"
                  >
                    <Phone size={16} /> {BROKERAGE.phone}
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-4">{lifestyle.ctaTitle}</h2>
          <p className="text-lg opacity-95 mb-8">{lifestyle.ctaText}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-[#fbbf24] text-[#1e3a8a] px-8 py-3 rounded-lg hover:bg-[#fcd34d] font-bold">
              Schedule a Free Consultation
            </Link>
            <Link href="/search" className="bg-white/20 hover:bg-white/30 px-8 py-3 rounded-lg border border-white/40 font-bold">
              Search Homes
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
