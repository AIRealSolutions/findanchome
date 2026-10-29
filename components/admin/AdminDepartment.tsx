'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { PERIODS, periodRange, type PeriodKey } from '@/lib/finance';
import { staffName } from '@/lib/listings';
import { DEPARTMENTS, deptMeta, type DeptKey } from './departments';
import { NO_BRANCH, scopeToBranch, useAdminData, type AdminContext } from './useAdminData';
import { ExecutiveOverview, GoalsEditor } from './sections/Executive';
import { AssignOpportunities, Pipeline, Production } from './sections/Sales';
import { BrokerMarketing, LeadSources } from './sections/Marketing';
import { Commissions, Form1099, Ledger, ProfitAndLoss } from './sections/Accounting';
import { Branches, Licensing, Team } from './sections/Hr';
import { ClientService, Transactions } from './sections/Operations';

function readFilter(k: string) {
  try {
    return sessionStorage.getItem(`control-center-${k}`) ?? '';
  } catch {
    return '';
  }
}
function saveFilter(k: string, v: string) {
  try {
    sessionStorage.setItem(`control-center-${k}`, v);
  } catch {}
}

/** Lightkeeper Realty's Control Center, one department at a time. */
export default function AdminDepartment({ dept }: { dept: DeptKey }) {
  const router = useRouter();
  const params = useSearchParams();
  const { user, profile } = useAuth();
  const meta = deptMeta(dept)!;
  const tab = params.get('tab') && meta.tabs.some((t) => t.value === params.get('tab')) ? params.get('tab')! : meta.tabs[0].value;
  // The period, branch and broker filters follow you from department to department (this browser session).
  const [period, setPeriodState] = useState<PeriodKey>(() => (readFilter('period') as PeriodKey) || 'ytd');
  const [broker, setBrokerState] = useState(() => readFilter('broker'));
  const setPeriod = (p: PeriodKey) => { setPeriodState(p); saveFilter('period', p); };
  const setBroker = (b: string) => { setBrokerState(b); saveFilter('broker', b); };
  const [branch, setBranchState] = useState(() => readFilter('branch'));
  const setBranch = (b: string) => { setBranchState(b); saveFilter('branch', b); setBroker(''); };
  const { data, derived, loading, reload } = useAdminData();

  if (!data || !derived) return <p className="p-8 text-center text-gray-500 bg-white border border-gray-200 rounded-xl">Loading the control center…</p>;

  const { from, to } = periodRange(period);
  // A branch that has since been deleted falls back to company-wide.
  const activeBranch = branch === NO_BRANCH || data.branches.some((b) => b.id === branch) ? branch : '';
  const scoped = activeBranch ? scopeToBranch(data, activeBranch) : data;
  const activeBroker = scoped.finance.staff.some((s) => s.id === broker) ? broker : '';
  const ctx: AdminContext = {
    ...scoped, ...derived, from, to, broker: activeBroker || undefined, branch: activeBranch || undefined, reload,
    periodLabel: PERIODS.find((p) => p.value === period)!.label.toLowerCase(),
    nameOf: (id) => (id ? staffName(data.finance.staff.find((s) => s.id === id)) : 'Unassigned'),
    inPeriod: (iso) => !!iso && iso.slice(0, 10) >= from && iso.slice(0, 10) <= to,
    setBroker,
    setBranch,
  };
  const setTab = (t: string) => router.replace(t === meta.tabs[0].value ? meta.href : `${meta.href}?tab=${t}`);
  const view = `${dept}:${tab}`;

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-blue-700">Lightkeeper Realty · Control Center</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{meta.icon} {meta.label}</h1>
          <p className="mt-1 text-gray-600">{dept === 'executive' ? `Welcome back, ${profile?.first_name || 'Admin'}. ` : ''}{meta.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={period} onChange={(e) => setPeriod(e.target.value as PeriodKey)} aria-label="Period" className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
            {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          {data.branches.length > 0 && (
            <select value={activeBranch} onChange={(e) => setBranch(e.target.value)} aria-label="Branch" className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
              <option value="">All branches</option>
              {data.branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              <option value={NO_BRANCH}>No branch</option>
            </select>
          )}
          <select value={activeBroker} onChange={(e) => setBroker(e.target.value)} aria-label="Broker" className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
            <option value="">{activeBranch ? 'Whole branch' : 'Company-wide'}</option>
            {scoped.finance.staff.map((s) => <option key={s.id} value={s.id}>{staffName(s)}{s.id === user?.id ? ' (me)' : ''}</option>)}
          </select>
          <button onClick={reload} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Departments */}
      <nav aria-label="Departments" className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {DEPARTMENTS.map((d) => (
          <Link key={d.key} href={d.href} aria-current={d.key === dept ? 'page' : undefined}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm border ${d.key === dept ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'}`}>
            {d.icon} {d.label}
          </Link>
        ))}
      </nav>

      {data.finance.error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{data.finance.error}</div>}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto max-w-full">
          {meta.tabs.map((t) => (
            <button key={t.value} onClick={() => setTab(t.value)}
              className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${tab === t.value ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'}`}>
              {t.label}
            </button>
          ))}
        </div>
        {meta.tools.length > 0 && (
          <div className="flex flex-wrap gap-3 text-sm">
            {meta.tools.map((t) => <Link key={t.href} href={t.href} className="text-blue-600 hover:underline">{t.name} →</Link>)}
          </div>
        )}
      </div>

      {view === 'executive:overview' && <ExecutiveOverview ctx={ctx} />}
      {view === 'executive:goals' && <GoalsEditor ctx={ctx} />}
      {view === 'sales:production' && <Production ctx={ctx} />}
      {view === 'sales:pipeline' && <Pipeline ctx={ctx} />}
      {view === 'sales:assign' && <AssignOpportunities ctx={ctx} />}
      {view === 'marketing:sources' && <LeadSources ctx={ctx} />}
      {view === 'marketing:activity' && <BrokerMarketing ctx={ctx} />}
      {view === 'accounting:pl' && <ProfitAndLoss ctx={ctx} period={period} />}
      {view === 'accounting:commissions' && <Commissions ctx={ctx} />}
      {view === 'accounting:ledger' && <Ledger ctx={ctx} />}
      {view === 'accounting:1099' && <Form1099 ctx={ctx} />}
      {view === 'hr:team' && <Team ctx={ctx} />}
      {view === 'hr:licensing' && <Licensing ctx={ctx} />}
      {view === 'hr:branches' && <Branches ctx={ctx} />}
      {view === 'operations:transactions' && <Transactions ctx={ctx} />}
      {view === 'operations:service' && <ClientService ctx={ctx} />}
    </div>
  );
}
