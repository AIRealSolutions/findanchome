'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Camera, Check, Copy, HousePlus, Megaphone, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { formatMoney } from '@/lib/clients';
import { capProgress, closedDealMoney, fetchFinance, periodRange, planLookup, profitAndLoss, salesStats, type FinanceData } from '@/lib/finance';
import { Progress } from './admin/ui';
import { GOAL_METRICS } from './admin/sections/Executive';
import type { Goal } from './admin/useAdminData';
import { captureLinks, startOfWeek, WEEKLY_POST_GOAL } from '@/lib/marketing';
import LeadsSummaryCard from './LeadsSummaryCard';
import ListingsSummaryCard from './ListingsSummaryCard';
import TodayCard from './TodayCard';

const money = (n: number) => formatMoney(n) || '$0';

/** A broker's home: their production and earnings, today's work, and quick marketing. */
export default function BrokerHome() {
  const { user, profile } = useAuth();
  const [data, setData] = useState<FinanceData | null>(null);
  const [postsThisWeek, setPostsThisWeek] = useState<number | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchFinance().then((f) => !cancelled && setData(f));
    createClient().from('fanc_goals').select('*').eq('year', new Date().getFullYear())
      .then(({ data: g }) => !cancelled && setGoals(((g ?? []) as Goal[]).map((x) => ({ ...x, target: Number(x.target) }))));
    createClient().from('fanc_marketing_posts').select('id').eq('broker_id', user.id).eq('status', 'posted')
      .gte('posted_at', startOfWeek().toISOString()).limit(100)
      .then(({ data: p }) => !cancelled && setPostsThisWeek(p?.length ?? 0));
    return () => {
      cancelled = true;
    };
  }, [user]);

  const mine = useMemo(() => {
    if (!data || !user) return null;
    const roles = new Map(data.staff.map((s) => [s.id, s.role]));
    const plan = planLookup(data.plans, roles);
    const dm = closedDealMoney(data.deals, plan);
    const { from, to } = periodRange('ytd');
    const stats = salesStats(data, dm, plan, from, to, user.id);
    const myPlan = plan(user.id);
    const companyFromMe = data.deals
      .filter((d) => d.stage === 'closed' && d.broker_id === user.id && d.closing_date && d.closing_date >= from)
      .reduce((n, d) => n + (dm.get(d.id)?.companyDollar ?? 0), 0);
    const pl = profitAndLoss(data, dm, from, to, user.id);
    const actual: Record<string, number> = { units: stats.units, volume: stats.volume, gci: pl.gci, company_dollar: pl.companyDollar };
    return { stats, plan: myPlan, cap: capProgress(data, dm, myPlan), companyFromMe, actual };
  }, [data, user]);

  const link = user ? captureLinks(user.id)[0] : null;
  const copy = () => {
    if (!link) return;
    navigator.clipboard?.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  // The principal broker keeps their own deals in the company, so show what they brought in.
  const ownsDeals = mine?.plan.split_pct === 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{greeting}, {profile?.first_name || 'there'}!</h1>
        <p className="mt-1 text-gray-600">Your business at a glance: earnings, today’s work, and tools to market yourself.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: `Closed in ${new Date().getFullYear()}`, value: mine ? String(mine.stats.units) : '–', sub: mine ? `${money(mine.stats.volume)} volume` : '' },
          ownsDeals
            ? { label: 'Company dollar from my deals', value: mine ? money(mine.companyFromMe) : '–', sub: 'year to date' }
            : { label: 'My earnings', value: mine ? money(mine.stats.earnings) : '–', sub: mine ? `year to date · ${mine.plan.split_pct}% split` : '' },
          { label: 'Under contract', value: mine ? String(mine.stats.pendingUnits) : '–', sub: mine ? `${money(ownsDeals ? mine.stats.pendingCompanyDollar : mine.stats.pendingAgentPayout)} projected` : '' },
          mine?.cap
            ? { label: 'Toward my cap', value: `${Math.round(mine.cap.pct)}%`, sub: `${money(mine.cap.paid)} of ${money(mine.cap.cap)}` }
            : { label: 'Active listings & buyers', value: mine ? String(mine.stats.activeListings + mine.stats.activeBuyers) : '–', sub: mine ? `${mine.stats.activeListings} listings · ${mine.stats.activeBuyers} buyers` : '' },
        ].map((t) => (
          <div key={t.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-900">{t.value}</div>
            <div className="text-sm text-gray-600">{t.label}</div>
            {t.sub && <div className="text-xs text-gray-500 mt-0.5">{t.sub}</div>}
          </div>
        ))}
      </div>

      {mine && goals.some((g) => g.broker_id === user?.id && g.metric in mine.actual) && (
        <section className="mb-8 bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-3">My {new Date().getFullYear()} goals</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {GOAL_METRICS.filter((m) => goals.some((g) => g.broker_id === user?.id && g.metric === m.value) && m.value in mine.actual).map((m) => (
              <Progress key={m.value} label={m.label} value={mine.actual[m.value]} target={goals.find((g) => g.broker_id === user?.id && g.metric === m.value)!.target}
                format={m.money ? money : (n) => n.toLocaleString()} />
            ))}
          </div>
          {goals.some((g) => !g.broker_id) && (
            <p className="mt-3 text-xs text-gray-500">Company goals: {GOAL_METRICS.filter((m) => goals.some((g) => !g.broker_id && g.metric === m.value))
              .map((m) => `${m.label} ${m.money ? money(goals.find((g) => !g.broker_id && g.metric === m.value)!.target) : goals.find((g) => !g.broker_id && g.metric === m.value)!.target.toLocaleString()}`).join(' · ')}</p>
          )}
        </section>
      )}

      <ListingsSummaryCard />
      <TodayCard />

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Megaphone size={18} className="text-pink-600" />
            <h2 className="font-semibold text-gray-900">Promote your business</h2>
          </div>
          <p className="text-sm text-gray-600">
            {postsThisWeek == null ? '…' : `${postsThisWeek} of ${WEEKLY_POST_GOAL} social posts this week.`} Share your home-value link; every owner who uses it lands in your listing opportunities (after admin review).
          </p>
          {link && (
            <div className="mt-3 flex gap-2">
              <input readOnly value={link.url} className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" onFocus={(e) => e.target.select()} />
              <button onClick={copy} className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/dashboard/marketing" className="px-3 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700">Create a social post</Link>
            <Link href="/dashboard/marketing?tab=links" className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Links &amp; QR codes</Link>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Quick actions</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { href: '/dashboard/listings/capture', label: 'Snap a house', icon: Camera },
              { href: '/dashboard/listings/new', label: 'Onboard a listing', icon: HousePlus },
              { href: '/dashboard/clients', label: 'Add or find a client', icon: UserPlus },
              { href: '/dashboard/deals', label: 'Start a deal', icon: Briefcase },
              { href: '/dashboard/leads', label: 'Work website leads', icon: Megaphone },
            ].map((a) => (
              <Link key={a.href} href={a.href} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50">
                <a.icon size={18} className="text-blue-600" /> {a.label}
              </Link>
            ))}
          </div>
        </section>
      </div>

      <LeadsSummaryCard />
    </div>
  );
}
