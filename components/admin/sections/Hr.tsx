'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/clients';
import { staffName } from '@/lib/listings';
import { branchAddress, emptyBranch, type Branch, type BranchInput } from '@/lib/branches';
import { brokerIssues, licenseYear } from '../insights';
import { Alert, Card } from '../ui';
import { NO_BRANCH, type AdminContext, type BrokerRecord } from '../useAdminData';
import { TeamView } from './hr-views';

export function Team({ ctx }: { ctx: AdminContext }) {
  const { user } = useAuth();
  // With a branch selected, only that branch's people.
  const office = ctx.branch === NO_BRANCH ? null : ctx.branch;
  const profiles = ctx.branch ? ctx.profiles.filter((p) => p.role !== 'client' && (p.office_id ?? null) === office) : ctx.profiles;
  return <TeamView data={ctx.finance} profiles={profiles} branches={ctx.branches} meId={user?.id ?? ''} onChanged={ctx.reload} dm={ctx.dm} />;
}

const LICENSE_STATUSES: { value: NonNullable<BrokerRecord['license_status']>; label: string }[] = [
  { value: 'bic', label: 'Broker-in-charge' },
  { value: 'broker', label: 'Broker' },
  { value: 'provisional_broker', label: 'Provisional broker' },
  { value: 'inactive', label: 'Inactive' },
];

