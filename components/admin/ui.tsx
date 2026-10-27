'use client';

import Link from 'next/link';
import { formatMoney } from '@/lib/clients';

export const money = (n: number) => formatMoney(n) || '$0';

export function Tile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'good' | 'bad' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className={`text-2xl font-bold ${tone === 'bad' ? 'text-red-700' : tone === 'good' ? 'text-green-700' : 'text-gray-900'}`}>{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** A labelled progress bar (goals, caps). */
export function Progress({ label, value, target, format = money }: { label: string; value: number; target: number; format?: (n: number) => string }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-900 font-medium">{format(value)} <span className="text-gray-500 font-normal">/ {format(target)}</span></span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-gray-100 overflow-hidden" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={`h-full rounded-full ${pct >= 100 ? 'bg-green-600' : 'bg-blue-600'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** A needs-attention item with a severity and a link to where it gets fixed. */
export function Alert({ tone, children, href }: { tone: 'warn' | 'bad' | 'info'; children: React.ReactNode; href?: string }) {
  const cls = tone === 'bad' ? 'bg-red-50 border-red-200 text-red-900' : tone === 'warn' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-blue-50 border-blue-200 text-blue-900';
  const icon = tone === 'bad' ? '⛔' : tone === 'warn' ? '⚠️' : 'ℹ️';
  const body = <><span aria-hidden className="mr-2">{icon}</span>{children}{href && <span className="ml-1">→</span>}</>;
  return href
    ? <Link href={href} className={`block p-3 rounded-lg border text-sm hover:opacity-90 ${cls}`}>{body}</Link>
    : <div className={`p-3 rounded-lg border text-sm ${cls}`}>{body}</div>;
}
