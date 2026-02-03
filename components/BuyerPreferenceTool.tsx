'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PreferenceData {
  // Contact
  name: string
  email: string
  phone: string
  
  // Programs
  programs: string[]
  
  // Financing
  financing: string[]
  needsAssistance: boolean
  
  // Property Types
  propertyTypes: string[]
  
  // Locations
  locations: string[]
  preferredCommunities: string
  
  // Lifestyle
  lifestyle: string[]
  
  // Budget
  budgetMin: string
  budgetMax: string
  
  // Requirements
  bedrooms: string
  bathrooms: string
  
  // Timeline
  timeline: string
  
  // First Time Buyer
  firstTimeBuyer: boolean
  
  // Notes
  notes: string
}

const steps = [
  {
    id: 1,
    title: 'Home Buying Programs',
    description: 'What types of home buying opportunities interest you?'
  },
  {
    id: 2,
    title: 'Financing Options',
    description: 'Which financing programs are you considering?'
  },
  {
    id: 3,
    title: 'Property Type',
    description: 'What type of property are you looking for?'
  },
  {
    id: 4,
    title: 'Location Preferences',
    description: 'Where in North Carolina would you like to live?'
  },
  {
    id: 5,
    title: 'Lifestyle Features',
    description: 'What lifestyle features are important to you?'
  },
  {
    id: 6,
    title: 'Budget & Requirements',
    description: 'Tell us about your budget and space needs'
  },
  {
    id: 7,
    title: 'Your Information',
    description: 'How can we contact you with matching properties?'
  }
]

