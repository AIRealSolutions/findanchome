import Link from 'next/link'
import Image from 'next/image'
import { Home, DollarSign, Shield, TrendingDown, Users, CheckCircle, ArrowRight } from 'lucide-react'

export default function FinancingPage() {
  const loanPrograms = [
    {
      name: "FHA Loans",
      icon: Home,
      description: "Federal Housing Administration loans with low down payments (as low as 3.5%) and flexible credit requirements.",
      benefits: [
        "Down payment as low as 3.5%",
        "Credit scores as low as 580 accepted",
        "Competitive interest rates",
        "Can be used for primary residences"
      ],
      idealFor: "First-time buyers with limited savings or lower credit scores"
    },
    {
      name: "VA Loans",
      icon: Shield,
      description: "Veterans Affairs loans offering 0% down payment options for eligible military members, veterans, and their families.",
      benefits: [
        "No down payment required",
        "No private mortgage insurance (PMI)",
        "Competitive interest rates",
        "Flexible credit requirements"
      ],
      idealFor: "Active duty military, veterans, and eligible surviving spouses"
    },
    {
      name: "USDA Loans",
      icon: TrendingDown,
      description: "U.S. Department of Agriculture loans for rural and suburban homebuyers with 0% down payment options.",
      benefits: [
        "No down payment required",
        "Low mortgage insurance rates",
        "Below-market interest rates",
        "Available in eligible rural areas"
      ],
      idealFor: "Low to moderate-income buyers in eligible rural and suburban areas"
    },
    {
      name: "Conventional Loans",
      icon: DollarSign,
      description: "Traditional mortgages not backed by the government, offering flexibility and competitive rates for qualified buyers.",
      benefits: [
        "Down payments from 3% to 20%",
        "No upfront mortgage insurance with 20% down",
        "Flexible loan terms (15, 20, 30 years)",
        "Can be used for any property type"
      ],
      idealFor: "Buyers with good credit and stable income"
    }
  ]

  const assistancePrograms = [
    {
      title: "NC Home Advantage Mortgage",
      description: "North Carolina Housing Finance Agency offers down payment assistance up to 5% of the loan amount for first-time buyers.",
      link: "https://www.nchfa.com"
    },
    {
      title: "NC 1st Home Advantage Down Payment",
      description: "Provides down payment and closing cost assistance for eligible first-time homebuyers in North Carolina.",
      link: "https://www.nchfa.com"
    },
    {
      title: "Community Seconds Program",
      description: "Offers a second mortgage to help with down payment and closing costs, with deferred payment options.",
      link: "https://www.nchfa.com"
    },
    {
      title: "Military Heroes Program",
      description: "Special assistance for active duty military, veterans, and reservists purchasing homes in North Carolina.",
      link: "https://www.nchfa.com"
    }
  ]

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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1e3a8a] via-[#0ea5e9] to-[#1e3a8a] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              First-Time Buyer Financing Options
            </h1>
            <p className="text-xl opacity-90 mb-8">
              Explore loan programs and assistance options designed to help you achieve homeownership in North Carolina
            </p>
            <Link 
              href="/contact"
              className="inline-block bg-[#fbbf24] text-[#1e3a8a] px-8 py-3 rounded-lg hover:bg-[#fcd34d] transition-colors font-medium shadow-lg"
            >
              Get Pre-Qualified Today
            </Link>
          </div>
        </div>
      </section>

      {/* Loan Programs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-[#1e3a8a]">
            Popular Loan Programs
          </h2>
          <p className="text-center text-gray-700 mb-12 max-w-2xl mx-auto">
            Choose the financing option that best fits your situation. We'll help you navigate the process from pre-approval to closing.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {loanPrograms.map((program) => {
              const IconComponent = program.icon
              return (
                <div key={program.name} className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-[#0ea5e9] hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#0ea5e9] rounded-full flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl text-[#1e3a8a]">{program.name}</h3>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{program.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-[#1e3a8a] mb-2">Key Benefits:</h4>
                    <ul className="space-y-2">
                      {program.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <CheckCircle className="w-5 h-5 text-[#0ea5e9] flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-[#0ea5e9]/5 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-[#1e3a8a]">Ideal for:</span> {program.idealFor}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Down Payment Assistance Programs */}
      <section className="py-16 bg-gradient-to-br from-[#0ea5e9]/5 to-[#fbbf24]/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4 text-[#1e3a8a]">
              North Carolina Down Payment Assistance Programs
            </h2>
            <p className="text-center text-gray-700 mb-12">
              Take advantage of state and local programs that can help with your down payment and closing costs.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {assistancePrograms.map((program, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                  <h3 className="font-bold text-xl mb-3 text-[#1e3a8a]">{program.title}</h3>
                  <p className="text-gray-700 mb-4">{program.description}</p>
                  <a 
                    href={program.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0ea5e9] font-medium hover:underline inline-flex items-center gap-1"
                  >
                    Learn More <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-4 text-[#1e3a8a] text-center">
                Ready to Explore Your Options?
              </h3>
              <p className="text-gray-700 mb-6 text-center max-w-2xl mx-auto">
                Our team at Lightkeeper Realty specializes in helping first-time buyers navigate financing options and assistance programs. 
                Let us connect you with trusted lenders and guide you through the entire process.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact"
                  className="inline-block bg-gradient-to-r from-[#1e3a8a] to-[#0ea5e9] text-white px-8 py-3 rounded-lg hover:opacity-90 font-medium transition-opacity shadow-md text-center"
                >
                  Schedule a Consultation
                </Link>
                <Link 
                  href="/education"
                  className="inline-block border-2 border-[#0ea5e9] text-[#0ea5e9] px-8 py-3 rounded-lg hover:bg-[#0ea5e9] hover:text-white transition-colors font-medium text-center"
                >
                  More Education Resources
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#1e3a8a]">
              Helpful Resources
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-[#0ea5e9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#1e3a8a]">Credit Counseling</h3>
                <p className="text-gray-700 text-sm">
                  Get help improving your credit score and managing debt before applying for a mortgage.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-[#fbbf24] rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-[#1e3a8a]" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#1e3a8a]">Mortgage Calculator</h3>
                <p className="text-gray-700 text-sm">
                  Estimate your monthly payments and see how different loan terms affect your budget.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-[#1e3a8a] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#1e3a8a]">Homebuyer Education</h3>
                <p className="text-gray-700 text-sm">
                  Complete required homebuyer education courses to qualify for certain assistance programs.
                </p>
              </div>
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
                Your trusted HUD Buyer's Agency in North Carolina
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
