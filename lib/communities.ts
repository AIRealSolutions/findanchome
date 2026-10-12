// Content for the community detail pages (/community/[county]/[slug]) and the "Key Communities"
// cards on each county guide under /explore. Populations are rounded 2020 Census figures.

import type { CountySlug } from './lifestyles';

export interface CommunitySection {
  title: string;
  text: string;
}

export interface CommunityFaq {
  question: string;
  answer: string;
}

export interface Community {
  slug: string;
  county: CountySlug;
  name: string;
  /** e.g. "Town", "City", "Unincorporated community". */
  type: string;
  population: string;
  /** Short blurb for the county-page card. */
  summary: string;
  tagline: string;
  /** Full <title>. Keep under ~60 characters. */
  seoTitle: string;
  /** Meta description. Keep under ~160 characters. */
  metaDescription: string;
  quickFacts: { label: string; value: string }[];
  overview: string[];
  highlights: CommunitySection[];
  housing: string[];
  considerations: CommunitySection[];
  faqs: CommunityFaq[];
  /** Lifestyle slugs from lib/lifestyles.ts. */
  lifestyles: string[];
  /** Community slugs (any county). */
  nearby: string[];
}

export const communities: Community[] = [
  // ───────────────────────── Onslow County ─────────────────────────
  {
    slug: 'jacksonville',
    county: 'onslow',
    name: 'Jacksonville',
    type: 'City (county seat)',
    population: '~73,000',
    summary: 'County seat and largest city, home to Camp Lejeune. Urban amenities with a strong military-family focus.',
    tagline: 'Home of Camp Lejeune and the commercial center of Onslow County',
    seoTitle: 'Jacksonville NC Homes for Sale & Area Guide',
    metaDescription:
      'Living in Jacksonville, NC: neighborhoods near Camp Lejeune & MCAS New River, VA loans, schools, housing and what to know before you buy.',
    quickFacts: [
      { label: 'Population', value: '~73,000' },
      { label: 'To Wilmington', value: '~1 hour' },
      { label: 'Schools', value: 'Onslow County Schools' },
      { label: 'Airport', value: 'Albert J. Ellis (OAJ)' },
    ],
    overview: [
      'Jacksonville is the largest city in Onslow County and the hub of daily life for tens of thousands of Marines, sailors, civilian employees, and their families. Marine Corps Base Camp Lejeune and Marine Corps Air Station New River sit right alongside the city, and that military presence shapes everything from the local economy to the steady rhythm of PCS moves each spring and summer.',
      'Beyond the bases, Jacksonville offers the conveniences of a mid-sized city: national retailers along Western Boulevard, a regional hospital, Coastal Carolina Community College, and a growing restaurant scene. The New River waterfront, Riverwalk Crossing Park, and Lejeune Memorial Gardens give the city a sense of place, and the beaches at North Topsail and Emerald Isle are an easy drive.',
    ],
    highlights: [
      { title: 'Next to the bases', text: 'Short commutes to Camp Lejeune\'s main gate, MCAS New River, and the Piney Green and Sneads Ferry gates make Jacksonville the default choice for many service members.' },
      { title: 'Riverwalk & memorials', text: 'Riverwalk Crossing Park on the New River and Lejeune Memorial Gardens, home to the Beirut and Vietnam memorials, anchor the city\'s waterfront.' },
      { title: 'Everyday convenience', text: 'Shopping, dining, medical care, and big-box stores are all close by, with Albert J. Ellis Airport just north of town.' },
      { title: 'Beach within reach', text: 'North Topsail Beach, Hammocks Beach State Park, and Emerald Isle are all within about 30–45 minutes.' },
    ],
    housing: [
      'Jacksonville has one of the most affordable housing markets on the Southeastern NC coast. Inventory ranges from established brick ranches near downtown to newer subdivisions in Hubert, Piney Green, and along the Highway 17 and Gum Branch Road corridors, plus townhomes and new construction that appeal to first-time buyers.',
      'Because so many buyers are military, VA loans are common and sellers and agents here are used to them. Strong rental demand from service members also makes Jacksonville a popular market for investors and for military families who plan to keep a home as a rental after they PCS.',
    ],
    considerations: [
      { title: 'Military move cycles', text: 'Spring and summer PCS season brings a surge of buyers and listings. Plan ahead if your timeline is fixed by orders.' },
      { title: 'Rent vs. resale', text: 'If you may PCS in a few years, think about how the home will perform as a rental: proximity to base, school zone, and HOA rental rules matter.' },
      { title: 'Flood zones near the river', text: 'Some areas near the New River and its creeks are in flood zones. Check the flood map and get insurance quotes early.' },
    ],
    faqs: [
      { question: 'Is Jacksonville, NC a good place to buy with a VA loan?', answer: 'Yes. VA loans are extremely common in Jacksonville, and local lenders, appraisers, and sellers are familiar with the process. Eligible buyers can often purchase with no down payment.' },
      { question: 'How far is Jacksonville from the beach?', answer: 'North Topsail Beach is roughly 25–35 minutes away, and Emerald Isle and the Hammocks Beach area near Swansboro are about 30–45 minutes, depending on where you live in the city.' },
      { question: 'Which school district serves Jacksonville?', answer: 'Jacksonville is served by Onslow County Schools. Families should confirm the assigned schools for any specific address, since attendance zones can change.' },
    ],
    lifestyles: ['military', 'first-time', 'investment', 'new-construction'],
    nearby: ['richlands', 'swansboro', 'sneads-ferry', 'north-topsail-beach'],
  },
  {
    slug: 'swansboro',
    county: 'onslow',
    name: 'Swansboro',
    type: 'Town',
    population: '~3,700',
    summary: 'Historic coastal town on the White Oak River with a charming downtown, waterfront dining, and beach access.',
    tagline: 'The "Friendly City by the Sea" on the White Oak River',
    seoTitle: 'Swansboro NC Homes for Sale & Town Guide',
    metaDescription:
      'Living in Swansboro, NC: historic waterfront downtown, Hammocks Beach State Park, nearby Emerald Isle, neighborhoods, and tips for buying near the water.',
    quickFacts: [
      { label: 'Population', value: '~3,700' },
      { label: 'To Jacksonville', value: '~25 minutes' },
      { label: 'Schools', value: 'Onslow County Schools' },
      { label: 'Nearby beach', value: 'Emerald Isle / Bear Island' },
    ],
    overview: [
      'Swansboro is one of the oldest towns on the North Carolina coast, sitting where the White Oak River meets the Intracoastal Waterway. Its walkable historic downtown is filled with shops, galleries, and waterfront restaurants, and the town still feels like a small fishing village even as the area around it grows.',
      'Residents enjoy quick access to Hammocks Beach State Park, where a passenger ferry crosses to the undeveloped beaches of Bear Island, and the bridge to Emerald Isle is just across the river. Swansboro is a favorite for retirees, boaters, and military families who want a coastal small-town life within commuting distance of Camp Lejeune.',
    ],
    highlights: [
      { title: 'Historic waterfront downtown', text: 'Front Street\'s shops, cafés, and docks make for an easy, walkable afternoon, and the town hosts popular events such as the Mullet Festival each fall.' },
      { title: 'Hammocks Beach State Park', text: 'Kayak or take the ferry to Bear Island, one of the most pristine undeveloped barrier islands on the coast.' },
      { title: 'On the water', text: 'The White Oak River, Intracoastal Waterway, and Bogue Inlet offer fishing, paddling, and boating right from town.' },
      { title: 'Two counties of beaches', text: 'Emerald Isle and the Crystal Coast in Carteret County are minutes away across the bridge.' },
    ],
    housing: [
      'Homes in and around Swansboro include historic cottages near downtown, waterfront and water-access homes along the White Oak River and its creeks, and newer subdivisions along Highway 24 and toward Hubert and Cedar Point.',
      'Waterfront and deep-water lots command a premium, while inland neighborhoods a few minutes from town can offer more space for the money. Demand is steady thanks to the combination of coastal charm and access to Camp Lejeune.',
    ],
    considerations: [
      { title: 'Flood zones and insurance', text: 'Much of the land near the river and sound is low-lying. Review flood maps, elevation certificates, and insurance costs before making an offer.' },
      { title: 'Highway 24 traffic', text: 'Commutes toward Jacksonville and Camp Lejeune run along NC 24, which can be busy at rush hour and on summer weekends.' },
    ],
    faqs: [
      { question: 'Is Swansboro a good place for military families?', answer: 'Many military families choose Swansboro for its small-town feel and coastal setting. It is about 25 minutes from Jacksonville and has access to Camp Lejeune\'s gates via NC 24 and NC 172.' },
      { question: 'How do you get to Bear Island from Swansboro?', answer: 'Hammocks Beach State Park, just outside Swansboro, runs a seasonal passenger ferry to Bear Island, and many visitors paddle over by kayak.' },
      { question: 'Can you buy waterfront property in Swansboro?', answer: 'Yes. Swansboro has waterfront homes and lots on the White Oak River, the Intracoastal Waterway, and several creeks. Water depth, docks, and permitting vary by property, so local guidance is important.' },
    ],
    lifestyles: ['waterfront', 'historic', 'military', 'retirement'],
    nearby: ['jacksonville', 'sneads-ferry', 'north-topsail-beach'],
  },
  {
    slug: 'north-topsail-beach',
    county: 'onslow',
    name: 'North Topsail Beach',
    type: 'Town',
    population: '~1,000',
    summary: 'Quiet beach town on the northern end of Topsail Island with uncrowded beaches and residential neighborhoods.',
    tagline: 'The quiet north end of Topsail Island',
    seoTitle: 'North Topsail Beach NC Homes for Sale & Guide',
    metaDescription:
      'North Topsail Beach, NC guide: oceanfront condos and homes, quiet beaches, flood insurance and CBRA zones, vacation rentals, and buying tips.',
    quickFacts: [
      { label: 'Population', value: '~1,000' },
      { label: 'To Jacksonville', value: '~30 minutes' },
      { label: 'To Wilmington', value: '~50 minutes' },
      { label: 'Access', value: 'NC 210 high-rise bridge' },
    ],
    overview: [
      'North Topsail Beach occupies the northern stretch of Topsail Island in Onslow County. It is noticeably less developed than many North Carolina beach towns, with long stretches of quiet sand, soundside marsh views, and a mix of oceanfront condominiums and single-family beach homes.',
      'The town is popular with families looking for a relaxed vacation home, retirees who want a peaceful beach routine, and military families from nearby Camp Lejeune. Surf City\'s restaurants and shops are a short drive south, and Jacksonville is about half an hour away.',
    ],
    highlights: [
      { title: 'Uncrowded beaches', text: 'Fewer commercial buildings and more open space mean less crowded beaches, even in summer.' },
      { title: 'Ocean and sound', text: 'Many homes enjoy ocean views on one side and marsh or sound views on the other, with great kayaking and fishing.' },
      { title: 'Topsail Island community', text: 'Easy access to Surf City and Topsail Beach for dining, the sea turtle hospital, and island events.' },
      { title: 'Close to Camp Lejeune', text: 'One of the closest beach towns to the base, via the NC 210 bridge and Sneads Ferry.' },
    ],
    housing: [
      'Housing in North Topsail Beach is largely oceanfront and second-row condominiums, townhomes, and raised single-family homes on pilings. Many properties are used as vacation rentals when owners are not in residence.',
      'Pricing depends heavily on oceanfront location, elevation, construction age, and the condition of the dune system in front of the property.',
    ],
    considerations: [
      { title: 'CBRA zones', text: 'Parts of North Topsail Beach fall within Coastal Barrier Resources Act zones, where federally backed flood insurance (NFIP) is not available. This affects financing and insurance, so confirm a property\'s status early.' },
      { title: 'Erosion and storms', text: 'The north end of Topsail Island has a history of erosion and storm impacts. Ask about beach nourishment, dune health, and past storm damage.' },
      { title: 'Rental and HOA rules', text: 'Condo associations set their own rules on rentals, pets, and special assessments. Review the HOA documents and reserves carefully.' },
    ],
    faqs: [
      { question: 'Can I get flood insurance in North Topsail Beach?', answer: 'Most areas can, but properties within CBRA zones are not eligible for NFIP flood insurance and must rely on private coverage. A local agent and insurance broker can help you check a specific address.' },
      { question: 'Is North Topsail Beach good for vacation rentals?', answer: 'Many owners rent their homes and condos seasonally. Rental performance depends on location, size, amenities, and HOA rules, so review comparable rental history before you buy.' },
      { question: 'How is North Topsail Beach different from Surf City?', answer: 'North Topsail is quieter and more residential, with fewer shops and restaurants. Surf City, to the south, is the island\'s commercial center.' },
    ],
    lifestyles: ['beach', 'investment', 'retirement', 'military'],
    nearby: ['sneads-ferry', 'surf-city', 'topsail-beach', 'jacksonville'],
  },
  {
    slug: 'sneads-ferry',
    county: 'onslow',
    name: 'Sneads Ferry',
    type: 'Unincorporated community',
    population: '~3,000',
    summary: 'Coastal fishing village on the New River with beach access, shrimping heritage, and outdoor recreation.',
    tagline: 'A working fishing village on the New River',
    seoTitle: 'Sneads Ferry NC Homes for Sale & Community Guide',
    metaDescription:
      'Living in Sneads Ferry, NC: New River waterfront, shrimping heritage, minutes to North Topsail Beach and Camp Lejeune, homes, and buying tips.',
    quickFacts: [
      { label: 'Population', value: '~3,000' },
      { label: 'To Jacksonville', value: '~30 minutes' },
      { label: 'To the beach', value: '~10 minutes' },
      { label: 'Schools', value: 'Onslow County Schools' },
    ],
    overview: [
      'Sneads Ferry is a small, unincorporated fishing village where the New River meets the sound, just across the bridge from North Topsail Beach. Commercial shrimp boats still work out of the local docks, and the community celebrates that heritage each summer with the Sneads Ferry Shrimp Festival.',
      'The area has grown steadily as military families, retirees, and remote workers discover its mix of waterfront living, quick beach access, and lower costs than the island. Camp Lejeune\'s Courthouse Bay area is nearby, making it a convenient choice for many Marines.',
    ],
    highlights: [
      { title: 'Fresh local seafood', text: 'Seafood markets and docks sell shrimp, fish, and oysters straight off the boats.' },
      { title: 'Minutes to the beach', text: 'The NC 210 bridge puts North Topsail Beach about 10 minutes away.' },
      { title: 'Boating and fishing', text: 'Public ramps and marinas provide access to the New River, the Intracoastal Waterway, and New River Inlet.' },
      { title: 'Golf and community amenities', text: 'Nearby communities such as North Shore Country Club offer golf and neighborhood amenities.' },
    ],
    housing: [
      'Sneads Ferry offers a wide range of homes: riverfront and canal properties, established neighborhoods, golf course communities, and new construction subdivisions. Prices are generally lower than comparable homes on Topsail Island.',
      'Buyers who want to be near the water but avoid the higher insurance costs of oceanfront living often find Sneads Ferry a good compromise.',
    ],
    considerations: [
      { title: 'Unincorporated area', text: 'Sneads Ferry is governed by Onslow County rather than a town, which affects zoning, permits, and services. Check water and sewer availability for each property.' },
      { title: 'Flood zones', text: 'Waterfront and low-lying areas may be in flood zones, so get insurance quotes early.' },
    ],
    faqs: [
      { question: 'How close is Sneads Ferry to Camp Lejeune?', answer: 'Sneads Ferry sits near the Courthouse Bay area of Camp Lejeune, and the Sneads Ferry gate gives many residents a quick commute onto the base.' },
      { question: 'Is Sneads Ferry on the beach?', answer: 'Sneads Ferry itself is on the mainland along the New River and sound. North Topsail Beach is just across the NC 210 bridge, roughly 10 minutes away.' },
      { question: 'When is the Sneads Ferry Shrimp Festival?', answer: 'The Shrimp Festival is traditionally held in August and celebrates the community\'s commercial fishing heritage.' },
    ],
    lifestyles: ['waterfront', 'military', 'golf', 'new-construction'],
    nearby: ['north-topsail-beach', 'jacksonville', 'swansboro', 'surf-city'],
  },
  {
    slug: 'richlands',
    county: 'onslow',
    name: 'Richlands',
    type: 'Town',
    population: '~2,300',
    summary: 'Small inland town with affordable homes, larger lots, and rural charm about 20 minutes from Jacksonville.',
    tagline: 'Small-town living with room to spread out',
    seoTitle: 'Richlands NC Homes for Sale & Town Guide',
    metaDescription:
      'Living in Richlands, NC: affordable homes, acreage and new subdivisions in northwest Onslow County, about 20 minutes from Jacksonville and Camp Lejeune.',
    quickFacts: [
      { label: 'Population', value: '~2,300' },
      { label: 'To Jacksonville', value: '~20 minutes' },
      { label: 'Schools', value: 'Onslow County Schools' },
      { label: 'Main routes', value: 'US 258 & NC 24' },
    ],
    overview: [
      'Richlands is a small town in northwest Onslow County surrounded by farmland and growing neighborhoods. It has a quiet downtown, community parks, and a close-knit feel, yet Jacksonville and Camp Lejeune are only about 20 minutes away.',
      'Buyers are drawn to Richlands for its value: larger lots, newer homes, and lower prices than many coastal areas. It is a popular choice for military families who want more space, as well as for buyers looking for acreage or a slower pace of life.',
    ],
    highlights: [
      { title: 'More home for the money', text: 'Newer subdivisions and rural properties often offer more square footage and land than comparable homes closer to the coast.' },
      { title: 'Rural and small-town feel', text: 'Farm country, open space, and community events give Richlands a classic small-town atmosphere.' },
      { title: 'Easy commute', text: 'US 258 and NC 24 connect Richlands to Jacksonville, Camp Lejeune, and MCAS New River.' },
      { title: 'Acreage options', text: 'Land and mini-farm properties are more available here than in most of Onslow County.' },
    ],
    housing: [
      'Richlands offers a mix of new construction neighborhoods, established homes in town, manufactured homes on land, and rural acreage. It is one of the more affordable places to buy in Onslow County.',
      'Some rural properties may qualify for USDA loans, which can allow eligible buyers to purchase with no down payment.',
    ],
    considerations: [
      { title: 'Well and septic', text: 'Many properties outside town limits use private wells and septic systems. Plan for well water testing and a septic inspection.' },
      { title: 'Distance to the coast', text: 'The beaches are about 45 minutes away, so Richlands suits buyers who value space and price over beach proximity.' },
    ],
    faqs: [
      { question: 'Is Richlands, NC affordable?', answer: 'Richlands is generally one of the more affordable areas in Onslow County, with newer homes and larger lots at lower prices than coastal communities.' },
      { question: 'Can I use a USDA loan in Richlands?', answer: 'Many properties in and around Richlands may be eligible for USDA financing. Eligibility depends on the property location and household income, so check with a lender.' },
      { question: 'How long is the commute from Richlands to Camp Lejeune?', answer: 'Most commutes run about 25–40 minutes depending on the gate and time of day.' },
    ],
    lifestyles: ['acreage', 'first-time', 'military', 'new-construction'],
    nearby: ['jacksonville', 'sneads-ferry', 'burgaw'],
  },

  // ───────────────────────── Pender County ─────────────────────────
  {
    slug: 'surf-city',
    county: 'pender',
    name: 'Surf City',
    type: 'Town',
    population: '~4,000',
    summary: 'The commercial heart of Topsail Island with a pier, shops, restaurants, and family attractions.',
    tagline: 'The heart of Topsail Island',
    seoTitle: 'Surf City NC Homes for Sale & Beach Town Guide',
    metaDescription:
      'Living in Surf City, NC on Topsail Island: beach homes and condos, the sea turtle hospital, the Surf City Pier, flood insurance and vacation rental tips.',
    quickFacts: [
      { label: 'Population', value: '~4,000' },
      { label: 'To Wilmington', value: '~40 minutes' },
      { label: 'Schools', value: 'Pender County Schools' },
      { label: 'Access', value: 'Surf City high-rise bridge' },
    ],
    overview: [
      'Surf City sits in the middle of Topsail Island and serves as its main town, with restaurants, shops, grocery stores, and the Surf City Pier. A high-rise bridge, opened in 2018, replaced the old swing bridge and makes getting on and off the island much easier.',
      'The town spans both the island and a growing mainland area, so buyers can choose between oceanfront living and more affordable homes a few minutes inland. It is a favorite with families, retirees, and vacation-rental investors, and it is home to the Karen Beasley Sea Turtle Rescue and Rehabilitation Center.',
    ],
    highlights: [
      { title: 'Surf City Pier', text: 'A landmark for fishing, sunset walks, and summer events on the island.' },
      { title: 'Sea turtle hospital', text: 'The Karen Beasley Sea Turtle Rescue and Rehabilitation Center is a beloved local institution.' },
      { title: 'Soundside living', text: 'Soundside Park, kayaking, and calm waters on the sound side of the island.' },
      { title: 'Island conveniences', text: 'The most shopping and dining options on Topsail Island, without driving to the mainland.' },
    ],
    housing: [
      'Island housing includes oceanfront and second-row beach homes, condos, and soundfront properties. On the mainland side, newer subdivisions offer single-family homes with a short drive to the bridge.',
      'Vacation rentals are common on the island, and rental income can help offset ownership costs for second-home buyers.',
    ],
    considerations: [
      { title: 'Flood and wind insurance', text: 'Island homes are in high-risk flood zones and need flood and wind coverage. Get quotes before you commit.' },
      { title: 'Summer traffic', text: 'Weekend traffic on the island and bridge can be heavy in peak season.' },
      { title: 'Rental regulations', text: 'Check current town rules on short-term rentals, parking, and occupancy before purchasing an investment property.' },
    ],
    faqs: [
      { question: 'Is Surf City in Pender or Onslow County?', answer: 'Most of Surf City is in Pender County, although a portion of the town extends into Onslow County. Taxes and schools depend on the specific address.' },
      { question: 'Are there year-round residents in Surf City?', answer: 'Yes. Surf City has a strong year-round community, especially on the mainland side, along with a large seasonal population in summer.' },
      { question: 'How far is Surf City from Wilmington?', answer: 'About 40 minutes via US 17 and NC 50/210, depending on traffic.' },
    ],
    lifestyles: ['beach', 'investment', 'retirement', 'new-construction'],
    nearby: ['topsail-beach', 'north-topsail-beach', 'hampstead', 'sneads-ferry'],
  },
  {
    slug: 'topsail-beach',
    county: 'pender',
    name: 'Topsail Beach',
    type: 'Town',
    population: '~460',
    summary: 'Quiet, residential beach town on the southern tip of Topsail Island with a laid-back, old-fashioned feel.',
    tagline: 'Old-fashioned beach living at the south end of Topsail Island',
    seoTitle: 'Topsail Beach NC Homes for Sale & Town Guide',
    metaDescription:
      'Topsail Beach, NC guide: quiet south-end beach homes, the Missiles and More Museum, inlet fishing, flood insurance and second-home buying tips.',
    quickFacts: [
      { label: 'Population', value: '~460 year-round' },
      { label: 'To Wilmington', value: '~45 minutes' },
      { label: 'Schools', value: 'Pender County Schools' },
      { label: 'Character', value: 'Low-rise, residential' },
    ],
    overview: [
      'Topsail Beach is a small town at the southern end of Topsail Island known for its relaxed, family-friendly atmosphere. Low-rise homes, a small business district, and wide beaches give it an old-fashioned feel that draws families back year after year.',
      'The town has a unique history: in the 1940s the island was used for Operation Bumblebee, a Navy missile testing program, and several of the original concrete observation towers still stand. The Missiles and More Museum tells that story.',
    ],
    highlights: [
      { title: 'Quiet beaches', text: 'Fewer crowds and a slower pace than many North Carolina beach towns.' },
      { title: 'Operation Bumblebee history', text: 'Historic observation towers and the Missiles and More Museum preserve the island\'s missile-testing past.' },
      { title: 'New Topsail Inlet', text: 'The south end offers excellent inlet fishing, shelling, and boating.' },
      { title: 'Small-town charm', text: 'Local restaurants, ice cream shops, and a tight-knit community.' },
    ],
    housing: [
      'Most homes in Topsail Beach are single-family beach houses, from vintage cottages to newer elevated homes, plus a few condominium complexes. Many are used as second homes and vacation rentals.',
      'Because the town is small and largely built out, inventory is limited and well-located homes can sell quickly.',
    ],
    considerations: [
      { title: 'Limited inventory', text: 'With a small number of homes, buyers should be ready to act when the right property comes along.' },
      { title: 'Storm exposure', text: 'As with all barrier island towns, check elevation, construction standards, and insurance costs carefully.' },
    ],
    faqs: [
      { question: 'Is Topsail Beach good for families?', answer: 'Yes. Topsail Beach is known for its calm, family-friendly atmosphere and has long been a favorite for multi-generational beach vacations.' },
      { question: 'What was Operation Bumblebee?', answer: 'It was a Navy program in the 1940s that tested early guided missiles on Topsail Island. Several observation towers remain and the Missiles and More Museum explains the history.' },
      { question: 'Can I rent out my Topsail Beach home?', answer: 'Many owners do. Review current town rules and talk to local property managers about expected rental demand for a specific home.' },
    ],
    lifestyles: ['beach', 'investment', 'retirement'],
    nearby: ['surf-city', 'north-topsail-beach', 'hampstead'],
  },
  {
    slug: 'hampstead',
    county: 'pender',
    name: 'Hampstead',
    type: 'Unincorporated community',
    population: '~7,000',
    summary: 'Fast-growing, family-friendly community along US 17 with golf, sound access, and strong demand.',
    tagline: 'Family-friendly living between Wilmington and Topsail',
    seoTitle: 'Hampstead NC Homes for Sale & Community Guide',
    metaDescription:
      'Living in Hampstead, NC: golf and waterfront neighborhoods, new construction, Topsail-area schools, commute to Wilmington, and what to know before you buy.',
    quickFacts: [
      { label: 'Population', value: '~7,000' },
      { label: 'To Wilmington', value: '~25 minutes' },
      { label: 'Schools', value: 'Pender County Schools' },
      { label: 'To Topsail Island', value: '~15 minutes' },
    ],
    overview: [
      'Hampstead is one of the fastest-growing communities in Southeastern North Carolina. Located along US 17 between Wilmington and Topsail Island, it offers a suburban lifestyle with golf courses, waterfront neighborhoods on the Intracoastal Waterway, and a strong sense of community.',
      'Families are drawn to the area for its neighborhoods and schools, while commuters like the easy drive to Wilmington. Each fall, the North Carolina Spot Festival celebrates the area\'s fishing heritage.',
    ],
    highlights: [
      { title: 'Golf communities', text: 'Neighborhoods built around golf courses offer amenities such as pools, clubhouses, and walking trails.' },
      { title: 'Intracoastal Waterway', text: 'Waterfront and water-access homes with docks and views of the sound.' },
      { title: 'Commuter friendly', text: 'About 25 minutes to Wilmington and 15 minutes to Topsail Island.' },
      { title: 'Growing amenities', text: 'New shopping, dining, and services continue to open along the US 17 corridor.' },
    ],
    housing: [
      'Hampstead has a wide range of homes: waterfront estates, golf course homes, established subdivisions, and many new construction communities. Prices are often lower than comparable homes in northern New Hanover County.',
      'Demand from Wilmington-area buyers has made Hampstead one of the more active markets in Pender County.',
    ],
    considerations: [
      { title: 'Traffic on US 17', text: 'Rush-hour traffic on US 17 can be heavy. The Hampstead Bypass project is intended to relieve congestion, so ask how it affects any home you are considering.' },
      { title: 'HOA rules', text: 'Many neighborhoods have HOAs with rules and fees. Review documents carefully.' },
      { title: 'Well, septic, and sewer', text: 'Utilities vary by neighborhood. Confirm water and sewer service for each property.' },
    ],
    faqs: [
      { question: 'Is Hampstead a good place for families?', answer: 'Hampstead is popular with families for its neighborhoods, parks, and schools. Confirm school assignments for specific addresses with Pender County Schools.' },
      { question: 'How long is the commute from Hampstead to Wilmington?', answer: 'Most commutes take about 25–35 minutes depending on traffic and destination.' },
      { question: 'Is Hampstead incorporated?', answer: 'No. Hampstead is an unincorporated community governed by Pender County.' },
    ],
    lifestyles: ['golf', 'waterfront', 'new-construction', 'first-time'],
    nearby: ['surf-city', 'rocky-point', 'wilmington', 'topsail-beach'],
  },
  {
    slug: 'burgaw',
    county: 'pender',
    name: 'Burgaw',
    type: 'Town (county seat)',
    population: '~3,100',
    summary: 'Historic county seat with a classic courthouse square, downtown charm, and rural character.',
    tagline: 'Historic county seat and home of the NC Blueberry Festival',
    seoTitle: 'Burgaw NC Homes for Sale & Town Guide',
    metaDescription:
      'Living in Burgaw, NC: historic courthouse square, the NC Blueberry Festival, affordable homes and acreage, and an easy I-40 commute to Wilmington.',
    quickFacts: [
      { label: 'Population', value: '~3,100' },
      { label: 'To Wilmington', value: '~30 minutes' },
      { label: 'Schools', value: 'Pender County Schools' },
      { label: 'Highway', value: 'I-40' },
    ],
    overview: [
      'Burgaw is Pender County\'s county seat, built around a historic courthouse square lined with local shops and restaurants. Its tree-lined streets, historic homes, and restored train depot give the town a timeless small-town character.',
      'Each June, the North Carolina Blueberry Festival brings thousands of visitors downtown. With I-40 nearby, Burgaw offers an easy commute to Wilmington while keeping a quiet, rural lifestyle.',
    ],
    highlights: [
      { title: 'Courthouse square', text: 'A walkable historic downtown with local businesses and community events.' },
      { title: 'NC Blueberry Festival', text: 'A signature June festival celebrating the region\'s blueberry farms.' },
      { title: 'Historic homes', text: 'Older homes with character, including Victorian and early 20th-century styles.' },
      { title: 'Rural surroundings', text: 'Farms, forests, and room to spread out just outside town.' },
    ],
    housing: [
      'Burgaw offers historic homes in town, established neighborhoods, new construction, and rural properties with acreage. Prices are generally lower than in Wilmington and coastal Pender County.',
      'Some properties may be eligible for USDA financing.',
    ],
    considerations: [
      { title: 'Flood history', text: 'Parts of Burgaw and the surrounding area flooded during Hurricane Florence in 2018. Check flood maps and the history of any property.' },
      { title: 'Older homes', text: 'Historic homes can need updates to systems such as wiring, plumbing, and HVAC. A thorough inspection is important.' },
    ],
    faqs: [
      { question: 'When is the NC Blueberry Festival?', answer: 'The festival is held in downtown Burgaw each June.' },
      { question: 'How far is Burgaw from Wilmington?', answer: 'About 30 minutes via I-40.' },
      { question: 'Is Burgaw affordable?', answer: 'Burgaw is generally more affordable than Wilmington and coastal Pender County, with more land for the money.' },
    ],
    lifestyles: ['historic', 'acreage', 'first-time'],
    nearby: ['rocky-point', 'hampstead', 'wilmington', 'richlands'],
  },
  {
    slug: 'rocky-point',
    county: 'pender',
    name: 'Rocky Point',
    type: 'Unincorporated community',
    population: '~1,700',
    summary: 'Quiet residential area along I-40 with river access, outdoor recreation, and a quick drive to Wilmington.',
    tagline: 'Quiet living on the Northeast Cape Fear River',
    seoTitle: 'Rocky Point NC Homes for Sale & Area Guide',
    metaDescription:
      'Living in Rocky Point, NC: riverfront and rural homes, new subdivisions, Holly Shelter Game Land, and a 20-minute I-40 commute to Wilmington.',
    quickFacts: [
      { label: 'Population', value: '~1,700' },
      { label: 'To Wilmington', value: '~20 minutes' },
      { label: 'Schools', value: 'Pender County Schools' },
      { label: 'Highway', value: 'I-40 / US 117' },
    ],
    overview: [
      'Rocky Point is a quiet, unincorporated community in southern Pender County along the Northeast Cape Fear River. With I-40 running through the area, it offers a short commute to Wilmington and a more rural, relaxed setting.',
      'Outdoor lovers enjoy boating and fishing on the river and hunting and hiking in the nearby Holly Shelter Game Land. New subdivisions have brought more homes to the area while it keeps its country feel.',
    ],
    highlights: [
      { title: 'River access', text: 'The Northeast Cape Fear River is great for boating, paddling, and fishing.' },
      { title: 'Holly Shelter Game Land', text: 'Tens of thousands of acres of public land for hunting, hiking, and wildlife watching.' },
      { title: 'Quick commute', text: 'About 20 minutes to Wilmington via I-40.' },
      { title: 'Space and value', text: 'Larger lots and lower prices than much of New Hanover County.' },
    ],
    housing: [
      'Rocky Point offers riverfront homes, rural properties with acreage, manufactured homes on land, and new construction subdivisions.',
      'It appeals to buyers who want to be close to Wilmington without paying city prices.',
    ],
    considerations: [
      { title: 'Flood zones', text: 'Areas near the river can flood. Check flood maps and insurance costs early.' },
      { title: 'Well and septic', text: 'Many homes use private wells and septic systems. Plan for testing and inspections.' },
    ],
    faqs: [
      { question: 'How far is Rocky Point from Wilmington?', answer: 'About 20 minutes via I-40.' },
      { question: 'Is Rocky Point good for outdoor recreation?', answer: 'Yes. The Northeast Cape Fear River and Holly Shelter Game Land offer boating, fishing, hunting, and hiking.' },
      { question: 'Are there new homes in Rocky Point?', answer: 'Yes. Several new construction subdivisions have been built in the area in recent years.' },
    ],
    lifestyles: ['acreage', 'waterfront', 'new-construction', 'first-time'],
    nearby: ['burgaw', 'hampstead', 'wilmington'],
  },

  // ───────────────────────── New Hanover County ─────────────────────────
  {
    slug: 'wilmington',
    county: 'new-hanover',
    name: 'Wilmington',
    type: 'City (county seat)',
    population: '~120,000',
    summary: 'Vibrant port city with a historic riverfront, film industry, university, and urban amenities.',
    tagline: 'Historic port city on the Cape Fear River',
    seoTitle: 'Wilmington NC Homes for Sale & City Guide',
    metaDescription:
      'Living in Wilmington, NC: historic downtown, Riverwalk, UNCW, neighborhoods from Forest Hills to Porters Neck, beaches nearby, and home buying tips.',
    quickFacts: [
      { label: 'Population', value: '~120,000' },
      { label: 'To the beach', value: '~15–20 minutes' },
      { label: 'Schools', value: 'New Hanover County Schools' },
      { label: 'Airport', value: 'Wilmington Intl. (ILM)' },
    ],
    overview: [
      'Wilmington is the largest city in Southeastern North Carolina and the economic and cultural center of the region. Its downtown sits along the Cape Fear River, with a Riverwalk, restaurants, breweries, and one of the largest historic districts in the state.',
      'The city is home to the University of North Carolina Wilmington, Cape Fear Community College, Novant Health New Hanover Regional Medical Center, and a thriving film and television industry. Wrightsville, Carolina, and Kure beaches are all within about 20 minutes.',
    ],
    highlights: [
      { title: 'Historic downtown & Riverwalk', text: 'A walkable riverfront with dining, shops, and views of the Battleship North Carolina.' },
      { title: 'Education and health care', text: 'UNCW, Cape Fear Community College, and a major regional medical center.' },
      { title: 'Arts and film', text: 'A long history of film production, plus theaters, galleries, and festivals such as the Azalea Festival.' },
      { title: 'Parks and gardens', text: 'Airlie Gardens, Greenfield Lake, and miles of greenways and trails.' },
    ],
    housing: [
      'Wilmington offers everything from historic homes downtown and in Carolina Heights to mid-century neighborhoods like Forest Hills, condos near Mayfaire, and suburban subdivisions in Porters Neck, Ogden, and Monkey Junction.',
      'Demand is strong thanks to the city\'s amenities and proximity to the beach, and well-priced homes often sell quickly.',
    ],
    considerations: [
      { title: 'Competitive market', text: 'Good homes can draw multiple offers. Get pre-approved and be ready to move quickly.' },
      { title: 'Flood zones', text: 'Areas near the river, creeks, and sound may be in flood zones. Check before you buy.' },
      { title: 'Historic district rules', text: 'Homes in historic districts may require approval for exterior changes.' },
    ],
    faqs: [
      { question: 'What are popular neighborhoods in Wilmington?', answer: 'Popular areas include Historic Downtown, Carolina Heights, Forest Hills, Ogden, Porters Neck, Masonboro, and Monkey Junction. Each has its own character and price range.' },
      { question: 'How far is Wilmington from the beach?', answer: 'Wrightsville Beach is about 15–20 minutes from most of the city, and Carolina and Kure beaches are about 20–30 minutes south.' },
      { question: 'Is Wilmington a good place to retire?', answer: 'Many retirees choose Wilmington for its mild climate, health care, cultural amenities, and proximity to the beach.' },
    ],
    lifestyles: ['historic', 'waterfront', 'retirement', 'first-time'],
    nearby: ['wrightsville-beach', 'landfall', 'carolina-beach', 'hampstead'],
  },
  {
    slug: 'wrightsville-beach',
    county: 'new-hanover',
    name: 'Wrightsville Beach',
    type: 'Town',
    population: '~2,500',
    summary: 'Upscale beach town closest to Wilmington, known for surfing, the Loop, and waterfront dining.',
    tagline: 'Wilmington\'s premier beach town',
    seoTitle: 'Wrightsville Beach NC Homes for Sale & Guide',
    metaDescription:
      'Wrightsville Beach, NC guide: oceanfront and Harbor Island homes, surfing, the Loop, Masonboro Island, flood insurance, and buying in a limited market.',
    quickFacts: [
      { label: 'Population', value: '~2,500' },
      { label: 'To downtown Wilmington', value: '~20 minutes' },
      { label: 'Schools', value: 'New Hanover County Schools' },
      { label: 'Famous for', value: 'Surfing & the Loop' },
    ],
    overview: [
      'Wrightsville Beach is the closest beach to Wilmington and one of the most desirable addresses on the North Carolina coast. It is known for surfing, paddleboarding, sailing, and the Loop, a popular walking and running path around the town.',
      'The town includes the oceanfront island and Harbor Island, with restaurants, marinas, and Johnnie Mercer\'s Pier. Masonboro Island, an undeveloped coastal reserve, is a short boat ride away.',
    ],
    highlights: [
      { title: 'Surfing and water sports', text: 'Consistent waves, paddleboarding, sailing, and kayaking.' },
      { title: 'The Loop', text: 'A roughly 2.5-mile path that is a favorite for walkers, runners, and cyclists.' },
      { title: 'Johnnie Mercer\'s Pier', text: 'A concrete fishing pier and local landmark.' },
      { title: 'Masonboro Island', text: 'An undeveloped barrier island reserve reachable by boat.' },
    ],
    housing: [
      'Homes include oceanfront and soundfront houses, condos, and properties on Harbor Island. Because the town is small and largely built out, inventory is limited and prices are among the highest in the region.',
      'Many owners use their homes as primary residences, while others rent them seasonally.',
    ],
    considerations: [
      { title: 'Limited inventory', text: 'Few homes come on the market each year. Work with an agent who can alert you quickly.' },
      { title: 'Flood and wind insurance', text: 'Island properties require flood and wind coverage and must meet strict building standards.' },
      { title: 'Rental and parking rules', text: 'Check town rules for rentals and parking before buying an investment property.' },
    ],
    faqs: [
      { question: 'Is Wrightsville Beach expensive?', answer: 'It is one of the most expensive beach towns in the region due to limited supply and high demand.' },
      { question: 'Can I live year-round at Wrightsville Beach?', answer: 'Yes. Many residents live there year-round and commute to Wilmington.' },
      { question: 'How do I get to Masonboro Island?', answer: 'Masonboro Island is accessible only by boat, kayak, or paddleboard.' },
    ],
    lifestyles: ['beach', 'waterfront', 'investment'],
    nearby: ['landfall', 'wilmington', 'carolina-beach'],
  },
  {
    slug: 'carolina-beach',
    county: 'new-hanover',
    name: 'Carolina Beach',
    type: 'Town',
    population: '~6,500',
    summary: 'Classic boardwalk beach town with a marina, state park, and homes at a wide range of price points.',
    tagline: 'Boardwalk fun on Pleasure Island',
    seoTitle: 'Carolina Beach NC Homes for Sale & Town Guide',
    metaDescription:
      'Living in Carolina Beach, NC: the boardwalk, Carolina Beach State Park, Freeman Park, condos and beach homes, and flood insurance tips for buyers.',
    quickFacts: [
      { label: 'Population', value: '~6,500' },
      { label: 'To Wilmington', value: '~25 minutes' },
      { label: 'Schools', value: 'New Hanover County Schools' },
      { label: 'Famous for', value: 'The Boardwalk' },
    ],
    overview: [
      'Carolina Beach is a lively, family-friendly beach town on Pleasure Island. Its boardwalk, with arcades, restaurants, and summer fireworks, has drawn visitors for generations.',
      'The town also offers Carolina Beach State Park, home to the Venus flytrap, a busy marina, Carolina Beach Lake Park, and Freeman Park at the north end, where four-wheel-drive vehicles can drive on the beach with a permit.',
    ],
    highlights: [
      { title: 'The Boardwalk', text: 'Classic beach fun with food, shops, and summer events.' },
      { title: 'Carolina Beach State Park', text: 'Trails, camping, a marina, and native carnivorous plants.' },
      { title: 'Freeman Park', text: 'Drive-on beach access for camping and fishing with a permit.' },
      { title: 'Year-round community', text: 'A strong full-time population with local restaurants and events.' },
    ],
    housing: [
      'Carolina Beach has a wide range of housing, from condos and townhomes to beach cottages, canal homes, and oceanfront houses. Prices are generally lower than at Wrightsville Beach.',
      'Its popularity with visitors makes it attractive for vacation rental investors.',
    ],
    considerations: [
      { title: 'Flood zones', text: 'Much of the town is in flood zones. Check elevation and insurance costs.' },
      { title: 'Seasonal crowds', text: 'Summer brings heavy traffic and crowds, especially near the boardwalk.' },
    ],
    faqs: [
      { question: 'Is Carolina Beach good for families?', answer: 'Yes. The boardwalk, state park, and family activities make it a favorite for families.' },
      { question: 'How far is Carolina Beach from Wilmington?', answer: 'About 25 minutes from downtown Wilmington.' },
      { question: 'Can I rent out a home in Carolina Beach?', answer: 'Many owners do. Check current town rules and HOA restrictions before buying.' },
    ],
    lifestyles: ['beach', 'investment', 'first-time', 'retirement'],
    nearby: ['kure-beach', 'wilmington', 'wrightsville-beach', 'southport'],
  },
  {
    slug: 'kure-beach',
    county: 'new-hanover',
    name: 'Kure Beach',
    type: 'Town',
    population: '~2,200',
    summary: 'Quiet, residential beach town with a historic pier, Fort Fisher, and the NC Aquarium.',
    tagline: 'Quiet beach living near Fort Fisher',
    seoTitle: 'Kure Beach NC Homes for Sale & Town Guide',
    metaDescription:
      'Living in Kure Beach, NC: the historic fishing pier, Fort Fisher, the NC Aquarium, quiet residential beach homes, and buying tips.',
    quickFacts: [
      { label: 'Population', value: '~2,200' },
      { label: 'To Wilmington', value: '~30 minutes' },
      { label: 'Schools', value: 'New Hanover County Schools' },
      { label: 'Ferry', value: 'Fort Fisher–Southport' },
    ],
    overview: [
      'Kure Beach is a quieter, more residential beach town just south of Carolina Beach. It is known for the Kure Beach Pier, one of the oldest fishing piers on the Atlantic coast, and a relaxed atmosphere that appeals to retirees and families.',
      'Just south of town are Fort Fisher State Historic Site, the North Carolina Aquarium at Fort Fisher, and the Fort Fisher–Southport ferry, which connects to Brunswick County.',
    ],
    highlights: [
      { title: 'Kure Beach Pier', text: 'A historic fishing pier and community gathering spot.' },
      { title: 'Fort Fisher', text: 'A Civil War historic site with a museum and coastal trails.' },
      { title: 'NC Aquarium', text: 'The North Carolina Aquarium at Fort Fisher is a popular attraction.' },
      { title: 'Low-rise character', text: 'Building height limits help preserve the town\'s quiet feel.' },
    ],
    housing: [
      'Housing includes oceanfront homes, beach cottages, condos, and newer homes on the west side of US 421. Many residents live here year-round.',
      'The town\'s quieter character attracts buyers looking for a peaceful beach lifestyle.',
    ],
    considerations: [
      { title: 'Flood insurance', text: 'Check flood zones and elevation for each property.' },
      { title: 'Limited commercial services', text: 'Grocery stores and many services are in Carolina Beach or Wilmington.' },
    ],
    faqs: [
      { question: 'Is Kure Beach quieter than Carolina Beach?', answer: 'Yes. Kure Beach is generally quieter and more residential than its neighbor to the north.' },
      { question: 'Can I take a ferry from Kure Beach?', answer: 'The Fort Fisher–Southport ferry is just south of town and connects to Brunswick County.' },
      { question: 'Is Kure Beach good for retirees?', answer: 'Many retirees choose Kure Beach for its peaceful atmosphere and access to Wilmington amenities.' },
    ],
    lifestyles: ['beach', 'retirement', 'historic'],
    nearby: ['carolina-beach', 'southport', 'wilmington'],
  },
  {
    slug: 'landfall',
    county: 'new-hanover',
    name: 'Landfall',
    type: 'Gated community',
    population: 'Gated neighborhood',
    summary: 'Master-planned gated golf and waterfront community near Wrightsville Beach.',
    tagline: 'Gated golf and waterfront living near Wrightsville Beach',
    seoTitle: 'Landfall Wilmington NC Homes for Sale & Guide',
    metaDescription:
      'Landfall in Wilmington, NC: gated golf community with Nicklaus and Dye courses, waterfront homes on the Intracoastal Waterway, and buying tips.',
    quickFacts: [
      { label: 'Type', value: 'Gated, master-planned' },
      { label: 'To Wrightsville Beach', value: '~5 minutes' },
      { label: 'Schools', value: 'New Hanover County Schools' },
      { label: 'Golf', value: 'Nicklaus & Dye courses' },
    ],
    overview: [
      'Landfall is a gated, master-planned community on the Intracoastal Waterway between Wilmington and Wrightsville Beach. It is known for its golf courses designed by Jack Nicklaus and Pete Dye, its private club, and its waterfront homes.',
      'Residents enjoy security, wooded streets, and quick access to the beach, Mayfaire shopping, and downtown Wilmington.',
    ],
    highlights: [
      { title: 'Championship golf', text: 'Courses designed by Jack Nicklaus and Pete Dye.' },
      { title: 'Landfall Club', text: 'A private club with golf, tennis, fitness, and dining (membership required).' },
      { title: 'Waterfront homes', text: 'Properties on the Intracoastal Waterway with sound views.' },
      { title: 'Prime location', text: 'Minutes from Wrightsville Beach and Mayfaire.' },
    ],
    housing: [
      'Landfall offers luxury single-family homes, golf course homes, waterfront estates, and townhomes and villas.',
      'Homes here are among the most prestigious in the Wilmington area.',
    ],
    considerations: [
      { title: 'HOA and club costs', text: 'Budget for HOA dues and, if desired, club membership fees.' },
      { title: 'Architectural rules', text: 'Exterior changes require approval from the community\'s review board.' },
    ],
    faqs: [
      { question: 'Do I have to join the Landfall Club?', answer: 'Club membership is separate from homeownership. Membership categories and fees vary, so check current details with the club.' },
      { question: 'How close is Landfall to the beach?', answer: 'Wrightsville Beach is about five minutes away.' },
      { question: 'What types of homes are in Landfall?', answer: 'Landfall has single-family homes, golf and waterfront estates, townhomes, and villas.' },
    ],
    lifestyles: ['golf', 'waterfront', 'retirement'],
    nearby: ['wrightsville-beach', 'wilmington', 'hampstead'],
  },

  // ───────────────────────── Brunswick County ─────────────────────────
  {
    slug: 'southport',
    county: 'brunswick',
    name: 'Southport',
    type: 'City',
    population: '~4,000',
    summary: 'Historic port town at the mouth of the Cape Fear River with a charming downtown and riverfront dining.',
    tagline: 'Historic charm at the mouth of the Cape Fear River',
    seoTitle: 'Southport NC Homes for Sale & Town Guide',
    metaDescription:
      'Living in Southport, NC: historic waterfront downtown, the NC 4th of July Festival, ferries to Fort Fisher and Bald Head Island, and buying tips.',
    quickFacts: [
      { label: 'Population', value: '~4,000' },
      { label: 'To Wilmington', value: '~45 minutes' },
      { label: 'Schools', value: 'Brunswick County Schools' },
      { label: 'Ferries', value: 'Fort Fisher & Bald Head Island' },
    ],
    overview: [
      'Southport is a historic waterfront town at the mouth of the Cape Fear River. Its tree-lined streets, historic homes, and waterfront parks have made it a popular filming location and a beloved place to live.',
      'The town hosts the North Carolina 4th of July Festival, and ferries connect Southport to Fort Fisher and Bald Head Island. Oak Island\'s beaches are just minutes away.',
    ],
    highlights: [
      { title: 'Historic downtown', text: 'Shops, galleries, and restaurants in a walkable historic district.' },
      { title: 'NC 4th of July Festival', text: 'The state\'s official Independence Day celebration.' },
      { title: 'Ferries', text: 'Ferries connect to Fort Fisher and Bald Head Island.' },
      { title: 'Waterfront views', text: 'Watch ships pass on the Cape Fear River from the waterfront park.' },
    ],
    housing: [
      'Southport offers historic homes downtown, waterfront properties, and newer neighborhoods nearby. Gated golf communities such as St. James are close by.',
      'Its charm and limited inventory keep demand high.',
    ],
    considerations: [
      { title: 'Historic district rules', text: 'Homes in the historic district may need approval for exterior changes.' },
      { title: 'Flood zones', text: 'Waterfront areas may be in flood zones. Check before buying.' },
    ],
    faqs: [
      { question: 'Is Southport a good place to retire?', answer: 'Many retirees love Southport for its small-town charm, historic setting, and nearby golf and beaches.' },
      { question: 'How do I get to Bald Head Island from Southport?', answer: 'The Bald Head Island ferry departs from Deep Point Marina in Southport.' },
      { question: 'How far is Southport from Wilmington?', answer: 'About 45 minutes by car, or you can take the Fort Fisher ferry.' },
    ],
    lifestyles: ['historic', 'retirement', 'golf', 'waterfront'],
    nearby: ['oak-island', 'kure-beach', 'holden-beach'],
  },
  {
    slug: 'oak-island',
    county: 'brunswick',
    name: 'Oak Island',
    type: 'Town',
    population: '~8,400',
    summary: 'Family-friendly beach town with a strong year-round community, piers, and waterfront living.',
    tagline: 'Year-round beach community near Southport',
    seoTitle: 'Oak Island NC Homes for Sale & Beach Guide',
    metaDescription:
      'Living in Oak Island, NC: year-round beach community, oceanfront and canal homes, piers, nearby Southport, flood insurance and rental tips.',
    quickFacts: [
      { label: 'Population', value: '~8,400' },
      { label: 'To Wilmington', value: '~45 minutes' },
      { label: 'Schools', value: 'Brunswick County Schools' },
      { label: 'Access', value: 'Two bridges' },
    ],
    overview: [
      'Oak Island is one of the largest beach towns in North Carolina by year-round population. Its south-facing beaches, fishing piers, and relaxed atmosphere make it popular with families, retirees, and second-home buyers.',
      'Two bridges connect the island to the mainland, and Southport\'s historic downtown is just minutes away.',
    ],
    highlights: [
      { title: 'Year-round community', text: 'A large full-time population with local businesses open all year.' },
      { title: 'Fishing piers', text: 'Piers and marsh access for fishing and sunset views.' },
      { title: 'South-facing beaches', text: 'Warm water and sunsets over the ocean.' },
      { title: 'Close to Southport', text: 'Historic charm and dining just minutes away.' },
    ],
    housing: [
      'Oak Island offers oceanfront, second-row, and canal homes, as well as more affordable homes inland on the island. Prices are generally lower than at many other beaches in the region.',
      'Many homes are rented seasonally.',
    ],
    considerations: [
      { title: 'Flood and wind insurance', text: 'Island homes need flood and wind coverage.' },
      { title: 'Rental rules', text: 'Check current town rules on rentals before buying.' },
    ],
    faqs: [
      { question: 'Is Oak Island good for year-round living?', answer: 'Yes. Oak Island has one of the largest year-round populations of any NC beach town.' },
      { question: 'How far is Oak Island from Wilmington?', answer: 'About 45 minutes.' },
      { question: 'Is Oak Island affordable?', answer: 'Compared to many NC beaches, Oak Island offers more affordable options, especially away from the oceanfront.' },
    ],
    lifestyles: ['beach', 'retirement', 'investment', 'first-time'],
    nearby: ['southport', 'holden-beach', 'ocean-isle-beach'],
  },
  {
    slug: 'holden-beach',
    county: 'brunswick',
    name: 'Holden Beach',
    type: 'Town',
    population: '~900',
    summary: 'Quiet, family-oriented beach town with no high-rises and a relaxed, residential feel.',
    tagline: 'A family beach with a relaxed pace',
    seoTitle: 'Holden Beach NC Homes for Sale & Town Guide',
    metaDescription:
      'Holden Beach, NC guide: quiet family beach town, oceanfront and canal homes, vacation rentals, flood insurance, and buying tips.',
    quickFacts: [
      { label: 'Population', value: '~900 year-round' },
      { label: 'To Wilmington', value: '~50 minutes' },
      { label: 'Schools', value: 'Brunswick County Schools' },
      { label: 'Character', value: 'Low-rise, family-oriented' },
    ],
    overview: [
      'Holden Beach is a family-oriented beach town known for its low-rise homes, quiet beaches, and relaxed atmosphere. It calls itself "The Family Beach" and has long been a favorite for summer vacations.',
      'The island has canals, marshes, and waterways that make it great for boating and fishing.',
    ],
    highlights: [
      { title: 'Family beach', text: 'Quiet beaches and a relaxed atmosphere.' },
      { title: 'Canal homes', text: 'Waterfront homes with boat access on canals.' },
      { title: 'Fishing and boating', text: 'Access to the Intracoastal Waterway and Lockwood Folly Inlet.' },
      { title: 'Low-rise character', text: 'No high-rise buildings.' },
    ],
    housing: [
      'Homes in Holden Beach are mostly single-family beach houses, including oceanfront, canal, and second-row homes. Many are used as vacation rentals.',
      'Mainland areas near the bridge offer more affordable options.',
    ],
    considerations: [
      { title: 'Flood insurance', text: 'Island properties need flood and wind coverage.' },
      { title: 'Limited services', text: 'Grocery stores and services are mostly on the mainland.' },
    ],
    faqs: [
      { question: 'Is Holden Beach good for families?', answer: 'Yes. It is known as a quiet, family-oriented beach.' },
      { question: 'Are there high-rises on Holden Beach?', answer: 'No. Holden Beach has a low-rise, residential character.' },
      { question: 'Can I rent out my Holden Beach home?', answer: 'Many owners rent their homes. Check current town rules and rental demand.' },
    ],
    lifestyles: ['beach', 'investment', 'waterfront'],
    nearby: ['oak-island', 'ocean-isle-beach', 'southport'],
  },
  {
    slug: 'ocean-isle-beach',
    county: 'brunswick',
    name: 'Ocean Isle Beach',
    type: 'Town',
    population: '~870',
    summary: 'Family beach island with canal living, golf nearby, and easy access to Myrtle Beach.',
    tagline: 'Canal living and south-facing beaches',
    seoTitle: 'Ocean Isle Beach NC Homes for Sale & Guide',
    metaDescription:
      'Living in Ocean Isle Beach, NC: canal and oceanfront homes, the Museum of Coastal Carolina, nearby golf and Myrtle Beach, and buying tips.',
    quickFacts: [
      { label: 'Population', value: '~870 year-round' },
      { label: 'To Wilmington', value: '~1 hour' },
      { label: 'To Myrtle Beach', value: '~45 minutes' },
      { label: 'Schools', value: 'Brunswick County Schools' },
    ],
    overview: [
      'Ocean Isle Beach is a family-friendly island known for its south-facing beaches, canal neighborhoods, and quiet atmosphere. It is home to the Museum of Coastal Carolina and is surrounded by golf courses on the mainland.',
      'Its location near the South Carolina line makes Myrtle Beach easy to reach.',
    ],
    highlights: [
      { title: 'Canal neighborhoods', text: 'Homes with private docks on the island\'s canals.' },
      { title: 'Museum of Coastal Carolina', text: 'A popular museum focused on coastal ecology.' },
      { title: 'Golf nearby', text: 'Many golf courses on the mainland.' },
      { title: 'South-facing beaches', text: 'Warm water and beautiful sunsets.' },
    ],
    housing: [
      'Housing includes oceanfront homes, canal homes, and condos. Many are used as vacation rentals.',
      'Nearby mainland communities offer golf course and new construction homes.',
    ],
    considerations: [
      { title: 'Flood insurance', text: 'Island homes need flood and wind coverage.' },
      { title: 'Seasonal crowds', text: 'Summer brings heavy traffic and visitors.' },
    ],
    faqs: [
      { question: 'Is Ocean Isle Beach good for families?', answer: 'Yes. It is known for its family-friendly atmosphere.' },
      { question: 'How far is Ocean Isle Beach from Myrtle Beach?', answer: 'About 45 minutes.' },
      { question: 'Are there canal homes in Ocean Isle Beach?', answer: 'Yes. Canal homes with private docks are popular on the island.' },
    ],
    lifestyles: ['beach', 'golf', 'waterfront', 'investment'],
    nearby: ['sunset-beach', 'holden-beach', 'oak-island'],
  },
  {
    slug: 'sunset-beach',
    county: 'brunswick',
    name: 'Sunset Beach',
    type: 'Town',
    population: '~4,200',
    summary: 'Southernmost NC beach town with the Kindred Spirit mailbox, golf, and growing mainland neighborhoods.',
    tagline: 'North Carolina\'s southernmost beach town',
    seoTitle: 'Sunset Beach NC Homes for Sale & Town Guide',
    metaDescription:
      'Living in Sunset Beach, NC: the Kindred Spirit mailbox, Ingram Planetarium, golf, island and mainland homes, and buying tips near Myrtle Beach.',
    quickFacts: [
      { label: 'Population', value: '~4,200' },
      { label: 'To Wilmington', value: '~1 hour' },
      { label: 'To Myrtle Beach', value: '~40 minutes' },
      { label: 'Schools', value: 'Brunswick County Schools' },
    ],
    overview: [
      'Sunset Beach is North Carolina\'s southernmost beach town, known for its wide, quiet beaches and the famous Kindred Spirit mailbox on Bird Island. The town includes a small island and a larger mainland area with golf communities and new neighborhoods.',
      'The Ingram Planetarium and nearby golf courses add to its appeal, and Myrtle Beach is about 40 minutes away.',
    ],
    highlights: [
      { title: 'Kindred Spirit mailbox', text: 'A famous mailbox on Bird Island where visitors leave notes.' },
      { title: 'Ingram Planetarium', text: 'A planetarium and science center.' },
      { title: 'Golf', text: 'Many golf communities on the mainland.' },
      { title: 'Quiet beaches', text: 'Wide, uncrowded beaches.' },
    ],
    housing: [
      'Island homes are mostly beach houses, while the mainland offers golf course homes and new construction neighborhoods.',
      'Prices vary widely between the island and mainland.',
    ],
    considerations: [
      { title: 'Flood insurance', text: 'Island homes need flood and wind coverage.' },
      { title: 'HOA rules', text: 'Many mainland neighborhoods have HOAs.' },
    ],
    faqs: [
      { question: 'Where is the Kindred Spirit mailbox?', answer: 'It is on Bird Island, a nature preserve at the west end of Sunset Beach.' },
      { question: 'Is Sunset Beach good for retirees?', answer: 'Yes. Many retirees enjoy its golf communities and quiet beaches.' },
      { question: 'How far is Sunset Beach from Myrtle Beach?', answer: 'About 40 minutes.' },
    ],
    lifestyles: ['beach', 'golf', 'retirement', 'new-construction'],
    nearby: ['ocean-isle-beach', 'holden-beach', 'tabor-city'],
  },

  // ───────────────────────── Columbus County ─────────────────────────
  {
    slug: 'lake-waccamaw',
    county: 'columbus',
    name: 'Lake Waccamaw',
    type: 'Town',
    population: '~1,300',
    summary: 'Lakefront town on one of the largest natural lakes in NC, with a state park and outdoor recreation.',
    tagline: 'Lakefront living on a rare Carolina bay lake',
    seoTitle: 'Lake Waccamaw NC Homes for Sale & Town Guide',
    metaDescription:
      'Living in Lake Waccamaw, NC: lakefront homes, Lake Waccamaw State Park, boating and fishing, affordable rural living, and buying tips.',
    quickFacts: [
      { label: 'Population', value: '~1,300' },
      { label: 'To Wilmington', value: '~45 minutes' },
      { label: 'Schools', value: 'Columbus County Schools' },
      { label: 'Lake size', value: '~9,000 acres' },
    ],
    overview: [
      'Lake Waccamaw is a small town on the shore of one of the largest natural lakes in North Carolina. The lake is a Carolina bay, a rare geological feature, and is home to species found nowhere else in the world.',
      'Lake Waccamaw State Park offers trails, camping, and boardwalks, and the lake is popular for boating, fishing, and swimming.',
    ],
    highlights: [
      { title: 'Lakefront living', text: 'Homes with direct lake access and views.' },
      { title: 'State park', text: 'Trails, camping, and nature programs.' },
      { title: 'Boating and fishing', text: 'Excellent fishing and recreation.' },
      { title: 'Unique ecosystem', text: 'Rare species found only in Lake Waccamaw.' },
    ],
    housing: [
      'Homes range from lakefront houses and cottages to in-town homes and rural properties. Prices are generally lower than coastal lakefront or beachfront homes.',
      'Lakefront lots are limited and in demand.',
    ],
    considerations: [
      { title: 'Rural services', text: 'Some services are in Whiteville or Wilmington.' },
      { title: 'Well and septic', text: 'Check utilities for each property.' },
    ],
    faqs: [
      { question: 'Is Lake Waccamaw a natural lake?', answer: 'Yes. It is a Carolina bay lake and one of the largest natural lakes in North Carolina.' },
      { question: 'Can you swim in Lake Waccamaw?', answer: 'Yes. The lake is popular for swimming, boating, and fishing.' },
      { question: 'How far is Lake Waccamaw from Wilmington?', answer: 'About 45 minutes.' },
    ],
    lifestyles: ['waterfront', 'retirement', 'acreage'],
    nearby: ['whiteville', 'chadbourn', 'tabor-city'],
  },
  {
    slug: 'whiteville',
    county: 'columbus',
    name: 'Whiteville',
    type: 'City (county seat)',
    population: '~4,800',
    summary: 'County seat with a historic downtown, community college, hospital, and local services.',
    tagline: 'Columbus County\'s hub for services and small-town living',
    seoTitle: 'Whiteville NC Homes for Sale & City Guide',
    metaDescription:
      'Living in Whiteville, NC: historic downtown, Southeastern Community College, affordable homes and acreage, and an easy drive to Wilmington.',
    quickFacts: [
      { label: 'Population', value: '~4,800' },
      { label: 'To Wilmington', value: '~50 minutes' },
      { label: 'Schools', value: 'Whiteville City Schools' },
      { label: 'Highways', value: 'US 74/76 & US 701' },
    ],
    overview: [
      'Whiteville is the county seat of Columbus County and its center for shopping, health care, and education. It has a historic downtown, Southeastern Community College, and a regional hospital.',
      'The city offers affordable homes and a slower pace while being about 50 minutes from Wilmington.',
    ],
    highlights: [
      { title: 'Historic downtown', text: 'Local shops, restaurants, and community events.' },
      { title: 'Education', text: 'Southeastern Community College and its own city school system.' },
      { title: 'Health care', text: 'A regional hospital and medical offices.' },
      { title: 'Affordable living', text: 'Lower home prices than coastal areas.' },
    ],
    housing: [
      'Whiteville offers historic homes, established neighborhoods, and rural properties with acreage. Prices are among the most affordable in the region.',
      'Many properties may qualify for USDA financing.',
    ],
    considerations: [
      { title: 'Flood history', text: 'Parts of the area have flooded during major hurricanes. Check flood maps.' },
      { title: 'Commute', text: 'Wilmington is about 50 minutes away.' },
    ],
    faqs: [
      { question: 'Is Whiteville affordable?', answer: 'Yes. Whiteville is one of the more affordable places to buy in Southeastern NC.' },
      { question: 'Does Whiteville have its own school system?', answer: 'Yes. Whiteville City Schools serves the city, while Columbus County Schools serves the rest of the county.' },
      { question: 'How far is Whiteville from Wilmington?', answer: 'About 50 minutes.' },
    ],
    lifestyles: ['first-time', 'acreage', 'historic'],
    nearby: ['lake-waccamaw', 'chadbourn', 'tabor-city', 'fair-bluff'],
  },
  {
    slug: 'tabor-city',
    county: 'columbus',
    name: 'Tabor City',
    type: 'Town',
    population: '~3,800',
    summary: 'Small town on the SC line with agricultural heritage, the Yam Festival, and easy Myrtle Beach access.',
    tagline: 'Small-town living near the South Carolina line',
    seoTitle: 'Tabor City NC Homes for Sale & Town Guide',
    metaDescription:
      'Living in Tabor City, NC: affordable homes and land, the NC Yam Festival, small-town charm, and an easy drive to Myrtle Beach.',
    quickFacts: [
      { label: 'Population', value: '~3,800' },
      { label: 'To Myrtle Beach', value: '~40 minutes' },
      { label: 'Schools', value: 'Columbus County Schools' },
      { label: 'Highway', value: 'US 701' },
    ],
    overview: [
      'Tabor City is a small town on the North Carolina–South Carolina border known for its agricultural heritage and the annual North Carolina Yam Festival.',
      'It offers affordable homes and land, with Myrtle Beach and the Grand Strand about 40 minutes away.',
    ],
    highlights: [
      { title: 'NC Yam Festival', text: 'A fall festival celebrating the region\'s sweet potatoes.' },
      { title: 'Affordable homes', text: 'Lower prices and larger lots.' },
      { title: 'Near Myrtle Beach', text: 'Easy access to the Grand Strand.' },
      { title: 'Small-town charm', text: 'A friendly, close-knit community.' },
    ],
    housing: [
      'Tabor City offers in-town homes, rural properties, and land. Prices are among the lowest in the region.',
      'Some properties may qualify for USDA loans.',
    ],
    considerations: [
      { title: 'Rural services', text: 'Some services require a drive to Whiteville or Myrtle Beach.' },
      { title: 'Well and septic', text: 'Check utilities for rural properties.' },
    ],
    faqs: [
      { question: 'When is the NC Yam Festival?', answer: 'It is traditionally held in the fall in Tabor City.' },
      { question: 'How far is Tabor City from Myrtle Beach?', answer: 'About 40 minutes.' },
      { question: 'Is Tabor City affordable?', answer: 'Yes. It is one of the more affordable towns in the region.' },
    ],
    lifestyles: ['acreage', 'first-time'],
    nearby: ['whiteville', 'chadbourn', 'sunset-beach'],
  },
  {
    slug: 'chadbourn',
    county: 'columbus',
    name: 'Chadbourn',
    type: 'Town',
    population: '~1,600',
    summary: 'Farming community with strawberry heritage, affordable homes, and rural land.',
    tagline: 'Strawberry country in the heart of Columbus County',
    seoTitle: 'Chadbourn NC Homes for Sale & Town Guide',
    metaDescription:
      'Living in Chadbourn, NC: affordable homes and farmland, the NC Strawberry Festival, rural living near Whiteville, and buying tips.',
    quickFacts: [
      { label: 'Population', value: '~1,600' },
      { label: 'To Whiteville', value: '~10 minutes' },
      { label: 'Schools', value: 'Columbus County Schools' },
      { label: 'Highway', value: 'US 74/76' },
    ],
    overview: [
      'Chadbourn is a small farming town known for its strawberry heritage and the annual North Carolina Strawberry Festival.',
      'It offers affordable homes and farmland, with Whiteville just minutes away for shopping and services.',
    ],
    highlights: [
      { title: 'Strawberry Festival', text: 'A spring festival celebrating local strawberries.' },
      { title: 'Farmland', text: 'Land for farming, gardening, and hobby farms.' },
      { title: 'Affordable homes', text: 'Some of the lowest prices in the region.' },
      { title: 'Close to Whiteville', text: 'Services and shopping just minutes away.' },
    ],
    housing: [
      'Chadbourn offers older in-town homes, rural properties, and farmland at very affordable prices.',
      'Many properties may qualify for USDA financing.',
    ],
    considerations: [
      { title: 'Older homes', text: 'Older homes may need updates. Get a thorough inspection.' },
      { title: 'Well and septic', text: 'Check utilities for rural properties.' },
    ],
    faqs: [
      { question: 'When is the NC Strawberry Festival?', answer: 'It is traditionally held in the spring in Chadbourn.' },
      { question: 'Is Chadbourn affordable?', answer: 'Yes. It offers some of the most affordable homes and land in the region.' },
      { question: 'How far is Chadbourn from Whiteville?', answer: 'About 10 minutes.' },
    ],
    lifestyles: ['acreage', 'first-time'],
    nearby: ['whiteville', 'tabor-city', 'lake-waccamaw', 'fair-bluff'],
  },
  {
    slug: 'fair-bluff',
    county: 'columbus',
    name: 'Fair Bluff',
    type: 'Town',
    population: '~700',
    summary: 'Scenic river town on the Lumber River with natural beauty and a peaceful pace of life.',
    tagline: 'A quiet river town on the Lumber River',
    seoTitle: 'Fair Bluff NC Homes for Sale & Town Guide',
    metaDescription:
      'Living in Fair Bluff, NC: Lumber River paddling, quiet small-town living, very affordable homes and land, and flood history buyers should know.',
    quickFacts: [
      { label: 'Population', value: '~700' },
      { label: 'To Whiteville', value: '~25 minutes' },
      { label: 'Schools', value: 'Columbus County Schools' },
      { label: 'River', value: 'Lumber River' },
    ],
    overview: [
      'Fair Bluff is a small river town on the Lumber River, a designated National Wild and Scenic River. Its riverwalk and natural surroundings make it a peaceful place to live.',
      'The town was heavily affected by flooding during Hurricanes Matthew (2016) and Florence (2018), and recovery efforts continue.',
    ],
    highlights: [
      { title: 'Lumber River', text: 'Paddling, fishing, and scenic views.' },
      { title: 'Riverwalk', text: 'A boardwalk along the river.' },
      { title: 'Quiet living', text: 'A peaceful, small-town pace.' },
      { title: 'Affordable land', text: 'Very affordable homes and land.' },
    ],
    housing: [
      'Fair Bluff offers small in-town homes and rural land at very low prices.',
      'Buyers should carefully evaluate flood risk.',
    ],
    considerations: [
      { title: 'Flood risk', text: 'The town has experienced major flooding. Check flood maps, elevation, and insurance costs carefully.' },
      { title: 'Limited services', text: 'Most services are in Whiteville or Lumberton.' },
    ],
    faqs: [
      { question: 'Has Fair Bluff flooded?', answer: 'Yes. Fair Bluff was heavily flooded during Hurricanes Matthew and Florence. Buyers should research flood risk carefully.' },
      { question: 'Is the Lumber River good for paddling?', answer: 'Yes. It is a designated National Wild and Scenic River popular for paddling.' },
      { question: 'Is Fair Bluff affordable?', answer: 'Yes. Homes and land are very affordable, but flood risk should be considered.' },
    ],
    lifestyles: ['acreage', 'waterfront'],
    nearby: ['whiteville', 'chadbourn', 'tabor-city'],
  },
];

export function getCommunity(county: string, slug: string) {
  return communities.find((c) => c.county === county && c.slug === slug);
}

export function getCommunityBySlug(slug: string) {
  return communities.find((c) => c.slug === slug);
}

export function getCommunitiesByCounty(county: CountySlug) {
  return communities.filter((c) => c.county === county);
}

/** Look up a community by its display name, e.g. to link lifestyle-page cards. */
export function findCommunityByName(county: CountySlug, name: string) {
  return communities.find((c) => c.county === county && c.name === name);
}

export function communityPath(c: Pick<Community, 'county' | 'slug'>) {
  return `/community/${c.county}/${c.slug}`;
}