export default function BuyerPreferenceTool() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  
  const [preferences, setPreferences] = useState<PreferenceData>({
    name: '',
    email: '',
    phone: '',
    programs: [],
    financing: [],
    needsAssistance: false,
    propertyTypes: [],
    locations: [],
    preferredCommunities: '',
    lifestyle: [],
    budgetMin: '',
    budgetMax: '',
    bedrooms: '',
    bathrooms: '',
    timeline: '',
    firstTimeBuyer: false,
    notes: ''
  })

  const toggleSelection = (category: keyof PreferenceData, value: string) => {
    const current = preferences[category]
    if (Array.isArray(current)) {
      if (current.includes(value)) {
        setPreferences({
          ...preferences,
          [category]: current.filter(item => item !== value)
        })
      } else {
        setPreferences({
          ...preferences,
          [category]: [...current, value]
        })
      }
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('buyer_preferences')
        .insert([
          {
            name: preferences.name,
            email: preferences.email,
            phone: preferences.phone,
            interested_in_hud_homes: preferences.programs.includes('HUD Homes'),
            interested_in_reo_properties: preferences.programs.includes('REO Properties'),
            interested_in_conventional: preferences.programs.includes('Conventional Homes'),
            interested_in_new_construction: preferences.programs.includes('New Construction'),
            interested_in_fha: preferences.financing.includes('FHA Loan'),
            interested_in_va: preferences.financing.includes('VA Loan'),
            interested_in_usda: preferences.financing.includes('USDA Loan'),
            interested_in_conventional_loan: preferences.financing.includes('Conventional Loan'),
            needs_down_payment_assistance: preferences.needsAssistance,
            property_type_single_family: preferences.propertyTypes.includes('Single Family'),
            property_type_condo: preferences.propertyTypes.includes('Condo'),
            property_type_townhouse: preferences.propertyTypes.includes('Townhouse'),
            property_type_land: preferences.propertyTypes.includes('Land'),
            property_type_manufactured: preferences.propertyTypes.includes('Manufactured'),
            location_coastal: preferences.locations.includes('Coastal'),
            location_mountains: preferences.locations.includes('Mountains'),
            location_piedmont: preferences.locations.includes('Piedmont'),
            location_triangle: preferences.locations.includes('Triangle'),
            location_charlotte: preferences.locations.includes('Charlotte'),
            preferred_communities: preferences.preferredCommunities,
            lifestyle_waterfront: preferences.lifestyle.includes('Waterfront'),
            lifestyle_golf_community: preferences.lifestyle.includes('Golf Community'),
            lifestyle_rural: preferences.lifestyle.includes('Rural'),
            lifestyle_urban: preferences.lifestyle.includes('Urban'),
            lifestyle_suburban: preferences.lifestyle.includes('Suburban'),
            lifestyle_retirement: preferences.lifestyle.includes('Retirement'),
            budget_min: preferences.budgetMin ? parseInt(preferences.budgetMin) : null,
            budget_max: preferences.budgetMax ? parseInt(preferences.budgetMax) : null,
            bedrooms_min: preferences.bedrooms ? parseInt(preferences.bedrooms) : null,
            bathrooms_min: preferences.bathrooms ? parseFloat(preferences.bathrooms) : null,
            timeline: preferences.timeline,
            is_first_time_buyer: preferences.firstTimeBuyer,
            additional_notes: preferences.notes
          }
        ])

      if (error) {
        console.error('Error submitting preferences:', error)
        alert('There was an error submitting your preferences. Please try again.')
      } else {
        setIsComplete(true)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('There was an error submitting your preferences. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-[#1e3a8a]">Thank You!</h2>
        <p className="text-lg text-gray-700 mb-6">
          We've received your home buying preferences. A member of our team will contact you soon with properties that match your criteria.
        </p>
        <p className="text-gray-600">
          You can expect to hear from us within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-[#1e3a8a]">Step {currentStep} of {steps.length}</span>
          <span className="text-sm text-gray-600">{Math.round((currentStep / steps.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-[#0ea5e9] min-h-[400px]">
        <h2 className="text-2xl font-bold mb-2 text-[#1e3a8a]">{steps[currentStep - 1].title}</h2>
        <p className="text-gray-600 mb-6">{steps[currentStep - 1].description}</p>

        {/* Step 1: Programs */}
        {currentStep === 1 && (
          <div className="space-y-3">
            {['HUD Homes', 'REO Properties', 'Conventional Homes', 'New Construction'].map((program) => (
              <button
                key={program}
                onClick={() => toggleSelection('programs', program)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  preferences.programs.includes(program)
                    ? 'border-[#0ea5e9] bg-[#0ea5e9]/10'
                    : 'border-gray-200 hover:border-[#0ea5e9]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{program}</span>
                  {preferences.programs.includes(program) && (
                    <CheckCircle2 className="w-5 h-5 text-[#0ea5e9]" />
                  )}
                </div>
                {program === 'HUD Homes' && (
                  <p className="text-sm text-gray-600 mt-1">Government-owned properties at competitive prices</p>
                )}
                {program === 'REO Properties' && (
                  <p className="text-sm text-gray-600 mt-1">Bank-owned real estate at below-market prices</p>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Financing */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-3">
              {['FHA Loan', 'VA Loan', 'USDA Loan', 'Conventional Loan'].map((option) => (
                <button
                  key={option}
                  onClick={() => toggleSelection('financing', option)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    preferences.financing.includes(option)
                      ? 'border-[#0ea5e9] bg-[#0ea5e9]/10'
                      : 'border-gray-200 hover:border-[#0ea5e9]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {preferences.financing.includes(option) && (
                      <CheckCircle2 className="w-5 h-5 text-[#0ea5e9]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="pt-4 border-t">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.needsAssistance}
                  onChange={(e) => setPreferences({ ...preferences, needsAssistance: e.target.checked })}
                  className="w-5 h-5 text-[#0ea5e9] rounded"
                />
                <span className="font-medium">I need down payment assistance</span>
              </label>
            </div>
            <div className="pt-4 border-t">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.firstTimeBuyer}
                  onChange={(e) => setPreferences({ ...preferences, firstTimeBuyer: e.target.checked })}
                  className="w-5 h-5 text-[#0ea5e9] rounded"
                />
                <span className="font-medium">I am a first-time home buyer</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 3: Property Types */}
        {currentStep === 3 && (
          <div className="grid md:grid-cols-2 gap-3">
            {['Single Family', 'Condo', 'Townhouse', 'Land', 'Manufactured'].map((type) => (
              <button
                key={type}
                onClick={() => toggleSelection('propertyTypes', type)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  preferences.propertyTypes.includes(type)
                    ? 'border-[#0ea5e9] bg-[#0ea5e9]/10'
                    : 'border-gray-200 hover:border-[#0ea5e9]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{type}</span>
                  {preferences.propertyTypes.includes(type) && (
                    <CheckCircle2 className="w-5 h-5 text-[#0ea5e9]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 4: Locations */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              {['Coastal', 'Mountains', 'Piedmont', 'Triangle', 'Charlotte'].map((location) => (
                <button
                  key={location}
                  onClick={() => toggleSelection('locations', location)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    preferences.locations.includes(location)
                      ? 'border-[#0ea5e9] bg-[#0ea5e9]/10'
                      : 'border-gray-200 hover:border-[#0ea5e9]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{location}</span>
                    {preferences.locations.includes(location) && (
                      <CheckCircle2 className="w-5 h-5 text-[#0ea5e9]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="pt-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Specific communities or cities (optional)
              </label>
              <input
                type="text"
                value={preferences.preferredCommunities}
                onChange={(e) => setPreferences({ ...preferences, preferredCommunities: e.target.value })}
                placeholder="e.g., Southport, Wilmington, Asheville"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 5: Lifestyle */}
        {currentStep === 5 && (
          <div className="grid md:grid-cols-2 gap-3">
            {['Waterfront', 'Golf Community', 'Rural', 'Urban', 'Suburban', 'Retirement'].map((lifestyle) => (
              <button
                key={lifestyle}
                onClick={() => toggleSelection('lifestyle', lifestyle)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  preferences.lifestyle.includes(lifestyle)
                    ? 'border-[#0ea5e9] bg-[#0ea5e9]/10'
                    : 'border-gray-200 hover:border-[#0ea5e9]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{lifestyle}</span>
                  {preferences.lifestyle.includes(lifestyle) && (
                    <CheckCircle2 className="w-5 h-5 text-[#0ea5e9]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 6: Budget & Requirements */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Budget Range</label>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    value={preferences.budgetMin}
                    onChange={(e) => setPreferences({ ...preferences, budgetMin: e.target.value })}
                    placeholder="Minimum"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={preferences.budgetMax}
                    onChange={(e) => setPreferences({ ...preferences, budgetMax: e.target.value })}
                    placeholder="Maximum"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Minimum Bedrooms</label>
                <select
                  value={preferences.bedrooms}
                  onChange={(e) => setPreferences({ ...preferences, bedrooms: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Minimum Bathrooms</label>
                <select
                  value={preferences.bathrooms}
                  onChange={(e) => setPreferences({ ...preferences, bathrooms: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="1.5">1.5+</option>
                  <option value="2">2+</option>
                  <option value="2.5">2.5+</option>
                  <option value="3">3+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Timeline</label>
              <select
                value={preferences.timeline}
                onChange={(e) => setPreferences({ ...preferences, timeline: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none"
              >
                <option value="">Select timeline</option>
                <option value="immediate">Ready to buy now</option>
                <option value="3-6 months">3-6 months</option>
                <option value="6-12 months">6-12 months</option>
                <option value="just browsing">Just browsing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Additional Notes (Optional)</label>
              <textarea
                value={preferences.notes}
                onChange={(e) => setPreferences({ ...preferences, notes: e.target.value })}
                rows={3}
                placeholder="Any other preferences or requirements?"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 7: Contact Information */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Full Name *</label>
              <input
                type="text"
                value={preferences.name}
                onChange={(e) => setPreferences({ ...preferences, name: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Email Address *</label>
              <input
                type="email"
                value={preferences.email}
                onChange={(e) => setPreferences({ ...preferences, email: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Phone Number *</label>
              <input
                type="tel"
                value={preferences.phone}
                onChange={(e) => setPreferences({ ...preferences, phone: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] outline-none"
              />
            </div>
            <p className="text-sm text-gray-600 mt-4">
              By submitting this form, you agree to be contacted by Lightkeeper Realty regarding properties that match your preferences.
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        {currentStep < steps.length ? (
          <button
            onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !preferences.name || !preferences.email || !preferences.phone}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-medium"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Preferences'}
          </button>
        )}
      </div>
    </div>
  )
}
