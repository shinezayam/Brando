import type { ContainerKind, MarkKind, MarkSpec } from './types';

// Every mark is drawn on a 100x100 grid, centred on (50,50).

const f = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Paint attributes: filled shapes become strokes in the outline style. */
function paint(spec: MarkSpec, color: string, opacity = 1): string {
  const sw = f(4.5 * spec.thickness + 1);
  const join = spec.rounding > 0.4 ? 'round' : 'miter';
  if (spec.style === 'outline') {
    return `fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="${join}"${
      opacity < 1 ? ` stroke-opacity="${opacity}"` : ''
    }`;
  }
  return `fill="${color}"${opacity < 1 ? ` fill-opacity="${opacity}"` : ''}`;
}

function strokeAttrs(spec: MarkSpec, color: string, width: number): string {
  const cap = spec.rounding > 0.4 ? 'round' : 'butt';
  const join = spec.rounding > 0.4 ? 'round' : 'miter';
  return `fill="none" stroke="${color}" stroke-width="${f(width)}" stroke-linecap="${cap}" stroke-linejoin="${join}"`;
}

function petals(s: MarkSpec, ink: string, acc: string): string {
  const n = clamp(Math.round(s.count), 3, 12);
  const R = 43;
  const w = 8 + 9 * s.thickness + (n < 6 ? 4 : 0);
  const r = s.rounding;
  const c2x = w * (0.5 + 0.9 * r);
  const c2y = R * (0.55 + 0.4 * r);
  const d = `M0 0 C${f(w * 1.3)} ${f(-R * 0.15)} ${f(c2x)} ${f(-c2y)} 0 ${-R} C${f(-c2x)} ${f(-c2y)} ${f(-w * 1.3)} ${f(
    -R * 0.15
  )} 0 0Z`;
  let out = '';
  for (let i = 0; i < n; i++) {
    const color = i % 2 === 1 && acc !== ink ? acc : ink;
    out += `<path d="${d}" ${paint(s, color)} transform="translate(50 50) rotate(${f(s.rotation + (i * 360) / n)})"/>`;
  }
  return out;
}

function orbit(s: MarkSpec, ink: string, acc: string): string {
  const n = clamp(Math.round(s.count), 2, 4);
  const t = f((24 / n) * 0.62 * s.thickness + 2);
  let out = `<circle cx="50" cy="50" r="${f(9 + (4 - n) * 1.5)}" fill="${acc}"/>`;
  for (let i = 0; i < n; i++) {
    const r = 22 + i * (22 / (n - 0.2)) + (n === 2 ? 4 : 0);
    const a0 = rad(s.rotation + i * 75 - 90);
    const a1 = a0 + rad(250);
    const p = (a: number) => `${f(50 + r * Math.cos(a))} ${f(50 + r * Math.sin(a))}`;
    out += `<path d="M${p(a0)} A${f(r)} ${f(r)} 0 1 1 ${p(a1)}" ${strokeAttrs(s, ink, t)}/>`;
  }
  return out;
}

function bars(s: MarkSpec, ink: string, acc: string): string {
  const n = clamp(Math.round(s.count), 3, 7);
  const gapRatio = 0.5;
  const w = 84 / (n + (n - 1) * gapRatio);
  const gap = w * gapRatio;
  const sym = s.rotation >= 45;
  let out = '';
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 1 : i / (n - 1);
    const k = sym ? 1 - Math.abs(t - 0.5) * 2 : t;
    const h = 26 + k * 58;
    const x = 8 + i * (w + gap);
    const rx = f((s.rounding * w) / 2);
    const tall = sym ? k === 1 || (n % 2 === 0 && k > 0.8) : i === n - 1;
    out += `<rect x="${f(x)}" y="${f(92 - h)}" width="${f(w)}" height="${f(h)}" rx="${rx}" ${paint(s, tall && acc !== ink ? acc : ink)}/>`;
  }
  return out;
}

function chevrons(s: MarkSpec, ink: string, acc: string): string {
  const n = clamp(Math.round(s.count), 2, 4);
  const t = f(7 + 6 * s.thickness);
  const d = 17 + t * 0.4;
  const total = 30 + (n - 1) * d;
  const y0 = 50 - total / 2;
  let out = '';
  for (let i = 0; i < n; i++) {
    const y = y0 + i * d;
    const color = i === n - 1 && acc !== ink ? acc : ink;
    out += `<path d="M14 ${f(y + 30)} L50 ${f(y)} L86 ${f(y + 30)}" ${strokeAttrs(s, color, t)}/>`;
  }
  return `<g transform="rotate(${f(s.rotation)} 50 50)">${out}</g>`;
}

