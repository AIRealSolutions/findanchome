import type { Metadata, MetadataRoute } from 'next';
import { usaHudHomes } from '@/lib/sisterSites';

// Single source of truth for the public site structure. Drives sitemap.xml,
// robots.txt, llms.txt, the /site-map page, and per-page <head> metadata.
// Add a new public page here and it shows up everywhere automatically.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://findanchome.com').replace(/\/$/, '');
export const SITE_NAME = 'FindaNChome.com';
export const BROKERAGE = 'Lightkeeper Realty';
export const PHONE = '+1-910-363-6147';
export const PHONE_DISPLAY = '(910) 363-6147';
export const EMAIL = 'marcspencer28461@gmail.com';

export const SERVICE_AREA = [
  'Onslow County, NC',
  'Pender County, NC',
  'New Hanover County, NC',
  'Brunswick County, NC',
  'Columbus County, NC',
];

export type RouteSection = 'Main' | 'Buy' | 'Sell & Invest' | 'Explore Counties' | 'Learn' | 'Company';

export interface SiteRoute {
  path: string;
  title: string;
  description: string;
  section: RouteSection;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
}

export const siteRoutes: SiteRoute[] = [
  {
    path: '/',
    title: 'Homes for Sale in Southeastern NC | Wilmington, Jacksonville & the Coast',
    description: 'Find homes for sale in Southeastern North Carolina — Onslow, Pender, New Hanover, Brunswick and Columbus counties. Local agent, HUD home specialist, beach, golf and military relocation.',
    section: 'Main',
    priority: 1.0,
    changeFrequency: 'daily',
  },
  {
    path: '/search',
    title: 'Search Homes for Sale in Southeastern NC',
    description: 'Search homes for sale across Wilmington, Jacksonville, Hampstead, Southport, Topsail and the rest of Southeastern North Carolina.',
    section: 'Buy',
    priority: 0.9,
    changeFrequency: 'daily',
  },
  {
    path: '/properties',
    title: 'Featured Homes for Sale in Southeastern NC | HUD, REO & Conventional',
    description: 'Featured listings from Lightkeeper Realty across Onslow, Pender, New Hanover, Brunswick and Columbus counties — HUD homes, bank-owned and conventional homes for sale.',
    section: 'Buy',
    priority: 0.9,
    changeFrequency: 'daily',
  },
  {
    path: '/hud',
    title: 'HUD Homes in North Carolina | HUD Buyer’s Agent',
    description: 'Buy a HUD home in North Carolina with an experienced HUD buyer’s agency. How HUD bidding works, owner-occupant incentives, $100 down FHA, and current NC HUD listings.',
    section: 'Buy',
    priority: 0.9,
    changeFrequency: 'daily',
  },
  {
    path: '/buyers',
    title: 'Home Buyer Resources for Southeastern NC',
    description: 'Step-by-step guides for buying a home in Southeastern North Carolina: pre-approval, VA and FHA loans, inspections, flood zones and closing.',
    section: 'Buy',
    priority: 0.8,
    changeFrequency: 'monthly',
  },
  {
    path: '/lifestyle',
    title: 'Find Homes by Lifestyle | Beach, Golf, Waterfront, Military & Retirement',
    description: 'Start with the lifestyle you want — beach living, golf communities, waterfront and boating, historic downtowns, military relocation near Camp Lejeune, or retirement on the NC coast.',
    section: 'Buy',
    priority: 0.7,
    changeFrequency: 'monthly',
  },
  {
    path: '/sellers',
    title: 'Sell Your Home in Southeastern NC | Seller Services',
    description: 'Prepare, price, market and sell your Southeastern North Carolina home for maximum value with a local Lightkeeper Realty agent.',
    section: 'Sell & Invest',
    priority: 0.8,
    changeFrequency: 'monthly',
  },
  {
    path: '/sell',
    title: 'What Is My Home Worth? Request a Free Home Valuation',
    description: 'Request a free, no-obligation home valuation and selling plan for your property in Onslow, Pender, New Hanover, Brunswick or Columbus County, NC.',
    section: 'Sell & Invest',
    priority: 0.8,
    changeFrequency: 'monthly',
  },
  {
    path: '/investments',
    title: 'Investment Properties in Southeastern NC',
    description: 'Find and analyze rental, vacation and fix-and-flip investment properties in Wilmington, Jacksonville and coastal North Carolina.',
    section: 'Sell & Invest',
    priority: 0.7,
    changeFrequency: 'weekly',
  },
  {
    path: '/explore',
    title: 'Explore Southeastern NC Counties | Where to Live on the NC Coast',
    description: 'Compare the five counties of Southeastern North Carolina — Onslow, Pender, New Hanover, Brunswick and Columbus — towns, beaches, schools and home prices.',
    section: 'Explore Counties',
    priority: 0.8,
    changeFrequency: 'monthly',
  },
  {
    path: '/explore/new-hanover',
    title: 'New Hanover County NC Homes | Wilmington, Wrightsville, Carolina & Kure Beach',
    description: 'Living in New Hanover County: Wilmington, Wrightsville Beach, Carolina Beach and Kure Beach neighborhoods, lifestyle and homes for sale.',
    section: 'Explore Counties',
    priority: 0.8,
    changeFrequency: 'monthly',
  },
  {
    path: '/explore/onslow',
    title: 'Onslow County NC Homes | Jacksonville, Camp Lejeune, Swansboro & Topsail',
    description: 'Living in Onslow County: Jacksonville, Camp Lejeune military relocation, Swansboro, Sneads Ferry and North Topsail Beach homes for sale.',
    section: 'Explore Counties',
    priority: 0.8,
    changeFrequency: 'monthly',
  },
  {
    path: '/explore/pender',
    title: 'Pender County NC Homes | Hampstead, Surf City, Topsail Beach & Burgaw',
    description: 'Living in Pender County: Hampstead, Surf City, Topsail Beach and Burgaw — beach and family communities and homes for sale.',
    section: 'Explore Counties',
    priority: 0.8,
    changeFrequency: 'monthly',
  },
  {
    path: '/explore/brunswick',
    title: 'Brunswick County NC Homes | Southport, Oak Island, Leland & Holden Beach',
    description: 'Living in Brunswick County: Southport, Oak Island, Leland and Holden Beach — golf, waterfront and retirement communities and homes for sale.',
    section: 'Explore Counties',
    priority: 0.8,
    changeFrequency: 'monthly',
  },
  {
    path: '/explore/columbus',
    title: 'Columbus County NC Homes | Whiteville, Lake Waccamaw & Tabor City',
    description: 'Living in Columbus County: Whiteville, Lake Waccamaw and Tabor City — affordable rural homes, land and lake living.',
    section: 'Explore Counties',
    priority: 0.7,
    changeFrequency: 'monthly',
  },
  {
    path: '/education',
    title: 'Home Buying Education Center | First-Time Buyers in NC',
    description: 'Free home buying education for North Carolina buyers: the buying process, HUD homes, loan types and how to prepare.',
    section: 'Learn',
    priority: 0.6,
    changeFrequency: 'monthly',
  },
  {
    path: '/education/financing',
    title: 'Home Financing Guide | FHA, VA, USDA & Conventional Loans in NC',
    description: 'Compare FHA, VA, USDA and conventional mortgages, down payment assistance and NC Housing Finance Agency programs.',
    section: 'Learn',
    priority: 0.6,
    changeFrequency: 'monthly',
  },
  {
    path: '/education/buyer-preferences',
    title: 'Home Buyer Preference Tool | Tell Us What You Want',
    description: 'Tell us your must-haves — location, budget, beds, baths, lifestyle — and get matched with homes in Southeastern North Carolina.',
    section: 'Learn',
    priority: 0.6,
    changeFrequency: 'monthly',
  },
  {
    path: '/about',
    title: 'About Marc Spencer & Lightkeeper Realty',
    description: 'Meet Marc Spencer, CEO and Broker-in-Charge of Lightkeeper Realty — a local Southeastern NC agent and HUD buyer’s agency serving North Carolina.',
    section: 'Company',
    priority: 0.6,
    changeFrequency: 'yearly',
  },
  {
    path: '/contact',
    title: 'Contact a Southeastern NC Real Estate Agent',
    description: `Call or text ${PHONE_DISPLAY} or send a message to talk with Lightkeeper Realty about buying, selling or HUD homes in North Carolina.`,
    section: 'Company',
    priority: 0.7,
    changeFrequency: 'yearly',
  },
  {
    path: '/site-map',
    title: 'Site Map',
    description: 'Every page on FindaNChome.com, organized by topic.',
    section: 'Company',
    priority: 0.3,
    changeFrequency: 'monthly',
  },
];

