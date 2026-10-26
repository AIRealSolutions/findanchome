'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatMoney } from '@/lib/clients';
import type { Deal } from '@/lib/deals';
import { defaultPlan, projectedMoney, type BrokerPlan } from '@/lib/finance';
import { fetchStaff, staffName, type StaffMember } from '@/lib/listings';

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';

/** Who the deal belongs to and how its commission splits between the broker and the company. */
export default function DealMoney({ deal, onChanged }: { deal: Deal; onChanged: () => void }) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [plan, setPlan] = useState<BrokerPlan | null>(null);
  const [gross, setGross] = useState(deal.gross_commission == null ? '' : String(deal.gross_commission));
  const [referral, setReferral] = useState(deal.referral_fee_pct == null ? '' : String(deal.referral_fee_pct));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchStaff().then((s) => !cancelled && setStaff(s));
    return () => {
      cancelled = true;
    };
  }, []);

  // Admins see every plan; a broker sees only their own. Without one, the default plan applies.
  useEffect(() => {
    if (!deal.broker_id) return;
    let cancelled = false;
    createClient().from('fanc_broker_plans').select('*').eq('broker_id', deal.broker_id).maybeSingle()
      .then(({ data }) => !cancelled && setPlan((data as BrokerPlan | null) ?? null));
    return () => {
      cancelled = true;
    };
  }, [deal.broker_id]);

  const update = async (updates: Partial<Deal>) => {
    setBusy(true);
    const { error: err } = await createClient().from('fanc_deals').update(updates).eq('id', deal.id);
    setBusy(false);
    if (err) return setError(err.message);
    setError('');
    onChanged();
  };
  const num = (v: string) => {
    const n = Number(v.replace(/[$,%\s]/g, ''));
    return v.trim() && Number.isFinite(n) ? n : null;
  };

  const role = staff.find((s) => s.id === deal.broker_id)?.role ?? 'broker';
  const effective = plan ?? defaultPlan(deal.broker_id ?? '', role);
  const m = projectedMoney({ ...deal, gross_commission: num(gross), referral_fee_pct: num(referral) }, () => effective);
  const dirty = num(gross) !== deal.gross_commission || num(referral) !== deal.referral_fee_pct;

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Broker & commission</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="text-sm">
          <span className="block text-gray-500 mb-1">Broker</span>
          <select value={deal.broker_id ?? ''} disabled={busy} onChange={(e) => update({ broker_id: e.target.value || null })} className={`${inputCls} bg-white`}>
            <option value="">Unassigned</option>
            {staff.map((s) => <option key={s.id} value={s.id}>{staffName(s)}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-gray-500 mb-1">Actual commission $</span>
          <input inputMode="decimal" value={gross} onChange={(e) => setGross(e.target.value)} placeholder={m.gci && !num(gross) ? `≈ ${formatMoney(m.gci)}` : '$'} className={inputCls} />
        </label>
        <label className="text-sm">
          <span className="block text-gray-500 mb-1">Referral fee paid out %</span>
          <input inputMode="decimal" value={referral} onChange={(e) => setReferral(e.target.value)} placeholder="e.g. 25" className={inputCls} />
        </label>
      </div>
      {dirty && (
        <button disabled={busy} onClick={() => update({ gross_commission: num(gross), referral_fee_pct: num(referral) })}
          className="mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">Save commission</button>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {m.gci > 0 ? (
        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          {[
            ['Gross commission', m.gci],
            ['Referral fee', -m.referralFee],
            [`Broker (${m.splitPct}% split)`, m.agentPayout],
            ['Company dollar', m.companyDollar],
          ].map(([k, v]) => (
            <div key={k as string} className="p-3 bg-gray-50 rounded-lg">
              <dt className="text-xs text-gray-500">{k}</dt>
              <dd className="font-semibold text-gray-900">{(v as number) < 0 ? `(${formatMoney(-(v as number))})` : formatMoney(v as number) || '$0'}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-3 text-sm text-gray-500">Enter a price and commission % (or the actual commission) to see the split.</p>
      )}
      <p className="mt-2 text-xs text-gray-500">
        {deal.agent_split_pct != null ? 'Split locked in at closing.' : plan ? 'From the broker’s commission plan; locked in when the deal closes.' : 'Default plan; the admin sets broker plans in the Control Center.'}
        {m.transactionFee > 0 && ` Includes a ${formatMoney(m.transactionFee)} transaction fee.`}
      </p>
    </section>
  );
}
