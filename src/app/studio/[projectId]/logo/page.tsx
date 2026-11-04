'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useBrandStore } from '@/store';
import type { LogoVariant } from '@/types';

type LogoStyle = 'wordmark' | 'monogram' | 'symbol' | 'combination';

interface LogoEditState {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  letterSpacing: number;
  fillColor: string;
  iconSymbol?: string;
  layout: 'horizontal' | 'stacked';
}

const FONTS = [
  { name: 'Inter', weight: ['400', '500', '600', '700', '800', '900'] },
  { name: 'Georgia', weight: ['400', '700'] },
  { name: 'Courier New', weight: ['400', '700'] },
  { name: 'Arial', weight: ['400', '700'] },
  { name: 'Verdana', weight: ['400', '700'] },
  { name: 'Times New Roman', weight: ['400', '700'] },
];

const ICONS = ['◆', '●', '▲', '■', '★', '✦', '⬟', '◉'];

function logoId(): string {
  return `logo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function generateWordmarkSVG(edit: LogoEditState): string {
  const { text, fontFamily, fontSize, fontWeight, letterSpacing, fillColor } = edit;
  return `<svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
  <text x="200" y="65" text-anchor="middle" font-family="${fontFamily}, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" letter-spacing="${letterSpacing}" fill="${fillColor}">${text}</text>
</svg>`;
}

function generateMonogramSVG(edit: LogoEditState): string {
  const initials = edit.text
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const { fontFamily, fontSize, fontWeight, fillColor } = edit;
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="90" fill="none" stroke="${fillColor}" stroke-width="3"/>
  <text x="100" y="120" text-anchor="middle" font-family="${fontFamily}, sans-serif" font-size="${fontSize * 1.5}" font-weight="${fontWeight}" fill="${fillColor}">${initials}</text>
</svg>`;
}

