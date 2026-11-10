'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  Home,
  KeyRound,
  Building2,
  TrendingUp,
  Waves,
  Flag,
  Sailboat,
  Landmark,
  Medal,
  Sunset,
  Hammer,
  Trees,
  Bell,
  Globe,
  ShieldCheck,
  MapPin,
  FileCheck2,
  Gavel,
  type LucideIcon,
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import SiteFooter from '@/components/SiteFooter';
import ConsultationCTA from '@/components/ConsultationCTA';
import { usaHudHomes } from '@/lib/sisterSites';
import { lifestyles } from '@/lib/lifestyles';
import { BROKERAGE } from '@/lib/site';

type SearchMode = 'buy' | 'hud' | 'sell';

const searchModes: { id: SearchMode; label: string; placeholder: string }[] = [
  { id: 'buy', label: 'Buy', placeholder: 'City, county, neighborhood or ZIP' },
  { id: 'hud', label: 'HUD Homes', placeholder: 'Any NC city or county' },
  { id: 'sell', label: 'Sell', placeholder: 'Your property address' },
];

const stats = [
  { value: '25+', label: 'Years helping NC families' },
  { value: '5', label: 'Coastal counties covered' },
  { value: '100', label: 'NC counties for HUD bids' },
  { value: '$0', label: 'Cost for a consultation' },
];

const services: { icon: LucideIcon; title: string; text: string; href: string; cta: string }[] = [
  {
    icon: KeyRound,
    title: 'Buy a Home',
    text: 'Lifestyle-first search, neighborhood comparisons and flood, insurance and HOA insight before you write an offer.',
    href: '/buyers',
    cta: 'Buyer services',
  },
  {
    icon: Building2,
    title: 'Sell Your Home',
    text: 'Pricing strategy, professional presentation and a marketing plan built around how buyers shop the coast.',
    href: '/sellers',
    cta: 'Seller services',
  },
  {
    icon: Home,
    title: 'HUD Homes',
    text: 'Registered HUD buyer’s agency. We explain the process, prepare your bid and represent you anywhere in North Carolina.',
    href: '/hud',
    cta: 'How HUD works',
  },
  {
    icon: TrendingUp,
    title: 'Investment Property',
    text: 'Rentals, short-term coastal investments and value-add opportunities, underwritten with local numbers.',
    href: '/investments',
    cta: 'Investor services',
  },
];

const counties = [
  { slug: 'new-hanover', name: 'New Hanover', towns: 'Wilmington · Wrightsville Beach · Carolina Beach · Kure Beach', tag: 'Urban coastal' },
  { slug: 'brunswick', name: 'Brunswick', towns: 'Southport · Leland · Oak Island · Holden Beach', tag: 'Golf & waterfront' },
  { slug: 'pender', name: 'Pender', towns: 'Hampstead · Surf City · Topsail Beach · Burgaw', tag: 'Beach & small town' },
  { slug: 'onslow', name: 'Onslow', towns: 'Jacksonville · Swansboro · Sneads Ferry · North Topsail', tag: 'Military relocation' },
  { slug: 'columbus', name: 'Columbus', towns: 'Whiteville · Lake Waccamaw · Tabor City', tag: 'Rural & lake living' },
];

const lifestyleIcons: Record<string, LucideIcon> = {
  beach: Waves,
  golf: Flag,
  waterfront: Sailboat,
  historic: Landmark,
  military: Medal,
  retirement: Sunset,
  'new-construction': Hammer,
  acreage: Trees,
  investment: TrendingUp,
  'first-time': KeyRound,
};

