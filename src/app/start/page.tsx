'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n';
import { I18nProvider } from '@/i18n';
import Navbar from '@/components/Navbar';

export default function StartPage() {
  return (
    <I18nProvider>
      <Navbar />
      <StartContent />
    </I18nProvider>
  );
}

function StartContent() {
  const { t } = useI18n();

  const paths = [
    {
      key: 'scratch',
      icon: '✏️',
      title: t.hero.startScratch,
      desc: 'Start with a brand discovery form. We will guide you through every step.',
      href: '/onboarding?source=scratch',
    },
    {
      key: 'logo',
      icon: '🖼️',
      title: t.hero.uploadLogo,
      desc: 'Upload your existing logo and build a brand identity around it.',
      href: '/onboarding?source=logo',
    },
    {
      key: 'url',
      icon: '🔗',
      title: t.hero.importLink,
      desc: 'Import a website or social media URL to prefill your brand brief.',
      href: '/onboarding?source=url',
    },
  ];

  return (
    <main className="min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">Choose your starting point</h1>
        <p className="text-gray-600 text-center mb-12 text-lg">
          Every path leads to the same brand discovery form.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {paths.map((path) => (
            <Link
              key={path.key}
              href={path.href}
              className="p-8 rounded-xl border-2 border-gray-200 hover:border-gray-900 hover:shadow-lg transition bg-white text-center group"
            >
              <div className="text-5xl mb-6">{path.icon}</div>
              <h2 className="text-xl font-semibold mb-3 group-hover:text-brand-600 transition">
                {path.title}
              </h2>
              <p className="text-gray-500 text-sm">{path.desc}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/studio/demo" className="text-brand-600 hover:underline">
            Or explore the demo project →
          </Link>
        </div>
      </div>
    </main>
  );
}
