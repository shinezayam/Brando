// AI-powered logo generation - client-side wrapper for the API route
import type { LogoDesign, LogoLayout } from './types';

export interface AIGenerationOptions {
  description: string;
  brandName: string;
  industry?: string;
  style?: string;
  colors?: string[];
}

export interface AIGenerationResult {
  designs: LogoDesign[];
  error?: string;
}

interface AIDesignResponse {
  symbol_svg: string;
  concept: string;
  style: string;
  suggested_layout: LogoLayout;
}

function selectFont(description: string): { fontId: string; weight: 400 | 700; casing: 'upper' | 'lower' | 'title' } {
  const lower = description.toLowerCase();
  
  if (lower.includes('tech') || lower.includes('modern') || lower.includes('digital') || lower.includes('startup')) {
    return { fontId: 'space-grotesk', weight: 700, casing: 'lower' };
  }
  if (lower.includes('elegan') || lower.includes('luxury') || lower.includes('premium') || lower.includes('fashion')) {
    return { fontId: 'playfair', weight: 400, casing: 'title' };
  }
  if (lower.includes('bold') || lower.includes('strong') || lower.includes('powerful')) {
    return { fontId: 'unbounded', weight: 700, casing: 'upper' };
  }
  if (lower.includes('friendly') || lower.includes('warm') || lower.includes('casual')) {
    return { fontId: 'manrope', weight: 400, casing: 'title' };
  }
  if (lower.includes('professional') || lower.includes('corporate') || lower.includes('business')) {
    return { fontId: 'inter', weight: 700, casing: 'title' };
  }
  return { fontId: 'montserrat', weight: 700, casing: 'title' };
}

function inferColors(description: string, suggestedColors?: string[]): { primary: string; accent: string } {
  const colorMap: Record<string, string> = {
    blue: '#2563eb',
    red: '#dc2626',
    green: '#16a34a',
    purple: '#9333ea',
    orange: '#ea580c',
    yellow: '#ca8a04',
    pink: '#db2777',
    black: '#111111',
    gray: '#4b5563',
    teal: '#0d9488',
    indigo: '#4f46e5',
  };
  
  const lower = description.toLowerCase();
  let primary = suggestedColors?.[0] || '#2563eb';
  let accent = suggestedColors?.[1] || '#9333ea';
  
  for (const [name, hex] of Object.entries(colorMap)) {
    if (lower.includes(name)) {
      primary = hex;
      break;
    }
  }
  
  if (!suggestedColors?.[1]) {
    accent = primary === '#2563eb' ? '#9333ea' : '#2563eb';
  }
  
  return { primary, accent };
}

function convertToDesign(
  item: AIDesignResponse,
  brandName: string,
  description: string,
  colors: { primary: string; accent: string }
): LogoDesign {
  const font = selectFont(description);
  
  // Extract inner SVG content (without the <svg> wrapper)
  const innerMatch = item.symbol_svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  const innerContent = innerMatch ? innerMatch[1].trim() : item.symbol_svg;
  
  return {
    version: 1,
    concept: item.concept || 'AI-generated logo',
    layout: item.suggested_layout || 'horizontal',
    gap: (item.suggested_layout || 'horizontal') === 'stacked' ? 0.8 : 0.6,
    mark: {
      kind: 'custom',
      container: 'none',
      count: 1,
      rotation: 0,
      rounding: 0.5,
      style: 'solid',
      thickness: 1,
      scale: 1,
      color: colors.primary,
      accent: colors.accent,
      customSvg: innerContent,
    },
    word: {
      text: brandName,
      fontId: font.fontId,
      weight: font.weight,
      tracking: font.casing === 'upper' ? 120 : 0,
      casing: font.casing,
      color: '#111111',
    },
    tagline: {
      show: false,
      text: '',
      color: '#111111',
    },
  };
}

export async function generateWithAI(
  options: AIGenerationOptions,
  count: number = 4
): Promise<AIGenerationResult> {
  try {
    const response = await fetch('/api/logo/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: options.description,
        brandName: options.brandName,
        industry: options.industry,
        style: options.style,
        colors: options.colors,
        count,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { designs: [], error: data.error || 'Generation failed' };
    }

    if (!data.designs || !Array.isArray(data.designs) || data.designs.length === 0) {
      return { designs: [], error: 'No logos generated. Try a different description.' };
    }

    const inferredColors = inferColors(options.description, options.colors);
    const designs: LogoDesign[] = data.designs.map((item: AIDesignResponse) =>
      convertToDesign(item, options.brandName, options.description, inferredColors)
    );

    return { designs };
  } catch (error) {
    return {
      designs: [],
      error: error instanceof Error ? error.message : 'AI generation failed',
    };
  }
}

export async function isAIConfigured(): Promise<boolean> {
  try {
    const response = await fetch('/api/logo/generate');
    const data = await response.json();
    return data.configured === true;
  } catch {
    return false;
  }
}
