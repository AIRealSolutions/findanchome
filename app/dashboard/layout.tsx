'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import Image from 'next/image';
import {
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, signOut, isAdmin, isBroker } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
    { name: 'Properties', href: '/dashboard/properties', icon: BuildingOfficeIcon, roles: ['admin', 'broker'] },
    { name: 'Clients', href: '/dashboard/clients', icon: UserGroupIcon, roles: ['admin', 'broker'] },
    { name: 'Events Log', href: '/dashboard/events', icon: ClipboardDocumentListIcon, roles: ['admin'] },
    { name: 'Reports', href: '/dashboard/reports', icon: ChartBarIcon, roles: ['admin', 'broker'] },
    { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon, roles: ['admin', 'broker', 'client'] },
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
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <Image
            src="/lightkeeper-logo.png"
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
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
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
                {item.name}
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
      <div className="pl-64">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
