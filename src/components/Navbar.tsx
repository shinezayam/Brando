'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n';
import { useAuth } from '@/components/AuthProvider';

export default function Navbar() {
  const { locale, setLocale, t } = useI18n();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'mn' : 'en');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Brando
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition">
              {t.nav.features}
            </a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition">
              {t.nav.howItWorks}
            </a>
            <a href="#examples" className="text-sm text-gray-600 hover:text-gray-900 transition">
              {t.nav.examples}
            </a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition">
              {t.nav.faq}
            </a>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLocale}
              className="text-sm px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 transition"
            >
              {locale === 'en' ? 'MN' : 'EN'}
            </button>

            {/* Auth-aware links */}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50 transition"
                >
                  My Projects
                </Link>
                <button
                  onClick={signOut}
                  className="text-sm px-4 py-2 rounded-md text-gray-600 hover:text-gray-900 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm px-4 py-2 rounded-md text-gray-600 hover:text-gray-900 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/start"
                  className="text-sm px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition"
                >
                  {t.nav.startCreating}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
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
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-3">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">
                {t.nav.features}
              </a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900">
                {t.nav.howItWorks}
              </a>
              <a href="#examples" className="text-sm text-gray-600 hover:text-gray-900">
                {t.nav.examples}
              </a>
              <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900">
                {t.nav.faq}
              </a>
              <button
                onClick={toggleLocale}
                className="text-sm px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 w-fit"
              >
                {locale === 'en' ? 'Монгол' : 'English'}
              </button>
              
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50 text-center"
                  >
                    My Projects
                  </Link>
                  <button
                    onClick={signOut}
                    className="text-sm px-4 py-2 rounded-md text-gray-600 hover:text-gray-900 text-center"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50 text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/start"
                    className="text-sm px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 text-center"
                  >
                    {t.nav.startCreating}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
