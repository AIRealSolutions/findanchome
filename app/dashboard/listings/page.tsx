'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, MessageCircle, Phone, Plus, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { formatMoney } from '@/lib/clients';
import { dialable, formatDateTime, priorityMeta, relativeTime } from '@/lib/leads';
import {
  DEFAULT_DAILY_GOAL, OPEN_LISTING_STAGES, TOUCH_KINDS,
  dailyRoutine, dueState, readDailyGoal, saveDailyGoal, fetchStaff, isOpenOpportunity, listingStageMeta, opportunityTitle, recordTouch, reviewOpportunity,
  sourceMeta, staffName,
  type ListingOpportunity, type StaffMember,
} from '@/lib/listings';

type View = 'today' | 'pipeline' | 'review' | 'closed';
type Author = { id: string; name: string };

async function fetchAll(userId: string) {
  const supabase = createClient();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const [opps, touches, staff] = await Promise.all([
    supabase.from('fanc_listing_opportunities').select('*').order('created_at', { ascending: false }).limit(2000),
    supabase.from('fanc_listing_activity').select('id').eq('author_id', userId).in('kind', TOUCH_KINDS).gte('created_at', start.toISOString()).limit(1000),
    fetchStaff(),
  ]);
  return {
    opps: (opps.data ?? []) as ListingOpportunity[],
    touches: touches.data?.length ?? 0,
    staff,
    error: (opps.error || touches.error)?.message ?? '',
  };
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full ${className}`}>{children}</span>;
}

/** One opportunity in a routine list, with one-tap call/text and "done, schedule the next one". */
function OppRow({ o, staff, author, onChanged, showAssignee, note }: {
  o: ListingOpportunity; staff: StaffMember[]; author: Author; onChanged: () => void; showAssignee: boolean; note?: React.ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const due = dueState(o.follow_up_at);
  const touched = async (kind: 'call' | 'text') => {
    setBusy(true);
    await recordTouch(o, kind, kind === 'call' ? 'Called' : 'Texted', author);
    setBusy(false);
    onChanged();
  };
  return (
    <li className="py-3 flex flex-col sm:flex-row sm:items-center gap-2">
      <Link href={`/dashboard/listings/${o.id}`} className="flex-1 min-w-0 group">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-medium text-gray-900 group-hover:text-blue-600">{o.owner_name}</span>
          {o.priority !== 'warm' && <Badge className={priorityMeta(o.priority).className}>{priorityMeta(o.priority).label}</Badge>}
          <Badge className={listingStageMeta(o.stage).className}>{listingStageMeta(o.stage).short}</Badge>
        </div>
        <div className="text-sm text-gray-600 truncate">
          {sourceMeta(o.source).icon} {o.property_address ? opportunityTitle(o) : sourceMeta(o.source).label}
          {o.timeline && ` · ${o.timeline}`}
          {showAssignee && ` · ${staffName(staff.find((s) => s.id === o.assigned_to))}`}
        </div>
        {note ?? (o.follow_up_at && (
          <div className={`text-xs ${due === 'overdue' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
            Follow-up {due === 'overdue' ? `overdue (${relativeTime(o.follow_up_at)})` : formatDateTime(o.follow_up_at)}
          </div>
        ))}
      </Link>
      <div className="flex gap-1.5 shrink-0">
        {o.owner_phone && (
          <>
            <a href={`tel:${dialable(o.owner_phone)}`} aria-label={`Call ${o.owner_name}`} className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"><Phone size={16} /></a>
            <a href={`sms:${dialable(o.owner_phone)}`} aria-label={`Text ${o.owner_name}`} className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"><MessageCircle size={16} /></a>
          </>
        )}
        <button disabled={busy} onClick={() => touched('call')} title="Log the call and schedule the next follow-up"
          className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50">
          <Check size={14} /> Called
        </button>
        <button disabled={busy} onClick={() => touched('text')} title="Log the text and schedule the next follow-up"
          className="px-2.5 py-2 rounded-lg border border-green-300 text-green-800 text-xs font-medium hover:bg-green-50 disabled:opacity-50">
          Texted
        </button>
      </div>
    </li>
  );
}

