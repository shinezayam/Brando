'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n';
import { useEffect, useState } from 'react';

export default function Hero() {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Badge */}
        <div className={`flex justify-center mb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">AI-Powered Brand Identity Studio</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className={`text-5xl sm:text-6xl lg:text-8xl font-bold text-gray-900 tracking-tight mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="block">{t.hero.headline.split(' ').slice(0, -2).join(' ')}</span>
          <span className="block mt-2 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            {t.hero.headline.split(' ').slice(-2).join(' ')}
          </span>
        </h1>

        {/* Subheadline */}
        <p className={`text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {t.hero.subheadline}
        </p>

        {/* Main CTA */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Link
            href="/onboarding?source=scratch"
            className="group relative w-full sm:w-auto px-8 py-4 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-0.5"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {t.hero.startScratch}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
          <Link
            href="/studio/demo"
            className="w-full sm:w-auto px-8 py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:border-gray-300 hover:bg-white transition-all"
          >
            {t.hero.viewDemo || 'View Demo →'}
          </Link>
        </div>

        {/* Trust indicators */}
        <div className={`flex flex-wrap justify-center gap-8 pt-12 transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{t.hero.freeStart}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{t.hero.noCreditCard}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{t.hero.exportAnytime}</span>
          </div>
        </div>

        {/* Preview mockup */}
        <div className={`mt-16 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="relative mx-auto max-w-4xl">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-2xl" />
            <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-white rounded-md text-xs text-gray-500 border border-gray-200">
                    brando.app/studio
                  </div>
                </div>
              </div>
              {/* App preview */}
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex gap-6">
                  {/* Sidebar */}
                  <div className="w-48 space-y-2">
                    <div className="h-8 bg-purple-100 rounded-lg" />
                    <div className="h-6 bg-gray-100 rounded" />
                    <div className="h-6 bg-gray-100 rounded" />
                    <div className="h-6 bg-gray-100 rounded" />
                    <div className="h-6 bg-gray-100 rounded" />
                  </div>
                  {/* Main content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-48 bg-gray-200 rounded" />
                      <div className="h-8 w-24 bg-purple-500 rounded-lg" />
                    </div>
                    {/* Logo preview area */}
                    <div className="bg-white rounded-xl border border-gray-200 p-8">
                      <div className="flex items-center justify-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl" />
                        <div className="space-y-2">
                          <div className="h-6 w-32 bg-gray-800 rounded" />
                          <div className="h-3 w-24 bg-gray-300 rounded" />
                        </div>
                      </div>
                    </div>
                    {/* Color palette */}
                    <div className="flex gap-2">
                      <div className="h-10 flex-1 bg-purple-500 rounded-lg" />
                      <div className="h-10 flex-1 bg-blue-500 rounded-lg" />
                      <div className="h-10 flex-1 bg-pink-500 rounded-lg" />
                      <div className="h-10 flex-1 bg-amber-500 rounded-lg" />
                      <div className="h-10 flex-1 bg-green-500 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
}
