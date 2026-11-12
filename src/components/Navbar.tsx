'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n';
import { useAuth } from '@/components/AuthProvider';

export default function Navbar() {
  const { locale, setLocale, t } = useI18n();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'mn' : 'en');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
              B
            </div>
            <span className="text-xl font-bold text-gray-900">Brando</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: '#features', label: t.nav.features },
              { href: '#how-it-works', label: t.nav.howItWorks },
              { href: '#faq', label: t.nav.faq },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLocale}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium transition"
            >
              {locale === 'en' ? 'MN' : 'EN'}
            </button>

            {/* Auth-aware links */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium transition"
                >
                  {t.nav.myProjects || 'My Projects'}
                </Link>
                <button
                  onClick={signOut}
                  className="text-sm px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 font-medium transition"
                >
                  {t.nav.signOut || 'Sign Out'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 font-medium transition"
                >
                  {t.nav.signIn || 'Sign In'}
                </Link>
                <Link
                  href="/start"
                  className="text-sm px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 font-medium transition shadow-sm hover:shadow"
                >
                  {t.nav.startCreating}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? 'max-h-96 pb-4' : 'max-h-0'
        }`}>
          <div className="flex flex-col gap-1 pt-2 border-t border-gray-100">
            {[
              { href: '#features', label: t.nav.features },
              { href: '#how-it-works', label: t.nav.howItWorks },
              { href: '#faq', label: t.nav.faq },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
              >
                {item.label}
              </a>
            ))}
            
            <div className="h-px bg-gray-100 my-2" />
            
            <button
              onClick={toggleLocale}
              className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-left transition"
            >
              {locale === 'en' ? 'Монгол хэл' : 'English'}
            </button>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition"
                >
                  {t.nav.myProjects || 'My Projects'}
                </Link>
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-left transition"
                >
                  {t.nav.signOut || 'Sign Out'}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
                >
                  {t.nav.signIn || 'Sign In'}
                </Link>
                <Link
                  href="/start"
                  onClick={() => setMobileOpen(false)}
                  className="mx-4 mt-2 px-4 py-3 text-sm font-medium text-center bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                >
                  {t.nav.startCreating}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
