'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toYmd } from '@/lib/calendar';
import { capProgress, defaultPlan, type BrokerPlan, type FinanceData, type closedDealMoney } from '@/lib/finance';
import { Card, money } from '../ui';
import type { AdminData } from '../useAdminData';
import type { Branch } from '@/lib/branches';

export function TeamView({ data, profiles, branches, meId, onChanged, dm }: {
  data: FinanceData; profiles: AdminData['profiles']; branches: Branch[]; meId: string; onChanged: () => void; dm: ReturnType<typeof closedDealMoney>;
}) {
  const [error, setError] = useState('');
  const staff = profiles.filter((p) => p.role !== 'client');
  const clients = profiles.filter((p) => p.role === 'client');

  const setRole = async (id: string, role: string) => {
    if (id === meId && role !== 'admin' && !confirm('Remove your own admin access?')) return;
    const { error: err } = await createClient().from('fanc_user_profiles').update({ role }).eq('id', id);
    if (err) setError(err.message);
    onChanged();
  };
  const setBranch = async (id: string, officeId: string) => {
    const { error: err } = await createClient().from('fanc_user_profiles').update({ office_id: officeId || null }).eq('id', id);
    if (err) setError(err.message);
    onChanged();
  };

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
      <Card title="Brokers & commission plans">
        <div className="space-y-4">
          {staff.map((p) => (
            <PlanEditor key={p.id} person={p} plan={data.plans.find((x) => x.broker_id === p.id)} meId={meId} onChanged={onChanged} onRole={setRole} branches={branches} onBranch={setBranch}
              cap={capProgress(data, dm, data.plans.find((x) => x.broker_id === p.id) ?? defaultPlan(p.id, p.role))} />
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500">
          To add a broker: create their login in Supabase (Authentication → Add user), have them sign in once, then promote them below.
        </p>
      </Card>
      <Card title={`Client accounts (${clients.length})`}>
        {clients.length === 0 ? <p className="text-sm text-gray-500">No client logins yet.</p> : (
          <ul className="divide-y divide-gray-100 text-sm">
            {clients.map((p) => (
              <li key={p.id} className="py-2 flex items-center justify-between gap-2">
                <span>{[p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unnamed'}</span>
                <button onClick={() => setRole(p.id, 'broker')} className="text-xs text-blue-600 hover:underline">Make broker</button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function PlanEditor({ person, plan, meId, onChanged, onRole, branches, onBranch, cap }: {
  person: AdminData['profiles'][number]; plan?: BrokerPlan; meId: string; onChanged: () => void;
  onRole: (id: string, role: string) => void; branches: Branch[]; onBranch: (id: string, officeId: string) => void; cap: ReturnType<typeof capProgress>;
}) {
  const base = plan ?? defaultPlan(person.id, person.role);
  const [f, setF] = useState({
    split_pct: String(base.split_pct), annual_cap: base.annual_cap == null ? '' : String(base.annual_cap),
    transaction_fee: String(base.transaction_fee), monthly_fee: String(base.monthly_fee), starts_on: plan?.starts_on ?? toYmd(new Date()),
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const num = (v: string) => Number(v.replace(/[$,%\s]/g, '')) || 0;

  const save = async () => {
    setBusy(true);
    const { error } = await createClient().from('fanc_broker_plans').upsert({
      broker_id: person.id, split_pct: Math.min(100, num(f.split_pct)), annual_cap: f.annual_cap.trim() ? num(f.annual_cap) : null,
      transaction_fee: num(f.transaction_fee), monthly_fee: num(f.monthly_fee), starts_on: f.starts_on,
    });
    setBusy(false);
    setMsg(error ? error.message : 'Saved');
    if (!error) onChanged();
  };
  const field = (k: keyof typeof f, label: string, hint?: string) => (
    <label className="text-xs text-gray-600">{label}
      <input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} type={k === 'starts_on' ? 'date' : 'text'} inputMode={k === 'starts_on' ? undefined : 'decimal'}
        placeholder={hint} className="mt-0.5 w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900" />
    </label>
  );

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <span className="font-medium text-gray-900">{[person.first_name, person.last_name].filter(Boolean).join(' ') || 'Unnamed'}{person.id === meId && ' (me)'}</span>
          {!plan && <span className="ml-2 text-xs text-amber-700">Using the default plan</span>}
          {cap && <span className="ml-2 text-xs text-gray-500">Cap: {money(cap.paid)} of {money(cap.cap)} paid this year</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          {branches.length > 0 && (
            <select value={person.office_id ?? ''} onChange={(e) => onBranch(person.id, e.target.value)} aria-label="Branch" className="px-2 py-1 border border-gray-300 rounded-lg bg-white text-sm">
              <option value="">No branch</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}
          <select value={person.role} onChange={(e) => onRole(person.id, e.target.value)} aria-label="Role" className="px-2 py-1 border border-gray-300 rounded-lg bg-white text-sm">
            <option value="admin">Admin</option><option value="broker">Broker</option><option value="client">Client (remove access)</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {field('split_pct', 'Broker split %', '70')}
        {field('annual_cap', 'Annual cap $', 'none')}
        {field('transaction_fee', 'Transaction fee $')}
        {field('monthly_fee', 'Monthly desk fee $')}
        {field('starts_on', 'Plan starts')}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button disabled={busy} onClick={save} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">Save plan</button>
        {msg && <span className={`text-xs ${msg === 'Saved' ? 'text-green-700' : 'text-red-600'}`}>{msg}</span>}
      </div>
    </div>
  );
}

