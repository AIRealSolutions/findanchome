// Message templates for texts and emails to clients (/dashboard/templates), stored in fanc_message_templates
// (see supabase-migrations/message_templates.sql). Bodies use {merge_fields} filled from the client and occasion.

import { createClient } from './supabase/client';

export type TemplateCategory =
  | 'general' | 'birthday' | 'home_anniversary' | 'wedding_anniversary' | 'insurance_renewal' | 'flood_insurance_renewal'
  | 'home_warranty_expiration' | 'mortgage_review' | 'hoa_dues' | 'lease_end' | 'deal';

export interface MessageTemplate {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  category: TemplateCategory;
  subject: string | null;
  body: string;
  is_default: boolean;
  sort: number;
}

export const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: 'general', label: 'General / check-ins' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'home_anniversary', label: 'Home anniversary' },
  { value: 'wedding_anniversary', label: 'Wedding anniversary' },
  { value: 'insurance_renewal', label: 'Homeowners insurance renewal' },
  { value: 'flood_insurance_renewal', label: 'Flood insurance renewal' },
  { value: 'home_warranty_expiration', label: 'Home warranty ending' },
  { value: 'mortgage_review', label: 'Mortgage / refinance check-in' },
  { value: 'hoa_dues', label: 'HOA dues' },
  { value: 'lease_end', label: 'Lease ending' },
  { value: 'deal', label: 'Deals (buying / selling)' },
];
export const categoryLabel = (c: TemplateCategory) => TEMPLATE_CATEGORIES.find((x) => x.value === c)?.label ?? c;

export const MERGE_FIELDS: { key: string; label: string; sample: string }[] = [
  { key: 'first_name', label: 'First name', sample: 'Linda' },
  { key: 'last_name', label: 'Last name', sample: 'Lohr' },
  { key: 'full_name', label: 'Full name', sample: 'Linda Lohr' },
  { key: 'spouse_name', label: 'Spouse / partner', sample: 'Steve' },
  { key: 'address', label: 'Their street address', sample: '123 Ocean Blvd' },
  { key: 'city', label: 'Their city', sample: 'Southport' },
  { key: 'years', label: 'Years (number)', sample: '5' },
  { key: 'years_text', label: 'Years (“5 years”)', sample: '5 years' },
  { key: 'date', label: 'Date of the occasion', sample: 'December 1' },
  { key: 'provider', label: 'Insurance / warranty company', sample: 'NC Farm Bureau' },
  { key: 'property', label: 'Deal property', sample: '456 Marsh Ln, Oak Island' },
  { key: 'closing_date', label: 'Deal closing date', sample: 'November 20' },
  { key: 'my_name', label: 'My name', sample: 'Marc Spencer' },
  { key: 'my_phone', label: 'My phone', sample: '(910) 555-0100' },
  { key: 'my_email', label: 'My email', sample: 'marc@example.com' },
];

export type MergeContext = Partial<Record<string, string | null | undefined>>;

/**
 * Fill {fields}. Text in [square brackets] is kept only when every field inside it has a value, so
 * "insurance[ with {provider}] renews" reads well with or without a provider. Leftover blanks are tidied.
 */
