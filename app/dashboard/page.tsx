'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
import Link from 'next/link';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  totalClients: number;
  newClientsThisMonth: number;
  recentEvents: number;
}

export default function DashboardPage() {
  const { profile, isAdmin, isBroker } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeProperties: 0,
    totalClients: 0,
    newClientsThisMonth: 0,
    recentEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch properties count
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      const { count: activeProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch clients count
      const { count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // Fetch new clients this month
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const { count: newClientsThisMonth } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth.toISOString());

      // Fetch recent events count
      const { count: recentEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      setStats({
        totalProperties: totalProperties || 0,
        activeProperties: activeProperties || 0,
        totalClients: totalClients || 0,
        newClientsThisMonth: newClientsThisMonth || 0,
        recentEvents: recentEvents || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.first_name || 'Admin'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your real estate business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProperties}</p>
              <p className="text-sm text-gray-500 mt-1">{stats.activeProperties} active</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalClients}</p>
              <p className="text-sm text-green-600 mt-1">+{stats.newClientsThisMonth} this month</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Activity</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.recentEvents}</p>
              <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow p-6 text-white">
          <p className="text-sm font-medium opacity-90">Quick Actions</p>
          <div className="mt-4 space-y-2">
            <Link
              href="/dashboard/properties/new"
              className="flex items-center gap-2 text-sm hover:underline"
            >
              <PlusIcon className="w-4 h-4" />
              Add Property
            </Link>
            <Link
              href="/dashboard/clients/new"
              className="flex items-center gap-2 text-sm hover:underline"
            >
              <PlusIcon className="w-4 h-4" />
              Add Client
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Properties</h2>
          <p className="text-gray-600 mb-4">
            Manage your property listings, add new properties, and track performance.
          </p>
          <Link
            href="/dashboard/properties"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            View All Properties →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Clients</h2>
          <p className="text-gray-600 mb-4">
            Manage client relationships, track communications, and assign leads.
          </p>
          <Link
            href="/dashboard/clients"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            View All Clients →
          </Link>
        </div>
      </div>
    </div>
  );
}
