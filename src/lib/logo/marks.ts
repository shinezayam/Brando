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
  // Industry-specific
  camera,
  clapper,
  filmreel,
  forkplate,
  chefhat,
  circuit,
  codebracket,
  network,
  medcross,
  heartpulse,
  dna,
  chart,
  shield,
  coin,
  book,
  gradcap,
  quill,
  house,
  key,
  building,
  dumbbell,
  trophy,
  scissors,
  lipstick,
  musicnote,
  microphone,
  compass,
  airplane,
  aperture,
  columns,
  scales,
  pillar,
};

/** Inner markup of a mark on the 100x100 grid. Monogram and custom are handled by the renderer. */
export function drawMark(spec: MarkSpec, ink: string, accent: string): string {
  if (spec.kind === 'custom' || spec.kind === 'monogram') return '';
  const fn = DRAWERS[spec.kind];
  return fn ? fn(spec, ink, accent) : '';
}

// Industry-specific marks

function camera(s: MarkSpec, ink: string, acc: string): string {
  const attrs = paint(s, ink);
  const sw = f(4.5 * s.thickness + 1);
  // Camera body
  const body = `<rect x="20" y="38" width="60" height="40" rx="${f(s.rounding * 8)}" ${attrs}/>`;
  // Lens
  const lens = `<circle cx="50" cy="58" r="12" fill="none" stroke="${acc}" stroke-width="${sw}"/>`;
  const lensInner = `<circle cx="50" cy="58" r="5" ${attrs}/>`;
  // Flash/viewfinder on top
  const flash = `<path d="M35 38 L40 28 L60 28 L65 38" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  return `<g transform="translate(0 0)">${body}${flash}${lens}${lensInner}</g>`;
}

function clapper(s: MarkSpec, ink: string, acc: string): string {
  const attrs = paint(s, ink);
  const sw = f(4.5 * s.thickness + 1);
  // Board base
  const board = `<rect x="18" y="40" width="64" height="42" rx="${f(s.rounding * 6)}" ${attrs}/>`;
  // Clapper top (angled)
  const clapperTop = `<path d="M18 40 L18 30 L82 20 L82 40" fill="${acc}" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  // Stripes on clapper
  const stripes = `<line x1="30" y1="37" x2="35" y2="27" stroke="${ink}" stroke-width="${f(sw * 0.6)}"/>
    <line x1="45" y1="35" x2="50" y2="25" stroke="${ink}" stroke-width="${f(sw * 0.6)}"/>
    <line x1="60" y1="33" x2="65" y2="23" stroke="${ink}" stroke-width="${f(sw * 0.6)}"/>`;
  return `<g transform="translate(0 0)">${board}${clapperTop}${stripes}</g>`;
}

function filmreel(s: MarkSpec, ink: string, acc: string): string {
  const attrs = paint(s, ink);
  const sw = f(4.5 * s.thickness + 1);
  // Outer circle
  const outer = `<circle cx="50" cy="50" r="40" fill="none" stroke="${ink}" stroke-width="${sw}"/>`;
  // Inner circle
  const inner = `<circle cx="50" cy="50" r="12" ${attrs}/>`;
  // Spokes/holes
  const n = clamp(Math.round(s.count), 3, 6);
  let holes = '';
  for (let i = 0; i < n; i++) {
    const angle = rad(s.rotation + (i * 360) / n);
    const x = 50 + 26 * Math.cos(angle);
    const y = 50 + 26 * Math.sin(angle);
    holes += `<circle cx="${f(x)}" cy="${f(y)}" r="6" fill="${acc}"/>`;
  }
  return `<g transform="translate(0 0)">${outer}${inner}${holes}</g>`;
}

