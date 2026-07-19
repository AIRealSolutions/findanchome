'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogOut, Menu, X, BarChart3, Users, Home, Calendar, FileText } from 'lucide-react';

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const crmMenuItems = [
    { label: 'Dashboard', href: '/crm', icon: BarChart3 },
    { label: 'Leads', href: '/crm/leads', icon: Users },
    { label: 'Properties', href: '/crm/properties', icon: Home },
    { label: 'Tasks', href: '/crm/tasks', icon: Calendar },
    { label: 'Reports', href: '/crm/reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] text-white shadow-lg">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/20 rounded"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-bold">Lightkeeper CRM</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Marc Spencer</span>
            <button className="p-2 hover:bg-white/20 rounded flex items-center gap-2">
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-white shadow-lg">
            <nav className="p-4">
              <div className="space-y-2">
                {crmMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#0ea5e9]/10 text-gray-700 hover:text-[#0ea5e9] transition-colors"
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <hr className="my-6" />

              <div className="space-y-2">
                <Link
                  href="/admin"
                  className="block px-4 py-2 text-sm text-gray-600 hover:text-[#0ea5e9] transition-colors"
                >
                  → Website Admin
                </Link>
                <Link
                  href="/"
                  className="block px-4 py-2 text-sm text-gray-600 hover:text-[#0ea5e9] transition-colors"
                >
                  → View Website
                </Link>
              </div>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
