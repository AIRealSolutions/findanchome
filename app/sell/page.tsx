'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Home, DollarSign, TrendingUp, Users, CheckCircle2, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SellPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    requestType: 'cma', // 'cma' or 'appointment'
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const testimonials = [
    {
      image: '/IMG_8281.jpeg',
      alt: 'Happy home buyers with Lightkeeper Realty agent and SOLD sign'
    },
    {
      image: '/IMG_8285.jpeg',
      alt: 'Couple holding SOLD sign at their new home'
    },
    {
      image: '/IMG_8280.jpeg',
      alt: 'Successful home sale with Lightkeeper Realty'
    },
    {
      image: '/IMG_8287.jpeg',
      alt: 'Happy couple at their sold home with Lightkeeper Realty sign'
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('seller_requests')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            property_address: formData.address,
            request_type: formData.requestType,
            message: formData.message
          }
        ])

      if (error) {
        console.error('Error submitting request:', error)
        alert('There was an error submitting your request. Please try again or call us directly at (910) 363-6147.')
      } else {
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('There was an error submitting your request. Please try again or call us directly at (910) 363-6147.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-[#1e3a8a] text-white sticky top-0 z-50 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-4">
              <Link href="/" className="flex items-center gap-3">
                <Image 
                  src="/lightkeeper-logo.jpg" 
                  alt="Lightkeeper Realty Logo" 
                  width={50} 
                  height={50}
                  className="object-contain"
                />
                <div>
                  <h1 className="text-2xl font-bold">FindaNChome.com</h1>
                  <p className="text-xs opacity-90">From the Coast to the Mountains - Your NC Real Estate Connection</p>
                </div>
              </Link>
              
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/properties" className="hover:text-[#fbbf24] transition-colors">Properties</Link>
                <Link href="/communities" className="hover:text-[#fbbf24] transition-colors">Communities</Link>
                <Link href="/agents" className="hover:text-[#fbbf24] transition-colors">Agents</Link>
                <Link href="/education" className="hover:text-[#fbbf24] transition-colors">Education</Link>
                <Link href="/contact" className="bg-[#fbbf24] text-[#1e3a8a] px-4 py-2 rounded-lg hover:bg-[#fcd34d] transition-colors font-medium">Contact</Link>
              </nav>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center py-16 bg-gradient-to-br from-[#0ea5e9]/5 to-[#fbbf24]/5">
          <div className="max-w-2xl mx-auto text-center px-4">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-[#1e3a8a]">Thank You!</h2>
            <p className="text-lg text-gray-700 mb-6">
              We've received your request. A member of our team will contact you within 24 hours to discuss your home selling needs.
            </p>
            <p className="text-gray-600 mb-8">
              In the meantime, feel free to call us directly at <strong>(910) 363-6147</strong>
            </p>
            <Link 
              href="/"
              className="inline-block bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#1e3a8a] text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/lightkeeper-logo.jpg" 
                alt="Lightkeeper Realty Logo" 
                width={50} 
                height={50}
                className="object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold">FindaNChome.com</h1>
                <p className="text-xs opacity-90">From the Coast to the Mountains - Your NC Real Estate Connection</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/properties" className="hover:text-[#fbbf24] transition-colors">Properties</Link>
              <Link href="/communities" className="hover:text-[#fbbf24] transition-colors">Communities</Link>
              <Link href="/agents" className="hover:text-[#fbbf24] transition-colors">Agents</Link>
              <Link href="/education" className="hover:text-[#fbbf24] transition-colors">Education</Link>
              <Link href="/contact" className="bg-[#fbbf24] text-[#1e3a8a] px-4 py-2 rounded-lg hover:bg-[#fcd34d] transition-colors font-medium">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section with Testimonials */}
      <section className="relative bg-gradient-to-br from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Sell Your North Carolina Home
              </h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Get top dollar for your property with Lightkeeper Realty. 25 years of experience helping homeowners across NC achieve their selling goals.
              </p>
            </div>

            {/* Testimonial Images Grid */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden shadow-xl border-4 border-white/20">
                  <Image 
                    src={testimonial.image}
                    alt={testimonial.alt}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-lg opacity-90">
                Join hundreds of satisfied sellers who trusted Lightkeeper Realty with their home sale
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Sell With Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#1e3a8a]">
            Why Sell With Lightkeeper Realty?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0ea5e9] rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-[#1e3a8a]">Maximum Value</h3>
              <p className="text-gray-700">
                Strategic pricing and marketing to get you the best possible price for your home.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#fbbf24] rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-[#1e3a8a]" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-[#1e3a8a]">Expert Marketing</h3>
              <p className="text-gray-700">
                Professional photography, virtual tours, and targeted advertising to reach qualified buyers.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#1e3a8a] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-[#1e3a8a]">25 Years Experience</h3>
              <p className="text-gray-700">
                Proven track record of successful sales across all NC markets from coast to mountains.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Forms Section */}
      <section className="py-16 bg-gradient-to-br from-[#0ea5e9]/5 to-[#fbbf24]/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-[#1e3a8a]">
                Get Started Today
              </h2>
              <p className="text-lg text-gray-700">
                Request a free Comparative Market Analysis or schedule a consultation to discuss your home selling goals.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Free CMA Card */}
              <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-[#0ea5e9]">
                <div className="w-12 h-12 bg-[#0ea5e9] rounded-full flex items-center justify-center mb-4">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-[#1e3a8a]">Free Home Valuation</h3>
                <p className="text-gray-700 mb-4">
                  Get a comprehensive Comparative Market Analysis (CMA) to understand your home's current market value.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-[#0ea5e9] flex-shrink-0 mt-0.5" />
                    <span>Detailed market analysis</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-[#0ea5e9] flex-shrink-0 mt-0.5" />
                    <span>Comparable sales data</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-[#0ea5e9] flex-shrink-0 mt-0.5" />
                    <span>Pricing recommendations</span>
                  </li>
                </ul>
              </div>

              {/* Schedule Appointment Card */}
              <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-[#fbbf24]">
                <div className="w-12 h-12 bg-[#fbbf24] rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-[#1e3a8a]" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-[#1e3a8a]">Schedule Consultation</h3>
                <p className="text-gray-700 mb-4">
                  Meet with our experienced agents to discuss your selling timeline, goals, and strategy.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-[#fbbf24] flex-shrink-0 mt-0.5" />
                    <span>Personalized selling strategy</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-[#fbbf24] flex-shrink-0 mt-0.5" />
                    <span>Home preparation tips</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-[#fbbf24] flex-shrink-0 mt-0.5" />
                    <span>Marketing plan review</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Combined Request Form */}
            <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-[#1e3a8a]">
              <h3 className="text-2xl font-bold mb-6 text-[#1e3a8a] text-center">
                Request Information
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Property Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">I'm interested in: *</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#0ea5e9] transition-colors">
                      <input
                        type="radio"
                        name="requestType"
                        value="cma"
                        checked={formData.requestType === 'cma'}
                        onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                        className="w-5 h-5 text-[#0ea5e9]"
                      />
                      <span className="font-medium">Free Home Valuation (CMA)</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#0ea5e9] transition-colors">
                      <input
                        type="radio"
                        name="requestType"
                        value="appointment"
                        checked={formData.requestType === 'appointment'}
                        onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                        className="w-5 h-5 text-[#0ea5e9]"
                      />
                      <span className="font-medium">Schedule Consultation</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Additional Information (Optional)</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your selling timeline, goals, or any questions you have..."
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] text-white px-8 py-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-bold text-lg shadow-lg"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>

                <p className="text-sm text-gray-600 text-center">
                  Or call us directly at <strong>(910) 363-6147</strong>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#1e3a8a] via-[#0c4a6e] to-[#1e3a8a] text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image 
                  src="/lightkeeper-logo.jpg" 
                  alt="Lightkeeper Realty Logo" 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
                <div className="font-bold text-lg">Lightkeeper Realty</div>
              </div>
              <p className="text-gray-300">
                Your trusted real estate partner in North Carolina
              </p>
            </div>
            <div>
              <div className="font-bold mb-4 text-[#fbbf24]">Quick Links</div>
              <div className="space-y-2">
                <Link href="/properties" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Properties</Link>
                <Link href="/communities" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Communities</Link>
                <Link href="/agents" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Agents</Link>
              </div>
            </div>
            <div>
              <div className="font-bold mb-4 text-[#fbbf24]">Resources</div>
              <div className="space-y-2">
                <Link href="/education" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Education Center</Link>
                <Link href="/sell" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Sell Your Home</Link>
                <Link href="/contact" className="block text-gray-300 hover:text-[#fbbf24] transition-colors">Contact Us</Link>
              </div>
            </div>
            <div>
              <div className="font-bold mb-4 text-[#fbbf24]">Contact</div>
              <div className="text-gray-300 space-y-2">
                <div>Phone: (910) 363-6147</div>
                <div>Email: marcspencer28461@gmail.com</div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#0ea5e9]/30 mt-8 pt-8 text-center text-gray-300">
            © 2026 Lightkeeper Realty. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
