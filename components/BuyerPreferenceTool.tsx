'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'

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

// The tool's own wording → the lead form's options (lib/consultation.ts).
const TIMELINES: Record<string, string> = {
  immediate: 'As soon as possible',
  '3-6 months': '3–6 months',
  '6-12 months': '6–12 months',
  'just browsing': 'Just exploring',
}
const FINANCING: Record<string, string> = {
  'FHA Loan': 'FHA loan',
  'VA Loan': 'VA loan',
  'USDA Loan': 'USDA loan',
  'Conventional Loan': 'Conventional',
}

export default function BuyerPreferenceTool() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [submitError, setSubmitError] = useState('')
  
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

  // Sends the answers to the same place as every other consultation request, so they show up under
  // Leads in the dashboard and trigger the new-lead email. Answers that have no matching lead field
  // (property type, beds/baths, region…) go in the message.
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError('')
    const p = preferences
    const has = (list: string[], v: string) => list.includes(v)

    const intent = ['buy']
    if (has(p.programs, 'HUD Homes')) intent.push('hud')
    if (has(p.programs, 'New Construction') || has(p.propertyTypes, 'Land')) intent.push('build')

    const lifestyles = [
      has(p.lifestyle, 'Waterfront') && 'waterfront',
      has(p.lifestyle, 'Golf Community') && 'golf',
      has(p.lifestyle, 'Retirement') && 'retirement',
      has(p.lifestyle, 'Rural') && 'acreage',
      has(p.programs, 'New Construction') && 'new-construction',
      p.firstTimeBuyer && 'first-time',
    ].filter(Boolean)
    const mustHaves = [
      has(p.lifestyle, 'Waterfront') && 'Waterfront or deep-water dock',
      has(p.lifestyle, 'Golf Community') && 'Golf course community',
      has(p.lifestyle, 'Rural') && 'Acreage / no HOA',
      has(p.programs, 'New Construction') && 'New construction',
    ].filter(Boolean)

    const max = parseInt(p.budgetMax)
    const priceRange = !max ? undefined
      : max < 250000 ? 'Under $250k'
      : max <= 400000 ? '$250k–$400k'
      : max <= 600000 ? '$400k–$600k'
      : max <= 850000 ? '$600k–$850k'
      : max <= 1200000 ? '$850k–$1.2M'
      : '$1.2M+'
    const money = (v: string) => (parseInt(v) ? `$${parseInt(v).toLocaleString('en-US')}` : '')
    const budget = [money(p.budgetMin), money(p.budgetMax)].filter(Boolean).join(' to ')

    const details: [string, string][] = [
      ['Programs', p.programs.join(', ')],
      ['Financing', p.financing.join(', ')],
      ['Down payment assistance', p.needsAssistance ? 'Yes' : ''],
      ['First-time buyer', p.firstTimeBuyer ? 'Yes' : ''],
      ['Property types', p.propertyTypes.join(', ')],
      ['Regions', p.locations.join(', ')],
      ['Preferred communities', p.preferredCommunities.trim()],
      ['Lifestyle', p.lifestyle.join(', ')],
      ['Budget', budget],
      ['Bedrooms', p.bedrooms ? `${p.bedrooms}+` : ''],
      ['Bathrooms', p.bathrooms ? `${p.bathrooms}+` : ''],
      ['Notes', p.notes.trim()],
    ]
    const message = ['From the Buyer Preference Tool', ...details.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`)].join('\n')

    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: p.name,
          email: p.email,
          phone: p.phone,
          intent,
          timeframe: TIMELINES[p.timeline],
          priceRange,
          financing: p.financing.length === 1 ? FINANCING[p.financing[0]] : undefined,
          counties: [],
          communities: [],
          neighborhoods: [],
          lifestyles,
          mustHaves,
          message,
          sourcePage: '/education/buyer-preferences',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'We could not send your preferences. Please try again or call us.')
      setIsComplete(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'We could not send your preferences. Please try again or call us.')
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
            className="bg-gradient-to-r from-[#1e3a8a] to-[#0369a1] h-2 rounded-full transition-all duration-300"
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
                    ? 'border-[#0ea5e9] bg-[#0369a1]/10'
                    : 'border-gray-200 hover:border-[#0ea5e9]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{program}</span>
                  {preferences.programs.includes(program) && (
                    <CheckCircle2 className="w-5 h-5 text-[#0369a1]" />
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
                      ? 'border-[#0ea5e9] bg-[#0369a1]/10'
                      : 'border-gray-200 hover:border-[#0ea5e9]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {preferences.financing.includes(option) && (
                      <CheckCircle2 className="w-5 h-5 text-[#0369a1]" />
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
                  className="w-5 h-5 text-[#0369a1] rounded"
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
                  className="w-5 h-5 text-[#0369a1] rounded"
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
                    ? 'border-[#0ea5e9] bg-[#0369a1]/10'
                    : 'border-gray-200 hover:border-[#0ea5e9]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{type}</span>
                  {preferences.propertyTypes.includes(type) && (
                    <CheckCircle2 className="w-5 h-5 text-[#0369a1]" />
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
                      ? 'border-[#0ea5e9] bg-[#0369a1]/10'
                      : 'border-gray-200 hover:border-[#0ea5e9]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{location}</span>
                    {preferences.locations.includes(location) && (
                      <CheckCircle2 className="w-5 h-5 text-[#0369a1]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="pt-4">
              <label htmlFor="field-specific-communities-or-cities" className="block text-sm font-medium mb-2 text-gray-700">
                Specific communities or cities (optional)
              </label>
              <input id="field-specific-communities-or-cities"
                type="text"
                value={preferences.preferredCommunities}
                onChange={(e) => setPreferences({ ...preferences, preferredCommunities: e.target.value })}
                placeholder="e.g., Southport, Wilmington, Asheville"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0369a1] focus:border-[#0ea5e9] outline-none"
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
                    ? 'border-[#0ea5e9] bg-[#0369a1]/10'
                    : 'border-gray-200 hover:border-[#0ea5e9]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{lifestyle}</span>
                  {preferences.lifestyle.includes(lifestyle) && (
                    <CheckCircle2 className="w-5 h-5 text-[#0369a1]" />
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
              <div id="budget-range-label" className="block text-sm font-medium mb-2 text-gray-700">Budget Range</div>
              <div role="group" aria-labelledby="budget-range-label" className="grid md:grid-cols-2 gap-4">
                <div>
                  <input
                    aria-label="Minimum budget"
                    type="number"
                    value={preferences.budgetMin}
                    onChange={(e) => setPreferences({ ...preferences, budgetMin: e.target.value })}
                    placeholder="Minimum"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0369a1] focus:border-[#0ea5e9] outline-none"
                  />
                </div>
                <div>
                  <input
                    aria-label="Maximum budget"
                    type="number"
                    value={preferences.budgetMax}
                    onChange={(e) => setPreferences({ ...preferences, budgetMax: e.target.value })}
                    placeholder="Maximum"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0369a1] focus:border-[#0ea5e9] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="field-minimum-bedrooms" className="block text-sm font-medium mb-2 text-gray-700">Minimum Bedrooms</label>
                <select id="field-minimum-bedrooms"
                  value={preferences.bedrooms}
                  onChange={(e) => setPreferences({ ...preferences, bedrooms: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0369a1] focus:border-[#0ea5e9] outline-none"
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
                <label htmlFor="field-minimum-bathrooms" className="block text-sm font-medium mb-2 text-gray-700">Minimum Bathrooms</label>
                <select id="field-minimum-bathrooms"
                  value={preferences.bathrooms}
                  onChange={(e) => setPreferences({ ...preferences, bathrooms: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0369a1] focus:border-[#0ea5e9] outline-none"
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
              <label htmlFor="field-timeline" className="block text-sm font-medium mb-2 text-gray-700">Timeline</label>
              <select id="field-timeline"
                value={preferences.timeline}
                onChange={(e) => setPreferences({ ...preferences, timeline: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0369a1] focus:border-[#0ea5e9] outline-none"
              >
                <option value="">Select timeline</option>
                <option value="immediate">Ready to buy now</option>
                <option value="3-6 months">3-6 months</option>
                <option value="6-12 months">6-12 months</option>
                <option value="just browsing">Just browsing</option>
              </select>
            </div>

            <div>
              <label htmlFor="field-additional-notes" className="block text-sm font-medium mb-2 text-gray-700">Additional Notes (Optional)</label>
              <textarea id="field-additional-notes"
                value={preferences.notes}
                onChange={(e) => setPreferences({ ...preferences, notes: e.target.value })}
                rows={3}
                placeholder="Any other preferences or requirements?"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0369a1] focus:border-[#0ea5e9] outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 7: Contact Information */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="field-full-name" className="block text-sm font-medium mb-2 text-gray-700">Full Name *</label>
              <input id="field-full-name"
                type="text"
                value={preferences.name}
                onChange={(e) => setPreferences({ ...preferences, name: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0369a1] focus:border-[#0ea5e9] outline-none"
              />
            </div>
            <div>
              <label htmlFor="field-email-address" className="block text-sm font-medium mb-2 text-gray-700">Email Address *</label>
              <input id="field-email-address"
                type="email"
                value={preferences.email}
                onChange={(e) => setPreferences({ ...preferences, email: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0369a1] focus:border-[#0ea5e9] outline-none"
              />
            </div>
            <div>
              <label htmlFor="field-phone-number" className="block text-sm font-medium mb-2 text-gray-700">Phone Number *</label>
              <input id="field-phone-number"
                type="tel"
                value={preferences.phone}
                onChange={(e) => setPreferences({ ...preferences, phone: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0369a1] focus:border-[#0ea5e9] outline-none"
              />
            </div>
            <p className="text-sm text-gray-600 mt-4">
              By submitting this form, you agree to be contacted by Lightkeeper Realty regarding properties that match your preferences.
            </p>
          </div>
        )}
      </div>

      {submitError && <p role="alert" className="mt-4 text-red-700 font-medium">{submitError}</p>}

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
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1e3a8a] to-[#0369a1] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !preferences.name || !preferences.email || !preferences.phone}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#1e3a8a] to-[#0369a1] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-medium"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Preferences'}
          </button>
        )}
      </div>
    </div>
  )
}
