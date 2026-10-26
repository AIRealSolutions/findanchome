'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Copy, Download, ExternalLink, Trash2 } from 'lucide-react';
import QRCode from 'qrcode';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { toYmd } from '@/lib/calendar';
import { formatDate } from '@/lib/clients';
import { dealTitle, type Deal } from '@/lib/deals';
import { BROKERAGE } from '@/lib/site';
import {
  EMPTY_FIELDS, PLATFORMS, POST_TEMPLATES, WEEKLY_PLAN, WEEKLY_POST_GOAL,
  captureLinks, needsPaste, shareUrl, startOfWeek, templateMeta,
  type PlatformKey, type PostFields, type Sender,
} from '@/lib/marketing';

type Tab = 'create' | 'calendar' | 'links';

interface Post {
  id: string;
  created_at: string;
  kind: string;
  body: string;
  link: string | null;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'posted';
  scheduled_for: string | null;
  posted_at: string | null;
}

const FIELD_LABELS: Record<keyof PostFields, string> = {
  address: 'Address', city: 'City / town', price: 'Price', beds: 'Beds', baths: 'Baths', when: 'Date & time', note: 'Your message', link: 'Link',
};

function copyText(text: string) {
  try {
    return navigator.clipboard?.writeText(text) ?? Promise.resolve();
  } catch {
    return Promise.resolve();
  }
}

