'use client';

import { useState } from 'react';
import { useI18n } from '@/i18n';

export default function FAQ() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{t.faq.title}</h2>
          <p className="text-xl text-gray-600">
            {'Everything you need to know about Brando.'}
          </p>
        </div>

        {/* FAQ items */}
        <div className="space-y-3">
          {t.faq.items.map((item, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl border transition-all duration-200 ${
                openIndex === index
                  ? 'border-purple-200 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
              >
                <span className="font-semibold text-gray-900">{item.q}</span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    openIndex === index
                      ? 'bg-purple-100 text-purple-600 rotate-180'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-5 text-gray-600 leading-relaxed">{item.a}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-12 text-center p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
          <div className="text-3xl mb-3">💬</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {'Still have questions?'}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {"We'd love to help you out."}
          </p>
          <a
            href="mailto:hello@brando.app"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {'Get in touch'}
          </a>
        </div>
      </div>
    </section>
  );
}
