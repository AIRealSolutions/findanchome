// Lifestyle guides shown on /lifestyle and /lifestyle/[slug].
// counties: display names; countySlugs link to /explore/<slug>.

export interface Lifestyle {
  slug: string;
  emoji: string;
  name: string;
  description: string;
  counties: string[];
  features: string[];
  bestFor: string;
  seoTitle: string;
  seoDescription: string;
  intro: string;
  towns: { name: string; county: string; note: string }[];
  countySlugs: string[];
  tips: string[];
  faqs: { q: string; a: string }[];
  listingFilter?: string;
}

export const lifestyles: Lifestyle[] = [
  {
    slug: 'beach',
    emoji: '🌊',
    name: 'Beach Living',
    description: 'Wake up to ocean views, enjoy sandy beaches, and embrace coastal culture.',
    counties: ['Pender', 'New Hanover', 'Brunswick', 'Onslow'],
    features: ['Beach access', 'Waterfront views', 'Seafood restaurants', 'Water sports'],
    bestFor: 'Retirees, families seeking outdoor lifestyle',
    seoTitle: 'Beach Homes for Sale in Southeastern NC | Topsail, Wrightsville, Oak Island',
    seoDescription: 'Find beach homes and condos on the Southeastern NC coast — Topsail Island, Wrightsville, Carolina and Kure Beach, Oak Island, Holden Beach and more. Flood zone and insurance tips from a local agent.',
    intro: 'Southeastern North Carolina has more than 100 miles of Atlantic coastline, from North Topsail Beach down to Sunset Beach near the South Carolina line. Each beach town has its own personality — lively boardwalks, quiet family beaches, and everything in between.',
    towns: [
      { name: 'Topsail Beach, Surf City & North Topsail Beach', county: 'Pender / Onslow', note: 'Relaxed, family-oriented island beaches with a small-town feel.' },
      { name: 'Wrightsville Beach', county: 'New Hanover', note: 'Upscale beach town minutes from downtown Wilmington, popular for surfing and paddleboarding.' },
      { name: 'Carolina Beach & Kure Beach', county: 'New Hanover', note: 'Classic boardwalk, fishing piers and a state park on Pleasure Island.' },
      { name: 'Oak Island, Holden Beach & Sunset Beach', county: 'Brunswick', note: 'Wide, uncrowded beaches and a quieter pace; popular with retirees and second-home buyers.' },
      { name: 'Emerald Isle area (nearby)', county: 'Carteret', note: 'Just north of our service area — we can refer you to a trusted agent.' },
    ],
    countySlugs: ['pender', 'new-hanover', 'brunswick', 'onslow'],
    tips: [
      'Check the FEMA flood zone and elevation certificate before you make an offer — they drive flood insurance cost.',
      'Get wind/hail and flood insurance quotes early; coastal premiums vary widely by location and construction.',
      'Ask about HOA and town rules on short-term rentals if you plan to rent the home part of the year.',
      'Oceanfront homes may be subject to CAMA setback rules for rebuilding or additions.',
    ],
    faqs: [
      { q: 'Do I need flood insurance for a beach home in NC?', a: 'If the home is in a FEMA Special Flood Hazard Area and you use a federally backed mortgage, flood insurance is required. Even outside those zones it is strongly recommended on the coast.' },
      { q: 'Which Southeastern NC beach is most affordable?', a: 'Prices change constantly, but inland towns a short drive from the beach — such as Hampstead, Leland, Jacksonville and Bolivia — generally cost less than island or oceanfront homes.' },
      { q: 'Can I rent out my beach house?', a: 'Many beach towns allow vacation rentals, but rules differ by town and HOA. We check the rules for any home you are considering.' },
    ],
  },
  {
    slug: 'golf',
    emoji: '⛳',
    name: 'Golf Communities',
    description: 'Championship courses, resort amenities, and communities built around the game.',
    counties: ['Brunswick', 'New Hanover', 'Pender'],
    features: ['18-hole courses', 'Golf clubs', 'Resort amenities', 'Active lifestyle'],
    bestFor: 'Golf enthusiasts, retirees',
    seoTitle: 'Golf Community Homes for Sale in Southeastern NC | Brunswick County Golf Homes',
    seoDescription: 'Homes in golf communities across Brunswick, New Hanover and Pender counties — from resort-style clubs to affordable courses near the beach.',
    intro: 'The Brunswick Islands and greater Wilmington area are home to dozens of golf courses, many inside planned communities with clubhouses, pools and social calendars. Mild winters mean golf is a year-round activity here.',
    towns: [
      { name: 'Southport, Bolivia & St. James area', county: 'Brunswick', note: 'Large amenity-rich golf communities near the Cape Fear River and the beaches.' },
      { name: 'Leland', county: 'Brunswick', note: 'Fast-growing golf neighborhoods about 15 minutes from downtown Wilmington.' },
      { name: 'Ocean Isle, Sunset Beach & Calabash', county: 'Brunswick', note: 'Courses close to the South Carolina line and the Grand Strand.' },
      { name: 'Wilmington & Porters Neck', county: 'New Hanover', note: 'Established club communities close to shopping, hospitals and the airport.' },
      { name: 'Hampstead', county: 'Pender', note: 'Golf and waterfront neighborhoods along the Intracoastal Waterway.' },
    ],
    countySlugs: ['brunswick', 'new-hanover', 'pender'],
    tips: [
      'Ask whether golf membership is required, optional, or bundled into HOA dues — and what it costs.',
      'Homes on the fairway have great views but expect the occasional stray ball.',
      'Review the HOA budget and reserve study; large amenity packages mean larger dues over time.',
    ],
    faqs: [
      { q: 'Do I have to join the golf club to buy in a golf community?', a: 'It depends on the community. Some require a membership, others make it optional. We confirm the requirement and the cost before you write an offer.' },
      { q: 'Where are the most golf communities in Southeastern NC?', a: 'Brunswick County has the highest concentration, especially around Southport, Leland, Ocean Isle Beach and Calabash.' },
    ],
  },
  {
    slug: 'waterfront',
    emoji: '🚤',
    name: 'Waterfront & Boating',
    description: 'Direct water access for boating, fishing, and water recreation.',
    counties: ['Onslow', 'Pender', 'Brunswick', 'New Hanover'],
    features: ['Boat docks', 'River access', 'Fishing piers', 'Waterfront dining'],
    bestFor: 'Boaters, fishermen, water enthusiasts',
    seoTitle: 'Waterfront Homes for Sale in Southeastern NC | Intracoastal, Sound & River',
    seoDescription: 'Waterfront and boating homes on the Intracoastal Waterway, sounds, creeks and rivers of Southeastern NC — Sneads Ferry, Hampstead, Wilmington, Southport and more.',
    intro: 'Beyond the ocean, Southeastern NC has miles of Intracoastal Waterway, sounds, tidal creeks and rivers. Waterfront homes with private docks are often more sheltered — and sometimes more affordable — than oceanfront property.',
    towns: [
      { name: 'Sneads Ferry & Swansboro', county: 'Onslow', note: 'Fishing villages on the New River and White Oak River with deep boating traditions.' },
      { name: 'Hampstead', county: 'Pender', note: 'Homes along Topsail Sound and the Intracoastal Waterway.' },
      { name: 'Wilmington, Masonboro & Porters Neck', county: 'New Hanover', note: 'Deep-water access to the Intracoastal and quick runs to the inlets.' },
      { name: 'Southport & Boiling Spring Lakes', county: 'Brunswick', note: 'Cape Fear River and Intracoastal living near marinas and the ferry.' },
    ],
    countySlugs: ['onslow', 'pender', 'new-hanover', 'brunswick'],
    tips: [
      'Ask for water depth at mean low tide at the dock — it determines what size boat you can keep.',
      'Have docks, bulkheads and boat lifts inspected separately from the house.',
      'Check whether the dock and pier permits are in place and transfer with the property.',
    ],
    faqs: [
      { q: 'What is the difference between waterfront and water access?', a: 'Waterfront means the lot touches the water and may allow a private dock. Water access usually means a shared community dock, boat ramp or slip.' },
      { q: 'Are Intracoastal homes in a flood zone?', a: 'Many are. We pull the flood zone and any elevation certificate for every waterfront home so you can price insurance before you commit.' },
    ],
  },
  {
    slug: 'historic',
    emoji: '🏛️',
    name: 'Historic Downtown Living',
    description: 'Charming downtowns with architecture, culture, and local community.',
    counties: ['New Hanover', 'Brunswick', 'Pender', 'Onslow'],
    features: ['Historic homes', 'Local culture', 'Walkable streets', 'Fine dining'],
    bestFor: 'Culture seekers, urban dwellers',
    seoTitle: 'Historic Homes for Sale in Southeastern NC | Downtown Wilmington, Southport & Burgaw',
    seoDescription: 'Historic and walkable downtown homes in Wilmington, Southport, Burgaw and Swansboro — what to know about historic districts, renovations and older-home inspections.',
    intro: 'Southeastern North Carolina has some of the state’s oldest towns. Downtown Wilmington’s historic district, Southport’s waterfront, Burgaw’s courthouse square and Swansboro’s harbor all offer walkable streets lined with restored homes.',
    towns: [
      { name: 'Downtown Wilmington', county: 'New Hanover', note: 'One of the largest historic districts in NC, with a riverfront, restaurants and arts scene.' },
      { name: 'Southport', county: 'Brunswick', note: 'A picturesque harbor town with historic cottages and live oaks.' },
      { name: 'Burgaw', county: 'Pender', note: 'Small-town courthouse square and an affordable historic housing stock.' },
      { name: 'Swansboro', county: 'Onslow', note: 'The “Friendly City by the Sea,” with a walkable historic waterfront.' },
    ],
    countySlugs: ['new-hanover', 'brunswick', 'pender', 'onslow'],
    tips: [
      'Homes in a local historic district usually need design approval for exterior changes.',
      'Budget for specialized inspections — older wiring, plumbing, foundations and possible lead paint.',
      'Ask about historic preservation tax credits for qualifying rehabilitation work.',
    ],
    faqs: [
      { q: 'Can I renovate a home in a historic district?', a: 'Yes, but exterior changes usually need a Certificate of Appropriateness from the local historic preservation commission. Interior work is generally not reviewed.' },
      { q: 'Are historic homes harder to insure?', a: 'Sometimes. Older roofs, wiring and plumbing can affect premiums, so get insurance quotes during your due diligence period.' },
    ],
  },
  {
    slug: 'military',
    emoji: '🎖️',
    name: 'Military Relocation',
    description: 'Communities with military focus, base proximity, and military services.',
    counties: ['Onslow', 'Pender'],
    features: ['Base proximity', 'VA loan expertise', 'Family support', 'PCS-friendly timelines'],
    bestFor: 'Military families, active duty, veterans',
    seoTitle: 'Military Relocation to Camp Lejeune | Homes Near Camp Lejeune & New River',
    seoDescription: 'PCSing to Camp Lejeune or MCAS New River? Find homes in Jacksonville, Hubert, Sneads Ferry, Richlands and Hampstead with a local agent who understands VA loans and BAH.',
    intro: 'Marine Corps Base Camp Lejeune and Marine Corps Air Station New River make Onslow County one of the largest military communities on the East Coast. We help service members and veterans buy smart — including homes that make good rentals when orders change.',
    towns: [
      { name: 'Jacksonville', county: 'Onslow', note: 'Shortest commutes to the main gates, shopping and schools.' },
      { name: 'Hubert & Swansboro', county: 'Onslow', note: 'Close to the Piney Green and Sneads Ferry gates with a coastal feel.' },
      { name: 'Sneads Ferry', county: 'Onslow', note: 'Waterfront living near the back gate of Camp Lejeune.' },
      { name: 'Richlands', county: 'Onslow', note: 'Newer construction and more land at a lower price point.' },
      { name: 'Hampstead & Surf City', county: 'Pender', note: 'A longer commute traded for beach-area living.' },
    ],
    countySlugs: ['onslow', 'pender'],
    tips: [
      'VA loans allow 0% down for eligible buyers; get your Certificate of Eligibility early.',
      'Compare your BAH to the full monthly payment, including taxes, insurance and any HOA.',
      'Buy with resale or rental in mind — your next orders may come sooner than expected.',
      'Ask your agent to schedule closing around your PCS report date and household goods delivery.',
    ],
    faqs: [
      { q: 'Can I buy a home before I arrive at Camp Lejeune?', a: 'Yes. We regularly help families buy remotely with video tours, electronic signing and remote closings.' },
      { q: 'Should I buy or rent when I PCS to Camp Lejeune?', a: 'If you expect to stay three years or more, or would keep the home as a rental, buying with a VA loan often makes sense. We can run the numbers with you.' },
      { q: 'Can I use a VA loan on a HUD home?', a: 'Yes. HUD homes can be purchased with VA financing if the property meets VA requirements. We are a HUD buyer’s agency and can help you bid.' },
    ],
  },
  {
    slug: 'retirement',
    emoji: '🌅',
    name: 'Retirement Living',
    description: 'Communities designed for active retirement with amenities and services.',
    counties: ['Brunswick', 'New Hanover', 'Pender'],
    features: ['55+ communities', 'Golf access', 'Healthcare', 'Social clubs'],
    bestFor: 'Retirees, empty nesters',
    seoTitle: 'Retire to the NC Coast | 55+ and Retirement Homes in Southeastern NC',
    seoDescription: 'Retirement and 55+ communities in Brunswick, New Hanover and Pender counties — mild winters, beaches, golf and access to Wilmington healthcare.',
    intro: 'Mild winters, lower property taxes than many Northeastern states, beaches and golf have made the Southeastern NC coast one of the most popular retirement destinations in the country. Brunswick County in particular is among the fastest-growing retirement areas in the state.',
    towns: [
      { name: 'Leland, Bolivia & Southport', county: 'Brunswick', note: 'Several large 55+ and amenity communities with clubhouses and golf.' },
      { name: 'Ocean Isle, Sunset Beach & Calabash', county: 'Brunswick', note: 'Quiet beach towns near the South Carolina line.' },
      { name: 'Wilmington', county: 'New Hanover', note: 'Closest to the region’s main hospital system, the airport, arts and dining.' },
      { name: 'Hampstead', county: 'Pender', note: 'A small-town feel between Wilmington and Topsail Island.' },
    ],
    countySlugs: ['brunswick', 'new-hanover', 'pender'],
    tips: [
      'Consider single-level living and distance to healthcare as you narrow your search.',
      'Check whether a community is age-restricted (55+) or simply age-targeted.',
      'North Carolina offers a homestead property tax exclusion for qualifying seniors and disabled veterans — ask the county tax office.',
    ],
    faqs: [
      { q: 'What is the best place to retire on the NC coast?', a: 'It depends on what matters most to you. Brunswick County is popular for golf and 55+ communities, Wilmington for healthcare and culture, and Pender County for a quieter small-town feel.' },
      { q: 'Are there 55+ communities near Wilmington, NC?', a: 'Yes, several age-restricted and age-targeted communities are located in Leland, Bolivia, Southport and the greater Wilmington area.' },
    ],
  },
  {
    slug: 'new-construction',
    emoji: '🏗️',
    name: 'New Construction',
    description: 'Modern homes with latest features, energy efficiency, and warranties.',
    counties: ['Onslow', 'Pender', 'New Hanover', 'Brunswick'],
    features: ['Modern design', 'Builder warranty', 'Energy efficient', 'Master planned'],
    bestFor: 'Buyers wanting new, families',
    seoTitle: 'New Construction Homes in Southeastern NC | Buyer’s Agent for New Builds',
    seoDescription: 'New construction homes in Jacksonville, Richlands, Hampstead, Leland and Wilmington. Use your own buyer’s agent at no extra cost and negotiate builder incentives.',
    intro: 'Southeastern NC is one of the fastest-growing regions in the state, and builders are active in nearly every county. Having your own agent on a new build costs you nothing extra in most cases and helps you negotiate upgrades, incentives and closing costs.',
    towns: [
      { name: 'Jacksonville & Richlands', county: 'Onslow', note: 'Many new subdivisions at entry-level and mid-range price points.' },
      { name: 'Hampstead & Rocky Point', county: 'Pender', note: 'New neighborhoods between Wilmington and Topsail.' },
      { name: 'Leland & Winnabow', county: 'Brunswick', note: 'Master-planned communities with pools and amenities.' },
      { name: 'Castle Hayne & northern Wilmington', county: 'New Hanover', note: 'Newer homes closer to the city.' },
    ],
    countySlugs: ['onslow', 'pender', 'brunswick', 'new-hanover'],
    tips: [
      'Bring your agent to your very first visit — many builders require it for agent representation.',
      'Builder-preferred lenders may offer incentives; compare the full loan cost anyway.',
      'Hire an independent home inspector, even on brand-new construction.',
    ],
    faqs: [
      { q: 'Do I need a real estate agent to buy new construction?', a: 'You are not required to, but the builder’s sales rep represents the builder. Your own agent represents you, and the builder usually pays the commission.' },
      { q: 'Should I get a home inspection on a new house?', a: 'Yes. Independent inspections before drywall and before closing regularly find issues that the builder then fixes under contract.' },
    ],
  },
  {
    slug: 'acreage',
    emoji: '🌳',
    name: 'Acreage & Country Living',
    description: 'Rural properties with land, privacy, and connection to nature.',
    counties: ['Columbus', 'Onslow', 'Pender'],
    features: ['Large lots', 'Privacy', 'Nature access', 'Farming possible'],
    bestFor: 'Families seeking space, nature lovers',
    seoTitle: 'Land & Acreage for Sale in Southeastern NC | Rural Homes & Farms',
    seoDescription: 'Homes with acreage, farms and rural land in Columbus, Pender and Onslow counties — with USDA loan options and tips on wells, septic and land use.',
    intro: 'If you want room to breathe, Southeastern NC still has plenty of open land. Columbus, inland Pender and western Onslow counties offer homes on acreage, small farms and hunting land at prices well below the coast.',
    towns: [
      { name: 'Whiteville, Tabor City & Chadbourn', county: 'Columbus', note: 'Affordable farmland and rural homes with a strong agricultural heritage.' },
      { name: 'Lake Waccamaw', county: 'Columbus', note: 'Lake living with a state park and a quiet pace.' },
      { name: 'Burgaw, Atkinson & Rocky Point', county: 'Pender', note: 'Rural land within commuting distance of Wilmington.' },
      { name: 'Richlands & western Onslow', county: 'Onslow', note: 'Country living within reach of Jacksonville and Camp Lejeune.' },
    ],
    countySlugs: ['columbus', 'pender', 'onslow'],
    tips: [
      'Many rural homes qualify for USDA loans with no down payment — check eligibility by address.',
      'Have the well and septic system inspected, and get a perc test before buying raw land.',
      'Order a survey and check for easements, wetlands and present-use value tax status.',
    ],
    faqs: [
      { q: 'Can I get a USDA loan for a home on acreage?', a: 'Often, yes, as long as the property is in an eligible rural area and the land is primarily residential rather than income-producing.' },
      { q: 'Where is the cheapest land in Southeastern NC?', a: 'Columbus County generally has the lowest land prices in our five-county area.' },
    ],
  },
  {
    slug: 'investment',
    emoji: '💰',
    name: 'Investment Properties',
    description: 'Rental properties, fix-and-flip opportunities, and income-generating assets.',
    counties: ['Onslow', 'Pender', 'New Hanover', 'Brunswick', 'Columbus'],
    features: ['Rental income', 'Appreciation', 'Cash flow', 'Portfolio building'],
    bestFor: 'Investors, business owners',
    seoTitle: 'Investment Properties in Southeastern NC | Rentals, Vacation Homes & Flips',
    seoDescription: 'Long-term rentals near Camp Lejeune, vacation rentals at the beach, and fix-and-flip opportunities including HUD and bank-owned homes across Southeastern NC.',
    intro: 'Steady military rental demand in Onslow County, a university and growing job market in Wilmington, and strong vacation demand at the beaches make Southeastern NC attractive to investors. HUD and bank-owned homes can also offer value-add opportunities.',
    towns: [
      { name: 'Jacksonville', county: 'Onslow', note: 'Consistent long-term rental demand from military families.' },
      { name: 'Wilmington', county: 'New Hanover', note: 'Student and workforce rentals near UNCW and downtown.' },
      { name: 'Topsail, Carolina Beach & Oak Island', county: 'Pender / New Hanover / Brunswick', note: 'Vacation rental markets — check local short-term rental rules.' },
      { name: 'Whiteville', county: 'Columbus', note: 'Lower entry prices for cash-flow-focused buyers.' },
    ],
    countySlugs: ['onslow', 'new-hanover', 'pender', 'brunswick', 'columbus'],
    tips: [
      'HUD homes give owner-occupants an exclusive first bidding period; investors can bid after it ends.',
      'Underwrite insurance and flood costs carefully on coastal rentals.',
      'Verify short-term rental rules with the town and HOA before buying a vacation rental.',
    ],
    faqs: [
      { q: 'Can investors buy HUD homes?', a: 'Yes. After the owner-occupant priority period ends, HUD homes open to investor bids. We submit bids for investors throughout North Carolina.' },
      { q: 'Is Jacksonville, NC a good rental market?', a: 'Military housing demand around Camp Lejeune has historically kept rental occupancy strong, though returns depend on price, condition and management.' },
    ],
    listingFilter: '/investments',
  },
  {
    slug: 'first-time',
    emoji: '🏠',
    name: 'First-Time Buyers',
    description: 'Affordable options, starter homes, and programs to help first-time buyers.',
    counties: ['Onslow', 'Pender', 'New Hanover', 'Brunswick', 'Columbus'],
    features: ['Affordable', 'Starter homes', 'FHA programs', 'Buyer support'],
    bestFor: 'First-time homebuyers, young families',
    seoTitle: 'First-Time Home Buyers in Southeastern NC | Programs, HUD Homes & Low Down Payment',
    seoDescription: 'First-time buyer guide for Southeastern NC: FHA, VA and USDA loans, NC Housing Finance Agency down payment help, and HUD homes with $100 down.',
    intro: 'Buying your first home is a big step, and there is more help available than most people realize — low and no down payment loans, down payment assistance from the NC Housing Finance Agency, and HUD homes that can be purchased with as little as $100 down for owner-occupants with FHA financing.',
    towns: [
      { name: 'Jacksonville & Richlands', county: 'Onslow', note: 'Some of the most affordable starter homes in the region.' },
      { name: 'Whiteville & Columbus County', county: 'Columbus', note: 'Low prices and many USDA-eligible areas.' },
      { name: 'Burgaw & Rocky Point', county: 'Pender', note: 'Affordable homes within commuting distance of Wilmington.' },
      { name: 'Leland & Shallotte', county: 'Brunswick', note: 'Newer starter homes in fast-growing areas.' },
    ],
    countySlugs: ['onslow', 'columbus', 'pender', 'brunswick'],
    tips: [
      'Get pre-approved before you shop — it tells you your budget and makes your offer stronger.',
      'Ask your lender about NC Housing Finance Agency down payment assistance.',
      'HUD homes offer owner-occupants first chance to bid and can be bought with $100 down on FHA loans.',
    ],
    faqs: [
      { q: 'How much do I need for a down payment in NC?', a: 'FHA loans start at 3.5% down, VA and USDA loans can be 0% down, and HUD’s $100 down program is available on eligible HUD homes for owner-occupants using FHA financing.' },
      { q: 'What is the HUD $100 down program?', a: 'On eligible HUD homes, owner-occupant buyers using an FHA loan can put just $100 down. We are a HUD buyer’s agency and can show you which homes qualify.' },
      { q: 'Do first-time buyers pay for a buyer’s agent?', a: 'Compensation is agreed in writing before we tour homes. In many cases the seller or builder pays it, and we explain your options up front.' },
    ],
  },
];

export function getLifestyle(slug: string) {
  return lifestyles.find((l) => l.slug === slug);
}
