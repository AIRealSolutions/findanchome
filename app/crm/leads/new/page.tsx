'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { leadsService } from '@/lib/services/leads';

const COUNTIES = ['Onslow', 'Pender', 'New Hanover', 'Brunswick', 'Columbus'];
const STATUSES = ['new', 'contacted', 'qualified', 'scheduled', 'offer_pending', 'closed', 'lost'];

export default function NewLeadPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth('broker');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    county: '',
    budget: '',
    status: 'new' as const,
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      await leadsService.createLead({
        ...formData,
        created_by: user.id,
        assigned_to: user.id,
      });
      router.push('/crm/leads');
    } catch (err: any) {
      setError(err.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/crm/leads" className="flex items-center gap-2 text-[#0ea5e9] hover:underline mb-4">
          <ArrowLeft size={18} />
          Back to Leads
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Lead</h1>
        <p className="text-gray-600 mt-2">Add a new lead to your pipeline</p>
      </div>

      <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-colors"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-colors"
                placeholder="john@example.com"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-colors"
                placeholder="(910) 555-0000"
              />
            </div>

            {/* County */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">County</label>
              <select
                name="county"
                value={formData.county}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-colors"
              >
                <option value="">Select a county</option>
                {COUNTIES.map((county) => (
                  <option key={county} value={county}>
                    {county}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Budget Range</label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-colors"
                placeholder="$250K - $350K"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-colors"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-colors"
              placeholder="Add any additional notes about this lead..."
              rows={4}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50 font-bold transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              {loading ? 'Creating...' : 'Create Lead'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
