'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogOut, Menu, X, Home, Settings, FileText, Layers } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const adminMenuItems = [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Pages', href: '/admin/pages', icon: FileText },
    { label: 'Properties', href: '/admin/properties', icon: Layers },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#1e3a8a] text-white shadow-lg">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-[#0ea5e9] rounded"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-bold">FindaNChome Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Admin User</span>
            <button className="p-2 hover:bg-[#0ea5e9] rounded flex items-center gap-2">
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
                {adminMenuItems.map((item) => {
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
