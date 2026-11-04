// Color utility functions for palette generation and manipulation

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`.toUpperCase();
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return rgbToHex(
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  );
}

// Relative luminance (WCAG)
export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [rs, gs, bs] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// WCAG contrast ratio
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function wcagLevel(ratio: number): { aa: boolean; aaa: boolean; aaLarge: boolean } {
  return {
    aa: ratio >= 4.5,
    aaa: ratio >= 7,
    aaLarge: ratio >= 3,
  };
}

// Generate random color
export function randomHex(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`.toUpperCase();
}

// Palette generation algorithms
export function generateComplementary(hex: string): string[] {
  const hsl = hexToHsl(hex);
  if (!hsl) return [hex];
  return [
    hex,
    hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
  ];
}

export function generateAnalogous(hex: string): string[] {
  const hsl = hexToHsl(hex);
  if (!hsl) return [hex];
  return [
    hslToHex((hsl.h + 330) % 360, hsl.s, hsl.l),
    hex,
    hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
  ];
}

export function generateTriadic(hex: string): string[] {
  const hsl = hexToHsl(hex);
  if (!hsl) return [hex];
  return [
    hex,
    hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
  ];
}

export function generateSplitComplementary(hex: string): string[] {
  const hsl = hexToHsl(hex);
  if (!hsl) return [hex];
  return [
    hex,
    hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l),
  ];
}

export function generateMonochromatic(hex: string): string[] {
  const hsl = hexToHsl(hex);
  if (!hsl) return [hex];
  return [
    hslToHex(hsl.h, hsl.s, Math.max(10, hsl.l - 30)),
    hslToHex(hsl.h, hsl.s, Math.max(10, hsl.l - 15)),
    hex,
    hslToHex(hsl.h, hsl.s, Math.min(90, hsl.l + 15)),
    hslToHex(hsl.h, hsl.s, Math.min(90, hsl.l + 30)),
  ];
}

export function generateHarmony(baseHex: string, count: number): string[] {
  const hsl = hexToHsl(baseHex);
  if (!hsl) return Array.from({ length: count }, () => randomHex());

  const colors: string[] = [];
  const hueStep = 360 / count;

  for (let i = 0; i < count; i++) {
    const hue = (hsl.h + i * hueStep) % 360;
    const satVariation = Math.max(20, Math.min(90, hsl.s + (i % 2 === 0 ? 10 : -10)));
    const lightVariation = Math.max(20, Math.min(80, 40 + i * 10));
    colors.push(hslToHex(hue, satVariation, lightVariation));
  }

  return colors;
}

// Generate a full palette from a base color
export function generatePaletteFromBase(baseHex: string): string[] {
  const hsl = hexToHsl(baseHex);
  if (!hsl) return Array.from({ length: 5 }, () => randomHex());

  return [
    baseHex,
    hslToHex(hsl.h, Math.max(20, hsl.s - 20), Math.min(85, hsl.l + 30)),
    hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
    hslToHex(hsl.h, 10, 95),
    hslToHex(hsl.h, 15, 15),
  ];
}

// Determine if text should be white or black on a background
export function textColorForBg(bgHex: string): string {
  const lum = relativeLuminance(bgHex);
  return lum > 0.179 ? '#000000' : '#FFFFFF';
}

// Validate hex color
export function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

// Normalize hex input
export function normalizeHex(input: string): string | null {
  let cleaned = input.trim().replace('#', '');
  if (cleaned.length === 3) {
    cleaned = cleaned[0] + cleaned[0] + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2];
  }
  if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return `#${cleaned.toUpperCase()}`;
  }
  return null;
}