export function renderTemplate(text: string, ctx: MergeContext) {
  const value = (k: string) => (ctx[k] ?? '').toString().trim();
  return text
    .replace(/\[([^\[\]]*)\]/g, (_, inner: string) => {
      const keys = [...inner.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
      return keys.every((k) => value(k)) ? inner : '';
    })
    .replace(/\{(\w+)\}/g, (_, k: string) => value(k))
    .replace(/\( *\)/g, '')
    .replace(/[ \t]+([,.!?])/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

export const SAMPLE_CONTEXT: MergeContext = Object.fromEntries(MERGE_FIELDS.map((f) => [f.key, f.sample]));

export interface Me {
  name: string;
  phone?: string | null;
  email?: string | null;
}

export const meContext = (me: Me): MergeContext => ({ my_name: me.name, my_phone: me.phone, my_email: me.email });

/** Merge fields about a client. */
export function clientContext(c: { first_name: string; last_name?: string | null; spouse_name?: string | null; address_line1?: string | null; city?: string | null }): MergeContext {
  return {
    first_name: c.first_name,
    last_name: c.last_name,
    full_name: [c.first_name, c.last_name].filter(Boolean).join(' '),
    spouse_name: c.spouse_name,
    address: c.address_line1,
    city: c.city,
  };
}

const SIGN = '\n– {my_name}, Lightkeeper Realty';

/** Starter set, added the first time the templates page opens. The calendar falls back to these too. */
export const STARTER_TEMPLATES: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at'>[] = [
  { category: 'birthday', is_default: true, sort: 0, name: 'Birthday wishes', subject: 'Happy birthday, {first_name}!',
    body: `Happy birthday, {first_name}! 🎉 Wishing you a wonderful year ahead.${SIGN}` },
  { category: 'home_anniversary', is_default: true, sort: 0, name: 'Home anniversary + value offer', subject: 'Happy {years}-year home anniversary!',
    body: `Happy {years}-year home anniversary, {first_name}! Hard to believe it's been {years_text} since you got the keys. If you're ever curious what your home is worth today, I'm happy to run the numbers.${SIGN}` },
  { category: 'wedding_anniversary', is_default: true, sort: 0, name: 'Wedding anniversary', subject: 'Happy anniversary!',
    body: `Happy anniversary to you both, {first_name}! Hope you have a great day.${SIGN}` },
  { category: 'insurance_renewal', is_default: true, sort: 0, name: 'Shop your homeowners insurance', subject: 'Your homeowners insurance renews {date}',
    body: `Hi {first_name}, your homeowners insurance[ with {provider}] renews around {date}. Rates have been moving on the coast, so it may be worth getting a couple of quotes first. Happy to connect you with local agents.${SIGN}` },
  { category: 'flood_insurance_renewal', is_default: true, sort: 0, name: 'Flood insurance reminder', subject: 'Flood insurance renews {date}',
    body: `Hi {first_name}, a reminder that your flood insurance[ with {provider}] renews around {date}. Make sure it doesn't lapse, especially heading into storm season.${SIGN}` },
  { category: 'home_warranty_expiration', is_default: true, sort: 0, name: 'Home warranty ending', subject: 'Your home warranty ends {date}',
    body: `Hi {first_name}, your home warranty[ with {provider}] ends {date}. Let me know if you'd like to renew or compare plans.${SIGN}` },
  { category: 'mortgage_review', is_default: true, sort: 0, name: 'Refinance check-in', subject: 'Quick mortgage check-in',
    body: `Hi {first_name}, checking in on your mortgage. It may be worth a quick look at whether refinancing makes sense right now. Happy to connect you with a lender.${SIGN}` },
  { category: 'hoa_dues', is_default: true, sort: 0, name: 'HOA dues reminder', subject: 'HOA dues coming up',
    body: `Hi {first_name}, a friendly reminder that your HOA dues are coming up {date}.${SIGN}` },
  { category: 'lease_end', is_default: true, sort: 0, name: 'Lease ending: buy instead?', subject: 'Your lease is up {date}',
    body: `Hi {first_name}, your lease is up {date}. If you're thinking about buying instead of renewing, I'd love to help. Rent vs. buy is worth a quick look.${SIGN}` },
  { category: 'general', is_default: true, sort: 0, name: 'Just checking in', subject: 'Checking in',
    body: `Hi {first_name}, just checking in to see how everything is going. If there's anything I can help with, from a contractor referral to a question about the market, I'm always happy to help.${SIGN}` },
  { category: 'general', is_default: false, sort: 1, name: 'Free home value update', subject: "What's your home worth today?",
    body: `Hi {first_name}, homes[ around {city}] have been moving, and I'd be glad to put together a free, no-pressure value update[ on {address}]. Want me to send one over?${SIGN}` },
  { category: 'general', is_default: false, sort: 2, name: 'Just listed near you', subject: 'Just listed near you',
    body: `Hi {first_name}, a home just came on the market near you[ in {city}]. Thought you'd like to know what's happening in the neighborhood. Want the details?${SIGN}` },
  { category: 'general', is_default: false, sort: 3, name: 'Thanks for the referral', subject: 'Thank you!',
    body: `Hi {first_name}, thank you so much for the referral! It means a lot that you'd trust me with your friends and family. I'll take great care of them.${SIGN}` },
  { category: 'general', is_default: false, sort: 4, name: 'Ask for a review', subject: 'A quick favor',
    body: `Hi {first_name}, it was a pleasure helping you. If you have a minute, a short review would mean the world to me and helps other buyers and sellers find me. Thank you!${SIGN}` },
  { category: 'deal', is_default: true, sort: 0, name: 'Deal update', subject: 'Update on {property}',
    body: `Hi {first_name}, quick update on {property}: ` + `${SIGN}` },
  { category: 'deal', is_default: false, sort: 1, name: "You're under contract!", subject: "You're under contract on {property}!",
    body: `Congratulations, {first_name}! We're officially under contract on {property}. I'll keep you posted on every date between now and closing[ on {closing_date}].${SIGN}` },
  { category: 'deal', is_default: false, sort: 2, name: 'Closing day', subject: 'Closing day for {property}',
    body: `Hi {first_name}, today's the big day for {property}! Bring a photo ID, and let me know if you have any last-minute questions. Congratulations!${SIGN}` },
  { category: 'deal', is_default: false, sort: 3, name: 'After closing: thank you', subject: 'Thank you, {first_name}!',
    body: `Hi {first_name}, congratulations again on {property}! Thank you for trusting me. I'm here for anything you need, from contractor names to questions down the road.${SIGN}` },
];

export async function fetchTemplates() {
  const { data, error } = await createClient().from('fanc_message_templates').select('*').order('category').order('sort').order('name');
  return { templates: (data ?? []) as MessageTemplate[], error: error?.message ?? '' };
}

/** Add the starter templates if there are none yet. */
export async function ensureStarterTemplates() {
  const supabase = createClient();
  const { count, error } = await supabase.from('fanc_message_templates').select('id', { count: 'exact', head: true });
  if (error || (count ?? 0) > 0) return error?.message ?? '';
  return (await supabase.from('fanc_message_templates').insert(STARTER_TEMPLATES)).error?.message ?? '';
}

/** The default template for a category: the saved one, else the starter. */
export function defaultTemplate(templates: Pick<MessageTemplate, 'category' | 'is_default' | 'subject' | 'body'>[], category: TemplateCategory) {
  return templates.find((t) => t.category === category && t.is_default)
    ?? templates.find((t) => t.category === category)
    ?? STARTER_TEMPLATES.find((t) => t.category === category && t.is_default);
}
