// Shared options and helpers for the consultation request form (components/ConsultationForm.tsx)
// and its API route (app/api/consultation/route.ts).

import { COUNTY_NAMES, lifestyles, type CountySlug } from './lifestyles';
import { communities, getCommunity } from './communities';
import { neighborhoods } from './neighborhoods';

export const INTENT_OPTIONS = [
  { value: 'buy', label: 'Buy a home' },
  { value: 'sell', label: 'Sell a home' },
  { value: 'invest', label: 'Invest / rental property' },
  { value: 'relocate', label: 'Relocate / military PCS' },
  { value: 'hud', label: 'Buy a HUD home' },
  { value: 'build', label: 'Build new / buy land' },
] as const;

export const TIMEFRAME_OPTIONS = ['As soon as possible', '1–3 months', '3–6 months', '6–12 months', 'Just exploring'];

export const PRICE_OPTIONS = [
  'Under $250k',
  '$250k–$400k',
  '$400k–$600k',
  '$600k–$850k',
  '$850k–$1.2M',
  '$1.2M+',
  'Not sure yet',
];

export const FINANCING_OPTIONS = ['Cash', 'Conventional', 'VA loan', 'FHA loan', 'USDA loan', 'Not sure yet'];

export const MUST_HAVE_OPTIONS = [
  'Golf course community',
  'Gated community',
  '55+ / active adult',
  'Waterfront or deep-water dock',
  'Walk or bike to the beach',
  'New construction',
  'Single-level living',
  'Acreage / no HOA',
  'Great schools',
  'Near Camp Lejeune',
  'Short-term rental potential',
  'Low HOA fees',
];

export const COUNTY_SLUGS = Object.keys(COUNTY_NAMES) as CountySlug[];

export interface ConsultationContext {
  counties?: string[];
  communities?: string[];
  neighborhoods?: string[];
  lifestyles?: string[];
  intent?: string[];
  mustHaves?: string[];
}

export interface ConsultationPayload {
  name: string;
  email: string;
  phone?: string;
  preferredContact?: 'call' | 'text' | 'email';
  intent: string[];
  timeframe?: string;
  priceRange?: string;
  financing?: string;
  counties: string[];
  communities: string[];
  neighborhoods: string[];
  lifestyles: string[];
  mustHaves: string[];
  message?: string;
  sourcePage?: string;
  /** Honeypot: real visitors never fill this in. */
  company?: string;
}

const LIFESTYLE_MUST_HAVES: Record<string, string> = {
  golf: 'Golf course community',
  waterfront: 'Waterfront or deep-water dock',
  beach: 'Walk or bike to the beach',
  'new-construction': 'New construction',
  acreage: 'Acreage / no HOA',
  military: 'Near Camp Lejeune',
  investment: 'Short-term rental potential',
};

/** Work out what a visitor is interested in from the page they are on, to pre-fill the form. */
export function contextFromPath(pathname: string): ConsultationContext {
  const parts = pathname.split('/').filter(Boolean);
  const [section, a, b] = parts;

  if (section === 'community' && a && b) {
    const c = getCommunity(a, b);
    if (c) return { counties: [c.county], communities: [c.slug] };
  }
  if (section === 'explore' && a && a in COUNTY_NAMES) {
    return { counties: [a] };
  }
  if (section === 'lifestyle' && a) {
    const must = LIFESTYLE_MUST_HAVES[a];
    return {
      lifestyles: [a],
      mustHaves: must ? [must] : [],
      intent: a === 'investment' ? ['invest'] : a === 'military' ? ['relocate'] : undefined,
    };
  }
  if (section === 'hud') return { intent: ['hud'] };
  if (section === 'sellers' || section === 'sell') return { intent: ['sell'] };
  if (section === 'investments') return { intent: ['invest'] };
  return {};
}

/** Merge two contexts, de-duplicating values. */
export function mergeContext(...contexts: (ConsultationContext | undefined)[]): Required<ConsultationContext> {
  const out: Required<ConsultationContext> = {
    counties: [], communities: [], neighborhoods: [], lifestyles: [], intent: [], mustHaves: [],
  };
  for (const ctx of contexts) {
    if (!ctx) continue;
    for (const key of Object.keys(out) as (keyof ConsultationContext)[]) {
      for (const v of ctx[key] ?? []) if (!out[key].includes(v)) out[key].push(v);
    }
  }
  // Selecting a community or neighborhood implies its county.
  for (const slug of out.communities) {
    const c = communities.find((x) => x.slug === slug);
    if (c && !out.counties.includes(c.county)) out.counties.push(c.county);
  }
  for (const slug of out.neighborhoods) {
    const n = neighborhoods.find((x) => x.slug === slug);
    if (n && !out.counties.includes(n.county)) out.counties.push(n.county);
  }
  return out;
}

export const VALID = {
  intent: new Set<string>(INTENT_OPTIONS.map((o) => o.value)),
  counties: new Set<string>(COUNTY_SLUGS),
  communities: new Set(communities.map((c) => c.slug)),
  neighborhoods: new Set(neighborhoods.map((n) => n.slug)),
  lifestyles: new Set(lifestyles.map((l) => l.slug)),
  mustHaves: new Set(MUST_HAVE_OPTIONS),
  timeframe: new Set(TIMEFRAME_OPTIONS),
  priceRange: new Set(PRICE_OPTIONS),
  financing: new Set(FINANCING_OPTIONS),
};

/** Human-readable labels, used in the notification email. */
export function labelFor(kind: 'counties' | 'communities' | 'neighborhoods' | 'lifestyles' | 'intent', value: string) {
  switch (kind) {
    case 'counties': return COUNTY_NAMES[value as CountySlug] ?? value;
    case 'communities': return communities.find((c) => c.slug === value)?.name ?? value;
    case 'neighborhoods': return neighborhoods.find((n) => n.slug === value)?.name ?? value;
    case 'lifestyles': return lifestyles.find((l) => l.slug === value)?.name ?? value;
    case 'intent': return INTENT_OPTIONS.find((o) => o.value === value)?.label ?? value;
  }
}
