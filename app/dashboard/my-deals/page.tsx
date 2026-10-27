'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { formatDate, formatMoney } from '@/lib/clients';
import { JOURNEY, workspaceTitle, type WorkspaceDeal } from '@/lib/workspace';

/** A client's deals: each opens the workspace they share with their broker. */
export default function MyDealsPage() {
  const { user, loading } = useAuth();
  const [deals, setDeals] = useState<WorkspaceDeal[] | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    const supabase = createClient();
    // Pick up any invites sent since they last signed in, then list their deals.
    supabase.rpc('fanc_claim_invites').then(() => supabase.rpc('fanc_workspace_deals')).then(({ data }) => {
      if (!cancelled) setDeals((data ?? []) as WorkspaceDeal[]);
    });
    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My deals</h1>
      <p className="mt-1 mb-6 text-gray-600">Follow along with your purchase or sale: updates, to-dos and key dates in one place.</p>
      {!deals ? <p className="text-gray-500">Loading…</p> : deals.length === 0 ? (
        <p className="p-6 bg-white border border-gray-200 rounded-xl text-gray-600">No deals yet. When your broker invites you to a deal, it will appear here.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {deals.map((d) => {
            const at = JOURNEY.findIndex((j) => j.stage === d.stage);
            const next = [['Closing', d.closing_date], ['Due diligence ends', d.due_diligence_date], ['Inspection', d.inspection_date]]
              .filter(([, on]) => on && on >= new Date().toISOString().slice(0, 10)).sort((a, b) => a[1]!.localeCompare(b[1]!))[0];
            return (
              <li key={d.id}>
                <Link href={`/dashboard/deals/${d.id}/workspace`} className="block p-5 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow">
                  <p className="text-sm text-gray-500">{d.side === 'seller' ? 'Selling' : 'Buying'}</p>
                  <p className="text-lg font-semibold text-gray-900">{workspaceTitle(d)}</p>
                  <p className="text-sm text-gray-700 mt-1">{d.stage === 'fell_through' ? 'Not moving forward' : JOURNEY[at]?.label}
                    {(d.contract_price ?? d.list_price) != null && ` · ${formatMoney(d.contract_price ?? d.list_price)}`}</p>
                  {next && <p className="text-sm text-blue-700 mt-1">{next[0]}: {formatDate(next[1], { weekday: 'short', month: 'short', day: 'numeric' })}</p>}
                  {d.broker_name && <p className="text-xs text-gray-500 mt-2">With {d.broker_name}</p>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
