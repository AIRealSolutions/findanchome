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
  const { profile, isAdmin, isBroker, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeProperties: 0,
    totalClients: 0,
    newClientsThisMonth: 0,
    recentEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch stats after auth is done loading
    if (!authLoading) {
      fetchDashboardStats();
    }
  }, [authLoading]);

  const fetchDashboardStats = async () => {
    console.log('Fetching dashboard stats...');
    
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.error('Dashboard stats fetch timed out');
      setLoading(false);
      setError('Loading timed out. Dashboard data may be incomplete.');
    }, 10000); // 10 second timeout

    try {
      // Fetch properties count
      console.log('Fetching properties...');
      const { count: totalProperties, error: propsError } = await supabase
        .from('fanc_properties')
        .select('*', { count: 'exact', head: true });

      if (propsError) {
        console.error('Properties error:', propsError);
        throw propsError;
      }

      const { count: activeProperties, error: activeError } = await supabase
        .from('fanc_properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeError) {
        console.error('Active properties error:', activeError);
      }

      // Fetch clients count
      console.log('Fetching clients...');
      const { count: totalClients, error: clientsError } = await supabase
        .from('fanc_clients')
        .select('*', { count: 'exact', head: true });

      if (clientsError) {
        console.error('Clients error:', clientsError);
      }

      // Fetch new clients this month
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const { count: newClientsThisMonth, error: newClientsError } = await supabase
        .from('fanc_clients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth.toISOString());

      if (newClientsError) {
        console.error('New clients error:', newClientsError);
      }

      // Fetch recent events count
      console.log('Fetching events...');
      const { count: recentEvents, error: eventsError } = await supabase
        .from('fanc_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (eventsError) {
        console.error('Events error:', eventsError);
      }

      setStats({
        totalProperties: totalProperties || 0,
        activeProperties: activeProperties || 0,
        totalClients: totalClients || 0,
        newClientsThisMonth: newClientsThisMonth || 0,
        recentEvents: recentEvents || 0,
      });

      console.log('Dashboard stats loaded successfully');
      clearTimeout(timeout);
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      setError(error.message || 'Failed to load dashboard data');
      clearTimeout(timeout);
    } finally {
      setLoading(false);
    }
  };

  // Show loading only if auth is loading
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
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

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              {loading ? (
                <div className="h-9 w-16 bg-gray-200 animate-pulse rounded mt-2"></div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProperties}</p>
                  <p className="text-sm text-gray-500 mt-1">{stats.activeProperties} active</p>
                </>
              )}
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
              {loading ? (
                <div className="h-9 w-16 bg-gray-200 animate-pulse rounded mt-2"></div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalClients}</p>
                  <p className="text-sm text-green-600 mt-1">+{stats.newClientsThisMonth} this month</p>
                </>
              )}
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
              {loading ? (
                <div className="h-9 w-16 bg-gray-200 animate-pulse rounded mt-2"></div>
              ) : (
                <>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.recentEvents}</p>
                  <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
                </>
              )}
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
