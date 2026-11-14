import Navigation from '@/components/Navigation'
import SiteFooter from '@/components/SiteFooter'
import BuyerPreferenceTool from '@/components/BuyerPreferenceTool'

export default function BuyerPreferencesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col focus:outline-none">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1e3a8a] via-[#0369a1] to-[#1e3a8a] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Your Perfect Home
            </h1>
            <p className="text-xl opacity-90 mb-4">
              Tell us what you're looking for and we'll match you with properties that fit your needs
            </p>
            <p className="text-lg opacity-80">
              This quick 7-step questionnaire helps us understand your home buying preferences so we can provide personalized recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Buyer Preference Tool */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <BuyerPreferenceTool />
        </div>
      </section>

      {/* Why Use This Tool Section */}
      <section className="py-16 bg-gradient-to-br from-[#0369a1]/5 to-[#fbbf24]/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#1e3a8a]">
              Why Share Your Preferences?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#0369a1] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#1e3a8a]">Personalized Matches</h3>
                <p className="text-gray-700 text-sm">
                  Receive property recommendations tailored specifically to your needs and preferences
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#fbbf24] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#1e3a8a]">Save Time</h3>
                <p className="text-gray-700 text-sm">
                  Skip browsing hundreds of listings - we'll send you only homes that match your criteria
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#1e3a8a] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🤝</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#1e3a8a]">Expert Guidance</h3>
                <p className="text-gray-700 text-sm">
                  Get connected with our team who specializes in your preferred programs and locations
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      </main>
      <SiteFooter />
    </div>
  )
}
