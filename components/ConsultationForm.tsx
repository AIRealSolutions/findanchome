'use client';

import { useId, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { COUNTY_NAMES, lifestyles, type CountySlug } from '@/lib/lifestyles';
import { communities } from '@/lib/communities';
import { neighborhoods } from '@/lib/neighborhoods';
import { BROKERAGE } from '@/lib/site';
import {
  COUNTY_SLUGS,
  FINANCING_OPTIONS,
  INTENT_OPTIONS,
  MUST_HAVE_OPTIONS,
  PRICE_OPTIONS,
  TIMEFRAME_OPTIONS,
  contextFromPath,
  mergeContext,
  type ConsultationContext,
} from '@/lib/consultation';

const input =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent bg-white';
const label = 'block text-sm font-semibold text-[#1e3a8a] mb-1';

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
        active
          ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white'
          : 'bg-white border-gray-300 text-gray-700 hover:border-[#0ea5e9]'
      }`}
    >
      {children}
    </button>
  );
}

function Fieldset({ legend, hint, children }: { legend: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className={label}>{legend}</legend>
      {hint && <p className="text-xs text-gray-500 -mt-0.5 mb-2">{hint}</p>}
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function ConsultationForm({
  context,
  submitLabel = 'Request My Free Consultation',
}: {
  /** Pre-selected interests, merged with what the current page implies. */
  context?: ConsultationContext;
  submitLabel?: string;
}) {
  const pathname = usePathname() ?? '/';
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;
  const initial = useMemo(() => mergeContext(contextFromPath(pathname), context), [pathname, context]);

  const [contact, setContact] = useState({ name: '', email: '', phone: '', preferredContact: 'call', company: '' });
  const [intent, setIntent] = useState<string[]>(initial.intent.length ? initial.intent : ['buy']);
  const [timeframe, setTimeframe] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [financing, setFinancing] = useState('');
  const [counties, setCounties] = useState<string[]>(initial.counties);
  const [selCommunities, setSelCommunities] = useState<string[]>(initial.communities);
  const [selNeighborhoods, setSelNeighborhoods] = useState<string[]>(initial.neighborhoods);
  const [selLifestyles, setSelLifestyles] = useState<string[]>(initial.lifestyles);
  const [mustHaves, setMustHaves] = useState<string[]>(initial.mustHaves);
  const [message, setMessage] = useState('');
  const [showAllNeighborhoods, setShowAllNeighborhoods] = useState(false);
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const communityOptions = communities.filter((c) => counties.includes(c.county) || selCommunities.includes(c.slug));
  const neighborhoodPool = neighborhoods.filter((n) => counties.includes(n.county) || selNeighborhoods.includes(n.slug));
  const neighborhoodOptions = showAllNeighborhoods
    ? neighborhoodPool
    : neighborhoodPool.filter(
        (n) => selNeighborhoods.includes(n.slug) || n.near.some((s) => selCommunities.includes(s)),
      );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contact,
          intent,
          timeframe: timeframe || undefined,
          priceRange: priceRange || undefined,
          financing: financing || undefined,
          counties,
          communities: selCommunities,
          neighborhoods: selNeighborhoods,
          lifestyles: selLifestyles,
          mustHaves,
          message,
          sourcePage: pathname,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setState('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div className="text-center py-10 px-4" role="status">
        <CheckCircle2 className="mx-auto text-green-600 mb-4" size={48} />
        <h3 className="text-2xl font-bold text-[#1e3a8a] mb-2">Thank you, {contact.name.split(' ')[0]}!</h3>
        <p className="text-gray-700 max-w-md mx-auto">
          Your request is on its way to {BROKERAGE.agent}. Expect a reply within one business day. Need us sooner? Call or
          text <a href={`tel:${BROKERAGE.phoneE164}`} className="font-semibold text-[#0ea5e9]">{BROKERAGE.phone}</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {/* Contact */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor={fid('name')} className={label}>Name *</label>
          <input id={fid('name')} className={input} required autoComplete="name" value={contact.name}
            onChange={(e) => setContact({ ...contact, name: e.target.value })} />
        </div>
        <div>
          <label htmlFor={fid('email')} className={label}>Email *</label>
          <input id={fid('email')} type="email" className={input} required autoComplete="email" value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })} />
        </div>
        <div>
          <label htmlFor={fid('phone')} className={label}>Phone</label>
          <input id={fid('phone')} type="tel" className={input} autoComplete="tel" value={contact.phone}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <Fieldset legend="Best way to reach you">
            {(['call', 'text', 'email'] as const).map((m) => (
              <Chip key={m} active={contact.preferredContact === m} onClick={() => setContact({ ...contact, preferredContact: m })}>
                {m === 'call' ? 'Phone call' : m === 'text' ? 'Text' : 'Email'}
              </Chip>
            ))}
          </Fieldset>
        </div>
        {/* Honeypot: hidden from people, tempting to bots. */}
        <div className="hidden" aria-hidden>
          <label htmlFor={fid('company')}>Company</label>
          <input id={fid('company')} tabIndex={-1} autoComplete="off" value={contact.company}
            onChange={(e) => setContact({ ...contact, company: e.target.value })} />
        </div>
      </div>

      {/* Goals */}
      <Fieldset legend="I'd like to…" hint="Choose all that apply.">
        {INTENT_OPTIONS.map((o) => (
          <Chip key={o.value} active={intent.includes(o.value)} onClick={() => setIntent(toggle(intent, o.value))}>
            {o.label}
          </Chip>
        ))}
      </Fieldset>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor={fid('timeframe')} className={label}>Timeframe</label>
          <select id={fid('timeframe')} className={input} value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
            <option value="">Select…</option>
            {TIMEFRAME_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={fid('price')} className={label}>Price range</label>
          <select id={fid('price')} className={input} value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
            <option value="">Select…</option>
            {PRICE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={fid('financing')} className={label}>Financing</label>
          <select id={fid('financing')} className={input} value={financing} onChange={(e) => setFinancing(e.target.value)}>
            <option value="">Select…</option>
            {FINANCING_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Areas */}
      <Fieldset legend="Counties you're interested in">
        {COUNTY_SLUGS.map((c) => (
          <Chip key={c} active={counties.includes(c)} onClick={() => setCounties(toggle(counties, c))}>
            {COUNTY_NAMES[c as CountySlug]}
          </Chip>
        ))}
      </Fieldset>

      {communityOptions.length > 0 && (
        <Fieldset legend="Towns & communities">
          {communityOptions.map((c) => (
            <Chip key={c.slug} active={selCommunities.includes(c.slug)} onClick={() => setSelCommunities(toggle(selCommunities, c.slug))}>
              {c.name}
            </Chip>
          ))}
        </Fieldset>
      )}

      {neighborhoodPool.length > 0 && (
        <div>
          <Fieldset legend="Specific neighborhoods & golf communities" hint="Optional. Tell us which ones caught your eye.">
            {neighborhoodOptions.map((n) => (
              <Chip key={n.slug} active={selNeighborhoods.includes(n.slug)} onClick={() => setSelNeighborhoods(toggle(selNeighborhoods, n.slug))}>
                {n.golf ? '⛳ ' : ''}{n.name}
              </Chip>
            ))}
          </Fieldset>
          {neighborhoodOptions.length < neighborhoodPool.length && (
            <button type="button" onClick={() => setShowAllNeighborhoods(true)} className="mt-2 text-sm font-semibold text-[#0ea5e9] hover:underline">
              Show all {neighborhoodPool.length} neighborhoods
            </button>
          )}
        </div>
      )}

      <Fieldset legend="Lifestyles that fit you">
        {lifestyles.map((l) => (
          <Chip key={l.slug} active={selLifestyles.includes(l.slug)} onClick={() => setSelLifestyles(toggle(selLifestyles, l.slug))}>
            <span aria-hidden>{l.emoji}</span> {l.name}
          </Chip>
        ))}
      </Fieldset>

      <Fieldset legend="Must-haves">
        {MUST_HAVE_OPTIONS.map((m) => (
          <Chip key={m} active={mustHaves.includes(m)} onClick={() => setMustHaves(toggle(mustHaves, m))}>{m}</Chip>
        ))}
      </Fieldset>

      <div>
        <label htmlFor={fid('message')} className={label}>Your goals or questions</label>
        <textarea id={fid('message')} rows={4} className={input} value={message} maxLength={5000}
          placeholder="For example: relocating from Ohio next spring, want a single-level home near golf and within 20 minutes of the beach."
          onChange={(e) => setMessage(e.target.value)} />
      </div>

      {state === 'error' && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
          {error} You can also call or text {BROKERAGE.phone}.
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="w-full inline-flex justify-center items-center gap-2 bg-[#fbbf24] text-[#1e3a8a] py-3 rounded-lg hover:bg-[#fcd34d] font-bold text-lg disabled:opacity-60"
      >
        {state === 'sending' && <Loader2 className="animate-spin" size={20} />} {submitLabel}
      </button>
      <p className="text-xs text-gray-500 text-center">
        No cost, no obligation. Your information goes only to {BROKERAGE.agent} at {BROKERAGE.name}. Equal Housing Opportunity.
      </p>
    </form>
  );
}
