# Brando — AI Brand Identity Studio

> A bilingual (English / Mongolian), minimal SaaS platform that turns a personalized brand brief into a coherent, editable identity and brandbook.

## 1. Product vision
Brando helps founders, small businesses, designers and agencies create, refine, organize and share a complete brand identity. The user can start from scratch, upload a logo, or import a website/social URL. Every path leads through a five-step discovery questionnaire before generating personalized results.

**Hackathon constraint:** three days. Build a working end-to-end demo before advanced AI features. Never present nonfunctional buttons as complete features.

## 2. Inspiration (not cloning)
- https://www.recraft.ai — creative tooling and workspace patterns.
- https://mylogo.review — guided brand assessment, personality questions and branding workflow.
- https://ubrand.com — approachable brand management.
- https://coolors.co — fast color palette generation, locking and editing.

Use original layout, copy, visual assets and interactions. References inform UX only.

## 3. Core principles
1. Personalized outcomes are grounded in the user's discovery answers.
2. Every generated result is editable, saveable and exportable.
3. English and Mongolian have complete, consistent UI translations.
4. Guest mode works without signup; optional account upgrade can come later.
5. The interface is minimal, responsive and accessible.
6. Work must persist between page reloads.

## 4. Landing page
Build a complete responsive landing page with:
- Sticky navigation: Brando, Features, How It Works, Examples, FAQ, EN/MN, Start Creating.
- Hero headline and short supporting description, with three prominent actions: **Start from scratch**, **Upload a logo**, **Import a link**.
- Live-looking but genuinely interactive demo preview, if time allows.
- How it works: Brief → Generate → Refine → Publish.
- Feature sections: Visual Foundation, Brand DNA, Brand Asset Manager, Brandbook.
- Showcase examples (clearly labeled demo examples), audience/use cases, FAQ and footer.
- Functional navigation, language switch, and CTA links.

## 5. User journeys
### A. Start from scratch
Landing → discovery form → generate identity → editor → save/export.

### B. Upload existing logo
Landing → upload PNG/JPEG/SVG → preview and store → discovery form (logo context preserved) → workspace. Uploaded raster logos are treated as image assets, not falsely described as fully editable vectors.

### C. Import URL
Landing → paste website or public social URL → validate URL → fetch permitted public metadata (title, description, favicon, OG image) when accessible → prefill editable discovery fields → user reviews form → workspace. Social networks may block scraping; show a graceful manual-entry fallback. Do not promise access to private content.

## 6. Five-step personalized Brand Discovery Form
Always show this form before first generation. Show progress, back/next, validation and autosave. Support optional skips for nonessential fields.

### Step 1 — Business basics
Brand name (required), tagline (optional), industry (required), product/service, description, brand stage (new/existing), language preference.

### Step 2 — Audience and positioning
Target customers, location/market, competitors, differentiation, price positioning, brand promise and primary business goal.

### Step 3 — Brand personality
Six sliders (0–100) with meaningful bipolar labels: Serious ↔ Playful; Casual ↔ Formal; Classic ↔ Contemporary; Quiet ↔ Bold; Reserved ↔ Warm; Accessible ↔ Premium. Include optional descriptive adjectives.

### Step 4 — Visual preferences
Preferred/avoided colors, logo style (wordmark, monogram, symbol, combination), type preference, reference URLs, uploaded inspiration. Existing logo is shown here if provided.

### Step 5 — Goals and applications
Where identity will appear: web, social, print, packaging, presentation, signage. Deliverable priorities, review/edit answers, then Generate Brand.

Store brief as structured JSON with versioning. Generation must reference actual answers, not invent company facts.

## 7. Workspace navigation
Sidebar: Overview, Visual Foundation (Logo, Colors, Typography), Brand DNA, Assets, Brandbook, Settings. Top bar: project name, language switch, save status, export, share. Show loading/error/empty states.

## 8. Visual Foundation — Logo
- Generate initial editable **SVG-based** wordmark/monogram/logo compositions from deterministic templates using brand name, initials, type, palette and layout.
- Offer 3–6 distinct options; edit text, font, size, spacing, icon from a safe library, colors, arrangement and background.
- Undo/redo where practical; save variants and select primary logo.
- Export SVG and PNG. Preserve original uploaded logo as an asset.
- Do not claim AI-generated custom vector artwork unless an actual generation pipeline is integrated.

