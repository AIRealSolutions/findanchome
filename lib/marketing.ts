// Broker marketing (/dashboard/marketing): social post templates, share links, lead-capture links and the
// content calendar (fanc_marketing_posts, see supabase-migrations/control_center.sql).

import { SITE_URL } from './site';

export const WEEKLY_POST_GOAL = 3;

export function startOfWeek(now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  return d;
}

/** A broker's own links. The home-value link tags listing opportunities with them (the admin still reviews). */
export const captureLinks = (brokerId: string) => [
  { key: 'sell', label: 'Free home value & listing request', url: `${SITE_URL}/sell?agent=${brokerId}`, hint: 'Owners who submit it become listing opportunities, tagged for you.', tracked: true },
  { key: 'hud', label: 'HUD homes', url: `${SITE_URL}/hud`, hint: 'Great for investor and first-time buyer posts.', tracked: false },
  { key: 'search', label: 'Home search', url: `${SITE_URL}/search`, hint: '', tracked: false },
  { key: 'explore', label: 'Explore Southeastern NC', url: `${SITE_URL}/explore`, hint: 'County and community guides for relocation buyers.', tracked: false },
];

export interface PostFields {
  address: string;
  city: string;
  price: string;
  beds: string;
  baths: string;
  when: string;
  note: string;
  link: string;
}

export const EMPTY_FIELDS: PostFields = { address: '', city: '', price: '', beds: '', baths: '', when: '', note: '', link: '' };

export interface Sender { name: string; phone: string; company: string }

type Template = {
  kind: string;
  label: string;
  icon: string;
  fields: (keyof PostFields)[];
  /** Where the post's link points by default. */
  defaultLink: 'sell' | 'hud' | 'search' | 'none';
  build: (f: PostFields, s: Sender) => string;
};

const tag = (city: string) => (city ? ` #${city.replace(/[^a-z]/gi, '')}NC` : '');
const specs = (f: PostFields) => [f.beds && `${f.beds} bed`, f.baths && `${f.baths} bath`].filter(Boolean).join(' / ');
const priced = (p: string) => (p ? (/^\$/.test(p.trim()) ? p.trim() : `$${p.trim()}`) : '');
const sign = (s: Sender) => `${s.name}${s.phone ? ` · ${s.phone}` : ''}\n${s.company}`;
const lines = (...l: (string | false | undefined)[]) => l.filter(Boolean).join('\n');

