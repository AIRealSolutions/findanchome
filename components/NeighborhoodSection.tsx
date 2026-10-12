import Link from 'next/link';
import { Flag, Hammer, MapPin } from 'lucide-react';
import { getLifestyle } from '@/lib/lifestyles';
import { getCommunityBySlug, communityPath } from '@/lib/communities';
import { NEIGHBORHOODS_UPDATED, STATUS_LABELS, type Neighborhood } from '@/lib/neighborhoods';

const STATUS_STYLES: Record<Neighborhood['status'], string> = {
  'new-construction': 'bg-emerald-100 text-emerald-800',
  'custom-lots': 'bg-sky-100 text-sky-800',
  'mostly-resale': 'bg-gray-100 text-gray-700',
  planned: 'bg-amber-100 text-amber-800',
};

export function NeighborhoodCard({ n, showNearest = true }: { n: Neighborhood; showNearest?: boolean }) {
  const lifestyles = n.lifestyles
    .map((s) => getLifestyle(s))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));
  const nearest = showNearest ? getCommunityBySlug(n.near[0]) : undefined;

  return (
    <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
        <h3 className="font-bold text-lg text-[#1e3a8a]">{n.name}</h3>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[n.status]}`}>
          {STATUS_LABELS[n.status]}
        </span>
      </div>
      <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
        <MapPin size={14} /> {n.town}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {n.golf && <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-800 border border-green-200">⛳ Golf</span>}
        {n.gated && <span className="text-xs px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">🔒 Gated</span>}
        {n.activeAdult && <span className="text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">55+</span>}
        {n.waterfront && <span className="text-xs px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">🚤 Water access</span>}
      </div>

      <p className="text-gray-700 text-sm leading-relaxed mb-3">{n.description}</p>

      {n.golf && (
        <p className="text-sm text-gray-700 mb-2 flex gap-2">
          <Flag size={16} className="text-green-700 shrink-0 mt-0.5" /> <span>{n.golf}</span>
        </p>
      )}
      {n.builders && n.builders.length > 0 && (
        <p className="text-sm text-gray-700 mb-2 flex gap-2">
          <Hammer size={16} className="text-[#0ea5e9] shrink-0 mt-0.5" /> <span>Builders: {n.builders.join(', ')}</span>
        </p>
      )}

      <ul className="flex flex-wrap gap-1.5 mb-4">
        {n.amenities.map((a) => (
          <li key={a} className="text-xs px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-700">{a}</li>
        ))}
      </ul>

      <div className="mt-auto pt-3 border-t border-gray-100 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        {lifestyles.map((l) => (
          <Link key={l.slug} href={`/lifestyle/${l.slug}`} className="text-[#0ea5e9] hover:underline">
            <span aria-hidden>{l.emoji}</span> {l.name}
          </Link>
        ))}
        {nearest && (
          <Link href={communityPath(nearest)} className="ml-auto font-semibold text-[#1e3a8a] hover:text-[#0ea5e9]">
            Near {nearest.name} →
          </Link>
        )}
      </div>
    </div>
  );
}

const GROUPS: { title: string; match: (n: Neighborhood) => boolean }[] = [
  { title: 'Golf Course Communities', match: (n) => Boolean(n.golf) && n.status !== 'planned' },
  { title: 'New Home Communities', match: (n) => !n.golf && n.status !== 'planned' },
  { title: 'Planned & Recently Approved', match: (n) => n.status === 'planned' },
];

export default function NeighborhoodSection({
  neighborhoods,
  title,
  intro,
  showNearest = true,
}: {
  neighborhoods: Neighborhood[];
  title: string;
  intro?: string;
  showNearest?: boolean;
}) {
  if (neighborhoods.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] mb-3">{title}</h2>
      {intro && <p className="text-gray-700 mb-8 max-w-3xl">{intro}</p>}
      <div className="space-y-10">
        {GROUPS.map((g) => {
          const items = neighborhoods.filter(g.match);
          if (items.length === 0) return null;
          return (
            <div key={g.title}>
              <h3 className="text-xl font-bold text-[#1e3a8a] mb-4">{g.title}</h3>
              <div className="grid md:grid-cols-2 gap-5">
                {items.map((n) => <NeighborhoodCard key={n.slug} n={n} showNearest={showNearest} />)}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-xs text-gray-500">
        Updated {NEIGHBORHOODS_UPDATED}. Builders, phases, amenities and availability change often. Contact us for current
        pricing and inventory, and bring your own agent to your first builder visit.
      </p>
    </div>
  );
}
