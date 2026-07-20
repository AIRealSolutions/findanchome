'use client';

import { TrendingUp, Users, DollarSign, CheckCircle, Phone, Mail, Calendar, Home, Loader } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { leadsService, Lead } from '@/lib/services/leads';

export default function CRMDashboard() {
  const { user, loading: authLoading } = useAuth('broker');
  const [stats, setStats] = useState([
    { label: 'Total Leads', value: '0', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active Deals', value: '0', icon: TrendingUp, color: 'bg-green-100 text-green-600' },
    { label: 'This Month Sales', value: '$0', icon: DollarSign, color: 'bg-orange-100 text-orange-600' },
    { label: 'Closed Deals', value: '0', icon: CheckCircle, color: 'bg-purple-100 text-purple-600' },
  ]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;
      try {
        const { data, count } = await leadsService.getLeads(user.id, 100);

        const closedCount = (data || []).filter(l => l.status === 'closed').length;
        const contactedCount = (data || []).filter(l =>
          ['contacted', 'qualified', 'scheduled', 'offer_pending'].includes(l.status || '')
        ).length;

        setStats([
          { ...stats[0], value: String(count || 0) },
          { ...stats[1], value: String(contactedCount) },
          { ...stats[2], value: '$0' },
          { ...stats[3], value: String(closedCount) },
        ]);

        const recent = (data || []).slice(0, 4);
        setRecentLeads(recent);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchDashboardData();
    }
  }, [user, authLoading]);

  const statusColors: Record<string, string> = {
    contacted: 'bg-blue-100 text-blue-700',
    qualified: 'bg-green-100 text-green-700',
    scheduled: 'bg-purple-100 text-purple-700',
    offer_pending: 'bg-orange-100 text-orange-700',
  };

  const formatDaysAgo = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return diff === 0 ? 'Today' : `${diff}d ago`;
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={32} className="animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Broker Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your leads, deals, and pipeline</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
                <Icon size={24} />
              </div>
              <h3 className="text-gray-600 text-sm font-medium">{stat.label}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Leads</h2>
            <Link href="/crm/leads" className="text-[#0ea5e9] hover:underline text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {recentLeads.length === 0 ? (
              <p className="text-gray-600 text-sm">No leads yet.</p>
            ) : (
              recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                  <div>
                    <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          statusColors[lead.status || 'new'] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {(lead.status || 'new').replace('_', ' ').charAt(0).toUpperCase() +
                          (lead.status || 'new').replace('_', ' ').slice(1)}
                      </span>
                      {lead.county && <span>{lead.county}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{formatDaysAgo(lead.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/crm/leads/new"
              className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-[#0ea5e9] font-medium transition-colors flex items-center gap-2"
            >
              <Users size={18} />
              Add New Lead
            </Link>
            <Link
              href="/crm/tasks/new"
              className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg text-green-600 font-medium transition-colors flex items-center gap-2"
            >
              <Calendar size={18} />
              Schedule Task
            </Link>
            <Link
              href="/crm/properties"
              className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-600 font-medium transition-colors flex items-center gap-2"
            >
              <Home size={18} />
              Browse Properties
            </Link>
            <Link
              href="/crm/reports"
              className="block p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-orange-600 font-medium transition-colors flex items-center gap-2"
            >
              <TrendingUp size={18} />
              View Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
