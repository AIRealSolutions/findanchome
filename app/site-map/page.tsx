import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FileCode2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import SiteFooter from '@/components/SiteFooter';
import { coreSections, communitySections, allSitemapLinks, type SitemapSection } from '@/lib/sitemap';

export const metadata: Metadata = {
  title: 'Site Map',
  description:
    'Every page on FindaNChome.com: home search, HUD homes, buyer and seller services, county and community guides, and lifestyle guides for Southeastern North Carolina.',
  alternates: { canonical: '/site-map' },
};

function Section({ section }: { section: SitemapSection }) {
  return (
    <div className="break-inside-avoid mb-10">
      <h3 className="eyebrow text-harbor mb-4">{section.title}</h3>
      <ul className="space-y-2">
        {section.links.map((link) => (
          <li key={link.path}>
            <Link
              href={link.path}
              className="group inline-flex items-center gap-2 text-slate-700 hover:text-ink transition-colors"
            >
              <span className="h-px w-3 bg-stone group-hover:w-5 group-hover:bg-brass transition-all" aria-hidden />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteMapPage() {
  const total = allSitemapLinks().length;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />

      <main className="flex-1">
        <section className="bg-sand border-b border-stone">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="eyebrow text-harbor">Site map</div>
            <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-[-0.03em] text-ink leading-[1.05]">
              Every page,{' '}
              <span className="font-display font-normal italic tracking-normal">in one place.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600 leading-relaxed">
              {total} pages covering home search, HUD homes, buyer and seller services, and local guides to
              Southeastern North Carolina&apos;s counties, communities and lifestyles.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-12">
            {coreSections.map((s) => (
              <Section key={s.title} section={s} />
            ))}
          </div>
        </section>

        <section className="border-t border-stone">
          <div className="container mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <div className="eyebrow text-harbor">Community guides</div>
                <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-ink">Towns &amp; neighborhoods by county</h2>
              </div>
              <Link href="/explore" className="inline-flex items-center gap-2 font-semibold text-ink hover:text-harbor">
                Compare counties <ArrowRight size={18} />
              </Link>
            </div>
            <div className="columns-1 sm:columns-2 lg:columns-5 gap-10">
              {communitySections.map((s) => (
                <Section key={s.title} section={s} />
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16">
          <a
            href="/sitemap.xml"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-ink transition-colors"
          >
            <FileCode2 size={16} /> XML sitemap for search engines
          </a>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
