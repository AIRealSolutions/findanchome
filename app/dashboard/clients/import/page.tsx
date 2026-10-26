'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Undo2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime } from '@/lib/leads';
import { CLIENT_STATUSES, clientName, fetchAllClients, type ClientImport, type ClientStatus, type ClientTransaction } from '@/lib/clients';
import {
  IMPORT_FIELDS,
  autoMap,
  hasTransaction,
  parseCsv,
  planImport,
  rowToRecord,
  type FieldMapping,
  type MergeMode,
  type ParsedCsv,
  type PlannedRow,
} from '@/lib/client-import';

type Step = 'upload' | 'map' | 'preview' | 'running' | 'done';
const CHUNK = 250;

const ACTION_META: Record<PlannedRow['action'], { label: string; className: string }> = {
  create: { label: 'New', className: 'bg-green-100 text-green-800' },
  update: { label: 'Update', className: 'bg-blue-100 text-blue-800' },
  unchanged: { label: 'Already up to date', className: 'bg-gray-100 text-gray-700' },
  duplicate: { label: 'Duplicate in file', className: 'bg-amber-100 text-amber-800' },
  skip: { label: 'Skipped', className: 'bg-red-100 text-red-800' },
};

const chunks = <T,>(arr: T[], n = CHUNK) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