function generateSymbolSVG(edit: LogoEditState): string {
  const icon = edit.iconSymbol || '◆';
  const { fillColor, fontSize } = edit;
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <text x="100" y="130" text-anchor="middle" font-size="${fontSize * 2}" fill="${fillColor}">${icon}</text>
</svg>`;
}

function generateCombinationSVG(edit: LogoEditState): string {
  const { text, fontFamily, fontSize, fontWeight, letterSpacing, fillColor, iconSymbol, layout } = edit;
  const icon = iconSymbol || '◆';

  if (layout === 'stacked') {
    return `<svg viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg">
  <text x="150" y="100" text-anchor="middle" font-size="${fontSize * 1.8}" fill="${fillColor}">${icon}</text>
  <text x="150" y="180" text-anchor="middle" font-family="${fontFamily}, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" letter-spacing="${letterSpacing}" fill="${fillColor}">${text}</text>
</svg>`;
  }

  return `<svg viewBox="0 0 500 120" xmlns="http://www.w3.org/2000/svg">
  <text x="60" y="80" text-anchor="middle" font-size="${fontSize * 1.8}" fill="${fillColor}">${icon}</text>
  <text x="300" y="80" text-anchor="middle" font-family="${fontFamily}, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" letter-spacing="${letterSpacing}" fill="${fillColor}">${text}</text>
</svg>`;
}

function generateSVG(style: LogoStyle, edit: LogoEditState): string {
  switch (style) {
    case 'wordmark': return generateWordmarkSVG(edit);
    case 'monogram': return generateMonogramSVG(edit);
    case 'symbol': return generateSymbolSVG(edit);
    case 'combination': return generateCombinationSVG(edit);
  }
}

export default function LogoPage() {
  const { currentProject, setLogos } = useBrandStore();
  const primaryColor = currentProject?.palette?.find((s) => s.role === 'primary')?.hex || '#2C2C2C';
  const brandName = currentProject?.brief?.brandName || 'Brand';

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editStyle, setEditStyle] = useState<LogoStyle>('wordmark');
  const [edit, setEdit] = useState<LogoEditState>({
    text: brandName,
    fontFamily: 'Inter',
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 0,
    fillColor: primaryColor,
    iconSymbol: '◆',
    layout: 'horizontal',
  });
  const [logos, setLocalLogos] = useState<LogoVariant[]>(currentProject?.logos || []);
  const svgRef = useRef<HTMLDivElement>(null);

  // Initialize with template variants if empty
  useEffect(() => {
    if (logos.length === 0 && currentProject) {
      const styles: LogoStyle[] = ['wordmark', 'monogram', 'combination'];
      const initial = styles.map((style, i) => {
        const templateEdit = { ...edit, fillColor: primaryColor, text: brandName };
        return {
          id: logoId(),
          name: `${style.charAt(0).toUpperCase() + style.slice(1)} ${i + 1}`,
          svg: generateSVG(style, templateEdit),
          isPrimary: i === 0,
        };
      });
      setLocalLogos(initial);
      setLogos(initial);
      if (initial.length > 0) setSelectedId(initial[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentSVG = generateSVG(editStyle, edit);

  const saveVariant = () => {
    const newLogo: LogoVariant = {
      id: logoId(),
      name: `${editStyle.charAt(0).toUpperCase() + editStyle.slice(1)}`,
      svg: currentSVG,
      isPrimary: false,
    };
    const next = [...logos, newLogo];
    setLocalLogos(next);
    setLogos(next);
    setSelectedId(newLogo.id);
  };

  const setPrimary = (id: string) => {
    const next = logos.map((l) => ({ ...l, isPrimary: l.id === id }));
    setLocalLogos(next);
    setLogos(next);
  };

  const deleteLogo = (id: string) => {
    if (logos.length <= 1) return;
    const wasPrimary = logos.find((l) => l.id === id)?.isPrimary;
    const next = logos.filter((l) => l.id !== id);
    if (wasPrimary && next.length > 0) next[0].isPrimary = true;
    setLocalLogos(next);
    setLogos(next);
    if (selectedId === id) setSelectedId(next[0]?.id || null);
  };

  const exportSVG = () => {
    const blob = new Blob([currentSVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${edit.text || 'logo'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPNG = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    const svgBlob = new Blob([currentSVG], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${edit.text || 'logo'}.png`;
      a.click();
    };
    img.src = url;
  };

  if (!currentProject) {
    return <div className="text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Logo Editor</h1>
        <p className="text-gray-600">Create and edit SVG-based logo compositions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Preview</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportSVG}
                  className="text-sm px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50"
                >
                  Export SVG
                </button>
                <button
                  onClick={exportPNG}
                  className="text-sm px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50"
                >
                  Export PNG
                </button>
              </div>
            </div>

            {/* Checkerboard background */}
            <div
              className="w-full rounded-lg flex items-center justify-center min-h-[200px] p-8"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              }}
            >
              <div
                ref={svgRef}
                className="max-w-full"
                dangerouslySetInnerHTML={{ __html: currentSVG }}
              />
            </div>
          </div>

          {/* Saved variants */}
          {logos.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Saved Variants</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {logos.map((logo) => (
                  <div
                    key={logo.id}
                    className={`relative rounded-lg border-2 p-4 cursor-pointer transition ${
                      selectedId === logo.id
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedId(logo.id)}
                  >
                    {logo.isPrimary && (
                      <span className="absolute top-2 right-2 text-xs px-2 py-0.5 bg-brand-600 text-white rounded-full">
                        Primary
                      </span>
                    )}
                    <div
                      className="w-full h-16 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: logo.svg }}
                    />
                    <div className="text-xs text-gray-500 mt-2 text-center">{logo.name}</div>
                    <div className="flex gap-1 mt-2">
                      {!logo.isPrimary && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setPrimary(logo.id); }}
                          className="flex-1 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                        >
                          Set Primary
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteLogo(logo.id); }}
                        className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Style selector */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold mb-3">Style</h3>
            <div className="grid grid-cols-2 gap-2">
              {(['wordmark', 'monogram', 'symbol', 'combination'] as LogoStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => setEditStyle(style)}
                  className={`text-xs px-3 py-2 rounded-lg border font-medium capitalize transition ${
                    editStyle === style
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Text */}
          {(editStyle === 'wordmark' || editStyle === 'combination') && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold mb-3">Text</h3>
              <input
                type="text"
                value={edit.text}
                onChange={(e) => setEdit({ ...edit, text: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-brand-600 outline-none"
                placeholder="Brand name"
              />
            </div>
          )}

          {/* Font */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold mb-3">Typography</h3>
            <select
              value={edit.fontFamily}
              onChange={(e) => setEdit({ ...edit, fontFamily: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm mb-3"
            >
              {FONTS.map((f) => (
                <option key={f.name} value={f.name} style={{ fontFamily: f.name }}>
                  {f.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">Size</label>
                <input
                  type="number"
                  min={12}
                  max={72}
                  value={edit.fontSize}
                  onChange={(e) => setEdit({ ...edit, fontSize: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 rounded-md border border-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Weight</label>
                <select
                  value={edit.fontWeight}
                  onChange={(e) => setEdit({ ...edit, fontWeight: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-md border border-gray-300 text-sm"
                >
                  <option value="400">Regular</option>
                  <option value="500">Medium</option>
                  <option value="600">Semibold</option>
                  <option value="700">Bold</option>
                  <option value="800">Extra Bold</option>
                  <option value="900">Black</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-gray-500">Letter Spacing: {edit.letterSpacing}</label>
              <input
                type="range"
                min={-5}
                max={20}
                value={edit.letterSpacing}
                onChange={(e) => setEdit({ ...edit, letterSpacing: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>

          {/* Color */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold mb-3">Color</h3>
            <div className="flex gap-2">
              <input
                type="color"
                value={edit.fillColor}
                onChange={(e) => setEdit({ ...edit, fillColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={edit.fillColor}
                onChange={(e) => setEdit({ ...edit, fillColor: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm font-mono"
              />
            </div>
            {/* Quick palette colors */}
            {currentProject.palette.length > 0 && (
              <div className="flex gap-1 mt-2">
                {currentProject.palette.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setEdit({ ...edit, fillColor: s.hex })}
                    className="w-6 h-6 rounded-md border border-gray-200 hover:scale-110 transition"
                    style={{ backgroundColor: s.hex }}
                    title={s.hex}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Icon (for symbol/combination) */}
          {(editStyle === 'symbol' || editStyle === 'combination') && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold mb-3">Icon</h3>
              <div className="grid grid-cols-4 gap-2">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setEdit({ ...edit, iconSymbol: icon })}
                    className={`text-xl p-2 rounded-lg border transition ${
                      edit.iconSymbol === icon
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              {editStyle === 'combination' && (
                <div className="mt-3">
                  <label className="text-xs text-gray-500 mb-1 block">Layout</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setEdit({ ...edit, layout: 'horizontal' })}
                      className={`text-xs px-3 py-2 rounded-lg border ${
                        edit.layout === 'horizontal' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200'
                      }`}
                    >
                      Horizontal
                    </button>
                    <button
                      onClick={() => setEdit({ ...edit, layout: 'stacked' })}
                      className={`text-xs px-3 py-2 rounded-lg border ${
                        edit.layout === 'stacked' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200'
                      }`}
                    >
                      Stacked
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Save */}
          <button
            onClick={saveVariant}
            className="w-full py-3 rounded-xl bg-gray-900 text-white hover:bg-gray-800 font-medium transition"
          >
            Save Variant
          </button>
        </div>
      </div>
    </div>
  );
}