function cube(s: MarkSpec, ink: string, acc: string): string {
  const R = 44;
  const v = (k: number) => {
    const a = rad(-90 + k * 60);
    return [50 + R * Math.cos(a), 50 + R * Math.sin(a)];
  };
  const C = [50, 50];
  const faces: [number[][], string, number][] = [
    [[v(5), v(0), v(1), C], ink, 1],
    [[v(5), C, v(3), v(4)], ink, 0.72],
    [[C, v(1), v(2), v(3)], acc !== ink ? acc : ink, acc !== ink ? 1 : 0.48],
  ];
  let out = '';
  for (const [pts, color, op] of faces) {
    const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    const sh = pts.map(([x, y]) => [cx + (x - cx) * 0.9, cy + (y - cy) * 0.9]);
    const d = 'M' + sh.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L') + 'Z';
    const join = s.rounding > 0.4 ? ` stroke="${color}" stroke-width="${f(2 + s.rounding * 5)}" stroke-linejoin="round"` : '';
    out += `<path d="${d}" ${paint(s, color, op)}${s.style === 'solid' ? join : ''}/>`;
  }
  return `<g transform="rotate(${f(s.rotation)} 50 50)">${out}</g>`;
}

function sun(s: MarkSpec, ink: string, acc: string): string {
  const n = clamp(Math.round(s.count), 6, 16);
  const w = f(3 + 3.2 * s.thickness);
  let out = `<circle cx="50" cy="50" r="${f(13 + s.thickness * 3)}" ${s.style === 'outline' ? paint(s, ink) : `fill="${acc}"`}/>`;
  for (let i = 0; i < n; i++) {
    const a = rad(s.rotation + (i * 360) / n);
    const long = i % 2 === 0;
    const r1 = 26;
    const r2 = long ? 45 : 38;
    out += `<path d="M${f(50 + r1 * Math.cos(a))} ${f(50 + r1 * Math.sin(a))} L${f(50 + r2 * Math.cos(a))} ${f(
      50 + r2 * Math.sin(a)
    )}" ${strokeAttrs(s, ink, w)}/>`;
  }
  return out;
}

function leaf(s: MarkSpec, ink: string, acc: string): string {
  const fat = 70 + s.rounding * 22;
  const body = `M50 6 C${f(fat + 18)} 28 ${f(fat + 18)} 72 50 94 C${f(100 - fat - 18)} 72 ${f(100 - fat - 18)} 28 50 6Z`;
  const vein = 'M48.4 40 H51.6 V82 H48.4Z';
  let out = `<g transform="rotate(${f(s.rotation)} 50 50)"><path d="${body}${s.style === 'solid' ? vein : ''}" fill-rule="evenodd" ${paint(s, ink)}/></g>`;
  if (s.count >= 2) {
    const small = `M0 -26 C${f(fat * 0.34)} -13 ${f(fat * 0.34)} 13 0 26 C${f(-fat * 0.34)} 13 ${f(-fat * 0.34)} -13 0 -26Z`;
    out += `<path d="${small}" ${paint(s, acc)} transform="translate(80 24) rotate(${f(s.rotation + 70)}) scale(0.6)"/>`;
  }
  return out;
}

function peak(s: MarkSpec, ink: string, acc: string): string {
  const j = f(s.rounding * 9);
  const join = s.rounding > 0 ? `stroke-linejoin="round" stroke-width="${j}"` : '';
  const back = `<path d="M38 82 L66 38 L94 82Z" ${paint(s, acc !== ink ? acc : ink, acc !== ink ? 1 : 0.5)} ${
    s.style === 'solid' ? `stroke="${acc !== ink ? acc : ink}" stroke-opacity="${acc !== ink ? 1 : 0.5}" ${join}` : ''
  }/>`;
  const cap = s.style === 'solid' ? 'M36 38 L43 47 L39.5 52 L36 47.5 L32.5 52 L29 47Z' : '';
  const front = `<path d="M6 82 L36 28 L66 82Z${cap}" fill-rule="evenodd" ${paint(s, ink)} ${
    s.style === 'solid' ? `stroke="${ink}" ${join}` : ''
  }/>`;
  return back + front;
}

function ringcut(s: MarkSpec, ink: string, acc: string): string {
  const r = 34;
  const t = f(10 + 9 * s.thickness);
  const gap = 64;
  const a0 = rad(s.rotation - 90 + gap / 2);
  const a1 = rad(s.rotation - 90 + 360 - gap / 2);
  const p = (a: number) => `${f(50 + r * Math.cos(a))} ${f(50 + r * Math.sin(a))}`;
  const mid = rad(s.rotation - 90);
  return (
    `<path d="M${p(a0)} A${r} ${r} 0 1 1 ${p(a1)}" ${strokeAttrs(s, ink, t)}/>` +
    `<circle cx="${f(50 + r * Math.cos(mid))}" cy="${f(50 + r * Math.sin(mid))}" r="${f(t * 0.55)}" fill="${acc}"/>`
  );
}

type Cell = 'qtl' | 'qtr' | 'qbl' | 'qbr' | 'circle' | 'square' | 'dot';
const QUAD_PATTERNS: Cell[][] = [
  ['qbr', 'qbl', 'qtr', 'qtl'],
  ['circle', 'qbl', 'square', 'qtl'],
  ['qtl', 'circle', 'circle', 'qbr'],
  ['square', 'qbl', 'qtr', 'circle'],
  ['qbr', 'dot', 'dot', 'qtl'],
  ['qtr', 'qtl', 'qbr', 'qbl'],
];

