'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toYmd } from '@/lib/calendar';
import { formatDate } from '@/lib/clients';
import { staffName } from '@/lib/listings';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, pct, type FinanceData, type profitAndLoss } from '@/lib/finance';
import { Card, money } from '../ui';

function Row({ k, v, bold, indent, neg }: { k: string; v: number; bold?: boolean; indent?: boolean; neg?: boolean }) {
  return (
    <div className={`flex justify-between py-1.5 ${bold ? 'font-semibold border-t border-gray-200' : ''} ${indent ? 'pl-4 text-gray-700' : ''}`}>
      <span>{k}</span><span className={v < 0 ? 'text-red-700' : ''}>{neg && v ? `(${money(v)})` : money(v)}</span>
    </div>
  );
}

export function ProfitAndLossView({ pl, label }: { pl: NonNullable<ReturnType<typeof profitAndLoss>>; label: string }) {
  return (
    <Card title="Profit & loss statement">
      <p className="text-sm text-gray-500 mb-4">{label}</p>
      <div className="max-w-xl text-sm">
        <p className="font-semibold text-gray-900">Commission income</p>
        <Row k="Gross commission income" v={pl.gci} indent />
        <Row k="Less referral fees paid" v={pl.referralFees} indent neg />
        <Row k="Less broker commissions" v={pl.agentPayouts} indent neg />
        <Row k="Company dollar" v={pl.companyDollar} bold />
        <p className="text-xs text-gray-500 pl-4">Includes {money(pl.transactionFees)} in transaction fees</p>
        <p className="mt-4 font-semibold text-gray-900">Other income</p>
        <Row k="Broker desk fees" v={pl.deskFees} indent />
        {pl.incomeByCategory.map(([k, v]) => <Row key={k} k={k} v={v} indent />)}
        <Row k="Total revenue" v={pl.revenue} bold />
        <p className="mt-4 font-semibold text-gray-900">Expenses</p>
        {pl.expensesByCategory.length === 0 && <p className="pl-4 py-1.5 text-gray-500">None recorded</p>}
        {pl.expensesByCategory.map(([k, v]) => <Row key={k} k={k} v={v} indent />)}
        <Row k="Total expenses" v={pl.expenses} bold />
        <div className={`mt-4 flex justify-between py-2 px-3 rounded-lg text-base font-bold ${pl.netProfit < 0 ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-900'}`}>
          <span>Net profit</span><span>{money(pl.netProfit)}</span>
        </div>
        <p className="mt-2 text-xs text-gray-500">Margin {pct(pl.netProfit, pl.revenue)} of revenue. Cash basis: commissions count on the closing date.</p>
      </div>
    </Card>
  );
}

export function LedgerView({ data, from, to, broker, onChanged, nameOf }: {
  data: FinanceData; from: string; to: string; broker?: string; onChanged: () => void; nameOf: (id: string | null) => string;
}) {
  const [form, setForm] = useState({ entry_date: toYmd(new Date()), kind: 'expense' as 'income' | 'expense', category: EXPENSE_CATEGORIES[0], amount: '', description: '', broker_id: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const rows = data.ledger.filter((e) => e.entry_date >= from && e.entry_date <= to && (!broker || e.broker_id === broker));
  const cats = form.kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount.replace(/[$,\s]/g, ''));
    if (!(amount > 0)) return setError('Enter an amount');
    setBusy(true);
    const { error: err } = await createClient().from('fanc_ledger').insert({
      entry_date: form.entry_date, kind: form.kind, category: form.category, amount, description: form.description.trim() || null, broker_id: form.broker_id || null,
    });
    setBusy(false);
    if (err) return setError(err.message);
    setError('');
    setForm({ ...form, amount: '', description: '' });
    onChanged();
  };
  const remove = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    await createClient().from('fanc_ledger').delete().eq('id', id);
    onChanged();
  };

  return (
    <div className="space-y-6">
      <Card title="Record income or an expense">
        <form onSubmit={add} className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3 text-sm">
          <input type="date" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" />
          <select value={form.kind} onChange={(e) => { const kind = e.target.value as 'income' | 'expense'; setForm({ ...form, kind, category: (kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)[0] }); }}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white"><option value="expense">Expense</option><option value="income">Income</option></select>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg bg-white lg:col-span-2">
            {cats.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Amount $" className="px-3 py-2 border border-gray-300 rounded-lg" />
          <select value={form.broker_id} onChange={(e) => setForm({ ...form, broker_id: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
            <option value="">Company</option>
            {data.staff.map((s) => <option key={s.id} value={s.id}>{staffName(s)}</option>)}
          </select>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description (vendor, what it was for)" className="px-3 py-2 border border-gray-300 rounded-lg sm:col-span-2 lg:col-span-5" />
          <button disabled={busy} className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">Add</button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </Card>
      <Card title={`Entries (${rows.length})`}>
        {rows.length === 0 ? <p className="text-sm text-gray-500">Nothing recorded in this period.</p> : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm min-w-[640px]">
              <tbody className="divide-y divide-gray-100">
                {rows.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2 pr-3 whitespace-nowrap text-gray-600">{formatDate(e.entry_date)}</td>
                    <td className="pr-3">{e.category}<div className="text-xs text-gray-500">{e.description}</div></td>
                    <td className="pr-3 text-gray-600">{e.broker_id ? nameOf(e.broker_id) : 'Company'}</td>
                    <td className={`pr-3 text-right font-medium ${e.kind === 'expense' ? 'text-gray-900' : 'text-green-800'}`}>{e.kind === 'expense' ? `(${money(Number(e.amount))})` : money(Number(e.amount))}</td>
                    <td className="text-right"><button onClick={() => remove(e.id)} aria-label="Delete entry" className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

