// Canonical site details used for SEO metadata, structured data, and the sitemap.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://findanchome.com').replace(/\/$/, '');

export const SITE_NAME = 'FindaNChome.com';

export const BROKERAGE = {
  name: 'Lightkeeper Realty',
  agent: 'Marc Spencer',
  phone: '(910) 363-6147',
  phoneE164: '+19103636147',
  email: 'marcspencer28461@gmail.com',
  areaServed: [
    'Onslow County, NC',
    'Pender County, NC',
    'New Hanover County, NC',
    'Brunswick County, NC',
    'Columbus County, NC',
  ],
};

export function absoluteUrl(path = '/') {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
