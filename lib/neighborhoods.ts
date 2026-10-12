// Golf, master-planned and new construction neighborhoods, shown on the county guides, the community
// guides (/community/[county]/[slug]) and the matching lifestyle pages. Builders, amenities and phases
// change often: keep `UPDATED` current and point buyers to the sales office for availability and pricing.

import type { CountySlug } from './lifestyles';

export const NEIGHBORHOODS_UPDATED = 'October 2026';

export type NeighborhoodStatus = 'new-construction' | 'custom-lots' | 'mostly-resale' | 'planned';

export const STATUS_LABELS: Record<NeighborhoodStatus, string> = {
  'new-construction': 'Builders selling now',
  'custom-lots': 'Custom homes & lots',
  'mostly-resale': 'Mostly resale',
  planned: 'Planned / approved',
};

export interface Neighborhood {
  slug: string;
  name: string;
  county: CountySlug;
  /** Town or mailing area, e.g. "Leland" or "Ocean Isle Beach area". */
  town: string;
  status: NeighborhoodStatus;
  description: string;
  /** Golf course names/architects when it is a golf community. */
  golf?: string;
  builders?: string[];
  amenities: string[];
  gated?: boolean;
  /** 55+ / active adult. */
  activeAdult?: boolean;
  waterfront?: boolean;
  /** Lifestyle slugs from lib/lifestyles.ts. */
  lifestyles: string[];
  /** Community guide slugs (lib/communities.ts) this neighborhood is closest to. */
  near: string[];
}

