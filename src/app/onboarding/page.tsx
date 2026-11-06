'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n, I18nProvider } from '@/i18n';
import { useBrandStore } from '@/store';
import type { BrandBrief, BrandSource } from '@/types';
import Navbar from '@/components/Navbar';

export default function OnboardingPage() {
  return (
    <I18nProvider>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <OnboardingContent />
      </Suspense>
    </I18nProvider>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = (searchParams.get('source') || 'scratch') as BrandSource;
  const { t, locale } = useI18n();
  const { createProject } = useBrandStore();

  const [step, setStep] = useState(1);
  const [brief, setBrief] = useState<Partial<BrandBrief>>({
    personality: {
      seriousVsPlayful: 50,
      casualVsFormal: 50,
      classicVsContemporary: 50,
      quietVsBold: 50,
      reservedVsWarm: 50,
      accessibleVsPremium: 50,
    },
    languagePreference: locale,
  });

  // Autosave
  useEffect(() => {
    const saved = localStorage.getItem('brando_onboarding_draft');
    if (saved) {
      try {
        setBrief(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load draft');
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(brief).length > 0) {
      localStorage.setItem('brando_onboarding_draft', JSON.stringify(brief));
    }
  }, [brief]);

  const updateBrief = (updates: Partial<BrandBrief>) => {
    setBrief((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = (): boolean => {
    if (step === 1) {
      return !!(brief.brandName && brief.industry);
    }
    return true;
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleGenerate = async () => {
    if (!brief.brandName || !brief.industry) {
      alert('Brand name and industry are required');
      return;
    }

    const fullBrief: BrandBrief = {
      brandName: brief.brandName || '',
      tagline: brief.tagline,
      industry: brief.industry || '',
      product: brief.product,
      description: brief.description,
      brandStage: brief.brandStage || 'new',
      languagePreference: brief.languagePreference || 'en',
      targetCustomers: brief.targetCustomers,
      location: brief.location,
      competitors: brief.competitors,
      differentiation: brief.differentiation,
      pricePositioning: brief.pricePositioning,
      brandPromise: brief.brandPromise,
      primaryGoal: brief.primaryGoal,
      personality: brief.personality || {
        seriousVsPlayful: 50,
        casualVsFormal: 50,
        classicVsContemporary: 50,
        quietVsBold: 50,
        reservedVsWarm: 50,
        accessibleVsPremium: 50,
      },
      adjectives: brief.adjectives,
      preferredColors: brief.preferredColors,
      avoidedColors: brief.avoidedColors,
      logoStyle: brief.logoStyle,
      typePreference: brief.typePreference,
      references: brief.references,
      applications: brief.applications || ['web'],
      deliverablePriorities: brief.deliverablePriorities,
    };

    const projectId = await createProject(brief.brandName, source, fullBrief);
    localStorage.removeItem('brando_onboarding_draft');
    router.push(`/studio/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Step {step} of 5</span>
              <span className="text-sm text-gray-500">{Math.round((step / 5) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            {step === 1 && <Step1 brief={brief} updateBrief={updateBrief} />}
            {step === 2 && <Step2 brief={brief} updateBrief={updateBrief} />}
            {step === 3 && <Step3 brief={brief} updateBrief={updateBrief} />}
            {step === 4 && <Step4 brief={brief} updateBrief={updateBrief} />}
            {step === 5 && <Step5 brief={brief} updateBrief={updateBrief} />}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Back
            </button>
            {step < 5 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                className="px-6 py-3 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition font-medium"
              >
                Generate Brand
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step1({ brief, updateBrief }: { brief: Partial<BrandBrief>; updateBrief: (u: Partial<BrandBrief>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Business Basics</h2>
        <p className="text-gray-600">Tell us about your brand</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Brand Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={brief.brandName || ''}
          onChange={(e) => updateBrief({ brandName: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none transition"
          placeholder="Your brand name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tagline</label>
        <input
          type="text"
          value={brief.tagline || ''}
          onChange={(e) => updateBrief({ tagline: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none transition"
          placeholder="A short slogan (optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Industry <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={brief.industry || ''}
          onChange={(e) => updateBrief({ industry: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none transition"
          placeholder="e.g., Technology, Fashion, Food & Beverage"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Brand Stage</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => updateBrief({ brandStage: 'new' })}
            className={`p-4 rounded-lg border-2 transition ${
              brief.brandStage === 'new'
                ? 'border-brand-600 bg-brand-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium">New Brand</div>
            <div className="text-sm text-gray-600">Starting from scratch</div>
          </button>
          <button
            onClick={() => updateBrief({ brandStage: 'existing' })}
            className={`p-4 rounded-lg border-2 transition ${
              brief.brandStage === 'existing'
                ? 'border-brand-600 bg-brand-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium">Existing Brand</div>
            <div className="text-sm text-gray-600">Refreshing or rebranding</div>
          </button>
        </div>
      </div>
    </div>
  );
}

function Step2({ brief, updateBrief }: { brief: Partial<BrandBrief>; updateBrief: (u: Partial<BrandBrief>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Audience & Positioning</h2>
        <p className="text-gray-600">Who are you serving?</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Target Customers</label>
        <textarea
          value={brief.targetCustomers || ''}
          onChange={(e) => updateBrief({ targetCustomers: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none transition resize-none"
          placeholder="Describe your ideal customers"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Location / Market</label>
        <input
          type="text"
          value={brief.location || ''}
          onChange={(e) => updateBrief({ location: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none transition"
          placeholder="e.g., Mongolia, Global, Southeast Asia"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Competitors</label>
        <textarea
          value={brief.competitors || ''}
          onChange={(e) => updateBrief({ competitors: e.target.value })}
          rows={2}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none transition resize-none"
          placeholder="Who are your main competitors?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">What makes you different?</label>
        <textarea
          value={brief.differentiation || ''}
          onChange={(e) => updateBrief({ differentiation: e.target.value })}
          rows={2}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none transition resize-none"
          placeholder="Your unique value proposition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Price Positioning</label>
        <select
          value={brief.pricePositioning || ''}
          onChange={(e) => updateBrief({ pricePositioning: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none transition"
        >
          <option value="">Select...</option>
          <option value="budget">Budget</option>
          <option value="mid">Mid-range</option>
          <option value="mid-premium">Mid-premium</option>
          <option value="premium">Premium</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>
    </div>
  );
}

function Step3({ brief, updateBrief }: { brief: Partial<BrandBrief>; updateBrief: (u: Partial<BrandBrief>) => void }) {
  const personality = brief.personality || {
    seriousVsPlayful: 50,
    casualVsFormal: 50,
    classicVsContemporary: 50,
    quietVsBold: 50,
    reservedVsWarm: 50,
    accessibleVsPremium: 50,
  };

  const sliders = [
    { key: 'seriousVsPlayful', left: 'Serious', right: 'Playful' },
    { key: 'casualVsFormal', left: 'Casual', right: 'Formal' },
    { key: 'classicVsContemporary', left: 'Classic', right: 'Contemporary' },
    { key: 'quietVsBold', left: 'Quiet', right: 'Bold' },
    { key: 'reservedVsWarm', left: 'Reserved', right: 'Warm' },
    { key: 'accessibleVsPremium', left: 'Accessible', right: 'Premium' },
  ] as const;

  const updatePersonality = (key: keyof typeof personality, value: number) => {
    updateBrief({
      personality: { ...personality, [key]: value },
    });
  };

  const [adjectivesInput, setAdjectivesInput] = useState(
    (brief.adjectives || []).join(', ')
  );

  const handleAdjectivesChange = (value: string) => {
    setAdjectivesInput(value);
    const parsed = value.split(',').map((s) => s.trim()).filter(Boolean);
    updateBrief({ adjectives: parsed });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Brand Personality</h2>
        <p className="text-gray-600">Define your brand&apos;s character</p>
      </div>

      <div className="space-y-6">
        {sliders.map(({ key, left, right }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{left}</span>
              <span className="text-sm font-medium text-gray-700">{right}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="25"
              value={personality[key]}
              onChange={(e) => updatePersonality(key, Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Brand Adjectives (optional)</label>
        <input
          type="text"
          value={adjectivesInput}
          onChange={(e) => handleAdjectivesChange(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none transition"
          placeholder="e.g., modern, trustworthy, innovative"
        />
        <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
      </div>
    </div>
  );
}

function Step4({ brief, updateBrief }: { brief: Partial<BrandBrief>; updateBrief: (u: Partial<BrandBrief>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Visual Preferences</h2>
        <p className="text-gray-600">Tell us about your visual style</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Preferred Colors (optional)</label>
        <input
          type="text"
          value={(brief.preferredColors || []).join(', ')}
          onChange={(e) => updateBrief({ preferredColors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none transition"
          placeholder="e.g., #0EA5E9, blue, green"
        />
        <p className="text-xs text-gray-500 mt-1">HEX codes or color names, comma-separated</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Logo Style</label>
        <select
          value={brief.logoStyle || ''}
          onChange={(e) => updateBrief({ logoStyle: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none transition"
        >
          <option value="">No preference</option>
          <option value="wordmark">Wordmark (text only)</option>
          <option value="monogram">Monogram (letters)</option>
          <option value="symbol">Symbol / Icon</option>
          <option value="combination">Combination mark</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Reference URLs (optional)</label>
        <textarea
          value={(brief.references || []).join('\n')}
          onChange={(e) => updateBrief({ references: e.target.value.split('\n').filter(Boolean) })}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none transition resize-none"
          placeholder="Links to brands you admire (one per line)"
        />
      </div>
    </div>
  );
}

function Step5({ brief, updateBrief }: { brief: Partial<BrandBrief>; updateBrief: (u: Partial<BrandBrief>) => void }) {
  const applications = brief.applications || [];

  const toggleApp = (app: string) => {
    const newApps = applications.includes(app)
      ? applications.filter((a) => a !== app)
      : [...applications, app];
    updateBrief({ applications: newApps });
  };

  const appOptions = [
    { key: 'web', label: 'Website', icon: '🌐' },
    { key: 'social', label: 'Social Media', icon: '📱' },
    { key: 'print', label: 'Print Materials', icon: '📄' },
    { key: 'packaging', label: 'Packaging', icon: '📦' },
    { key: 'presentation', label: 'Presentations', icon: '📊' },
    { key: 'signage', label: 'Signage', icon: '🪧' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Goals & Applications</h2>
        <p className="text-gray-600">Where will your brand appear?</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Applications</label>
        <div className="grid grid-cols-2 gap-3">
          {appOptions.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => toggleApp(key)}
              className={`p-4 rounded-lg border-2 transition text-left ${
                applications.includes(key)
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{icon}</div>
              <div className="font-medium text-sm">{label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Ready to generate!</h3>
        <p className="text-sm text-blue-700">
          We&apos;ll create your brand identity based on your answers. You can edit everything afterward.
        </p>
      </div>
    </div>
  );
}
