import type { Font } from 'opentype.js';
import type { Weight } from './types';

export interface LogoFont {
  id: string;
  name: string;
  /** file prefix in /public/fonts */
  file: string;
  kind: 'sans' | 'serif' | 'display' | 'condensed';
  /** has Cyrillic Extended, i.e. the Mongolian letters Ү and Ө */
  mongolian: boolean;
  cyrillic: boolean;
  weights: Weight[];
}

export const LOGO_FONTS: LogoFont[] = [
  { id: 'inter', name: 'Inter', file: 'inter', kind: 'sans', mongolian: true, cyrillic: true, weights: [400, 700] },
  { id: 'montserrat', name: 'Montserrat', file: 'montserrat', kind: 'sans', mongolian: true, cyrillic: true, weights: [400, 700] },
  { id: 'manrope', name: 'Manrope', file: 'manrope', kind: 'sans', mongolian: true, cyrillic: true, weights: [400, 700] },
  { id: 'raleway', name: 'Raleway', file: 'raleway', kind: 'sans', mongolian: true, cyrillic: true, weights: [400, 700] },
  { id: 'unbounded', name: 'Unbounded', file: 'unbounded', kind: 'display', mongolian: true, cyrillic: true, weights: [400, 700] },
  { id: 'oswald', name: 'Oswald', file: 'oswald', kind: 'condensed', mongolian: true, cyrillic: true, weights: [400, 700] },
  { id: 'lora', name: 'Lora', file: 'lora', kind: 'serif', mongolian: true, cyrillic: true, weights: [400, 700] },
  { id: 'playfair', name: 'Playfair Display', file: 'playfair-display', kind: 'serif', mongolian: false, cyrillic: true, weights: [400, 700] },
  { id: 'space-grotesk', name: 'Space Grotesk', file: 'space-grotesk', kind: 'sans', mongolian: false, cyrillic: false, weights: [400, 700] },
  { id: 'dm-serif', name: 'DM Serif Display', file: 'dm-serif-display', kind: 'serif', mongolian: false, cyrillic: false, weights: [400] },
];

export function getFont(id: string): LogoFont {
  return LOGO_FONTS.find((f) => f.id === id) || LOGO_FONTS[0];
}

const SUBSETS = ['latin', 'cyrillic', 'cyrillic-ext'] as const;
const cache = new Map<string, Promise<Font | null>>();
let otPromise: Promise<typeof import('opentype.js')> | null = null;

function loadOpentype() {
  if (!otPromise) otPromise = import('opentype.js');
  return otPromise;
}

function loadFile(name: string): Promise<Font | null> {
  let p = cache.get(name);
  if (!p) {
    p = (async () => {
      try {
        const res = await fetch(`/fonts/${name}-normal.woff`);
        if (!res.ok) return null;
        const buf = await res.arrayBuffer();
        const ot = await loadOpentype();
        return (ot.parse ?? (ot as any).default.parse)(buf);
      } catch {
        return null;
      }
    })();
    cache.set(name, p);
  }
  return p;
}

/** All subsets of one font family at one weight, in glyph-lookup order. */
export async function loadFontStack(fontId: string, weight: Weight): Promise<Font[]> {
  const f = getFont(fontId);
  const w = f.weights.includes(weight) ? weight : f.weights[f.weights.length - 1];
  const loaded = await Promise.all(SUBSETS.map((s) => loadFile(`${f.file}-${s}-${w}`)));
  return loaded.filter((x): x is Font => !!x);
}

const num = (n: number) => String(Math.round(n * 100) / 100);

/** Own serializer: opentype.js toPathData can emit NaN for large offsets. */
function pathData(commands: any[]): string {
  let d = '';
  for (const c of commands) {
    switch (c.type) {
      case 'M':
      case 'L':
        d += `${c.type}${num(c.x)} ${num(c.y)}`;
        break;
      case 'Q':
        d += `Q${num(c.x1)} ${num(c.y1)} ${num(c.x)} ${num(c.y)}`;
        break;
      case 'C':
        d += `C${num(c.x1)} ${num(c.y1)} ${num(c.x2)} ${num(c.y2)} ${num(c.x)} ${num(c.y)}`;
        break;
      case 'Z':
        d += 'Z';
        break;
    }
  }
  return d;
}

export interface TextPath {
  d: string;
  width: number;
  /** cap height in px at the requested size */
  capHeight: number;
  /** characters that no loaded font could draw */
  missing: string[];
}

/**
 * Outline `text` into one SVG path. Origin is the left end of the baseline.
 * Each character uses the first subset of the family that has its glyph.
 */
export function textToPath(
  stack: Font[],
  text: string,
  size: number,
  trackingEm: number
): TextPath {
  const missing: string[] = [];
  if (stack.length === 0) return { d: '', width: 0, capHeight: size * 0.7, missing: [text] };
  const primary = stack[0];
  const capUnits = (primary.tables as any)?.os2?.sCapHeight || primary.unitsPerEm * 0.7;
  const capHeight = (capUnits / primary.unitsPerEm) * size;

  let x = 0;
  const parts: string[] = [];
  let prevFont: Font | null = null;
  let prevGlyph: any = null;
  for (const ch of Array.from(text)) {
    const font = stack.find((f) => f.charToGlyphIndex(ch) > 0);
    if (!font) {
      if (ch.trim()) missing.push(ch);
      x += size * 0.3 + trackingEm * size;
      prevFont = null;
      continue;
    }
    const glyph = font.charToGlyph(ch);
    const scale = size / font.unitsPerEm;
    if (prevFont === font && prevGlyph) {
      try {
        x += font.getKerningValue(prevGlyph, glyph) * scale;
      } catch {
        /* no kerning table */
      }
    }
    const d = pathData(glyph.getPath(x, 0, size).commands);
    if (d) parts.push(d);
    x += (glyph.advanceWidth || 0) * scale + trackingEm * size;
    prevFont = font;
    prevGlyph = glyph;
  }
  // drop the trailing tracking so centered text is truly centered
  const width = Math.max(0, x - trackingEm * size);
  return { d: parts.join(' '), width, capHeight, missing };
}
