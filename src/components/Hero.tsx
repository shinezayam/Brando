'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n';

export default function Hero() {
  const { t } = useI18n();

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto text-center">
        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6">
          {t.hero.headline}
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
          {t.hero.subheadline}
        </p>

        {/* Three CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/onboarding?source=scratch"
            className="w-full sm:w-auto px-8 py-4 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition shadow-lg hover:shadow-xl"
          >
            {t.hero.startScratch}
          </Link>
          <Link
            href="/onboarding?source=logo"
            className="w-full sm:w-auto px-8 py-4 rounded-lg border-2 border-gray-200 text-gray-900 font-medium hover:bg-gray-50 transition"
          >
            {t.hero.uploadLogo}
          </Link>
          <Link
            href="/onboarding?source=url"
            className="w-full sm:w-auto px-8 py-4 rounded-lg border-2 border-gray-200 text-gray-900 font-medium hover:bg-gray-50 transition"
          >
            {t.hero.importLink}
          </Link>
        </div>

        {/* Demo preview hint */}
        <div className="mt-16 text-sm text-gray-500">
          <p>Or try the <Link href="/studio/demo" className="text-brand-600 hover:underline">demo project</Link></p>
        </div>
      </div>
    </section>
  );
}
