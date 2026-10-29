'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { BROKERAGE } from '@/lib/site';

/**
 * Client sign-in for the shared deal workspace and Messages. Only emails a broker invited get a sign-in link; the page
 * answers the same way either way so it doesn't reveal who is a client.
 */
export default function JoinPage() {
  return (
    <Suspense>
      <Join />
    </Suspense>
  );
}

function Join() {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get('email') ?? '');
  // Where the sign-in link lands: a dashboard page from the invite, else the client's deals.
  const nextParam = params.get('next') ?? '';
  const next = /^\/dashboard\/[\w\-/]*$/.test(nextParam) ? nextParam : '/dashboard/my-deals';
  const forMessages = next.startsWith('/dashboard/messages');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'blocked'>('idle');

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const addr = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) return;
    setState('sending');
    const supabase = createClient();
    const { data: invited } = await supabase.rpc('fanc_invite_exists', { addr });
    if (invited) {
      const { error } = await supabase.auth.signInWithOtp({
        email: addr,
        options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}${next}` },
      });
      if (error && /signup|not allowed/i.test(error.message)) return setState('blocked');
    }
    setState('sent');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Image src="/lightkeeper-logo.jpg" alt="Lightkeeper Realty" width={48} height={48} className="rounded-full" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">{forMessages ? 'Your messages' : 'Your deal workspace'}</h1>
            <p className="text-sm text-gray-600">{BROKERAGE.name}</p>
          </div>
        </div>
        {state === 'sent' ? (
          <div>
            <p className="text-gray-900 font-medium">Check your email.</p>
            <p className="mt-2 text-sm text-gray-600">
              If your broker has invited {email.trim()}, we just sent a sign-in link. Open it on this device to see your {forMessages ? 'messages' : 'deal'}. The link expires in an hour.
            </p>
            <button onClick={() => setState('idle')} className="mt-4 text-sm text-blue-600 hover:underline">Use a different email</button>
          </div>
        ) : state === 'blocked' ? (
          <p className="text-sm text-gray-700">
            Your access isn’t quite ready yet. Please call {BROKERAGE.agent} at <a href={`tel:${BROKERAGE.phoneE164}`} className="text-blue-600 underline">{BROKERAGE.phone}</a> and we’ll get you set up.
          </p>
        ) : (
          <form onSubmit={submit}>
            <p className="text-sm text-gray-600 mb-4">{forMessages ? 'Read and reply to your private conversation with us, including shared documents and photos.' : 'Follow your purchase or sale: daily updates, shared to-dos and key dates.'} Enter the email your broker invited and we’ll send you a sign-in link. No password needed.</p>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <button disabled={state === 'sending'} className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
              {state === 'sending' ? 'Sending…' : 'Email me a sign-in link'}
            </button>
          </form>
        )}
        <p className="mt-6 text-xs text-gray-500">Brokers: <Link href="/login" className="text-blue-600 hover:underline">sign in here</Link>.</p>
      </div>
    </div>
  );
}
