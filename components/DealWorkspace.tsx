'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarPlus, Check, ChevronLeft, ChevronRight, Copy, Mail, MessageCircle, Phone, Plus, Send, Trash2, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useViewAs } from '@/lib/view-as';
import { createClient } from '@/lib/supabase/client';
import { addDaysYmd, eventsToIcs, parseYmd, toYmd } from '@/lib/calendar';
import { downloadCsv, formatDate, formatMoney } from '@/lib/clients';
import { DEAL_DATES, taskDue, type Deal, type DealDateField, type DealTask } from '@/lib/deals';
import { dialable, formatDateTime, relativeTime } from '@/lib/leads';
import { SITE_URL } from '@/lib/site';
import {
  JOURNEY, POST_KINDS, fetchWorkspace, notifyPost, postKindMeta, sendInvite, workspaceEvents, workspaceTitle,
  type DealMember, type DealPost, type PostKind, type WorkspaceDeal,
} from '@/lib/workspace';

type Tab = 'feed' | 'todo' | 'calendar' | 'details';
type Data = Awaited<ReturnType<typeof fetchWorkspace>>;

function Card({ title, children, action }: { title?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5">
      {title && (
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Where the deal is, as a five-step journey. */
function Journey({ d }: { d: WorkspaceDeal }) {
  if (d.stage === 'fell_through') return <p className="text-sm text-gray-600">This transaction didn’t go through. Your broker will be in touch about next steps.</p>;
  const at = JOURNEY.findIndex((j) => j.stage === d.stage);
  return (
    <ol className="grid grid-cols-5 gap-1">
      {JOURNEY.map((j, i) => (
        <li key={j.stage} className="text-center">
          <div className={`h-2 rounded-full ${i <= at ? 'bg-green-500' : 'bg-gray-200'}`} />
          <p className={`mt-1 text-[11px] sm:text-xs leading-tight ${i === at ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>{j.label}</p>
        </li>
      ))}
    </ol>
  );
}

// ───────────────────────── Feed ─────────────────────────

function Feed({ d, posts, staff, me, onChanged }: { d: WorkspaceDeal; posts: DealPost[]; staff: boolean; me: { id: string; name: string }; onChanged: () => void }) {
  const [kind, setKind] = useState<Exclude<PostKind, 'milestone'>>('update');
  const [body, setBody] = useState('');
  const [link, setLink] = useState('');
  const [internal, setInternal] = useState(false);
  const [email, setEmail] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const top = posts.filter((p) => !p.parent_id);
  const replies = (id: string) => posts.filter((p) => p.parent_id === id).sort((a, b) => a.created_at.localeCompare(b.created_at));

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    const url = link.trim() && !/^https?:\/\//i.test(link.trim()) ? `https://${link.trim()}` : link.trim();
    setBusy(true);
    const { data, error: err } = await createClient().from('fanc_deal_posts').insert({
      deal_id: d.id, kind, body: body.trim(), link_url: url || null, internal: staff && internal, author_name: me.name,
    }).select('id').single();
    setBusy(false);
    if (err) return setError(err.message);
    setError('');
    setBody('');
    setLink('');
    // Clients always reach their broker; brokers choose. Internal notes never go out.
    if (!(staff && internal) && (!staff || email)) notifyPost(data.id);
    onChanged();
  };
  const sendReply = async (parent: DealPost) => {
    if (!reply.trim()) return;
    const { data, error: err } = await createClient().from('fanc_deal_posts').insert({
      deal_id: d.id, kind: 'update', body: reply.trim(), parent_id: parent.id, internal: parent.internal, author_name: me.name,
    }).select('id').single();
    if (err) return setError(err.message);
    setReply('');
    setReplyTo(null);
    if (!parent.internal) notifyPost(data.id);
    onChanged();
  };
  const remove = async (p: DealPost) => {
    if (!confirm('Delete this post?')) return;
    await createClient().from('fanc_deal_posts').delete().eq('id', p.id);
    onChanged();
  };

  const renderPost = (p: DealPost, nested = false) => {
    const meta = postKindMeta(p.kind);
    return (
      <div key={p.id} className={`flex gap-3 ${nested ? 'mt-3' : ''}`}>
        <span className={`shrink-0 grid place-items-center rounded-full ${nested ? 'w-7 h-7 text-sm' : 'w-9 h-9 text-lg'} ${p.author_role === 'system' ? 'bg-green-100' : p.author_role === 'client' ? 'bg-amber-100' : 'bg-blue-100'}`} aria-hidden>
          {p.author_role === 'system' ? '🎯' : meta.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-900">{p.author_role === 'system' ? 'Milestone' : p.author_name || (p.author_role === 'client' ? 'Client' : 'Broker')}</span>
            {p.author_role === 'broker' && ' · broker'}
            {!nested && p.author_role !== 'system' && <> · {meta.label}</>}
            {' · '}<time dateTime={p.created_at} title={formatDateTime(p.created_at)}>{relativeTime(p.created_at)}</time>
            {p.internal && <span className="ml-1 px-1.5 py-0.5 rounded bg-gray-800 text-white">Internal</span>}
          </p>
          <p className={`mt-0.5 whitespace-pre-wrap ${p.author_role === 'system' ? 'font-medium text-gray-900' : 'text-gray-800'}`}>{p.body}</p>
          {p.link_url && <a href={p.link_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">{p.link_url}</a>}
          {!nested && (
            <div className="mt-1 flex gap-3 text-xs">
              <button onClick={() => { setReplyTo(replyTo === p.id ? null : p.id); setReply(''); }} className="text-gray-500 hover:text-blue-600">Reply</button>
              {(p.author_id === me.id || staff) && p.author_role !== 'system' && <button onClick={() => remove(p)} className="text-gray-400 hover:text-red-600">Delete</button>}
            </div>
          )}
          {!nested && replies(p.id).map((r) => renderPost(r, true))}
          {replyTo === p.id && (
            <div className="mt-2 flex gap-2">
              <input autoFocus value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendReply(p)} placeholder="Write a reply…"
                className="flex-1 min-w-0 px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
              <button onClick={() => sendReply(p)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"><Send size={14} /></button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={send}>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {POST_KINDS.filter((k) => staff || !k.staffOnly).map((k) => (
              <button key={k.value} type="button" onClick={() => setKind(k.value)} aria-pressed={kind === k.value}
                className={`px-3 py-1 rounded-full text-sm border ${kind === k.value ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                <span aria-hidden>{k.icon}</span> {k.label}
              </button>
            ))}
          </div>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={5000}
            placeholder={staff ? 'What happened today? (showing feedback, inspection results, next steps…)' : 'Ask a question or share an update with your broker…'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link (optional): a document, photo album or listing" className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-4 text-sm text-gray-700">
              {staff && <label className="flex items-center gap-1.5"><input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} className="rounded" /> Internal note (brokers only)</label>}
              {staff && !internal && <label className="flex items-center gap-1.5"><input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} className="rounded" /> Email the client</label>}
              {!staff && <span className="text-xs text-gray-500">{d.broker_name ?? 'Your broker'} will be notified.</span>}
            </div>
            <button disabled={busy || !body.trim()} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"><Send size={16} /> Post</button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </form>
      </Card>
      <Card>
        {top.length === 0 ? (
          <p className="text-sm text-gray-500">No activity yet. {staff ? 'Post today’s update to start the feed.' : 'Updates from your broker will appear here.'}</p>
        ) : (
          <ol className="space-y-5">{top.map((p) => <li key={p.id}>{renderPost(p)}</li>)}</ol>
        )}
      </Card>
    </div>
  );
}

// ───────────────────────── To-do ─────────────────────────

function Todo({ d, tasks, staff, me, onChanged }: { d: WorkspaceDeal; tasks: DealTask[]; staff: boolean; me: { id: string; name: string }; onChanged: () => void }) {
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [assignee, setAssignee] = useState<'broker' | 'client'>('client');
  const [error, setError] = useState('');
  const asDeal = d as unknown as Deal;
  const today = toYmd(new Date());
  const visible = staff ? tasks : tasks.filter((t) => t.shared);
  const sorted = [...visible].sort((a, b) => (!!a.done_at === !!b.done_at ? (taskDue(a, asDeal) ?? '9999').localeCompare(taskDue(b, asDeal) ?? '9999') || a.sort - b.sort : a.done_at ? 1 : -1));

  const run = async (q: PromiseLike<{ error: { message: string } | null }>) => {
    const { error: err } = await q;
    setError(err?.message ?? '');
    onChanged();
  };
  const toggle = async (t: DealTask) => {
    const done = !t.done_at;
    const { error: err } = await createClient().from('fanc_deal_tasks').update({ done_at: done ? new Date().toISOString() : null }).eq('id', t.id);
    if (err) return setError(err.message);
    // Finishing a shared to-do shows up in the feed for everyone.
    if (done && t.shared) {
      const { data } = await createClient().from('fanc_deal_posts').insert({ deal_id: d.id, kind: 'update', body: `✅ Done: ${t.title}`, author_name: me.name }).select('id').single();
      if (data && !staff) notifyPost(data.id);
    }
    onChanged();
  };
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    run(createClient().from('fanc_deal_tasks').insert({
      deal_id: d.id, title: title.trim(), due_date: due || null, shared: true, assignee: staff ? assignee : 'client', sort: tasks.length,
    }));
    setTitle('');
    setDue('');
  };

  const renderGroup = (label: string, list: DealTask[]) => (
    <Card key={label} title={`${label} (${list.filter((t) => !t.done_at).length} open)`}>
      {list.length === 0 ? <p className="text-sm text-gray-500">Nothing here.</p> : (
        <ul className="divide-y divide-gray-100">
          {list.map((t) => {
            const on = taskDue(t, asDeal);
            const late = !t.done_at && on && on < today;
            return (
              <li key={t.id} className="py-2.5 flex items-start gap-3">
                <button onClick={() => toggle(t)} aria-label={t.done_at ? 'Mark not done' : 'Mark done'}
                  className={`mt-0.5 w-5 h-5 shrink-0 rounded border grid place-items-center ${t.done_at ? 'bg-green-600 border-green-600 text-white' : 'border-gray-400 hover:border-green-600'}`}>
                  {t.done_at && <Check size={14} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${t.done_at ? 'line-through text-gray-400' : 'text-gray-900'}`}>{t.title}</p>
                  <p className={`text-xs ${late ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                    {on ? `${late ? 'Overdue · ' : ''}Due ${formatDate(on, { weekday: 'short', month: 'short', day: 'numeric' })}` : 'No due date'}
                    {staff && !t.shared && ' · internal'}
                  </p>
                </div>
                {staff && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => run(createClient().from('fanc_deal_tasks').update({ shared: !t.shared }).eq('id', t.id))}
                      className={`px-2 py-0.5 rounded-full text-xs border ${t.shared ? 'border-green-300 text-green-800 bg-green-50' : 'border-gray-300 text-gray-500'}`}>
                      {t.shared ? 'Shared' : 'Share'}
                    </button>
                    <button onClick={() => run(createClient().from('fanc_deal_tasks').update({ assignee: t.assignee === 'client' ? 'broker' : 'client' }).eq('id', t.id))}
                      className="px-2 py-0.5 rounded-full text-xs border border-gray-300 text-gray-600" title="Whose to-do">
                      {t.assignee === 'client' ? 'Client' : 'Broker'}
                    </button>
                  </div>
                )}
                {!staff && t.created_by === me.id && (
                  <button onClick={() => run(createClient().from('fanc_deal_tasks').delete().eq('id', t.id))} aria-label="Delete" className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={add} className="flex flex-col sm:flex-row gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a to-do…" className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          {staff && (
            <select value={assignee} onChange={(e) => setAssignee(e.target.value as 'broker' | 'client')} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
              <option value="client">Client’s to-do</option><option value="broker">My to-do</option>
            </select>
          )}
          <button className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"><Plus size={16} /> Add</button>
        </form>
        {staff && <p className="mt-2 text-xs text-gray-500">Tasks you add here are shared with the client. Checklist tasks marked “internal” stay private until you share them.</p>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </Card>
      <div className="grid lg:grid-cols-2 gap-6">
        {renderGroup(staff ? 'Client’s to-dos' : 'Your to-dos', sorted.filter((t) => t.assignee === 'client'))}
        {renderGroup(staff ? 'Broker’s to-dos' : `${d.broker_name?.split(' ')[0] ?? 'Your broker'}’s to-dos`, sorted.filter((t) => t.assignee === 'broker'))}
      </div>
    </div>
  );
}

// ───────────────────────── Calendar ─────────────────────────

function SharedCalendar({ d, tasks }: { d: WorkspaceDeal; tasks: DealTask[] }) {
  const events = useMemo(() => workspaceEvents(d, tasks), [d, tasks]);
  const today = toYmd(new Date());
  const first = events.find((e) => e.occursOn >= today)?.occursOn ?? today;
  const [month, setMonth] = useState(() => first.slice(0, 7));
  const start = parseYmd(`${month}-01`);
  const gridStart = addDaysYmd(`${month}-01`, -start.getDay());
  const days = Array.from({ length: 42 }, (_, i) => addDaysYmd(gridStart, i));
  const byDay = (day: string) => events.filter((e) => e.occursOn === day);
  const shift = (n: number) => {
    const m = new Date(start.getFullYear(), start.getMonth() + n, 1);
    setMonth(toYmd(m).slice(0, 7));
  };
  const upcoming = events.filter((e) => e.occursOn >= today && !e.done);

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <Card>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => shift(-1)} aria-label="Previous month" className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronLeft size={18} /></button>
          <h2 className="font-semibold text-gray-900">{start.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
          <button onClick={() => shift(1)} aria-label="Next month" className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronRight size={18} /></button>
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden text-xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => <div key={w} className="bg-gray-50 py-1 text-center text-gray-500">{w}</div>)}
          {days.map((day) => (
            <div key={day} className={`bg-white min-h-16 sm:min-h-20 p-1 ${day.slice(0, 7) !== month ? 'opacity-40' : ''}`}>
              <div className={`text-[11px] ${day === today ? 'inline-block px-1.5 rounded-full bg-blue-600 text-white' : 'text-gray-500'}`}>{+day.slice(8)}</div>
              {byDay(day).slice(0, 3).map((e) => (
                <div key={e.key} title={e.title} className={`mt-0.5 truncate rounded px-1 ${e.kind === 'deal_date' ? 'bg-purple-100 text-purple-900' : e.done ? 'bg-gray-100 text-gray-400 line-through' : 'bg-blue-50 text-blue-900'}`}>
                  {e.icon} {e.title}
                </div>
              ))}
              {byDay(day).length > 3 && <div className="text-[10px] text-gray-500">+{byDay(day).length - 3} more</div>}
            </div>
          ))}
        </div>
      </Card>
      <Card title="Coming up" action={
        <button onClick={() => downloadCsv(eventsToIcs(events), `${workspaceTitle(d).replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`, 'text/calendar;charset=utf-8')}
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"><CalendarPlus size={14} /> Add to my calendar</button>
      }>
        {upcoming.length === 0 ? <p className="text-sm text-gray-500">Nothing scheduled yet.</p> : (
          <ol className="space-y-3">
            {upcoming.slice(0, 12).map((e) => (
              <li key={e.key} className="flex gap-3 text-sm">
                <div className="w-12 shrink-0 text-center">
                  <div className="text-xs text-gray-500 uppercase">{formatDate(e.occursOn, { month: 'short' })}</div>
                  <div className="text-lg font-semibold text-gray-900 leading-none">{+e.occursOn.slice(8)}</div>
                </div>
                <div className="min-w-0"><p className="text-gray-900">{e.icon} {e.title}</p>{e.detail && <p className="text-xs text-gray-500">{e.detail}</p>}</div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}

// ───────────────────────── Details & people ─────────────────────────

function Members({ dealId, members, defaultEmail, defaultName, onChanged }: {
  dealId: string; members: DealMember[]; defaultEmail: string; defaultName: string; onChanged: () => void;
}) {
  const [email, setEmail] = useState(members.length ? '' : defaultEmail);
  const [name, setName] = useState(members.length ? '' : defaultName);
  const [msg, setMsg] = useState('');
  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    const addr = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) return setMsg('Enter a valid email');
    const { data, error } = await createClient().from('fanc_deal_members').insert({ deal_id: dealId, email: addr, name: name.trim() || null }).select('id').single();
    if (error) return setMsg(error.message.includes('duplicate') ? 'Already invited' : error.message);
    const err = await sendInvite(data.id);
    setMsg(err || `Invite emailed to ${addr}.`);
    setEmail('');
    setName('');
    onChanged();
  };
  const remove = async (m: DealMember) => {
    if (!confirm(`Remove ${m.email} from this workspace?`)) return;
    await createClient().from('fanc_deal_members').delete().eq('id', m.id);
    onChanged();
  };
  const joinLink = (m: DealMember) => `${SITE_URL}/join?email=${encodeURIComponent(m.email)}`;
  return (
    <Card title="Who can see this workspace">
      <ul className="divide-y divide-gray-100 mb-3">
        {members.length === 0 && <li className="py-2 text-sm text-gray-500">Only brokers so far. Invite your client below.</li>}
        {members.map((m) => (
          <li key={m.id} className="py-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="flex-1 min-w-0"><span className="font-medium text-gray-900">{m.name || m.email}</span>{m.name && <span className="text-gray-500"> · {m.email}</span>}
              <span className={`ml-2 text-xs ${m.user_id ? 'text-green-700' : 'text-amber-700'}`}>{m.user_id ? `joined${m.last_seen_at ? ` · seen ${relativeTime(m.last_seen_at)}` : ''}` : 'invited'}</span></span>
            {!m.user_id && (
              <>
                <button onClick={() => navigator.clipboard?.writeText(joinLink(m)).then(() => setMsg('Join link copied.'))} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"><Copy size={12} /> Copy link</button>
                <button onClick={async () => setMsg((await sendInvite(m.id)) || 'Invite re-sent.')} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"><Mail size={12} /> Resend</button>
              </>
            )}
            <button onClick={() => remove(m)} aria-label="Remove" className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
          </li>
        ))}
      </ul>
      <form onSubmit={invite} className="flex flex-col sm:flex-row gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="sm:w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@email.com" type="email" className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        <button className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"><UserPlus size={16} /> Invite</button>
      </form>
      {msg && <p className="mt-2 text-sm text-gray-700">{msg}</p>}
      <p className="mt-2 text-xs text-gray-500">Clients sign in at {SITE_URL.replace(/^https?:\/\//, '')}/join with an emailed link. They see the feed (not internal notes), shared to-dos, the calendar and key details, never commission.</p>
    </Card>
  );
}

function Details({ d, staff, members, clientEmail, onChanged }: { d: WorkspaceDeal; staff: boolean; members: DealMember[]; clientEmail: string; onChanged: () => void }) {
  const price = d.contract_price ?? d.list_price;
  const people = [
    ['Your broker', d.broker_name, d.broker_phone, d.broker_email],
    ['Lender', d.lender],
    ['Closing attorney', d.closing_attorney],
    [d.side === 'seller' ? 'Buyer’s agent' : d.side === 'buyer' ? 'Listing agent' : 'Other agent', d.other_agent],
  ].filter((p) => p[1]) as [string, string, string?, string?][];
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Key dates">
        <ol className="space-y-2">
          {DEAL_DATES.map((f) => {
            const on = d[f.field as DealDateField];
            const past = on && on < toYmd(new Date());
            return (
              <li key={f.field} className="flex items-center gap-3 text-sm">
                <span aria-hidden className={past ? 'opacity-50' : ''}>{f.icon}</span>
                <span className={`flex-1 ${past ? 'text-gray-400' : 'text-gray-700'}`}>{f.label}</span>
                <span className={on ? 'font-medium text-gray-900' : 'text-gray-400'}>{on ? formatDate(on, { weekday: 'short', month: 'short', day: 'numeric' }) : 'TBD'}</span>
              </li>
            );
          })}
        </ol>
      </Card>
      <Card title="The property">
        <dl className="text-sm space-y-1.5">
          <div className="flex justify-between"><dt className="text-gray-500">Address</dt><dd className="text-gray-900 text-right">{[d.property_address, d.city, d.zip_code].filter(Boolean).join(', ') || 'TBD'}</dd></div>
          {price != null && <div className="flex justify-between"><dt className="text-gray-500">{d.contract_price ? 'Contract price' : 'List price'}</dt><dd className="text-gray-900">{formatMoney(price)}</dd></div>}
          {d.mls_number && <div className="flex justify-between"><dt className="text-gray-500">MLS #</dt><dd className="text-gray-900">{d.mls_number}</dd></div>}
          {d.is_hud && <div className="flex justify-between"><dt className="text-gray-500">Type</dt><dd className="text-gray-900">HUD home</dd></div>}
        </dl>
      </Card>
      <Card title="Your team">
        <ul className="space-y-3 text-sm">
          {people.map(([role, name, phone, email]) => (
            <li key={role}>
              <p className="text-gray-500 text-xs">{role}</p>
              <p className="text-gray-900">{name}</p>
              {(phone || email) && (
                <div className="flex gap-3 mt-0.5">
                  {phone && <a href={`tel:${dialable(phone)}`} className="inline-flex items-center gap-1 text-blue-600 hover:underline"><Phone size={12} /> {phone}</a>}
                  {phone && <a href={`sms:${dialable(phone)}`} className="inline-flex items-center gap-1 text-blue-600 hover:underline"><MessageCircle size={12} /> Text</a>}
                  {email && <a href={`mailto:${email}`} className="inline-flex items-center gap-1 text-blue-600 hover:underline"><Mail size={12} /> Email</a>}
                </div>
              )}
            </li>
          ))}
        </ul>
      </Card>
      {staff && <Members dealId={d.id} members={members} defaultEmail={clientEmail} defaultName={[d.client_first_name, d.client_last_name].filter(Boolean).join(' ')} onChanged={onChanged} />}
    </div>
  );
}

// ───────────────────────── Page ─────────────────────────

/** The workspace a broker shares with their clients for one deal. */
export default function DealWorkspace({ dealId }: { dealId: string }) {
  const { user, profile, isAdmin, isBroker, loading: authLoading } = useAuth();
  const { viewAs } = useViewAs();
  const staff = (isAdmin || isBroker) && viewAs !== 'client';
  const [data, setData] = useState<Data | null>(null);
  const [clientEmail, setClientEmail] = useState('');
  const [tab, setTab] = useState<Tab>('feed');
  const me = { id: user?.id ?? '', name: [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user?.email || '' };

  const load = useCallback(() => fetchWorkspace(dealId).then(setData), [dealId]);
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    fetchWorkspace(dealId).then((r) => !cancelled && setData(r));
    if (isAdmin || isBroker) {
      createClient().from('fanc_deals').select('client:fanc_clients(email)').eq('id', dealId).maybeSingle()
        .then(({ data: row }) => !cancelled && setClientEmail(((row?.client as { email?: string | null } | null)?.email ?? '').toLowerCase()));
    }
    return () => {
      cancelled = true;
    };
  }, [authLoading, dealId, isAdmin, isBroker]);

  if (!data) return <p className="text-gray-500">Loading workspace…</p>;
  const d = data.deal;
  if (!d) {
    return (
      <div>
        <Link href={staff ? '/dashboard/deals' : '/dashboard/my-deals'} className="inline-flex items-center gap-1 text-sm text-blue-600 mb-4"><ArrowLeft size={16} /> Back</Link>
        <p className="text-gray-600">{data.error || 'This workspace was not found, or you have not been invited to it.'}</p>
      </div>
    );
  }

  const openTodos = (staff ? data.tasks.filter((t) => t.shared) : data.tasks).filter((t) => !t.done_at).length;
  const tabs: { value: Tab; label: string }[] = [
    { value: 'feed', label: 'Activity' },
    { value: 'todo', label: `To-do${openTodos ? ` (${openTodos})` : ''}` },
    { value: 'calendar', label: 'Calendar' },
    { value: 'details', label: staff ? 'Details & sharing' : 'Details' },
  ];

  return (
    <div>
      <Link href={staff ? `/dashboard/deals/${d.id}` : '/dashboard/my-deals'} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4">
        <ArrowLeft size={16} /> {staff ? 'Back to the deal' : 'My deals'}
      </Link>
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <p className="text-sm text-gray-500">{d.side === 'seller' ? 'Selling' : d.side === 'buyer' ? 'Buying' : 'Buying & selling'}{d.client_first_name ? ` · ${[d.client_first_name, d.client_last_name].filter(Boolean).join(' ')}` : ''}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{workspaceTitle(d)}</h1>
          </div>
          {staff && <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-800 self-start">Shared with {data.members.length || 'no'} client{data.members.length === 1 ? '' : 's'}</span>}
          {!staff && d.broker_phone && (
            <a href={`tel:${dialable(d.broker_phone)}`} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium self-start"><Phone size={16} /> Call {d.broker_name?.split(' ')[0] ?? 'your broker'}</a>
          )}
        </div>
        <Journey d={d} />
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 overflow-x-auto w-fit max-w-full">
        {tabs.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)} className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${tab === t.value ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'feed' && <Feed d={d} posts={data.posts} staff={staff} me={me} onChanged={load} />}
      {tab === 'todo' && <Todo d={d} tasks={data.tasks} staff={staff} me={me} onChanged={load} />}
      {tab === 'calendar' && <SharedCalendar d={d} tasks={staff ? data.tasks.filter((t) => t.shared) : data.tasks} />}
      {tab === 'details' && <Details d={d} staff={staff} members={data.members} clientEmail={clientEmail} onChanged={load} />}
    </div>
  );
}
