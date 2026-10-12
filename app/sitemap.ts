import type { MetadataRoute } from 'next';
import { lifestyles } from '@/lib/lifestyles';
import { communities, communityPath } from '@/lib/communities';
import { absoluteUrl } from '@/lib/site';

const staticPaths = [
  '/',
  '/explore',
  '/explore/onslow',
  '/explore/pender',
  '/explore/new-hanover',
  '/explore/brunswick',
  '/explore/columbus',
  '/lifestyle',
  '/search',
  '/buyers',
  '/sellers',
  '/hud',
  '/investments',
  '/about',
  '/contact',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticPaths.map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: 'weekly' as const,
      priority: path === '/' ? 1 : 0.7,
    })),
    ...lifestyles.map((l) => ({
      url: absoluteUrl(`/lifestyle/${l.slug}`),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...communities.map((c) => ({
      url: absoluteUrl(communityPath(c)),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