function forkplate(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(4.5 * s.thickness + 1);
  // Plate (circle)
  const plate = `<circle cx="50" cy="52" r="32" fill="none" stroke="${ink}" stroke-width="${sw}"/>`;
  // Fork on left
  const fork = `<g transform="translate(25 20)">
    <line x1="0" y1="0" x2="0" y2="60" stroke="${acc}" stroke-width="${sw}" stroke-linecap="round"/>
    <line x1="-6" y1="0" x2="-6" y2="18" stroke="${acc}" stroke-width="${f(sw * 0.7)}" stroke-linecap="round"/>
    <line x1="6" y1="0" x2="6" y2="18" stroke="${acc}" stroke-width="${f(sw * 0.7)}" stroke-linecap="round"/>
  </g>`;
  // Knife on right
  const knife = `<g transform="translate(75 20)">
    <line x1="0" y1="0" x2="0" y2="60" stroke="${acc}" stroke-width="${sw}" stroke-linecap="round"/>
    <path d="M0 0 Q8 15 0 30" fill="none" stroke="${acc}" stroke-width="${f(sw * 0.7)}"/>
  </g>`;
  return `<g transform="translate(0 0)">${plate}${fork}${knife}</g>`;
}

function chefhat(s: MarkSpec, ink: string, acc: string): string {
  const attrs = paint(s, ink);
  const sw = f(4.5 * s.thickness + 1);
  // Hat base (band)
  const band = `<rect x="25" y="60" width="50" height="18" rx="${f(s.rounding * 4)}" ${attrs}/>`;
  // Hat puff (cloud shape)
  const puff = `<path d="M25 60 Q25 35 35 30 Q40 20 50 20 Q60 20 65 30 Q75 35 75 60" fill="${acc}" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  // Pleats
  const pleats = `<line x1="38" y1="60" x2="38" y2="38" stroke="${ink}" stroke-width="${f(sw * 0.4)}" opacity="0.5"/>
    <line x1="50" y1="60" x2="50" y2="32" stroke="${ink}" stroke-width="${f(sw * 0.4)}" opacity="0.5"/>
    <line x1="62" y1="60" x2="62" y2="38" stroke="${ink}" stroke-width="${f(sw * 0.4)}" opacity="0.5"/>`;
  return `<g transform="translate(0 0)">${puff}${band}${pleats}</g>`;
}

// Tech marks
function circuit(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(4.5 * s.thickness + 1);
  const r = f(s.rounding * 4);
  // Central node
  const center = `<circle cx="50" cy="50" r="8" ${paint(s, acc)}/>`;
  // Circuit paths
  const paths = `
    <path d="M50 42 L50 20 L30 20" ${strokeAttrs(s, ink, sw)}/>
    <path d="M58 50 L80 50 L80 30" ${strokeAttrs(s, ink, sw)}/>
    <path d="M50 58 L50 80 L70 80" ${strokeAttrs(s, ink, sw)}/>
    <path d="M42 50 L20 50 L20 70" ${strokeAttrs(s, ink, sw)}/>
  `;
  // End nodes
  const nodes = `
    <circle cx="30" cy="20" r="5" ${paint(s, ink)}/>
    <circle cx="80" cy="30" r="5" ${paint(s, ink)}/>
    <circle cx="70" cy="80" r="5" ${paint(s, ink)}/>
    <circle cx="20" cy="70" r="5" ${paint(s, ink)}/>
  `;
  return `<g>${center}${paths}${nodes}</g>`;
}

function codebracket(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(6 * s.thickness + 2);
  const r = f(s.rounding * 6);
  // Left bracket <
  const left = `<path d="M35 25 L15 50 L35 75" ${strokeAttrs(s, ink, sw)}/>`;
  // Right bracket >
  const right = `<path d="M65 25 L85 50 L65 75" ${strokeAttrs(s, acc, sw)}/>`;
  // Slash /
  const slash = `<line x1="55" y1="20" x2="45" y2="80" ${strokeAttrs(s, ink, f(sw * 0.7))}/>`;
  return `<g>${left}${right}${slash}</g>`;
}

function network(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(3 * s.thickness + 1);
  // Central hub
  const hub = `<circle cx="50" cy="50" r="10" ${paint(s, acc)}/>`;
  // Outer nodes
  const n = clamp(Math.round(s.count), 3, 6);
  let nodes = '';
  let lines = '';
  for (let i = 0; i < n; i++) {
    const angle = rad((i * 360) / n - 90);
    const x = 50 + 35 * Math.cos(angle);
    const y = 50 + 35 * Math.sin(angle);
    lines += `<line x1="50" y1="50" x2="${f(x)}" y2="${f(y)}" ${strokeAttrs(s, ink, sw)}/>`;
    nodes += `<circle cx="${f(x)}" cy="${f(y)}" r="7" ${paint(s, ink)}/>`;
  }
  return `<g>${lines}${hub}${nodes}</g>`;
}

// Health marks
function medcross(s: MarkSpec, ink: string, acc: string): string {
  const attrs = paint(s, ink);
  const r = f(s.rounding * 6);
  // Vertical bar
  const v = `<rect x="40" y="15" width="20" height="70" rx="${r}" ${attrs}/>`;
  // Horizontal bar
  const h = `<rect x="15" y="40" width="70" height="20" rx="${r}" ${attrs}/>`;
  return `<g>${v}${h}</g>`;
}

function heartpulse(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(4 * s.thickness + 2);
  // Heart shape
  const heart = `<path d="M50 80 C20 60 10 40 20 25 C30 10 45 15 50 30 C55 15 70 10 80 25 C90 40 80 60 50 80Z" ${paint(s, ink)}/>`;
  // Pulse line
  const pulse = `<path d="M20 50 L35 50 L40 35 L50 65 L60 45 L65 50 L80 50" fill="none" stroke="${acc}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<g>${heart}${pulse}</g>`;
}

