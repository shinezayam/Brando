# First Qwen Terminal Prompt — Brando

You are the lead full-stack engineer and product designer for **Brando**, a bilingual (English/Mongolian) AI brand identity and brandbook web application being built for a **3-day hackathon**.

The repository contains a detailed `README.md`. **Read it completely first** and treat it as the product specification. Do not skip sections. Your task is to implement the project, not just write a plan.

## First action
1. Inspect the current working directory, package.json, source tree, git status, and existing dependencies. Do not overwrite working files blindly.
2. Read `README.md` fully and summarize the core architecture, P0 deliverables, and any contradictions you identify.
3. Create a short `IMPLEMENTATION_PLAN.md` with 3-day milestones, architecture decisions, and an ordered checklist. Do not get stuck in planning: immediately begin implementation after the plan.
4. Implement **Phase 1** now: working Next.js App Router + TypeScript + Tailwind app (reuse existing project if present), locale dictionaries for English and Mongolian, functional language switcher, minimal polished full landing page, three working onboarding entry routes (from scratch / upload logo / import URL) that all converge on a mandatory five-step personalized Brand Discovery wizard, and a guest demo entry to a seeded brand workspace.
5. Implement navigation, route guards or safe guest identification as needed, and local persistence foundations. Use sensible sample content; never claim an unimplemented feature works.
6. Run available lint, typecheck and production build; fix errors. Report changed files and commands run.

## Color editor requirement for later Phase 2
- Treat https://coolors.co as a **functional interaction reference**, not a design to clone. Read README section 5.2 for the required palette studio: 3–6 swatches, generate with locked colors preserved, HEX/RGB/HSL editing, copy, role assignment, calculated WCAG contrast, undo/redo, save/persist, and CSS/JSON export.
- Build the generator with local color algorithms first so guest demo works without API keys. Implement after the Phase 1 foundation is stable.

## Visual design
- Product name: Brando. Design: original minimal SaaS, not a clone of Recraft, mylogo.review, or ubrand.
- Clean white/off-white UI, subtle gray dividers, restrained blue accent, generous whitespace, premium typography with Mongolian Cyrillic support.
- Full landing: navbar, hero, three starting methods, feature overview, workflow, product preview, FAQ, final CTA, footer.
- Hero copy EN: “Build a brand that feels like yours.”
- Hero copy MN: “Өөрийн гэсэн өнгө төрхтэй брэнд бүтээ.”
- Desktop-first workspace with mobile-responsive landing.

## Engineering requirements
- Use actual functional routes and handlers, no dead buttons or fake completion toasts.
- Guest mode must not require login; provide a seeded sample brand and persist changes across refresh.
- Keep API keys server-side; build mock AI adapter so the product runs without credentials.
- Use Zod validation, TypeScript types, accessible forms, proper error/loading states.
- Preserve a straightforward path to Qwen brand strategy generation, editable SVG logo compositions, asset manager and PDF export in later phases.
- Keep scope focused on P0; defer P1/P2 until the core experience works.
- If a decision is ambiguous, choose the simplest reliable implementation, record it in IMPLEMENTATION_PLAN.md, and continue. Ask only when blocked by a genuinely missing secret or external requirement.

## Deliverable for this terminal run
A locally running Brando application with a polished bilingual landing page, navigable onboarding entry points, a usable guest demo workspace shell, and clean build results. Then tell me the exact localhost URL and what to test. Continue to the next phase only after this first vertical slice is stable.

Start now: inspect files, read README.md, and implement Phase 1.

## Critical new product requirement: personalized onboarding
Read README section 4A before coding. The Brand Discovery wizard is **P0, not a future enhancement**. Implement the five steps with required-field validation, autosave, bilingual labels, personality sliders, source-aware prefills, and review screen. New-project generation is blocked until required fields are complete. Demo project may use a prefilled brief. Use the same brief to ground generated story, mission, values, colors, typography and logo directions. For Day 1, prioritize working wizard and local persistence over polished secondary marketing sections. Website/social imports must degrade gracefully if access is blocked; never fabricate extracted data. Do not claim a raster logo is fully vector-editable.

Functional reference: https://mylogo.review — specifically its Brand Form → Logo Review/Comparison → Colors → Typography → Mockups → Export → Brand Identity flow. Use as workflow inspiration only, with an original UI and implementation.


## Scope clarification
Shareable client questionnaires are a P2 enhancement, not a Day 1 requirement. First complete the in-app bilingual discovery wizard and working brand generation. Do not let optional sharing delay the hackathon demo.
