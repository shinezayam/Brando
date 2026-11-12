// Layered, editable logo model. A LogoDesign is pure data: it renders
// deterministically to outlined SVG (see render.ts), so every part stays editable.

export type MarkKind =
  | 'none'
  | 'monogram'
  | 'petals'
  | 'orbit'
  | 'bars'
  | 'chevrons'
  | 'cube'
  | 'sun'
  | 'leaf'
  | 'peak'
  | 'ringcut'
  | 'quad'
  | 'wave'
  // Industry-specific marks
  | 'camera'
  | 'clapper'
  | 'filmreel'
  | 'forkplate'
  | 'chefhat'
  // Tech
  | 'circuit'
  | 'codebracket'
  | 'network'
  // Health
  | 'medcross'
  | 'heartpulse'
  | 'dna'
  // Finance
  | 'chart'
  | 'shield'
  | 'coin'
  // Education
  | 'book'
  | 'gradcap'
  | 'quill'
  // Real Estate
  | 'house'
  | 'key'
  | 'building'
  // Fitness
  | 'dumbbell'
  | 'trophy'
  // Beauty
  | 'scissors'
  | 'lipstick'
  // Music
  | 'musicnote'
  | 'microphone'
  // Travel
  | 'compass'
  | 'airplane'
  // Photography
  | 'aperture'
  // Architecture
  | 'columns'
  // Legal
  | 'scales'
  | 'pillar'
  // AI-generated
  | 'custom';

export type ContainerKind = 'none' | 'circle' | 'square' | 'rounded' | 'hex' | 'shield';
export type MarkStyle = 'solid' | 'outline';
export type LogoLayout = 'horizontal' | 'stacked' | 'mark' | 'word';
export type Casing = 'upper' | 'lower' | 'title' | 'asis';
export type Weight = 400 | 700;

export interface MarkSpec {
  kind: MarkKind;
  container: ContainerKind;
  /** repeat count (petals, bars, rays...) or pattern index (quad) */
  count: number;
  /** degrees */
  rotation: number;
  /** 0 (sharp) .. 1 (fully rounded) */
  rounding: number;
  style: MarkStyle;
  /** 0.5 .. 1.6 relative stroke thickness */
  thickness: number;
  /** relative size of the mark against the wordmark, 0.6 .. 1.6 */
  scale: number;
  color: string;
  accent: string;
  /** custom SVG content for AI-generated marks (inner SVG only, no <svg> wrapper) */
  customSvg?: string;
}

export interface WordSpec {
  text: string;
  fontId: string;
  weight: Weight;
  /** letter-spacing in 1/1000 em */
  tracking: number;
  casing: Casing;
  color: string;
}

export interface TaglineSpec {
  show: boolean;
  text: string;
  color: string;
}

export interface LogoDesign {
  version: 1;
  concept: string;
  layout: LogoLayout;
  /** gap between mark and wordmark, relative (0.2 .. 1.6) */
  gap: number;
  mark: MarkSpec;
  word: WordSpec;
  tagline: TaglineSpec;
}

/** The parts a person can keep or ask to change. */
export type PartKey = 'mark' | 'word' | 'color' | 'layout';
export const PART_KEYS: PartKey[] = ['mark', 'word', 'color', 'layout'];

export type LogoColorway = 'color' | 'dark' | 'light';