const hudSteps: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Search, title: 'Find the property', text: 'Browse every live NC HUD listing and set up alerts for new ones.' },
  { icon: FileCheck2, title: 'Get pre-qualified', text: 'FHA, 203(k), conventional or cash — we help you line up the right financing.' },
  { icon: Gavel, title: 'Bid with representation', text: 'HUD bids must go through a registered agent. We prepare and submit yours.' },
];

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<SearchMode>('buy');
  const [query, setQuery] = useState('');
  const activeMode = searchModes.find((m) => m.id === mode)!;

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (mode === 'hud') {
      window.open(usaHudHomes.ncListings('home_hero_search'), '_blank', 'noopener');
      return;
    }
    if (mode === 'sell') {
      router.push('/sellers');
      return;
    }
    router.push(`/search${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />

      <main className="flex-1">
        {/* ───────────── Hero ───────────── */}
        <section className="relative isolate overflow-hidden bg-ink text-white">
          <Image
            src="/hero-8.jpg"
            alt="Sunset over a Southeastern North Carolina marina"
            fill
            priority
            sizes="100vw"
            className="object-cover -z-10 opacity-80"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/20" />
          <div className="absolute inset-x-0 bottom-0 h-40 -z-10 bg-gradient-to-t from-ink to-transparent" />

          <div className="container mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur px-3.5 py-1.5 text-xs font-medium text-white/85">
                <MapPin size={13} className="text-brass" />
                Wilmington · Southport · Topsail · Jacksonville · Whiteville
              </div>
              <h1 className="mt-6 text-[42px] leading-[1.04] sm:text-6xl lg:text-[76px] font-semibold tracking-[-0.035em]">
                Find your place on the{' '}
                <span className="font-display font-normal italic text-brass-light tracking-normal">Carolina coast.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg md:text-xl text-white/75 leading-relaxed">
                Strategic buyer and seller representation across Southeastern North Carolina, and
                registered HUD home bidding statewide. Lifestyle first, then the right house.
              </p>
            </div>

            {/* Search panel */}
            <div className="mt-10 max-w-3xl">
              <div className="flex gap-1 p-1 w-fit rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur" role="tablist" aria-label="Search type">
                {searchModes.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    aria-selected={mode === m.id}
                    onClick={() => setMode(m.id)}
                    className={`px-4 sm:px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                      mode === m.id ? 'bg-white text-ink' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <form
                onSubmit={onSearch}
                className="mt-3 flex flex-col sm:flex-row gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-black/40"
              >
                <label className="flex flex-1 items-center gap-3 px-4">
                  <Search size={20} className="text-slate-400 shrink-0" />
                  <span className="sr-only">{activeMode.placeholder}</span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={activeMode.placeholder}
                    className="w-full py-3.5 bg-transparent text-ink placeholder:text-slate-400 outline-none text-base"
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brass hover:bg-brass-light text-ink font-semibold px-7 py-3.5 transition-colors"
                >
                  {mode === 'sell' ? 'Talk about selling' : mode === 'hud' ? 'View NC HUD homes' : 'Search homes'}
                  {mode === 'hud' ? <ArrowUpRight size={18} /> : <ArrowRight size={18} />}
                </button>
              </form>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/60">
                <span>Popular:</span>
                {[
                  ['Waterfront', '/lifestyle/waterfront'],
                  ['Golf communities', '/lifestyle/golf'],
                  ['Military relocation', '/lifestyle/military'],
                  ['First-time buyers', '/lifestyle/first-time'],
                ].map(([label, href]) => (
                  <Link key={href} href={href} className="text-white/85 hover:text-brass-light underline-offset-4 hover:underline">
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Stats */}
            <dl className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 border-t border-white/15">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`pt-6 pb-2 pr-4 ${i > 0 ? 'md:pl-8 md:border-l md:border-white/15' : ''} ${i % 2 === 1 ? 'pl-4 border-l border-white/15 md:border-l' : ''}`}
                >
                  <dt className="text-sm text-white/55">{s.label}</dt>
                  <dd className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ───────────── Trust strip ───────────── */}
        <section className="border-b border-stone bg-sand">
          <div className="container mx-auto px-4 py-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-harbor" /> Registered HUD Buyer&apos;s Agency</span>
            <span className="inline-flex items-center gap-2"><Building2 size={16} className="text-harbor" /> Locally owned by {BROKERAGE.name}</span>
            <span className="inline-flex items-center gap-2"><Globe size={16} className="text-harbor" /> Partner of {usaHudHomes.name}</span>
            <span className="inline-flex items-center gap-2"><Home size={16} className="text-harbor" /> Equal Housing Opportunity</span>
          </div>
        </section>

        {/* ───────────── Services ───────────── */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-end mb-14">
              <div>
                <div className="eyebrow text-harbor">What we do</div>
                <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-ink leading-[1.05]">
                  Full-service real estate,{' '}
                  <span className="font-display font-normal italic tracking-normal">run like a business.</span>
                </h2>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed lg:max-w-xl lg:justify-self-end">
                Clear process, honest numbers and fast communication. Whether you are buying your first
                home, relocating to Camp Lejeune, selling a coastal property or bidding on a HUD home, you
                get a plan before you get a pitch.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-stone rounded-3xl overflow-hidden ring-1 ring-stone">
              {services.map((s, i) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group relative bg-white p-8 flex flex-col min-h-[300px] hover:bg-sand transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid place-items-center h-12 w-12 rounded-xl bg-ink text-brass-light">
                      <s.icon size={22} />
                    </span>
                    <span className="text-sm font-mono text-slate-400">0{i + 1}</span>
                  </div>
                  <h3 className="mt-8 text-xl font-semibold text-ink tracking-tight">{s.title}</h3>
                  <p className="mt-3 text-slate-600 leading-relaxed text-[15px]">{s.text}</p>
                  <span className="mt-auto pt-6 inline-flex items-center gap-2 text-sm font-semibold text-harbor">
                    {s.cta}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────── Counties ───────────── */}
        <section className="py-20 md:py-28 bg-sand">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-[0.9fr_1.6fr] gap-12 lg:gap-20">
              <div className="lg:sticky lg:top-28 self-start">
                <div className="eyebrow text-harbor">Service area</div>
                <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-ink leading-[1.05]">
                  Five counties.{' '}
                  <span className="font-display font-normal italic tracking-normal">One local guide.</span>
                </h2>
                <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                  From downtown Wilmington to Lake Waccamaw, each market moves differently. We know the
                  flood maps, the HOAs, the builders and the commute.
                </p>
                <div className="relative mt-10 hidden lg:block aspect-[4/3] rounded-3xl overflow-hidden">
                  <Image
                    src="/hero-6.jpg"
                    alt="Aerial view of coastal marsh and waterways"
                    fill
                    sizes="(min-width: 1024px) 35vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>

              <ol className="border-t border-ink/15">
                {counties.map((c, i) => (
                  <li key={c.slug}>
                    <Link
                      href={`/explore/${c.slug}`}
                      className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 md:gap-8 py-7 md:py-9 border-b border-ink/15"
                    >
                      <span className="font-mono text-sm text-slate-400 w-6">0{i + 1}</span>
                      <span>
                        <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                          <span className="text-2xl md:text-4xl font-semibold tracking-tight text-ink group-hover:text-harbor transition-colors">
                            {c.name} County
                          </span>
                          <span className="eyebrow text-brass !text-[10px]">{c.tag}</span>
                        </span>
                        <span className="mt-2 block text-slate-500 text-sm md:text-base">{c.towns}</span>
                      </span>
                      <span className="grid place-items-center h-11 w-11 md:h-12 md:w-12 rounded-full ring-1 ring-ink/15 text-ink group-hover:bg-ink group-hover:text-white group-hover:ring-ink transition-colors">
                        <ArrowUpRight size={18} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-12 lg:ml-[calc(36%+5rem)]">
              <Link href="/explore" className="inline-flex items-center gap-2 font-semibold text-ink hover:text-harbor">
                Compare all communities <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* ───────────── Lifestyles ───────────── */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="max-w-2xl">
                <div className="eyebrow text-harbor">Lifestyle first</div>
                <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-ink leading-[1.05]">
                  Start with how you want to live.
                </h2>
              </div>
              <Link
                href="/lifestyle"
                className="inline-flex items-center gap-2 self-start md:self-auto rounded-full ring-1 ring-ink/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-ink hover:text-white transition-colors"
              >
                All lifestyle guides <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid lg:grid-cols-[1.05fr_1.6fr] gap-6">
              <Link
                href="/lifestyle/waterfront"
                className="group relative min-h-[420px] rounded-3xl overflow-hidden bg-ink text-white flex flex-col justify-end p-8"
              >
                <Image
                  src="/hero-img8441.jpeg"
                  alt="Raised coastal home with a wraparound porch"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                <div className="relative">
                  <div className="eyebrow text-brass-light">Featured guide</div>
                  <h3 className="mt-3 text-3xl font-semibold tracking-tight">Coastal &amp; waterfront living</h3>
                  <p className="mt-2 text-white/75 max-w-sm">
                    Deep-water access, sound-front lots and elevated homes — and what to know about flood
                    insurance before you fall in love.
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brass-light">
                    Read the guide <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>

              <div className="grid sm:grid-cols-2 gap-3">
                {lifestyles.map((l) => {
                  const Icon = lifestyleIcons[l.slug] ?? Home;
                  return (
                    <Link
                      key={l.slug}
                      href={`/lifestyle/${l.slug}`}
                      className="group flex items-start gap-4 rounded-2xl p-5 ring-1 ring-stone hover:ring-ink/20 hover:bg-sand transition-colors"
                    >
                      <span className="grid place-items-center h-10 w-10 rounded-lg bg-sand text-harbor group-hover:bg-ink group-hover:text-brass-light transition-colors shrink-0">
                        <Icon size={19} />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 font-semibold text-ink">
                          {l.name}
                          <ArrowRight size={14} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" />
                        </span>
                        <span className="mt-1 block text-sm text-slate-500 line-clamp-2">{l.description}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── HUD ───────────── */}
        <section className="relative overflow-hidden bg-ink text-white py-20 md:py-28">
          <div aria-hidden className="pointer-events-none absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-harbor/30 blur-3xl" />
          <div className="container relative mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <div>
                <div className="eyebrow text-brass">Statewide HUD representation</div>
                <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05]">
                  HUD homes anywhere in North Carolina,{' '}
                  <span className="font-display font-normal italic tracking-normal text-brass-light">with a registered agent on your side.</span>
                </h2>
                <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-xl">
                  Government-owned homes can be some of the best values on the market, but HUD only accepts
                  bids from registered brokers. {BROKERAGE.name} handles the paperwork, deadlines and
                  strategy so you can focus on the house.
                </p>
                <div className="mt-10 grid sm:grid-cols-3 gap-6">
                  {hudSteps.map((s, i) => (
                    <div key={s.title}>
                      <div className="flex items-center gap-3">
                        <span className="grid place-items-center h-10 w-10 rounded-full bg-white/5 ring-1 ring-white/15 text-brass">
                          <s.icon size={18} />
                        </span>
                        <span className="font-mono text-xs text-white/40">STEP {i + 1}</span>
                      </div>
                      <h3 className="mt-4 font-semibold">{s.title}</h3>
                      <p className="mt-1.5 text-sm text-white/60 leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-8 md:p-10 backdrop-blur">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Globe size={16} className="text-brass" /> Live listings on our sister site
                </div>
                <div className="mt-3 text-3xl font-semibold tracking-tight">{usaHudHomes.name}</div>
                <p className="mt-3 text-white/65">
                  See every HUD home for sale in North Carolina, get alerts the day new ones post, and place
                  your bid with {BROKERAGE.name} as your registered HUD buyer&apos;s agent.
                </p>
                <div className="mt-8 space-y-3">
                  <a
                    href={usaHudHomes.ncListings('home_hud_section')}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center justify-between rounded-xl bg-brass hover:bg-brass-light text-ink font-semibold px-5 py-4 transition-colors"
                  >
                    <span className="inline-flex items-center gap-3"><Home size={18} /> Browse NC HUD homes</span>
                    <ArrowUpRight size={18} />
                  </a>
                  <a
                    href={usaHudHomes.alerts('home_hud_section')}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 ring-1 ring-white/15 px-5 py-4 transition-colors"
                  >
                    <span className="inline-flex items-center gap-3"><Bell size={18} className="text-brass" /> Get new-listing alerts</span>
                    <ArrowUpRight size={18} className="text-white/50" />
                  </a>
                  <a
                    href={usaHudHomes.allStates('home_hud_section')}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 ring-1 ring-white/15 px-5 py-4 transition-colors"
                  >
                    <span className="inline-flex items-center gap-3"><Globe size={18} className="text-brass" /> HUD homes in all 50 states</span>
                    <ArrowUpRight size={18} className="text-white/50" />
                  </a>
                </div>
                <Link href="/hud" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brass-light hover:text-white">
                  Learn how HUD bidding works <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── Leadership ───────────── */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <div className="relative">
                <div className="relative aspect-[4/5] max-w-md rounded-3xl overflow-hidden bg-sand">
                  <Image
                    src="/marc-spencer.jpg"
                    alt={`${BROKERAGE.agent}, ${BROKERAGE.name}`}
                    fill
                    sizes="(min-width: 1024px) 28rem, 100vw"
                    className="object-cover object-top"
                  />
                </div>
                <div className="absolute -bottom-8 right-0 sm:right-8 lg:right-0 w-56 sm:w-64 rounded-2xl overflow-hidden bg-white p-2 shadow-2xl shadow-ink/20 ring-1 ring-stone">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                    <Image src="/IMG_8285.jpeg" alt="Happy buyers holding a SOLD sign" fill sizes="16rem" className="object-cover" />
                  </div>
                  <div className="px-2 py-2.5 text-sm">
                    <div className="font-semibold text-ink">Another family home</div>
                    <div className="text-slate-500 text-xs">Closed with {BROKERAGE.name}</div>
                  </div>
                </div>
              </div>

              <div className="pt-8 lg:pt-0">
                <div className="eyebrow text-harbor">Leadership</div>
                <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-ink leading-[1.05]">
                  Local expertise.{' '}
                  <span className="font-display font-normal italic tracking-normal">Accountable service.</span>
                </h2>
                <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                  {BROKERAGE.agent} leads {BROKERAGE.name}, a locally owned brokerage and HUD buyer&apos;s
                  agency that has helped hundreds of North Carolina families buy, sell and invest. You work
                  directly with the person accountable for your result.
                </p>
                <ul className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    'Direct line to the broker',
                    'Written plan for every client',
                    'Flood, insurance & HOA due diligence',
                    'Negotiation backed by local data',
                  ].map((t) => (
                    <li key={t} className="flex items-center gap-3 text-ink">
                      <ShieldCheck size={18} className="text-brass shrink-0" /> {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-10 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/about"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-ink text-white font-medium px-6 py-3.5 hover:bg-navy transition-colors"
                  >
                    Meet our leadership <ArrowRight size={16} />
                  </Link>
                  <a
                    href={`tel:${BROKERAGE.phoneE164}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full ring-1 ring-ink/15 text-ink font-medium px-6 py-3.5 hover:bg-sand transition-colors"
                  >
                    Call {BROKERAGE.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ConsultationCTA title="Let’s find your place in Southeastern NC" />
      </main>

      <SiteFooter />
    </div>
  );
}
