'use client';

import { useState, useCallback } from 'react';
import { useBrandStore } from '@/store';
import type { ColorSwatch } from '@/types';
import ColorPicker from '@/components/ColorPicker';
import {
  generatePaletteFromBase,
  randomHex,
  contrastRatio,
  wcagLevel,
  isValidHex,
  normalizeHex,
  hexToHsl,
  hslToHex,
  textColorForBg,
} from '@/lib/color';

type HarmonyMode = 'random' | 'monochromatic' | 'complementary' | 'analogous' | 'triadic';
type ColorRole = ColorSwatch['role'];

const ROLES: ColorRole[] = ['primary', 'secondary', 'accent', 'background', 'text'];

function swatchId(): string {
  return `sw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function ColorsPage() {
  const { currentProject, setPalette } = useBrandStore();
  const [palette, setLocalPalette] = useState<ColorSwatch[]>(
    currentProject?.palette?.length
      ? currentProject.palette
      : generatePaletteFromBase('#0EA5E9').map((hex, i) => ({
          id: swatchId(),
          hex,
          role: ROLES[i] || 'accent',
          locked: false,
        }))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>('random');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [history, setHistory] = useState<ColorSwatch[][]>([]);

  const pushHistory = useCallback(
    (prev: ColorSwatch[]) => {
      setHistory((h) => [...h.slice(-19), prev]);
    },
    []
  );

  const updatePalette = useCallback(
    (next: ColorSwatch[]) => {
      setLocalPalette(next);
      if (currentProject) {
        setPalette(next);
      }
    },
    [currentProject, setPalette]
  );

  const handleGenerate = () => {
    pushHistory(palette);
    const locked = palette.filter((s) => s.locked);
    const unlockedCount = Math.max(palette.length - locked.length, palette.length);
    const base = locked[0]?.hex || randomHex();

    let newColors: string[];
    switch (harmonyMode) {
      case 'monochromatic': {
        const hsl = hexToHsl(base);
        if (!hsl) { newColors = Array.from({ length: unlockedCount }, randomHex); break; }
        newColors = Array.from({ length: unlockedCount }, (_, i) =>
          hslToHex(hsl.h, Math.max(20, Math.min(90, hsl.s + (i * 15 - 30))), Math.max(15, Math.min(90, 25 + i * 15)))
        );
        break;
      }
      case 'complementary': {
        const hsl = hexToHsl(base);
        if (!hsl) { newColors = Array.from({ length: unlockedCount }, randomHex); break; }
        const comp = hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l);
        newColors = [base, comp, ...Array.from({ length: Math.max(0, unlockedCount - 2) }, randomHex)];
        break;
      }
      case 'analogous': {
        const hsl = hexToHsl(base);
        if (!hsl) { newColors = Array.from({ length: unlockedCount }, randomHex); break; }
        newColors = Array.from({ length: unlockedCount }, (_, i) =>
          hslToHex((hsl.h + (i - Math.floor(unlockedCount / 2)) * 30 + 360) % 360, hsl.s, hsl.l)
        );
        break;
      }
      case 'triadic': {
        const hsl = hexToHsl(base);
        if (!hsl) { newColors = Array.from({ length: unlockedCount }, randomHex); break; }
        const t1 = hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l);
        const t2 = hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l);
        newColors = [base, t1, t2, ...Array.from({ length: Math.max(0, unlockedCount - 3) }, randomHex)];
        break;
      }
      default:
        newColors = Array.from({ length: unlockedCount }, randomHex);
    }

    let unlockedIdx = 0;
    const next = palette.map((s) => {
      if (s.locked) return s;
      const newHex = newColors[unlockedIdx % newColors.length] || randomHex();
      unlockedIdx++;
      return { ...s, hex: newHex };
    });

    // If palette is empty, create new swatches
    if (next.length === 0) {
      for (let i = 0; i < 5; i++) {
        next.push({
          id: swatchId(),
          hex: newColors[i] || randomHex(),
          role: ROLES[i] || 'accent',
          locked: false,
        });
      }
    }

    updatePalette(next);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    updatePalette(prev);
  };

  const toggleLock = (id: string) => {
    pushHistory(palette);
    updatePalette(palette.map((s) => (s.id === id ? { ...s, locked: !s.locked } : s)));
  };

  const removeSwatch = (id: string) => {
    if (palette.length <= 3) return;
    pushHistory(palette);
    updatePalette(palette.filter((s) => s.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const addSwatch = () => {
    if (palette.length >= 8) return;
    pushHistory(palette);
    updatePalette([
      ...palette,
      { id: swatchId(), hex: randomHex(), role: 'accent', locked: false },
    ]);
  };

  const setRole = (id: string, role: ColorRole) => {
    pushHistory(palette);
    updatePalette(palette.map((s) => (s.id === id ? { ...s, role } : s)));
  };

  const updateSwatchHex = (id: string, hex: string) => {
    const normalized = normalizeHex(hex);
    if (!normalized || !isValidHex(normalized)) return;
    pushHistory(palette);
    updatePalette(palette.map((s) => (s.id === id ? { ...s, hex: normalized } : s)));
  };

  const copyHex = async (id: string, hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Clipboard API not available
    }
  };

  const exportCSS = () => {
    const vars = palette
      .map((s) => `  --brand-${s.role}: ${s.hex};`)
      .join('\n');
    const css = `:root {\n${vars}\n}`;
    navigator.clipboard.writeText(css).catch(() => {});
  };

  const exportJSON = () => {
    const json = JSON.stringify(
      palette.map(({ hex, role }) => ({ hex, role })),
      null,
      2
    );
    navigator.clipboard.writeText(json).catch(() => {});
  };

  if (!currentProject) {
    return <div className="text-gray-500">Loading...</div>;
  }

  // Contrast checks: text swatch vs background swatch
  const bgSwatch = palette.find((s) => s.role === 'background');
  const textSwatch = palette.find((s) => s.role === 'text');
  const primarySwatch = palette.find((s) => s.role === 'primary');

  const bgHex = bgSwatch?.hex || '#FFFFFF';
  const contrastTargets = [
    { label: 'Text on Background', fg: textSwatch?.hex || '#000000', bg: bgHex },
    { label: 'Primary on Background', fg: primarySwatch?.hex || '#000000', bg: bgHex },
    { label: 'Primary on White', fg: primarySwatch?.hex || '#000000', bg: '#FFFFFF' },
  ].filter((t) => isValidHex(t.fg) && isValidHex(t.bg));

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Color Studio</h1>
          <p className="text-gray-600">Generate, lock, and refine your brand palette</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Harmony mode */}
          <select
            value={harmonyMode}
            onChange={(e) => setHarmonyMode(e.target.value as HarmonyMode)}
            className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white"
          >
            <option value="random">Random</option>
            <option value="monochromatic">Monochromatic</option>
            <option value="complementary">Complementary</option>
            <option value="analogous">Analogous</option>
            <option value="triadic">Triadic</option>
          </select>
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="text-sm px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Undo"
          >
            ↩ Undo
          </button>
          <button
            onClick={handleGenerate}
            className="text-sm px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 font-medium"
          >
            🎲 Generate
          </button>
        </div>
      </div>

      {/* Palette strip — Coolors-style full-width swatches */}
      <div className="flex rounded-2xl overflow-hidden shadow-lg mb-6 h-64">
        {palette.map((swatch) => (
          <div
            key={swatch.id}
            className="relative flex-1 flex flex-col items-center justify-end pb-4 transition-all group"
            style={{ backgroundColor: swatch.hex }}
          >
            {/* Top actions (visible on hover) */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => toggleLock(swatch.id)}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-sm shadow-sm"
                title={swatch.locked ? 'Unlock' : 'Lock'}
              >
                {swatch.locked ? '🔒' : '🔓'}
              </button>
              <button
                onClick={() => setEditingId(editingId === swatch.id ? null : swatch.id)}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-sm shadow-sm"
                title="Edit color"
              >
                ✏️
              </button>
              <button
                onClick={() => copyHex(swatch.id, swatch.hex)}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-sm shadow-sm"
                title="Copy HEX"
              >
                {copiedId === swatch.id ? '✓' : '📋'}
              </button>
              {palette.length > 3 && (
                <button
                  onClick={() => removeSwatch(swatch.id)}
                  className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-sm shadow-sm"
                  title="Remove"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Role badge */}
            <select
              value={swatch.role}
              onChange={(e) => setRole(swatch.id, e.target.value as ColorRole)}
              className="mb-2 text-xs font-medium px-2 py-1 rounded-full bg-white/80 hover:bg-white/100 border-0 cursor-pointer capitalize"
              style={{ color: textColorForBg(swatch.hex) }}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* HEX label */}
            <button
              onClick={() => copyHex(swatch.id, swatch.hex)}
              className="font-mono text-sm font-semibold tracking-wider"
              style={{ color: textColorForBg(swatch.hex) }}
            >
              {swatch.hex}
            </button>

            {/* Lock indicator */}
            {swatch.locked && (
              <div
                className="absolute top-3 right-3 text-sm opacity-60"
                style={{ color: textColorForBg(swatch.hex) }}
              >
                🔒
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add swatch button */}
      {palette.length < 8 && (
        <button
          onClick={addSwatch}
          className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 text-sm font-medium mb-8 transition"
        >
          + Add Swatch ({palette.length}/8)
        </button>
      )}

      {/* Edit panel */}
      {editingId && (() => {
        const swatch = palette.find((s) => s.id === editingId);
        if (!swatch) return null;
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Color</h2>
              <button
                onClick={() => setEditingId(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Visual color picker */}
              <div>
                <ColorPicker
                  color={swatch.hex}
                  onChange={(hex) => updateSwatchHex(swatch.id, hex)}
                />
              </div>

              {/* Role & info */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-2 block">Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLES.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRole(swatch.id, r)}
                        className={`text-xs px-3 py-2 rounded-lg border font-medium capitalize transition ${
                          swatch.role === r
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-2 block">Quick Colors</label>
                  <div className="flex flex-wrap gap-2">
                    {palette.filter((s) => s.id !== swatch.id).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => updateSwatchHex(swatch.id, s.hex)}
                        className="w-8 h-8 rounded-lg border border-gray-200 hover:scale-110 transition"
                        style={{ backgroundColor: s.hex }}
                        title={s.hex}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Contrast with white</div>
                  <div className="text-sm font-mono font-semibold">
                    {contrastRatio(swatch.hex, '#FFFFFF').toFixed(2)}:1
                    {wcagLevel(contrastRatio(swatch.hex, '#FFFFFF')).aa && (
                      <span className="ml-2 text-xs text-green-600">AA ✓</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-2 mb-1">Contrast with black</div>
                  <div className="text-sm font-mono font-semibold">
                    {contrastRatio(swatch.hex, '#000000').toFixed(2)}:1
                    {wcagLevel(contrastRatio(swatch.hex, '#000000')).aa && (
                      <span className="ml-2 text-xs text-green-600">AA ✓</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* WCAG Contrast checks */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Contrast Ratios (WCAG)</h2>
        {contrastTargets.length > 0 ? (
          <div className="space-y-3">
            {contrastTargets.map((ct) => {
              const ratio = contrastRatio(ct.fg, ct.bg);
              const level = wcagLevel(ratio);
              return (
                <div key={ct.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: ct.bg, color: ct.fg }}
                    >
                      Aa
                    </div>
                    <div>
                      <div className="text-sm font-medium">{ct.label}</div>
                      <div className="text-xs text-gray-500 font-mono">
                        {ct.fg} on {ct.bg}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-semibold">{ratio.toFixed(2)}:1</span>
                    <div className="flex gap-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          level.aaLarge ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        AA{level.aaLarge && !level.aa ? ' Large' : ''}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          level.aaa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        AAA
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Assign text/background roles to see contrast checks.</p>
        )}
      </div>

      {/* Export */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Export</h2>
        <div className="flex gap-3">
          <button
            onClick={exportCSS}
            className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium transition"
          >
            📋 Copy CSS Variables
          </button>
          <button
            onClick={exportJSON}
            className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium transition"
          >
            📋 Copy JSON
          </button>
        </div>
      </div>
    </div>
  );
}
