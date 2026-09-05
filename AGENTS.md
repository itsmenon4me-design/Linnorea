# AGENT.md — Linnorea Design Works Website Rebuild

This file gives any AI coding agent (Claude Code, Cursor, etc.) the context and rules needed to work on this repository correctly and consistently. Read this in full before writing any code.

## 1. Project Summary

We are rebuilding **linnorea.com** — the website of Linnorea Design Works, a boutique interior design studio in Jakarta — from scratch. The current site is an old WordPress theme with a MasterSlider homepage. The new site must **fully replicate the visual language, layout structure, and interaction mechanics of ferrari.com/en-ID** (cinematic full-bleed heroes, minimal navigation, scroll-driven animation, per-item storytelling pages), applied to Linnorea's own content.

**What gets cloned:** layout, structure, navigation behavior, scroll/animation mechanics, page hierarchy, typography scale, spacing rhythm, transition patterns.

**What does NOT get cloned:** Ferrari's logo, Ferrari's photos/videos, Ferrari's brand name/copy, the Ferrari cavallino mark, any Ferrari trademark asset. All media, logo, and copy come from Linnorea (linnorea.com) and its owner.

This is a from-scratch build. It is not a WordPress theme or plugin — it replaces the current site entirely.

## 2. Tech Stack (fixed — do not substitute without asking)

| Layer | Technology | Purpose |
|---|---|---|
| Framework | **Next.js** (App Router) | Routing, rendering, i18n routing |
| CMS | **Sanity** (headless) | Content model, media, admin dashboard (Sanity Studio) |
| Scroll animation | **GSAP + ScrollTrigger** | Reveal, parallax, pinned sections, transitions |
| Smooth scroll | **Lenis** | Inertia/momentum scrolling feel |
| Styling | **Tailwind CSS** | Utility-first styling |
| Deployment | Vercel (or equivalent Next.js-compatible host) | Frontend hosting |
| Language | TypeScript | Type safety across frontend and Sanity schema |

Do not introduce a different CMS, animation library, or CSS framework unless the project owner explicitly approves it.

## 3. Languages (i18n)

Six locales, all first-class (not machine-translated fallbacks unless explicitly marked as draft):

- `id` — Indonesian (default/primary)
- `en` — English
- `ja` — Japanese
- `fr` — French
- `de` — German
- `it` — Italian

Routing convention: locale-prefixed paths, e.g. `/id/`, `/en/`, `/ja/`, `/fr/`, `/de/`, `/it/`. Use Next.js built-in i18n routing (App Router `[locale]` segment). Every page and every Sanity document type that holds visible copy must support all six locales via Sanity's field-level or document-level internationalization plugin.

## 4. People & Roles

- **Project owner / developer**: the person directing this build (also the one talking to the coding agent).
- **Content admin**: the project owner, initially — will log into Sanity Studio to add/edit projects, photos, and copy. Studio must be usable by a non-developer eventually, so keep the schema fields clearly labeled and avoid requiring raw code edits for routine content updates.
- **End users**: prospective clients of Linnorea Design Works browsing the public site — assume non-technical, design-conscious visitors on both desktop and mobile.

## 5. Non-Negotiable Design Principles (inherited from Ferrari.com pattern)

1. **Full-bleed cinematic hero** on Home and on every individual project detail page.
2. **Minimal, mostly-transparent navigation** that reveals/solidifies on scroll; hamburger-style menu for secondary links.
3. **Scroll-triggered reveals** for section transitions — content should not just "appear," it should animate in as the user scrolls (fade, slide, scale, or pinned-section transforms via GSAP ScrollTrigger).
4. **Smooth/inertia scrolling** site-wide via Lenis — never default browser scroll jump.
5. **One project = one immersive page**, mirroring how Ferrari gives each car model its own storytelling page (hero → concept/story → gallery → details → CTA).
6. **Performance discipline**: despite the cinematic feel, images/video must be optimized (Next.js Image, responsive srcsets, lazy loading below the fold, compressed video). A "heavy" visual feel must not mean a genuinely heavy/slow site.
7. **Dark-leaning, high-contrast, editorial typography** — large type for statements, generous whitespace, restrained color palette driven by Linnorea's own brand colors (not Ferrari red — confirm actual palette from Linnorea's brand before hardcoding colors).

## 6. Repository Conventions

- `/app` — Next.js App Router pages, organized under `/app/[locale]/...`
- `/components` — reusable UI components (Hero, Nav, ProjectCard, ScrollSection, etc.)
- `/lib` — Sanity client, GSAP/Lenis setup helpers, i18n helpers
- `/sanity` — Sanity Studio config, schema definitions, deployed as its own app (see §7)
- `/public` — static assets not managed via Sanity (favicon, fonts if self-hosted, etc.)
- Component names: PascalCase. File names: kebab-case for routes, PascalCase for component files.
- Every component that uses GSAP must clean up its ScrollTrigger instances on unmount (avoid memory leaks / duplicate triggers on route change — this is a common and serious bug class in this stack).
- Prefer server components by default; mark `"use client"` only where GSAP/Lenis/interactivity requires it.

## 7. Sanity Studio Separation

The Sanity Studio (admin dashboard) is a **separate surface** from the public site, not a page within it:

- Public site: `linnorea.com` (or chosen domain) — no admin UI ever exposed here.
- Studio: deployed separately, e.g. `studio.linnorea.com` or `linnorea.sanity.studio`, authenticated, never linked from public navigation.
- The agent should never blend Studio UI/components into the public Next.js app.

## 8. What the Agent Should Ask Before Assuming

- Exact Linnorea brand colors, fonts, and logo files (do not invent placeholder branding as if final).
- Final content/copy per language — do not silently machine-translate final copy into the CMS; flag when a translation is a placeholder.
- Any real project photos/videos before building "final" hero sections — use clearly-marked placeholder media until real assets are supplied.
- Domain/hosting credentials — do not assume access; ask before attempting deployment steps that need them.

## 9. Out of Scope (unless later requested)

- E-commerce/checkout functionality (the old WordPress site has leftover cart code — this is not being carried over).
- Blog/news system.
- User accounts/login for site visitors.

## 10. Source of Truth Documents

Read alongside this file:
- `PRD.md` — full product requirements.
- `BLUEPRINT.md` — page-by-page structure, Sanity schema design, animation spec, folder architecture, build phases.


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.


<!-- END:nextjs-agent-rules -->

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read `antislop.md` (core) and then the skill for the task:
- UI / visual: `skills/antislop-ui/SKILL.md`
- Copy & text: `skills/antislop-copywriting/SKILL.md`
- People: `skills/antislop-human/SKILL.md`
- Mobile / responsive: `skills/antislop-layoutmobile/SKILL.md`
- Code comments: `skills/antislop-code/SKILL.md`
Before starting, ask the user when antislop applies: during the work, or after it is done.
<!-- antislop:end -->