function quad(s: MarkSpec, ink: string, acc: string): string {
  const cells = QUAD_PATTERNS[Math.abs(Math.round(s.count)) % QUAD_PATTERNS.length];
  const size = 41;
  const pos = [
    [4, 4],
    [55, 4],
    [4, 55],
    [55, 55],
  ];
  const colors = [ink, acc, acc, ink];
  let out = '';
  cells.forEach((c, i) => {
    const [x, y] = pos[i];
    const col = colors[i];
    const sz = size;
    let d = '';
    if (c === 'qtl') d = `M${x} ${y} L${x + sz} ${y} A${sz} ${sz} 0 0 1 ${x} ${y + sz}Z`;
    if (c === 'qtr') d = `M${x + sz} ${y} L${x} ${y} A${sz} ${sz} 0 0 0 ${x + sz} ${y + sz}Z`;
    if (c === 'qbl') d = `M${x} ${y + sz} L${x + sz} ${y + sz} A${sz} ${sz} 0 0 0 ${x} ${y}Z`;
    if (c === 'qbr') d = `M${x + sz} ${y + sz} L${x} ${y + sz} A${sz} ${sz} 0 0 1 ${x + sz} ${y}Z`;
    if (c === 'circle') {
      out += `<circle cx="${x + sz / 2}" cy="${y + sz / 2}" r="${sz / 2}" ${paint(s, col)}/>`;
    } else if (c === 'dot') {
      out += `<circle cx="${x + sz / 2}" cy="${y + sz / 2}" r="${sz * 0.27}" ${paint(s, col)}/>`;
    } else if (c === 'square') {
      out += `<rect x="${x}" y="${y}" width="${sz}" height="${sz}" rx="${f(s.rounding * 10)}" ${paint(s, col)}/>`;
    } else {
      out += `<path d="${d}" ${paint(s, col)}/>`;
    }
  });
  return `<g transform="rotate(${f(s.rotation)} 50 50)">${out}</g>`;
}

function wave(s: MarkSpec, ink: string, acc: string): string {
  const n = clamp(Math.round(s.count), 2, 4);
  const w = f(6 + 5 * s.thickness);
  const span = 46;
  let out = '';
  for (let i = 0; i < n; i++) {
    const y = 50 - span / 2 + (n === 1 ? span / 2 : (i * span) / (n - 1));
    const color = i % 2 === 1 && acc !== ink ? acc : ink;
    out += `<path d="M8 ${f(y)} Q29 ${f(y - 20)} 50 ${f(y)} T92 ${f(y)}" ${strokeAttrs(s, color, w)}/>`;
  }
  return `<g transform="rotate(${f(s.rotation)} 50 50)">${out}</g>`;
}

const DRAWERS: Partial<Record<MarkKind, (s: MarkSpec, ink: string, acc: string) => string>> = {
  petals,
  orbit,
  bars,
  chevrons,
  cube,
  sun,
  leaf,
  peak,
  ringcut,
  quad,
  wave,
};

/** Inner markup of a mark on the 100x100 grid. Monogram and custom are handled by the renderer. */
export function drawMark(spec: MarkSpec, ink: string, accent: string): string {
  if (spec.kind === 'custom' || spec.kind === 'monogram') return '';
  const fn = DRAWERS[spec.kind];
  return fn ? fn(spec, ink, accent) : '';
}

export function containerPath(kind: ContainerKind, rounding: number): string {
  switch (kind) {
    case 'circle':
      return 'M50 3 A47 47 0 1 1 49.99 3Z';
    case 'square': {
      const r = f(rounding * 14);
      return `M${3 + r} 3 H${97 - r} Q97 3 97 ${3 + r} V${97 - r} Q97 97 ${97 - r} 97 H${3 + r} Q3 97 3 ${97 - r} V${3 + r} Q3 3 ${3 + r} 3Z`;
    }
    case 'rounded':
      return 'M27 3 H73 Q97 3 97 27 V73 Q97 97 73 97 H27 Q3 97 3 73 V27 Q3 3 27 3Z';
    case 'hex':
      return 'M50 2 L92 26 V74 L50 98 L8 74 V26Z';
    case 'shield':
      return 'M50 3 L92 17 V50 C92 76 72 90 50 98 C28 90 8 76 8 50 V17Z';
    default:
      return '';
  }
}

export const MARK_KINDS: { kind: MarkKind; label: string }[] = [
  { kind: 'monogram', label: 'Monogram' },
  { kind: 'petals', label: 'Petals' },
  { kind: 'orbit', label: 'Orbit' },
  { kind: 'bars', label: 'Bars' },
  { kind: 'chevrons', label: 'Chevrons' },
  { kind: 'cube', label: 'Cube' },
  { kind: 'sun', label: 'Sun' },
  { kind: 'leaf', label: 'Leaf' },
  { kind: 'peak', label: 'Peak' },
  { kind: 'ringcut', label: 'Ring' },
  { kind: 'quad', label: 'Quad' },
  { kind: 'wave', label: 'Wave' },
  { kind: 'custom', label: 'AI Custom' },
];
