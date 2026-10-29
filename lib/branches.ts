// Lightkeeper Realty's branch offices (fanc_offices). Deals, leads, listing opportunities and ledger entries carry a
// branch that follows their broker unless set by hand; see supabase-migrations/branches.sql.

import { createClient } from './supabase/client';

export interface Branch {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  phone: string | null;
  manager_id: string | null;
  is_main: boolean;
}

export type BranchInput = Omit<Branch, 'id'>;

export const emptyBranch = (): BranchInput => ({
  name: '', address: null, city: null, state: 'NC', zip_code: null, phone: null, manager_id: null, is_main: false,
});

/** Main office first, then by name. */
export async function fetchBranches(): Promise<Branch[]> {
  const { data } = await createClient().from('fanc_offices')
    .select('id, name, address, city, state, zip_code, phone, manager_id, is_main')
    .order('is_main', { ascending: false }).order('name');
  return (data ?? []) as Branch[];
}

export const branchName = (branches: Branch[], id: string | null | undefined) =>
  (id && branches.find((b) => b.id === id)?.name) || 'No branch';

export const branchAddress = (b: Pick<Branch, 'address' | 'city' | 'state' | 'zip_code'>) =>
  [b.address, [b.city, [b.state, b.zip_code].filter(Boolean).join(' ')].filter(Boolean).join(', ')].filter(Boolean).join(', ');