function dna(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(3.5 * s.thickness + 1.5);
  const n = clamp(Math.round(s.count), 3, 6);
  let strands = '';
  // Double helix
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const y = 15 + t * 70;
    const x1 = 50 + 20 * Math.sin(t * Math.PI * 2);
    const x2 = 50 - 20 * Math.sin(t * Math.PI * 2);
    if (i === 0) {
      strands += `<path d="M${f(x1)} ${f(y)}`;
    } else {
      strands += ` L${f(x1)} ${f(y)}`;
    }
  }
  strands += `" ${strokeAttrs(s, ink, sw)}/>`;
  
  let strands2 = '';
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const y = 15 + t * 70;
    const x2 = 50 - 20 * Math.sin(t * Math.PI * 2);
    if (i === 0) {
      strands2 += `<path d="M${f(x2)} ${f(y)}`;
    } else {
      strands2 += ` L${f(x2)} ${f(y)}`;
    }
  }
  strands2 += `" ${strokeAttrs(s, acc, sw)}/>`;
  
  // Connecting bars
  let bars = '';
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const y = 15 + t * 70;
    const x1 = 50 + 20 * Math.sin(t * Math.PI * 2);
    const x2 = 50 - 20 * Math.sin(t * Math.PI * 2);
    bars += `<line x1="${f(x1)}" y1="${f(y)}" x2="${f(x2)}" y2="${f(y)}" ${strokeAttrs(s, ink, f(sw * 0.6))}/>`;
  }
  
  return `<g>${strands}${strands2}${bars}</g>`;
}

// Finance marks
function chart(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(4 * s.thickness + 1.5);
  const n = clamp(Math.round(s.count), 3, 5);
  let bars = '';
  const barWidth = 60 / n;
  for (let i = 0; i < n; i++) {
    const h = 20 + (i / (n - 1)) * 50;
    const x = 20 + i * barWidth;
    const color = i === n - 1 ? acc : ink;
    bars += `<rect x="${f(x)}" y="${f(85 - h)}" width="${f(barWidth * 0.7)}" height="${f(h)}" rx="${f(s.rounding * 3)}" ${paint(s, color)}/>`;
  }
  // Trend line
  const trend = `<path d="M20 70 L40 55 L60 45 L80 25" fill="none" stroke="${acc}" stroke-width="${sw}" stroke-linecap="round"/>`;
  return `<g>${bars}${trend}</g>`;
}

