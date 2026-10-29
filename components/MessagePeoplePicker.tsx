'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { clientName } from '@/lib/clients';
import { fetchStaff, staffName, type StaffMember } from '@/lib/listings';
import type { NewMember } from '@/lib/messages';

export interface PickedPerson extends NewMember {
  key: string;
  label: string;
  isClient: boolean;
  clientId?: string;
}

type ClientHit = { id: string; first_name: string; last_name: string | null; email: string | null };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Choose brokers and admins, clients from the client database, or anyone by email. */
export function MessagePeoplePicker({ value, onChange, exclude = [] }: {
  value: PickedPerson[]; onChange: (v: PickedPerson[]) => void; exclude?: string[];
}) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<ClientHit[]>([]);
  const picked = new Set(value.map((p) => p.key));
  const add = (p: PickedPerson) => !picked.has(p.key) && onChange([...value, p]);

  useEffect(() => {
    fetchStaff().then(setStaff);
  }, []);

  // Client search by name or email.
  useEffect(() => {
    const term = q.trim().replace(/[%,()]/g, ' ');
    if (term.length < 2 || EMAIL_RE.test(term)) return;
    const t = setTimeout(() => {
      createClient().from('fanc_clients').select('id, first_name, last_name, email').not('email', 'is', null)
        .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%`).order('first_name').limit(8)
        .then(({ data }) => setHits((data ?? []) as ClientHit[]));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const term = q.trim();
  const shownHits = term.length >= 2 && !EMAIL_RE.test(term) ? hits : [];
  const addEmail = () => {
    const email = term.toLowerCase();
    if (!EMAIL_RE.test(email)) return;
    add({ key: `email:${email}`, email, label: email, isClient: true });
    setQ('');
  };
  const others = staff.filter((s) => !exclude.includes(s.id));

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((p) => (
            <span key={p.key} className={`inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full text-sm ${p.isClient ? 'bg-green-100 text-green-900' : 'bg-blue-100 text-blue-900'}`}>
              {p.label}{p.isClient && <span className="text-xs opacity-70">client</span>}
              <button type="button" onClick={() => onChange(value.filter((x) => x.key !== p.key))} aria-label={`Remove ${p.label}`} className="p-0.5 rounded-full hover:bg-black/10"><X size={12} /></button>
            </span>
          ))}
        </div>
      )}
      {others.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Brokers &amp; staff</p>
          <div className="flex flex-wrap gap-1.5">
            {others.filter((s) => !picked.has(`user:${s.id}`)).map((s) => (
              <button type="button" key={s.id} onClick={() => add({ key: `user:${s.id}`, user_id: s.id, label: staffName(s), isClient: false })}
                className="px-2.5 py-1 rounded-full border border-gray-300 text-sm text-gray-700 hover:border-blue-400">+ {staffName(s)}</button>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1">Clients or anyone by email</p>
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEmail(); } }}
            placeholder="Search clients, or type an email address" className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          {EMAIL_RE.test(term) && <button type="button" onClick={addEmail} className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Add</button>}
        </div>
        {shownHits.length > 0 && (
          <ul className="mt-1 border border-gray-200 rounded-lg divide-y divide-gray-100 bg-white">
            {shownHits.filter((c) => !picked.has(`email:${c.email!.toLowerCase()}`)).map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => {
                  add({ key: `email:${c.email!.toLowerCase()}`, email: c.email!, name: clientName(c), label: clientName(c), isClient: true, clientId: c.id });
                  setQ('');
                }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
                  {clientName(c)} <span className="text-gray-500">{c.email}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
