'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Phone, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import LanternLogo from './LanternLogo';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Explore the Region', href: '/explore' },
    { label: 'Find Your Lifestyle', href: '/lifestyle' },
    { label: 'Search Homes', href: '/search' },
    { label: 'HUD Homes', href: '/hud' },
    { label: 'Buyers', href: '/buyers' },
    { label: 'Sellers', href: '/sellers' },
    { label: 'Investments', href: '/investments' },
    { label: 'Our Leadership', href: '/about' },
    { label: 'Contact', href: '/contact', isButton: true },
  ];

  const authItems = [
    { label: 'Login', href: '/auth/login', isAuth: true },
    { label: 'Sign Up', href: '/auth/signup', isAuthButton: true },
  ];

  return (
    <header className="bg-[#1e3a8a] text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo and Site Name */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="flex-shrink-0">
              <LanternLogo size={50} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl lg:text-2xl font-bold">FindaNChome.com</h1>
              <p className="text-xs opacity-90">Southeastern North Carolina</p>
            </div>
          </Link>

          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  item.isButton
                    ? 'bg-[#fbbf24] text-[#1e3a8a] px-4 py-2 rounded-lg hover:bg-[#fcd34d] transition-colors font-medium'
                    : 'px-3 py-2 text-sm hover:text-[#fbbf24] transition-colors font-medium'
                }
              >
                {item.label}
              </Link>
            ))}
            <div className="border-l border-white/20 ml-2 pl-2 flex items-center gap-2">
              {authItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    item.isAuthButton
                      ? 'bg-[#fbbf24] text-[#1e3a8a] px-4 py-2 rounded-lg hover:bg-[#fcd34d] transition-colors font-medium'
                      : 'px-3 py-2 text-sm hover:text-[#fbbf24] transition-colors font-medium'
                  }
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Mobile Contact Bar & Menu Button */}
          <div className="flex lg:hidden items-center gap-3">
            <a
              href="tel:+19103636147"
              className="p-2 hover:bg-[#0ea5e9]/20 rounded transition-colors"
              aria-label="Call"
              title="Call (910) 363-6147"
            >
              <Phone size={20} />
            </a>
            <a
              href="sms:+19103636147"
              className="p-2 hover:bg-[#0ea5e9]/20 rounded transition-colors"
              aria-label="Text"
              title="Text (910) 363-6147"
            >
              <MessageCircle size={20} />
            </a>
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-white/20">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    item.isButton
                      ? 'bg-[#fbbf24] text-[#1e3a8a] px-4 py-3 rounded-lg hover:bg-[#fcd34d] transition-colors font-medium text-center mt-2'
                      : 'px-4 py-2 hover:text-[#fbbf24] transition-colors font-medium'
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-white/20 mt-2 pt-2 flex flex-col gap-2">
                {authItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      item.isAuthButton
                        ? 'bg-[#fbbf24] text-[#1e3a8a] px-4 py-3 rounded-lg hover:bg-[#fcd34d] transition-colors font-medium text-center'
                        : 'px-4 py-2 hover:text-[#fbbf24] transition-colors font-medium'
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
