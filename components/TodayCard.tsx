'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { addDaysYmd, buildEvents, fetchCalendarData, toYmd, type CalEvent } from '@/lib/calendar';

/** Dashboard home card: calendar items due today or missed in the last 30 days. */
export default function TodayCard() {
  const [items, setItems] = useState<CalEvent[] | null>(null);
  const [upcoming, setUpcoming] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const today = toYmd(new Date());
    const from = addDaysYmd(today, -30);
    const to = addDaysYmd(today, 7);
    fetchCalendarData(from, to).then((data) => {
      if (cancelled) return;
      const events = buildEvents(data, from, to, { name: '' }, true).filter((e) => !e.done);
      setItems(events.filter((e) => e.occursOn <= today));
      setUpcoming(events.filter((e) => e.occursOn > today).length);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!items) return null;

  return (
    <div className="mb-8 bg-white border border-gray-200 rounded-xl p-6 shadow">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <CalendarDaysIcon className="w-8 h-8 text-pink-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {items.length ? `${items.length} client ${items.length === 1 ? 'touch' : 'touches'} to make today` : 'All caught up today'}
            </h2>
            <p className="text-sm text-gray-600">{upcoming} more in the next 7 days</p>
          </div>
        </div>
        <Link href="/dashboard/calendar" className="text-sm font-medium text-blue-600 hover:text-blue-800 shrink-0">Open calendar →</Link>
      </div>
      {items.length > 0 && (
        <ul className="divide-y divide-gray-100">
          {items.slice(0, 6).map((e) => (
            <li key={`${e.key}|${e.occursOn}`} className="py-2 flex items-center gap-3 text-sm">
              <span aria-hidden>{e.icon}</span>
              <Link href={e.href} className="flex-1 min-w-0 truncate text-gray-900 hover:text-blue-600">{e.title}</Link>
              <span className={`shrink-0 text-xs ${e.occursOn < toYmd(new Date()) ? 'text-red-600' : 'text-gray-500'}`}>
                {e.occursOn < toYmd(new Date()) ? 'overdue' : 'today'}
              </span>
            </li>
          ))}
          {items.length > 6 && <li className="pt-2 text-sm text-gray-500">+{items.length - 6} more on the calendar</li>}
        </ul>
      )}
    </div>
  );
}
