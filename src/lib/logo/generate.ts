import { contrastRatio, hexToHsl, hslToHex, isValidHex } from '@/lib/color';
import type { BrandBrief, ColorSwatch } from '@/types';
import { LOGO_FONTS, getFont } from './fonts';
import type {
  Casing,
  ContainerKind,
  LogoDesign,
  LogoLayout,
  MarkKind,
  MarkSpec,
  PartKey,
} from './types';

// ---------------------------------------------------------------------------
// Seeded randomness: the same brief always produces the same first batch, and
// "more options" gives a new one by changing the seed.
// ---------------------------------------------------------------------------
export type Rng = () => number;
export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
const pick = <T,>(rng: Rng, arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

// ---------------------------------------------------------------------------
// Reading the brief
// ---------------------------------------------------------------------------
type Tag = 'nature' | 'tech' | 'food' | 'finance' | 'health' | 'craft' | 'outdoor' | 'creative' | 'generic';

const TAG_WORDS: Record<Exclude<Tag, 'generic'>, RegExp> = {
  nature: /organic|eco|green|farm|garden|flower|plant|tea|herb|natural|botanic|wellness|spa|ногоон|цэцэг|байгаль|ургамал|цай/i,
  tech: /software|saas|app\b|tech|digital|data|ai\b|cloud|cyber|startup|platform|program|it\b|технологи|програм|дижитал|апп/i,
  food: /cafe|coffee|restaurant|bakery|food|kitchen|bar\b|drink|pizza|burger|catering|chef|cook|meal|dine|кофе|ресторан|хоол|нарийн боов|кафе|кейтеринг/i,
  finance: /financ|bank|invest|insur|account|law|legal|consult|capital|loan|санхүү|банк|хөрөнгө|хууль|зөвлөх/i,
  health: /health|medic|clinic|dental|pharma|care|fitness|yoga|therapy|эрүүл|эмнэлэг|эм\b|фитнес/i,
  craft: /furniture|wood|craft|handmade|handcraft|build|construct|interior|studio|workshop|тавилга|мод|гар утас|барилга|дотор/i,
  outdoor: /outdoor|travel|tour|mountain|adventure|camp|hike|sport|trek|аялал|уул|адал|спорт/i,
  creative: /design|art|music|media|photo|film|cinema|movie|camera|fashion|gallery|creative|brand|дизайн|урлаг|хөгжим|загвар|зураг|кино|фильм|камер/i,
};

const TAG_MARKS: Record<Tag, MarkKind[]> = {
  nature: ['petals', 'leaf', 'sun', 'wave', 'orbit'],
  tech: ['orbit', 'cube', 'quad', 'chevrons', 'bars', 'ringcut'],
  food: ['chefhat', 'forkplate', 'sun', 'leaf', 'petals'],
  finance: ['bars', 'chevrons', 'cube', 'quad', 'peak'],
  health: ['petals', 'orbit', 'ringcut', 'leaf', 'wave'],
  craft: ['peak', 'cube', 'quad', 'chevrons', 'leaf'],
  outdoor: ['peak', 'sun', 'wave', 'chevrons', 'orbit'],
  creative: ['camera', 'clapper', 'filmreel', 'quad', 'orbit', 'petals'],
  generic: ['petals', 'orbit', 'bars', 'chevrons', 'cube', 'sun', 'leaf', 'peak', 'ringcut', 'quad', 'wave', 'camera', 'clapper', 'filmreel', 'forkplate', 'chefhat'],
};

const TAG_COLOR: Record<Tag, string> = {
  nature: '#2f7d4f',
  tech: '#2563eb',
  food: '#c2410c',
  finance: '#1e3a8a',
  health: '#0f9d8a',
  craft: '#8a5a2b',
  outdoor: '#0f766e',
  creative: '#7c3aed',
  generic: '#0f172a',
};

export function detectTags(brief: Pick<BrandBrief, 'industry' | 'product' | 'description'>): Tag[] {
  const text = `${brief.industry || ''} ${brief.product || ''} ${brief.description || ''}`;
  const tags = (Object.keys(TAG_WORDS) as Exclude<Tag, 'generic'>[]).filter((t) => TAG_WORDS[t].test(text));
  return tags.length ? tags : ['generic'];
}

interface Traits {
  playful: number;
  formal: number;
  contemporary: number;
  bold: number;
  warm: number;
  premium: number;
}
function traitsOf(brief: BrandBrief): Traits {
  const p = brief.personality;
  const n = (v: number | undefined) => clamp((v ?? 50) / 100, 0, 1);
  return {
    playful: n(p?.seriousVsPlayful),
    formal: n(p?.casualVsFormal),
    contemporary: n(p?.classicVsContemporary),
    bold: n(p?.quietVsBold),
    warm: n(p?.reservedVsWarm),
    premium: n(p?.accessibleVsPremium),
  };
}

// Each font's character on the same axes, used to match the brief.
const FONT_TRAITS: Record<string, Traits> = {
  inter: { playful: 0.35, formal: 0.5, contemporary: 0.85, bold: 0.5, warm: 0.4, premium: 0.4 },
  montserrat: { playful: 0.45, formal: 0.45, contemporary: 0.8, bold: 0.65, warm: 0.5, premium: 0.5 },
  manrope: { playful: 0.55, formal: 0.35, contemporary: 0.85, bold: 0.5, warm: 0.7, premium: 0.4 },
  raleway: { playful: 0.35, formal: 0.65, contemporary: 0.6, bold: 0.3, warm: 0.5, premium: 0.8 },
  unbounded: { playful: 0.8, formal: 0.2, contemporary: 0.95, bold: 0.9, warm: 0.5, premium: 0.3 },
  oswald: { playful: 0.2, formal: 0.55, contemporary: 0.5, bold: 0.9, warm: 0.2, premium: 0.4 },
  lora: { playful: 0.3, formal: 0.7, contemporary: 0.25, bold: 0.35, warm: 0.75, premium: 0.6 },
  playfair: { playful: 0.2, formal: 0.85, contemporary: 0.2, bold: 0.45, warm: 0.5, premium: 0.95 },
  'space-grotesk': { playful: 0.5, formal: 0.3, contemporary: 0.95, bold: 0.6, warm: 0.3, premium: 0.45 },
  'dm-serif': { playful: 0.4, formal: 0.65, contemporary: 0.3, bold: 0.8, warm: 0.65, premium: 0.8 },
};

function fontScore(id: string, t: Traits): number {
  const f = FONT_TRAITS[id];
  if (!f) return 0;
  let d = 0;
  (Object.keys(t) as (keyof Traits)[]).forEach((k) => (d += Math.abs(f[k] - t[k])));
  return 1 - d / 6;
}

function textNeeds(text: string): 'latin' | 'cyrillic' | 'mongolian' {
  if (/[ҮүӨө]/.test(text)) return 'mongolian';
  if (/[Ѐ-ӿ]/.test(text)) return 'cyrillic';
  return 'latin';
}
function fontsFor(text: string): string[] {
  const need = textNeeds(text);
  return LOGO_FONTS.filter((f) => (need === 'mongolian' ? f.mongolian : need === 'cyrillic' ? f.cyrillic : true)).map(
    (f) => f.id
  );
}

// ---------------------------------------------------------------------------
// Colour
// ---------------------------------------------------------------------------
export interface LogoPalette {
  primary: string;
  accent: string;
  text: string;
}

export function paletteFromProject(swatches: ColorSwatch[] | undefined, brief: BrandBrief, tags: Tag[]): LogoPalette {
  const byRole = (r: ColorSwatch['role']) => swatches?.find((s) => s.role === r)?.hex;
  const preferred = brief.preferredColors?.find(isValidHex);
  const primary = byRole('primary') || preferred || TAG_COLOR[tags[0]];
  const hsl = hexToHsl(primary);
  const fallbackAccent = hsl ? hslToHex((hsl.h + 35) % 360, clamp(hsl.s, 45, 85), clamp(hsl.l + 8, 40, 62)) : '#f59e0b';
  const accent = byRole('accent') || byRole('secondary') || fallbackAccent;
  const text = byRole('text') || '#1c1c1e';
  return { primary: ensureContrast(primary), accent, text };
}

/** A logo colour must stay readable on white: darken until it reaches 3:1. */
export function ensureContrast(hex: string, min = 3): string {
  let c = hex;
  for (let i = 0; i < 12 && contrastRatio(c, '#ffffff') < min; i++) {
    const h = hexToHsl(c);
    if (!h) break;
    c = hslToHex(h.h, h.s, Math.max(8, h.l - 5));
  }
  return c;
}

function shiftHue(hex: string, deg: number): string {
  const h = hexToHsl(hex);
  return h ? hslToHex((h.h + deg + 360) % 360, h.s, h.l) : hex;
}
function adjustHsl(hex: string, dh: number, ds: number, dl: number): string {
  const h = hexToHsl(hex);
  return h ? hslToHex((h.h + dh + 360) % 360, clamp(h.s + ds, 0, 100), clamp(h.l + dl, 6, 92)) : hex;
}

// ---------------------------------------------------------------------------
// Building designs
// ---------------------------------------------------------------------------
export interface GenContext {
  brief: BrandBrief;
  palette: LogoPalette;
  tags: Tag[];
  traits: Traits;
  name: string;
  tagline: string;
}

export function makeContext(brief: BrandBrief, swatches?: ColorSwatch[]): GenContext {
  const tags = detectTags(brief);
  return {
    brief,
    palette: paletteFromProject(swatches, brief, tags),
    tags,
    traits: traitsOf(brief),
    name: brief.brandName || 'Brand',
    tagline: brief.tagline || '',
  };
}

function markParams(kind: MarkKind, rng: Rng, ctx: GenContext): Partial<MarkSpec> {
  const roundBias = clamp(0.25 + ctx.traits.playful * 0.45 + ctx.traits.warm * 0.3 - ctx.traits.formal * 0.25, 0, 1);
  const rounding = clamp(roundBias + (rng() - 0.5) * 0.3, 0, 1);
  const base: Partial<MarkSpec> = {
    rounding,
    rotation: 0,
    thickness: 0.85 + rng() * 0.5 + ctx.traits.bold * 0.25,
    style: rng() < 0.14 ? 'outline' : 'solid',
    count: 4,
  };
  switch (kind) {
    case 'petals':
      return { ...base, count: pick(rng, [4, 5, 6, 6, 8]), rotation: pick(rng, [0, 0, 15, 30]) };
    case 'orbit':
      return { ...base, count: pick(rng, [2, 3, 3]), rotation: pick(rng, [0, 40, 100, 200]) };
    case 'bars':
      return { ...base, count: pick(rng, [3, 4, 5, 5]), rotation: pick(rng, [0, 0, 60]) };
    case 'chevrons':
      return { ...base, count: pick(rng, [2, 3, 3]), rotation: pick(rng, [0, 0, 90, 180]) };
    case 'cube':
      return { ...base, count: 3, rotation: pick(rng, [0, 0, 60]) };
    case 'sun':
      return { ...base, count: pick(rng, [8, 10, 12, 12, 16]), rotation: pick(rng, [0, 15]) };
    case 'leaf':
      return { ...base, count: pick(rng, [1, 2, 2]), rotation: pick(rng, [20, 30, 40, 0]) };
    case 'peak':
      return { ...base, count: 2, style: 'solid' };
    case 'ringcut':
      return { ...base, count: 1, rotation: pick(rng, [0, 45, 90, 135, 200, 300]) };
    case 'quad':
      return { ...base, count: Math.floor(rng() * 6), rotation: 0 };
    case 'wave':
      return { ...base, count: pick(rng, [2, 3, 3]), rotation: pick(rng, [0, 0, -12]) };
    case 'monogram':
      return { ...base, count: 1, style: 'solid' };
    default:
      return base;
  }
}

function pickCasing(rng: Rng, t: Traits): Casing {
  const upper = t.formal * 0.5 + t.premium * 0.45 + (1 - t.playful) * 0.3 + rng() * 0.25;
  const lower = t.playful * 0.5 + (1 - t.formal) * 0.45 + t.warm * 0.15 + rng() * 0.25;
  if (upper > 0.82) return 'upper';
  if (lower > 0.85) return 'lower';
  return 'title';
}

function pickFont(rng: Rng, ctx: GenContext, avoid: string[] = [], text = ctx.name): string {
  const pool = fontsFor(text);
  const scored = pool
    .filter((id) => !avoid.includes(id))
    .map((id) => ({ id, s: fontScore(id, ctx.traits) + rng() * 0.22 }))
    .sort((a, b) => b.s - a.s);
  return (scored[0] || { id: pool[0] || 'inter' }).id;
}

function trackingFor(casing: Casing, fontId: string, t: Traits, rng: Rng): number {
  if (casing === 'upper') return Math.round(70 + t.premium * 140 + rng() * 40);
  if (fontId === 'unbounded') return Math.round(-10 + rng() * 20);
  return Math.round(-8 + rng() * 34);
}

function buildDesign(
  rng: Rng,
  ctx: GenContext,
  o: {
    layout: LogoLayout;
    kind: MarkKind;
    container?: ContainerKind;
    fontAvoid?: string[];
    colorMode?: 'primary' | 'accent-main' | 'dual';
    concept?: string;
  }
): LogoDesign {
  const { palette } = ctx;
  const fontId = pickFont(rng, ctx, o.fontAvoid || []);
  const font = getFont(fontId);
  const casing = pickCasing(rng, ctx.traits);
  const weights = font.weights;
  const weight = weights.length === 1 ? weights[0] : ctx.traits.bold > 0.45 || rng() < 0.45 ? 700 : 400;
  const mode = o.colorMode || 'primary';
  const main = mode === 'accent-main' ? ensureContrast(palette.accent) : palette.primary;
  const accent = mode === 'accent-main' ? palette.primary : palette.accent;
  const markParamsPart = markParams(o.kind, rng, ctx);
  const wordColor = mode === 'dual' ? palette.text : rng() < 0.55 ? main : palette.text;

  const mark: MarkSpec = {
    kind: o.kind,
    container: o.container || 'none',
    count: 4,
    rotation: 0,
    rounding: 0.4,
    style: 'solid',
    thickness: 1,
    scale: o.layout === 'stacked' ? 1.05 : 1,
    color: main,
    accent: mode === 'primary' && rng() < 0.4 ? main : accent,
    ...markParamsPart,
  };
  return {
    version: 1,
    concept:
      o.concept ||
      `${o.kind === 'none' ? 'Wordmark' : o.kind[0].toUpperCase() + o.kind.slice(1)} · ${font.name}`,
    layout: o.layout,
    gap: o.layout === 'stacked' ? 0.7 + rng() * 0.3 : 0.55 + rng() * 0.4,
    mark,
    word: {
      text: ctx.name,
      fontId,
      weight: weight as 400 | 700,
      tracking: trackingFor(casing, fontId, ctx.traits, rng),
      casing,
      color: ensureContrast(wordColor),
    },
    tagline: { show: false, text: ctx.tagline, color: palette.text },
  };
}

/** The first batch: six deliberately different directions. */
export function generateOptions(ctx: GenContext, seed = 0, count = 6): LogoDesign[] {
  const rng = makeRng(hashString(`${ctx.name}|${ctx.brief.industry}|${seed}`));
  const pool = Array.from(new Set(ctx.tags.flatMap((t) => TAG_MARKS[t]))).filter((k) => k !== 'monogram');
  const marks = shuffle(rng, pool.length >= 4 ? pool : TAG_MARKS.generic);
  const containers: ContainerKind[] = ['circle', 'rounded', 'hex', 'shield', 'square'];
  const used: string[] = [];
  const plan: Parameters<typeof buildDesign>[2][] = [
    { layout: 'horizontal', kind: marks[0] },
    { layout: 'stacked', kind: marks[1 % marks.length], colorMode: 'accent-main' },
    { layout: 'horizontal', kind: 'monogram', container: pick(rng, containers) },
    { layout: 'horizontal', kind: marks[2 % marks.length], colorMode: 'dual' },
    { layout: 'word', kind: 'none', concept: 'Wordmark' },
    { layout: 'stacked', kind: marks[3 % marks.length], container: pick(rng, containers) },
    { layout: 'horizontal', kind: marks[4 % marks.length] },
    { layout: 'stacked', kind: 'monogram', colorMode: 'dual' },
  ];
  const out: LogoDesign[] = [];
  for (let i = 0; i < count; i++) {
    const p = plan[i % plan.length];
    const d = buildDesign(rng, ctx, { ...p, fontAvoid: used.slice(-3) });
    used.push(d.word.fontId);
    if (d.layout === 'word') {
      // a pure wordmark carries the personality in the type, so lean on display fonts
      d.word.weight = getFont(d.word.fontId).weights.includes(700) ? 700 : 400;
      d.tagline.show = !!ctx.tagline;
    }
    out.push(d);
  }
  return out;
}

function shuffle<T>(rng: Rng, arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// Feedback: keep / change per part + a written note
// ---------------------------------------------------------------------------
export interface Feedback {
  keep: PartKey[];
  change: PartKey[];
  note: string;
}

export interface NoteResult {
  design: LogoDesign;
  understood: string[];
  ignored: string[];
}

const ICON_WORDS = /icon|symbol|mark|sign|shape|logo mark|emblem|тэмдэг|дүрс|айкон/;
const TEXT_WORDS = /text|name|word|font|type|letter|typograph|нэр|үсэг|фонт|бичиг/;

const SERIF = ['playfair', 'lora', 'dm-serif'];
const SANS = ['inter', 'montserrat', 'manrope', 'raleway'];
const TECHY = ['space-grotesk', 'unbounded', 'inter'];

function setFontFrom(d: LogoDesign, list: string[], text: string) {
  const ok = list.filter((id) => fontsFor(text).includes(id) && id !== d.word.fontId);
  if (ok.length) {
    d.word.fontId = ok[hashString(d.word.fontId + text) % ok.length];
    if (!getFont(d.word.fontId).weights.includes(d.word.weight)) d.word.weight = getFont(d.word.fontId).weights[0];
  }
}

/**
 * Rule-based reading of a written note (English and basic Mongolian).
 * Each clause is mapped to concrete design changes; anything not understood is
 * returned so the UI can say so instead of silently ignoring it.
 */
export function applyNote(input: LogoDesign, note: string): NoteResult {
  const d: LogoDesign = JSON.parse(JSON.stringify(input));
  const understood: string[] = [];
  const ignored: string[] = [];
  const clauses = note
    .toLowerCase()
    .split(/[,.;\n]+|\bbut\b|\band\b|\bболон\b|\bгэхдээ\b/)
    .map((c) => c.trim())
    .filter(Boolean);

  for (const c of clauses) {
    const icon = ICON_WORDS.test(c);
    const text = TEXT_WORDS.test(c);
    const both = !icon && !text;
    let hit = false;
    const did = (msg: string) => {
      hit = true;
      understood.push(msg);
    };

    // size
    if (/\b(bigger|larger|big|large|increase|more prominent)\b|том\b/.test(c) && !/spac/.test(c)) {
      if (icon || both) {
        d.mark.scale = clamp(d.mark.scale * 1.2, 0.6, 1.7);
        did('bigger symbol');
      } else {
        d.mark.scale = clamp(d.mark.scale / 1.2, 0.6, 1.7);
        did('bigger text (symbol scaled down)');
      }
    }
    if (/\b(smaller|small|tiny|reduce|less prominent)\b|жижиг/.test(c) && !/spac/.test(c)) {
      if (icon || both) {
        d.mark.scale = clamp(d.mark.scale / 1.2, 0.6, 1.7);
        did('smaller symbol');
      } else {
        d.mark.scale = clamp(d.mark.scale * 1.2, 0.6, 1.7);
        did('smaller text (symbol scaled up)');
      }
    }
    // weight
    if (/\b(bold|bolder|heavy|heavier|thick|thicker|strong|stronger)\b|тод|зузаан/.test(c)) {
      if (text || both) {
        d.word.weight = 700;
        did('bolder text');
      }
      if (icon || both) {
        d.mark.thickness = clamp(d.mark.thickness * 1.3, 0.5, 1.6);
        did('heavier symbol');
      }
    }
    if (/\b(thin|thinner|light|lighter weight|delicate|slim|refined)\b|нимгэн|хөнгөн/.test(c) && !/colou?r/.test(c)) {
      if (text || both) {
        d.word.weight = 400;
        did('lighter text');
      }
      if (icon || both) {
        d.mark.thickness = clamp(d.mark.thickness * 0.75, 0.5, 1.6);
        did('finer symbol');
      }
    }
    // shape
    if (/\b(round|rounder|soft|softer|friendly|smooth|curvy)\b|дугуй|зөөлөн/.test(c)) {
      d.mark.rounding = 0.95;
      if (text || both) setFontFrom(d, ['manrope', 'montserrat', 'lora'], d.word.text);
      did('rounder, softer forms');
    }
    if (/\b(sharp|sharper|angular|edgy|geometric|crisp|strict)\b|хурц|өнцөгт/.test(c)) {
      d.mark.rounding = 0;
      did('sharper, more angular forms');
    }
    // type
    if (/\b(serif|elegant|classic|classy|traditional|luxur\w*)\b|сериф/.test(c) && !/sans/.test(c)) {
      setFontFrom(d, SERIF, d.word.text);
      did('serif typeface');
    }
    if (/\b(sans|modern|clean|simple type|minimal type)\b/.test(c)) {
      setFontFrom(d, SANS, d.word.text);
      did('clean sans-serif typeface');
    }
    if (/\b(tech|techy|futuristic|digital|geometric type)\b/.test(c)) {
      setFontFrom(d, TECHY, d.word.text);
      did('techier typeface');
    }
    if (/\b(condensed|narrow|tall letters)\b/.test(c)) {
      setFontFrom(d, ['oswald'], d.word.text);
      did('condensed typeface');
    }
    if (/\b(uppercase|upper case|all caps|capital|caps)\b/.test(c)) {
      d.word.casing = 'upper';
      did('uppercase name');
    }
    if (/\b(lowercase|lower case|no caps|all lower)\b/.test(c)) {
      d.word.casing = 'lower';
      did('lowercase name');
    }
    if (/\b(title case|capitalised|capitalized)\b/.test(c)) {
      d.word.casing = 'title';
      did('title-case name');
    }
    // spacing
    if (/\b(wider|airy|spaced|spread|more space|more spacing|loose|looser|letter ?spacing)\b/.test(c) && !/less|tight/.test(c)) {
      d.word.tracking = clamp(d.word.tracking + 60, -20, 400);
      d.gap = clamp(d.gap + 0.2, 0.2, 1.6);
      did('more spacing');
    }
    if (/\b(tight|tighter|compact|closer|less space|less spacing)\b/.test(c)) {
      d.word.tracking = clamp(d.word.tracking - 50, -20, 400);
      d.gap = clamp(d.gap - 0.2, 0.2, 1.6);
      did('tighter spacing');
    }
    // layout
    if (/\b(stacked|vertical|centered|centred|on top|above)\b/.test(c)) {
      d.layout = 'stacked';
      did('stacked layout');
    }
    if (/\b(horizontal|side by side|beside|inline|next to)\b/.test(c)) {
      d.layout = 'horizontal';
      did('horizontal layout');
    }
    if (/(icon|symbol|mark) only|only (the )?(icon|symbol|mark)|just (the )?(icon|symbol)/.test(c)) {
      d.layout = 'mark';
      did('symbol only');
    }
    if (/(text|word|name|type) only|only (the )?(text|name|word)|wordmark only|no (icon|symbol)|without (an )?(icon|symbol)/.test(c)) {
      d.layout = 'word';
      did('wordmark only');
    }
    if (/\b(add|with) (an? )?(icon|symbol)\b/.test(c) && d.layout === 'word') {
      d.layout = 'horizontal';
      did('added a symbol');
    }
    // container
    const containers: [RegExp, ContainerKind][] = [
      [/\b(circle|circular|badge|round frame)\b/, 'circle'],
      [/\b(shield|crest)\b/, 'shield'],
      [/\b(hex|hexagon)\b/, 'hex'],
      [/\b(square|box)\b/, 'square'],
      [/\b(rounded square|app icon|squircle)\b/, 'rounded'],
    ];
    if (/\b(no (container|frame|badge|border)|remove (the )?(container|frame|badge|border)|without (a )?(container|frame|badge))\b/.test(c)) {
      d.mark.container = 'none';
      did('removed the container');
    } else {
      for (const [re, kind] of containers) {
        if (re.test(c) && (icon || both || /container|badge|frame|inside|in a|within/.test(c))) {
          d.mark.container = kind;
          did(`${kind} container`);
          break;
        }
      }
    }
    // complexity & style
    if (/\b(simpler|simplify|minimal|fewer|less detail|reduce)\b/.test(c) && !/spac/.test(c)) {
      d.mark.count = Math.max(2, d.mark.count - 1);
      d.mark.style = 'solid';
      did('simpler symbol');
    }
    if (/\b(complex|detailed|more detail|richer|more elements|add more)\b/.test(c)) {
      d.mark.count = Math.min(d.mark.count + 2, 12);
      did('more detailed symbol');
    }
    if (/\b(outline|outlined|line art|linear|stroke)\b/.test(c)) {
      d.mark.style = 'outline';
      did('outlined symbol');
    }
    if (/\b(filled|solid|flat)\b/.test(c)) {
      d.mark.style = 'solid';
      did('solid symbol');
    }
    // tagline
    if (/\b(no tagline|remove (the )?tagline|hide (the )?tagline)\b/.test(c)) {
      d.tagline.show = false;
      did('removed tagline');
    } else if (/\b(tagline|slogan)\b/.test(c) && d.tagline.text) {
      d.tagline.show = true;
      did('added tagline');
    }
    // colour
    if (/\b(darker|deeper|richer colou?rs?|dark colou?rs?)\b/.test(c)) {
      d.mark.color = adjustHsl(d.mark.color, 0, 0, -12);
      d.mark.accent = adjustHsl(d.mark.accent, 0, 0, -10);
      did('darker colours');
    }
    if (/\b(brighter|vibrant|vivid|saturated|colorful|colourful|energetic)\b/.test(c)) {
      d.mark.color = ensureContrast(adjustHsl(d.mark.color, 0, 18, 4));
      d.mark.accent = adjustHsl(d.mark.accent, 0, 18, 4);
      did('more vibrant colours');
    }
    if (/\b(muted|pastel|calm|quiet|subtle|less saturated)\b/.test(c)) {
      d.mark.color = adjustHsl(d.mark.color, 0, -22, 4);
      d.mark.accent = adjustHsl(d.mark.accent, 0, -22, 6);
      did('softer, muted colours');
    }
    if (/\b(warmer|warm colou?rs?)\b/.test(c)) {
      d.mark.color = ensureContrast(shiftHue(d.mark.color, -25));
      d.mark.accent = shiftHue(d.mark.accent, -25);
      did('warmer colours');
    }
    if (/\b(cooler|cool colou?rs?|calmer blue)\b/.test(c)) {
      d.mark.color = ensureContrast(shiftHue(d.mark.color, 25));
      d.mark.accent = shiftHue(d.mark.accent, 25);
      did('cooler colours');
    }
    if (/\b(monochrome|one colou?r|single colou?r|mono)\b/.test(c)) {
      d.mark.accent = d.mark.color;
      d.word.color = d.mark.color;
      did('single colour');
    }
    if (/\b(two colou?rs?|duo|two[- ]tone|contrast)\b/.test(c)) {
      d.mark.accent = shiftHue(d.mark.color, 160);
      did('two-colour mark');
    }
    if (/\b(black|dark text)\b/.test(c) && (text || both)) {
      d.word.color = '#111111';
      did('black text');
    }

    if (!hit) ignored.push(c);
  }
  return { design: d, understood: Array.from(new Set(understood)), ignored };
}

function jitter(d: LogoDesign, rng: Rng, keep: PartKey[]): LogoDesign {
  const o: LogoDesign = JSON.parse(JSON.stringify(d));
  if (!keep.includes('mark')) {
    o.mark.count = clamp(o.mark.count + pick(rng, [-1, 0, 1]), 2, 12);
    o.mark.rotation = (o.mark.rotation + pick(rng, [-20, 0, 15, 30])) % 360;
    o.mark.rounding = clamp(o.mark.rounding + (rng() - 0.5) * 0.4, 0, 1);
    if (rng() < 0.3 && o.mark.container === 'none' && o.mark.kind !== 'monogram') {
      o.mark.container = pick(rng, ['circle', 'rounded', 'hex', 'square'] as ContainerKind[]);
    }
  }
  if (!keep.includes('word')) {
    o.word.tracking = clamp(o.word.tracking + pick(rng, [-20, 0, 25, 50]), -20, 400);
    if (rng() < 0.35) o.word.casing = pick(rng, ['upper', 'lower', 'title'] as Casing[]);
  }
  if (!keep.includes('layout')) {
    o.gap = clamp(o.gap + (rng() - 0.5) * 0.4, 0.3, 1.5);
    o.mark.scale = clamp(o.mark.scale + (rng() - 0.5) * 0.3, 0.7, 1.5);
  }
  return o;
}

/**
 * Next round from one chosen design. Parts marked "keep" are never touched by
 * the re-roll; parts marked "change" get a different direction; the written
 * note applies to every result (and is why result #1 is exactly what you asked).
 */
export function refineOptions(
  base: LogoDesign,
  fb: Feedback,
  ctx: GenContext,
  opts: { seed: number; count?: number; avoidMarks?: MarkKind[]; avoidFonts?: string[] }
): { designs: LogoDesign[]; understood: string[]; ignored: string[] } {
  const count = opts.count ?? 6;
  const rng = makeRng(hashString(`${base.concept}|${fb.note}|${opts.seed}`));
  const noted = applyNote(base, fb.note);
  const out: LogoDesign[] = [];
  const usedMarks = new Set<MarkKind>([base.mark.kind, ...(opts.avoidMarks || [])]);
  const usedFonts = new Set<string>([base.word.fontId, ...(opts.avoidFonts || [])]);
  const pool = Array.from(new Set(ctx.tags.flatMap((t) => TAG_MARKS[t]))).filter((k) => k !== 'monogram');

  for (let i = 0; i < count; i++) {
    // #1 = the exact requested edit, no randomness
    let d: LogoDesign = i === 0 ? noted.design : jitter(noted.design, rng, fb.keep);

    if (i > 0 && fb.change.includes('mark')) {
      const options = [...pool, 'monogram' as MarkKind].filter((k) => !usedMarks.has(k));
      const kind = options.length ? pick(rng, options) : pick(rng, pool);
      usedMarks.add(kind);
      const params = markParams(kind, rng, ctx);
      d.mark = { ...d.mark, kind, ...params, container: kind === 'monogram' && d.mark.container === 'none' ? 'circle' : d.mark.container };
      d.concept = `${kind[0].toUpperCase() + kind.slice(1)} · ${getFont(d.word.fontId).name}`;
    }
    if (i > 0 && fb.change.includes('word')) {
      const fontId = pickFont(rng, ctx, Array.from(usedFonts), d.word.text);
      usedFonts.add(fontId);
      d.word.fontId = fontId;
      const fw = getFont(fontId).weights;
      d.word.weight = fw.includes(d.word.weight) ? d.word.weight : fw[fw.length - 1];
      d.word.casing = pickCasing(rng, ctx.traits);
      d.word.tracking = trackingFor(d.word.casing, fontId, ctx.traits, rng);
      d.concept = `${d.mark.kind === 'none' ? 'Wordmark' : d.mark.kind[0].toUpperCase() + d.mark.kind.slice(1)} · ${getFont(fontId).name}`;
    }
    if (i > 0 && fb.change.includes('color')) {
      const p = ctx.palette;
      const variants = [
        { main: p.accent, acc: p.primary },
        { main: shiftHue(p.primary, 30), acc: shiftHue(p.primary, 200) },
        { main: shiftHue(p.primary, -35), acc: p.accent },
        { main: adjustHsl(p.primary, 0, -10, -14), acc: adjustHsl(p.accent, 0, 10, 6) },
        { main: '#111111', acc: p.primary },
      ];
      const v = variants[(i - 1) % variants.length];
      d.mark.color = ensureContrast(v.main);
      d.mark.accent = v.acc;
      d.word.color = rng() < 0.5 ? d.mark.color : p.text;
    }
    if (i > 0 && fb.change.includes('layout')) {
      const layouts: LogoLayout[] = ['horizontal', 'stacked'];
      d.layout = layouts[(layouts.indexOf(d.layout) + i) % layouts.length] || 'horizontal';
      d.gap = 0.5 + rng() * 0.6;
    }
    // honour keeps against whatever the jitter touched
    if (fb.keep.includes('mark')) d.mark = { ...base.mark, ...pickMarkNoteFields(noted.design.mark, base.mark) };
    if (fb.keep.includes('word')) d.word = { ...noted.design.word };
    if (fb.keep.includes('color')) {
      d.mark.color = noted.design.mark.color;
      d.mark.accent = noted.design.mark.accent;
      d.word.color = noted.design.word.color;
    }
    if (fb.keep.includes('layout')) {
      d.layout = noted.design.layout;
      d.gap = noted.design.gap;
    }
    out.push(d);
  }
  return { designs: out, understood: noted.understood, ignored: noted.ignored };
}

/** A kept mark stays as it was, apart from what the note explicitly changed. */
function pickMarkNoteFields(noted: MarkSpec, base: MarkSpec): Partial<MarkSpec> {
  const changed: Partial<MarkSpec> = {};
  (Object.keys(noted) as (keyof MarkSpec)[]).forEach((k) => {
    if (noted[k] !== base[k]) (changed as any)[k] = noted[k];
  });
  return changed;
}
