'use client';

import { useI18n } from '@/i18n';

export default function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    { key: 'brief', icon: '📝', data: t.howItWorks.steps.brief },
    { key: 'generate', icon: '✨', data: t.howItWorks.steps.generate },
    { key: 'refine', icon: '🎨', data: t.howItWorks.steps.refine },
    { key: 'publish', icon: '🚀', data: t.howItWorks.steps.publish },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">{t.howItWorks.title}</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.key} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gray-200 -translate-x-1/2" />
              )}
              
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-4xl shadow-sm">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.data.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.data.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
