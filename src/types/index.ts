export type BrandSource = 'scratch' | 'logo' | 'url';

export type BrandBrief = {
  // Step 1 - Business basics
  brandName: string;
  tagline?: string;
  industry: string;
  product?: string;
  description?: string;
  brandStage: 'new' | 'existing';
  languagePreference: 'en' | 'mn';

  // Step 2 - Audience
  targetCustomers?: string;
  location?: string;
  competitors?: string;
  differentiation?: string;
  pricePositioning?: string;
  brandPromise?: string;
  primaryGoal?: string;

  // Step 3 - Personality (0-100 sliders)
  personality: {
    seriousVsPlayful: number;
    casualVsFormal: number;
    classicVsContemporary: number;
    quietVsBold: number;
    reservedVsWarm: number;
    accessibleVsPremium: number;
  };
  adjectives?: string[];

  // Step 4 - Visual preferences
  preferredColors?: string[];
  avoidedColors?: string[];
  logoStyle?: string;
  typePreference?: string;
  references?: string[];

  // Step 5 - Applications
  applications: string[];
  deliverablePriorities?: string[];
};

export type ColorSwatch = {
  id: string;
  hex: string;
  role: 'primary' | 'secondary' | 'accent' | 'background' | 'text';
  locked: boolean;
};

export type LogoVariant = {
  id: string;
  name: string;
  svg: string;
  isPrimary: boolean;
  /** Editable layered design; absent on logos made by the old template editor. */
  design?: import('@/lib/logo/types').LogoDesign;
};

export type BrandDNA = {
  essence: string;
  positioning: string;
  story: string;
  mission: string;
  vision: string;
  values: string[];
  audienceSummary: string;
  differentiators: string[];
  voiceTraits: string[];
  messagingPillars: string[];
  taglineOptions: string[];
};

export type BrandAsset = {
  id: string;
  name: string;
  type: 'logo' | 'color' | 'typography' | 'image' | 'mockup' | 'document';
  url: string;
  tags: string[];
  favorite: boolean;
  createdAt: string;
};

export type BrandProject = {
  id: string;
  name: string;
  locale: 'en' | 'mn';
  source: BrandSource;
  sourceUrl?: string;
  sourceLogoDataUrl?: string;
  brief: BrandBrief;
  dna?: BrandDNA;
  palette: ColorSwatch[];
  typography: { headingFont: string; bodyFont: string };
  logos: LogoVariant[];
  assets: BrandAsset[];
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
};
