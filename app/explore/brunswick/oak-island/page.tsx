'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { MapPin, Zap, Droplets, Trash2, Wifi, Building2, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cityServicesService, businessPartnersService } from '@/lib/services/city-services';

const CITY_NAME = 'Oak Island';
const COUNTY = 'Brunswick';

interface CityService {
  id: string;
  service_type: string;
  provider_name: string;
  website_url?: string;
  phone_number?: string;
  description?: string;
}

interface BusinessPartner {
  id: string;
  business_name: string;
  category: string;
  website_url?: string;
  phone_number?: string;
  description?: string;
  is_featured?: boolean;
}

export default function OakIslandPage() {
  const [services, setServices] = useState<Record<string, CityService[]>>({});
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [servicesData, partnersData] = await Promise.all([
          cityServicesService.getServicesByType(CITY_NAME, COUNTY),
          businessPartnersService.getPartnersByCity(CITY_NAME, COUNTY),
        ]);
        setServices(servicesData);
        setPartners(partnersData);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'power':
        return <Zap className="w-6 h-6 text-yellow-500" />;
      case 'water':
        return <Droplets className="w-6 h-6 text-blue-500" />;
      case 'trash':
        return <Trash2 className="w-6 h-6 text-gray-500" />;
      case 'internet':
        return <Wifi className="w-6 h-6 text-purple-500" />;
      default:
        return <MapPin className="w-6 h-6 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'real estate':
        return <Building2 className="w-6 h-6 text-blue-600" />;
      default:
        return <Building2 className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="bg-gradient-to-r from-teal-600 to-emerald-400 text-white py-16">
        <div className="container mx-auto px-4">
          <Link href="/explore/brunswick" className="text-teal-100 hover:text-white mb-4 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Brunswick County
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">🏖️ {CITY_NAME}</h1>
          <p className="text-xl opacity-90">Family-Friendly Beach Community with Golf Courses & Waterfront Living</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-[#1e3a8a] mb-6">About {CITY_NAME}</h2>
          <p className="text-gray-700 text-lg mb-4">
            Oak Island is a family-friendly beach community offering pristine beaches, world-class golf courses, and excellent waterfront living opportunities. With year-round activities and a welcoming atmosphere, Oak Island attracts families, retirees, and golf enthusiasts seeking the perfect balance of relaxation and recreation.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 bg-emerald-50 p-6 rounded-lg">
            <div>
              <div className="text-2xl font-bold text-emerald-600">~7,500</div>
              <div className="text-gray-700 text-sm">Population</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-teal-600">8 Miles</div>
              <div className="text-gray-700 text-sm">of Beautiful Beach</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1e3a8a]">World-Class</div>
              <div className="text-gray-700 text-sm">Golf Courses</div>
            </div>
          </div>
        </div>
      </section>

      {/* City Services Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1e3a8a] mb-12 text-center">Essential City Services</h2>

          {loading ? (
            <div className="text-center text-gray-500">Loading services...</div>
          ) : Object.keys(services).length === 0 ? (
            <div className="text-center text-gray-500">No services available yet.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {Object.entries(services).map(([serviceType, serviceList]) => (
                <div key={serviceType} className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-4 flex items-center gap-3 border-b">
                    {getServiceIcon(serviceType)}
                    <h3 className="font-bold text-xl text-gray-800 capitalize">{serviceType}</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {serviceList.map((service) => (
                      <div key={service.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                        <p className="font-semibold text-gray-900">{service.provider_name}</p>
                        {service.description && (
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        )}
                        <div className="flex flex-col gap-2 mt-2">
                          {service.phone_number && (
                            <a href={`tel:${service.phone_number}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              📞 {service.phone_number}
                            </a>
                          )}
                          {service.website_url && (
                            <a href={service.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium break-all">
                              🌐 Visit Website
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Business Partners Section */}
      {partners.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-[#1e3a8a] mb-12 text-center">Findanchome Partner Businesses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className={`bg-white rounded-lg border-2 overflow-hidden hover:shadow-lg transition-all ${
                    partner.is_featured ? 'border-yellow-400 lg:col-span-1' : 'border-gray-200'
                  }`}
                >
                  {partner.is_featured && (
                    <div className="bg-yellow-400 text-gray-900 px-4 py-1 text-sm font-bold text-center">
                      ⭐ Featured Partner
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      {getCategoryIcon(partner.category)}
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{partner.business_name}</h3>
                        <p className="text-sm text-gray-600">{partner.category}</p>
                      </div>
                    </div>

                    {partner.description && (
                      <p className="text-sm text-gray-700 mb-4">{partner.description}</p>
                    )}

                    <div className="space-y-2">
                      {partner.phone_number && (
                        <a href={`tel:${partner.phone_number}`} className="block text-blue-600 hover:text-blue-800 text-sm font-medium">
                          📞 {partner.phone_number}
                        </a>
                      )}
                      {partner.website_url && (
                        <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 text-sm font-medium break-all">
                          🌐 Visit Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-gradient-to-r from-teal-600 to-emerald-400 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Home in {CITY_NAME}?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search" className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg hover:opacity-90 font-bold">
              Search {CITY_NAME} Homes
            </Link>
            <Link href="/contact" className="bg-white/20 hover:bg-white/30 px-8 py-3 rounded-lg border border-white/40 font-bold">
              Schedule Consultation
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-r from-[#1e3a8a] via-[#0c4a6e] to-[#1e3a8a] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-bold text-lg text-yellow-400 mb-4">FindaNChome.com</div>
              <p className="text-gray-300 text-sm">Your trusted guide to finding your perfect home in Southeastern North Carolina.</p>
            </div>
            <div>
              <div className="font-bold mb-4 text-yellow-400">Explore</div>
              <div className="space-y-2 text-sm">
                <Link href="/explore" className="block text-gray-300 hover:text-yellow-400">Counties</Link>
                <Link href="/explore/brunswick" className="block text-gray-300 hover:text-yellow-400">Brunswick County</Link>
                <Link href="/search" className="block text-gray-300 hover:text-yellow-400">Search Homes</Link>
              </div>
            </div>
            <div>
              <div className="font-bold mb-4 text-yellow-400">Help</div>
              <div className="space-y-2 text-sm">
                <Link href="/buyers" className="block text-gray-300 hover:text-yellow-400">Buyers</Link>
                <Link href="/sellers" className="block text-gray-300 hover:text-yellow-400">Sellers</Link>
                <Link href="/contact" className="block text-gray-300 hover:text-yellow-400">Contact Us</Link>
              </div>
            </div>
            <div>
              <div className="font-bold mb-4 text-yellow-400">Contact</div>
              <div className="text-gray-300 space-y-2 text-sm">
                <div>Phone: (910) 363-6147</div>
                <div>Email: marcspencer28461@gmail.com</div>
              </div>
            </div>
          </div>
          <div className="border-t border-blue-400/30 pt-8 text-center text-gray-300 text-sm">
            © 2026 Lightkeeper Realty. All rights reserved. | Fair Housing Opportunity
          </div>
        </div>
      </footer>
    </div>
  );
}
