// Lightkeeper Realty's admin is organized by department. Each department has an overview page in the
// Control Center (/dashboard/dept/<key>; Executive is /dashboard) and the day-to-day tools that belong to it.

export type DeptKey = 'executive' | 'sales' | 'marketing' | 'accounting' | 'hr' | 'operations';

export interface Department {
  key: DeptKey;
  label: string;
  icon: string;
  href: string;
  summary: string;
  tabs: { value: string; label: string }[];
  /** Day-to-day tools listed under the department in the sidebar. */
  tools: { name: string; href: string }[];
}

export const DEPARTMENTS: Department[] = [
  {
    key: 'executive', label: 'Executive', icon: '🏛️', href: '/dashboard',
    summary: 'The whole company at a glance: profit, production, goals, and what needs your attention.',
    tabs: [{ value: 'overview', label: 'Overview' }, { value: 'goals', label: 'Goals' }],
    tools: [],
  },
  {
    key: 'sales', label: 'Sales', icon: '🤝', href: '/dashboard/dept/sales',
    summary: 'Production by broker and the pipeline from first lead to closing.',
    tabs: [
      { value: 'production', label: 'Production by broker' },
      { value: 'pipeline', label: 'Pipeline & conversion' },
      { value: 'assign', label: 'Assign opportunities' },
    ],
    tools: [
      { name: 'Listings', href: '/dashboard/listings' },
      { name: 'Snap a house', href: '/dashboard/listings/capture' },
      { name: 'Leads', href: '/dashboard/leads' },
      { name: 'Clients', href: '/dashboard/clients' },
      { name: 'Deals', href: '/dashboard/deals' },
      { name: 'Calendar', href: '/dashboard/calendar' },
    ],
  },
  {
    key: 'marketing', label: 'Marketing', icon: '📣', href: '/dashboard/dept/marketing',
    summary: 'Where business comes from, and how actively each broker is promoting.',
    tabs: [{ value: 'sources', label: 'Lead sources' }, { value: 'activity', label: 'Broker marketing' }],
    tools: [
      { name: 'Marketing hub', href: '/dashboard/marketing' },
      { name: 'Properties', href: '/dashboard/properties' },
    ],
  },
  {
    key: 'accounting', label: 'Accounting', icon: '📒', href: '/dashboard/dept/accounting',
    summary: 'Profit & loss, income and expenses, commissions received and paid, and 1099s.',
    tabs: [
      { value: 'pl', label: 'Profit & loss' },
      { value: 'commissions', label: 'Commissions' },
      { value: 'ledger', label: 'Income & expenses' },
      { value: '1099', label: '1099s' },
    ],
    tools: [],
  },
  {
    key: 'hr', label: 'HR & Licensing', icon: '🪪', href: '/dashboard/dept/hr',
    summary: 'Your brokers and branches: roles, commission plans, licenses, continuing education and paperwork.',
    tabs: [{ value: 'team', label: 'Team & plans' }, { value: 'branches', label: 'Branches' }, { value: 'licensing', label: 'Licensing & compliance' }],
    tools: [],
  },
  {
    key: 'operations', label: 'Operations', icon: '⚙️', href: '/dashboard/dept/operations',
    summary: 'Transaction health: missing information, overdue checklist items, money deadlines and client service.',
    tabs: [{ value: 'transactions', label: 'Transactions' }, { value: 'service', label: 'Client service' }],
    tools: [],
  },
];

export const deptMeta = (k: string) => DEPARTMENTS.find((d) => d.key === k);