function Composer({ sender, linkFor, deals, onSaved, draft }: {
  sender: Sender; linkFor: (k: string) => string; deals: Deal[]; onSaved: () => void; draft: Post | null;
}) {
  const { user } = useAuth();
  const [kind, setKind] = useState(draft?.kind ?? 'home_value');
  const [fields, setFields] = useState<PostFields>({ ...EMPTY_FIELDS, link: draft?.link ?? linkFor(templateMeta('home_value').defaultLink) });
  const [text, setText] = useState(draft?.body ?? '');
  const [edited, setEdited] = useState(!!draft);
  const [shared, setShared] = useState<Set<PlatformKey>>(new Set(draft?.platforms as PlatformKey[] | undefined));
  const [schedule, setSchedule] = useState(draft?.scheduled_for ?? '');
  const [msg, setMsg] = useState('');
  const t = templateMeta(kind);
  const body = edited ? text : t.build(fields, sender);

  const pick = (k: string) => {
    setKind(k);
    setEdited(false);
    setFields((f) => ({ ...f, link: linkFor(templateMeta(k).defaultLink) }));
  };
  const fromDeal = (id: string) => {
    const d = deals.find((x) => x.id === id);
    if (!d) return;
    const price = d.contract_price ?? d.list_price;
    setFields((f) => ({ ...f, address: d.property_address ?? '', city: d.city ?? '', price: price ? price.toLocaleString() : '' }));
    setEdited(false);
    if (d.stage === 'closed') setKind('just_sold');
    else if (d.stage !== 'active') setKind('under_contract');
    else if (d.side !== 'buyer') setKind('just_listed');
  };

  const share = async (p: PlatformKey) => {
    await copyText(body);
    window.open(shareUrl(p, body, fields.link), '_blank', 'noopener');
    setShared((s) => new Set(s).add(p));
    setMsg(needsPaste(p) ? `Post text copied. Paste it into ${PLATFORMS.find((x) => x.key === p)!.label}.` : '');
  };

  const save = async (status: Post['status']) => {
    if (!user) return;
    const row = {
      kind, body, link: fields.link || null, platforms: [...shared], status,
      scheduled_for: status === 'scheduled' ? schedule || toYmd(new Date()) : schedule || null,
      posted_at: status === 'posted' ? new Date().toISOString() : null,
    };
    const supabase = createClient();
    const { error } = draft
      ? await supabase.from('fanc_marketing_posts').update(row).eq('id', draft.id)
      : await supabase.from('fanc_marketing_posts').insert({ ...row, broker_id: user.id });
    setMsg(error ? error.message : status === 'posted' ? 'Logged as posted. Nice work!' : status === 'scheduled' ? 'Added to your content calendar.' : 'Saved as a draft.');
    if (!error) onSaved();
  };

  const myListings = deals.filter((d) => d.property_address);

  return (
    <div className="grid lg:grid-cols-[1fr_420px] gap-6">
      <div className="space-y-5 min-w-0">
        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">1. Pick a post</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {POST_TEMPLATES.map((p) => (
              <button key={p.kind} onClick={() => pick(p.kind)} aria-pressed={kind === p.kind}
                className={`p-3 rounded-lg border text-left text-sm ${kind === p.kind ? 'border-pink-500 bg-pink-50 text-pink-900' : 'border-gray-200 hover:border-pink-300'}`}>
                <span className="text-lg" aria-hidden>{p.icon}</span><span className="block font-medium">{p.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">2. Fill in the details</h2>
            {myListings.length > 0 && (
              <select defaultValue="" onChange={(e) => fromDeal(e.target.value)} className="px-2 py-1.5 border border-gray-300 rounded-lg bg-white text-sm">
                <option value="" disabled>Fill from one of my deals…</option>
                {myListings.map((d) => <option key={d.id} value={d.id}>{dealTitle(d)} ({d.stage.replace(/_/g, ' ')})</option>)}
              </select>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {t.fields.map((k) => (
              <label key={k} className={`text-sm ${k === 'note' || k === 'link' ? 'sm:col-span-2' : ''}`}>
                <span className="block text-gray-600 mb-1">{FIELD_LABELS[k]}</span>
                {k === 'note' ? (
                  <textarea rows={3} value={fields.note} onChange={(e) => { setFields({ ...fields, note: e.target.value }); setEdited(false); }}
                    placeholder="Optional: a sentence in your own words" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                ) : (
                  <input value={fields[k]} onChange={(e) => { setFields({ ...fields, [k]: e.target.value }); setEdited(false); }}
                    placeholder={k === 'when' ? 'Sat, Nov 2 · 1–3 pm' : k === 'link' ? 'https://' : ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                )}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">Posts that link to your home-value page turn readers into listing opportunities tagged for you.</p>
        </section>
      </div>

      <section className="bg-white border border-gray-200 rounded-xl p-5 lg:sticky lg:top-6 self-start">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">3. Review & share</h2>
        <textarea rows={14} value={body} onChange={(e) => { setText(e.target.value); setEdited(true); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{body.length} characters{body.length > 280 && ' · too long for X'}</span>
          {edited && <button onClick={() => setEdited(false)} className="text-blue-600 hover:underline">Reset to template</button>}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {PLATFORMS.map((p) => (
            <button key={p.key} onClick={() => share(p.key)} disabled={p.limit > 0 && body.length > p.limit}
              className={`inline-flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-sm border disabled:opacity-40 ${shared.has(p.key) ? 'border-green-400 bg-green-50 text-green-800' : 'border-gray-300 hover:bg-gray-50'}`}>
              {shared.has(p.key) ? <Check size={14} /> : <ExternalLink size={14} />} {p.label}
            </button>
          ))}
        </div>
        <button onClick={() => copyText(body).then(() => setMsg('Copied.'))} className="mt-2 w-full inline-flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
          <Copy size={14} /> Copy text
        </button>
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <button onClick={() => save('posted')} className="w-full px-3 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700">I posted it: log it</button>
          <div className="flex gap-2">
            <input type="date" value={schedule} onChange={(e) => setSchedule(e.target.value)} className="flex-1 min-w-0 px-2 py-2 border border-gray-300 rounded-lg text-sm" />
            <button onClick={() => save('scheduled')} className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Schedule</button>
            <button onClick={() => save('draft')} className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Save draft</button>
          </div>
        </div>
        {msg && <p className="mt-2 text-sm text-gray-700">{msg}</p>}
      </section>
    </div>
  );
}

function Qr({ url, name }: { url: string; name: string }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, { margin: 1, width: 480 }).then((d) => !cancelled && setSrc(d));
    return () => {
      cancelled = true;
    };
  }, [url]);
  if (!src) return <div className="w-28 h-28 bg-gray-100 rounded" />;
  return (
    <div className="text-center shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element -- a generated data: URL */}
      <img src={src} alt={`QR code for ${url}`} className="w-28 h-28 border border-gray-200 rounded" />
      <a href={src} download={`${name}-qr.png`} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"><Download size={12} /> PNG</a>
    </div>
  );
}

function MarketingPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, profile, isAdmin, isBroker, loading: authLoading } = useAuth();
  const tab = (params.get('tab') as Tab) || 'create';
  const [posts, setPosts] = useState<Post[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [composerKey, setComposerKey] = useState(0);
  const [copied, setCopied] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const [p, d] = await Promise.all([
      supabase.from('fanc_marketing_posts').select('*').eq('broker_id', user.id).order('created_at', { ascending: false }).limit(500),
      supabase.from('fanc_deals').select('*').eq('broker_id', user.id).neq('stage', 'fell_through').order('updated_at', { ascending: false }).limit(200),
    ]);
    setPosts((p.data ?? []) as Post[]);
    setDeals((d.data ?? []) as Deal[]);
  }, [user]);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    const supabase = createClient();
    Promise.all([
      supabase.from('fanc_marketing_posts').select('*').eq('broker_id', user.id).order('created_at', { ascending: false }).limit(500),
      supabase.from('fanc_deals').select('*').eq('broker_id', user.id).neq('stage', 'fell_through').order('updated_at', { ascending: false }).limit(200),
    ]).then(([p, d]) => {
      if (cancelled) return;
      setPosts((p.data ?? []) as Post[]);
      setDeals((d.data ?? []) as Deal[]);
    });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || BROKERAGE.agent;
  const sender: Sender = { name, phone: profile?.phone || BROKERAGE.phone, company: BROKERAGE.name };
  const links = useMemo(() => (user ? captureLinks(user.id) : []), [user]);
  const linkFor = (k: string) => links.find((l) => l.key === k)?.url ?? '';
  const weekStart = startOfWeek();
  const postedThisWeek = posts.filter((p) => p.status === 'posted' && p.posted_at && new Date(p.posted_at) >= weekStart).length;
  const upcoming = posts.filter((p) => p.status !== 'posted').sort((a, b) => (a.scheduled_for ?? '9999').localeCompare(b.scheduled_for ?? '9999'));
  const history = posts.filter((p) => p.status === 'posted');

  if (!authLoading && !isAdmin && !isBroker) return <p className="text-gray-600">Marketing tools are available to brokers.</p>;

  const setTab = (t: Tab) => router.replace(t === 'create' ? '/dashboard/marketing' : `/dashboard/marketing?tab=${t}`);
  const openPost = (p: Post) => {
    setEditing(p);
    setComposerKey((k) => k + 1);
    setTab('create');
  };
  const markPosted = async (p: Post) => {
    await createClient().from('fanc_marketing_posts').update({ status: 'posted', posted_at: new Date().toISOString() }).eq('id', p.id);
    load();
  };
  const remove = async (p: Post) => {
    if (!confirm('Delete this post?')) return;
    await createClient().from('fanc_marketing_posts').delete().eq('id', p.id);
    load();
  };
  const copyLink = (url: string) => copyText(url).then(() => {
    setCopied(url);
    setTimeout(() => setCopied(''), 2000);
  });
  const signature = `${name}\nBroker, ${BROKERAGE.name}\n${sender.phone}\nWhat's your home worth? ${linkFor('sell')}`;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Marketing</h1>
          <p className="mt-1 text-gray-600">Promote your business on social media and turn followers into listing opportunities.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm">
          <span className="text-2xl font-bold text-gray-900">{postedThisWeek}</span><span className="text-gray-500"> / {WEEKLY_POST_GOAL} posts this week</span>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 overflow-x-auto w-fit max-w-full">
        {([['create', 'Create a post'], ['calendar', `Content calendar${upcoming.length ? ` (${upcoming.length})` : ''}`], ['links', 'Links & QR codes']] as [Tab, string][]).map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${tab === v ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'}`}>{l}</button>
        ))}
      </div>

      {tab === 'create' && user && (
        <Composer key={composerKey} sender={sender} linkFor={linkFor} deals={deals} draft={editing} onSaved={() => { setEditing(null); load(); }} />
      )}

      {tab === 'calendar' && (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6 min-w-0">
            <section className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Scheduled & drafts</h2>
              {upcoming.length === 0 ? <p className="text-sm text-gray-500">Nothing planned. Create a post and schedule it.</p> : (
                <ul className="divide-y divide-gray-100">
                  {upcoming.map((p) => (
                    <li key={p.id} className="py-3 flex gap-3">
                      <span className="text-xl" aria-hidden>{templateMeta(p.kind).icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{templateMeta(p.kind).label}
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${p.status === 'scheduled' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
                            {p.status === 'scheduled' ? `Scheduled ${formatDate(p.scheduled_for, { month: 'short', day: 'numeric' })}` : 'Draft'}
                          </span></p>
                        <p className="text-sm text-gray-600 truncate">{p.body.split('\n').find((l) => l.trim())}</p>
                      </div>
                      <div className="flex gap-1 shrink-0 items-start">
                        <button onClick={() => openPost(p)} className="px-2 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">Open</button>
                        <button onClick={() => markPosted(p)} className="px-2 py-1 text-xs border border-green-300 text-green-800 rounded-lg hover:bg-green-50">Posted</button>
                        <button onClick={() => remove(p)} aria-label="Delete post" className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Posted ({history.length})</h2>
              {history.length === 0 ? <p className="text-sm text-gray-500">Posts you log appear here.</p> : (
                <ul className="divide-y divide-gray-100 text-sm">
                  {history.slice(0, 30).map((p) => (
                    <li key={p.id} className="py-2 flex items-center gap-2">
                      <span aria-hidden>{templateMeta(p.kind).icon}</span>
                      <span className="flex-1 min-w-0 truncate">{p.body.split('\n').find((l) => l.trim())}</span>
                      <span className="text-xs text-gray-500 shrink-0">{p.platforms.join(', ')}</span>
                      <span className="text-xs text-gray-500 shrink-0">{p.posted_at && formatDate(p.posted_at, { month: 'short', day: 'numeric' })}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
          <section className="bg-white border border-gray-200 rounded-xl p-5 self-start">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Your weekly rhythm</h2>
            <ol className="space-y-3 text-sm">
              {WEEKLY_PLAN.map((w) => (
                <li key={w.day}>
                  <p className="font-medium text-gray-900">{w.day}</p>
                  <p className="text-gray-600">{w.idea}</p>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-gray-500">Three posts a week keeps you in front of your sphere. Every post should invite owners to request a home value.</p>
          </section>
        </div>
      )}

      {tab === 'links' && (
        <div className="space-y-6">
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Your lead-capture links</h2>
            <ul className="divide-y divide-gray-100">
              {links.map((l) => (
                <li key={l.key} className="py-4 flex flex-col sm:flex-row gap-4 sm:items-center">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{l.label} {l.tracked && <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">tagged for you</span>}</p>
                    {l.hint && <p className="text-sm text-gray-600">{l.hint}</p>}
                    <div className="mt-2 flex gap-2">
                      <input readOnly value={l.url} onFocus={(e) => e.target.select()} className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                      <button onClick={() => copyLink(l.url)} className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        {copied === l.url ? <Check size={16} className="text-green-600" /> : <Copy size={16} />} Copy
                      </button>
                    </div>
                  </div>
                  <Qr url={l.url} name={l.key} />
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-gray-500">Put the QR code on yard signs, flyers, open-house sign-in sheets and business cards. Website requests are reviewed by the admin before they reach your pipeline.</p>
          </section>
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Email signature</h2>
            <pre className="p-3 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">{signature}</pre>
            <button onClick={() => copyLink(signature)} className="mt-2 inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              {copied === signature ? <Check size={16} className="text-green-600" /> : <Copy size={16} />} Copy signature
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

export default function MarketingPageWrapper() {
  return (
    <Suspense fallback={<p className="text-gray-500">Loading…</p>}>
      <MarketingPage />
    </Suspense>
  );
}
