import { loadFontStack, textToPath } from './fonts';
import { containerPath, drawMark } from './marks';
import type { Casing, LogoColorway, LogoDesign } from './types';

const f = (n: number) => Math.round(n * 100) / 100;
let uidCounter = 0;

export function applyCasing(text: string, casing: Casing): string {
  switch (casing) {
    case 'upper':
      return text.toLocaleUpperCase();
    case 'lower':
      return text.toLocaleLowerCase();
    case 'title':
      return text
        .split(' ')
        .map((w) => (w ? w[0].toLocaleUpperCase() + w.slice(1).toLocaleLowerCase() : w))
        .join(' ');
    default:
      return text;
  }
}

export function initialsOf(name: string, count = 1): string {
  const words = name.trim().split(/[\s\-_&]+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return Array.from(words[0]).slice(0, count >= 2 ? 2 : 1).join('').toLocaleUpperCase();
  return words
    .slice(0, 2)
    .map((w) => Array.from(w)[0])
    .join('')
    .toLocaleUpperCase();
}

export interface RenderResult {
  svg: string;
  width: number;
  height: number;
  /** characters no bundled font could draw */
  missing: string[];
}

export interface RenderOptions {
  colorway?: LogoColorway;
  /** solid background rectangle (for PNG exports / previews) */
  background?: string;
  /** padding around the artwork, as a share of the wordmark cap height */
  padding?: number;
}

const DARK = '#111111';
const LIGHT = '#ffffff';

export async function renderLogo(design: LogoDesign, opts: RenderOptions = {}): Promise<RenderResult> {
  const colorway = opts.colorway || 'color';
  const mono = colorway === 'dark' ? DARK : colorway === 'light' ? LIGHT : null;
  const markInk = mono || design.mark.color;
  const markAccent = mono || design.mark.accent;
  const wordInk = mono || design.word.color;
  const tagInk = mono || design.tagline.color;

  const H = 40; // wordmark cap height in output units
  const showMark = design.layout !== 'word' && design.mark.kind !== 'none';
  const showWord = design.layout !== 'mark';
  const showTag = showWord && design.tagline.show && design.tagline.text.trim().length > 0;
  const missing: string[] = [];

  // ---- wordmark -------------------------------------------------------
  const wordText = applyCasing(design.word.text, design.word.casing);
  const wordStack = await loadFontStack(design.word.fontId, design.word.weight);
  const wp = textToPath(wordStack, wordText, 100, design.word.tracking / 1000);
  missing.push(...wp.missing);
  const k = wp.capHeight > 0 ? H / wp.capHeight : 0.4;
  const wordW = wp.width * k;

  // ---- tagline --------------------------------------------------------
  let tagD = '';
  let tagW = 0;
  let tagScale = 1;
  const tagCap = H * 0.24;
  if (showTag) {
    const tStack = await loadFontStack(design.word.fontId, 400);
    const tp = textToPath(tStack, design.tagline.text.toLocaleUpperCase(), 100, 0.28);
    missing.push(...tp.missing);
    tagScale = tp.capHeight > 0 ? tagCap / tp.capHeight : 0.1;
    tagW = tp.width * tagScale;
    tagD = tp.d;
    const maxW = Math.max(wordW, H * 3);
    if (tagW > maxW) {
      tagScale *= maxW / tagW;
      tagW = maxW;
    }
  }
  const tagBaseline = H * 0.62 + tagCap;

  // ---- mark -----------------------------------------------------------
  const M = showMark ? H * 2.7 * design.mark.scale : 0;
  let markSvg = '';
  if (showMark) {
    const m = design.mark;
    const defs: string[] = [];
    let content = '';
    const inner = m.container === 'none' ? 1 : 0.56;

    const buildContent = async (ink: string, acc: string) => {
      if (m.kind === 'monogram') {
        const stack = await loadFontStack(design.word.fontId, 700);
        const letters = initialsOf(design.word.text, m.count);
        const lp = textToPath(stack, letters, 100, 0.02);
        missing.push(...lp.missing);
        const target = m.container === 'none' ? 66 : 44; // cap height on the 100 grid
        const s = lp.capHeight > 0 ? target / lp.capHeight : 0.5;
        const tx = 50 - (lp.width * s) / 2;
        const ty = 50 + target / 2;
        const dot =
          m.container === 'none' && acc !== ink
            ? `<circle cx="${f(Math.min(96, tx + lp.width * s + 7))}" cy="${f(ty - 4)}" r="6" fill="${acc}"/>`
            : '';
        return `<path d="${lp.d}" fill="${ink}" transform="translate(${f(tx)} ${f(ty)}) scale(${f(s)})"/>${dot}`;
      }
      if (m.kind === 'custom' && m.customSvg) {
        // AI-generated custom SVG - already cleaned on client side
        return `<g>${m.customSvg}</g>`;
      }
      return drawMark(m, ink, acc);
    };

    if (m.container === 'none') {
      content = await buildContent(markInk, markAccent);
    } else {
      const uid = `lm${++uidCounter}`;
      // true knockout: the content is cut out of the container, so it works on any background
      const knock = await buildContent('#000', '#000');
      const scale = inner;
      const off = (100 - 100 * scale) / 2;
      defs.push(
        `<mask id="${uid}" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect width="100" height="100" fill="#fff"/><g transform="translate(${f(off)} ${f(off)}) scale(${scale})">${knock}</g></mask>`
      );
      content = `<path d="${containerPath(m.container, m.rounding)}" fill="${markInk}" mask="url(#${uid})"/>`;
    }
    const defsStr = defs.length ? `<defs>${defs.join('')}</defs>` : '';
    markSvg = `${defsStr}<g data-part="mark">${content}</g>`;
  }

  // ---- layout ---------------------------------------------------------
  const gap = H * 0.9 * design.gap;
  const parts: string[] = [];
  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;
  const grow = (x0: number, y0: number, x1: number, y1: number) => {
    minX = Math.min(minX, x0);
    minY = Math.min(minY, y0);
    maxX = Math.max(maxX, x1);
    maxY = Math.max(maxY, y1);
  };

  const wordBlock = (x: number, y: number, align: 'start' | 'middle') => {
    const bw = Math.max(wordW, showTag ? tagW : 0);
    const left = align === 'middle' ? x - wordW / 2 : x;
    let g = `<path data-part="word" d="${wp.d}" fill="${wordInk}" transform="translate(${f(left)} ${f(y)}) scale(${f(k)})"/>`;
    if (showTag) {
      const tx = align === 'middle' ? x - tagW / 2 : x;
      g += `<path data-part="tagline" d="${tagD}" fill="${tagInk}" transform="translate(${f(tx)} ${f(y + tagBaseline)}) scale(${f(tagScale)})"/>`;
    }
    const bottom = y + (showTag ? tagBaseline : H * 0.22);
    return { g, x0: align === 'middle' ? x - bw / 2 : x, x1: align === 'middle' ? x + bw / 2 : x + bw, y0: y - H, y1: bottom };
  };

  if (design.layout === 'mark' || (!showWord && showMark)) {
    parts.push(`<g transform="scale(${f(M / 100)})">${markSvg}</g>`);
    grow(0, 0, M, M);
  } else if (design.layout === 'word' || !showMark) {
    const b = wordBlock(0, 0, 'start');
    parts.push(b.g);
    grow(b.x0, b.y0, b.x1, b.y1);
  } else if (design.layout === 'stacked') {
    const cx = 0;
    parts.push(`<g transform="translate(${f(cx - M / 2)} 0) scale(${f(M / 100)})">${markSvg}</g>`);
    grow(cx - M / 2, 0, cx + M / 2, M);
    const b = wordBlock(cx, M + gap + H, 'middle');
    parts.push(b.g);
    grow(b.x0, b.y0, b.x1, b.y1);
  } else {
    // horizontal: mark centred on the text block
    const textTop = -H;
    const textBottom = showTag ? tagBaseline : H * 0.22;
    const cy = (textTop + textBottom) / 2;
    const my = cy - M / 2;
    parts.push(`<g transform="translate(0 ${f(my)}) scale(${f(M / 100)})">${markSvg}</g>`);
    grow(0, my, M, my + M);
    const b = wordBlock(M + gap, 0, 'start');
    parts.push(b.g);
    grow(b.x0, b.y0, b.x1, b.y1);
  }

  const pad = H * (opts.padding ?? 0.5);
  const vx = minX - pad;
  const vy = minY - pad;
  const vw = maxX - minX + pad * 2;
  const vh = maxY - minY + pad * 2;
  const bg = opts.background ? `<rect x="${f(vx)}" y="${f(vy)}" width="${f(vw)}" height="${f(vh)}" fill="${opts.background}"/>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(vx)} ${f(vy)} ${f(vw)} ${f(vh)}" role="img" aria-label="${escapeXml(
    design.word.text
  )} logo">${bg}${parts.join('')}</svg>`;
  return { svg, width: vw, height: vh, missing: Array.from(new Set(missing)) };
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c] as string));
}
