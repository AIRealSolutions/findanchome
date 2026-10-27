'use client';

import { Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useViewAs } from '@/lib/view-as';
import AdminDepartment from '@/components/admin/AdminDepartment';
import BrokerHome from '@/components/BrokerHome';
import ClientHome from '@/components/ClientHome';

/** The admin's Control Center, a broker's own dashboard, or a client's home (admins can switch with "View as"). */
export default function DashboardPage() {
  const { loading } = useAuth();
  const { viewAs } = useViewAs();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (viewAs === 'admin') {
    return (
      <Suspense fallback={<p className="text-gray-500">Loading…</p>}>
        <AdminDepartment dept="executive" />
      </Suspense>
    );
  }
  return viewAs === 'broker' ? <BrokerHome /> : <ClientHome />;
}
