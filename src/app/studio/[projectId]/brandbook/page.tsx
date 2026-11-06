'use client';

import { useState, useRef } from 'react';
import { useBrandStore } from '@/store';

type Section = {
  id: string;
  title: string;
  enabled: boolean;
};

const DEFAULT_SECTIONS: Section[] = [
  { id: 'cover', title: 'Cover', enabled: true },
  { id: 'overview', title: 'Brand Overview', enabled: true },
  { id: 'strategy', title: 'Strategy', enabled: true },
  { id: 'logo', title: 'Logo', enabled: true },
  { id: 'palette', title: 'Color Palette', enabled: true },
  { id: 'typography', title: 'Typography', enabled: true },
  { id: 'voice', title: 'Voice & Tone', enabled: true },
  { id: 'assets', title: 'Assets', enabled: true },
];

export default function BrandbookPage() {
  const { currentProject } = useBrandStore();
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [previewMode, setPreviewMode] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!currentProject) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const { brief, dna, palette, typography, logos } = currentProject;
  const primaryLogo = logos.find((l) => l.isPrimary) || logos[0];
  const primaryColor = palette.find((s) => s.role === 'primary')?.hex || '#000000';
  const bgHex = palette.find((s) => s.role === 'background')?.hex || '#FFFFFF';
  const textHex = palette.find((s) => s.role === 'text')?.hex || '#000000';

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const isEnabled = (id: string) => sections.find((s) => s.id === id)?.enabled ?? true;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl">
      {/* Controls — hidden in print */}
      <div className="print:hidden mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Brandbook</h1>
            <p className="text-gray-600">Preview and export your complete brand guide</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium transition"
            >
              {previewMode ? '✏️ Edit Sections' : '👁️ Preview'}
            </button>
            <button
              onClick={handlePrint}
              className="text-sm px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 font-medium transition"
            >
              📄 Export PDF
            </button>
          </div>
        </div>

        {/* Section toggles */}
        {(!previewMode) && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="text-sm font-semibold mb-3">Sections</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => toggleSection(section.id)}
                  className={`text-xs px-3 py-2 rounded-lg border font-medium transition ${
                    section.enabled
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {section.enabled ? '✓ ' : ''}{section.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Brandbook content */}
      <div
        ref={printRef}
        className="bg-white rounded-xl border border-gray-200 print:border-0 print:shadow-none print:rounded-none overflow-hidden"
        style={{ fontFamily: typography.bodyFont || 'Inter, sans-serif', color: textHex }}
      >
        {/* Cover */}
        {isEnabled('cover') && (
          <div
            className="min-h-[500px] flex flex-col items-center justify-center p-16 text-center print:min-h-0 print:py-24"
            style={{ backgroundColor: primaryColor }}
          >
            {primaryLogo && (
              <div
                className="mb-8 max-w-xs"
                dangerouslySetInnerHTML={{
                  __html: primaryLogo.svg.replace(/fill="[^"]*"/g, `fill="${bgHex}"`),
                }}
              />
            )}
            <h1
              className="text-5xl font-bold mb-4"
              style={{ color: bgHex, fontFamily: typography.headingFont }}
            >
              {brief.brandName}
            </h1>
            {brief.tagline && (
              <p className="text-xl opacity-80" style={{ color: bgHex }}>
                {brief.tagline}
              </p>
            )}
            <div className="mt-12 text-sm opacity-50" style={{ color: bgHex }}>
              Brand Guidelines · {new Date().getFullYear()}
            </div>
          </div>
        )}

        {/* Brand Overview */}
        {isEnabled('overview') && (
          <div className="p-12 print:p-8 border-b border-gray-100">
            <h2
              className="text-3xl font-bold mb-8"
              style={{ fontFamily: typography.headingFont, color: primaryColor }}
            >
              Brand Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Industry</h3>
                <p className="text-lg">{brief.industry}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Location</h3>
                <p className="text-lg">{brief.location || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Brand Stage</h3>
                <p className="text-lg capitalize">{brief.brandStage}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Price Positioning</h3>
                <p className="text-lg capitalize">{brief.pricePositioning || 'Not specified'}</p>
              </div>
              {brief.description && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-lg leading-relaxed">{brief.description}</p>
                </div>
              )}
              {brief.targetCustomers && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Target Audience</h3>
                  <p className="text-lg leading-relaxed">{brief.targetCustomers}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Strategy / Brand DNA */}
        {isEnabled('strategy') && dna && (
          <div className="p-12 print:p-8 border-b border-gray-100">
            <h2
              className="text-3xl font-bold mb-8"
              style={{ fontFamily: typography.headingFont, color: primaryColor }}
            >
              Brand Strategy
            </h2>
            <div className="space-y-8">
              {dna.essence && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Brand Essence</h3>
                  <p className="text-lg italic">&ldquo;{dna.essence}&rdquo;</p>
                </div>
              )}
              {dna.positioning && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Positioning</h3>
                  <p className="text-lg leading-relaxed">{dna.positioning}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {dna.mission && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Mission</h3>
                    <p className="text-lg leading-relaxed">{dna.mission}</p>
                  </div>
                )}
                {dna.vision && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Vision</h3>
                    <p className="text-lg leading-relaxed">{dna.vision}</p>
                  </div>
                )}
              </div>
              {dna.values.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Core Values</h3>
                  <div className="flex flex-wrap gap-2">
                    {dna.values.map((v, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 rounded-full text-sm font-medium"
                        style={{ backgroundColor: primaryColor + '15', color: primaryColor }}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {dna.differentiators.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Differentiators</h3>
                  <ul className="space-y-2">
                    {dna.differentiators.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-lg">
                        <span style={{ color: primaryColor }}>→</span> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {isEnabled('strategy') && !dna && (
          <div className="p-12 print:p-8 border-b border-gray-100">
            <h2
              className="text-3xl font-bold mb-4"
              style={{ fontFamily: typography.headingFont, color: primaryColor }}
            >
              Brand Strategy
            </h2>
            <p className="text-gray-400">Generate Brand DNA first to include strategy in the brandbook.</p>
          </div>
        )}

        {/* Logo */}
        {isEnabled('logo') && (
          <div className="p-12 print:p-8 border-b border-gray-100">
            <h2
              className="text-3xl font-bold mb-8"
              style={{ fontFamily: typography.headingFont, color: primaryColor }}
            >
              Logo
            </h2>
            {logos.length > 0 ? (
              <div className="space-y-8">
                {/* Primary logo */}
                {primaryLogo && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Primary Logo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className="rounded-xl p-12 flex items-center justify-center border border-gray-100"
                        style={{ backgroundColor: bgHex }}
                      >
                        <div
                          className="max-w-full"
                          dangerouslySetInnerHTML={{ __html: primaryLogo.svg }}
                        />
                      </div>
                      <div className="rounded-xl p-12 flex items-center justify-center bg-gray-900">
                        <div
                          className="max-w-full"
                          dangerouslySetInnerHTML={{
                            __html: primaryLogo.svg.replace(/fill="[^"]*"/g, `fill="${bgHex}"`),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {/* All variants */}
                {logos.length > 1 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">All Variants</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {logos.map((logo) => (
                        <div
                          key={logo.id}
                          className="rounded-xl border border-gray-100 p-6 flex flex-col items-center justify-center"
                        >
                          <div
                            className="max-w-full mb-2"
                            dangerouslySetInnerHTML={{ __html: logo.svg }}
                          />
                          <span className="text-xs text-gray-400">{logo.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400">No logos created yet.</p>
            )}
          </div>
        )}

        {/* Color Palette */}
        {isEnabled('palette') && (
          <div className="p-12 print:p-8 border-b border-gray-100">
            <h2
              className="text-3xl font-bold mb-8"
              style={{ fontFamily: typography.headingFont, color: primaryColor }}
            >
              Color Palette
            </h2>
            {palette.length > 0 ? (
              <div className="space-y-6">
                {/* Palette strip */}
                <div className="flex rounded-xl overflow-hidden h-24 shadow-sm">
                  {palette.map((swatch) => (
                    <div
                      key={swatch.id}
                      className="flex-1 flex items-end justify-center pb-3"
                      style={{ backgroundColor: swatch.hex }}
                    >
                      <span
                        className="text-xs font-mono font-semibold opacity-80"
                        style={{
                          color: swatch.hex === '#FFFFFF' || swatch.hex === '#ffffff'
                            ? '#000'
                            : '#fff',
                        }}
                      >
                        {swatch.hex}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Role details */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {palette.map((swatch) => (
                    <div key={swatch.id} className="text-center">
                      <div
                        className="w-full aspect-square rounded-xl mb-2 border border-gray-100"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <div className="text-xs font-semibold capitalize">{swatch.role}</div>
                      <div className="text-xs text-gray-400 font-mono">{swatch.hex}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No colors defined yet.</p>
            )}
          </div>
        )}

        {/* Typography */}
        {isEnabled('typography') && (
          <div className="p-12 print:p-8 border-b border-gray-100">
            <h2
              className="text-3xl font-bold mb-8"
              style={{ fontFamily: typography.headingFont, color: primaryColor }}
            >
              Typography
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Heading Font
                </h3>
                <div style={{ fontFamily: typography.headingFont }}>
                  <p className="text-4xl font-bold mb-2" style={{ color: textHex }}>
                    {brief.brandName}
                  </p>
                  <p className="text-lg text-gray-500">
                    {typography.headingFont}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                    abcdefghijklmnopqrstuvwxyz<br />
                    0123456789
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Body Font
                </h3>
                <div style={{ fontFamily: typography.bodyFont }}>
                  <p className="text-lg mb-2" style={{ color: textHex }}>
                    The quick brown fox jumps over the lazy dog.
                  </p>
                  <p className="text-lg text-gray-500">
                    {typography.bodyFont}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    АБВГДЕЁЖЗИЙКЛМНОӨҮП<br />
                    РСТУФХЦЧШЩЪЫЬЭЮЯ
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voice & Tone */}
        {isEnabled('voice') && dna && (
          <div className="p-12 print:p-8 border-b border-gray-100">
            <h2
              className="text-3xl font-bold mb-8"
              style={{ fontFamily: typography.headingFont, color: primaryColor }}
            >
              Voice & Tone
            </h2>
            <div className="space-y-6">
              {dna.voiceTraits.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Voice Traits
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {dna.voiceTraits.map((trait, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 rounded-full text-sm font-medium border"
                        style={{ borderColor: primaryColor + '40', color: primaryColor }}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {dna.messagingPillars.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Messaging Pillars
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dna.messagingPillars.map((pillar, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-lg border border-gray-100"
                      >
                        <div className="font-semibold" style={{ color: textHex }}>
                          {pillar}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {dna.taglineOptions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Tagline Options
                  </h3>
                  <div className="space-y-2">
                    {dna.taglineOptions.map((tagline, i) => (
                      <p
                        key={i}
                        className="text-xl italic"
                        style={{ color: primaryColor }}
                      >
                        &ldquo;{tagline}&rdquo;
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Applications */}
        {isEnabled('assets') && (
          <div className="p-12 print:p-8">
            <h2
              className="text-3xl font-bold mb-8"
              style={{ fontFamily: typography.headingFont, color: primaryColor }}
            >
              Applications
            </h2>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Channels
              </h3>
              <div className="flex flex-wrap gap-2">
                {brief.applications.map((app) => (
                  <span
                    key={app}
                    className="px-4 py-2 rounded-full text-sm font-medium capitalize"
                    style={{ backgroundColor: primaryColor + '15', color: primaryColor }}
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>
            {brief.competitors && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Competitive Landscape
                </h3>
                <p className="text-lg leading-relaxed">{brief.competitors}</p>
              </div>
            )}
            {brief.differentiation && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Key Differentiation
                </h3>
                <p className="text-lg leading-relaxed">{brief.differentiation}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Print styles */}
      <style jsx>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            margin: 0;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