## 9. Visual Foundation — Color studio (Coolors-inspired)
- Display 3–6 swatches as a wide palette strip.
- Generate harmonious palettes via deterministic color algorithms; regenerate unlocked swatches while preserving locked ones.
- Edit HEX, RGB and HSL; validate inputs; copy HEX.
- Assign semantic roles: Primary, Secondary, Accent, Background, Text.
- Show text/background contrast ratios with WCAG AA/AAA indicators where applicable.
- Save palettes, view history, restore, export CSS variables and JSON.
- Palette changes update logo previews and brandbook consistently.

## 10. Visual Foundation — Typography
Offer curated, appropriately licensed web-safe/open-source fonts supporting Latin and Cyrillic. Preview headings and body copy in English and Mongolian. Choose heading/body fonts, weights and sizes. Save type scale and export CSS tokens. Verify Cyrillic glyph coverage before recommending fonts.

## 11. Brand DNA (Qwen)
Generate editable, brief-grounded:
- Brand essence and positioning statement
- Story (do not fabricate history)
- Mission, vision and 3–5 values
- Audience summary and differentiators
- Voice/tone traits, messaging pillars and tagline options
- Short strategy summary

Generate structured JSON using a server-side Qwen API adapter. Validate response schema (Zod); handle malformed responses, timeouts and retries. Store generation provenance and allow regenerate per section. Never expose API keys in browser code. If no API key, use a clearly labeled deterministic demo generator grounded in the form.

## 12. Brand Asset Manager
Upload and organize SVG/PNG/JPEG/WebP assets; preview, rename, tag, search, filter, favorite, duplicate, delete and download. Group by Logos, Colors, Typography, Images, Mockups, Documents. Save generated variations. Protect uploads by type/size checks; sanitize SVG or restrict unsafe SVG rendering. Guest data is local; cloud sharing requires backend storage and access controls.

## 13. Brandbook builder
Automatically assemble a readable, editable brandbook with: cover, brand overview, strategy, mission/vision/values, primary and secondary logos, clear space/minimum-size guidance (only if supported), palette and usage, typography, tone of voice, examples and assets. Allow section toggles, editing, reorder if feasible, preview and export to PDF. Ensure Mongolian Cyrillic renders in exports. PDF export must work in demo mode.

## 14. Sharing and client brief (stretch)
Optional agency flow: generate a public client questionnaire link; client completes form; create project from responses. Requires server persistence, expiring tokens, abuse prevention and permissions. For the 3-day MVP, prioritize downloadable brandbook and local project export/import over public sharing. Do not implement insecure anonymous edit links.

## 15. Internationalization
Use `next-intl` or equivalent, with `en` and `mn` dictionaries and locale-aware routing or state. All navigation, validation, forms, empty states and export labels should be translated. User-authored content should never be silently translated. Allow generating Brand DNA in the selected output language.

## 16. Recommended stack
- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui or accessible Radix primitives
- Zustand or React context for editor state
- Zod + React Hook Form for validation
- `next-intl` for EN/MN
- IndexedDB (Dexie) for guest project persistence and binary assets; localStorage only for small preferences
- SVG/Canvas utilities for logo preview and PNG export
- Server-side Qwen integration (Alibaba Cloud compatible endpoint; configured through env)
- PDF generation with `@react-pdf/renderer` or browser print-to-PDF fallback, tested for Cyrillic
- Optional Supabase for authentication and cloud persistence **after** core MVP

Use current compatible stable packages; inspect existing repository before installing or changing anything.

## 17. Suggested data model
```ts
type BrandProject = {
  id: string;
  name: string;
  locale: 'en' | 'mn';
  source: 'scratch' | 'logo' | 'url';
  sourceUrl?: string;
  brief: BrandBrief;
  dna?: BrandDNA;
  palette: ColorSwatch[];
  typography: { headingFont: string; bodyFont: string };
  logos: LogoVariant[];
  assets: BrandAsset[];
  brandbook: BrandbookDocument;
  createdAt: string;
  updatedAt: string;
};
```
Use stable IDs, schema version and migration handling. Never store API secrets in project state.

## 18. API contracts
- `POST /api/brand/generate` — validated brief + locale → structured BrandDNA; rate limit and return clear errors.
- `POST /api/import/metadata` — validated public URL → safe title/description/OG metadata; guard against SSRF, localhost/private IPs, redirects to private addresses and oversized responses.
- `POST /api/brand/taglines` (optional) — brief + existing DNA → alternatives.

For guest projects, local persistence and client-side palette/logo tools do not require server APIs.

## 19. Routes
- `/` landing
- `/start` choose entry path
- `/onboarding` five-step form
- `/studio/[projectId]` overview
- `/studio/[projectId]/logo`
- `/studio/[projectId]/colors`
- `/studio/[projectId]/typography`
- `/studio/[projectId]/dna`
- `/studio/[projectId]/assets`
- `/studio/[projectId]/brandbook`

