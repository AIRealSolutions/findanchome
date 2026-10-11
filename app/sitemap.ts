import type { MetadataRoute } from 'next';
import { absoluteUrl, siteRoutes } from '@/lib/siteRoutes';
import { lifestyles } from '@/lib/lifestyles';
import { getListings, listingPath } from '@/lib/listings';

// Served at /sitemap.xml — static pages, lifestyle guides and every public listing.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const listings = await getListings();

  return [
    ...siteRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...lifestyles.map((l) => ({
      url: absoluteUrl(`/lifestyle/${l.slug}`),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...listings.map((l) => ({
      url: absoluteUrl(listingPath(l)),
      lastModified: new Date(l.updated_at),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
  ];
}
