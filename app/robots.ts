import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/crm', '/dashboard', '/debug', '/api', '/auth', '/login'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