Use locale-aware routing if selected; keep URLs consistent.

## 20. UI design system
Minimal SaaS: bright neutral canvas, restrained accent, dark readable text, thin borders, generous spacing, consistent 8px spacing rhythm, compact cards and clear hierarchy. Avoid visually copying reference sites. Responsive desktop-first editor with usable mobile views. Keyboard focus states, semantic labels, sufficient contrast and accessible dialogs. Use a font with full Cyrillic support.

## 21. Three-day implementation schedule
### Day 1 — Foundation and onboarding
Repository audit, Next.js setup, design tokens, complete landing page, EN/MN, three start paths, URL/logo intake, five-step form with validation and autosave, demo seed project. Verify navigation and reload persistence.

### Day 2 — Identity studio
Workspace shell, deterministic logo variants and editing, Coolors-style color generator with locking, typography choices, Qwen Brand DNA endpoint and fallback, persisted state.

### Day 3 — Assets, brandbook and deployment
Asset manager, editable brandbook, PDF/SVG/PNG/CSS export, integration testing, accessibility/responsive fixes, deploy, demo rehearsal. Defer stretch sharing/complex image generation if unstable.

## 22. Definition of done / acceptance tests
1. User switches EN/MN on landing and throughout onboarding/workspace.
2. All three entry paths reach a prefilled or blank discovery form appropriately.
3. A completed brief creates a persisted project with relevant Brand DNA.
4. Demo mode works without account or Qwen key; clearly labels fallback output.
5. Logo variants can be edited, saved and exported as SVG/PNG.
6. Palette locks survive regeneration; edits and role assignments persist.
7. Typography preview includes readable Mongolian Cyrillic.
8. Assets can be uploaded, renamed, categorized and downloaded.
9. Brandbook reflects current project data and exports readable PDF.
10. Refreshing does not erase the guest project.
11. All primary buttons work; no broken placeholder links.
12. `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass.
13. A live deployment or documented local demo is available.

## 23. Environment variables
Create `.env.example` with placeholders only:
```bash
QWEN_API_KEY=
QWEN_BASE_URL=
QWEN_MODEL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
Use provider documentation to confirm current endpoint and model names. Never commit `.env.local`.

## 24. First prompt for Qwen Code
Copy the following into Qwen Code while inside the Brando project folder:

```text
You are the lead full-stack engineer and product-minded UI developer for Brando, a bilingual AI brand identity studio built for a 3-day hackathon.

Read README.md completely and treat it as the source of truth. First inspect the repository and report its current structure and installed dependencies. Do not delete existing work. Create IMPLEMENTATION_PLAN.md with day-by-day milestones and a running checklist.

Then IMPLEMENT DAY 1 immediately, not just a plan:
1. Build a polished, original, minimal SaaS landing page with fully functional navigation, EN/MN switch, hero, three entry CTAs, features, how-it-works, showcase, FAQ and footer.
2. Implement three working onboarding paths: from scratch, upload logo, import URL. For imports, validate safely and provide a manual fallback when metadata is unavailable.
3. Build the five-step personalized discovery form exactly as described in README, with sliders, validation, back/next, progress, autosave and review step.
4. Implement guest demo with a seeded brand project and persistent storage.
5. Create a responsive workspace shell and route placeholders that clearly identify features not yet implemented; do not misrepresent unfinished tools as functional.
6. Use TypeScript, accessible components, consistent styling and complete English/Mongolian strings.

Run lint, typecheck and production build; fix errors. Show files changed, tested flows, remaining tasks and the localhost URL. Continue toward Day 2 only after Day 1 passes its acceptance criteria. Ask only if a missing credential or truly blocking decision prevents progress.
```

## 25. Demo presentation storyline
1. Open minimal Brando landing page and switch language.
2. Choose a start path; complete the personalized brief.
3. Generate Brand DNA and explain how it follows the brief.
4. Edit logo, lock two colors and regenerate the rest.
5. Choose Cyrillic-friendly typography; organize assets.
6. Preview and export the completed brandbook.
7. Refresh to prove the project is saved.

## 26. Scope boundaries and honesty
The MVP should be functional within three days, not pretend to be a mature commercial platform. Uploaded raster logos are not automatically vector-editable. Importing social URLs may be blocked. Advanced collaborative sharing, generative vector graphics, billing and full cloud auth are post-hackathon features unless core flows finish early.
