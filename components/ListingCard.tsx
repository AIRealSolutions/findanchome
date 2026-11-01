import Link from 'next/link';
import { Bath, BedDouble, Home, Ruler } from 'lucide-react';
import { formatPrice, type MlsListing } from '@/lib/mls';

export default function ListingCard({ listing: l }: { listing: MlsListing }) {
  return (
    <Link
      href={`/listings/${encodeURIComponent(l.key)}`}
      className="group block bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-[#0ea5e9] transition"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        {l.photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element -- MLS photo hosts vary; next/image would need each one allow-listed
          <img src={l.photos[0]} alt={l.address || 'Listing photo'} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400"><Home className="w-12 h-12" /></div>
        )}
        {l.status && l.status !== 'Active' && (
          <span className="absolute top-2 left-2 bg-[#fbbf24] text-[#1e3a8a] text-xs font-bold px-2 py-1 rounded">{l.status}</span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xl font-bold text-[#1e3a8a]">{formatPrice(l.price)}</p>
        <p className="font-medium text-gray-900 truncate group-hover:text-[#0ea5e9]">{l.address}</p>
        <p className="text-sm text-gray-600 truncate">{[l.city, l.state, l.zip].filter(Boolean).join(', ')}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-700">
          {l.beds != null && <span className="inline-flex items-center gap-1"><BedDouble size={15} /> {l.beds} bd</span>}
          {l.baths != null && <span className="inline-flex items-center gap-1"><Bath size={15} /> {l.baths} ba</span>}
          {l.sqft != null && <span className="inline-flex items-center gap-1"><Ruler size={15} /> {l.sqft.toLocaleString()} sqft</span>}
          {l.sqft == null && l.acres != null && <span>{l.acres} acres</span>}
        </div>
        {l.listOffice && <p className="text-xs text-gray-500 mt-3 truncate">Listing courtesy of {l.listOffice}</p>}
      </div>
    </Link>
  );
}
