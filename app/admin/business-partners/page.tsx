'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader, Plus, Edit, Trash2, Star, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { businessPartnersService, BusinessPartner } from '@/lib/services/city-services';

const BRUNSWICK_CITIES = ['Southport', 'Oak Island', 'Holden Beach', 'Ocean Isle Beach', 'Sunset Beach'];
const BUSINESS_CATEGORIES = ['Real Estate', 'Restaurant', 'Retail', 'Services', 'Healthcare', 'Education', 'Entertainment', 'Other'];

export default function BusinessPartnersAdmin() {
  const { loading: authLoading } = useAuth('admin');
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<BusinessPartner>>({
    city_name: BRUNSWICK_CITIES[0],
    county: 'Brunswick',
    category: BUSINESS_CATEGORIES[0],
    is_active: true,
    is_featured: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      loadPartners();
    }
  }, [authLoading]);

  async function loadPartners() {
    try {
      setLoading(true);
      const result = await businessPartnersService.getAllPartners(100, 0, { county: 'Brunswick' });
      setPartners(result.data || []);
    } catch (err) {
      setError('Failed to load partners');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (editingId) {
        await businessPartnersService.updatePartner(editingId, formData);
        setSuccess('Partner updated successfully!');
      } else {
        await businessPartnersService.createPartner(formData as BusinessPartner);
        setSuccess('Partner created successfully!');
      }
      setFormData({
        city_name: BRUNSWICK_CITIES[0],
        county: 'Brunswick',
        category: BUSINESS_CATEGORIES[0],
        is_active: true,
        is_featured: false,
      });
      setEditingId(null);
      setShowForm(false);
      loadPartners();
    } catch (err) {
      setError('Failed to save partner');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this partner?')) return;
    try {
      await businessPartnersService.deletePartner(id);
      setSuccess('Partner deleted successfully!');
      loadPartners();
    } catch (err) {
      setError('Failed to delete partner');
    }
  }

  function handleEdit(partner: BusinessPartner) {
    setFormData(partner);
    setEditingId(partner.id || null);
    setShowForm(true);
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={32} className="animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Business Partners</h1>
          <p className="text-gray-600 mt-2">Manage partner businesses for Brunswick County cities</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              city_name: BRUNSWICK_CITIES[0],
              county: 'Brunswick',
              category: BUSINESS_CATEGORIES[0],
              is_active: true,
              is_featured: false,
            });
            setShowForm(!showForm);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
        >
          <Plus size={20} /> Add Partner
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Partner' : 'Add New Partner'}</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select
                value={formData.city_name || ''}
                onChange={(e) => setFormData({ ...formData, city_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                {BRUNSWICK_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                {BUSINESS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                value={formData.business_name || ''}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone_number || ''}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <input
                type="url"
                value={formData.website_url || ''}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
              <select
                value={formData.is_featured ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.value === 'true' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
              <select
                value={formData.is_active ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>

            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
              >
                {editingId ? 'Update' : 'Create'} Partner
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">City</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Business Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Featured</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {partners.map((partner) => (
              <tr key={partner.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{partner.city_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{partner.business_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{partner.category}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{partner.phone_number || '-'}</td>
                <td className="px-6 py-4 text-sm">
                  {partner.is_featured ? (
                    <span className="flex items-center gap-1 text-yellow-600 font-medium">
                      <Star size={16} /> Yes
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  {partner.is_active ? (
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <Eye size={16} /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-500 font-medium">
                      <EyeOff size={16} /> Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-3">
                  <button
                    onClick={() => handleEdit(partner)}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    onClick={() => partner.id && handleDelete(partner.id)}
                    className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {partners.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            No partners yet. Add one to get started!
          </div>
        )}
      </div>
    </div>
  );
}