function shield(s: MarkSpec, ink: string, acc: string): string {
  const attrs = paint(s, ink);
  const sw = f(3 * s.thickness + 1);
  // Shield outline
  const outline = `<path d="M50 10 L85 25 L85 55 C85 75 70 88 50 95 C30 88 15 75 15 55 L15 25 Z" ${attrs}/>`;
  // Checkmark
  const check = `<path d="M35 50 L45 62 L68 38" fill="none" stroke="${acc}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<g>${outline}${check}</g>`;
}

function coin(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(4 * s.thickness + 1);
  // Outer circle
  const outer = `<circle cx="50" cy="50" r="38" fill="none" stroke="${ink}" stroke-width="${sw}"/>`;
  // Inner circle
  const inner = `<circle cx="50" cy="50" r="28" fill="none" stroke="${ink}" stroke-width="${f(sw * 0.6)}"/>`;
  // Dollar sign or currency symbol
  const symbol = `<text x="50" y="62" text-anchor="middle" font-size="32" font-weight="bold" fill="${acc}">$</text>`;
  return `<g>${outer}${inner}${symbol}</g>`;
}

// Education marks
function book(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(3.5 * s.thickness + 1.5);
  // Left page
  const left = `<path d="M50 20 L50 80 L20 75 L20 15 Z" ${paint(s, ink)}/>`;
  // Right page
  const right = `<path d="M50 20 L50 80 L80 75 L80 15 Z" fill="${acc}" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  // Spine
  const spine = `<line x1="50" y1="20" x2="50" y2="80" stroke="${ink}" stroke-width="${sw}"/>`;
  return `<g>${left}${right}${spine}</g>`;
}

function gradcap(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(3 * s.thickness + 1);
  // Cap top (diamond)
  const top = `<path d="M50 20 L85 35 L50 50 L15 35 Z" ${paint(s, ink)}/>`;
  // Cap base
  const base = `<path d="M25 40 L25 60 Q50 75 75 60 L75 40" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  // Tassel
  const tassel = `<line x1="75" y1="35" x2="85" y2="55" stroke="${acc}" stroke-width="${f(sw * 1.2)}" stroke-linecap="round"/>
    <circle cx="85" cy="58" r="4" fill="${acc}"/>`;
  return `<g>${top}${base}${tassel}</g>`;
}

function quill(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(3 * s.thickness + 1);
  // Feather body
  const feather = `<path d="M70 15 Q50 30 40 50 Q35 65 30 80 L35 78 Q40 65 45 55 Q55 35 75 20 Z" ${paint(s, ink)}/>`;
  // Quill tip
  const tip = `<path d="M30 80 L25 90 L32 85 Z" fill="${acc}"/>`;
  // Feather details
  const details = `<path d="M55 30 Q45 40 40 50" fill="none" stroke="${acc}" stroke-width="${f(sw * 0.6)}"/>
    <path d="M60 25 Q50 35 45 45" fill="none" stroke="${acc}" stroke-width="${f(sw * 0.6)}"/>`;
  return `<g>${feather}${tip}${details}</g>`;
}

// Real Estate marks
function house(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(3.5 * s.thickness + 1.5);
  // Roof
  const roof = `<path d="M50 15 L85 45 L15 45 Z" ${paint(s, ink)}/>`;
  // Walls
  const walls = `<rect x="25" y="45" width="50" height="40" ${paint(s, acc !== ink ? acc : ink, acc !== ink ? 1 : 0.3)}/>`;
  // Door
  const door = `<rect x="42" y="60" width="16" height="25" rx="${f(s.rounding * 3)}" fill="${ink}"/>`;
  return `<g>${roof}${walls}${door}</g>`;
}