export const POST_TEMPLATES: Template[] = [
  {
    kind: 'just_listed', label: 'Just listed', icon: '🏡', fields: ['address', 'city', 'price', 'beds', 'baths', 'note', 'link'], defaultLink: 'search',
    build: (f, s) => lines(`🏡 JUST LISTED${f.city ? ` in ${f.city}` : ''}!`, '', [f.address, specs(f), priced(f.price)].filter(Boolean).join(' · '), f.note,
      '', `Message me for a private showing.`, f.link, '', sign(s), '', `#JustListed #NCRealEstate${tag(f.city)} #LightkeeperRealty`),
  },
  {
    kind: 'open_house', label: 'Open house', icon: '🚪', fields: ['address', 'city', 'when', 'price', 'beds', 'baths', 'note', 'link'], defaultLink: 'search',
    build: (f, s) => lines(`🚪 OPEN HOUSE${f.when ? ` · ${f.when}` : ''}`, '', [f.address, f.city].filter(Boolean).join(', '), [specs(f), priced(f.price)].filter(Boolean).join(' · '), f.note,
      '', 'Stop by and say hi, no appointment needed!', f.link, '', sign(s), '', `#OpenHouse${tag(f.city)} #NCHomes`),
  },
  {
    kind: 'under_contract', label: 'Under contract', icon: '✍️', fields: ['address', 'city', 'note'], defaultLink: 'sell',
    build: (f, s) => lines(`✍️ UNDER CONTRACT${f.city ? ` in ${f.city}` : ''}!`, '', f.address && `${f.address} is spoken for.`, f.note,
      '', 'Thinking about selling? Buyers are out there. Find out what your home is worth:', f.link, '', sign(s), '', `#UnderContract${tag(f.city)} #NCRealEstate`),
  },
  {
    kind: 'just_sold', label: 'Just sold', icon: '🎉', fields: ['address', 'city', 'price', 'note'], defaultLink: 'sell',
    build: (f, s) => lines(`🎉 JUST SOLD${f.city ? ` in ${f.city}` : ''}!`, '', [f.address, priced(f.price)].filter(Boolean).join(' · '), f.note || 'Congratulations to my clients!',
      '', 'Curious what your home would sell for today? Get a free home value:', f.link, '', sign(s), '', `#JustSold${tag(f.city)} #LightkeeperRealty`),
  },
  {
    kind: 'home_value', label: 'What’s my home worth?', icon: '📈', fields: ['city', 'note', 'link'], defaultLink: 'sell',
    build: (f, s) => lines(`📈 Wondering what your home is worth${f.city ? ` in ${f.city}` : ''}?`, '',
      f.note || 'Homes in our area are still selling quickly. I’ll prepare a free, no-pressure market analysis for your home: real comps, not an online guess.',
      '', '👉 Request yours here:', f.link, '', sign(s), '', `#HomeValue #SellYourHome${tag(f.city)}`),
  },
  {
    kind: 'market_update', label: 'Market update', icon: '📊', fields: ['city', 'note', 'link'], defaultLink: 'sell',
    build: (f, s) => lines(`📊 ${f.city || 'Southeastern NC'} market update`, '', f.note || 'Here’s what I’m seeing this month: [inventory, days on market, price trends].',
      '', 'Want the numbers for your neighborhood? Message me or request a free home value:', f.link, '', sign(s), '', `#MarketUpdate${tag(f.city)} #NCRealEstate`),
  },
  {
    kind: 'hud_spotlight', label: 'HUD home spotlight', icon: '🏛️', fields: ['address', 'city', 'price', 'beds', 'baths', 'note', 'link'], defaultLink: 'hud',
    build: (f, s) => lines(`🏛️ HUD HOME OF THE WEEK${f.city ? ` · ${f.city}` : ''}`, '', [f.address, specs(f), priced(f.price)].filter(Boolean).join(' · '), f.note,
      '', 'HUD homes can be a great value, and owner-occupants get first priority to bid. I’m a HUD-registered broker and can help you bid.', f.link, '', sign(s), '', '#HUDHomes #FirstTimeHomeBuyer #NCHomes'),
  },
  {
    kind: 'seller_tip', label: 'Seller tip', icon: '💡', fields: ['note', 'link'], defaultLink: 'sell',
    build: (f, s) => lines('💡 Seller tip', '', f.note || 'Small fixes pay off: fresh paint, bright lighting and a tidy yard help buyers fall in love before they walk in.',
      '', 'Planning a move this year? Let’s talk strategy:', f.link, '', sign(s), '', '#SellerTips #HomeSelling'),
  },
  {
    kind: 'buyer_tip', label: 'Buyer tip', icon: '🔑', fields: ['note', 'link'], defaultLink: 'search',
    build: (f, s) => lines('🔑 Buyer tip', '', f.note || 'In North Carolina, the due diligence period is your time to inspect, appraise and decide. Plan it before you write an offer.',
      '', f.link, '', sign(s), '', '#HomeBuyingTips #NCRealEstate'),
  },
  {
    kind: 'testimonial', label: 'Client testimonial', icon: '⭐', fields: ['note', 'city', 'link'], defaultLink: 'sell',
    build: (f, s) => lines('⭐⭐⭐⭐⭐', '', f.note ? `“${f.note}”` : '“[Paste your client’s review here]”', '', 'Thank you for trusting me with your move! Thinking of buying or selling? I’d love to help.',
      f.link, '', sign(s), '', `#ClientLove${tag(f.city)} #LightkeeperRealty`),
  },
];

export const templateMeta = (kind: string) => POST_TEMPLATES.find((t) => t.kind === kind) ?? POST_TEMPLATES[0];

// ───────────────────────── Sharing ─────────────────────────

export const PLATFORMS = [
  { key: 'facebook', label: 'Facebook', limit: 63206 },
  { key: 'instagram', label: 'Instagram', limit: 2200 },
  { key: 'linkedin', label: 'LinkedIn', limit: 3000 },
  { key: 'x', label: 'X', limit: 280 },
  { key: 'email', label: 'Email', limit: 0 },
  { key: 'text', label: 'Text', limit: 0 },
] as const;
export type PlatformKey = (typeof PLATFORMS)[number]['key'];

/**
 * Where to send the post for each platform. Facebook, LinkedIn and Instagram don't accept pre-filled text from
 * a link, so the text is copied to the clipboard first and pasted there.
 */
export function shareUrl(platform: PlatformKey, text: string, link: string) {
  const e = encodeURIComponent;
  switch (platform) {
    case 'facebook': return link ? `https://www.facebook.com/sharer/sharer.php?u=${e(link)}` : 'https://www.facebook.com/';
    case 'linkedin': return link ? `https://www.linkedin.com/sharing/share-offsite/?url=${e(link)}` : 'https://www.linkedin.com/feed/';
    case 'instagram': return 'https://www.instagram.com/';
    case 'x': return `https://twitter.com/intent/tweet?text=${e(text)}`;
    case 'email': return `mailto:?subject=${e(text.split('\n')[0].replace(/^\W+/, ''))}&body=${e(text)}`;
    case 'text': return `sms:?&body=${e(text)}`;
  }
}

export const needsPaste = (p: PlatformKey) => p === 'facebook' || p === 'linkedin' || p === 'instagram';

/** Weekly posting rhythm for the content calendar. */
export const WEEKLY_PLAN = [
  { day: 'Monday', idea: 'Market update or a “what’s my home worth” post', kind: 'market_update' },
  { day: 'Wednesday', idea: 'A listing, open house or HUD home spotlight', kind: 'hud_spotlight' },
  { day: 'Friday', idea: 'A tip, a client story, or a just-sold celebration', kind: 'seller_tip' },
];
