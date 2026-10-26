'use client';

import { useState } from 'react';
import { formatMoney } from '@/lib/clients';

type Point = { label: string; revenue: number; expenses: number; net: number };

// Categorical slots 1 and 2 of the validated reference palette (blue, orange): an adjacent pair that passes
// the CVD and normal-vision checks on a light surface.
const SERIES = [
  { key: 'revenue' as const, label: 'Company revenue', color: '#2a78d6' },
  { key: 'expenses' as const, label: 'Expenses', color: '#eb6834' },
];

const compact = (n: number) =>
  Math.abs(n) >= 1000 ? `$${(n / 1000).toLocaleString(undefined, { maximumFractionDigits: n % 1000 ? 1 : 0 })}k` : `$${Math.round(n)}`;

/** Company revenue vs expenses by month, with a hover tooltip per month and a table view. */
export default function MonthlyChart({ data, year }: { data: Point[]; year: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const max = Math.max(1, ...data.flatMap((d) => [d.revenue, d.expenses]));
  // Round the axis top to a tidy step.
  const step = 10 ** Math.floor(Math.log10(max));
  const top = Math.ceil(max / step) * step;
  const ticks = [0, top / 2, top];
  const W = 720, H = 220, padL = 48, padB = 24, padT = 8;
  const plotH = H - padB - padT;
  const band = (W - padL) / 12;
  const barW = Math.min(14, (band - 10) / 2);
  const y = (v: number) => padT + plotH - (v / top) * plotH;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex gap-4 text-sm text-gray-700">
          {SERIES.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: s.color }} aria-hidden /> {s.label}
            </span>
          ))}
        </div>
        <button onClick={() => setTable(!table)} className="text-xs text-blue-600 hover:underline">{table ? 'Show chart' : 'Show as table'}</button>
      </div>

      {table ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500"><th className="py-1 pr-3">{year}</th><th className="pr-3 text-right">Revenue</th><th className="pr-3 text-right">Expenses</th><th className="text-right">Net profit</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((d) => (
                <tr key={d.label}><td className="py-1 pr-3">{d.label}</td><td className="pr-3 text-right">{formatMoney(d.revenue)}</td><td className="pr-3 text-right">{formatMoney(d.expenses)}</td>
                  <td className={`text-right ${d.net < 0 ? 'text-red-700' : 'text-gray-900'}`}>{formatMoney(d.net)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Company revenue and expenses by month, ${year}`}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={padL} x2={W} y1={y(t)} y2={y(t)} stroke="#e5e7eb" strokeWidth={1} />
                <text x={padL - 6} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#6b7280">{compact(t)}</text>
              </g>
            ))}
            {data.map((d, i) => {
              const x0 = padL + i * band + (band - (barW * 2 + 2)) / 2;
              return (
                <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                  {/* Hit target covers the whole month, bigger than the bars. */}
                  <rect x={padL + i * band} y={padT} width={band} height={plotH} fill={hover === i ? '#f3f4f6' : 'transparent'} />
                  {SERIES.map((s, j) => {
                    const v = d[s.key];
                    const h = (v / top) * plotH;
                    if (h <= 0) return null;
                    const r = Math.min(4, h, barW / 2);
                    const x = x0 + j * (barW + 2);
                    const yt = y(v);
                    // Rounded data end, square at the baseline.
                    return <path key={s.key} fill={s.color}
                      d={`M${x},${padT + plotH} V${yt + r} Q${x},${yt} ${x + r},${yt} H${x + barW - r} Q${x + barW},${yt} ${x + barW},${yt + r} V${padT + plotH} Z`} />;
                  })}
                  <text x={padL + i * band + band / 2} y={H - 6} textAnchor="middle" fontSize={11} fill="#6b7280">{d.label}</text>
                </g>
              );
            })}
            <line x1={padL} x2={W} y1={padT + plotH} y2={padT + plotH} stroke="#9ca3af" strokeWidth={1} />
          </svg>
          {hover != null && (
            <div className="pointer-events-none absolute top-0 z-10 bg-white border border-gray-200 shadow-lg rounded-lg px-3 py-2 text-xs"
              style={{ left: `clamp(0px, calc(${((padL + hover * band + band / 2) / W) * 100}% - 70px), calc(100% - 150px))` }}>
              <p className="font-semibold text-gray-900 mb-1">{data[hover].label} {year}</p>
              {SERIES.map((s) => (
                <p key={s.key} className="flex items-center gap-1.5 text-gray-700">
                  <span className="w-2 h-2 rounded-sm" style={{ background: s.color }} /> {s.label}: <span className="text-gray-900 font-medium">{formatMoney(data[hover][s.key])}</span>
                </p>
              ))}
              <p className="mt-1 pt-1 border-t border-gray-100 text-gray-700">Net profit: <span className={`font-medium ${data[hover].net < 0 ? 'text-red-700' : 'text-gray-900'}`}>{formatMoney(data[hover].net)}</span></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
