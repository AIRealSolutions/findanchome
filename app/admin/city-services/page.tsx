'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { cityServicesService, CityService } from '@/lib/services/city-services';

const BRUNSWICK_CITIES = ['Southport', 'Oak Island', 'Holden Beach', 'Ocean Isle Beach', 'Sunset Beach'];
const SERVICE_TYPES = ['power', 'water', 'trash', 'internet'];

export default function CityServicesAdmin() {
  const { loading: authLoading } = useAuth('admin');
  const [services, setServices] = useState<CityService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CityService>>({
    city_name: BRUNSWICK_CITIES[0],
    county: 'Brunswick',
    service_type: SERVICE_TYPES[0],
    is_active: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      loadServices();
    }
  }, [authLoading]);

  async function loadServices() {
    try {
      setLoading(true);
      const result = await cityServicesService.getAllServices(100, 0, { county: 'Brunswick' });
      setServices(result.data || []);
    } catch (err) {
      setError('Failed to load services');
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
        await cityServicesService.updateService(editingId, formData);
        setSuccess('Service updated successfully!');
      } else {
        await cityServicesService.createService(formData as CityService);
        setSuccess('Service created successfully!');
      }
      setFormData({
        city_name: BRUNSWICK_CITIES[0],
        county: 'Brunswick',
        service_type: SERVICE_TYPES[0],
        is_active: true,
      });
      setEditingId(null);
      setShowForm(false);
      loadServices();
    } catch (err) {
      setError('Failed to save service');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await cityServicesService.deleteService(id);
      setSuccess('Service deleted successfully!');
      loadServices();
    } catch (err) {
      setError('Failed to delete service');
    }
  }

  function handleEdit(service: CityService) {
    setFormData(service);
    setEditingId(service.id || null);
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
          <h1 className="text-4xl font-bold text-gray-900">City Services</h1>
          <p className="text-gray-600 mt-2">Manage Power, Water, Trash, and Internet services for Brunswick County cities</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              city_name: BRUNSWICK_CITIES[0],
              county: 'Brunswick',
              service_type: SERVICE_TYPES[0],
              is_active: true,
            });
            setShowForm(!showForm);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
        >
          <Plus size={20} /> Add Service
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
          <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Service' : 'Add New Service'}</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <select
                value={formData.service_type || ''}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider Name</label>
              <input
                type="text"
                value={formData.provider_name || ''}
                onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <input
                type="url"
                value={formData.website_url || ''}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
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
                {editingId ? 'Update' : 'Create'} Service
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
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Service Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Provider</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{service.city_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600 capitalize">{service.service_type}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{service.provider_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{service.phone_number || '-'}</td>
                <td className="px-6 py-4 text-sm">
                  {service.is_active ? (
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
                    onClick={() => handleEdit(service)}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    onClick={() => service.id && handleDelete(service.id)}
                    className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {services.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            No services yet. Add one to get started!
          </div>
        )}
      </div>
    </div>
  );
}
