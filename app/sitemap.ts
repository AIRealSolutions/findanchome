import type { MetadataRoute } from 'next';
import { allSitemapLinks } from '@/lib/sitemap';
import { absoluteUrl } from '@/lib/site';

// Served at /sitemap.xml and referenced from /robots.txt.
// The page list lives in lib/sitemap.ts so the visitor-facing /site-map page stays in sync.
export default function sitemap(): MetadataRoute.Sitemap {
  return allSitemapLinks().map((link) => ({
    url: absoluteUrl(link.path),
    changeFrequency: link.changeFrequency,
    priority: link.priority,
  }));
}
