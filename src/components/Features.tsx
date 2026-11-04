'use client';

import { useI18n } from '@/i18n';

export default function Features() {
  const { t } = useI18n();

  const features = [
    { key: 'visualFoundation', icon: '🎨', data: t.features.visualFoundation },
    { key: 'brandDNA', icon: '💎', data: t.features.brandDNA },
    { key: 'assetManager', icon: '📦', data: t.features.assetManager },
    { key: 'brandbook', icon: '📖', data: t.features.brandbook },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">{t.features.title}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <div
              key={feature.key}
              className="p-8 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition bg-white"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-semibold mb-3">{feature.data.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.data.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
