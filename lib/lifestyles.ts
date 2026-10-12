// Content for the "Find Your Lifestyle" hub (/lifestyle) and the detail pages (/lifestyle/[slug]).
// Each entry carries its own SEO title, meta description, FAQs (rendered as FAQPage structured data),
// and community links into the county guides under /explore.

export type CountySlug = 'onslow' | 'pender' | 'new-hanover' | 'brunswick' | 'columbus';

export const COUNTY_NAMES: Record<CountySlug, string> = {
  onslow: 'Onslow County',
  pender: 'Pender County',
  'new-hanover': 'New Hanover County',
  brunswick: 'Brunswick County',
  columbus: 'Columbus County',
};

export interface LifestyleCommunity {
  name: string;
  county: CountySlug;
  description: string;
}

export interface LifestyleSection {
  title: string;
  text: string;
}

export interface LifestyleFaq {
  question: string;
  answer: string;
}

export interface Lifestyle {
  slug: string;
  emoji: string;
  name: string;
  /** Short blurb for the hub-page card. */
  description: string;
  /** Where to find it, shown as chips on the hub card. */
  areas: string[];
  features: string[];
  bestFor: string;
  /** Full <title> (no site-name suffix, to leave room for keywords). Keep under ~60 characters. */
  seoTitle: string;
  /** Meta description. Keep under ~160 characters. */
  metaDescription: string;
  keywords: string[];
  heroTitle: string;
  heroSubtitle: string;
  quickFacts: { label: string; value: string }[];
  intro: string[];
  communitiesHeading: string;
  communities: LifestyleCommunity[];
  livingHeading: string;
  living: LifestyleSection[];
  considerationsHeading: string;
  considerations: LifestyleSection[];
  faqs: LifestyleFaq[];
  related: string[];
  ctaTitle: string;
  ctaText: string;
  /** Show the HUD homes call-out (HUD listings on USAhudhomes.com). */
  showHud?: boolean;
}