export const neighborhoods: Neighborhood[] = [
  // ───────── Golf course communities ─────────
  {
    slug: 'st-james-plantation',
    name: 'St. James Plantation',
    county: 'brunswick',
    town: 'Southport / St. James',
    status: 'custom-lots',
    description:
      'One of the largest gated golf communities on the North Carolina coast, between Southport and Oak Island along the Intracoastal Waterway. Single-family, attached and condo homes, with custom new construction still underway.',
    golf: 'Four courses: The Reserve Club (Jack Nicklaus), The Founders Club (P.B. Dye), The Members Club (Hale Irwin) and The Players Club (Tim Cate)',
    amenities: ['24-hour gated entrance', 'Full-service marina', 'Beach club on Oak Island', 'Pools & fitness', 'Tennis & pickleball', 'Golf membership optional'],
    gated: true,
    waterfront: true,
    lifestyles: ['golf', 'retirement', 'waterfront', 'new-construction'],
    near: ['southport', 'oak-island'],
  },
  {
    slug: 'winding-river-plantation',
    name: 'Winding River Plantation',
    county: 'brunswick',
    town: 'Bolivia',
    status: 'custom-lots',
    description:
      'Gated golf and river community on the Lockwood Folly River with its own day marina and a beach club on Holden Beach. Custom builders continue to build on remaining lots.',
    golf: 'Carolina National Golf Club: 27 holes designed by Fred Couples (membership optional)',
    amenities: ['Gated entrance', 'River House & day marina', 'Boat launch with ICW access', 'Holden Beach oceanfront beach club', 'Clubhouse, pool & fitness', 'Tennis & bocce'],
    gated: true,
    waterfront: true,
    lifestyles: ['golf', 'waterfront', 'retirement'],
    near: ['holden-beach', 'southport'],
  },
  {
    slug: 'sea-trail-plantation',
    name: 'Sea Trail Plantation',
    county: 'brunswick',
    town: 'Sunset Beach',
    status: 'new-construction',
    description:
      'Master-planned golf and beach community on the mainland side of Sunset Beach, minutes from the island. New construction homes, villas, condos and buildable lots alongside established neighborhoods.',
    golf: 'Three 18-hole championship courses: Rees Jones, Dan Maples and Willard Byrd',
    amenities: ['Three golf courses', 'Clubhouse & dining', 'Pools', 'Minutes to Sunset Beach', 'Condos, villas & single-family'],
    lifestyles: ['golf', 'retirement', 'beach', 'new-construction'],
    near: ['sunset-beach', 'ocean-isle-beach'],
  },
  {
    slug: 'ocean-ridge-plantation',
    name: 'Ocean Ridge Plantation',
    county: 'brunswick',
    town: 'Ocean Isle Beach area',
    status: 'custom-lots',
    description:
      'Gated community off US 17 built around the "Big Cats" golf courses, with a private oceanfront beach club for residents on Sunset Beach.',
    golf: 'The Big Cats: Tiger\'s Eye, Leopard\'s Chase, Lion\'s Paw and Panther\'s Run (four 18-hole courses)',
    amenities: ['Gated entrance', 'Private oceanfront beach club', 'Two community centers', 'Pools', 'Tennis & pickleball', 'Walking trails & fishing pond'],
    gated: true,
    lifestyles: ['golf', 'retirement', 'beach'],
    near: ['ocean-isle-beach', 'sunset-beach'],
  },
  {
    slug: 'brunswick-plantation',
    name: 'Brunswick Plantation',
    county: 'brunswick',
    town: 'Calabash',
    status: 'new-construction',
    description:
      'Large gated golf community in Calabash with several neighborhoods and active new construction, a short drive to Sunset Beach, Ocean Isle and North Myrtle Beach.',
    golf: '27-hole championship golf course',
    builders: ['Lennar', 'D.R. Horton (Rich Square)'],
    amenities: ['Gated with 24-hour security', '11,000 sq. ft. clubhouse', 'Multiple pools', 'Tennis courts', 'On-site restaurant'],
    gated: true,
    lifestyles: ['golf', 'new-construction', 'retirement', 'first-time'],
    near: ['sunset-beach', 'ocean-isle-beach'],
  },
  {
    slug: 'brunswick-forest',
    name: 'Brunswick Forest',
    county: 'brunswick',
    town: 'Leland',
    status: 'new-construction',
    description:
      'Roughly 4,500-acre master-planned community in Leland, about 15 minutes from downtown Wilmington, with multiple builders and neighborhoods still under construction.',
    golf: 'Cape Fear National: 18-hole championship course with a ~7,000 sq. ft. clubhouse',
    builders: ['Multiple builders, including Stanley Martin (Trestle Ridge)'],
    amenities: ['Fitness center', 'Indoor & outdoor pools', '40+ miles of trails', 'River Club with kayak access', 'Restaurant & community garden'],
    lifestyles: ['golf', 'new-construction', 'retirement', 'first-time'],
    near: ['leland'],
  },
  {
    slug: 'compass-pointe',
    name: 'Compass Pointe',
    county: 'brunswick',
    town: 'Leland',
    status: 'new-construction',
    description:
      'Gated, resort-style community in Leland known for its amenity center and lazy river, with a golf course built through the community.',
    golf: 'The Pointe: 18-hole course designed by Rick Robbins (separate membership)',
    amenities: ['Gated entrance', 'Indoor & outdoor pools with lazy river', 'Fitness & wellness center', 'Tennis & pickleball', 'Dog park & events lawn', 'Walking & biking trails'],
    gated: true,
    lifestyles: ['golf', 'new-construction', 'retirement'],
    near: ['leland'],
  },
  {
    slug: 'magnolia-greens',
    name: 'Magnolia Greens',
    county: 'brunswick',
    town: 'Leland',
    status: 'mostly-resale',
    description:
      'Established golf community in Leland close to shopping on US 17, popular with buyers who want golf and value without the newest-construction price tag.',
    golf: '27-hole golf course open to the public',
    amenities: ['Golf', 'Community pool & clubhouse', 'Tennis', 'Close to Leland shopping'],
    lifestyles: ['golf', 'first-time', 'retirement'],
    near: ['leland'],
  },
  {
    slug: 'crow-creek',
    name: 'Crow Creek',
    county: 'brunswick',
    town: 'Calabash',
    status: 'new-construction',
    description:
      'Golf community anchored by the Crow Creek course, with new single-family homes and condos near Calabash and Sunset Beach.',
    golf: 'Crow Creek Golf Club',
    amenities: ['Golf course', 'Community pool', 'Single-family homes & condos'],
    lifestyles: ['golf', 'new-construction', 'retirement'],
    near: ['sunset-beach'],
  },
  {
    slug: 'thistle-golf-club',
    name: 'Thistle Golf Club',
    county: 'brunswick',
    town: 'Sunset Beach',
    status: 'custom-lots',
    description:
      'Custom homes and homesites within the private Thistle Golf Club, a well-regarded course near the South Carolina line.',
    golf: 'Thistle Golf Club (private)',
    amenities: ['Private golf club', 'Custom home sites'],
    lifestyles: ['golf', 'retirement'],
    near: ['sunset-beach'],
  },
  {
    slug: 'carolina-shores',
    name: 'Carolina Shores',
    county: 'brunswick',
    town: 'Calabash area',
    status: 'mostly-resale',
    description:
      'Established town built around an 18-hole golf course and clubhouse, with single-family homes, patio homes and villas at approachable prices.',
    golf: '18-hole golf course & clubhouse',
    amenities: ['Golf', 'Patio homes & villas', 'Close to Calabash dining'],
    lifestyles: ['golf', 'retirement', 'first-time'],
    near: ['sunset-beach'],
  },

  // ───────── New home communities ─────────
  {
    slug: 'del-webb-mallory-creek',
    name: 'Del Webb Wilmington at Mallory Creek',
    county: 'brunswick',
    town: 'Leland',
    status: 'new-construction',
    description:
      '55+ active adult community from Del Webb on about 300 acres near River Road, planned for roughly 760 homes.',
    builders: ['Del Webb'],
    amenities: ['~20,000 sq. ft. clubhouse', 'Indoor & outdoor pools', 'Fitness & yoga', 'Pickleball & bocce', 'Lifestyle director, clubs & activities', 'Trails, dog park & community garden'],
    activeAdult: true,
    lifestyles: ['retirement', 'new-construction'],
    near: ['leland'],
  },
  {
    slug: 'east-lake',
    name: 'East Lake',
    county: 'brunswick',
    town: 'Leland',
    status: 'new-construction',
    description: 'Active adult new home community in Leland from Ryan Homes.',
    builders: ['Ryan Homes'],
    amenities: ['Active adult community', 'Low-maintenance living'],
    activeAdult: true,
    lifestyles: ['retirement', 'new-construction'],
    near: ['leland'],
  },
  {
    slug: 'terrapin',
    name: 'Terrapin',
    county: 'brunswick',
    town: 'Leland',
    status: 'new-construction',
    description: 'Master-planned community in the heart of Leland by Logan Homes, a long-time coastal Carolina builder.',
    builders: ['Logan Homes'],
    amenities: ['Master-planned community', 'Close to Leland shopping & schools'],
    lifestyles: ['new-construction', 'first-time'],
    near: ['leland'],
  },
  {
    slug: 'middle-creek-village',
    name: 'Middle Creek Village',
    county: 'brunswick',
    town: 'Bolivia',
    status: 'new-construction',
    description: 'Single-family homes plus coastal cottages and villas from Ryan Homes, among the more affordable new construction in the county.',
    builders: ['Ryan Homes'],
    amenities: ['Single-family homes', 'Coastal cottages & villas'],
    lifestyles: ['new-construction', 'first-time'],
    near: ['southport', 'holden-beach'],
  },
  {
    slug: 'river-tide-farms',
    name: 'River Tide Farms',
    county: 'brunswick',
    town: 'Bolivia',
    status: 'new-construction',
    description: 'New single-family community from Mungo Homes with a planned pool and cabana.',
    builders: ['Mungo Homes'],
    amenities: ['Planned pool & cabana'],
    lifestyles: ['new-construction', 'first-time'],
    near: ['southport', 'holden-beach'],
  },
  {
    slug: 'bella-point',
    name: 'Bella Point',
    county: 'brunswick',
    town: 'Bolivia',
    status: 'new-construction',
    description: 'D.R. Horton new home community in Bolivia, central to Southport, Oak Island and Holden Beach.',
    builders: ['D.R. Horton'],
    amenities: ['Single-family homes'],
    lifestyles: ['new-construction', 'first-time'],
    near: ['southport', 'oak-island'],
  },
  {
    slug: 'solserra',
    name: 'Solserra',
    county: 'brunswick',
    town: 'Shallotte',
    status: 'new-construction',
    description: 'Riverfront new home community along the Shallotte River, close to US 17 and the beaches, with amenities planned for a later phase.',
    builders: ['Pulte Homes'],
    amenities: ['Shallotte River setting', 'Planned pool & pickleball'],
    waterfront: true,
    lifestyles: ['new-construction', 'waterfront'],
    near: ['ocean-isle-beach', 'holden-beach'],
  },
  {
    slug: 'ocean-isle-palms',
    name: 'Ocean Isle Palms',
    county: 'brunswick',
    town: 'Shallotte / Ocean Isle',
    status: 'new-construction',
    description: 'Toll Brothers community a short drive from Ocean Isle Beach.',
    builders: ['Toll Brothers'],
    amenities: ['Single-family homes', 'Minutes to Ocean Isle Beach'],
    lifestyles: ['new-construction', 'beach'],
    near: ['ocean-isle-beach'],
  },
  {
    slug: 'meadows-at-wildwood-village',
    name: 'The Meadows at Wildwood Village',
    county: 'brunswick',
    town: 'Shallotte',
    status: 'new-construction',
    description: 'D.R. Horton new homes in Shallotte, among the lower entry prices for new construction near the Brunswick beaches.',
    builders: ['D.R. Horton'],
    amenities: ['Single-family homes'],
    lifestyles: ['new-construction', 'first-time'],
    near: ['ocean-isle-beach', 'holden-beach'],
  },
  {
    slug: 'courtyards-by-carrell',
    name: 'Courtyards by Carrell',
    county: 'brunswick',
    town: 'Ocean Isle Beach',
    status: 'new-construction',
    description: 'A 66-home patio home neighborhood geared toward buyers 55 and older, with low-maintenance living near the beach.',
    amenities: ['Patio homes', 'Pickleball court', 'Low-maintenance living'],
    activeAdult: true,
    lifestyles: ['retirement', 'new-construction', 'beach'],
    near: ['ocean-isle-beach'],
  },
  {
    slug: 'coastal-club-of-the-carolinas',
    name: 'Coastal Club of the Carolinas',
    county: 'brunswick',
    town: 'Calabash',
    status: 'new-construction',
    description: 'Chesapeake Homes community with a resort-style amenity package and a design gallery for personalizing homes.',
    builders: ['Chesapeake Homes'],
    amenities: ['Resort-style pool', 'Pickleball', 'Fitness center', 'Dog park & trails', 'Fire pits & community garden'],
    lifestyles: ['new-construction', 'first-time', 'retirement'],
    near: ['sunset-beach'],
  },
  {
    slug: 'hunters-trace',
    name: 'Hunters Trace',
    county: 'brunswick',
    town: 'Calabash',
    status: 'new-construction',
    description: 'Lennar single-family community in Calabash, now selling its final phase.',
    builders: ['Lennar'],
    amenities: ['Single-family homes', 'Final phase selling'],
    lifestyles: ['new-construction', 'first-time'],
    near: ['sunset-beach'],
  },
  {
    slug: 'calabash-palms',
    name: 'Calabash Palms',
    county: 'brunswick',
    town: 'Calabash',
    status: 'new-construction',
    description: 'New townhomes from Dream Finders Homes, a lower-maintenance option near Calabash and Sunset Beach.',
    builders: ['Dream Finders Homes'],
    amenities: ['Townhomes', 'Low-maintenance living'],
    lifestyles: ['new-construction', 'first-time', 'investment'],
    near: ['sunset-beach'],
  },

  // ───────── Planned / approved ─────────
  {
    slug: 'midway-landing',
    name: 'Midway Landing',
    county: 'brunswick',
    town: 'Bolivia',
    status: 'planned',
    description: 'Large planned coastal-themed community projected at roughly 3,600 homes. Timelines for large projects can shift, so check current status.',
    amenities: ['Master-planned community (planned)'],
    lifestyles: ['new-construction'],
    near: ['southport', 'oak-island'],
  },
  {
    slug: 'cherry-tree',
    name: 'Cherry Tree',
    county: 'brunswick',
    town: 'Winnabow',
    status: 'planned',
    description: 'About 1,000 homes approved by the county in March 2026. Sewer capacity limits in parts of the county may affect when building starts.',
    amenities: ['Approved development'],
    lifestyles: ['new-construction'],
    near: ['leland', 'southport'],
  },
  {
    slug: 'mirasol',
    name: 'Mirasol',
    county: 'brunswick',
    town: 'Near St. James',
    status: 'planned',
    description: 'About 340 homes approved by the county in March 2026 near St. James. Sewer capacity limits may affect timing.',
    amenities: ['Approved development'],
    lifestyles: ['new-construction'],
    near: ['southport', 'oak-island'],
  },
];

export function getNeighborhoodsByCounty(county: CountySlug) {
  return neighborhoods.filter((n) => n.county === county);
}

export function getNeighborhoodsNear(communitySlug: string) {
  return neighborhoods.filter((n) => n.near.includes(communitySlug));
}

export function getNeighborhoodsForLifestyle(lifestyleSlug: string) {
  return neighborhoods.filter((n) => n.lifestyles.includes(lifestyleSlug) && n.status !== 'planned');
}
