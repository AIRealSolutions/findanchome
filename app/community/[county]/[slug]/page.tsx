import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, MapPin, CheckCircle2, AlertTriangle, Phone } from 'lucide-react';
import Navigation from '@/components/Navigation';
import SiteFooter from '@/components/SiteFooter';
import { communities, getCommunity, getCommunityBySlug, communityPath } from '@/lib/communities';
import { getLifestyle, COUNTY_NAMES } from '@/lib/lifestyles';
import { BROKERAGE, SITE_NAME, absoluteUrl } from '@/lib/site';

type Props = { params: Promise<{ county: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return communities.map((c) => ({ county: c.county, slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { county, slug } = await params;
  const community = getCommunity(county, slug);
  if (!community) return {};

  const path = communityPath(community);
  const title = `Living in ${community.name}, NC`;
  return {
    title: { absolute: community.seoTitle },
    description: community.metaDescription,
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      url: path,
      siteName: SITE_NAME,
      title,
      description: community.metaDescription,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: community.metaDescription,
    },
  };
}

export default async function CommunityDetailPage({ params }: Props) {
  const { county, slug } = await params;
  const community = getCommunity(county, slug);
  if (!community) notFound();

  const countyName = COUNTY_NAMES[community.county];
  const url = absoluteUrl(communityPath(community));
  const lifestyles = community.lifestyles
    .map((s) => getLifestyle(s))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));
  const nearby = community.nearby
    .map((s) => getCommunityBySlug(s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const toc = [
    { id: 'overview', label: 'Overview' },
    { id: 'highlights', label: `Why People Love ${community.name}` },
    { id: 'housing', label: 'Homes & Real Estate' },
    { id: 'before-you-buy', label: 'Before You Buy' },
    { id: 'faq', label: 'Frequently Asked Questions' },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: `Living in ${community.name}, NC`,
        description: community.metaDescription,
        inLanguage: 'en-US',
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: absoluteUrl('/') },
        about: {
          '@type': 'Place',
          name: `${community.name}, North Carolina`,
          containedInPlace: { '@type': 'AdministrativeArea', name: `${countyName}, NC` },
        },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        publisher: { '@id': `${absoluteUrl('/')}#agent` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Explore the Region', item: absoluteUrl('/explore') },
          { '@type': 'ListItem', position: 3, name: countyName, item: absoluteUrl(`/explore/${community.county}`) },
          { '@type': 'ListItem', position: 4, name: community.name, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: community.faqs.map((f) => ({
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
              <li><Link href="/explore" className="hover:text-white">Explore the Region</Link></li>
              <li aria-hidden><ChevronRight size={14} /></li>
              <li><Link href={`/explore/${community.county}`} className="hover:text-white">{countyName}</Link></li>
              <li aria-hidden><ChevronRight size={14} /></li>
              <li aria-current="page" className="text-white font-medium">{community.name}</li>
            </ol>
          </nav>
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 text-sm bg-white/15 rounded-full px-3 py-1 mb-4">
              <MapPin size={14} /> {community.type} · {countyName}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">Living in {community.name}, NC</h1>
            <p className="text-lg md:text-xl opacity-95">{community.tagline}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/search"
                className="inline-flex justify-center items-center gap-2 bg-[#fbbf24] text-[#1e3a8a] px-6 py-3 rounded-lg hover:bg-[#fcd34d] font-bold"
              >
                Search {community.name} Homes <ChevronRight size={18} />
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
            {community.quickFacts.map((fact) => (
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
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] mb-6">About {community.name}</h2>
                <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                  {community.overview.map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </section>

              {/* Highlights */}
              <section id="highlights" className="scroll-mt-24 mb-14">
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] mb-6">Why People Love {community.name}</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {community.highlights.map((item) => (
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

              {/* Housing */}
              <section id="housing" className="scroll-mt-24 mb-14">
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] mb-6">Homes & Real Estate in {community.name}</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  {community.housing.map((p, i) => <p key={i}>{p}</p>)}
                </div>
                {lifestyles.length > 0 && (
                  <div className="mt-6">
                    <div className="text-sm font-semibold text-gray-500 uppercase mb-3">Great fit for</div>
                    <div className="flex flex-wrap gap-2">
                      {lifestyles.map((l) => (
                        <Link
                          key={l.slug}
                          href={`/lifestyle/${l.slug}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sm text-[#1e3a8a] hover:border-[#0ea5e9]"
                        >
                          <span aria-hidden>{l.emoji}</span> {l.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Before you buy */}
              <section id="before-you-buy" className="scroll-mt-24 mb-14">
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] mb-6">Before You Buy in {community.name}</h2>
                <div className="space-y-4">
                  {community.considerations.map((item) => (
                    <div key={item.title} className="p-5 border-l-4 border-[#fbbf24] bg-amber-50 rounded-r-lg">
                      <h3 className="font-bold text-[#1e3a8a] mb-1 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-[#d97706] shrink-0" /> {item.title}
                      </h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ */}
              <section id="faq" className="scroll-mt-24 mb-14">
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] mb-6">
                  {community.name}: Frequently Asked Questions
                </h2>
                <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  {community.faqs.map((f) => (
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

              {/* Nearby */}
              <section>
                <h2 className="text-2xl font-bold text-[#1e3a8a] mb-6">Nearby Communities</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {nearby.map((c) => (
                    <Link
                      key={c.slug}
                      href={communityPath(c)}
                      className="group block p-4 border-2 border-gray-200 hover:border-[#0ea5e9] rounded-lg transition-colors"
                    >
                      <span className="block font-bold text-[#1e3a8a] group-hover:text-[#0ea5e9]">{c.name}</span>
                      <span className="block text-xs text-gray-500 mb-1">{COUNTY_NAMES[c.county]}</span>
                      <span className="block text-sm text-gray-600">{c.summary}</span>
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
                  <div className="font-bold text-lg mb-2">Thinking about {community.name}?</div>
                  <p className="text-sm opacity-90 mb-4">
                    {BROKERAGE.agent} with {BROKERAGE.name} knows {countyName} firsthand.
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
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Home in {community.name}?</h2>
          <p className="text-lg opacity-95 mb-8">
            Let&apos;s talk about what you&apos;re looking for and find the right fit in {community.name} and the rest of {countyName}.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-[#fbbf24] text-[#1e3a8a] px-8 py-3 rounded-lg hover:bg-[#fcd34d] font-bold">
              Schedule a Free Consultation
            </Link>
            <Link href={`/explore/${community.county}`} className="bg-white/20 hover:bg-white/30 px-8 py-3 rounded-lg border border-white/40 font-bold">
              Explore {countyName}
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