export const lifestyles: Lifestyle[] = [
  {
    slug: 'beach',
    emoji: '🌊',
    name: 'Beach Living',
    description: 'Wake up to ocean views, enjoy sandy beaches, and embrace coastal culture.',
    areas: ['New Hanover', 'Pender', 'Brunswick', 'Onslow'],
    features: ['Beach access', 'Oceanfront & second-row homes', 'Seafood restaurants', 'Water sports'],
    bestFor: 'Retirees, families, second-home and vacation-rental buyers',
    seoTitle: 'Beach Homes for Sale in Southeastern NC',
    metaDescription:
      'Guide to beach homes in Southeastern NC: Wrightsville, Carolina & Kure Beach, Topsail Island, Oak Island, Holden & Ocean Isle. Flood, insurance & rental tips.',
    keywords: [
      'beach homes for sale NC',
      'Southeastern NC beach houses',
      'Topsail Island homes for sale',
      'Wrightsville Beach real estate',
      'Carolina Beach homes',
      'Oak Island NC homes for sale',
      'Holden Beach real estate',
      'Ocean Isle Beach homes',
    ],
    heroTitle: 'Beach Homes & Coastal Living in Southeastern North Carolina',
    heroSubtitle:
      'From Topsail Island to Sunset Beach, discover the beach towns of the Cape Fear coast and what it really takes to buy near the ocean.',
    quickFacts: [
      { label: 'Beach towns covered', value: '12+' },
      { label: 'Counties', value: 'New Hanover, Pender, Brunswick, Onslow' },
      { label: 'Nearest airport', value: 'Wilmington (ILM)' },
      { label: 'Hurricane season', value: 'June 1 – Nov 30' },
    ],
    intro: [
      'Southeastern North Carolina has some of the most varied beach living on the East Coast. In a single afternoon you can drive from the surf-town energy of Wrightsville Beach to the quiet, family-oriented streets of Kure Beach, then cross the Cape Fear River to the wide, south-facing beaches of Brunswick County. Each island has its own personality, rules, price points, and pace of life — and choosing the right one matters as much as choosing the right house.',
      'Buyers here range from retirees who want a daily walk on the sand, to families buying a vacation home they can rent when they are not using it, to full-time residents who commute to Wilmington or Jacksonville. Homes range from oceanfront houses on pilings and soundfront cottages to condos with a pool and second- and third-row homes a short walk from a public beach access — often at a meaningful discount to oceanfront.',
      'Beach property also comes with considerations inland buyers never face: flood zones, wind and hail insurance, erosion, CAMA regulations, and town-by-town short-term rental rules. As a local Lightkeeper Realty agent, Marc Spencer helps buyers compare beach towns side by side and understand the true cost of ownership before they write an offer.',
    ],
    communitiesHeading: 'Top Beach Towns in Southeastern NC',
    communities: [
      {
        name: 'Wrightsville Beach',
        county: 'new-hanover',
        description:
          'The closest beach to downtown Wilmington, known for surfing, paddleboarding, the Loop walking path, Johnnie Mercer\'s Pier, and a lively dining scene. Limited inventory keeps it one of the most in-demand addresses on the coast.',
      },
      {
        name: 'Carolina Beach',
        county: 'new-hanover',
        description:
          'A classic boardwalk town on Pleasure Island with summer fireworks, a busy marina, Carolina Beach State Park, and a mix of condos, cottages, and year-round homes at a wide range of price points.',
      },
      {
        name: 'Kure Beach',
        county: 'new-hanover',
        description:
          'Quieter and more residential, with a historic fishing pier, Fort Fisher State Historic Site, and the North Carolina Aquarium at Fort Fisher just to the south. Popular with retirees and families.',
      },
      {
        name: 'Topsail Beach & Surf City',
        county: 'pender',
        description:
          'Topsail Island\'s southern end offers a slower, small-town island feel. Surf City is the island\'s commercial hub and home of the Karen Beasley Sea Turtle Rescue and Rehabilitation Center.',
      },
      {
        name: 'North Topsail Beach',
        county: 'onslow',
        description:
          'The northern stretch of Topsail Island, with oceanfront condos and homes, wide natural beaches, and an easy drive to Jacksonville and Camp Lejeune — a favorite with military families.',
      },
      {
        name: 'Oak Island & Caswell Beach',
        county: 'brunswick',
        description:
          'A year-round community with dozens of public beach accesses, two fishing piers, and the Oak Island Lighthouse. More affordable than many beach towns and close to historic Southport.',
      },
      {
        name: 'Holden Beach',
        county: 'brunswick',
        description:
          'A family beach with a strong vacation-rental market, a long fishing pier, and a relaxed, low-rise feel. Many homes sit on canals with boat docks on the Intracoastal side.',
      },
      {
        name: 'Ocean Isle Beach & Sunset Beach',
        county: 'brunswick',
        description:
          'South-facing beaches near the South Carolina line. Ocean Isle is home to the Museum of Coastal Carolina; Sunset Beach is known for its pier, quiet streets, and the Kindred Spirit mailbox on Bird Island.',
      },
    ],
    livingHeading: 'What Beach Life Looks Like Here',
    living: [
      {
        title: 'Year-round outdoor living',
        text: 'Mild winters mean surfing, fishing, kayaking, and beach walks are not just summer activities. Spring and fall are the locals\' favorite seasons — warm water, fewer crowds.',
      },
      {
        title: 'Fresh seafood and local culture',
        text: 'Shrimp boats, fish markets, oyster roasts, and festivals like the Carolina Beach and Topsail Island seasonal events give each town its own calendar and identity.',
      },
      {
        title: 'Rental income potential',
        text: 'Many beach owners offset carrying costs by renting their home by the week in season. Rental demand, rules, and occupancy taxes vary by town, so the right town depends on your plans.',
      },
      {
        title: 'City conveniences nearby',
        text: 'Wilmington\'s hospitals, shopping, UNCW, and Wilmington International Airport (ILM) are within about 15 to 60 minutes of most beach towns in the region.',
      },
    ],
    considerationsHeading: 'What to Know Before Buying a Beach Home',
    considerations: [
      {
        title: 'Flood zones and elevation certificates',
        text: 'Many island homes sit in FEMA AE or VE flood zones. Ask for the elevation certificate early — the home\'s elevation relative to base flood elevation drives flood insurance premiums and lender requirements.',
      },
      {
        title: 'Wind, hail, and homeowners insurance',
        text: 'Coastal homes often need separate wind and hail coverage, frequently written through the North Carolina Insurance Underwriting Association (the "Beach Plan"). Get insurance quotes during your due diligence period, not after.',
      },
      {
        title: 'Oceanfront erosion and CAMA rules',
        text: 'Oceanfront lots are subject to the Coastal Area Management Act (CAMA), including setback rules that can limit rebuilding or expansion. Review erosion history and any beach nourishment schedules.',
      },
      {
        title: 'Short-term rental regulations',
        text: 'Each town sets its own rules on rentals, parking, and occupancy. If rental income is part of your plan, confirm local ordinances and HOA restrictions before you buy.',
      },
      {
        title: 'Construction and maintenance',
        text: 'Salt air is hard on HVAC systems, metal fasteners, decks, and windows. A thorough inspection should cover pilings, decking, roof attachment, and any signs of past water intrusion.',
      },
    ],
    faqs: [
      {
        question: 'What is the most affordable beach town in Southeastern North Carolina?',
        answer:
          'Prices change with the market, but buyers looking for value often start with Oak Island, Surf City, North Topsail Beach condos, and second- or third-row homes in Carolina Beach. Homes on the mainland side of the Intracoastal Waterway — such as Hampstead, Supply, or Shallotte — can offer a short drive to the beach at a lower price than island property.',
      },
      {
        question: 'Do I need flood insurance for a beach house in NC?',
        answer:
          'If the home is in a FEMA Special Flood Hazard Area and you finance it with a federally backed mortgage, flood insurance is required. Even when it is not required, most coastal buyers carry it. Premiums depend on the home\'s elevation, flood zone, and construction, so request an elevation certificate and quotes during due diligence.',
      },
      {
        question: 'Can I rent out my beach home when I am not using it?',
        answer:
          'In many Southeastern NC beach towns, yes — weekly vacation rentals are common. Rules, registration, occupancy taxes, and HOA restrictions vary by town and neighborhood, and North Carolina\'s Vacation Rental Act governs rentals under 90 days. Confirm the rules for the specific property before you buy.',
      },
      {
        question: 'Which beach towns are best for full-time living?',
        answer:
          'Kure Beach, Oak Island, Carolina Beach, Surf City, and Sunset Beach all have strong year-round communities. Proximity to Wilmington, Jacksonville, or Myrtle Beach for work, healthcare, and shopping is usually the deciding factor.',
      },
      {
        question: 'How far are the beaches from Wilmington?',
        answer:
          'Wrightsville Beach is roughly 15 to 20 minutes from downtown Wilmington. Carolina and Kure Beach are about 25 to 35 minutes, Topsail Island about 40 to 50 minutes, and the Brunswick County beaches roughly 40 minutes to an hour, depending on traffic and season.',
      },
    ],
    related: ['waterfront', 'retirement', 'investment', 'golf'],
    ctaTitle: 'Ready to Find Your Beach Home?',
    ctaText:
      'Tell us which beach towns you are considering and how you plan to use the home. We will help you compare towns, insurance costs, and rental rules before you make an offer.',
  },
  {
    slug: 'golf',
    emoji: '⛳',
    name: 'Golf Communities',
    description: 'Championship courses, resort amenities, and communities built around the game.',
    areas: ['Brunswick', 'New Hanover', 'Pender'],
    features: ['Championship courses', 'Clubhouses & dining', 'Resort amenities', 'Active social life'],
    bestFor: 'Golf enthusiasts, retirees, active adults',
    seoTitle: 'Golf Course Homes in Wilmington & Brunswick County NC',
    metaDescription:
      'Explore golf course communities in Southeastern NC: St. James, Ocean Ridge, Brunswick Forest, Landfall, Porters Neck & more. Membership, HOA & buying tips.',
    keywords: [
      'golf course homes NC',
      'golf communities Brunswick County NC',
      'St. James Plantation homes for sale',
      'Landfall Wilmington real estate',
      'Ocean Ridge Plantation homes',
      'Brunswick Forest homes for sale',
      'Porters Neck homes',
    ],
    heroTitle: 'Golf Course Homes & Golf Communities in Southeastern NC',
    heroSubtitle:
      'Brunswick County\'s golf coast and Wilmington\'s private clubs offer some of the best golf living in the Carolinas — often minutes from the beach.',
    quickFacts: [
      { label: 'Golf season', value: 'Year-round' },
      { label: 'Golf hub', value: 'Brunswick County' },
      { label: 'Club types', value: 'Private, semi-private, public' },
      { label: 'Beach access', value: 'Often under 20 min' },
    ],
    intro: [
      'Southeastern North Carolina has quietly become one of the East Coast\'s great golf destinations. Brunswick County alone is home to dozens of courses stretching from Leland to Calabash, and Wilmington adds several highly regarded private clubs. Mild winters mean you can play nearly every month of the year.',
      'Golf communities here range from large master-planned neighborhoods with multiple courses, marinas, fitness centers, and walking trails to smaller neighborhoods built around a single course. Many buyers choose a golf community for the lifestyle as much as the golf: clubhouse dining, social clubs, pickleball and tennis, and a built-in network of neighbors.',
      'The details matter. Membership structures, initiation fees, HOA dues, and whether a home actually sits on the course all affect value and day-to-day cost. We help buyers compare communities apples to apples so there are no surprises after closing.',
    ],
    communitiesHeading: 'Popular Golf Communities',
    communities: [
      {
        name: 'St. James (Southport)',
        county: 'brunswick',
        description:
          'One of the region\'s largest gated golf communities, with multiple championship courses, a marina on the Intracoastal Waterway, a private beach club, and an active community calendar.',
      },
      {
        name: 'Ocean Ridge Plantation (Ocean Isle Beach area)',
        county: 'brunswick',
        description:
          'Known for its "Big Cats" collection of courses and its location a few minutes from Ocean Isle Beach. Homes range from villas to custom estates.',
      },
      {
        name: 'Brunswick Forest (Leland)',
        county: 'brunswick',
        description:
          'A large master-planned community about 10 to 15 minutes from downtown Wilmington, with Cape Fear National golf course, fitness centers, trails, and a wide variety of home styles.',
      },
      {
        name: 'Compass Pointe & Magnolia Greens (Leland)',
        county: 'brunswick',
        description:
          'Leland golf neighborhoods with resort-style amenities and quick access to Wilmington — popular with buyers who want newer construction and an easy commute.',
      },
      {
        name: 'Sea Trail & Brunswick Plantation',
        county: 'brunswick',
        description:
          'Established golf communities near Sunset Beach and Calabash, offering a range of price points and close proximity to the beaches and to North Myrtle Beach.',
      },
      {
        name: 'Landfall (Wilmington)',
        county: 'new-hanover',
        description:
          'A gated private club community near Wrightsville Beach with courses designed by Jack Nicklaus and Pete Dye, plus a sports center and clubhouse.',
      },
      {
        name: 'Porters Neck Plantation (Wilmington)',
        county: 'new-hanover',
        description:
          'A gated community in northern New Hanover County with a Tom Fazio-designed course, close to Figure Eight Island and the Intracoastal Waterway.',
      },
      {
        name: 'Belvedere Plantation (Hampstead)',
        county: 'pender',
        description:
          'A golf and country club community in Pender County with a more relaxed price point and easy access to Topsail Island and Wilmington.',
      },
    ],
    livingHeading: 'Life in a Golf Community',
    living: [
      {
        title: 'Golf nearly every month',
        text: 'Coastal Carolina winters are mild, and many members play year-round. Spring and fall bring peak course conditions.',
      },
      {
        title: 'More than golf',
        text: 'Most larger communities include pools, fitness centers, pickleball and tennis courts, walking trails, and clubs for everything from wine to woodworking.',
      },
      {
        title: 'A built-in social network',
        text: 'Leagues, member-guest tournaments, and clubhouse events make it easy for newcomers — especially relocating retirees — to meet neighbors quickly.',
      },
      {
        title: 'Beach and city within reach',
        text: 'Many golf communities are 10 to 20 minutes from the beach and within an easy drive of Wilmington, Southport, or Myrtle Beach.',
      },
    ],
    considerationsHeading: 'What to Know Before Buying a Golf Home',
    considerations: [
      {
        title: 'Membership is not always included',
        text: 'Owning a home in a golf community does not automatically mean golf privileges. Ask whether membership is mandatory, optional, or equity-based, and get the current initiation fees and monthly dues in writing.',
      },
      {
        title: 'HOA dues and amenity fees',
        text: 'Master HOA dues, sub-association dues, and amenity fees can add up. Review the budget, reserves, and any planned special assessments during due diligence.',
      },
      {
        title: 'On the course vs. in the community',
        text: 'Fairway and water-view lots carry a premium — and come with errant golf balls and course maintenance noise. Off-course homes in the same community can be a good value.',
      },
      {
        title: 'Course ownership and health',
        text: 'Ask who owns the course and how it is funded. A well-run, member-owned or well-capitalized course protects home values; a struggling course can affect them.',
      },
    ],
    faqs: [
      {
        question: 'Do I have to join the golf club if I buy in a golf community?',
        answer:
          'It depends on the community. Some require a social or golf membership with home ownership, some make membership optional, and some courses are open to the public. Always confirm current membership requirements, initiation fees, and dues before you make an offer.',
      },
      {
        question: 'Which area has the most golf communities in Southeastern NC?',
        answer:
          'Brunswick County has the highest concentration, from Leland and Bolivia to Southport, Ocean Isle Beach, Sunset Beach, and Calabash. Wilmington and northern New Hanover County offer several private clubs, and Pender County has options in Hampstead.',
      },
      {
        question: 'Are golf course homes a good investment?',
        answer:
          'Homes in well-maintained, financially healthy golf communities tend to hold value well, especially in markets popular with retirees like Brunswick County. The course\'s financial health, HOA management, and location relative to the beach and Wilmington all affect long-term value.',
      },
      {
        question: 'Can I find a golf community near the beach?',
        answer:
          'Yes. St. James, Ocean Ridge Plantation, Sea Trail, and several Holden Beach and Ocean Isle area communities are within roughly 5 to 20 minutes of the ocean.',
      },
    ],
    related: ['retirement', 'beach', 'new-construction', 'waterfront'],
    ctaTitle: 'Find the Right Golf Community',
    ctaText:
      'Tell us how often you play, your budget, and how close to the beach you want to be. We will compare memberships, dues, and homes across communities for you.',
  },
  {
    slug: 'waterfront',
    emoji: '🚤',
    name: 'Waterfront & Boating',
    description: 'Direct water access for boating, fishing, and water recreation.',
    areas: ['Brunswick', 'New Hanover', 'Pender', 'Onslow', 'Columbus'],
    features: ['Private docks', 'Intracoastal & river access', 'Deep-water lots', 'Lake living'],
    bestFor: 'Boaters, anglers, paddlers, water lovers',
    seoTitle: 'Waterfront Homes with Docks in Southeastern NC',
    metaDescription:
      'Waterfront homes in Southeastern NC on the Intracoastal Waterway, Cape Fear, New River & Lake Waccamaw. Learn about docks, water depth, CAMA & riparian rights.',
    keywords: [
      'waterfront homes for sale NC',
      'Intracoastal Waterway homes for sale',
      'homes with boat dock Wilmington NC',
      'Lake Waccamaw homes for sale',
      'Sneads Ferry waterfront homes',
      'Southport waterfront real estate',
      'deep water homes NC',
    ],
    heroTitle: 'Waterfront Homes & Boating Communities in Southeastern NC',
    heroSubtitle:
      'Intracoastal Waterway, tidal creeks, rivers, and lakes — find a home where your boat is just steps from your back door.',
    quickFacts: [
      { label: 'Main waterways', value: 'ICW, Cape Fear, New River' },
      { label: 'Freshwater option', value: 'Lake Waccamaw' },
      { label: 'Inlets to the ocean', value: 'Many along the coast' },
      { label: 'Key check', value: 'Depth at low tide' },
    ],
    intro: [
      'Few regions offer as many ways to live on the water as Southeastern North Carolina. The Atlantic Intracoastal Waterway runs the length of the coast, connecting sounds, creeks, and inlets from Swansboro to Calabash. The Cape Fear River winds through Wilmington to Southport, the New River opens into Sneads Ferry and Jacksonville, and Lake Waccamaw offers peaceful freshwater living inland.',
      'Waterfront buyers here include serious offshore anglers who need quick inlet access, sailors who need deep water and no fixed-bridge restrictions, paddlers who just want a kayak launch, and families who want a dock for a pontoon boat. Each of those goals points to a different stretch of water.',
      'Not all "waterfront" is equal. Water depth at low tide, dock permits, marsh between the house and navigable water, bridge clearances, and flood exposure can make two similar-looking homes very different. We help buyers evaluate the water as carefully as the house.',
    ],
    communitiesHeading: 'Where to Find Waterfront Living',
    communities: [
      {
        name: 'Southport & the Cape Fear River',
        county: 'brunswick',
        description:
          'A historic maritime town where the Cape Fear River meets the Intracoastal Waterway, with marinas, ferry access to Bald Head Island and Fort Fisher, and quick access to the ocean.',
      },
      {
        name: 'Holden Beach, Varnamtown & the Lockwood Folly',
        county: 'brunswick',
        description:
          'Canal homes, tidal creek lots, and a working-waterfront fishing heritage along the Lockwood Folly River and Intracoastal Waterway.',
      },
      {
        name: 'Masonboro Sound & Wrightsville area',
        county: 'new-hanover',
        description:
          'Wilmington\'s premier Intracoastal Waterway shoreline, with private docks, sweeping marsh views, and easy access to Masonboro Inlet.',
      },
      {
        name: 'Hampstead & Topsail Sound',
        county: 'pender',
        description:
          'Sound-front and Intracoastal homes with docks, often with views across to Topsail Island, at prices below comparable Wilmington waterfront.',
      },
      {
        name: 'Sneads Ferry & the New River',
        county: 'onslow',
        description:
          'A fishing and shrimping village with a strong boating culture, New River Inlet access, and proximity to Camp Lejeune.',
      },
      {
        name: 'Swansboro & the White Oak River',
        county: 'onslow',
        description:
          'A historic waterfront town at the mouth of the White Oak River, with protected waters for paddling and access to Bogue Inlet.',
      },
      {
        name: 'Lake Waccamaw',
        county: 'columbus',
        description:
          'A large, shallow freshwater Carolina bay lake with Lake Waccamaw State Park, ideal for sailing small boats, paddling, and peaceful lake-house living.',
      },
      {
        name: 'Northeast Cape Fear River (Rocky Point area)',
        county: 'pender',
        description:
          'Wooded riverfront lots and fishing-camp style homes on a quieter blackwater river, often with more land and lower prices than the coast.',
      },
    ],
    livingHeading: 'Life on the Water',
    living: [
      {
        title: 'Boat from your backyard',
        text: 'Run to a sandbar on a Saturday, fish the inlet before work, or cruise the Intracoastal to waterfront restaurants in Wrightsville Beach, Southport, or Swansboro.',
      },
      {
        title: 'World-class fishing',
        text: 'Inshore red drum, flounder, and speckled trout; offshore king mackerel, mahi, and more. Many towns host fishing tournaments throughout the year.',
      },
      {
        title: 'Paddling and wildlife',
        text: 'Tidal creeks and marshes are perfect for kayaks and paddleboards, with herons, egrets, ospreys, and dolphins as regular neighbors.',
      },
      {
        title: 'Sunsets over the water',
        text: 'Many Intracoastal and river homes face west across the marsh — a daily reason waterfront owners rarely want to leave.',
      },
    ],
    considerationsHeading: 'What to Know Before Buying Waterfront',
    considerations: [
      {
        title: 'Water depth at low tide',
        text: 'Ask for depth at mean low water at the end of the dock and along the route to the main channel. A deep-draft boat needs very different water than a skiff or kayak.',
      },
      {
        title: 'Docks, piers, and permits',
        text: 'Docks and bulkheads in coastal counties are regulated by CAMA and sometimes the U.S. Army Corps of Engineers. Confirm existing structures were permitted and inspect pilings, decking, lifts, and bulkheads.',
      },
      {
        title: 'Riparian rights and marsh',
        text: 'Some "waterfront" lots have marsh or a common area between the yard and navigable water. Confirm riparian rights, HOA dock rules, and whether a dock can be built.',
      },
      {
        title: 'Bridges and inlet access',
        text: 'Fixed bridges along the Intracoastal Waterway can limit sailboat masts and tall boats. Inlet conditions and shoaling vary — local boaters and marinas are a great source of information.',
      },
      {
        title: 'Flood zone and insurance',
        text: 'Waterfront homes are often in flood zones. Get an elevation certificate and flood and wind insurance quotes early in due diligence.',
      },
    ],
    faqs: [
      {
        question: 'What is the difference between Intracoastal Waterway and oceanfront property?',
        answer:
          'Oceanfront homes face the Atlantic on a barrier island. Intracoastal Waterway (ICW) homes sit on the protected inland waterway, usually with room for a private dock and calmer water for boating. ICW homes are often more boater-friendly and can carry lower wind exposure than oceanfront.',
      },
      {
        question: 'How do I know if a waterfront home has deep water?',
        answer:
          'Ask the seller for depth soundings, talk to neighbors and local marinas, and check NOAA charts. A marine contractor or surveyor can measure depth at the dock at low tide. "Deep water" means different things for a kayak, a center console, and a sailboat.',
      },
      {
        question: 'Can I build a dock on any waterfront lot in North Carolina?',
        answer:
          'Not always. In coastal counties, docks are regulated under CAMA, and HOA rules, riparian corridors, marsh width, and water depth all affect what can be built. Confirm feasibility before you buy if a dock is a must-have.',
      },
      {
        question: 'Is there freshwater lakefront property in Southeastern NC?',
        answer:
          'Yes. Lake Waccamaw in Columbus County is the region\'s best-known freshwater lake community, and there are smaller lakes and riverfront properties inland in Pender, Onslow, and Columbus counties.',
      },
    ],
    related: ['beach', 'acreage', 'retirement', 'investment'],
    ctaTitle: 'Find Your Waterfront Home',
    ctaText:
      'Tell us what you boat, where you want to go, and how much water you need. We will narrow the shoreline to the homes that actually fit.',
  },
  {
    slug: 'historic',
    emoji: '🏛️',
    name: 'Historic Downtown Living',
    description: 'Charming downtowns with architecture, culture, and local community.',
    areas: ['Wilmington', 'Southport', 'Burgaw', 'Swansboro', 'Whiteville'],
    features: ['Historic homes', 'Walkable streets', 'Arts & dining', 'Festivals & culture'],
    bestFor: 'Culture seekers, walkers, preservation lovers',
    seoTitle: 'Historic Homes in Wilmington, Southport & Coastal NC',
    metaDescription:
      'Historic homes for sale in Wilmington, Southport, Burgaw, Swansboro & Whiteville NC. Neighborhood guide plus historic district, inspection & tax credit tips.',
    keywords: [
      'historic homes for sale Wilmington NC',
      'downtown Wilmington real estate',
      'Southport NC historic homes',
      'Carolina Heights Wilmington',
      'Forest Hills Wilmington homes',
      'Burgaw NC homes for sale',
      'Swansboro NC homes',
    ],
    heroTitle: 'Historic Homes & Downtown Living in Southeastern NC',
    heroSubtitle:
      'Porches, oak-lined streets, riverfront walks, and centuries of history — live where you can walk to dinner, festivals, and the water.',
    quickFacts: [
      { label: 'Signature district', value: 'Downtown Wilmington' },
      { label: 'Riverfront', value: 'Wilmington Riverwalk' },
      { label: 'Small-town gems', value: 'Southport, Burgaw, Swansboro' },
      { label: 'Key rule', value: 'Design review in districts' },
    ],
    intro: [
      'Southeastern North Carolina has deep roots. Wilmington was settled in the 1730s and its downtown is one of the largest historic districts in the state, filled with antebellum and Victorian homes, brick streets, and the Riverwalk along the Cape Fear River. Nearby, Southport, Swansboro, Burgaw, and Whiteville each offer their own small-town historic downtowns.',
      'Historic downtown living appeals to buyers who want character and community: front porches, neighbors who know your name, local restaurants and coffee shops within walking distance, theater and live music, and a calendar full of festivals. Homes range from grand restored residences to cottages, bungalows, and loft-style condos in converted commercial buildings.',
      'Owning an older home is rewarding, but it is different from buying new. Historic district design rules, older systems, and renovation costs all need to be part of the plan. We help buyers understand the rules, find the right inspectors, and budget realistically.',
    ],
    communitiesHeading: 'Historic Neighborhoods & Downtowns',
    communities: [
      {
        name: 'Downtown Wilmington Historic District',
        county: 'new-hanover',
        description:
          'Antebellum and Victorian homes, the Riverwalk, Thalian Hall, the Battleship North Carolina across the river, and dozens of restaurants and shops within walking distance.',
      },
      {
        name: 'Carolina Heights & Forest Hills (Wilmington)',
        county: 'new-hanover',
        description:
          'Early 20th-century neighborhoods with Craftsman, Colonial Revival, and Tudor homes on tree-lined streets, close to downtown and Greenfield Lake.',
      },
      {
        name: 'Sunset Park & the Brooklyn Arts District (Wilmington)',
        county: 'new-hanover',
        description:
          'Bungalows and cottages in revitalizing neighborhoods with breweries, galleries, and a creative community just outside downtown.',
      },
      {
        name: 'Southport',
        county: 'brunswick',
        description:
          'A charming maritime town with live oaks, waterfront parks, the North Carolina Maritime Museum at Southport, and one of the state\'s best-known Fourth of July festivals.',
      },
      {
        name: 'Swansboro',
        county: 'onslow',
        description:
          'Known as "The Friendly City by the Sea," with a walkable historic waterfront, local shops, and the annual Mullet Festival.',
      },
      {
        name: 'Burgaw',
        county: 'pender',
        description:
          'Pender County\'s seat, centered on a historic courthouse square and host of the North Carolina Blueberry Festival — small-town living within commuting distance of Wilmington.',
      },
      {
        name: 'Whiteville',
        county: 'columbus',
        description:
          'Columbus County\'s seat with a revitalized downtown, historic homes, and an affordable, friendly small-town feel.',
      },
    ],
    livingHeading: 'Life in a Historic Downtown',
    living: [
      {
        title: 'Walkability',
        text: 'Walk to coffee, dinner, farmers markets, and the waterfront. In downtown Wilmington and Southport, many residents use their car far less.',
      },
      {
        title: 'Arts and culture',
        text: 'Live theater at Thalian Hall, galleries, museums, concerts, and a busy film and music scene in Wilmington; festivals in every downtown.',
      },
      {
        title: 'Architecture with a story',
        text: 'Heart-pine floors, tall ceilings, wraparound porches, and original millwork — features you simply cannot find in new construction.',
      },
      {
        title: 'Strong sense of community',
        text: 'Neighborhood associations, porch culture, and local events make historic neighborhoods some of the most connected in the region.',
      },
    ],
    considerationsHeading: 'What to Know Before Buying a Historic Home',
    considerations: [
      {
        title: 'Historic district design review',
        text: 'Exterior changes in local historic districts usually require approval (often called a Certificate of Appropriateness) from a historic preservation commission. Check the guidelines before planning renovations.',
      },
      {
        title: 'Older systems and specialized inspections',
        text: 'Plan for thorough inspections of wiring, plumbing, foundations, roofs, and termite damage. Homes built before 1978 may contain lead-based paint and require federal disclosures.',
      },
      {
        title: 'Renovation budgets and tax credits',
        text: 'Restoration costs more than standard remodeling. Federal and state historic rehabilitation tax credits may be available for qualifying projects — consult a tax professional and the State Historic Preservation Office.',
      },
      {
        title: 'Parking, flood risk, and insurance',
        text: 'Downtown homes may have limited off-street parking, and some low-lying areas near the river carry flood risk. Insurance on older homes can cost more, so get quotes early.',
      },
    ],
    faqs: [
      {
        question: 'What are the best historic neighborhoods in Wilmington, NC?',
        answer:
          'Popular choices include the Downtown Historic District, Carolina Heights, Forest Hills, Carolina Place, Sunset Park, and the Brooklyn Arts District. Each offers a different mix of architecture, price point, and walkability.',
      },
      {
        question: 'Can I renovate a home in a historic district?',
        answer:
          'Yes, but exterior changes — windows, siding, additions, fences, and demolition — typically require approval from the local historic preservation commission. Interior renovations are usually less restricted. Review the district\'s design guidelines before you buy.',
      },
      {
        question: 'Are there historic small towns near Wilmington?',
        answer:
          'Yes. Southport is about 45 minutes south, Burgaw about 30 minutes north, Swansboro about an hour northeast, and Whiteville about 50 minutes west. Each has a historic downtown and a lower cost of living than downtown Wilmington.',
      },
      {
        question: 'Is downtown Wilmington walkable?',
        answer:
          'Very. The historic core, the Riverwalk, and nearby neighborhoods let many residents walk or bike to restaurants, shops, theaters, and parks. Walkability drops off the farther you get from the river.',
      },
    ],
    related: ['waterfront', 'retirement', 'investment', 'first-time'],
    ctaTitle: 'Find Your Historic Home',
    ctaText:
      'Whether you want a fully restored landmark or a project with good bones, we will help you find it and understand the rules before you buy.',
  },
  {
    slug: 'military',
    emoji: '🎖️',
    name: 'Military Relocation',
    description: 'Homes near Camp Lejeune and MCAS New River with VA loan expertise and PCS support.',
    areas: ['Onslow', 'Pender'],
    features: ['Base proximity', 'VA loan expertise', 'Remote/virtual buying', 'Rental-ready homes'],
    bestFor: 'Active duty, veterans, military families, PCS moves',
    seoTitle: 'Camp Lejeune Homes for Sale & PCS Relocation Guide',
    metaDescription:
      'PCSing to Camp Lejeune or MCAS New River? Guide to Jacksonville, Hubert, Sneads Ferry, Swansboro & Hampstead homes, VA loans, commutes and buying remotely.',
    keywords: [
      'Camp Lejeune homes for sale',
      'Jacksonville NC homes for sale',
      'PCS Camp Lejeune',
      'MCAS New River housing',
      'VA loan homes Jacksonville NC',
      'military relocation Jacksonville NC',
      'Hubert NC homes',
      'Sneads Ferry homes for sale',
    ],
    heroTitle: 'Military Relocation: Homes Near Camp Lejeune & MCAS New River',
    heroSubtitle:
      'PCS orders to Onslow County? Find the right neighborhood, use your VA loan benefit wisely, and buy with confidence — even from across the country.',
    quickFacts: [
      { label: 'Bases', value: 'Camp Lejeune, MCAS New River' },
      { label: 'County', value: 'Onslow' },
      { label: 'VA loan down payment', value: '$0 for eligible buyers' },
      { label: 'Beach from base', value: 'About 20–40 min' },
    ],
    intro: [
      'Marine Corps Base Camp Lejeune and Marine Corps Air Station New River make Onslow County one of the largest military communities on the East Coast. Jacksonville and the surrounding towns are built around service members and their families — from schools and shopping to the many veterans who choose to stay after they retire.',
      'Buying during a PCS move comes with a unique set of pressures: tight timelines, house hunting from another duty station, and the knowledge that you may be reassigned in a few years. Smart military buyers think about commute time to their gate, school options, and how easily the home will rent or resell when orders come.',
      'Lightkeeper Realty helps military families use their VA loan benefit, tour homes virtually, and close on schedule. We also specialize in HUD homes, which can be purchased with VA financing and can offer strong value for service members and veterans.',
    ],
    communitiesHeading: 'Popular Communities for Military Families',
    communities: [
      {
        name: 'Jacksonville',
        county: 'onslow',
        description:
          'The hub of Onslow County, with the widest selection of homes, shopping, dining, and the shortest commutes to the main gate at Camp Lejeune and to MCAS New River.',
      },
      {
        name: 'Hubert',
        county: 'onslow',
        description:
          'Convenient to the Sneads Ferry and back gates of Camp Lejeune, with newer subdivisions, larger lots, and a quieter, semi-rural setting.',
      },
      {
        name: 'Sneads Ferry',
        county: 'onslow',
        description:
          'A waterfront fishing village near the New River and the beaches of North Topsail, popular with families who want coastal living and a reasonable commute.',
      },
      {
        name: 'Swansboro',
        county: 'onslow',
        description:
          'A historic waterfront town near the eastern side of Camp Lejeune with highly regarded schools and easy access to Emerald Isle and Bogue Banks.',
      },
      {
        name: 'Richlands',
        county: 'onslow',
        description:
          'A small town north of Jacksonville with newer homes, larger lots, and an easy drive to MCAS New River.',
      },
      {
        name: 'Holly Ridge & North Topsail Beach',
        county: 'onslow',
        description:
          'Fast-growing communities with new construction near Topsail Island, convenient to the Sneads Ferry gate.',
      },
      {
        name: 'Hampstead',
        county: 'pender',
        description:
          'A popular choice for dual-income families splitting commutes between Camp Lejeune and Wilmington, with well-regarded schools and coastal amenities.',
      },
    ],
    livingHeading: 'Military Life in Onslow County',
    living: [
      {
        title: 'A community that understands service',
        text: 'Military families are the norm here, not the exception. Spouses find support networks quickly, and many local businesses offer military discounts.',
      },
      {
        title: 'Beaches and the outdoors',
        text: 'North Topsail Beach, Emerald Isle, Hammocks Beach State Park, and the New River are all close by for weekends on the water.',
      },
      {
        title: 'Affordable cost of living',
        text: 'Onslow County home prices generally compare favorably to Wilmington and many other coastal markets, which helps BAH go further.',
      },
      {
        title: 'Strong rental demand',
        text: 'Constant rotation of personnel means steady demand for rentals — useful if you plan to keep the home as an investment after your next PCS.',
      },
    ],
    considerationsHeading: 'Tips for Buying During a PCS',
    considerations: [
      {
        title: 'Know your gate and commute',
        text: 'Camp Lejeune is large, with multiple gates. Your unit\'s location can make a 10-minute or 40-minute difference. Map your commute before choosing a neighborhood.',
      },
      {
        title: 'Use your VA loan benefit wisely',
        text: 'VA loans allow eligible buyers to purchase with no down payment and no monthly mortgage insurance. Veterans with a service-connected disability rating may be exempt from the VA funding fee. Get pre-approved with a lender experienced in VA loans.',
      },
      {
        title: 'Plan your exit before you buy',
        text: 'If orders could move you in two to four years, choose a home that will rent well or resell easily: good school zones, practical floor plans, and reasonable HOA rules on rentals.',
      },
      {
        title: 'Buying remotely',
        text: 'Video tours, electronic signatures, and remote closings make it possible to buy before you arrive. A trusted local agent and inspector are your eyes on the ground.',
      },
      {
        title: 'Flood zones and storms',
        text: 'Parts of Onslow County near the New River and the coast sit in flood zones. Check flood maps and insurance costs, especially for homes near the water.',
      },
    ],
    faqs: [
      {
        question: 'What are the best areas to live near Camp Lejeune?',
        answer:
          'Jacksonville offers the shortest commutes and most amenities. Hubert and Sneads Ferry are convenient to the southern and back gates, Swansboro is popular for schools and its historic waterfront, Richlands suits MCAS New River commuters, and Hampstead works well for families who also commute to Wilmington.',
      },
      {
        question: 'Can I buy a home with a VA loan in Jacksonville, NC?',
        answer:
          'Yes. VA loans are widely used in Onslow County. Eligible service members and veterans can typically buy with no down payment and no monthly mortgage insurance, subject to lender approval and VA property requirements.',
      },
      {
        question: 'Can I use a VA loan to buy a HUD home?',
        answer:
          'Yes. HUD homes can be purchased with VA financing if the property meets VA requirements. Lightkeeper Realty specializes in HUD homes and can help you bid on eligible HUD properties in Onslow County and across North Carolina.',
      },
      {
        question: 'Should I buy or rent when I PCS to Camp Lejeune?',
        answer:
          'It depends on how long you expect to stay and whether you would keep the home as a rental after you leave. Many service members buy, rent the home out after their next PCS, and build long-term equity. We can walk you through rent-versus-buy numbers for your situation.',
      },
      {
        question: 'Can I buy a home before I arrive at my new duty station?',
        answer:
          'Yes. With virtual tours, a local inspector, electronic documents, and remote or mail-away closings, many military families buy before they arrive so they can move straight into their home.',
      },
    ],
    related: ['first-time', 'investment', 'beach', 'new-construction'],
    ctaTitle: 'PCSing to Camp Lejeune? Let\'s Talk',
    ctaText:
      'Send us your report date, unit or gate, and budget. We will build a short list of homes and neighborhoods that fit your commute and your future plans.',
    showHud: true,
  },
  {
    slug: 'retirement',
    emoji: '🌅',
    name: 'Retirement Living',
    description: 'Active-adult communities, coastal small towns, and the healthcare and amenities retirees need.',
    areas: ['Brunswick', 'New Hanover', 'Pender'],
    features: ['55+ & active-adult options', 'Golf & clubs', 'Healthcare access', 'Low-maintenance homes'],
    bestFor: 'Retirees, empty nesters, snowbirds',
    seoTitle: 'Retire in Coastal NC: Wilmington & Brunswick County',
    metaDescription:
      'Retiring to coastal North Carolina? Compare Southport, Leland, St. James, Wilmington & Hampstead — 55+ communities, healthcare, taxes and cost of living tips.',
    keywords: [
      'retire in coastal North Carolina',
      'best places to retire in NC',
      '55+ communities Wilmington NC',
      'retirement communities Brunswick County NC',
      'retire in Southport NC',
      'active adult communities Leland NC',
    ],
    heroTitle: 'Retiring to Coastal North Carolina',
    heroSubtitle:
      'Mild winters, beaches, golf, and genuine small-town warmth — discover why so many retirees are choosing Southeastern NC.',
    quickFacts: [
      { label: 'Fastest-growing area', value: 'Brunswick County' },
      { label: 'Social Security', value: 'Not taxed by NC' },
      { label: 'Regional medical hub', value: 'Wilmington' },
      { label: 'Climate', value: 'Mild, four seasons' },
    ],
    intro: [
      'Southeastern North Carolina consistently ranks among the most popular retirement destinations in the country. Brunswick County in particular has become one of the fastest-growing counties in the state, fueled by retirees relocating from the Northeast, Midwest, and other parts of the South.',
      'The appeal is easy to understand: mild winters, a lower cost of living than many coastal markets, beaches and golf, and a growing Wilmington healthcare system. North Carolina does not tax Social Security benefits, and property taxes in many coastal counties compare favorably with those in the Northeast.',
      'Retirement here can look many ways — an active-adult community with a full social calendar, a low-maintenance villa near the golf course, a cottage in a walkable small town like Southport, or a home near family in Wilmington. We help retirees weigh healthcare access, single-level living, HOA services, and long-term flexibility.',
    ],
    communitiesHeading: 'Popular Places to Retire',
    communities: [
      {
        name: 'Southport & St. James',
        county: 'brunswick',
        description:
          'Historic small-town charm in Southport, plus St. James\'s golf, marina, and clubs next door. Dosher Memorial Hospital is right in town.',
      },
      {
        name: 'Leland (Brunswick Forest, Compass Pointe & more)',
        county: 'brunswick',
        description:
          'Large master-planned communities with fitness centers, pools, clubs, and trails — about 10 to 20 minutes to Wilmington\'s hospitals, shopping, and airport.',
      },
      {
        name: 'Ocean Isle, Sunset Beach & Calabash',
        county: 'brunswick',
        description:
          'Quiet beach towns and golf communities in southern Brunswick County, close to the beaches and to North Myrtle Beach shopping and healthcare.',
      },
      {
        name: 'Wilmington',
        county: 'new-hanover',
        description:
          'City living with the region\'s largest hospital system, UNCW\'s Osher Lifelong Learning Institute, arts, dining, and the airport — ideal for retirees who want everything close by.',
      },
      {
        name: 'Carolina Beach & Kure Beach',
        county: 'new-hanover',
        description:
          'Beach-town living with year-round neighbors, walking paths, fishing piers, and a short drive to Wilmington.',
      },
      {
        name: 'Hampstead',
        county: 'pender',
        description:
          'A growing coastal community with golf, waterfront neighborhoods, and access to Topsail Island and Wilmington.',
      },
    ],
    livingHeading: 'Retirement Life on the Cape Fear Coast',
    living: [
      {
        title: 'Stay active',
        text: 'Golf, pickleball, walking trails, beach walks, boating, and fitness centers are part of daily life in most retiree-friendly communities.',
      },
      {
        title: 'Keep learning and connecting',
        text: 'Lifelong learning programs at UNCW, volunteer opportunities, churches, and community clubs make it easy to build a new circle of friends.',
      },
      {
        title: 'Healthcare access',
        text: 'Wilmington is the region\'s medical hub, with additional hospitals in Bolivia, Southport, Burgaw, Jacksonville, and Whiteville and a growing network of specialists and outpatient centers.',
      },
      {
        title: 'Family visits made easy',
        text: 'Wilmington International Airport (ILM) offers direct flights to several major hubs, and the beach makes your home the place the grandkids want to visit.',
      },
    ],
    considerationsHeading: 'What Retirees Should Consider',
    considerations: [
      {
        title: 'Single-level living and aging in place',
        text: 'Look for a first-floor primary suite, few steps at entry, wide doorways, and walk-in showers. Raised beach homes on pilings may need an elevator to be practical long-term.',
      },
      {
        title: 'HOA services and fees',
        text: 'Some communities include lawn care, exterior maintenance, and amenities in their dues. Compare what is included, not just the monthly cost.',
      },
      {
        title: 'Age-restricted vs. all-ages',
        text: 'True 55+ communities offer a peer group and quieter streets; all-ages communities may suit retirees who want families nearby. Know which you prefer.',
      },
      {
        title: 'Property tax relief for seniors',
        text: 'North Carolina offers a homestead property tax exclusion for qualifying residents age 65 or older (or totally and permanently disabled) who meet income limits. Check eligibility with the county tax office.',
      },
      {
        title: 'Hurricanes and insurance',
        text: 'Coastal living means planning for storm season. Factor insurance costs, flood zones, and evacuation plans into your decision.',
      },
    ],
    faqs: [
      {
        question: 'Is Southeastern North Carolina a good place to retire?',
        answer:
          'Many retirees think so. The region offers mild weather, beaches, golf, a lower cost of living than many coastal areas, a growing healthcare system in Wilmington, and no state income tax on Social Security benefits.',
      },
      {
        question: 'Does North Carolina tax retirement income?',
        answer:
          'North Carolina does not tax Social Security benefits. Most other retirement income, such as pensions and IRA withdrawals, is subject to the state\'s flat income tax, with some exceptions for certain government and military retirees. Consult a tax professional for your situation.',
      },
      {
        question: 'What are the best 55+ communities near Wilmington, NC?',
        answer:
          'Options include age-restricted neighborhoods and active-adult sections within larger master-planned communities in Leland, Wilmington, Southport, and Hampstead. Inventory and amenities change frequently, so contact us for a current comparison.',
      },
      {
        question: 'Where is the best healthcare for retirees in Southeastern NC?',
        answer:
          'Wilmington is the regional medical center, with the largest hospital and most specialists. Retirees in Brunswick, Pender, and Onslow counties also have local hospitals and can typically reach Wilmington within about 30 to 60 minutes.',
      },
    ],
    related: ['golf', 'beach', 'historic', 'new-construction'],
    ctaTitle: 'Plan Your Coastal Retirement',
    ctaText:
      'Tell us what matters most — golf, beach, healthcare, family, or budget — and we will help you compare communities and plan a scouting trip.',
  },
  {
    slug: 'new-construction',
    emoji: '🏗️',
    name: 'New Construction',
    description: 'Modern homes with the latest features, energy efficiency, and builder warranties.',
    areas: ['Brunswick', 'Pender', 'Onslow', 'New Hanover'],
    features: ['Modern floor plans', 'Builder warranties', 'Energy efficiency', 'Master-planned amenities'],
    bestFor: 'Buyers who want move-in ready, families, relocating buyers',
    seoTitle: 'New Construction Homes in Wilmington & Coastal NC',
    metaDescription:
      'New construction homes in Leland, Hampstead, Holly Ridge, Jacksonville & Wilmington NC. Why to bring your own agent, inspections, incentives and warranties.',
    keywords: [
      'new construction homes Wilmington NC',
      'new homes Leland NC',
      'new construction Hampstead NC',
      'new homes Jacksonville NC',
      'Holly Ridge new construction',
      'new construction Brunswick County',
      'buyer agent new construction NC',
    ],
    heroTitle: 'New Construction Homes in Southeastern North Carolina',
    heroSubtitle:
      'The region is growing fast. Find a brand-new home in a master-planned community — and have your own agent on your side at the builder\'s table.',
    quickFacts: [
      { label: 'Growth hot spots', value: 'Leland, Hampstead, Holly Ridge' },
      { label: 'Typical warranty', value: '1-2-10 year structure' },
      { label: 'Buyer agent', value: 'Register on first visit' },
      { label: 'Inspections', value: 'Pre-drywall & final' },
    ],
    intro: [
      'Southeastern North Carolina is one of the fastest-growing regions in the state, and new neighborhoods are opening every year. Leland and northern Brunswick County, Hampstead and Rocky Point in Pender County, Holly Ridge and Jacksonville in Onslow County, and areas of northern Wilmington all have active new construction.',
      'New homes offer open floor plans, energy-efficient systems, modern building codes designed for coastal wind loads, and builder warranties. Many are in master-planned communities with pools, clubhouses, walking trails, and planned commercial areas.',
      'Buying new is not the same as buying resale. The sales team in the model home works for the builder. Having your own agent — at no extra cost to you in most cases — means someone is negotiating incentives, reviewing the builder contract, and keeping an eye on construction for you.',
    ],
    communitiesHeading: 'Where New Homes Are Being Built',
    communities: [
      {
        name: 'Leland & Belville',
        county: 'brunswick',
        description:
          'Just across the river from Wilmington, Leland has been one of the region\'s busiest new construction markets, with master-planned communities at many price points.',
      },
      {
        name: 'Bolivia, Supply & Shallotte',
        county: 'brunswick',
        description:
          'Central and southern Brunswick County offer new neighborhoods closer to the beaches at prices often below Leland.',
      },
      {
        name: 'Hampstead',
        county: 'pender',
        description:
          'Coastal Pender County has seen steady new construction near US-17, between Wilmington and Topsail Island.',
      },
      {
        name: 'Rocky Point & Burgaw',
        county: 'pender',
        description:
          'More land and more affordable new homes along the I-40 corridor, with an easy commute to Wilmington.',
      },
      {
        name: 'Holly Ridge',
        county: 'onslow',
        description:
          'A fast-growing town near Topsail Island and Camp Lejeune with many new subdivisions — popular with military families and beach lovers.',
      },
      {
        name: 'Jacksonville & Richlands',
        county: 'onslow',
        description:
          'Ongoing new construction in and around Jacksonville offers modern homes close to Camp Lejeune and MCAS New River.',
      },
      {
        name: 'Northern Wilmington & Castle Hayne',
        county: 'new-hanover',
        description:
          'New neighborhoods and townhomes in northern New Hanover County, convenient to downtown, I-140, and Wrightsville Beach.',
      },
    ],
    livingHeading: 'Why Buyers Choose New Construction',
    living: [
      {
        title: 'Move-in ready',
        text: 'No deferred maintenance, no outdated systems — everything from the roof to the water heater is new.',
      },
      {
        title: 'Built for the coast',
        text: 'Newer homes are built to current codes, including wind-load requirements for coastal counties, and often include impact-rated features.',
      },
      {
        title: 'Lower energy costs',
        text: 'Modern insulation, windows, and HVAC systems typically mean lower utility bills than older homes of the same size.',
      },
      {
        title: 'Community amenities',
        text: 'Pools, clubhouses, trails, and playgrounds are often built into new master-planned communities.',
      },
    ],
    considerationsHeading: 'Smart Steps When Buying New',
    considerations: [
      {
        title: 'Bring your agent on the first visit',
        text: 'Most builders require your agent to register you on your first visit to the sales center. Visit alone first and you may lose the ability to have representation.',
      },
      {
        title: 'Read the builder contract',
        text: 'Builder contracts are not the standard NC Offer to Purchase. Review deposit terms, completion timelines, change-order rules, and what happens if construction is delayed.',
      },
      {
        title: 'Get independent inspections',
        text: 'Even new homes have defects. A pre-drywall inspection, final inspection, and an 11-month warranty inspection are inexpensive protection.',
      },
      {
        title: 'Compare incentives carefully',
        text: 'Builders often offer closing cost help or rate buydowns with their preferred lender. Compare the total cost — rate, fees, and price — against an outside lender.',
      },
      {
        title: 'Lot, flood zone, and HOA details',
        text: 'Lot premiums, drainage, flood zones, and HOA covenants vary by phase. Ask what is planned for adjacent land.',
      },
    ],
    faqs: [
      {
        question: 'Do I need a real estate agent to buy new construction?',
        answer:
          'You are not required to have one, but it is usually in your interest. The builder\'s sales agent represents the builder. In most cases the builder pays the buyer\'s agent commission, so you get your own representation for negotiating, contract review, and construction oversight at little or no additional cost. Remember to bring your agent on your first visit.',
      },
      {
        question: 'Where is the most new construction near Wilmington, NC?',
        answer:
          'Leland and northern Brunswick County have been the most active areas, followed by Hampstead, Rocky Point, Holly Ridge, and parts of northern New Hanover County. The best fit depends on commute, budget, and how close you want to be to the beach.',
      },
      {
        question: 'Should I get a home inspection on a brand-new house?',
        answer:
          'Yes. County code inspections check for minimum compliance, not workmanship. Independent pre-drywall and final inspections often catch issues the builder can fix before closing.',
      },
      {
        question: 'Are builder incentives worth it?',
        answer:
          'Sometimes. Rate buydowns and closing cost credits can be valuable, but they are often tied to the builder\'s preferred lender. Compare the full loan estimate against an outside lender before deciding.',
      },
    ],
    related: ['first-time', 'retirement', 'golf', 'military'],
    ctaTitle: 'Shop New Construction With an Advocate',
    ctaText:
      'Tell us your budget, preferred area, and timeline. We will help you compare builders and communities — and represent you from the first model home visit to closing.',
  },
  {
    slug: 'acreage',
    emoji: '🌳',
    name: 'Acreage & Country Living',
    description: 'Rural properties with land, privacy, and a connection to nature.',
    areas: ['Columbus', 'Pender', 'Onslow', 'Brunswick'],
    features: ['Large lots & acreage', 'Privacy', 'Hunting & farming', 'USDA loan eligible areas'],
    bestFor: 'Homesteaders, hunters, horse owners, families wanting space',
    seoTitle: 'Land & Homes with Acreage in Southeastern NC',
    metaDescription:
      'Find homes with acreage, farms and rural land in Columbus, Pender, Onslow & Brunswick counties NC. Learn about septic, wells, USDA loans and present-use value.',
    keywords: [
      'homes with acreage NC',
      'land for sale Southeastern NC',
      'Columbus County NC land for sale',
      'Pender County land for sale',
      'farms for sale near Wilmington NC',
      'rural homes Onslow County',
      'USDA homes NC',
    ],
    heroTitle: 'Homes with Acreage & Country Living in Southeastern NC',
    heroSubtitle:
      'Room to breathe, space to grow — find rural homes, farms, and land within reach of the coast.',
    quickFacts: [
      { label: 'Most land for the money', value: 'Columbus County' },
      { label: 'Common financing', value: 'USDA, conventional, land loans' },
      { label: 'Utilities', value: 'Often well & septic' },
      { label: 'Tax program', value: 'Present-use value' },
    ],
    intro: [
      'Just inland from the beaches, Southeastern North Carolina opens into farmland, pine forest, rivers, and swamps. Columbus County, western and northern Pender County, rural Onslow County, and parts of Brunswick County offer homes on several acres, small farms, hunting tracts, and wooded land — often at a fraction of coastal prices.',
      'Country living appeals to buyers who want privacy, room for a garden or livestock, a shop or barn, horses, or hunting land. Many rural homes are still within 30 to 60 minutes of Wilmington, Jacksonville, or the beach.',
      'Rural property requires a different kind of due diligence. Septic permits, wells, access easements, wetlands, zoning, and timber all affect what you can do with the land and what it is worth. We help buyers ask the right questions before they commit.',
    ],
    communitiesHeading: 'Where to Find Land and Country Homes',
    communities: [
      {
        name: 'Whiteville, Chadbourn & Tabor City',
        county: 'columbus',
        description:
          'Columbus County offers some of the best values in the region on land and rural homes, with farming heritage and festivals like the NC Pecan Harvest Festival and the NC Yam Festival.',
      },
      {
        name: 'Lake Waccamaw & Bolton',
        county: 'columbus',
        description:
          'Rural living near Lake Waccamaw State Park and the Green Swamp area, with land, lake access, and abundant wildlife.',
      },
      {
        name: 'Burgaw, Currie & Atkinson',
        county: 'pender',
        description:
          'Western and central Pender County offer farms, horse property, and wooded tracts near Moores Creek National Battlefield and the Black River.',
      },
      {
        name: 'Rocky Point & Maple Hill',
        county: 'pender',
        description:
          'Larger lots and rural homes near the Northeast Cape Fear River and Holly Shelter Game Land, with easy I-40 access to Wilmington.',
      },
      {
        name: 'Richlands & Northern Onslow',
        county: 'onslow',
        description:
          'Farmland and country homes north of Jacksonville, convenient to MCAS New River and Camp Lejeune.',
      },
      {
        name: 'Western Brunswick County',
        county: 'brunswick',
        description:
          'Rural areas around Ash, Longwood, and Supply offer acreage and a quiet setting within about 30 minutes of the beaches.',
      },
    ],
    livingHeading: 'Life in the Country',
    living: [
      {
        title: 'Privacy and quiet',
        text: 'No neighbors over the fence, dark night skies, and space to spread out.',
      },
      {
        title: 'Room for hobbies and animals',
        text: 'Gardens, chickens, horses, workshops, and RV or boat storage are much easier with acreage — subject to local zoning.',
      },
      {
        title: 'Hunting, fishing, and nature',
        text: 'State game lands, rivers, and private tracts provide some of the best hunting and freshwater fishing in eastern North Carolina.',
      },
      {
        title: 'Still close to the coast',
        text: 'Most rural communities in the region are within about an hour of the beach and a city.',
      },
    ],
    considerationsHeading: 'Due Diligence for Rural Property',
    considerations: [
      {
        title: 'Septic permits and soil',
        text: 'For vacant land, a soil evaluation (often called a perc test) through the county environmental health department determines whether, and what kind of, septic system can be installed. For existing homes, inspect the septic system.',
      },
      {
        title: 'Well water',
        text: 'Have the well tested for flow and water quality, and inspect the pump and pressure tank.',
      },
      {
        title: 'Access, easements, and surveys',
        text: 'Confirm legal, deeded access to a public road and get a current survey to verify boundaries and encroachments.',
      },
      {
        title: 'Wetlands, flood zones, and timber',
        text: 'Wetlands can limit building and clearing. Timber can add value. Review flood maps and, for larger tracts, consider a forestry or wetlands evaluation.',
      },
      {
        title: 'Financing and taxes',
        text: 'USDA Rural Development loans offer no-down-payment financing in eligible areas, which include much of rural Southeastern NC. Land actively used for agriculture, horticulture, or forestry may qualify for North Carolina\'s present-use value tax program.',
      },
      {
        title: 'Internet and utilities',
        text: 'High-speed internet availability varies widely in rural areas. Confirm service at the specific address if you work from home.',
      },
    ],
    faqs: [
      {
        question: 'Where can I find affordable land near Wilmington, NC?',
        answer:
          'Buyers often find the most land for the money in Columbus County and western Pender County. Rural parts of Onslow and Brunswick counties also offer acreage within commuting distance of Wilmington, Jacksonville, and the beaches.',
      },
      {
        question: 'Can I use a USDA loan to buy a home with acreage?',
        answer:
          'Often, yes. USDA Rural Development loans offer no-down-payment financing for eligible buyers in eligible rural areas. There are income limits and the property must be primarily residential, so very large tracts or income-producing farms may need other financing.',
      },
      {
        question: 'What is a perc test and do I need one?',
        answer:
          'A perc test, or soil evaluation, determines whether the soil can support a septic system. If you are buying vacant land without public sewer, it is one of the most important steps in due diligence. In North Carolina, it is handled through the county environmental health department.',
      },
      {
        question: 'What is present-use value in North Carolina?',
        answer:
          'Present-use value (PUV) is a program that taxes qualifying agricultural, horticultural, and forest land based on its use rather than its market value, which can significantly reduce property taxes. Requirements include minimum acreage and active management. If the land leaves the program, deferred taxes may be due.',
      },
    ],
    related: ['waterfront', 'first-time', 'investment', 'new-construction'],
    ctaTitle: 'Find Your Piece of the Country',
    ctaText:
      'Tell us how much land you want and how you plan to use it. We will help you find property that fits and work through septic, survey, and financing questions.',
  },
  {
    slug: 'investment',
    emoji: '💰',
    name: 'Investment Properties',
    description: 'Rental properties, fix-and-flip opportunities, HUD homes, and income-generating real estate.',
    areas: ['All five counties'],
    features: ['Long-term rentals', 'Vacation rentals', 'HUD & REO properties', 'Fix-and-flip'],
    bestFor: 'Investors, landlords, house flippers, 1031 exchange buyers',
    seoTitle: 'Investment Properties in Wilmington & Jacksonville NC',
    metaDescription:
      'Invest in Southeastern NC real estate: military rentals near Camp Lejeune, Wilmington long-term rentals, beach vacation rentals, HUD homes & fix-and-flips.',
    keywords: [
      'investment property Wilmington NC',
      'rental property Jacksonville NC',
      'vacation rental investment NC beach',
      'HUD homes for investors NC',
      'fix and flip Wilmington NC',
      '1031 exchange property NC',
    ],
    heroTitle: 'Investment Properties in Southeastern North Carolina',
    heroSubtitle:
      'Military rentals, beach vacation homes, long-term rentals, and HUD properties — a growing region with multiple investment strategies.',
    quickFacts: [
      { label: 'Rental drivers', value: 'Military, tourism, UNCW, growth' },
      { label: 'Strategies', value: 'Long-term, vacation, flip' },
      { label: 'Specialty', value: 'HUD homes' },
      { label: 'Under-90-day rentals', value: 'NC Vacation Rental Act' },
    ],
    intro: [
      'Southeastern North Carolina has several independent sources of housing demand: one of the largest Marine Corps installations in the world at Camp Lejeune, a major university at UNCW, a booming tourism economy along the beaches, and steady population growth from retirees and remote workers. That diversity gives investors more than one way to win.',
      'Long-term rentals near Camp Lejeune and MCAS New River benefit from constant turnover of military families. Wilmington offers rental demand from students, healthcare workers, and young professionals. Beach towns support weekly vacation rentals. And inland markets in Columbus and Pender counties offer lower entry prices.',
      'As a HUD homes specialist, Lightkeeper Realty helps investors find and bid on HUD properties after the owner-occupant priority period, along with bank-owned (REO) and value-add opportunities. We look at the numbers — rent, insurance, taxes, HOA rules, and repairs — before you buy.',
    ],
    communitiesHeading: 'Investment Markets in the Region',
    communities: [
      {
        name: 'Jacksonville & Onslow County',
        county: 'onslow',
        description:
          'Steady long-term rental demand from military families, typically with BAH-based budgets, and entry prices below Wilmington.',
      },
      {
        name: 'Wilmington',
        county: 'new-hanover',
        description:
          'Diverse rental demand from UNCW students, hospital staff, film and tech workers, and newcomers. Check the city\'s rules for short-term rentals before buying for that purpose.',
      },
      {
        name: 'Topsail Island & Carolina Beach',
        county: 'pender',
        description:
          'Strong seasonal vacation-rental demand. Each town has its own rules, so confirm rental regulations and HOA covenants before you buy.',
      },
      {
        name: 'Brunswick County beaches',
        county: 'brunswick',
        description:
          'Oak Island, Holden Beach, Ocean Isle, and Sunset Beach have well-established family vacation-rental markets and many professional rental managers.',
      },
      {
        name: 'Leland & growing suburbs',
        county: 'brunswick',
        description:
          'Rapid population growth supports long-term rentals and appreciation in newer neighborhoods — check HOA rental restrictions.',
      },
      {
        name: 'Whiteville & Columbus County',
        county: 'columbus',
        description:
          'Lower purchase prices and potential for strong cash-on-cash returns, with HUD and value-add homes appearing regularly.',
      },
    ],
    livingHeading: 'Investment Strategies That Work Here',
    living: [
      {
        title: 'Military long-term rentals',
        text: 'Homes near Camp Lejeune with good school zones and practical layouts tend to rent quickly to service members and their families.',
      },
      {
        title: 'Vacation rentals',
        text: 'Beach homes can generate strong summer income. Shoulder seasons, insurance, management fees, and occupancy taxes should all be in your projections.',
      },
      {
        title: 'HUD and value-add homes',
        text: 'HUD homes and other distressed properties can offer below-market prices for investors willing to renovate.',
      },
      {
        title: 'Buy, renovate, rent, refinance',
        text: 'The BRRRR strategy works well with HUD and bank-owned homes in Onslow, Pender, and Columbus counties.',
      },
    ],
    considerationsHeading: 'What Investors Should Know',
    considerations: [
      {
        title: 'Rental rules vary by town and HOA',
        text: 'Short-term rental rules differ between Wilmington, each beach town, and county areas. Many HOAs restrict rentals or minimum lease terms. Verify before you make an offer.',
      },
      {
        title: 'Insurance and taxes',
        text: 'Coastal insurance costs can make or break a deal. Vacation rentals also collect state and local occupancy taxes. Get insurance quotes during due diligence.',
      },
      {
        title: 'HUD homes for investors',
        text: 'HUD gives owner-occupants an exclusive priority bidding period. After that, investors can bid. Many HUD homes are sold as-is, so inspections and repair estimates are essential.',
      },
      {
        title: 'Property management',
        text: 'Local property and vacation-rental managers can make out-of-area ownership practical. Factor their fees into your numbers.',
      },
      {
        title: '1031 exchanges',
        text: 'Investors selling elsewhere can use a 1031 exchange to defer capital gains taxes on a like-kind property here. Work with a qualified intermediary and tax professional.',
      },
    ],
    faqs: [
      {
        question: 'Is Jacksonville, NC a good place to buy rental property?',
        answer:
          'Many investors like Jacksonville because Camp Lejeune and MCAS New River create steady rental demand from military families. Entry prices are generally lower than in Wilmington. As with any market, location, condition, and management matter.',
      },
      {
        question: 'Can investors buy HUD homes in North Carolina?',
        answer:
          'Yes. HUD first offers homes to owner-occupant buyers during a priority bidding period. If the home does not sell during that period, investors can bid. Lightkeeper Realty specializes in HUD homes and can submit bids on your behalf.',
      },
      {
        question: 'Are short-term rentals allowed in Wilmington and the beach towns?',
        answer:
          'Rules vary. Wilmington regulates whole-home short-term rentals, and each beach town and HOA has its own rules. North Carolina\'s Vacation Rental Act governs rentals under 90 days. Confirm the rules for the specific property before you buy.',
      },
      {
        question: 'What is the best investment strategy in Southeastern NC?',
        answer:
          'It depends on your goals and budget. Long-term military rentals in Onslow County tend to offer steady cash flow, beach vacation rentals offer higher seasonal income with more management, and HUD and value-add homes offer equity opportunities. We can help you model each.',
      },
    ],
    related: ['military', 'beach', 'first-time', 'acreage'],
    ctaTitle: 'Find Your Next Investment',
    ctaText:
      'Tell us your strategy, budget, and target returns. We will send you properties that fit — including HUD homes as they become available to investors.',
    showHud: true,
  },
  {
    slug: 'first-time',
    emoji: '🏠',
    name: 'First-Time Buyers',
    description: 'Affordable options, starter homes, and programs that help first-time buyers get in the door.',
    areas: ['All five counties'],
    features: ['Down payment assistance', 'FHA, VA & USDA loans', 'HUD $100 down', 'Starter homes'],
    bestFor: 'First-time buyers, young families, renters ready to own',
    seoTitle: 'First-Time Home Buyer Guide for Southeastern NC',
    metaDescription:
      'First-time home buyer in Wilmington, Jacksonville or coastal NC? Learn about NC down payment assistance, FHA, VA & USDA loans, HUD $100 down and starter homes.',
    keywords: [
      'first time home buyer NC',
      'first time home buyer Wilmington NC',
      'NC down payment assistance',
      'NC Home Advantage Mortgage',
      'HUD $100 down NC',
      'USDA loan NC',
      'affordable homes Jacksonville NC',
    ],
    heroTitle: 'First-Time Home Buyer Guide for Southeastern NC',
    heroSubtitle:
      'Stop renting and start building equity. Learn which programs, loans, and neighborhoods make homeownership possible on the Cape Fear coast.',
    quickFacts: [
      { label: 'FHA minimum down', value: '3.5%' },
      { label: 'VA & USDA down', value: '$0 for eligible buyers' },
      { label: 'HUD homes', value: '$100 down with FHA' },
      { label: 'State help', value: 'NC Housing Finance Agency' },
    ],
    intro: [
      'Buying your first home can feel out of reach with today\'s prices and interest rates, but first-time buyers in Southeastern North Carolina have more options than many realize. Low- and no-down-payment loans, state down payment assistance, and HUD homes can dramatically reduce the cash needed to buy.',
      'Affordability varies widely across the region. Jacksonville, Whiteville, Burgaw, Rocky Point, and parts of Brunswick County often offer more home for the money than Wilmington or the beaches, and many of these areas qualify for USDA financing.',
      'Lightkeeper Realty has helped first-time buyers for years, especially with HUD homes, which offer special incentives to owner-occupants. We will walk you through every step — from pre-approval to closing — and explain each document along the way.',
    ],
    communitiesHeading: 'Affordable Places to Buy Your First Home',
    communities: [
      {
        name: 'Jacksonville',
        county: 'onslow',
        description:
          'A large selection of starter homes and townhomes, with strong job stability tied to Camp Lejeune and a lower cost of living than Wilmington.',
      },
      {
        name: 'Whiteville & Tabor City',
        county: 'columbus',
        description:
          'Some of the most affordable homes in the region, many in USDA-eligible areas, with a small-town lifestyle.',
      },
      {
        name: 'Burgaw & Rocky Point',
        county: 'pender',
        description:
          'Affordable homes and newer subdivisions along I-40, within commuting distance of Wilmington — many USDA-eligible.',
      },
      {
        name: 'Castle Hayne & Northern Wilmington',
        county: 'new-hanover',
        description:
          'Townhomes, condos, and older ranch homes offering an entry point into New Hanover County.',
      },
      {
        name: 'Shallotte, Supply & Bolivia',
        county: 'brunswick',
        description:
          'More affordable Brunswick County options with access to the beaches and growing job and shopping centers.',
      },
      {
        name: 'Richlands & Hubert',
        county: 'onslow',
        description:
          'Newer homes on larger lots at approachable prices, convenient to Jacksonville and the bases.',
      },
    ],
    livingHeading: 'Programs That Help First-Time Buyers',
    living: [
      {
        title: 'NC Housing Finance Agency',
        text: 'The NC Home Advantage Mortgage and related down payment assistance programs help eligible buyers with down payment and closing costs. Income and credit requirements apply.',
      },
      {
        title: 'FHA, VA, and USDA loans',
        text: 'FHA loans require as little as 3.5% down. VA loans for eligible service members and veterans and USDA loans in eligible rural areas allow qualified buyers to purchase with no down payment.',
      },
      {
        title: 'HUD homes: $100 down',
        text: 'Owner-occupants buying a HUD home with FHA financing may qualify for HUD\'s $100 down payment incentive, and HUD may pay some closing costs. HUD homes also give owner-occupants first priority to bid.',
      },
      {
        title: 'Good Neighbor Next Door',
        text: 'HUD\'s Good Neighbor Next Door program offers eligible law enforcement officers, teachers, firefighters, and EMTs a 50% discount on homes in designated revitalization areas, with an owner-occupancy commitment.',
      },
    ],
    considerationsHeading: 'Steps to Buying Your First Home',
    considerations: [
      {
        title: '1. Get pre-approved',
        text: 'A lender reviews your income, credit, and savings and tells you what you can afford and which programs you qualify for. Sellers expect a pre-approval letter with your offer.',
      },
      {
        title: '2. Budget for the full cost',
        text: 'Plan for the down payment, closing costs, due diligence fee, earnest money, inspection, appraisal, insurance, and moving costs — and keep an emergency fund.',
      },
      {
        title: '3. Understand NC due diligence',
        text: 'North Carolina uses a due diligence period during which you inspect, appraise, and finalize your loan. The due diligence fee is paid to the seller and is usually non-refundable, so understand it before you sign.',
      },
      {
        title: '4. Inspect carefully',
        text: 'A home inspection, termite (wood-destroying insect) report, and — in coastal areas — a look at flood zones and insurance costs protect you from surprises.',
      },
      {
        title: '5. Close and move in',
        text: 'In North Carolina, an attorney handles closing. You will sign your loan documents, receive the keys, and become a homeowner.',
      },
    ],
    faqs: [
      {
        question: 'How much money do I need to buy my first home in North Carolina?',
        answer:
          'It depends on the loan and the price. FHA loans require as little as 3.5% down, VA and USDA loans can require nothing down, and HUD homes may be purchased with as little as $100 down using FHA financing. You will also need funds for closing costs, the due diligence fee, earnest money, and inspections, though seller concessions and assistance programs can help.',
      },
      {
        question: 'Does North Carolina have down payment assistance?',
        answer:
          'Yes. The North Carolina Housing Finance Agency offers the NC Home Advantage Mortgage with down payment assistance for eligible buyers, and some local governments and employers offer their own programs. A participating lender can tell you which programs you qualify for.',
      },
      {
        question: 'What is a HUD home and is it good for first-time buyers?',
        answer:
          'A HUD home is a one- to four-unit property acquired by HUD after an FHA-insured mortgage was foreclosed. HUD homes often sell below market value, owner-occupants get first priority to bid, and eligible buyers may use the $100 down FHA incentive. Lightkeeper Realty specializes in HUD homes in North Carolina.',
      },
      {
        question: 'What is the due diligence fee in North Carolina?',
        answer:
          'The due diligence fee is a negotiated amount paid directly to the seller for the right to inspect and evaluate the home during the due diligence period. If you close, it is credited toward your purchase. If you terminate, the seller usually keeps it. Ask your agent to explain it before you write an offer.',
      },
      {
        question: 'Where are the most affordable homes in Southeastern NC?',
        answer:
          'Columbus County, Jacksonville and northern Onslow County, inland Pender County (Burgaw and Rocky Point), and parts of Brunswick County typically offer the most affordable options, and many qualify for USDA financing.',
      },
    ],
    related: ['military', 'new-construction', 'acreage', 'investment'],
    ctaTitle: 'Ready to Buy Your First Home?',
    ctaText:
      'Start with a free consultation. We will explain your options, connect you with trusted local lenders, and help you find homes — including HUD homes — that fit your budget.',
    showHud: true,
  },
];

export function getLifestyle(slug: string) {
  return lifestyles.find((l) => l.slug === slug);
}