function key(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(4 * s.thickness + 1);
  // Key head (circle)
  const head = `<circle cx="30" cy="50" r="15" fill="none" stroke="${ink}" stroke-width="${sw}"/>`;
  // Key shaft
  const shaft = `<line x1="45" y1="50" x2="85" y2="50" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`;
  // Key teeth
  const teeth = `<line x1="70" y1="50" x2="70" y2="60" stroke="${acc}" stroke-width="${f(sw * 0.8)}" stroke-linecap="round"/>
    <line x1="80" y1="50" x2="80" y2="58" stroke="${acc}" stroke-width="${f(sw * 0.8)}" stroke-linecap="round"/>`;
  return `<g>${head}${shaft}${teeth}</g>`;
}

function building(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(3 * s.thickness + 1);
  // Main building
  const main = `<rect x="25" y="30" width="50" height="55" ${paint(s, ink)}/>`;
  // Windows
  let windows = '';
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = 32 + col * 14;
      const y = 38 + row * 15;
      windows += `<rect x="${x}" y="${y}" width="8" height="10" fill="${acc}"/>`;
    }
  }
  return `<g>${main}${windows}</g>`;
}

// Fitness marks
function dumbbell(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(4 * s.thickness + 1);
  // Left weight
  const left = `<rect x="15" y="35" width="15" height="30" rx="${f(s.rounding * 4)}" ${paint(s, ink)}/>`;
  // Bar
  const bar = `<rect x="30" y="45" width="40" height="10" ${paint(s, acc)}/>`;
  // Right weight
  const right = `<rect x="70" y="35" width="15" height="30" rx="${f(s.rounding * 4)}" ${paint(s, ink)}/>`;
  return `<g>${left}${bar}${right}</g>`;
}

function trophy(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(3 * s.thickness + 1);
  // Cup
  const cup = `<path d="M30 20 L70 20 L65 50 Q50 65 35 50 Z" ${paint(s, ink)}/>`;
  // Handles
  const handles = `<path d="M30 25 Q15 30 20 45 Q25 50 35 45" fill="none" stroke="${ink}" stroke-width="${sw}"/>
    <path d="M70 25 Q85 30 80 45 Q75 50 65 45" fill="none" stroke="${ink}" stroke-width="${sw}"/>`;
  // Base
  const base = `<rect x="40" y="65" width="20" height="5" ${paint(s, acc)}/>`;
  const stem = `<rect x="47" y="55" width="6" height="12" fill="${acc}"/>`;
  return `<g>${cup}${handles}${stem}${base}</g>`;
}

// Beauty marks
function scissors(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(3.5 * s.thickness + 1.5);
  // Left blade
  const left = `<path d="M30 20 L50 50 L30 80" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`;
  // Right blade
  const right = `<path d="M70 20 L50 50 L70 80" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`;
  // Handles
  const handles = `<circle cx="30" cy="20" r="8" fill="none" stroke="${acc}" stroke-width="${f(sw * 0.8)}"/>
    <circle cx="70" cy="20" r="8" fill="none" stroke="${acc}" stroke-width="${f(sw * 0.8)}"/>`;
  // Pivot
  const pivot = `<circle cx="50" cy="50" r="4" fill="${acc}"/>`;
  return `<g>${left}${right}${handles}${pivot}</g>`;
}

function lipstick(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(3 * s.thickness + 1);
  // Tube body
  const body = `<rect x="38" y="45" width="24" height="40" rx="${f(s.rounding * 3)}" ${paint(s, ink)}/>`;
  // Cap
  const cap = `<rect x="38" y="25" width="24" height="22" rx="${f(s.rounding * 3)}" fill="${acc}" stroke="${ink}" stroke-width="${sw}"/>`;
  // Lipstick tip
  const tip = `<path d="M42 25 L50 10 L58 25 Z" fill="${acc}"/>`;
  return `<g>${body}${cap}${tip}</g>`;
}

// Music marks
function musicnote(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(4 * s.thickness + 1);
  // Note head
  const head = `<ellipse cx="35" cy="70" rx="12" ry="9" transform="rotate(-20 35 70)" ${paint(s, ink)}/>`;
  // Stem
  const stem = `<line x1="47" y1="68" x2="47" y2="20" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`;
  // Flag
  const flag = `<path d="M47 20 Q65 30 60 45" fill="none" stroke="${acc}" stroke-width="${sw}" stroke-linecap="round"/>`;
  return `<g>${head}${stem}${flag}</g>`;
}

