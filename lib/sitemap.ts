// Single source of truth for the site's public pages.
// Feeds both the XML sitemap for search engines (app/sitemap.ts → /sitemap.xml)
// and the visitor-facing Site Map page (app/site-map/page.tsx → /site-map).
// Private areas (dashboard, CRM, admin, client portal, auth) are intentionally left out.

import { lifestyles, COUNTY_NAMES, type CountySlug } from './lifestyles';
import { communities, communityPath } from './communities';

export type ChangeFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface SitemapLink {
  label: string;
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}

export interface SitemapSection {
  title: string;
  links: SitemapLink[];
}

const page = (label: string, path: string, priority = 0.7, changeFrequency: ChangeFrequency = 'weekly'): SitemapLink => ({
  label,
  path,
  priority,
  changeFrequency,
});

const COUNTY_ORDER: CountySlug[] = ['new-hanover', 'brunswick', 'pender', 'onslow', 'columbus'];

/** Core pages, grouped the way visitors think about them. */
export const coreSections: SitemapSection[] = [
  {
    title: 'Main pages',
    links: [
      page('Home', '/', 1, 'weekly'),
      page('Search homes for sale', '/search', 0.9, 'daily'),
      page('About Lightkeeper Realty', '/about', 0.6, 'monthly'),
      page('Contact & consultations', '/contact', 0.7, 'monthly'),
    ],
  },
  {
    title: 'Buy, sell & invest',
    links: [
      page('Buyer services', '/buyers', 0.8),
      page('Seller services', '/sellers', 0.8),
      page('Sell your home', '/sell', 0.6),
      page('HUD homes in North Carolina', '/hud', 0.9),
      page('Investment property', '/investments', 0.7),
    ],
  },
  {
    title: 'Buyer education',
    links: [
      page('Education center', '/education', 0.6, 'monthly'),
      page('Financing options & NC programs', '/education/financing', 0.6, 'monthly'),
      page('Buyer preference tool', '/education/buyer-preferences', 0.5, 'monthly'),
    ],
  },
  {
    title: 'Explore the region',
    links: [
      page('All counties & communities', '/explore', 0.9),
      ...COUNTY_ORDER.map((slug) => page(COUNTY_NAMES[slug], `/explore/${slug}`, 0.8)),
    ],
  },
  {
    title: 'Lifestyle guides',
    links: [
      page('All lifestyle guides', '/lifestyle', 0.8),
      ...lifestyles.map((l) => page(l.name, `/lifestyle/${l.slug}`, 0.8, 'monthly')),
    ],
  },
];

/** Community guides, grouped by county. */
export const communitySections: SitemapSection[] = COUNTY_ORDER.map((county) => ({
  title: COUNTY_NAMES[county],
  links: communities
    .filter((c) => c.county === county)
    .map((c) => page(c.name, communityPath(c), 0.8, 'monthly')),
})).filter((s) => s.links.length > 0);

/** Every public URL, de-duplicated, plus the Site Map page itself. */
export function allSitemapLinks(): SitemapLink[] {
  const seen = new Set<string>();
  const out: SitemapLink[] = [];
  for (const section of [...coreSections, ...communitySections]) {
    for (const link of section.links) {
      if (seen.has(link.path)) continue;
      seen.add(link.path);
      out.push(link);
    }
  }
  out.push(page('Site map', '/site-map', 0.3, 'monthly'));
  return out;
}
