'use client';

import { useI18n } from '@/i18n';

export default function Features() {
  const { t } = useI18n();

  const features = [
    {
      key: 'logo',
      icon: '✨',
      gradient: 'from-purple-500 to-blue-500',
      data: t.features.visualFoundation,
      highlights: ['AI Generation', '50+ Templates', 'SVG Export'],
    },
    {
      key: 'colors',
      icon: '🎨',
      gradient: 'from-pink-500 to-orange-500',
      data: t.features.brandDNA,
      highlights: ['Smart Palettes', 'WCAG Check', 'Harmony Rules'],
    },
    {
      key: 'assets',
      icon: '📦',
      gradient: 'from-green-500 to-teal-500',
      data: t.features.assetManager,
      highlights: ['Cloud Storage', 'Organize', 'Quick Access'],
    },
    {
      key: 'brandbook',
      icon: '📖',
      gradient: 'from-amber-500 to-red-500',
      data: t.features.brandbook,
      highlights: ['Auto-Assembled', 'PDF Export', 'Share Ready'],
    },
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-sm text-gray-600 mb-4">
            <span>⚡</span>
            <span>{'Everything you need'}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{t.features.title}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {'From logo to brand guidelines, all in one place.'}
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.key}
              className="group relative bg-white rounded-2xl border border-gray-200 p-8 hover:border-gray-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Gradient icon */}
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} text-white text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.data.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-6">{feature.data.desc}</p>

              {/* Highlights */}
              <div className="flex flex-wrap gap-2">
                {feature.highlights?.map((highlight) => (
                  <span
                    key={highlight}
                    className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
                  >
                    {highlight}
                  </span>
                ))}
              </div>

              {/* Decorative corner */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-tr-2xl rounded-bl-full transition-opacity`} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white" />
              <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white" />
              <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-900">{'Join brands building with Brando'}</div>
              <div className="text-xs text-gray-500">{'Free forever • No credit card'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