function microphone(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(3.5 * s.thickness + 1.5);
  // Mic head
  const head = `<ellipse cx="50" cy="35" rx="18" ry="22" fill="none" stroke="${ink}" stroke-width="${sw}"/>`;
  // Grille lines
  let grille = '';
  for (let i = 0; i < 4; i++) {
    const y = 25 + i * 7;
    grille += `<line x1="38" y1="${y}" x2="62" y2="${y}" stroke="${acc}" stroke-width="${f(sw * 0.5)}"/>`;
  }
  // Stand
  const stand = `<line x1="50" y1="57" x2="50" y2="85" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`;
  const base = `<line x1="35" y1="85" x2="65" y2="85" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`;
  return `<g>${head}${grille}${stand}${base}</g>`;
}

// Travel marks
function compass(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(3 * s.thickness + 1);
  // Outer circle
  const outer = `<circle cx="50" cy="50" r="38" fill="none" stroke="${ink}" stroke-width="${sw}"/>`;
  // Compass needle
  const needle = `<path d="M50 20 L55 50 L50 80 L45 50 Z" ${paint(s, acc)}/>`;
  // Cardinal points
  const points = `<text x="50" y="15" text-anchor="middle" font-size="10" font-weight="bold" fill="${ink}">N</text>
    <text x="50" y="92" text-anchor="middle" font-size="10" font-weight="bold" fill="${ink}">S</text>
    <text x="12" y="54" text-anchor="middle" font-size="10" font-weight="bold" fill="${ink}">W</text>
    <text x="88" y="54" text-anchor="middle" font-size="10" font-weight="bold" fill="${ink}">E</text>`;
  return `<g>${outer}${needle}${points}</g>`;
}

function airplane(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(3 * s.thickness + 1);
  // Fuselage
  const body = `<path d="M20 50 L80 50 L85 48 L85 52 L80 50" ${paint(s, ink)}/>`;
  // Wings
  const wings = `<path d="M45 50 L35 30 L55 45 Z" fill="${acc}"/>
    <path d="M45 50 L35 70 L55 55 Z" fill="${acc}"/>`;
  // Tail
  const tail = `<path d="M20 50 L15 40 L25 48 Z" fill="${ink}"/>`;
  return `<g>${body}${wings}${tail}</g>`;
}

// Photography marks
function aperture(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(3 * s.thickness + 1);
  const n = clamp(Math.round(s.count), 5, 8);
  // Outer circle
  const outer = `<circle cx="50" cy="50" r="40" fill="none" stroke="${ink}" stroke-width="${sw}"/>`;
  // Aperture blades
  let blades = '';
  for (let i = 0; i < n; i++) {
    const angle = rad((i * 360) / n);
    const x1 = 50 + 15 * Math.cos(angle);
    const y1 = 50 + 15 * Math.sin(angle);
    const x2 = 50 + 35 * Math.cos(angle + 0.3);
    const y2 = 50 + 35 * Math.sin(angle + 0.3);
    blades += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${acc}" stroke-width="${f(sw * 0.8)}" stroke-linecap="round"/>`;
  }
  // Center
  const center = `<circle cx="50" cy="50" r="8" fill="${acc}"/>`;
  return `<g>${outer}${blades}${center}</g>`;
}

// Architecture marks
function columns(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(3 * s.thickness + 1);
  const n = clamp(Math.round(s.count), 2, 4);
  let cols = '';
  const spacing = 60 / (n - 1 || 1);
  for (let i = 0; i < n; i++) {
    const x = 20 + i * spacing;
    cols += `<rect x="${f(x - 4)}" y="30" width="8" height="50" ${paint(s, ink)}/>`;
    // Capital
    cols += `<rect x="${f(x - 6)}" y="25" width="12" height="5" rx="${f(s.rounding * 2)}" fill="${acc}"/>`;
    // Base
    cols += `<rect x="${f(x - 6)}" y="80" width="12" height="5" rx="${f(s.rounding * 2)}" fill="${acc}"/>`;
  }
  // Roof
  const roof = `<path d="M15 25 L50 10 L85 25 Z" ${paint(s, ink)}/>`;
  return `<g>${roof}${cols}</g>`;
}

