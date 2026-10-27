'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import AdminDepartment from '@/components/admin/AdminDepartment';
import { deptMeta, type DeptKey } from '@/components/admin/departments';

export default function DepartmentPage() {
  const { dept } = useParams<{ dept: string }>();
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAdmin) return <p className="text-gray-600">The Control Center is for Lightkeeper admins.</p>;
  if (!deptMeta(dept)) return <p className="text-gray-600">No such department. <Link href="/dashboard" className="text-blue-600 hover:underline">Back to the Control Center</Link></p>;
  return (
    <Suspense fallback={<p className="text-gray-500">Loading…</p>}>
      <AdminDepartment dept={dept as DeptKey} />
    </Suspense>
  );
}
