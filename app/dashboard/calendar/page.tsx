'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Download, RefreshCw, Phone, MessageCircle, Mail, Check, Undo2, List, CalendarDays, PenLine } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import MessageComposer from '@/components/MessageComposer';
import { dialable } from '@/lib/leads';
import { downloadCsv, formatDate } from '@/lib/clients';
import {
  addDaysYmd,
  buildEvents,
  daysBetween,
  eventsToIcs,
  fetchCalendarData,
  parseYmd,
  setDone,
  toYmd,
  type CalEvent,
  type CalendarData,
} from '@/lib/calendar';

type ViewMode = 'agenda' | 'month';
type Filter = '' | 'personal' | 'home' | 'deals' | 'follow_up' | 'season';

const FILTERS: { value: Filter; label: string; kinds: CalEvent['kind'][] }[] = [
  { value: '', label: 'Everything', kinds: [] },
  { value: 'personal', label: 'Birthdays & anniversaries', kinds: ['birthday', 'home_anniversary', 'wedding_anniversary'] },
  { value: 'home', label: 'Insurance, warranty & home', kinds: ['insurance_renewal', 'flood_insurance_renewal', 'home_warranty_expiration', 'hoa_dues', 'mortgage_review', 'lease_end', 'custom'] },
  { value: 'deals', label: 'Deals & checklists', kinds: ['deal_date', 'deal_task'] },
  { value: 'follow_up', label: 'Follow-ups', kinds: ['client_follow_up', 'lead_follow_up'] },
  { value: 'season', label: 'Seasonal touches', kinds: ['season'] },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const AGENDA_BACK = 30;
const AGENDA_AHEAD = 120;

function whenText(on: string, today: string) {
  const n = daysBetween(today, on);
  const day = formatDate(on, { weekday: 'short', month: 'short', day: 'numeric' });
  if (n === 0) return `${day} · today`;
  if (n === 1) return `${day} · tomorrow`;
  if (n === -1) return `${day} · yesterday`;
  return n > 0 ? `${day} · in ${n} days` : `${day} · ${-n} days ago`;
}

function EventRow({ e, today, busy, onToggle, onCompose }: { e: CalEvent; today: string; busy: boolean; onToggle: (e: CalEvent) => void; onCompose: (e: CalEvent) => void }) {
  const c = e.client;
  const body = e.sms ? encodeURIComponent(e.sms) : '';
  return (
    <li className={`p-4 flex flex-col md:flex-row md:items-center gap-3 ${e.done ? 'opacity-60' : ''}`}>
      <span className="text-2xl leading-none shrink-0" aria-hidden>{e.icon}</span>
      <div className="flex-1 min-w-0">
        <Link href={e.href} className={`font-medium text-gray-900 hover:text-blue-600 ${e.done ? 'line-through' : ''}`}>{e.title}</Link>
        <div className="text-sm text-gray-600">
          {whenText(e.occursOn, today)}
          {e.detail && <> · {e.detail}</>}
        </div>
        {e.sms && !e.done && <p className="text-xs text-gray-500 mt-1 line-clamp-2">“{e.sms}”</p>}
      </div>
      <div className="flex flex-wrap gap-1 shrink-0">
        {c?.phone && (
          <>
            <a href={`tel:${dialable(c.phone)}`} title={`Call ${c.phone}`} className="p-2 rounded-lg border border-gray-200 hover:bg-blue-50"><Phone size={16} /></a>
            <a href={`sms:${dialable(c.phone)}${body ? `?&body=${body}` : ''}`} title="Text with the suggested message" className="p-2 rounded-lg border border-gray-200 hover:bg-blue-50"><MessageCircle size={16} /></a>
          </>
        )}
        {c?.email && (
          <a href={`mailto:${c.email}?subject=${encodeURIComponent(e.emailSubject ?? '')}${body ? `&body=${body}` : ''}`} title="Email with the suggested message"
            className="p-2 rounded-lg border border-gray-200 hover:bg-blue-50"><Mail size={16} /></a>
        )}
        {c && !c.do_not_contact && (
          <button onClick={() => onCompose(e)} title="Pick a different message" className="p-2 rounded-lg border border-gray-200 hover:bg-blue-50"><PenLine size={16} /></button>
        )}
        {e.completable && (
          <button onClick={() => onToggle(e)} disabled={busy}
            className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${e.done ? 'border border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-green-600 text-white hover:bg-green-700'}`}>
            {e.done ? <><Undo2 size={14} /> Undo</> : <><Check size={14} /> Done</>}
          </button>
        )}
      </div>
    </li>
  );
}

export default function CalendarPage() {
  const { user, profile, isAdmin, isBroker, loading: authLoading } = useAuth();
  const today = toYmd(new Date());
  const [mode, setMode] = useState<ViewMode>('agenda');
  const [month, setMonth] = useState(() => today.slice(0, 7)); // YYYY-MM
  const [selected, setSelected] = useState(today);
  const [filter, setFilter] = useState<Filter>('');
  const [showDone, setShowDone] = useState(false);
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const senderName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ');
  const me = useMemo(() => ({ name: senderName, phone: profile?.phone, email: user?.email }), [senderName, profile?.phone, user?.email]);
  const [composing, setComposing] = useState<CalEvent | null>(null);

  // One fetch covers the agenda window, the visible month and a year of export.
  const range = useMemo(() => {
    const monthStart = `${month}-01`;
    const monthEnd = toYmd(new Date(+month.slice(0, 4), +month.slice(5, 7), 0));
    const from = [addDaysYmd(today, -AGENDA_BACK), addDaysYmd(monthStart, -7)].sort()[0];
    const to = [addDaysYmd(today, 366), addDaysYmd(monthEnd, 7)].sort()[1];
    return { from, to, monthStart, monthEnd };
  }, [month, today]);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetchCalendarData(range.from, range.to);
    setError(r.error);
    setData(r);
    setLoading(false);
  }, [range.from, range.to]);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    fetchCalendarData(range.from, range.to).then((r) => {
      if (cancelled) return;
      setError(r.error);
      setData(r);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [authLoading, range.from, range.to]);

  const allEvents = useMemo(() => (data ? buildEvents(data, range.from, range.to, me, true) : []), [data, range.from, range.to, me]);
  const events = useMemo(() => {
    const kinds = FILTERS.find((f) => f.value === filter)!.kinds;
    return allEvents.filter((e) => (!kinds.length || kinds.includes(e.kind)) && (showDone || !e.done));
  }, [allEvents, filter, showDone]);

  const agenda = useMemo(() => {
    const weekEnd = addDaysYmd(today, 7);
    const horizon = addDaysYmd(today, AGENDA_AHEAD);
    const sections: { title: string; hint?: string; items: CalEvent[] }[] = [
      { title: 'Overdue', hint: 'Missed in the last 30 days, and follow-ups that are past due', items: [] },
      { title: 'Today', items: [] },
      { title: 'Next 7 days', items: [] },
      { title: 'Heads-up', hint: 'Further out, but inside their reminder window (like insurance renewals a month ahead)', items: [] },
      { title: `Later (through ${formatDate(horizon, { month: 'short', day: 'numeric' })})`, items: [] },
    ];
    for (const e of events) {
      if (e.occursOn < today) sections[0].items.push(e);
      else if (e.occursOn === today) sections[1].items.push(e);
      else if (e.occursOn <= weekEnd) sections[2].items.push(e);
      else if (e.remindFrom <= today) sections[3].items.push(e);
      else if (e.occursOn <= horizon) sections[4].items.push(e);
    }
    return sections;
  }, [events, today]);

  const byDay = useMemo(() => {
    const m = new Map<string, CalEvent[]>();
    events.forEach((e) => m.set(e.occursOn, [...(m.get(e.occursOn) ?? []), e]));
    return m;
  }, [events]);

  const weeks = useMemo(() => {
    const first = parseYmd(range.monthStart);
    const start = addDaysYmd(range.monthStart, -first.getDay());
    const days = daysBetween(start, range.monthEnd) + 1;
    const total = Math.ceil(days / 7) * 7;
    return Array.from({ length: total / 7 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDaysYmd(start, w * 7 + d)));
  }, [range.monthStart, range.monthEnd]);

  const toggle = async (e: CalEvent) => {
    if (!user) return;
    setBusy(true);
    const err = await setDone(e, !e.done, { id: user.id, name: senderName || user.email || 'Broker' });
    if (err) setError(err);
    await load();
    setBusy(false);
  };

  const exportIcs = () => {
    const year = allEvents.filter((e) => e.occursOn >= today && e.occursOn <= addDaysYmd(today, 365));
    downloadCsv(eventsToIcs(year), 'findanchome-client-calendar.ics', 'text/calendar;charset=utf-8');
  };

  const shiftMonth = (n: number) => {
    const d = new Date(+month.slice(0, 4), +month.slice(5, 7) - 1 + n, 1);
    setMonth(toYmd(d).slice(0, 7));
  };

  if (!authLoading && !isAdmin && !isBroker) {
    return <p className="text-gray-600">The calendar is available to brokers and admins.</p>;
  }

  const dueCount = agenda[0].items.filter((e) => !e.done).length + agenda[1].items.filter((e) => !e.done).length;
  const selectedEvents = byDay.get(selected) ?? [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="mt-1 text-gray-600">Birthdays, home anniversaries, insurance renewals and follow-ups for your clients, with a ready-to-send message for each.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={exportIcs} disabled={!data} title="Next 12 months, for Google Calendar, Apple Calendar or Outlook"
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
            <Download size={16} /> Add to my calendar (.ics)
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden self-start">
          {([['agenda', 'Agenda', List], ['month', 'Month', CalendarDays]] as const).map(([v, label, Icon]) => (
            <button key={v} onClick={() => setMode(v)} className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm ${mode === v ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
          {FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} className="rounded" /> Show handled
        </label>
        {dueCount > 0 && <span className="md:ml-auto text-sm font-medium text-red-600">{dueCount} to handle today</span>}
      </div>

      {loading && !data ? (
        <p className="p-8 text-center text-gray-500 bg-white border border-gray-200 rounded-xl">Loading calendar…</p>
      ) : mode === 'agenda' ? (
        <div className="space-y-6">
          {agenda.every((s) => s.items.length === 0) && (
            <div className="p-8 text-center text-gray-500 bg-white border border-gray-200 rounded-xl">
              Nothing coming up. Add birthdays, home anniversaries and insurance renewal dates on each{' '}
              <Link href="/dashboard/clients" className="text-blue-600 hover:underline">client&apos;s page</Link> and they&apos;ll show here.
            </div>
          )}
          {agenda.filter((s) => s.items.length).map((s) => (
            <section key={s.title}>
              <h2 className={`text-sm font-semibold uppercase tracking-wide mb-1 ${s.title === 'Overdue' ? 'text-red-600' : 'text-gray-500'}`}>
                {s.title} <span className="font-normal">({s.items.length})</span>
              </h2>
              {s.hint && <p className="text-xs text-gray-500 mb-2">{s.hint}</p>}
              <ul className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
                {s.items.map((e) => <EventRow key={`${e.key}|${e.occursOn}`} e={e} today={today} busy={busy} onToggle={toggle} onCompose={setComposing} />)}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => shiftMonth(-1)} aria-label="Previous month" className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"><ChevronLeft size={18} /></button>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">{formatDate(range.monthStart, { month: 'long', year: 'numeric' })}</h2>
              {month !== today.slice(0, 7) && (
                <button onClick={() => { setMonth(today.slice(0, 7)); setSelected(today); }} className="text-sm text-blue-600 hover:underline">Today</button>
              )}
            </div>
            <button onClick={() => shiftMonth(1)} aria-label="Next month" className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"><ChevronRight size={18} /></button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-7 bg-gray-50 text-xs font-medium text-gray-500 text-center">
              {WEEKDAYS.map((d) => <div key={d} className="py-2">{d}</div>)}
            </div>
            {weeks.map((week) => (
              <div key={week[0]} className="grid grid-cols-7 border-t border-gray-100">
                {week.map((day) => {
                  const list = byDay.get(day) ?? [];
                  const inMonth = day.slice(0, 7) === month;
                  return (
                    <button key={day} onClick={() => setSelected(day)}
                      className={`min-h-16 sm:min-h-24 p-1 sm:p-1.5 text-left align-top border-l border-gray-100 first:border-l-0 hover:bg-blue-50 ${selected === day ? 'bg-blue-50 ring-1 ring-inset ring-blue-400' : ''} ${inMonth ? '' : 'bg-gray-50/60'}`}>
                      <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs ${day === today ? 'bg-blue-600 text-white font-semibold' : inMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                        {+day.slice(8)}
                      </span>
                      {/* Icons only on phones, titles from sm up. */}
                      <div className="sm:hidden flex flex-wrap gap-0.5 mt-0.5 text-xs leading-none">{list.slice(0, 4).map((e) => <span key={e.key}>{e.icon}</span>)}</div>
                      <div className="hidden sm:block space-y-0.5 mt-0.5">
                        {list.slice(0, 3).map((e) => (
                          <div key={e.key} className={`text-xs truncate ${e.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{e.icon} {e.client ? e.client.first_name + ' ' + (e.client.last_name ?? '') : e.title}</div>
                        ))}
                        {list.length > 3 && <div className="text-xs text-gray-500">+{list.length - 3} more</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">{formatDate(selected, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
            {selectedEvents.length === 0 ? (
              <p className="p-6 text-center text-gray-500 bg-white border border-gray-200 rounded-xl text-sm">Nothing on this day.</p>
            ) : (
              <ul className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
                {selectedEvents.map((e) => <EventRow key={e.key} e={e} today={today} busy={busy} onToggle={toggle} onCompose={setComposing} />)}
              </ul>
            )}
          </section>
        </div>
      )}

      {composing?.client && user && (
        <MessageComposer
          client={composing.client}
          category={composing.category}
          extra={composing.mergeCtx}
          me={me}
          author={{ id: user.id, name: senderName || user.email || 'Broker' }}
          onClose={() => setComposing(null)}
        />
      )}
    </div>
  );
}
