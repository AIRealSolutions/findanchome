'use client';

import { Plus, Edit, Trash2, Mail, Phone, MapPin, Loader } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { leadsService, Lead } from '@/lib/services/leads';

export default function CRMLeads() {
  const { user, loading: authLoading } = useAuth('broker');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLeads() {
      if (!user) return;
      try {
        const { data } = await leadsService.getLeads(user.id, 100);
        setLeads(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load leads');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchLeads();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={32} className="animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    new: 'bg-gray-100 text-gray-700',
    contacted: 'bg-blue-100 text-blue-700',
    qualified: 'bg-green-100 text-green-700',
    scheduled: 'bg-purple-100 text-purple-700',
    offer_pending: 'bg-orange-100 text-orange-700',
    closed: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700',
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day ago';
    return `${diff}d ago`;
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
        {leads.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <p className="text-gray-600">No leads yet. Create one to get started.</p>
          </div>
        ) : (
          leads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="grid md:grid-cols-5 gap-6 items-center">
                {/* Name & Status */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{lead.name}</h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                      statusColors[lead.status || 'new']
                    }`}
                  >
                    {(lead.status || 'new').replace('_', ' ').charAt(0).toUpperCase() +
                      (lead.status || 'new').replace('_', ' ').slice(1)}
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
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={16} />
                      <a href={`tel:${lead.phone}`} className="hover:text-[#0ea5e9]">
                        {lead.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Location & Budget */}
                <div>
                  {lead.county && (
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin size={16} />
                      <span>{lead.county}</span>
                    </div>
                  )}
                  {lead.budget && <div className="text-sm text-gray-600">Budget: {lead.budget}</div>}
                </div>

                {/* Date */}
                <div className="text-sm text-gray-600">{formatDate(lead.created_at)}</div>

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
          ))
        )}
      </div>
    </div>
  );
}