export default function ClientImportPage() {
  const { user, profile, isAdmin, isBroker, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('');
  const [csv, setCsv] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<FieldMapping>({});
  const [status, setStatus] = useState<ClientStatus>('past_client');
  const [tag, setTag] = useState(`Flexmls import ${new Date().toISOString().slice(0, 10)}`);
  const [mode, setMode] = useState<MergeMode>('fill');
  const [plan, setPlan] = useState<PlannedRow[]>([]);
  const [filter, setFilter] = useState<PlannedRow['action'] | ''>('');
  const [progress, setProgress] = useState({ done: 0, total: 0, label: '' });
  const [result, setResult] = useState<{ created: number; updated: number; skipped: number; closings: number } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [imports, setImports] = useState<ClientImport[]>([]);

  const authorName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user?.email || 'Broker';

  const loadImports = useCallback(async () => {
    const { data } = await createClient().from('fanc_client_imports').select('*').order('created_at', { ascending: false }).limit(20);
    setImports((data ?? []) as ClientImport[]);
  }, []);

  useEffect(() => {
    if (!authLoading) loadImports();
  }, [authLoading, loadImports]);

  const readFile = async (file: File) => {
    setError('');
    const text = await file.text();
    const parsed = parseCsv(text);
    if (parsed.headers.length === 0 || parsed.rows.length === 0) {
      setError('That file has no rows. Export your contacts from Flexmls as a CSV file and try again.');
      return;
    }
    setFileName(file.name);
    setCsv(parsed);
    setMapping(autoMap(parsed.headers));
    setStep('map');
  };

  const sample = (header?: string) => {
    if (!csv || !header) return '';
    return csv.rows.find((r) => r[header])?.[header] ?? '';
  };

  const opts = useMemo(() => ({ status, tag, source: 'flexmls' }), [status, tag]);

  const buildPlan = async () => {
    if (!csv) return;
    setBusy(true);
    setError('');
    const { clients, error: err } = await fetchAllClients();
    setBusy(false);
    if (err) return setError(err);
    const records = csv.rows.map((r, i) => rowToRecord(r, i + 1, mapping, opts));
    setPlan(planImport(records, clients, mode));
    setFilter('');
    setStep('preview');
  };

  const counts = useMemo(() => {
    const c = { create: 0, update: 0, unchanged: 0, duplicate: 0, skip: 0 } as Record<PlannedRow['action'], number>;
    plan.forEach((p) => c[p.action]++);
    return c;
  }, [plan]);

  const runImport = async () => {
    if (!user) return;
    setStep('running');
    setError('');
    const supabase = createClient();
    const creates = plan.filter((p) => p.action === 'create');
    // Several rows can merge into the same existing client; the last merged state includes all of them.
    const updatesById = new Map<string, PlannedRow>();
    plan.filter((p) => p.action === 'update').forEach((p) => updatesById.set(p.id!, p));
    const updates = [...updatesById.values()];
    const total = creates.length + updates.length;
    let done = 0;
    let closings = 0;
    const tick = (n: number, label: string) => {
      done += n;
      setProgress({ done, total, label });
    };

    try {
      const { data: batch, error: e1 } = await supabase.from('fanc_client_imports').insert({
        source: 'flexmls', file_name: fileName, total_rows: plan.length, mapping,
      }).select('id').single();
      if (e1) throw e1;

      // New clients, with ids assigned here so their closings and timeline entries can reference them.
      const newRows = creates.map((p) => ({ id: crypto.randomUUID(), ...p.client!, import_id: batch.id }));
      for (const part of chunks(newRows)) {
        const { error: e } = await supabase.from('fanc_clients').insert(part);
        if (e) throw e;
        tick(part.length, 'Adding new clients');
      }

      // Updates: full merged rows, so no column is reset to its default.
      const updateRows = updates.map((p) => {
        const { created_at, updated_at, ...rest } = p.merged!; // eslint-disable-line @typescript-eslint/no-unused-vars
        return rest;
      });
      for (const part of chunks(updateRows)) {
        const { error: e } = await supabase.from('fanc_clients').upsert(part, { onConflict: 'id' });
        if (e) throw e;
        tick(part.length, 'Updating existing clients');
      }

      // Closed sales, skipping ones already on file.
      const existingTxns = new Map<string, Pick<ClientTransaction, 'closing_date' | 'mls_number' | 'property_address'>[]>();
      for (const ids of chunks([...new Set(plan.filter((p) => p.action === 'update' && p.txn).map((p) => p.id!))], 100)) {
        const { data, error: e } = await supabase.from('fanc_client_transactions').select('client_id, closing_date, mls_number, property_address').in('client_id', ids);
        if (e) throw e;
        (data ?? []).forEach((t) => existingTxns.set(t.client_id, [...(existingTxns.get(t.client_id) ?? []), t]));
      }
      const txnRows: Record<string, unknown>[] = [];
      creates.forEach((p, i) => p.txn && txnRows.push({ ...p.txn, client_id: newRows[i].id }));
      plan.filter((p) => p.action === 'update' && p.txn).forEach((p) => {
        const list = existingTxns.get(p.id!) ?? [];
        if (hasTransaction(list, p.txn!)) return;
        list.push(p.txn!);
        existingTxns.set(p.id!, list);
        txnRows.push({ ...p.txn, client_id: p.id });
      });
      for (const part of chunks(txnRows)) {
        const { error: e } = await supabase.from('fanc_client_transactions').insert(part);
        if (e) throw e;
        closings += part.length;
      }

      // Timeline entries.
      const note = (body: string, clientId: string) => ({ client_id: clientId, kind: 'import', body, author_id: user.id, author_name: authorName });
      const activity = [
        ...newRows.map((r) => note(`Imported from Flexmls (${fileName})`, r.id)),
        ...updates.filter((p) => p.changes.length).map((p) => note(`Updated from Flexmls import (${fileName}): ${p.changes.join(', ')}`, p.id!)),
      ];
      for (const part of chunks(activity)) {
        const { error: e } = await supabase.from('fanc_client_activity').insert(part);
        if (e) throw e;
      }

      const skipped = plan.length - creates.length - plan.filter((p) => p.action === 'update').length;
      await supabase.from('fanc_client_imports').update({ created_count: creates.length, updated_count: updates.length, skipped_count: skipped }).eq('id', batch.id);
      setResult({ created: creates.length, updated: updates.length, skipped, closings });
      setStep('done');
      loadImports();
    } catch (e) {
      setError(`${(e as { message?: string }).message ?? String(e)}. ${done} of ${total} contacts were saved before the error; you can undo this import below and try again.`);
      setStep('preview');
      loadImports();
    }
  };

  const undoImport = async (imp: ClientImport) => {
    const { count } = await createClient().from('fanc_clients').select('id', { count: 'exact', head: true }).eq('import_id', imp.id);
    if (!confirm(`Delete the ${count ?? 0} clients this import added (with their closings and timeline)? Existing clients it updated keep their changes.`)) return;
    setBusy(true);
    const supabase = createClient();
    const { error: e } = await supabase.from('fanc_clients').delete().eq('import_id', imp.id);
    if (!e) await supabase.from('fanc_client_imports').update({ undone_at: new Date().toISOString() }).eq('id', imp.id);
    setBusy(false);
    if (e) setError(e.message);
    loadImports();
  };

  if (!authLoading && !isAdmin && !isBroker) {
    return <p className="text-gray-600">Importing clients is available to brokers and admins.</p>;
  }

  const shown = plan.filter((p) => !filter || p.action === filter);
  const mappedCount = Object.values(mapping).filter(Boolean).length;
  const hasName = mapping.first_name || mapping.last_name || mapping.full_name;

  return (
    <div>
      <Link href="/dashboard/clients" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4">
        <ArrowLeft size={16} /> All clients
      </Link>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Import clients from Flexmls</h1>
      <p className="mt-1 mb-6 text-gray-600">Bring your Flexmls contacts into the FindaNChome client database. Nothing is saved until you confirm the preview.</p>

      {/* Steps */}
      <ol className="flex flex-wrap gap-2 mb-6 text-sm">
        {(['upload', 'map', 'preview', 'done'] as const).map((s, i) => {
          const order = ['upload', 'map', 'preview', 'running', 'done'];
          const active = order.indexOf(step) >= order.indexOf(s);
          return (
            <li key={s} className={`px-3 py-1 rounded-full border ${active ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-500'}`}>
              {i + 1}. {{ upload: 'Upload', map: 'Match columns', preview: 'Review', done: 'Done' }[s]}
            </li>
          );
        })}
      </ol>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {step === 'upload' && (
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) readFile(f);
            }}
            className="flex flex-col items-center justify-center gap-3 p-10 bg-white border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 text-center"
          >
            <Upload size={36} className="text-blue-600" />
            <span className="font-medium text-gray-900">Drop your Flexmls CSV here, or click to choose it</span>
            <span className="text-sm text-gray-500">.csv or tab-separated .txt · any number of contacts</span>
            <input type="file" accept=".csv,.txt,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])} />
          </label>

          <section className="bg-white border border-gray-200 rounded-xl p-5 text-sm text-gray-700">
            <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><FileSpreadsheet size={18} /> Exporting from Flexmls</h2>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>In Flexmls, open <strong>Contacts</strong>.</li>
              <li>Select all contacts (or a group, like your past clients).</li>
              <li>Choose <strong>Export</strong> and save it as a <strong>CSV</strong> file.</li>
              <li>Upload that file here.</li>
            </ol>
            <p className="mt-3 text-gray-500">
              If your export is an Excel file (.xlsx), open it in Excel or Google Sheets and use <em>Save as / Download → CSV</em> first.
              Closing dates, sale prices and MLS numbers are picked up when the file has those columns.
            </p>
          </section>
        </div>
      )}

      {step === 'map' && csv && (
        <div className="space-y-6">
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-700 mb-4">
              <strong>{fileName}</strong>: {csv.rows.length.toLocaleString()} rows, {csv.headers.length} columns. {mappedCount} columns were matched automatically;
              check them and pick any that were missed. Columns you leave unmatched are still saved with each client as &quot;original import data&quot;.
            </p>
            {(['Contact', 'Address', 'Details', 'Closed sale'] as const).map((group) => (
              <div key={group} className="mb-5 last:mb-0">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">{group}</h3>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-2">
                  {IMPORT_FIELDS.filter((f) => f.group === group).map((f) => (
                    <label key={f.key} className="grid grid-cols-[150px_1fr] items-center gap-3 text-sm">
                      <span className="text-gray-700">{f.label}</span>
                      <span className="min-w-0">
                        <select value={mapping[f.key] ?? ''} onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value || undefined })}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg bg-white">
                          <option value="">— not in file —</option>
                          {csv.headers.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                        {mapping[f.key] && <span className="block text-xs text-gray-500 truncate mt-0.5">e.g. {sample(mapping[f.key]) || '(empty)'}</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-5 grid md:grid-cols-3 gap-4 text-sm">
            <label>
              <span className="block text-gray-500 mb-1">Status for new clients</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as ClientStatus)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                {CLIENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
            <label>
              <span className="block text-gray-500 mb-1">Tag every imported contact</span>
              <input value={tag} onChange={(e) => setTag(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </label>
            <label>
              <span className="block text-gray-500 mb-1">When a contact already exists</span>
              <select value={mode} onChange={(e) => setMode(e.target.value as MergeMode)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                <option value="fill">Only fill in blank fields (safest)</option>
                <option value="overwrite">Replace fields with the Flexmls values</option>
              </select>
            </label>
            <p className="md:col-span-3 text-gray-500">
              Existing clients are matched by Flexmls ID, then email, then phone number + last name. Tags are always added and notes appended;
              status and do-not-contact flags you&apos;ve set are never changed.
            </p>
          </section>

          <div className="flex gap-2">
            <button onClick={buildPlan} disabled={busy || !hasName && !mapping.email} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
              {busy ? 'Checking for existing clients…' : 'Preview import'}
            </button>
            <button onClick={() => setStep('upload')} className="px-4 py-2 border border-gray-300 rounded-lg">Choose a different file</button>
          </div>
          {!hasName && !mapping.email && <p className="text-sm text-red-600">Match at least a name or email column to continue.</p>}
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(Object.keys(ACTION_META) as PlannedRow['action'][]).map((a) => (
              <button key={a} onClick={() => setFilter(filter === a ? '' : a)}
                className={`text-left bg-white border rounded-xl p-4 ${filter === a ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}>
                <div className="text-2xl font-bold text-gray-900">{counts[a].toLocaleString()}</div>
                <div className="text-sm text-gray-600">{ACTION_META[a].label}</div>
              </button>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Row</th>
                  <th className="px-3 py-2 font-medium">Result</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Email / phone</th>
                  <th className="px-3 py-2 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shown.slice(0, 300).map((p) => (
                  <tr key={p.row} className="align-top">
                    <td className="px-3 py-2 text-gray-500">{p.row}</td>
                    <td className="px-3 py-2"><span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${ACTION_META[p.action].className}`}>{ACTION_META[p.action].label}</span></td>
                    <td className="px-3 py-2 text-gray-900">{p.client ? clientName(p.client) : '—'}</td>
                    <td className="px-3 py-2 text-gray-600">{[p.client?.email, p.client?.phone].filter(Boolean).join(' · ')}</td>
                    <td className="px-3 py-2 text-gray-600">
                      {p.matchedBy && <div>Matches {p.merged ? clientName(p.merged) : 'existing client'} by {p.matchedBy}</div>}
                      {p.changes.length > 0 && <div>Will update: {p.changes.join(', ')}</div>}
                      {p.duplicateOf && <div>Same contact as row {p.duplicateOf}</div>}
                      {p.txn && p.action !== 'duplicate' && p.action !== 'skip' && <div>Closed sale{p.txn.closing_date ? ` ${p.txn.closing_date}` : ''}{p.txn.property_address ? ` · ${p.txn.property_address}` : ''}</div>}
                      {p.warnings.map((w) => <div key={w} className="text-amber-700 flex gap-1"><AlertTriangle size={14} className="shrink-0 mt-0.5" /> {w}</div>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {shown.length > 300 && <p className="p-3 text-sm text-gray-500 border-t border-gray-100">Showing the first 300 of {shown.length.toLocaleString()} rows.</p>}
            {shown.length === 0 && <p className="p-6 text-center text-gray-500">No rows.</p>}
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={runImport} disabled={counts.create + counts.update === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
              Import {counts.create.toLocaleString()} new and update {counts.update.toLocaleString()}
            </button>
            <button onClick={() => setStep('map')} className="px-4 py-2 border border-gray-300 rounded-lg">Back to columns</button>
          </div>
        </div>
      )}

      {step === 'running' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="font-medium text-gray-900 mb-2">{progress.label || 'Starting import'}…</p>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
          </div>
          <p className="text-sm text-gray-500 mt-2">{progress.done.toLocaleString()} of {progress.total.toLocaleString()} contacts. Keep this tab open.</p>
        </div>
      )}

      {step === 'done' && result && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="flex items-center gap-2 text-lg font-semibold text-green-700 mb-2"><CheckCircle2 /> Import complete</p>
          <p className="text-gray-700">
            Added <strong>{result.created.toLocaleString()}</strong> new clients, updated <strong>{result.updated.toLocaleString()}</strong>,
            recorded <strong>{result.closings.toLocaleString()}</strong> closed sales and left out {result.skipped.toLocaleString()} rows.
          </p>
          <div className="mt-4 flex gap-2">
            <Link href="/dashboard/clients" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">View clients</Link>
            <button onClick={() => { setStep('upload'); setCsv(null); setPlan([]); setResult(null); }} className="px-4 py-2 border border-gray-300 rounded-lg">Import another file</button>
          </div>
        </div>
      )}

      {/* History */}
      {imports.length > 0 && (step === 'upload' || step === 'done' || step === 'preview') && (
        <section className="mt-8 bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Recent imports</h2>
          <ul className="divide-y divide-gray-100">
            {imports.map((imp) => (
              <li key={imp.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900">{imp.file_name ?? 'Import'}</span>
                  <span className="text-gray-500"> · {formatDateTime(imp.created_at)} · {imp.created_count} added, {imp.updated_count} updated, {imp.skipped_count} left out</span>
                </div>
                {imp.undone_at ? (
                  <span className="text-gray-500">Undone {formatDateTime(imp.undone_at)}</span>
                ) : (
                  <button onClick={() => undoImport(imp)} disabled={busy} className="inline-flex items-center gap-1 text-gray-600 hover:text-red-600 disabled:opacity-50">
                    <Undo2 size={14} /> Undo
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
