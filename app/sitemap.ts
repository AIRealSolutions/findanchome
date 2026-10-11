import type { MetadataRoute } from 'next';
import { absoluteUrl, siteRoutes } from '@/lib/siteRoutes';

// Served at /sitemap.xml
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return siteRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
