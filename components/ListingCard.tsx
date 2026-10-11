import Link from 'next/link';
import { Bed, Bath, Ruler, MapPin } from 'lucide-react';
import { type Listing, formatPrice, listingImages, listingPath, listingTypeLabel, propertyTypeLabel } from '@/lib/listings';

export default function ListingCard({ listing }: { listing: Listing }) {
  const image = listingImages(listing)[0];
  const badge = listingTypeLabel(listing.listing_type);
  return (
    <Link
      href={listingPath(listing)}
      className="group bg-white border-2 border-gray-200 hover:border-[#0ea5e9] rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col"
    >
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-cyan-100">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={listing.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🏡</div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          {badge && <span className="bg-[#fbbf24] text-[#1e3a8a] text-xs font-bold px-2 py-1 rounded">{badge}</span>}
          {listing.status === 'pending' && <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">Pending</span>}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="text-2xl font-bold text-[#1e3a8a]">{formatPrice(listing.price)}</div>
        <h2 className="font-semibold text-gray-900 group-hover:text-[#0ea5e9] mt-1">{listing.title}</h2>
        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
          <MapPin className="w-4 h-4" /> {listing.city}, {listing.state} {listing.zip_code}
        </p>
        <div className="flex gap-4 text-sm text-gray-700 mt-3">
          {listing.bedrooms != null && <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {listing.bedrooms} bd</span>}
          {listing.bathrooms != null && <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {listing.bathrooms} ba</span>}
          {listing.square_feet != null && <span className="flex items-center gap-1"><Ruler className="w-4 h-4" /> {listing.square_feet.toLocaleString()} sqft</span>}
        </div>
        <div className="text-xs text-gray-500 mt-3">{propertyTypeLabel(listing.property_type)}</div>
      </div>
    </Link>
  );
}