/** Admin review of a submission: approve and assign, or reject. */
function ReviewCard({ o, staff, author, onChanged }: { o: ListingOpportunity; staff: StaffMember[]; author: Author; onChanged: () => void }) {
  const [assignTo, setAssignTo] = useState(author.id);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const decide = async (d: 'approved' | 'rejected') => {
    setBusy(true);
    const err = await reviewOpportunity(o, d, assignTo, note, author, staffName(staff.find((s) => s.id === assignTo)));
    setBusy(false);
    if (err) return setError(err);
    onChanged();
  };
  return (
    <li className="p-4 bg-white border border-amber-200 rounded-xl">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/dashboard/listings/${o.id}`} className="font-semibold text-gray-900 hover:text-blue-600">{o.owner_name}</Link>
          <p className="text-sm text-gray-600">{opportunityTitle(o)}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {sourceMeta(o.source).icon} {sourceMeta(o.source).label}{o.source_detail && `: ${o.source_detail}`} · from {o.created_by_name || (o.created_by_role === 'public' ? 'the website' : 'a client')} · {relativeTime(o.created_at)}
          </p>
        </div>
        <div className="text-sm text-gray-700 text-right">
          {[o.owner_phone, o.owner_email].filter(Boolean).join(' · ')}
          <div className="text-xs text-gray-500">{[o.reason, o.timeline, formatMoney(o.price_expectation)].filter(Boolean).join(' · ')}</div>
        </div>
      </div>
      {o.message && <p className="mt-2 text-sm text-gray-800 bg-gray-50 rounded p-2 whitespace-pre-wrap">{o.message}</p>}
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <select value={assignTo} onChange={(e) => setAssignTo(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
          {staff.map((s) => <option key={s.id} value={s.id}>Assign to {staffName(s)}{s.id === author.id ? ' (me)' : ''}</option>)}
          {!staff.some((s) => s.id === author.id) && <option value={author.id}>Assign to me</option>}
        </select>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        <button disabled={busy} onClick={() => decide('approved')} className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
          <Check size={16} /> Approve
        </button>
        <button disabled={busy} onClick={() => decide('rejected')} className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
          <X size={16} /> Reject
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </li>
  );
}

function Step({ n, title, hint, count, children }: { n: number; title: string; hint: string; count: number; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start gap-3">
        <span className={`shrink-0 w-7 h-7 rounded-full grid place-items-center text-sm font-semibold ${count ? 'bg-blue-600 text-white' : 'bg-green-100 text-green-700'}`}>
          {count ? n : <Check size={16} />}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900">{title} {count > 0 && <span className="text-gray-500 font-normal">({count})</span>}</h2>
          <p className="text-sm text-gray-500">{hint}</p>
          {count > 0 && children}
        </div>
      </div>
    </section>
  );
}

function ListingsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, profile, isAdmin, isBroker, loading: authLoading } = useAuth();
  const [opps, setOpps] = useState<ListingOpportunity[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [touches, setTouches] = useState(0);
  const [goal, setGoal] = useState(readDailyGoal);
  const [mineOnly, setMineOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const view = (params.get('view') as View) || 'today';

  const author = { id: user?.id ?? '', name: [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user?.email || 'Broker' };

  const apply = useCallback((r: Awaited<ReturnType<typeof fetchAll>>) => {
    setOpps(r.opps);
    setTouches(r.touches);
    setStaff(r.staff);
    setError(r.error);
    setLoading(false);
  }, []);
  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    fetchAll(user.id).then(apply);
  }, [user, apply]);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    fetchAll(user.id).then((r) => !cancelled && apply(r));
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, apply]);

  const visible = useMemo(() => (mineOnly ? opps.filter((o) => o.assigned_to === user?.id || o.review_status === 'pending_review') : opps), [opps, mineOnly, user]);
  const routine = useMemo(() => dailyRoutine(visible), [visible]);
  const stats = useMemo(() => {
    const open = visible.filter(isOpenOpportunity);
    const year = new Date().getFullYear().toString();
    return {
      open: open.length,
      appointments: open.filter((o) => o.stage === 'appointment').length,
      potential: open.reduce((n, o) => n + (o.estimated_value ?? o.price_expectation ?? 0), 0),
      wonYear: visible.filter((o) => o.stage === 'listed' && o.updated_at.startsWith(year)).length,
    };
  }, [visible]);

  // Clients can refer a seller, but the pipeline is for brokers and admins.
  const notStaff = !authLoading && !isAdmin && !isBroker;
  useEffect(() => {
    if (notStaff) router.replace('/dashboard/listings/new');
  }, [notStaff, router]);
  if (notStaff) return null;

  const setView = (v: View) => router.replace(v === 'today' ? '/dashboard/listings' : `/dashboard/listings?view=${v}`);
  const saveGoal = (n: number) => {
    setGoal(n);
    saveDailyGoal(n);
  };
  const rowProps = { staff, author, onChanged: load, showAssignee: !mineOnly };
  const tabs: { value: View; label: string; count?: number }[] = [
    { value: 'today', label: 'Today' },
    { value: 'pipeline', label: 'Pipeline' },
    ...(isAdmin ? [{ value: 'review' as View, label: 'Review queue', count: routine.review.length }] : []),
    { value: 'closed', label: 'Won & lost' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Listing opportunities</h1>
          <p className="mt-1 text-gray-600">Your daily routine for winning listings, from first call to signed agreement.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <Link href="/dashboard/listings/new" className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={16} /> Onboard opportunity
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Open opportunities', value: stats.open.toString() },
          { label: 'Appointments set', value: stats.appointments.toString() },
          { label: 'Potential listing volume', value: formatMoney(stats.potential) || '$0' },
          { label: `Listings won in ${new Date().getFullYear()}`, value: stats.wonYear.toString() },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-600">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.value} onClick={() => setView(t.value)}
              className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${view === t.value ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'}`}>
              {t.label}
              {t.count ? <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-xs">{t.count}</span> : null}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} className="rounded" /> Only mine
        </label>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {loading && opps.length === 0 ? (
        <p className="p-8 text-center text-gray-500 bg-white border border-gray-200 rounded-xl">Loading…</p>
      ) : view === 'today' ? (
        <div className="space-y-4">
          {/* Daily touch goal */}
          <section className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm opacity-90">Today’s prospecting touches</p>
                <p className="text-3xl font-bold">{touches} <span className="text-lg font-normal opacity-90">/ {goal}</span></p>
              </div>
              <label className="text-sm flex items-center gap-2">
                Daily goal
                <input type="number" min={1} max={200} value={goal} onChange={(e) => saveGoal(Math.max(1, Number(e.target.value) || DEFAULT_DAILY_GOAL))}
                  className="w-16 px-2 py-1 rounded text-gray-900" />
              </label>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/30 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(100, (touches / goal) * 100)}%` }} />
            </div>
            <p className="mt-2 text-xs opacity-90">Calls, texts, emails, door knocks, mailers and meetings you log on an opportunity count toward the goal.</p>
          </section>

          {isAdmin && (
            <Step n={1} title="Review new submissions" hint="Website requests and client referrals wait here until you approve and assign them." count={routine.review.length}>
              <ul className="mt-3 space-y-3">{routine.review.map((o) => <ReviewCard key={o.id} o={o} staff={staff} author={author} onChanged={load} />)}</ul>
            </Step>
          )}
          <Step n={isAdmin ? 2 : 1} title="Prepare for listing appointments" hint="Today and tomorrow: pull comps, print the CMA and bring the listing packet." count={routine.appointments.length}>
            <ul className="divide-y divide-gray-100">
              {routine.appointments.map((o) => (
                <OppRow key={o.id} o={o} {...rowProps} note={<div className="text-xs text-purple-700 font-medium">📅 Appointment {formatDateTime(o.appointment_at!)}</div>} />
              ))}
            </ul>
          </Step>
          <Step n={isAdmin ? 3 : 2} title="Call new opportunities first" hint="Speed wins listings: reach every new owner the day they come in." count={routine.newToCall.length}>
            <ul className="divide-y divide-gray-100">{routine.newToCall.map((o) => <OppRow key={o.id} o={o} {...rowProps} />)}</ul>
          </Step>
          <Step n={isAdmin ? 4 : 3} title="Follow-ups due" hint="Overdue and due today, hottest first. Logging a touch schedules the next one." count={routine.followUps.length}>
            <ul className="divide-y divide-gray-100">{routine.followUps.map((o) => <OppRow key={o.id} o={o} {...rowProps} />)}</ul>
          </Step>
          <Step n={isAdmin ? 5 : 4} title="Give these a next step" hint="Open opportunities with no follow-up or appointment on the calendar." count={routine.noNextStep.length}>
            <ul className="divide-y divide-gray-100">{routine.noNextStep.map((o) => <OppRow key={o.id} o={o} {...rowProps} note={<div className="text-xs text-amber-700">No next step scheduled</div>} />)}</ul>
          </Step>
          <section className="bg-white border border-dashed border-gray-300 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">Prospect for new ones</h2>
              <p className="text-sm text-gray-500">Check today’s expired and withdrawn listings and new FSBOs in Flexmls, call your sphere, and onboard every owner you talk to.</p>
            </div>
            <Link href="/dashboard/listings/new" className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <Plus size={16} /> Onboard opportunity
            </Link>
          </section>
        </div>
      ) : view === 'review' ? (
        routine.review.length === 0 ? (
          <p className="p-8 text-center text-gray-500 bg-white border border-gray-200 rounded-xl"><ShieldCheck className="inline mr-1" size={18} /> Nothing waiting for review.</p>
        ) : (
          <ul className="space-y-3">{routine.review.map((o) => <ReviewCard key={o.id} o={o} staff={staff} author={author} onChanged={load} />)}</ul>
        )
      ) : view === 'pipeline' ? (
        <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
          {OPEN_LISTING_STAGES.map((stage) => {
            const list = visible.filter((o) => o.review_status === 'approved' && o.stage === stage);
            const meta = listingStageMeta(stage);
            return (
              <section key={stage} className="w-72 shrink-0 snap-start bg-gray-100 rounded-xl p-3">
                <h2 className="flex items-center justify-between mb-1 text-sm font-semibold text-gray-700">
                  <span>{meta.label}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-gray-600 text-xs">{list.length}</span>
                </h2>
                <p className="text-xs text-gray-500 mb-3">{meta.hint}</p>
                <div className="space-y-2">
                  {list.length === 0 && <p className="text-xs text-gray-500 px-1 py-4 text-center">None here</p>}
                  {list.map((o) => {
                    const due = dueState(o.follow_up_at);
                    return (
                      <Link key={o.id} href={`/dashboard/listings/${o.id}`} className="block bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:border-blue-300">
                        <div className="font-medium text-gray-900 leading-snug">{o.owner_name}</div>
                        <div className="text-sm text-gray-600">{sourceMeta(o.source).icon} {opportunityTitle(o)}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {o.priority !== 'warm' && <Badge className={priorityMeta(o.priority).className}>{priorityMeta(o.priority).label}</Badge>}
                          {(o.estimated_value ?? o.price_expectation) && <span className="text-xs text-gray-700">{formatMoney(o.estimated_value ?? o.price_expectation)}</span>}
                        </div>
                        {o.appointment_at && stage === 'appointment' && <div className="text-xs text-purple-700 mt-1">📅 {formatDateTime(o.appointment_at)}</div>}
                        {o.follow_up_at && (
                          <div className={`text-xs mt-1 ${due === 'overdue' ? 'text-red-600 font-medium' : due === 'today' ? 'text-amber-700' : 'text-gray-500'}`}>
                            Follow-up {due === 'overdue' ? 'overdue' : due === 'today' ? 'today' : formatDateTime(o.follow_up_at)}
                          </div>
                        )}
                        {!mineOnly && <div className="text-xs text-gray-400 mt-1">{staffName(staff.find((s) => s.id === o.assigned_to))}</div>}
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <ul className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {visible.filter((o) => !OPEN_LISTING_STAGES.includes(o.stage) || o.review_status === 'rejected').length === 0 && (
            <li className="p-6 text-center text-gray-500 text-sm">No won, lost or rejected opportunities yet.</li>
          )}
          {visible.filter((o) => !OPEN_LISTING_STAGES.includes(o.stage) || o.review_status === 'rejected').map((o) => (
            <li key={o.id} className="p-3 flex flex-wrap items-center gap-2 text-sm">
              {o.review_status === 'rejected'
                ? <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                : <Badge className={listingStageMeta(o.stage).className}>{listingStageMeta(o.stage).short}</Badge>}
              <Link href={`/dashboard/listings/${o.id}`} className="font-medium text-gray-900 hover:text-blue-600">{o.owner_name}</Link>
              <span className="text-gray-600">{opportunityTitle(o)}</span>
              <span className="text-gray-500 ml-auto">
                {o.deal_id ? <Link href={`/dashboard/deals/${o.deal_id}`} className="text-blue-600 hover:underline">View deal →</Link> : o.lost_reason || o.review_note || ''}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-gray-500">
        Opportunities a broker or admin enters go straight into the pipeline; website requests and client referrals go to the admin to review first.
      </p>
    </div>
  );
}

export default function ListingsPageWrapper() {
  return (
    <Suspense fallback={<p className="text-gray-500">Loading…</p>}>
      <ListingsPage />
    </Suspense>
  );
}
