'use client';

import { Plus, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function CRMLeads() {
  const [leads] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john@example.com',
      phone: '(910) 555-0101',
      status: 'contacted',
      county: 'Brunswick',
      budget: '$400K - $600K',
      created: '2 days ago',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '(910) 555-0102',
      status: 'qualified',
      county: 'New Hanover',
      budget: '$250K - $350K',
      created: '1 day ago',
    },
    {
      id: 3,
      name: 'Mike Davis',
      email: 'mike@example.com',
      phone: '(910) 555-0103',
      status: 'scheduled',
      county: 'Onslow',
      budget: '$350K - $500K',
      created: '3 days ago',
    },
    {
      id: 4,
      name: 'Emily Chen',
      email: 'emily@example.com',
      phone: '(910) 555-0104',
      status: 'offer_pending',
      county: 'Pender',
      budget: '$500K - $750K',
      created: '5 days ago',
    },
  ]);

  const statusColors: Record<string, string> = {
    new: 'bg-gray-100 text-gray-700',
    contacted: 'bg-blue-100 text-blue-700',
    qualified: 'bg-green-100 text-green-700',
    scheduled: 'bg-purple-100 text-purple-700',
    offer_pending: 'bg-orange-100 text-orange-700',
    closed: 'bg-green-100 text-green-700',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-2">Manage and track all your leads</p>
        </div>
        <Link
          href="/crm/leads/new"
          className="flex items-center gap-2 bg-[#0ea5e9] text-white px-6 py-3 rounded-lg hover:opacity-90 font-medium transition-opacity"
        >
          <Plus size={20} />
          Add Lead
        </Link>
      </div>

      <div className="space-y-4">
        {leads.map((lead) => (
          <div key={lead.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="grid md:grid-cols-5 gap-6 items-center">
              {/* Name & Status */}
              <div>
                <h3 className="font-bold text-lg text-gray-900">{lead.name}</h3>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                    statusColors[lead.status]
                  }`}
                >
                  {lead.status.replace('_', ' ').charAt(0).toUpperCase() + lead.status.replace('_', ' ').slice(1)}
                </span>
              </div>

              {/* Contact */}
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Mail size={16} />
                  <a href={`mailto:${lead.email}`} className="hover:text-[#0ea5e9]">
                    {lead.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} />
                  <a href={`tel:${lead.phone}`} className="hover:text-[#0ea5e9]">
                    {lead.phone}
                  </a>
                </div>
              </div>

              {/* Location & Budget */}
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin size={16} />
                  <span>{lead.county} County</span>
                </div>
                <div className="text-sm text-gray-600">Budget: {lead.budget}</div>
              </div>

              {/* Date */}
              <div className="text-sm text-gray-600">{lead.created}</div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Link
                  href={`/crm/leads/${lead.id}`}
                  className="text-gray-600 hover:text-[#0ea5e9] transition-colors p-2"
                  title="View lead"
                >
                  <Edit size={18} />
                </Link>
                <button className="text-gray-600 hover:text-red-600 transition-colors p-2" title="Delete lead">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
