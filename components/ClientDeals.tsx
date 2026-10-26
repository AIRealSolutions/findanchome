'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatMoney, type Client } from '@/lib/clients';
import { DEAL_SIDES, createDeal, dealPrice, dealTitle, nextKeyDate, stageMeta, type Deal, type DealSide } from '@/lib/deals';

/** A client's deals, with buttons to start a buyer deal or a listing. */
export default function ClientDeals({ client, author }: {
  client: Pick<Client, 'id' | 'first_name' | 'last_name' | 'address_line1' | 'city' | 'zip_code'>;
  author: { id: string; name: string };
}) {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    createClient().from('fanc_deals').select('*').eq('client_id', client.id).order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) setError(err.message);
        setDeals((data ?? []) as Deal[]);
      });
    return () => {
      cancelled = true;
    };
  }, [client.id]);

  const start = async (side: DealSide) => {
    setBusy(true);
    const r = await createDeal(client, side, author);
    setBusy(false);
    if (!r.id) return setError(r.error ?? 'Could not create the deal');
    router.push(`/dashboard/deals/${r.id}`);
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Deals</h2>
        <div className="flex flex-wrap gap-3">
          <Link href={`/dashboard/listings/new?client=${client.id}`} className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800">
            <Plus size={14} /> Listing opportunity
          </Link>
          {DEAL_SIDES.filter((s) => s.value !== 'both').map((s) => (
            <button key={s.value} disabled={busy} onClick={() => start(s.value)} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50">
              <Plus size={14} /> {s.value === 'buyer' ? 'Buyer deal' : 'Listing'}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      {deals.length === 0 ? (
        <p className="text-sm text-gray-500">No deals yet. Start one when they begin looking or list their home.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {deals.map((d) => {
            const key = nextKeyDate(d);
            return (
              <li key={d.id} className="py-2.5 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${stageMeta(d.stage).className}`}>{stageMeta(d.stage).short}</span>
                  <Link href={`/dashboard/deals/${d.id}`} className="font-medium text-gray-900 hover:text-blue-600">{dealTitle(d)}</Link>
                </div>
                <div className="text-gray-600 mt-0.5">
                  {[DEAL_SIDES.find((s) => s.value === d.side)?.label, formatMoney(dealPrice(d)), key && `${key.label} in ${key.days}d`].filter(Boolean).join(' · ')}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
