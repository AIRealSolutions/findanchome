'use client';

import { TrendingUp, Users, DollarSign, CheckCircle, Download } from 'lucide-react';

export default function CRMReports() {
  const reports = [
    {
      title: 'Monthly Sales Report',
      description: 'Total sales, leads converted, and revenue',
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Lead Pipeline',
      description: 'Leads by status and conversion rates',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Performance Metrics',
      description: 'Your KPIs and performance trends',
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Closed Deals',
      description: 'Properties sold and closing details',
      icon: CheckCircle,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  const monthlyData = [
    { month: 'Jan', leads: 45, converted: 8, revenue: '$1.2M' },
    { month: 'Feb', leads: 52, converted: 10, revenue: '$1.5M' },
    { month: 'Mar', leads: 38, converted: 6, revenue: '$900K' },
    { month: 'Apr', leads: 61, converted: 12, revenue: '$2.1M' },
    { month: 'May', leads: 58, converted: 11, revenue: '$1.9M' },
    { month: 'Jun', leads: 72, converted: 14, revenue: '$2.4M' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">Track your performance and sales metrics</p>
      </div>

      {/* Report Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {reports.map((report, idx) => {
          const Icon = report.icon;
          return (
            <div key={idx} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-lg ${report.color} flex items-center justify-center`}>
                  <Icon size={24} />
                </div>
                <button className="text-gray-600 hover:text-[#0ea5e9] transition-colors">
                  <Download size={20} />
                </button>
              </div>
              <h3 className="font-bold text-lg text-gray-900">{report.title}</h3>
              <p className="text-gray-600 text-sm mt-2">{report.description}</p>
              <button className="mt-4 text-[#0ea5e9] font-medium hover:underline">
                View Report →
              </button>
            </div>
          );
        })}
      </div>

      {/* Monthly Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">6-Month Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Month</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Leads</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Converted</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {monthlyData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{row.month}</td>
                  <td className="px-6 py-4 text-gray-600">{row.leads}</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {row.converted}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{row.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
