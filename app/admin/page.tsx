'use client';

import { Users, Home, FileText, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Leads', value: '1,234', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Properties', value: '456', icon: Home, color: 'bg-green-100 text-green-600' },
    { label: 'Pages', value: '19', icon: FileText, color: 'bg-purple-100 text-purple-600' },
    { label: 'Conversions', value: '89', icon: TrendingUp, color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your website, properties, and leads</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
                <Icon size={24} />
              </div>
              <h3 className="text-gray-600 text-sm font-medium">{stat.label}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/pages"
              className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-[#0ea5e9] font-medium transition-colors"
            >
              → Edit Website Pages
            </Link>
            <Link
              href="/admin/properties"
              className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg text-green-600 font-medium transition-colors"
            >
              → Manage Properties
            </Link>
            <Link
              href="/crm"
              className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-600 font-medium transition-colors"
            >
              → View CRM
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>New lead: John Smith</span>
              <span className="text-gray-400">2 hours ago</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Property added: Southport home</span>
              <span className="text-gray-400">4 hours ago</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Page updated: Onslow County</span>
              <span className="text-gray-400">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
