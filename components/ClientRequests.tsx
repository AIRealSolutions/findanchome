'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/clients';
import { labels, statusMeta, type Lead } from '@/lib/leads';
import { listingStageMeta, opportunityTitle, type ListingOpportunity } from '@/lib/listings';

type LeadRow = Pick<Lead, 'id' | 'created_at' | 'intent' | 'status' | 'price_range' | 'timeframe' | 'source_page'>;
type OppRow = Pick<ListingOpportunity, 'id' | 'created_at' | 'property_address' | 'city' | 'owner_name' | 'stage' | 'review_status'>;

interface Item { key: string; href: string; date: string; title: string; detail: string; badge: { label: string; className: string } }

const LEAD_COLS = 'id, created_at, intent, status, price_range, timeframe, source_page';

async function fetchRequests(clientId: string, consultationId: string | null): Promise<Item[]> {
  const supabase = createClient();
  const leadsFor = (filter: string) => supabase.from('fanc_consultation_requests').select(LEAD_COLS).or(filter);
  const own = `client_id.eq.${clientId}`;
  const [linked, opps] = await Promise.all([
    leadsFor(consultationId ? `${own},id.eq.${consultationId}` : own),
    supabase.from('fanc_listing_opportunities').select('id, created_at, property_address, city, owner_name, stage, review_status').eq('client_id', clientId),
  ]);
  // Before unified_intake.sql is applied there is no client_id on requests; fall back to the hand-made link.
  const leads = linked.error && consultationId ? await leadsFor(`id.eq.${consultationId}`) : linked;

  const items: Item[] = [
    ...((leads.data ?? []) as LeadRow[]).map((l) => ({
      key: `lead-${l.id}`,
      href: `/dashboard/leads/${l.id}`,
      date: l.created_at,
      title: l.source_page === '/education/buyer-preferences' ? 'Buyer preferences' : 'Consultation request',
      detail: [labels('intent', l.intent).join(', '), l.price_range, l.timeframe].filter(Boolean).join(' · '),
      badge: { label: statusMeta(l.status).label, className: statusMeta(l.status).className },
    })),
    ...((opps.data ?? []) as OppRow[]).map((o) => ({
      key: `opp-${o.id}`,
      href: `/dashboard/listings/${o.id}`,
      date: o.created_at,
      title: 'Listing request',
      detail: opportunityTitle(o),
      badge: o.review_status === 'pending_review'
        ? { label: 'Waiting for review', className: 'bg-amber-100 text-amber-800' }
        : o.review_status === 'rejected'
          ? { label: 'Rejected', className: 'bg-gray-100 text-gray-700' }
          : { label: listingStageMeta(o.stage).short, className: listingStageMeta(o.stage).className },
    })),
  ];
  return items.sort((a, b) => b.date.localeCompare(a.date));
}

/** Everything this person has asked for through the website or a referral: consultation requests and listing requests. */
export default function ClientRequests({ clientId, consultationId }: { clientId: string; consultationId: string | null }) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchRequests(clientId, consultationId).then((r) => {
      if (!cancelled) setItems(r);
    });
    return () => {
      cancelled = true;
    };
  }, [clientId, consultationId]);

  if (items.length === 0) return null;

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Requests ({items.length})</h2>
      <ul className="divide-y divide-gray-100">
        {items.map((it) => (
          <li key={it.key} className="py-2.5 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${it.badge.className}`}>{it.badge.label}</span>
              <Link href={it.href} className="font-medium text-gray-900 hover:text-blue-600">{it.title}</Link>
              <span className="text-gray-500">{formatDate(it.date.slice(0, 10))}</span>
            </div>
            {it.detail && <div className="text-gray-600 mt-0.5">{it.detail}</div>}
          </li>
        ))}
      </ul>
    </section>
  );
}
