// Company money for the control center (/dashboard for admins) and brokers' own earnings.
// Commission flows: gross commission (GCI) → less referral fees paid out → net → split between the broker
// (their plan's split, until the company dollar reaches the plan's annual cap) and the company → the
// transaction fee comes out of the broker's share. Desk fees and ledger income/expenses complete the P&L.
// Plans, the ledger and splits: see supabase-migrations/control_center.sql.

import { createClient } from './supabase/client';
import { addDaysYmd, toYmd } from './calendar';
import { OPEN_STAGES, dealCommission, dealPrice, type Deal } from './deals';

export interface BrokerPlan {
  broker_id: string;
  split_pct: number;
  annual_cap: number | null;
  transaction_fee: number;
  monthly_fee: number;
  starts_on: string;
  notes: string | null;
}

export interface LedgerEntry {
  id: string;
  created_at: string;
  entry_date: string;
  kind: 'income' | 'expense';
  category: string;
  amount: number;
  description: string | null;
  broker_id: string | null;
  /** Branch the entry is booked to; null = company-wide. */
  office_id: string | null;
  deal_id: string | null;
}

export const INCOME_CATEGORIES = ['Referral income (USAHUDhomes, etc.)', 'Broker price opinions', 'Property management', 'Other income'];
export const EXPENSE_CATEGORIES = [
  'Advertising & marketing', 'Lead generation', 'MLS & board dues', 'E&O insurance', 'Licenses & education',
  'Office & rent', 'Software & technology', 'Signs & supplies', 'Professional services', 'Travel & vehicle',
  'Broker bonuses', 'Other expense',
];

/** No plan on file: the principal broker's own deals stay with the company; other brokers get 70%. */
export const defaultPlan = (brokerId: string, role: string): BrokerPlan => ({
  broker_id: brokerId, split_pct: role === 'admin' ? 0 : 70, annual_cap: null, transaction_fee: 0, monthly_fee: 0,
  starts_on: '2000-01-01', notes: null,
});

export interface DealMoney {
  gci: number;
  referralFee: number;
  net: number;
  transactionFee: number;
  /** What the broker takes home from this deal. */
  agentPayout: number;
  /** What the company keeps (including the transaction fee). */
  companyDollar: number;
  splitPct: number;
}

export const dealGci = (d: Pick<Deal, 'gross_commission' | 'contract_price' | 'list_price' | 'commission_pct'>) =>
  d.gross_commission ?? dealCommission(d) ?? 0;

function money(d: Deal, plan: BrokerPlan, capLeft: number | null): DealMoney {
  const gci = dealGci(d);
  const referralFee = (gci * (d.referral_fee_pct ?? 0)) / 100;
  const net = gci - referralFee;
  const splitPct = d.agent_split_pct ?? plan.split_pct;
  let company = (net * (100 - splitPct)) / 100;
  if (capLeft != null) company = Math.min(company, Math.max(0, capLeft));
  const agentShare = net - company;
  const transactionFee = gci > 0 ? Math.min(d.transaction_fee ?? plan.transaction_fee, agentShare) : 0;
  return { gci, referralFee, net, transactionFee, agentPayout: agentShare - transactionFee, companyDollar: company + transactionFee, splitPct };
}

export type PlanLookup = (brokerId: string | null) => BrokerPlan;

export function planLookup(plans: BrokerPlan[], roles: Map<string, string>): PlanLookup {
  const byId = new Map(plans.map((p) => [p.broker_id, p]));
  return (id) => (id && byId.get(id)) || defaultPlan(id ?? '', id ? roles.get(id) ?? 'broker' : 'admin');
}

/**
 * Money for every closed deal. Caps count the company dollar each broker has paid in the deal's calendar year,
 * in closing order, so it has to see all of a year's closings, not just the period on screen.
 */
export function closedDealMoney(deals: Deal[], plan: PlanLookup) {
  const out = new Map<string, DealMoney>();
  const paid = new Map<string, number>(); // broker|year → company dollar so far
  const closed = deals.filter((d) => d.stage === 'closed' && d.closing_date).sort((a, b) => a.closing_date!.localeCompare(b.closing_date!));
  for (const d of closed) {
    const p = plan(d.broker_id);
    const key = `${d.broker_id}|${d.closing_date!.slice(0, 4)}`;
    const used = paid.get(key) ?? 0;
    const m = money(d, p, p.annual_cap != null ? p.annual_cap - used : null);
    paid.set(key, used + m.companyDollar - m.transactionFee);
    out.set(d.id, m);
  }
  return out;
}

