# PRD — Linnorea Design Works Website Rebuild

## 1. Background & Problem Statement

Linnorea Design Works is a boutique interior design studio based in Jakarta (Sovereign Plaza, Cilandak). Its current website (linnorea.com) is built on an aging WordPress theme with a dated slider-based homepage, generic layout, and no distinct visual identity relative to competitors. It does not reflect the premium, design-forward positioning the studio wants to project to prospective clients.

The goal is to rebuild the site from scratch with a **cinematic, editorial, storytelling-driven experience** modeled on ferrari.com's structure and interaction design — full-bleed imagery, scroll-driven reveals, minimal chrome, and a dedicated immersive page per project — while populated entirely with Linnorea's own brand, photography, and copy.

## 2. Goals

- **Primary goal**: Position Linnorea as a premium, design-led studio through a website experience that feels as considered and high-production-value as the interiors it sells.
- Give each completed project (G House, 11 House, V Living, and future projects) its own immersive storytelling page rather than a flat gallery entry.
- Make the site self-serve for content updates: the studio owner should be able to add a new project (photos, text, categorization) without developer involvement, via Sanity Studio.
- Support international/multilingual visitors across 6 languages: Indonesian, English, Japanese, French, German, Italian.
- Maintain strong performance (fast load, smooth animation) despite heavy visual content.

## 3. Non-Goals

- No e-commerce / online ordering (the legacy WordPress cart is not being replicated).
- No blog or news feed (unless requested later).
- No client login/portal system.
- Not a pixel-for-pixel Ferrari skin using Ferrari's own assets — Ferrari's brand assets are explicitly excluded; only the design *pattern* is reused.

## 4. Target Users / Audience

- **Prospective clients**: individuals or families evaluating interior design studios for a home project, likely comparing several studios, drawn to strong portfolio presentation. Skews design-conscious, values visual proof of quality over text.
- **International visitors**: given the 6-language scope, the studio anticipates (or wants to signal readiness for) non-Indonesian visitors — Japanese, French, German, Italian, and English-speaking audiences.
- **Referral/social traffic**: current site links from Instagram/WhatsApp bio suggest a lot of traffic arrives from social — first-impression hero and mobile experience matter heavily.
- **Content admin (internal user)**: the studio owner/operator, using Sanity Studio to manage content; assume no coding ability, moderate comfort with structured forms.

## 5. Key Features / Functional Requirements

### 5.1 Global
- FR1: Six-language support (id, en, ja, fr, de, it) with a language switcher accessible from every page.
- FR2: Persistent, minimal navigation that starts transparent over the hero and solidifies/appears on scroll.
- FR3: Site-wide smooth/inertia scrolling (Lenis).
- FR4: Scroll-triggered section reveal animations throughout (GSAP ScrollTrigger) — not merely on the homepage.
- FR5: Fully responsive across mobile, tablet, and desktop; mobile experience must preserve the cinematic feel, not just shrink the desktop layout.
- FR6: WhatsApp contact CTA retained (as on the current site), styled to match the new visual language.
- FR7: Social links retained (Instagram, Threads, LinkedIn, Pinterest).

### 5.2 Home Page
- FR8: Full-bleed hero (photo or video) with the "Where Space Feels." tagline (or updated tagline, TBD with owner).
- FR9: Curated highlight section featuring 3+ selected projects (mirrors Ferrari's model highlight carousel on homepage).
- FR10: Vision/goals storytelling section (adapting the current "Our Vision" / "Our Goals" content) with scroll-driven reveal, not a static block.
- FR11: CTA section ("Have a Space in Mind?") leading to WhatsApp consultation, styled full-bleed like Ferrari's closing CTA sections.

### 5.3 Project Listing Page
- FR12: Grid/list of all projects, each with a representative image and short descriptor (style tag, e.g. "Modern Tropical," "Compact Tropical," "American Classic").
- FR13: Filtering/sorting by category or style (nice-to-have — confirm with owner before committing to scope).
- FR14: Each entry links to its own Project Detail page.

### 5.4 Project Detail Page (the "per-model page" equivalent)
- FR15: Full-bleed hero image/video specific to that project.
- FR16: Scroll-driven narrative sections: concept/design story, photo gallery, key details (location type, style, scope of work).
- FR17: Navigation to next/previous project at the end of the page (mirrors Ferrari's model-to-model browsing).
- FR18: CTA to start a consultation, consistent with global CTA pattern.

### 5.5 About Page
- FR19: Studio philosophy/story section, treated as brand storytelling (equivalent to a brand-heritage page), not just a text block.
- FR20: Team/founder information if the owner wants to include it (confirm scope).

### 5.6 Service Page
- FR21: List of services offered, presented with the same visual treatment (large imagery, not plain bullet text).

### 5.7 Product Page (Linnorea Living)
- FR22: Showroom-style grid of furniture/products, consistent visual language with the rest of the site.
- FR23: Confirm with owner whether this needs e-commerce functionality later, or stays presentational only for now (current assumption: presentational only).

### 5.8 CMS / Admin
- FR24: Sanity Studio, deployed separately from the public site, allows the admin to:
  - Add/edit/delete projects, each with multilingual fields for title, description, and style tag.
  - Upload and reorder photos/videos per project.
  - Edit About, Service, and Home hero/CTA copy per language.
- FR25: Studio UI should not require the admin to write code or touch the repository for routine content changes.

## 6. Non-Functional Requirements

- NFR1: **Performance** — pages should target fast load times (optimize images via Next.js Image, lazy-load below-fold media, compress video) despite full-bleed heavy media.
- NFR2: **SEO** — proper meta tags, Open Graph tags per language/page (current site already has OG/meta setup worth preserving conceptually).
- NFR3: **Accessibility** — animations must respect `prefers-reduced-motion`; text contrast must remain legible over imagery even with a dark, editorial palette.
- NFR4: **Maintainability** — a non-developer admin must be able to manage content independently after launch.
- NFR5: **Scalability** — architecture should not need to be rebuilt if the studio adds many more projects or, later, wants added interactivity (e.g., filters, more languages).

## 7. Content & Assets Dependencies

- Linnorea logo and brand photography (from linnorea.com and the studio's own archive) — required before "final" pages can be built; placeholders used until supplied.
- Finalized brand color palette and typography preference (currently unspecified beyond "Ferrari-style" dark/editorial aesthetic) — needs confirmation with the studio owner.
- Copy/translation for all 6 languages per page — needs a translation source or process (machine translation acceptable only as a flagged draft, not final copy).

## 8. Open Questions (to resolve before/while building)

1. Final brand color palette (Ferrari's red is explicitly not to be copied — what represents Linnorea?).
2. Whether Project Listing needs filtering (FR13) or a simple grid is sufficient for launch.
3. Whether the About page includes team/founder bios (FR20).
4. Whether the Product/Linnorea Living page needs e-commerce later (FR23) — current legacy site has WooCommerce-style cart remnants.
5. Domain and hosting target (owner has indicated this is not a blocker, to be finalized).
6. Source/process for translating content into all 6 languages.

## 9. Success Criteria

- Site visually and functionally mirrors the Ferrari.com interaction pattern (full-bleed heroes, scroll reveals, per-project storytelling pages, minimal nav) using 100% Linnorea-owned assets.
- Studio owner can independently publish a new project (photos + copy in all 6 languages) via Sanity Studio without developer help.
- Site performs smoothly (no jank) on a typical mobile device despite heavy visual content.
- All 6 language versions are navigable and content-complete (even if some launch with placeholder/draft translations, clearly flagged internally).