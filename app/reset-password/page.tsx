'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Status = 'checking' | 'ready' | 'invalid' | 'saving' | 'done';

// Landing page for the password recovery email (see app/forgot-password). The Supabase browser client
// exchanges the code in the URL for a recovery session; we then let the user set a new password.
export default function ResetPasswordPage() {
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const [status, setStatus] = useState<Status>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabaseRef.current = supabase;

    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const linkError = params.get('error_description') || hash.get('error_description');
    if (linkError) {
      const t = setTimeout(() => {
        setError(linkError);
        setStatus('invalid');
      });
      return () => clearTimeout(t);
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        setStatus((s) => (s === 'checking' ? 'ready' : s));
      }
    });

    // Give the client a moment to exchange the code, then decide.
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      setStatus((s) => (s === 'checking' ? (data.session ? 'ready' : 'invalid') : s));
    }, 1500);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('The passwords do not match.');
      return;
    }
    setStatus('saving');
    const { error: updateError } = await supabaseRef.current!.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setStatus('ready');
      return;
    }
    setStatus('done');
    setTimeout(() => router.push('/dashboard'), 1500);
  };

  const input =
    'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              LK
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Choose a new password</h2>
          <p className="mt-2 text-sm text-gray-600">Admin &amp; Broker Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {status === 'checking' && <p className="text-center text-gray-600">Verifying your reset link…</p>}

          {status === 'invalid' && (
            <div className="text-center" role="alert">
              <p className="text-gray-800 font-medium mb-2">This reset link is invalid or has expired</p>
              <p className="text-sm text-gray-600 mb-4">
                {error || 'Request a new link and open it in the same browser you requested it from.'}
              </p>
              <Link href="/forgot-password" className="inline-block py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
                Request a New Link
              </Link>
            </div>
          )}

          {status === 'done' && (
            <p className="text-center text-gray-800 font-medium" role="status">
              Password updated. Taking you to your dashboard…
            </p>
          )}

          {(status === 'ready' || status === 'saving') && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">{error}</div>
              )}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input id="password" type="password" autoComplete="new-password" minLength={8} required
                  value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
              </div>
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input id="confirm" type="password" autoComplete="new-password" minLength={8} required
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
              </div>
              <button
                type="submit"
                disabled={status === 'saving'}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition duration-200"
              >
                {status === 'saving' ? 'Saving…' : 'Update Password'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