/** Projected money for a deal still in progress (current plan; caps not applied). */
export const projectedMoney = (d: Deal, plan: PlanLookup) => money(d, plan(d.broker_id), null);

// ───────────────────────── Periods ─────────────────────────

export type PeriodKey = 'month' | 'quarter' | 'ytd' | 'last12' | 'last_year';
export const PERIODS: { value: PeriodKey; label: string }[] = [
  { value: 'month', label: 'This month' },
  { value: 'quarter', label: 'This quarter' },
  { value: 'ytd', label: 'Year to date' },
  { value: 'last12', label: 'Last 12 months' },
  { value: 'last_year', label: 'Last year' },
];

export function periodRange(key: PeriodKey, now = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth();
  const today = toYmd(now);
  switch (key) {
    case 'month': return { from: toYmd(new Date(y, m, 1)), to: today };
    case 'quarter': return { from: toYmd(new Date(y, m - (m % 3), 1)), to: today };
    case 'ytd': return { from: `${y}-01-01`, to: today };
    case 'last12': return { from: addDaysYmd(toYmd(new Date(y - 1, m, now.getDate())), 1), to: today };
    case 'last_year': return { from: `${y - 1}-01-01`, to: `${y - 1}-12-31` };
  }
}

const inRange = (d: string | null, from: string, to: string) => !!d && d.slice(0, 10) >= from && d.slice(0, 10) <= to;

/** First days of each month in [from, to]. */
function monthsIn(from: string, to: string) {
  const out: string[] = [];
  const d = new Date(+from.slice(0, 4), +from.slice(5, 7) - 1, 1);
  while (toYmd(d) <= to) {
    out.push(toYmd(d));
    d.setMonth(d.getMonth() + 1);
  }
  return out;
}

/** Desk fees owed for the months in a period that the plan was active and that have started. */
function deskFees(plans: BrokerPlan[], from: string, to: string, brokerId?: string) {
  const today = toYmd(new Date());
  return plans
    .filter((p) => p.monthly_fee > 0 && (!brokerId || p.broker_id === brokerId))
    .reduce((sum, p) => sum + monthsIn(from, to).filter((m) => m <= today && m >= p.starts_on.slice(0, 8) + '01').length * p.monthly_fee, 0);
}

// ───────────────────────── Reports ─────────────────────────

export interface FinanceData {
  deals: Deal[];
  plans: BrokerPlan[];
  ledger: LedgerEntry[];
  staff: { id: string; first_name: string | null; last_name: string | null; role: string }[];
  error: string;
}

export async function fetchFinance(): Promise<FinanceData> {
  const supabase = createClient();
  const [deals, plans, ledger, staff] = await Promise.all([
    supabase.from('fanc_deals').select('*').limit(5000),
    supabase.from('fanc_broker_plans').select('*'),
    supabase.from('fanc_ledger').select('*').order('entry_date', { ascending: false }).limit(5000),
    supabase.rpc('fanc_staff_directory'),
  ]);
  return {
    deals: (deals.data ?? []) as Deal[],
    plans: (plans.data ?? []) as BrokerPlan[],
    ledger: (ledger.data ?? []) as LedgerEntry[],
    staff: (staff.data ?? []) as FinanceData['staff'],
    error: (deals.error || plans.error || ledger.error || staff.error)?.message ?? '',
  };
}

export interface ProfitAndLoss {
  gci: number;
  referralFees: number;
  agentPayouts: number;
  companyDollar: number;
  transactionFees: number;
  deskFees: number;
  otherIncome: number;
  incomeByCategory: [string, number][];
  expenses: number;
  expensesByCategory: [string, number][];
  revenue: number;
  netProfit: number;
}

const groupSum = (rows: LedgerEntry[]) =>
  [...rows.reduce((m, r) => m.set(r.category, (m.get(r.category) ?? 0) + Number(r.amount)), new Map<string, number>())].sort((a, b) => b[1] - a[1]);

