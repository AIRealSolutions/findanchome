'use client';

import { Edit, Trash2, Plus, DollarSign, MapPin, Home } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function AdminProperties() {
  const [properties] = useState([
    {
      id: 1,
      address: '955 Mt Pisgah Rd SW, Supply, NC',
      price: 624900,
      beds: 3,
      baths: 2.5,
      county: 'Brunswick',
      status: 'active',
    },
    {
      id: 2,
      address: '129 Cape Fear Drive, Southport, NC',
      price: 479000,
      beds: 3,
      baths: 2,
      county: 'Brunswick',
      status: 'active',
    },
    {
      id: 3,
      address: '456 Beach Lane, Wilmington, NC',
      price: 549000,
      beds: 4,
      baths: 3,
      county: 'New Hanover',
      status: 'pending',
    },
    {
      id: 4,
      address: '789 Military Ave, Jacksonville, NC',
      price: 399000,
      beds: 3,
      baths: 2,
      county: 'Onslow',
      status: 'active',
    },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600 mt-2">Manage property listings across all counties</p>
        </div>
        <Link
          href="/admin/properties/new"
          className="flex items-center gap-2 bg-[#0ea5e9] text-white px-6 py-3 rounded-lg hover:opacity-90 font-medium transition-opacity"
        >
          <Plus size={20} />
          Add Property
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{property.address}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <MapPin size={16} />
                  {property.county} County
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  property.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {property.status}
              </span>
            </div>

            {/* Details */}
            <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">${(property.price / 1000).toFixed(0)}K</div>
                <div className="text-xs text-gray-600">Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{property.beds}</div>
                <div className="text-xs text-gray-600">Beds</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{property.baths}</div>
                <div className="text-xs text-gray-600">Baths</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link
                href={`/admin/properties/${property.id}/edit`}
                className="flex-1 flex items-center justify-center gap-2 bg-[#0ea5e9]/10 text-[#0ea5e9] px-4 py-2 rounded hover:bg-[#0ea5e9]/20 font-medium transition-colors"
              >
                <Edit size={16} />
                Edit
              </Link>
              <button className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded hover:bg-red-100 font-medium transition-colors">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
