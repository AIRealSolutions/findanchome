'use client';

import { Edit, Trash2, Plus, Eye } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function AdminPages() {
  const [pages] = useState([
    { id: 1, title: 'Homepage', slug: '/', status: 'published', views: 5234 },
    { id: 2, title: 'Explore - Onslow County', slug: '/explore/onslow', status: 'published', views: 1245 },
    { id: 3, title: 'Find Your Lifestyle', slug: '/lifestyle', status: 'published', views: 892 },
    { id: 4, title: 'Search Homes', slug: '/search', status: 'published', views: 456 },
    { id: 5, title: 'HUD Homes', slug: '/hud', status: 'published', views: 234 },
    { id: 6, title: 'Buyers Guide', slug: '/buyers', status: 'draft', views: 0 },
    { id: 7, title: 'Contact Us', slug: '/contact', status: 'published', views: 123 },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Website Pages</h1>
          <p className="text-gray-600 mt-2">Edit website content and manage pages</p>
        </div>
        <Link
          href="/admin/pages/new"
          className="flex items-center gap-2 bg-[#0ea5e9] text-white px-6 py-3 rounded-lg hover:opacity-90 font-medium transition-opacity"
        >
          <Plus size={20} />
          New Page
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Page</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Slug</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Views</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{page.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">{page.slug}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      page.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {page.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{page.views.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={page.slug}
                      target="_blank"
                      className="text-gray-600 hover:text-[#0ea5e9] transition-colors"
                      title="View page"
                    >
                      <Eye size={18} />
                    </Link>
                    <Link
                      href={`/admin/pages/${page.id}/edit`}
                      className="text-gray-600 hover:text-[#0ea5e9] transition-colors"
                      title="Edit page"
                    >
                      <Edit size={18} />
                    </Link>
                    <button className="text-gray-600 hover:text-red-600 transition-colors" title="Delete page">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
