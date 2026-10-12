'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { InboxStackIcon } from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase/client';
import { followUpState, type Lead } from '@/lib/leads';

/** Dashboard home card: new consultation leads and follow-ups due today. */
export default function LeadsSummaryCard() {
  const [counts, setCounts] = useState<{ new: number; due: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    createClient()
      .from('fanc_consultation_requests')
      .select('status, follow_up_at')
      .in('status', ['new', 'contacted', 'scheduled'])
      .then(({ data }) => {
        if (cancelled || !data) return;
        const rows = data as Pick<Lead, 'status' | 'follow_up_at'>[];
        setCounts({
          new: rows.filter((r) => r.status === 'new').length,
          due: rows.filter((r) => {
            const s = followUpState(r);
            return s === 'overdue' || s === 'today';
          }).length,
        });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link
      href="/dashboard/leads"
      className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl p-6 shadow hover:shadow-lg transition-shadow"
    >
      <InboxStackIcon className="w-10 h-10 shrink-0" />
      <div className="flex-1">
        <p className="text-lg font-bold">Consultation Leads</p>
        <p className="text-sm opacity-90">Work requests from the website consultation form.</p>
      </div>
      <div className="flex gap-6">
        <div>
          <div className="text-3xl font-bold">{counts?.new ?? '–'}</div>
          <div className="text-xs uppercase tracking-wide opacity-90">New</div>
        </div>
        <div>
          <div className="text-3xl font-bold">{counts?.due ?? '–'}</div>
          <div className="text-xs uppercase tracking-wide opacity-90">Follow-ups due</div>
        </div>
      </div>
    </Link>
  );
}
