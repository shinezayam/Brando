'use client';

import { useI18n } from '@/i18n';

export default function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    { key: 'brief', icon: '📝', number: '01', data: t.howItWorks.steps.brief },
    { key: 'generate', icon: '✨', number: '02', data: t.howItWorks.steps.generate },
    { key: 'refine', icon: '🎨', number: '03', data: t.howItWorks.steps.refine },
    { key: 'publish', icon: '🚀', number: '04', data: t.howItWorks.steps.publish },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{t.howItWorks.title}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.howItWorks.subtitle || 'Four simple steps to your complete brand identity.'}
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-200 via-blue-200 to-purple-200 hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.key} className="relative group">
                {/* Step card */}
                <div className="relative bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                  {/* Number badge */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{step.data.title}</h3>
                  <p className="text-gray-600 text-sm text-center leading-relaxed">{step.data.desc}</p>
                </div>

                {/* Arrow connector (mobile) */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-4">
                    <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom highlight */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-full border border-purple-100">
            <span className="text-2xl">⚡</span>
            <span className="text-sm font-medium text-gray-700">
              {t.howItWorks.fast || 'Complete your brand identity in under 10 minutes'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
