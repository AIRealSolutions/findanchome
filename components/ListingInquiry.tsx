'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { BROKERAGE } from '@/lib/site';

const input = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent bg-white';

// Showing requests and questions about a listing. Posts to the consultation endpoint, so each one lands in
// the Leads CRM (/dashboard/leads) and emails Marc, tagged with the MLS number and the listing page.
export default function ListingInquiry({
  summary,
  county,
  sourcePage,
}: {
  summary: string;
  county: string | null;
  sourcePage: string;
}) {
  const [kind, setKind] = useState<'tour' | 'question'>('tour');
  const [form, setForm] = useState({ name: '', email: '', phone: '', when: '', message: '', company: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('sending');
    setError('');
    const lines = [
      kind === 'tour' ? `Showing request: ${summary}` : `Question about: ${summary}`,
      kind === 'tour' && form.when ? `Preferred time: ${form.when}` : '',
      form.message,
    ].filter(Boolean);
    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          preferredContact: form.phone ? 'call' : 'email',
          intent: ['buy'],
          counties: county ? [county] : [],
          message: lines.join('\n\n'),
          sourcePage,
          company: form.company,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'We could not send your request.');
      setState('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setState('idle');
    }
  }

  if (state === 'sent') {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <p className="font-bold text-[#1e3a8a] text-lg">Thanks, {form.name.split(' ')[0] || 'friend'}!</p>
        <p className="text-gray-700">{BROKERAGE.agent} will be in touch shortly. Need it sooner? Call {BROKERAGE.phone}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Request type">
        {(['tour', 'question'] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={kind === k}
            onClick={() => setKind(k)}
            className={`py-2 rounded-lg text-sm font-semibold border ${kind === k ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white' : 'bg-white border-gray-300 text-gray-700'}`}
          >
            {k === 'tour' ? 'Schedule a tour' : 'Ask a question'}
          </button>
        ))}
      </div>
      <input required placeholder="Your name" autoComplete="name" className={input} value={form.name} onChange={set('name')} maxLength={200} />
      <input required type="email" placeholder="Email" autoComplete="email" className={input} value={form.email} onChange={set('email')} maxLength={320} />
      <input type="tel" placeholder="Phone (optional)" autoComplete="tel" className={input} value={form.phone} onChange={set('phone')} maxLength={50} />
      {kind === 'tour' && (
        <input placeholder="When works for you? (e.g. Saturday morning)" className={input} value={form.when} onChange={set('when')} maxLength={200} />
      )}
      <textarea rows={3} placeholder={kind === 'tour' ? 'Anything else? (optional)' : 'Your question'} required={kind === 'question'}
        className={input} value={form.message} onChange={set('message')} maxLength={4000} />
      {/* Honeypot: hidden from people, bots fill it in. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" value={form.company} onChange={set('company')} aria-hidden="true" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={state === 'sending'} className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-60 inline-flex items-center justify-center gap-2">
        {state === 'sending' && <Loader2 className="w-4 h-4 animate-spin" />}
        {kind === 'tour' ? 'Request a Tour' : 'Send Question'}
      </button>
      <p className="text-xs text-gray-500">No account needed. Your request goes straight to {BROKERAGE.agent} at {BROKERAGE.name}.</p>
    </form>
  );
}
