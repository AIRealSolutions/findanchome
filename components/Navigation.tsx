'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, MessageCircle, Mail, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';
import LanternLogo from './LanternLogo';
import { BROKERAGE } from '@/lib/site';

const navItems = [
  { label: 'Explore', href: '/explore' },
  { label: 'Lifestyles', href: '/lifestyle' },
  { label: 'Search Homes', href: '/search' },
  { label: 'HUD Homes', href: '/hud' },
  { label: 'Buy', href: '/buyers' },
  { label: 'Sell', href: '/sellers' },
  { label: 'Invest', href: '/investments' },
  { label: 'About', href: '/about' },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useFocusTrap(menuRef, mobileMenuOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock page scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Utility bar */}
      <aside aria-label="Contact" className="hidden md:block bg-ink text-white/70 text-xs">
        <div className="container mx-auto px-4 flex items-center justify-between h-9">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brass" aria-hidden />
            <span>
              {BROKERAGE.name} <span className="text-white/30 mx-1" aria-hidden>|</span> Registered HUD Buyer&apos;s Agency serving all of North Carolina
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a href={`tel:${BROKERAGE.phoneE164}`} className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={13} aria-hidden /> {BROKERAGE.phone}
            </a>
            <a href={`mailto:${BROKERAGE.email}`} className="hidden lg:inline-flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail size={13} /> Email us
            </a>
            <Link href="/login" className="hover:text-white transition-colors">
              Client login
            </Link>
          </div>
        </div>
      </aside>

      {/* Main bar */}
      <header
        className={`sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b transition-shadow ${
          scrolled ? 'border-stone shadow-[0_8px_30px_-12px_rgba(10,22,40,0.25)]' : 'border-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-[72px]">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0" aria-label="FindaNChome.com home">
              <span className="grid place-items-center h-11 w-11 rounded-xl bg-ink shadow-sm">
                <LanternLogo size={30} />
              </span>
              <span className="leading-tight">
                <span className="block text-[17px] sm:text-[19px] font-semibold tracking-tight text-ink">
                  FindaNC<span className="text-brass-dark">home</span>
                  <span className="text-slate-600 font-normal">.com</span>
                </span>
                <span className="block text-[10px] sm:text-[11px] uppercase tracking-[0.14em] sm:tracking-[0.16em] text-slate-500">Southeastern North Carolina</span>
              </span>
            </Link>

            <nav className="hidden xl:flex items-center gap-1" aria-label="Main">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`relative px-3 py-2 text-[14px] font-medium transition-colors ${
                      active ? 'text-ink' : 'text-slate-600 hover:text-ink'
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute left-3 right-3 -bottom-[1px] h-[2px] rounded-full bg-brass transition-opacity ${
                        active ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/contact"
                className="hidden sm:inline-flex items-center gap-2 bg-ink text-white text-sm font-medium pl-5 pr-4 py-2.5 rounded-full hover:bg-navy transition-colors"
              >
                Book a consultation <ArrowRight size={15} />
              </Link>
              <a
                href={`tel:${BROKERAGE.phoneE164}`}
                className="xl:hidden p-2.5 rounded-full text-ink hover:bg-sand transition-colors"
                aria-label={`Call ${BROKERAGE.phone}`}
              >
                <Phone size={20} />
              </a>
              <a
                href={`sms:${BROKERAGE.phoneE164}`}
                className="hidden sm:inline-flex xl:hidden p-2.5 rounded-full text-ink hover:bg-sand transition-colors"
                aria-label={`Text ${BROKERAGE.phone}`}
              >
                <MessageCircle size={20} />
              </a>
              <button
                className="xl:hidden p-2.5 rounded-full text-ink hover:bg-sand transition-colors"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>

      </header>

      {/* Mobile menu: rendered outside <header> because the header's backdrop blur
          would otherwise become the containing block for this fixed panel and clip it. */}
      {mobileMenuOpen && (
        <div ref={menuRef} id="mobile-menu" className="xl:hidden fixed inset-0 z-[70] bg-white flex flex-col" role="dialog" aria-modal="true" aria-label="Site menu">
          <div className="container mx-auto px-4 flex items-center justify-between h-[72px] border-b border-stone shrink-0">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5" aria-label="FindaNChome.com home">
              <span className="grid place-items-center h-11 w-11 rounded-xl bg-ink">
                <LanternLogo size={30} />
              </span>
              <span className="text-[17px] font-semibold tracking-tight text-ink">
                FindaNC<span className="text-brass-dark">home</span>
                <span className="text-slate-600 font-normal">.com</span>
              </span>
            </Link>
            <button
              className="p-2.5 rounded-full text-ink hover:bg-sand transition-colors"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto" aria-label="Mobile">
            <div className="container mx-auto px-4 py-4 flex flex-col">
              {[{ label: 'Home', href: '/' }, ...navItems].map((item) => {
                const active = item.href === '/' ? pathname === '/' : isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between py-4 border-b border-stone text-lg ${
                      active ? 'text-ink font-semibold' : 'text-slate-700'
                    }`}
                  >
                    {item.label}
                    <ArrowRight size={18} className={active ? 'text-brass' : 'text-slate-300'} />
                  </Link>
                );
              })}
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-6 inline-flex items-center justify-center gap-2 bg-ink text-white font-medium px-5 py-3.5 rounded-full"
              >
                Book a consultation <ArrowRight size={16} />
              </Link>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <a href={`tel:${BROKERAGE.phoneE164}`} className="inline-flex items-center justify-center gap-2 rounded-full ring-1 ring-stone py-3 text-ink font-medium">
                  <Phone size={16} /> Call
                </a>
                <a href={`sms:${BROKERAGE.phoneE164}`} className="inline-flex items-center justify-center gap-2 rounded-full ring-1 ring-stone py-3 text-ink font-medium">
                  <MessageCircle size={16} /> Text
                </a>
              </div>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-3 text-center py-3 text-slate-600 font-medium"
              >
                Client login
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
