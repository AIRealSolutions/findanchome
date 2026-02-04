'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, MapPin, Home, DollarSign, Calendar } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  county: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  lot_size: number;
  year_built: number;
  price: number;
  original_price: number;
  hud_case_number: string;
  status: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchProperty();
    }
  }, [params.id]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from('fanc_properties')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('fanc_properties')
        .delete()
        .eq('id', params.id);

      if (error) throw error;

      // Log event
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('fanc_events').insert({
          event_type: 'property_deleted',
          event_category: 'property',
          actor_id: user.id,
          target_type: 'property',
          target_id: params.id,
          property_id: params.id,
          title: 'Property deleted',
          description: `Property "${property?.title}" was deleted`
        });
      }

      router.push('/dashboard/properties');
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading property...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <Link
            href="/dashboard/properties"
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/properties"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Properties
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {property.address_line1}, {property.city}, {property.state} {property.zip_code}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/properties/${property.id}/edit`}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-3 mb-8">
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          property.status === 'active' ? 'bg-green-100 text-green-800' :
          property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          property.status === 'sold' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {property.status.toUpperCase()}
        </span>
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 capitalize">
          {property.listing_type}
        </span>
        {property.is_featured && (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
            ⭐ FEATURED
          </span>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <DollarSign className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Price</h2>
            </div>
            <div className="text-4xl font-bold text-gray-900">
              ${property.price.toLocaleString()}
            </div>
            {property.original_price && property.original_price !== property.price && (
              <div className="text-sm text-gray-500 mt-1">
                Original: ${property.original_price.toLocaleString()}
              </div>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{property.description}</p>
            </div>
          )}

          {/* Property Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Home className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Property Details</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Property Type</div>
                <div className="text-base font-medium text-gray-900 capitalize">
                  {property.property_type?.replace('_', ' ')}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Bedrooms</div>
                <div className="text-base font-medium text-gray-900">
                  {property.bedrooms || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Bathrooms</div>
                <div className="text-base font-medium text-gray-900">
                  {property.bathrooms || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Square Feet</div>
                <div className="text-base font-medium text-gray-900">
                  {property.square_feet ? property.square_feet.toLocaleString() : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Lot Size</div>
                <div className="text-base font-medium text-gray-900">
                  {property.lot_size ? `${property.lot_size} acres` : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Year Built</div>
                <div className="text-base font-medium text-gray-900">
                  {property.year_built || 'N/A'}
                </div>
              </div>
              {property.county && (
                <div>
                  <div className="text-sm text-gray-600">County</div>
                  <div className="text-base font-medium text-gray-900">
                    {property.county}
                  </div>
                </div>
              )}
              {property.hud_case_number && (
                <div>
                  <div className="text-sm text-gray-600">HUD Case Number</div>
                  <div className="text-base font-medium text-gray-900">
                    {property.hud_case_number}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <MapPin className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Location</h2>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-600">Street Address</div>
                <div className="text-base font-medium text-gray-900">
                  {property.address_line1}
                  {property.address_line2 && `, ${property.address_line2}`}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">City, State ZIP</div>
                <div className="text-base font-medium text-gray-900">
                  {property.city}, {property.state} {property.zip_code}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Timestamps */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Calendar className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Timeline</h2>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Created</div>
                <div className="text-base font-medium text-gray-900">
                  {new Date(property.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Last Updated</div>
                <div className="text-base font-medium text-gray-900">
                  {new Date(property.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href={`/properties/${property.id}`}
                target="_blank"
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View on Website
              </Link>
              <button
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/properties/${property.id}`)}
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Copy Link
              </button>
            </div>
          </div>

          {/* Property ID */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Property ID</div>
            <div className="text-xs font-mono text-gray-900 break-all">
              {property.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
