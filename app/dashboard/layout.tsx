'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import Image from 'next/image';
import {
  HomeIcon,
  BuildingOfficeIcon,
  InboxStackIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, signOut, isAdmin, isBroker } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [newLeads, setNewLeads] = useState(0);
  const isStaff = isAdmin || isBroker;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Close the mobile menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  // Badge with the number of new consultation leads; refreshed on navigation.
  useEffect(() => {
    if (!isStaff) return;
    createClient()
      .from('fanc_consultation_requests')
      .select('id')
      .eq('status', 'new')
      .limit(500)
      .then(({ data }) => setNewLeads(data?.length ?? 0));
  }, [isStaff, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'broker', 'client'] },
    { name: 'Leads', href: '/dashboard/leads', icon: InboxStackIcon, roles: ['admin', 'broker'], badge: newLeads },
    { name: 'Clients', href: '/dashboard/clients', icon: UserGroupIcon, roles: ['admin', 'broker'] },
    { name: 'Deals', href: '/dashboard/deals', icon: BriefcaseIcon, roles: ['admin', 'broker'] },
    { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarDaysIcon, roles: ['admin', 'broker'] },
    { name: 'Properties', href: '/dashboard/properties', icon: BuildingOfficeIcon, roles: ['admin', 'broker'] },
  ];

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(profile.role)
  );

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <Link href="/dashboard" className="font-bold text-gray-900">FindaNChome</Link>
        <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="p-2 -mr-2 text-gray-700">
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>
      {menuOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMenuOpen(false)} />}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="lg:hidden absolute top-4 right-3 p-1 text-gray-500">
          <XMarkIcon className="w-6 h-6" />
        </button>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <Image
            src="/lightkeeper-logo.jpg"
            alt="Lightkeeper Realty"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h1 className="text-lg font-bold text-gray-900">FindaNChome</h1>
            <p className="text-xs text-gray-500">
              {profile.role === 'admin' && 'Admin Portal'}
              {profile.role === 'broker' && 'Broker Portal'}
              {profile.role === 'client' && 'Client Portal'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = item.href === '/dashboard' ? pathname === item.href : pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.name}</span>
                {'badge' in item && item.badge ? (
                  <span className="min-w-6 px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-semibold text-center">{item.badge}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Sign Out */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {profile.first_name?.[0] || profile.role[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile.first_name} {profile.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
