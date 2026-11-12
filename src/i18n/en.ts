export const en = {
  nav: {
    features: 'Features',
    howItWorks: 'How It Works',
    examples: 'Examples',
    faq: 'FAQ',
    startCreating: 'Start Creating',
    myProjects: 'My Projects',
    signIn: 'Sign In',
    signOut: 'Sign Out',
  },
  hero: {
    headline: 'Build a brand that feels like yours.',
    subheadline: 'Create a complete, editable brand identity from a personalized brief. Export everything you need — logo, colors, typography, and brandbook.',
    startScratch: 'Start from scratch',
    uploadLogo: 'Upload a logo',
    importLink: 'Import a link',
    viewDemo: 'View Demo →',
    freeStart: 'Free to start',
    noCreditCard: 'No credit card required',
    exportAnytime: 'Export anytime',
  },
  howItWorks: {
    title: 'How it works',
    subtitle: 'Four simple steps to your complete brand identity.',
    fast: 'Complete your brand identity in under 10 minutes',
    steps: {
      brief: { title: 'Brief', desc: 'Tell us about your brand with a personalized discovery form.' },
      generate: { title: 'Generate', desc: 'Get AI-powered logo, colors, typography and brand DNA.' },
      refine: { title: 'Refine', desc: 'Edit everything until it feels right.' },
      publish: { title: 'Publish', desc: 'Export your brandbook and assets.' },
    },
  },
  features: {
    title: 'Everything you need',
    visualFoundation: {
      title: 'Visual Foundation',
      desc: 'Logo compositions, harmonious color palettes, and typography that supports both Latin and Cyrillic.',
    },
    brandDNA: {
      title: 'Brand DNA',
      desc: 'Mission, vision, values, voice, and positioning — grounded in your brief, not fabricated.',
    },
    assetManager: {
      title: 'Brand Asset Manager',
      desc: 'Upload, organize, and export all your brand assets in one place.',
    },
    brandbook: {
      title: 'Brandbook Builder',
      desc: 'Auto-assemble a complete, editable brandbook. Export to PDF.',
    },
  },
  faq: {
    title: 'Frequently asked questions',
    items: [
      { q: 'Do I need to create an account?', a: 'No. You can use Brando as a guest. Your work is saved locally in your browser.' },
      { q: 'Can I use it in Mongolian?', a: 'Yes! Brando is fully bilingual — switch between English and Mongolian anytime.' },
      { q: 'What if I already have a logo?', a: 'Upload it and we\'ll use it as context. You can still generate complementary colors, typography and brand DNA.' },
      { q: 'Is my data private?', a: 'Guest data stays in your browser. We don\'t upload anything to servers unless you choose to share.' },
    ],
  },
  footer: {
    tagline: 'AI Brand Identity Studio',
    rights: '© 2026 Brando. All rights reserved.',
    cta: {
      title: 'Ready to build your brand?',
      subtitle: 'Join thousands of brands using Brando to create their identity.',
    },
    product: 'Product',
    resources: 'Resources',
    connect: 'Connect',
    startFree: 'Start free',
    viewDemo: 'View demo',
    contact: 'Contact',
    privacy: 'Privacy',
    terms: 'Terms',
    madeWith: 'Made with',
    forCreators: 'for creators',
  },
  common: {
    language: 'Language',
    english: 'English',
    mongolian: 'Монгол',
  },
};

export type Translation = typeof en;
