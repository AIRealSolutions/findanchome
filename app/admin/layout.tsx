'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Menu, X, Home, Settings, FileText, Layers, Loader } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { authService } from '@/lib/services/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth('admin');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await authService.signOut();
      router.push('/auth/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const adminMenuItems = [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Pages', href: '/admin/pages', icon: FileText },
    { label: 'Properties', href: '/admin/properties', icon: Layers },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size={32} className="animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

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
            <span className="text-sm">{user?.full_name || 'Admin'}</span>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="p-2 hover:bg-[#0ea5e9] rounded flex items-center gap-2 disabled:opacity-50"
            >
              <LogOut size={20} />
              {loggingOut ? 'Logging out...' : 'Logout'}
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
