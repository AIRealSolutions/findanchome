import Link from 'next/link';
import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { BROKERAGE } from '@/lib/site';
import { lifestyles } from '@/lib/lifestyles';
import { usaHudHomes } from '@/lib/sisterSites';
import LanternLogo from './LanternLogo';

const columns = [
  {
    title: 'Explore',
    links: [
      { label: 'All counties', href: '/explore' },
      { label: 'Onslow County', href: '/explore/onslow' },
      { label: 'Pender County', href: '/explore/pender' },
      { label: 'New Hanover County', href: '/explore/new-hanover' },
      { label: 'Brunswick County', href: '/explore/brunswick' },
      { label: 'Columbus County', href: '/explore/columbus' },
    ],
  },
  {
    title: 'Lifestyles',
    links: lifestyles.slice(0, 6).map((l) => ({ label: l.name, href: `/lifestyle/${l.slug}` })),
  },
  {
    title: 'Services',
    links: [
      { label: 'Search homes', href: '/search' },
      { label: 'HUD homes', href: '/hud' },
      { label: 'Buyers', href: '/buyers' },
      { label: 'Sellers', href: '/sellers' },
      { label: 'Investments', href: '/investments' },
      { label: 'About us', href: '/about' },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="container mx-auto px-4 pt-16 pb-10">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid place-items-center h-11 w-11 rounded-xl bg-white/5 ring-1 ring-white/10">
                <LanternLogo size={30} />
              </span>
              <span className="text-xl font-semibold tracking-tight">
                FindaNC<span className="text-brass">home</span>
                <span className="text-white/40 font-normal">.com</span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-white/60 text-sm leading-relaxed">
              Local guidance for buying, selling and investing across Southeastern North Carolina, and
              registered HUD buyer representation statewide. A {BROKERAGE.name} company.
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <a href={`tel:${BROKERAGE.phoneE164}`} className="flex items-center gap-2 text-white/80 hover:text-brass-light transition-colors">
                <Phone size={15} className="text-brass" /> {BROKERAGE.phone}
              </a>
              <a href={`mailto:${BROKERAGE.email}`} className="flex items-center gap-2 text-white/80 hover:text-brass-light transition-colors break-all">
                <Mail size={15} className="text-brass shrink-0" /> {BROKERAGE.email}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {columns.map((col) => (
              <div key={col.title}>
                <div className="eyebrow text-brass mb-4">{col.title}</div>
                <ul className="space-y-2.5 text-sm">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-white/65 hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="eyebrow text-brass">Sister site</div>
            <p className="mt-1 text-white/80 text-sm">
              Shopping HUD homes nationwide? Browse live listings on {usaHudHomes.name}.
            </p>
          </div>
          <a
            href={usaHudHomes.home('footer')}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink bg-brass hover:bg-brass-light px-5 py-2.5 rounded-full transition-colors self-start md:self-auto"
          >
            Visit {usaHudHomes.name} <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-3 text-xs text-white/45">
          <div>
            © {new Date().getFullYear()} {BROKERAGE.name}. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <span>Equal Housing Opportunity</span>
            <Link href="/contact" className="hover:text-white">Contact</Link>
            <Link href="/site-map" className="hover:text-white">Site map</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
