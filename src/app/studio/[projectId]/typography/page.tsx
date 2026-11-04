'use client';

import { useState } from 'react';
import { useBrandStore } from '@/store';

interface FontOption {
  name: string;
  category: 'sans-serif' | 'serif' | 'monospace';
  hasCyrillic: boolean;
  weights: number[];
  preview: string;
}

const FONTS: FontOption[] = [
  { name: 'Inter', category: 'sans-serif', hasCyrillic: true, weights: [400, 500, 600, 700], preview: 'The quick brown fox' },
  { name: 'Roboto', category: 'sans-serif', hasCyrillic: true, weights: [400, 500, 700], preview: 'The quick brown fox' },
  { name: 'Open Sans', category: 'sans-serif', hasCyrillic: true, weights: [400, 600, 700], preview: 'The quick brown fox' },
  { name: 'Montserrat', category: 'sans-serif', hasCyrillic: true, weights: [400, 500, 600, 700], preview: 'The quick brown fox' },
  { name: 'PT Sans', category: 'sans-serif', hasCyrillic: true, weights: [400, 700], preview: 'The quick brown fox' },
  { name: 'Nunito', category: 'sans-serif', hasCyrillic: true, weights: [400, 600, 700], preview: 'The quick brown fox' },
  { name: 'PT Serif', category: 'serif', hasCyrillic: true, weights: [400, 700], preview: 'The quick brown fox' },
  { name: 'Merriweather', category: 'serif', hasCyrillic: true, weights: [400, 700, 900], preview: 'The quick brown fox' },
  { name: 'Playfair Display', category: 'serif', hasCyrillic: true, weights: [400, 600, 700, 900], preview: 'The quick brown fox' },
  { name: 'Lora', category: 'serif', hasCyrillic: true, weights: [400, 600, 700], preview: 'The quick brown fox' },
  { name: 'PT Mono', category: 'monospace', hasCyrillic: true, weights: [400], preview: 'The quick brown fox' },
];

const CYRILLIC_SAMPLES = [
  { label: 'Mongolian', text: 'Сайн байна уу? Дэлхийд тавтай морилно уу.' },
  { label: 'Russian', text: 'Привет, мир! Добро пожаловать.' },
];

const TYPE_SCALES = [
  { name: 'Minor Third', h1: 2.074, h2: 1.728, h3: 1.44, body: 1.2, small: 1 },
  { name: 'Major Third', h1: 2.441, h2: 1.953, h3: 1.563, body: 1.25, small: 1 },
  { name: 'Perfect Fourth', h1: 3.157, h2: 2.369, h3: 1.777, body: 1.333, small: 1 },
  { name: 'Golden', h1: 2.618, h2: 1.618, h3: 1.272, body: 1.125, small: 1 },
];

