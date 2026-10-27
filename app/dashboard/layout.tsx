'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { OPEN_LISTING_STAGES } from '@/lib/listings';
import { ViewAsProvider, useViewAs, type ViewRole } from '@/lib/view-as';
import { DEPARTMENTS, type DeptKey } from '@/components/admin/departments';
import Link from 'next/link';
import Image from 'next/image';
import {
  HomeIcon,
  BuildingOfficeIcon,
  InboxStackIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  HomeModernIcon,
  MegaphoneIcon,
  PresentationChartLineIcon,
  ChartBarIcon,
  CalculatorIcon,
  IdentificationIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewAsProvider>
      <DashboardShell>{children}</DashboardShell>
    </ViewAsProvider>
  );
}

const VIEW_LABELS: Record<ViewRole, string> = { admin: 'Admin', broker: 'Broker', client: 'Client' };

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut, isAdmin, isBroker } = useAuth();
  const { viewAs, canSwitch, setViewAs } = useViewAs();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [newLeads, setNewLeads] = useState(0);
  const [listingTodo, setListingTodo] = useState(0);
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

  // Listings badge: submissions waiting for review (admins) plus my follow-ups due today or overdue.
  useEffect(() => {
    if (!isStaff || !user) return;
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const supabase = createClient();
    Promise.all([
      isAdmin ? supabase.from('fanc_listing_opportunities').select('id').eq('review_status', 'pending_review').limit(500) : Promise.resolve({ data: [] }),
      supabase.from('fanc_listing_opportunities').select('id').eq('review_status', 'approved').eq('assigned_to', user.id)
        .in('stage', OPEN_LISTING_STAGES).lte('follow_up_at', endOfToday.toISOString()).limit(500),
    ]).then(([pending, due]) => setListingTodo((pending.data?.length ?? 0) + (due.data?.length ?? 0)));
  }, [isStaff, isAdmin, user, pathname]);

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

  // Admins navigate by department; brokers by what they do every day; clients get a short list.
  type NavItem = { name: string; href: string; icon: typeof HomeIcon; badge?: number };
  const TOOL_ICONS: Record<string, typeof HomeIcon> = {
    '/dashboard/listings': HomeModernIcon, '/dashboard/leads': InboxStackIcon, '/dashboard/clients': UserGroupIcon,
    '/dashboard/deals': BriefcaseIcon, '/dashboard/calendar': CalendarDaysIcon, '/dashboard/marketing': MegaphoneIcon,
    '/dashboard/properties': BuildingOfficeIcon,
  };
  const DEPT_ICONS: Record<DeptKey, typeof HomeIcon> = {
    executive: PresentationChartLineIcon, sales: ChartBarIcon, marketing: MegaphoneIcon, accounting: CalculatorIcon,
    hr: IdentificationIcon, operations: Cog6ToothIcon,
  };
  const BADGES: Record<string, number> = { '/dashboard/leads': newLeads, '/dashboard/listings': listingTodo };
  const tool = (t: { name: string; href: string }): NavItem => ({ ...t, icon: TOOL_ICONS[t.href] ?? HomeIcon, badge: BADGES[t.href] });
  const toolsOf = (k: DeptKey) => DEPARTMENTS.find((d) => d.key === k)!.tools.map(tool);

  const groups: { heading?: string; items: NavItem[] }[] =
    viewAs === 'admin'
      ? DEPARTMENTS.map((d) => ({
          heading: d.label,
          items: [{ name: d.key === 'executive' ? 'Control Center' : `${d.label} overview`, href: d.href, icon: DEPT_ICONS[d.key] }, ...d.tools.map(tool)],
        }))
      : viewAs === 'broker'
        ? [
            { items: [{ name: 'My dashboard', href: '/dashboard', icon: HomeIcon }] },
            { heading: 'Sales', items: toolsOf('sales') },
            { heading: 'Marketing', items: toolsOf('marketing') },
          ]
        : [{ items: [
            { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
            { name: 'My deals', href: '/dashboard/my-deals', icon: BriefcaseIcon },
            { name: 'Refer a seller', href: '/dashboard/listings/new', icon: HomeModernIcon },
          ] }];

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
              {viewAs === 'admin' && 'Lightkeeper Control Center'}
              {viewAs === 'broker' && 'Broker Portal'}
              {viewAs === 'client' && 'Client Portal'}
            </p>
          </div>
        </div>

        {/* Admins can look at the broker and client dashboards. */}
        {canSwitch && (
          <div className="px-4 pt-4">
            <p className="text-xs font-medium text-gray-500 mb-1">View as</p>
            <div className="grid grid-cols-3 gap-1 bg-gray-100 rounded-lg p-1">
              {(['admin', 'broker', 'client'] as ViewRole[]).map((r) => (
                <button key={r} onClick={() => { setViewAs(r); router.push('/dashboard'); }}
                  className={`py-1 rounded-md text-xs ${viewAs === r ? 'bg-white shadow font-medium text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>
                  {VIEW_LABELS[r]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-3 overflow-y-auto max-h-[calc(100vh-15rem)]">
          {groups.map((g, gi) => (
            <div key={g.heading ?? gi} className={gi ? 'mt-3' : ''}>
              {g.heading && <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{g.heading}</p>}
              <div className="space-y-0.5">
                {g.items.map((item) => {
                  const isActive = item.href === '/dashboard' ? pathname === item.href : pathname === item.href || pathname?.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1">{item.name}</span>
                      {item.badge ? (
                        <span className="min-w-6 px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-semibold text-center">{item.badge}</span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
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
        {canSwitch && viewAs !== 'admin' && (
          <div className="bg-amber-100 border-b border-amber-200 text-amber-900 text-sm px-4 sm:px-8 py-2 flex flex-wrap items-center gap-2">
            <span>You’re previewing the <strong>{VIEW_LABELS[viewAs].toLowerCase()}</strong> dashboard. You still have admin access to the data.</span>
            <button onClick={() => { setViewAs('admin'); router.push('/dashboard'); }} className="underline font-medium">Back to the Control Center</button>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