// Legal marks
function scales(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(3 * s.thickness + 1);
  // Central pillar
  const pillar = `<line x1="50" y1="20" x2="50" y2="85" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`;
  // Beam
  const beam = `<line x1="20" y1="35" x2="80" y2="35" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`;
  // Left pan
  const left = `<path d="M20 35 L15 55 L25 55 Z" fill="${acc}"/>`;
  // Right pan
  const right = `<path d="M80 35 L75 55 L85 55 Z" fill="${acc}"/>`;
  // Base
  const base = `<rect x="40" y="85" width="20" height="5" rx="${f(s.rounding * 2)}" fill="${ink}"/>`;
  return `<g>${pillar}${beam}${left}${right}${base}</g>`;
}

function pillar(s: MarkSpec, ink: string, acc: string): string {
  const sw = f(3 * s.thickness + 1);
  // Main column
  const column = `<rect x="40" y="25" width="20" height="60" ${paint(s, ink)}/>`;
  // Capital (top)
  const capital = `<rect x="35" y="18" width="30" height="7" rx="${f(s.rounding * 2)}" fill="${acc}"/>`;
  // Base
  const base = `<rect x="35" y="85" width="30" height="7" rx="${f(s.rounding * 2)}" fill="${acc}"/>`;
  // Fluting details
  let fluting = '';
  for (let i = 0; i < 3; i++) {
    const x = 45 + i * 5;
    fluting += `<line x1="${x}" y1="30" x2="${x}" y2="80" stroke="${acc}" stroke-width="${f(sw * 0.3)}"/>`;
  }
  return `<g>${column}${capital}${base}${fluting}</g>`;
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
  // Creative/Media
  { kind: 'camera', label: 'Camera' },
  { kind: 'clapper', label: 'Clapper' },
  { kind: 'filmreel', label: 'Film Reel' },
  { kind: 'musicnote', label: 'Music Note' },
  { kind: 'microphone', label: 'Microphone' },
  { kind: 'aperture', label: 'Aperture' },
  // Food/Hospitality
  { kind: 'forkplate', label: 'Fork & Plate' },
  { kind: 'chefhat', label: 'Chef Hat' },
  // Tech
  { kind: 'circuit', label: 'Circuit' },
  { kind: 'codebracket', label: 'Code' },
  { kind: 'network', label: 'Network' },
  // Health
  { kind: 'medcross', label: 'Medical Cross' },
  { kind: 'heartpulse', label: 'Heart Pulse' },
  { kind: 'dna', label: 'DNA' },
  // Finance
  { kind: 'chart', label: 'Chart' },
  { kind: 'shield', label: 'Shield' },
  { kind: 'coin', label: 'Coin' },
  // Education
  { kind: 'book', label: 'Book' },
  { kind: 'gradcap', label: 'Grad Cap' },
  { kind: 'quill', label: 'Quill' },
  // Real Estate
  { kind: 'house', label: 'House' },
  { kind: 'key', label: 'Key' },
  { kind: 'building', label: 'Building' },
  // Fitness/Sports
  { kind: 'dumbbell', label: 'Dumbbell' },
  { kind: 'trophy', label: 'Trophy' },
  // Beauty/Fashion
  { kind: 'scissors', label: 'Scissors' },
  { kind: 'lipstick', label: 'Lipstick' },
  // Travel
  { kind: 'compass', label: 'Compass' },
  { kind: 'airplane', label: 'Airplane' },
  // Architecture
  { kind: 'columns', label: 'Columns' },
  // Legal
  { kind: 'scales', label: 'Scales' },
  { kind: 'pillar', label: 'Pillar' },
  // AI-generated
  { kind: 'custom', label: 'AI Custom' },
];
