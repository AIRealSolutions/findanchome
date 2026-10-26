'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HomeModernIcon } from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { TOUCH_KINDS, dailyRoutine, readDailyGoal, type ListingOpportunity } from '@/lib/listings';

/** Dashboard home card: today's listing routine at a glance. */
export default function ListingsSummaryCard() {
  const { user, isAdmin } = useAuth();
  const [counts, setCounts] = useState<{ review: number; calls: number; appointments: number; touches: number } | null>(null);
  const [goal] = useState(readDailyGoal);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const supabase = createClient();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    Promise.all([
      supabase.from('fanc_listing_opportunities').select('*').or(`assigned_to.eq.${user.id},review_status.eq.pending_review`).limit(2000),
      supabase.from('fanc_listing_activity').select('id').eq('author_id', user.id).in('kind', TOUCH_KINDS).gte('created_at', start.toISOString()).limit(1000),
    ]).then(([o, t]) => {
      if (cancelled) return;
      const r = dailyRoutine((o.data ?? []) as ListingOpportunity[]);
      setCounts({
        review: r.review.length,
        calls: r.newToCall.length + r.followUps.length,
        appointments: r.appointments.length,
        touches: t.data?.length ?? 0,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const tiles = [
    ...(isAdmin ? [{ label: 'To review', value: counts?.review }] : []),
    { label: 'Calls due', value: counts?.calls },
    { label: 'Appointments', value: counts?.appointments },
    { label: `Touches / ${goal}`, value: counts?.touches },
  ];

  return (
    <Link
      href="/dashboard/listings"
      className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-xl p-6 shadow hover:shadow-lg transition-shadow"
    >
      <HomeModernIcon className="w-10 h-10 shrink-0" />
      <div className="flex-1">
        <p className="text-lg font-bold">Listing Opportunities</p>
        <p className="text-sm opacity-90">Today’s routine: review, call, follow up, prospect.</p>
      </div>
      <div className="flex gap-6">
        {tiles.map((t) => (
          <div key={t.label}>
            <div className="text-3xl font-bold">{t.value ?? '–'}</div>
            <div className="text-xs uppercase tracking-wide opacity-90">{t.label}</div>
          </div>
        ))}
      </div>
    </Link>
  );
}