function RecordEditor({ broker, record, onSaved }: { broker: AdminContext['finance']['staff'][number]; record?: BrokerRecord; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Partial<BrokerRecord>>(record ?? {});
  const [msg, setMsg] = useState('');
  const issues = brokerIssues(staffName(broker), record);
  const set = <K extends keyof BrokerRecord>(k: K, v: BrokerRecord[K]) => setF({ ...f, [k]: v });
  const date = (k: 'license_expires' | 'ce_completed_on' | 'eo_expires' | 'start_date', label: string, hint?: string) => (
    <label className="text-xs text-gray-600">{label}
      <input type="date" value={f[k] ?? ''} onChange={(e) => set(k, e.target.value || null)} className="mt-0.5 w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900" />
      {hint && <span className="block text-[11px] text-gray-400 mt-0.5">{hint}</span>}
    </label>
  );
  const save = async () => {
    const { error } = await createClient().from('fanc_broker_records').upsert({
      broker_id: broker.id, license_number: f.license_number || null, license_status: f.license_status || null,
      license_expires: f.license_expires || null, ce_completed_on: f.ce_completed_on || null, eo_carrier: f.eo_carrier || null,
      eo_expires: f.eo_expires || null, start_date: f.start_date || null, ica_signed: !!f.ica_signed, w9_on_file: !!f.w9_on_file,
      emergency_contact: f.emergency_contact || null, notes: f.notes || null,
    });
    setMsg(error ? error.message : 'Saved');
    if (!error) onSaved();
  };
  const ly = licenseYear();

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-gray-900">{staffName(broker)} <span className="text-xs text-gray-500 capitalize">{broker.role}</span></p>
          <p className="text-xs text-gray-600">
            {record?.license_number ? `License #${record.license_number}` : 'No license # on file'}
            {record?.license_status && ` · ${LICENSE_STATUSES.find((s) => s.value === record.license_status)?.label}`}
            {record?.license_expires && ` · renews ${formatDate(record.license_expires)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${issues.some((i) => i.tone === 'bad') ? 'bg-red-100 text-red-800' : issues.length ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
            {issues.length ? `${issues.length} item${issues.length === 1 ? '' : 's'}` : 'Compliant'}
          </span>
          <button onClick={() => setOpen(!open)} className="text-sm text-blue-600 hover:underline">{open ? 'Close' : 'Edit'}</button>
        </div>
      </div>
      {issues.length > 0 && !open && <ul className="mt-2 text-xs text-gray-700 list-disc ml-5">{issues.map((i) => <li key={i.text}>{i.text.replace(`${staffName(broker)}: `, '')}</li>)}</ul>}
      {open && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className="text-xs text-gray-600">NC license #
            <input value={f.license_number ?? ''} onChange={(e) => set('license_number', e.target.value)} className="mt-0.5 w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900" />
          </label>
          <label className="text-xs text-gray-600">License status
            <select value={f.license_status ?? ''} onChange={(e) => set('license_status', (e.target.value || null) as BrokerRecord['license_status'])} className="mt-0.5 w-full px-2 py-1.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-900">
              <option value="">—</option>{LICENSE_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
          {date('license_expires', 'License renews by', `NC: June 30 (${ly.renewBy})`)}
          {date('ce_completed_on', 'CE completed on', `Due ${ly.ceDue} this license year`)}
          <label className="text-xs text-gray-600">E&amp;O carrier
            <input value={f.eo_carrier ?? ''} onChange={(e) => set('eo_carrier', e.target.value)} className="mt-0.5 w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900" />
          </label>
          {date('eo_expires', 'E&O expires')}
          {date('start_date', 'Joined Lightkeeper')}
          <label className="text-xs text-gray-600">Emergency contact
            <input value={f.emergency_contact ?? ''} onChange={(e) => set('emergency_contact', e.target.value)} className="mt-0.5 w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900" />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 col-span-2"><input type="checkbox" checked={!!f.ica_signed} onChange={(e) => set('ica_signed', e.target.checked)} className="rounded" /> Independent contractor agreement signed</label>
          <label className="flex items-center gap-2 text-sm text-gray-700 col-span-2"><input type="checkbox" checked={!!f.w9_on_file} onChange={(e) => set('w9_on_file', e.target.checked)} className="rounded" /> W-9 on file</label>
          <label className="text-xs text-gray-600 col-span-2 sm:col-span-4">Notes
            <textarea rows={2} value={f.notes ?? ''} onChange={(e) => set('notes', e.target.value)} className="mt-0.5 w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900" />
          </label>
          <div className="col-span-2 sm:col-span-4 flex items-center gap-3">
            <button onClick={save} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium">Save record</button>
            {msg && <span className={`text-xs ${msg === 'Saved' ? 'text-green-700' : 'text-red-600'}`}>{msg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export function Licensing({ ctx }: { ctx: AdminContext }) {
  const all = ctx.finance.staff.flatMap((s) => brokerIssues(staffName(s), ctx.records.find((r) => r.broker_id === s.id)));
  const ly = licenseYear();
  return (
    <div className="space-y-6">
      <Card title="Compliance alerts">
        {all.length === 0 ? <p className="text-sm text-green-700">✅ Every broker’s license, CE, E&amp;O and paperwork is in order.</p> : (
          <div className="space-y-1.5">{all.filter((i) => i.tone !== 'info').concat(all.filter((i) => i.tone === 'info')).map((i) => <Alert key={i.text} tone={i.tone}>{i.text}</Alert>)}</div>
        )}
        <p className="mt-3 text-xs text-gray-500">
          NC Real Estate Commission: continuing education is due by June 10 and licenses renew by June 30 each year (this license year: CE by {formatDate(ly.ceDue)}, renew by {formatDate(ly.renewBy)}).
        </p>
      </Card>
      <Card title="Broker records">
        <div className="space-y-3">
          {ctx.finance.staff.map((s) => (
            <RecordEditor key={`${s.id}:${ctx.records.find((r) => r.broker_id === s.id)?.license_number ?? ''}`} broker={s} record={ctx.records.find((r) => r.broker_id === s.id)} onSaved={ctx.reload} />
          ))}
        </div>
      </Card>
    </div>
  );
}

const FIELD = 'mt-0.5 w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900';

function BranchForm({ branch, staff, onDone }: {
  branch?: Branch; staff: AdminContext['profiles']; onDone: (saved: boolean) => void;
}) {
  const [f, setF] = useState<BranchInput>(branch ?? emptyBranch());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = <K extends keyof BranchInput>(k: K, v: BranchInput[K]) => setF({ ...f, [k]: v });
  const text = (k: 'name' | 'address' | 'city' | 'state' | 'zip_code' | 'phone', label: string, span = '') => (
    <label className={`text-xs text-gray-600 ${span}`}>{label}
      <input value={f[k] ?? ''} onChange={(e) => set(k, k === 'name' ? e.target.value : e.target.value || null)} className={FIELD} />
    </label>
  );

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) return setError('Give the branch a name');
    setBusy(true);
    const supabase = createClient();
    // Only one main office: hand the title over before saving this one.
    if (f.is_main) {
      let clear = supabase.from('fanc_offices').update({ is_main: false }).eq('is_main', true);
      if (branch) clear = clear.neq('id', branch.id);
      await clear;
    }
    const row = { ...f, name: f.name.trim() };
    const { error: err } = branch
      ? await supabase.from('fanc_offices').update(row).eq('id', branch.id)
      : await supabase.from('fanc_offices').insert(row);
    setBusy(false);
    if (err) return setError(err.message);
    onDone(true);
  };

  return (
    <form onSubmit={save} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {text('name', 'Branch name', 'col-span-2')}
      {text('phone', 'Phone')}
      <label className="text-xs text-gray-600">Branch manager
        <select value={f.manager_id ?? ''} onChange={(e) => set('manager_id', e.target.value || null)} className={`${FIELD} bg-white`}>
          <option value="">—</option>
          {staff.map((s) => <option key={s.id} value={s.id}>{staffName(s)}</option>)}
        </select>
      </label>
      {text('address', 'Street address', 'col-span-2')}
      {text('city', 'City')}
      <div className="grid grid-cols-2 gap-2">{text('state', 'State')}{text('zip_code', 'ZIP')}</div>
      <label className="flex items-center gap-2 text-sm text-gray-700 col-span-2"><input type="checkbox" checked={f.is_main} onChange={(e) => set('is_main', e.target.checked)} className="rounded" /> Main office</label>
      <div className="col-span-2 sm:col-span-4 flex items-center gap-3">
        <button disabled={busy} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{branch ? 'Save branch' : 'Add branch'}</button>
        <button type="button" onClick={() => onDone(false)} className="text-sm text-gray-600 hover:underline">Cancel</button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </form>
  );
}

export function Branches({ ctx }: { ctx: AdminContext }) {
  const [editing, setEditing] = useState<string | null>(null); // a branch id, 'new' or nothing
  const [error, setError] = useState('');
  const staff = ctx.profiles.filter((p) => p.role !== 'client' && p.is_active !== false);
  const unassigned = staff.filter((p) => !p.office_id);
  const done = (saved: boolean) => {
    setEditing(null);
    if (saved) ctx.reload();
  };
  const remove = async (b: Branch) => {
    if (!confirm(`Delete the ${b.name} branch? Its brokers, deals and leads stay, with no branch.`)) return;
    const { error: err } = await createClient().from('fanc_offices').delete().eq('id', b.id);
    if (err) return setError(err.message);
    ctx.reload();
  };

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
      <Card title={`Branches (${ctx.branches.length})`} action={editing !== 'new' && (
        <button onClick={() => setEditing('new')} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium">Add branch</button>
      )}>
        {editing === 'new' && <div className="mb-4 p-4 border border-blue-200 bg-blue-50/40 rounded-lg"><BranchForm staff={staff} onDone={done} /></div>}
        {ctx.branches.length === 0 && editing !== 'new' ? (
          <p className="text-sm text-gray-500">No branches yet. Add your main office first, then each branch. Brokers, deals, leads and listing opportunities can then be reported on by branch.</p>
        ) : (
          <div className="space-y-3">
            {ctx.branches.map((b) => {
              const people = staff.filter((p) => p.office_id === b.id);
              return (
                <div key={b.id} className="p-4 border border-gray-200 rounded-lg">
                  {editing === b.id ? <BranchForm branch={b} staff={staff} onDone={done} /> : (
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{b.name}{b.is_main && <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs">Main office</span>}</div>
                        {branchAddress(b) && <div className="text-gray-600">{branchAddress(b)}</div>}
                        {b.phone && <div className="text-gray-600">{b.phone}</div>}
                        <div className="mt-1 text-gray-600">Manager: {b.manager_id ? staffName(ctx.profiles.find((p) => p.id === b.manager_id)) : '—'}</div>
                        <div className="text-gray-600">Brokers ({people.length}): {people.map((p) => staffName(p)).join(', ') || 'none yet'}</div>
                      </div>
                      <div className="flex gap-3 text-sm">
                        <button onClick={() => { ctx.setBranch(b.id); }} className="text-blue-600 hover:underline">Filter to this branch</button>
                        <button onClick={() => setEditing(b.id)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => remove(b)} className="text-red-600 hover:underline">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {ctx.branches.length > 0 && unassigned.length > 0 && (
          <p className="mt-4 text-sm text-amber-700">Not in a branch yet: {unassigned.map((p) => staffName(p)).join(', ')}. Assign them on the Team &amp; plans tab.</p>
        )}
        <p className="mt-4 text-xs text-gray-500">A deal, lead or listing opportunity belongs to the branch of the broker it’s assigned to, and moves with it when reassigned. Moving a broker to another branch doesn’t move their existing deals.</p>
      </Card>
    </div>
  );
}