export default function TypographyPage() {
  const { currentProject, updateProject } = useBrandStore();
  const [headingFont, setHeadingFont] = useState(currentProject?.typography?.headingFont || 'Inter');
  const [bodyFont, setBodyFont] = useState(currentProject?.typography?.bodyFont || 'Inter');
  const [selectedScale, setSelectedScale] = useState(1);
  const [headingWeight, setHeadingWeight] = useState(700);
  const [bodySize, setBodySize] = useState(16);

  const scale = TYPE_SCALES[selectedScale];

  const saveTypography = () => {
    if (currentProject) {
      updateProject(currentProject.id, {
        typography: { headingFont, bodyFont },
      });
    }
  };

  const headingCyrillic = FONTS.find((f) => f.name === headingFont)?.hasCyrillic ?? false;
  const bodyCyrillic = FONTS.find((f) => f.name === bodyFont)?.hasCyrillic ?? false;

  if (!currentProject) {
    return <div className="text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Typography</h1>
          <p className="text-gray-600">Choose fonts with Latin and Cyrillic support</p>
        </div>
        <button
          onClick={saveTypography}
          className="text-sm px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 font-medium"
        >
          Save
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Heading font */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Heading Font</h2>
            {headingCyrillic ? (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                ✓ Cyrillic
              </span>
            ) : (
              <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                ✗ No Cyrillic
              </span>
            )}
          </div>

          <select
            value={headingFont}
            onChange={(e) => setHeadingFont(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm mb-4"
          >
            {FONTS.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name} ({f.category}){f.hasCyrillic ? '' : ' — no Cyrillic'}
              </option>
            ))}
          </select>

          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1 block">Weight</label>
            <div className="flex gap-2">
              {(FONTS.find((f) => f.name === headingFont)?.weights || [400, 700]).map((w) => (
                <button
                  key={w}
                  onClick={() => setHeadingWeight(w)}
                  className={`flex-1 py-2 rounded-lg border text-sm transition ${
                    headingWeight === w
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ fontWeight: w }}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div
              style={{ fontFamily: headingFont, fontWeight: headingWeight, fontSize: `${scale.h1}rem` }}
              className="text-gray-900 leading-tight"
            >
              {currentProject.brief.brandName}
            </div>
            <div
              style={{ fontFamily: headingFont, fontWeight: headingWeight, fontSize: `${scale.h2}rem` }}
              className="text-gray-700"
            >
              Heading Two
            </div>
            <div
              style={{ fontFamily: headingFont, fontWeight: headingWeight, fontSize: `${scale.h3}rem` }}
              className="text-gray-600"
            >
              Heading Three
            </div>
          </div>
        </div>

        {/* Body font */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Body Font</h2>
            {bodyCyrillic ? (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                ✓ Cyrillic
              </span>
            ) : (
              <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                ✗ No Cyrillic
              </span>
            )}
          </div>

          <select
            value={bodyFont}
            onChange={(e) => setBodyFont(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm mb-4"
          >
            {FONTS.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name} ({f.category}){f.hasCyrillic ? '' : ' — no Cyrillic'}
              </option>
            ))}
          </select>

          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1 block">Base Size: {bodySize}px</label>
            <input
              type="range"
              min={14}
              max={20}
              value={bodySize}
              onChange={(e) => setBodySize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Preview */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <p
              style={{ fontFamily: bodyFont, fontSize: `${bodySize}px`, lineHeight: 1.6 }}
              className="text-gray-700"
            >
              The quick brown fox jumps over the lazy dog. This is body text used for paragraphs,
              descriptions, and longer content blocks.
            </p>
            <p
              style={{ fontFamily: bodyFont, fontSize: `${bodySize * 0.875}px`, lineHeight: 1.5 }}
              className="text-gray-500"
            >
              Small text — captions, labels, and secondary information use a slightly smaller size.
            </p>
          </div>
        </div>
      </div>

      {/* Type scale */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Type Scale</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {TYPE_SCALES.map((ts, i) => (
            <button
              key={ts.name}
              onClick={() => setSelectedScale(i)}
              className={`p-3 rounded-lg border text-left transition ${
                selectedScale === i
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{ts.name}</div>
              <div className="text-xs text-gray-500 mt-1">Ratio: {ts.h2 / ts.h3 > 0 ? '1.25' : '1'}</div>
            </button>
          ))}
        </div>

        {/* Scale preview */}
        <div className="p-6 bg-gray-50 rounded-lg space-y-3">
          <div style={{ fontFamily: headingFont, fontSize: `${scale.h1}rem`, fontWeight: 700 }}>
            H1 — {scale.h1.toFixed(3)}rem
          </div>
          <div style={{ fontFamily: headingFont, fontSize: `${scale.h2}rem`, fontWeight: 600 }}>
            H2 — {scale.h2.toFixed(3)}rem
          </div>
          <div style={{ fontFamily: headingFont, fontSize: `${scale.h3}rem`, fontWeight: 600 }}>
            H3 — {scale.h3.toFixed(3)}rem
          </div>
          <div style={{ fontFamily: bodyFont, fontSize: `${scale.body}rem` }}>
            Body — {scale.body.toFixed(3)}rem
          </div>
          <div style={{ fontFamily: bodyFont, fontSize: `${scale.small}rem`, color: '#666' }}>
            Small — {scale.small.toFixed(3)}rem
          </div>
        </div>
      </div>

      {/* Cyrillic preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Cyrillic Preview</h2>
        {(!headingCyrillic || !bodyCyrillic) && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            ⚠️ Some selected fonts don&apos;t support Cyrillic characters. Consider choosing fonts marked with ✓ Cyrillic.
          </div>
        )}
        <div className="space-y-4">
          {CYRILLIC_SAMPLES.map((sample) => (
            <div key={sample.label} className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-2">{sample.label}</div>
              <div
                style={{ fontFamily: headingFont, fontSize: '1.5rem', fontWeight: 700 }}
                className="mb-2"
              >
                {sample.text}
              </div>
              <div style={{ fontFamily: bodyFont, fontSize: '1rem', lineHeight: 1.6 }}>
                {sample.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export CSS */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Export CSS</h2>
        <pre className="p-4 bg-gray-900 text-green-400 rounded-lg text-sm overflow-x-auto">
{`:root {
  --font-heading: '${headingFont}', sans-serif;
  --font-body: '${bodyFont}', sans-serif;
  --font-size-base: ${bodySize}px;
  --font-weight-heading: ${headingWeight};
  --line-height-body: 1.6;
  
  /* Type Scale: ${TYPE_SCALES[selectedScale].name} */
  --text-h1: ${scale.h1.toFixed(3)}rem;
  --text-h2: ${scale.h2.toFixed(3)}rem;
  --text-h3: ${scale.h3.toFixed(3)}rem;
  --text-body: ${scale.body.toFixed(3)}rem;
  --text-small: ${scale.small.toFixed(3)}rem;
}`}
        </pre>
        <button
          onClick={() => {
            const css = `:root {\n  --font-heading: '${headingFont}', sans-serif;\n  --font-body: '${bodyFont}', sans-serif;\n  --font-size-base: ${bodySize}px;\n  --font-weight-heading: ${headingWeight};\n}`;
            navigator.clipboard.writeText(css).catch(() => {});
          }}
          className="mt-3 text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          📋 Copy CSS Variables
        </button>
      </div>
    </div>
  );
}
