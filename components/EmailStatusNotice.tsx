'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Status { configured: boolean; testSender: boolean; sender: string; notifyTo: string }

async function call(method: 'GET' | 'POST') {
  const { data: { session } } = await createClient().auth.getSession();
  if (!session) return null;
  const res = await fetch('/api/email-status', { method, headers: { Authorization: `Bearer ${session.access_token}` } });
  return res.ok ? res.json() : null;
}

/**
 * Admin-only warning at the top of the dashboard while email is not fully set up, so missed lead alerts and
 * undelivered client invites are not silent. Shows nothing once email sends from the company's own domain.
 */
export default function EmailStatusNotice() {
  const [status, setStatus] = useState<Status | null>(null);
  const [test, setTest] = useState<{ state: 'idle' | 'sending' | 'done'; ok?: boolean; text?: string }>({ state: 'idle' });

  useEffect(() => {
    call('GET').then(setStatus);
  }, []);

  if (!status || (status.configured && !status.testSender)) return null;

  const sendTest = async () => {
    setTest({ state: 'sending' });
    const r = await call('POST');
    setTest({
      state: 'done',
      ok: !!r?.ok,
      text: r?.ok ? `Test sent to ${r.to}. Check that inbox (and spam).` : `The test failed: ${r?.error ?? 'no answer from the server'}`,
    });
  };

  return (
    <div role="status" className="bg-red-50 border-b border-red-200 text-red-900 text-sm px-4 sm:px-8 py-3">
      {!status.configured ? (
        <p>
          <strong>Email alerts are off.</strong> New leads are saved under Leads, but nobody is emailed, and client invites and message
          alerts are not sent. Add <code>RESEND_API_KEY</code> to the project’s environment variables in Vercel and redeploy.
        </p>
      ) : (
        <>
          <p>
            <strong>Email is only half set up.</strong> Emails go out from Resend’s test address, which delivers only to the Resend account
            owner’s inbox, so client invites and message alerts to clients are not delivered. Verify findanchome.com in Resend, then set{' '}
            <code>CONSULTATION_FROM_EMAIL</code> in Vercel to an address on that domain.
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-3">
            <button onClick={sendTest} disabled={test.state === 'sending'} className="px-3 py-1.5 rounded-lg bg-red-700 text-white font-medium hover:bg-red-800 disabled:opacity-50">
              {test.state === 'sending' ? 'Sending…' : `Send a test to ${status.notifyTo}`}
            </button>
            {test.state === 'done' && <span className={test.ok ? 'text-green-800 font-medium' : 'font-medium'}>{test.text}</span>}
          </p>
        </>
      )}
    </div>
  );
}