export const sectionOrder: RouteSection[] = ['Main', 'Buy', 'Sell & Invest', 'Explore Counties', 'Learn', 'Company'];

// Private / app areas that must never be indexed.
export const privatePaths = ['/admin', '/crm', '/dashboard', '/debug', '/auth', '/login', '/forgot-password', '/api'];

export const externalResources = [
  { title: 'NC HUD home listings (USAhudhomes.com)', url: usaHudHomes.ncListings('llms'), description: 'Current HUD homes for sale in North Carolina, from our nationwide sister site.' },
  { title: 'HUD homes in every state (USAhudhomes.com)', url: usaHudHomes.allStates('llms'), description: 'Nationwide HUD home search and buyer referral network.' },
  { title: 'How HUD home buying works', url: usaHudHomes.howItWorks('llms'), description: 'Bidding periods, owner-occupant priority and incentives explained.' },
];

export function absoluteUrl(path: string) {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

export function getRoute(path: string) {
  const route = siteRoutes.find((r) => r.path === path);
  if (!route) throw new Error(`Unknown site route: ${path} — add it to lib/siteRoutes.ts`);
  return route;
}

// Per-page metadata: unique title/description, canonical URL and social cards.
export function pageMetadata(path: string): Metadata {
  const route = getRoute(path);
  return {
    title: path === '/' ? { absolute: `${route.title} | ${SITE_NAME}` } : route.title,
    description: route.description,
    alternates: { canonical: path },
    openGraph: {
      title: route.title,
      description: route.description,
      url: path,
      siteName: SITE_NAME,
      locale: 'en_US',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: route.title, description: route.description },
  };
}
