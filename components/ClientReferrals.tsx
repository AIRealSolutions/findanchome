'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { clientName, clientStatusMeta, type Client } from '@/lib/clients';

type Person = Pick<Client, 'id' | 'first_name' | 'last_name' | 'status' | 'referred_by_id'>;

/** Who referred this client, and the clients they've referred (fanc_clients.referred_by_id). */
export default function ClientReferrals({ client, author, onChanged }: {
  client: Pick<Client, 'id' | 'first_name' | 'last_name' | 'referred_by_id'>;
  author: { id: string; name: string };
  onChanged: () => void;
}) {
  const [people, setPeople] = useState<Person[]>([]);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const fetchPeople = useCallback(async () => {
    const out: Person[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error: err } = await createClient().from('fanc_clients').select('id, first_name, last_name, status, referred_by_id')
        .order('last_name', { nullsFirst: false }).order('first_name').order('id').range(from, from + 999);
      if (err) return { people: out, error: err.message };
      out.push(...((data ?? []) as Person[]));
      if (!data || data.length < 1000) return { people: out, error: '' };
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchPeople().then((r) => {
      if (cancelled) return;
      setPeople(r.people);
      if (r.error) setError(r.error);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchPeople, client.referred_by_id]);

  const referrer = people.find((p) => p.id === client.referred_by_id);
  const referrals = people.filter((p) => p.referred_by_id === client.id);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return people.filter((p) => p.id !== client.id && clientName(p).toLowerCase().includes(q)).slice(0, 8);
  }, [people, query, client.id]);

  const setReferrer = async (p: Person | null) => {
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.from('fanc_clients').update({ referred_by_id: p?.id ?? null }).eq('id', client.id);
    if (err) return setError(err.message);
    const entry = (client_id: string, body: string) => ({ client_id, kind: 'note', body, author_id: author.id, author_name: author.name });
    await supabase.from('fanc_client_activity').insert(
      p
        ? [entry(client.id, `Referred by ${clientName(p)}`), entry(p.id, `Referred ${clientName(client)}`)]
        : [entry(client.id, 'Referral source cleared')],
    );
    setPicking(false);
    setQuery('');
    onChanged();
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Referrals</h2>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

      <div className="text-sm">
        <span className="text-gray-500">Referred by: </span>
        {referrer ? (
          <>
            <Link href={`/dashboard/clients/${referrer.id}`} className="text-blue-600 hover:underline">{clientName(referrer)}</Link>
            {!picking && (
              <>
                <button onClick={() => setPicking(true)} className="ml-2 text-xs text-gray-500 hover:text-blue-600">change</button>
                <button onClick={() => setReferrer(null)} className="ml-2 text-xs text-gray-500 hover:text-red-600">clear</button>
              </>
            )}
          </>
        ) : (
          !picking && <button onClick={() => setPicking(true)} className="text-blue-600 hover:underline">add who referred them</button>
        )}
      </div>

      {picking && (
        <div className="mt-2">
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your clients by name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
          {matches.length > 0 && (
            <ul className="mt-1 border border-gray-200 rounded-lg divide-y divide-gray-100">
              {matches.map((p) => (
                <li key={p.id}>
                  <button onClick={() => setReferrer(p)} className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50">{clientName(p)}</button>
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => { setPicking(false); setQuery(''); }} className="mt-1 text-xs text-gray-500 hover:text-gray-800">Cancel</button>
        </div>
      )}

      <div className="mt-3 text-sm">
        <span className="text-gray-500">Has referred: </span>
        {referrals.length === 0 ? (
          <span className="text-gray-400">no one yet</span>
        ) : (
          <>
            <strong>{referrals.length}</strong>
            <ul className="mt-1 space-y-0.5">
              {referrals.map((p) => (
                <li key={p.id}>
                  <Link href={`/dashboard/clients/${p.id}`} className="text-blue-600 hover:underline">{clientName(p)}</Link>
                  <span className="text-gray-500"> · {clientStatusMeta(p.status).label}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
