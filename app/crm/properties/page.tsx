'use client';

import { Plus, MapPin, DollarSign, Home, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function CRMProperties() {
  const [properties] = useState([
    {
      id: 1,
      address: '955 Mt Pisgah Rd SW, Supply, NC',
      price: 624900,
      beds: 3,
      baths: 2.5,
      county: 'Brunswick',
      status: 'showing',
      agent_assigned: 'Marc Spencer',
    },
    {
      id: 2,
      address: '129 Cape Fear Drive, Southport, NC',
      price: 479000,
      beds: 3,
      baths: 2,
      county: 'Brunswick',
      status: 'active',
      agent_assigned: 'Marc Spencer',
    },
    {
      id: 3,
      address: '456 Beach Lane, Wilmington, NC',
      price: 549000,
      beds: 4,
      baths: 3,
      county: 'New Hanover',
      status: 'under_contract',
      agent_assigned: 'Marc Spencer',
    },
  ]);

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    showing: 'bg-blue-100 text-blue-700',
    under_contract: 'bg-orange-100 text-orange-700',
    sold: 'bg-purple-100 text-purple-700',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600 mt-2">Manage your property listings and showings</p>
        </div>
        <Link
          href="/crm/properties/new"
          className="flex items-center gap-2 bg-[#0ea5e9] text-white px-6 py-3 rounded-lg hover:opacity-90 font-medium transition-opacity"
        >
          <Plus size={20} />
          Add Property
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {properties.map((property) => (
          <Link
            key={property.id}
            href={`/crm/properties/${property.id}`}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group"
          >
            {/* Header */}
            <div className="mb-4">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#0ea5e9] transition-colors">
                {property.address}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <MapPin size={16} />
                {property.county} County
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
              <div>
                <div className="text-2xl font-bold text-gray-900">${(property.price / 1000).toFixed(0)}K</div>
                <div className="text-xs text-gray-600">Price</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{property.beds}</div>
                <div className="text-xs text-gray-600">Beds</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{property.baths}</div>
                <div className="text-xs text-gray-600">Baths</div>
              </div>
            </div>

            {/* Status & Agent */}
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[property.status]}`}>
                {property.status.replace('_', ' ')}
              </span>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <UserCheck size={16} />
                {property.agent_assigned}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