export function profitAndLoss(data: FinanceData, money: Map<string, DealMoney>, from: string, to: string, brokerId?: string): ProfitAndLoss {
  const closed = data.deals.filter((d) => d.stage === 'closed' && inRange(d.closing_date, from, to) && (!brokerId || d.broker_id === brokerId));
  const sum = (f: (m: DealMoney) => number) => closed.reduce((n, d) => n + f(money.get(d.id)!), 0);
  const ledger = data.ledger.filter((e) => inRange(e.entry_date, from, to) && (!brokerId || e.broker_id === brokerId));
  const income = ledger.filter((e) => e.kind === 'income');
  const spend = ledger.filter((e) => e.kind === 'expense');
  const companyDollar = sum((m) => m.companyDollar);
  const desk = deskFees(data.plans, from, to, brokerId);
  const otherIncome = income.reduce((n, e) => n + Number(e.amount), 0);
  const expenses = spend.reduce((n, e) => n + Number(e.amount), 0);
  const revenue = companyDollar + desk + otherIncome;
  return {
    gci: sum((m) => m.gci), referralFees: sum((m) => m.referralFee), agentPayouts: sum((m) => m.agentPayout),
    companyDollar, transactionFees: sum((m) => m.transactionFee), deskFees: desk, otherIncome,
    incomeByCategory: groupSum(income), expenses, expensesByCategory: groupSum(spend), revenue, netProfit: revenue - expenses,
  };
}

/** Company revenue, expenses and net profit per month of a calendar year. */
export function monthlySeries(data: FinanceData, money: Map<string, DealMoney>, year: number, brokerId?: string) {
  return Array.from({ length: 12 }, (_, i) => {
    const from = toYmd(new Date(year, i, 1));
    const to = toYmd(new Date(year, i + 1, 0));
    const pl = profitAndLoss(data, money, from, to, brokerId);
    return { month: i, label: new Date(year, i, 1).toLocaleDateString(undefined, { month: 'short' }), revenue: pl.revenue, expenses: pl.expenses, net: pl.netProfit, gci: pl.gci };
  });
}

export function salesStats(data: FinanceData, money: Map<string, DealMoney>, plan: PlanLookup, from: string, to: string, brokerId?: string) {
  const mine = data.deals.filter((d) => !brokerId || d.broker_id === brokerId);
  const closed = mine.filter((d) => d.stage === 'closed' && inRange(d.closing_date, from, to));
  const pending = mine.filter((d) => OPEN_STAGES.includes(d.stage) && d.stage !== 'active');
  const volume = closed.reduce((n, d) => n + (dealPrice(d) ?? 0), 0);
  const days = closed.filter((d) => d.effective_date).map((d) => (+new Date(d.closing_date!) - +new Date(d.effective_date!)) / 86400000);
  const projected = pending.map((d) => projectedMoney(d, plan));
  return {
    units: closed.length,
    sides: {
      buyer: closed.filter((d) => d.side === 'buyer').length + closed.filter((d) => d.side === 'both').length,
      seller: closed.filter((d) => d.side === 'seller').length + closed.filter((d) => d.side === 'both').length,
    },
    volume,
    avgPrice: closed.length ? volume / closed.length : 0,
    avgDaysToClose: days.length ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : null,
    hud: closed.filter((d) => d.is_hud).length,
    fellThrough: mine.filter((d) => d.stage === 'fell_through' && inRange(d.updated_at, from, to)).length,
    activeListings: mine.filter((d) => d.stage === 'active' && d.side !== 'buyer').length,
    activeBuyers: mine.filter((d) => d.stage === 'active' && d.side !== 'seller').length,
    pendingUnits: pending.length,
    pendingVolume: pending.reduce((n, d) => n + (dealPrice(d) ?? 0), 0),
    pendingGci: projected.reduce((n, m) => n + m.gci, 0),
    pendingCompanyDollar: projected.reduce((n, m) => n + m.companyDollar, 0),
    pendingAgentPayout: projected.reduce((n, m) => n + m.agentPayout, 0),
    earnings: closed.reduce((n, d) => n + (money.get(d.id)?.agentPayout ?? 0), 0),
  };
}

/** How much of the annual cap a broker has paid this year. */
export function capProgress(data: FinanceData, money: Map<string, DealMoney>, plan: BrokerPlan, year = new Date().getFullYear()) {
  if (plan.annual_cap == null) return null;
  const paid = data.deals
    .filter((d) => d.stage === 'closed' && d.broker_id === plan.broker_id && d.closing_date?.startsWith(String(year)))
    .reduce((n, d) => n + (money.get(d.id)!.companyDollar - money.get(d.id)!.transactionFee), 0);
  return { paid, cap: plan.annual_cap, pct: plan.annual_cap ? Math.min(100, (paid / plan.annual_cap) * 100) : 100 };
}

export const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : '—');
