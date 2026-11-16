'use client';

import { useState } from 'react';
import { Copy, Home, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDate, type Client } from '@/lib/clients';
import { SITE_URL } from '@/lib/site';

/** Broker's switch for a client's My Home page: give access and email the sign-in link, or take access away. */
export default function ClientPortalAccess({ client, onChanged }: {
  client: Pick<Client, 'id' | 'email' | 'portal_access' | 'portal_invited_at' | 'user_id'>;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const link = client.email
    ? `${SITE_URL}/join?email=${encodeURIComponent(client.email.trim().toLowerCase())}&next=${encodeURIComponent('/dashboard/my-home')}`
    : '';

  const invite = async () => {
    setBusy(true);
    setNote(null);
    const { data: { session } } = await createClient().auth.getSession();
    const res = session && await fetch('/api/client-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ clientId: client.id }),
    }).catch(() => null);
    const j = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res || !res.ok) return setNote({ ok: false, text: j.error ?? 'Could not reach the server.' });
    setNote({ ok: !!j.sent, text: j.sent ? `Invite emailed to ${client.email}.` : j.message ?? 'Access is on.' });
    onChanged();
  };

  const turnOff = async () => {
    setBusy(true);
    setNote(null);
    const { error } = await createClient().from('fanc_clients').update({ portal_access: false }).eq('id', client.id);
    setBusy(false);
    if (error) return setNote({ ok: false, text: error.message });
    setNote({ ok: true, text: client.user_id ? 'New sign-in links are off. They have already signed in, so their page still works.' : 'Access is off.' });
    onChanged();
  };

  const copy = async () => {
    await navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const status = client.user_id
    ? 'They have signed in and can see their My Home page.'
    : client.portal_access
      ? `Invited${client.portal_invited_at ? ` ${formatDate(client.portal_invited_at.slice(0, 10))}` : ''}. They haven’t signed in yet.`
      : 'Not invited. My Home shows them their home, key dates, the homeowner calendar and a home-value request button.';

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2"><Home size={14} /> My Home access</h2>
      <p className="text-sm text-gray-700">{status}</p>
      {!client.email ? (
        <p className="mt-2 text-sm text-gray-500">Add an email address to invite them.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={invite} disabled={busy} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            <Send size={14} /> {busy ? 'Working…' : client.portal_access ? 'Email the invite again' : 'Give access and email invite'}
          </button>
          {client.portal_access && (
            <>
              <button onClick={copy} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                <Copy size={14} /> {copied ? 'Copied' : 'Copy sign-in link'}
              </button>
              <button onClick={turnOff} disabled={busy} className="px-3 py-2 text-sm text-gray-600 hover:text-red-700 disabled:opacity-50">Turn off</button>
            </>
          )}
        </div>
      )}
      {note && <p role="status" className={`mt-2 text-sm ${note.ok ? 'text-green-700' : 'text-amber-800'}`}>{note.text}</p>}
    </section>
  );
}
