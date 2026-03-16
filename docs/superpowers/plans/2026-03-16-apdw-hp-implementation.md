# APDW HP "The Dividing Line" Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild archi-prisma.co.jp with "The Dividing Line" design system — a vertical line that shifts position per section, creating asymmetric layouts that embody APDW's dual identity (architecture + software).

**Architecture:** Astro 5 static site with GSAP ScrollTrigger driving a CSS custom property (`--line-pos`) that controls a CSS Grid split. Sections declare their line position, GSAP interpolates between them on scroll. Light/Dark Space backgrounds switch at the Bridge section. Mobile degrades to single-column stacked layout (no line).

**Tech Stack:** Astro 5, Tailwind CSS 4, GSAP 3 + ScrollTrigger, Lenis smooth scroll, Google Fonts (Syne, Outfit, Noto Sans JP)

**Spec:** `docs/superpowers/specs/2026-03-16-apdw-hp-design.md`

---

## Chunk 1: Foundation — Cleanup, Design System, Base Layout

### Task 1: Codebase cleanup — Remove legacy Three.js infrastructure

**Files:**
- Delete: `src/lib/three/` (entire directory)
- Delete: `src/lib/shaders/` (entire directory)
- Delete: `src/lib/postProcessing.ts`
- Delete: `src/pages/security-policy.astro` (if exists, already marked deleted in git)
- Modify: `package.json` — remove `three`, `@types/three`, `postprocessing`

- [ ] **Step 1: Remove unused dependencies**

```bash
pnpm remove three @types/three postprocessing
```

- [ ] **Step 2: Delete legacy Three.js files**

```bash
rm -rf src/lib/three/ src/lib/shaders/ src/lib/postProcessing.ts
```

- [ ] **Step 3: Verify build still works**

```bash
pnpm build
```

Expected: Build succeeds (these files are not imported by the current temporary index.astro)

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: remove legacy Three.js/WebGL infrastructure"
```

---

### Task 2: Content migration — Move content files to src/content/

**Files:**
- Create: `src/content/works.json` (copy from `_backup_legacy/content/works.json`)
- Create: `src/content/team.json` (copy from `_backup_legacy/content/team.json`)
- Create: `src/content/partners.json` (copy from `_backup_legacy/content/partners.json`)
- Create: `src/content/services.md` (copy from `_backup_legacy/content/services.md`)
- Create: `src/content/about.md` (copy from `_backup_legacy/content/about.md`)
- Modify: `src/lib/content.ts` — update import paths

- [ ] **Step 1: Copy content files**

```bash
mkdir -p src/content
cp _backup_legacy/content/works.json src/content/
cp _backup_legacy/content/team.json src/content/
cp _backup_legacy/content/partners.json src/content/
cp _backup_legacy/content/services.md src/content/
cp _backup_legacy/content/about.md src/content/
```

- [ ] **Step 2: Update content.ts to read from new paths**

Replace the entire `src/lib/content.ts` with:

```typescript
import worksData from '../content/works.json';
import teamData from '../content/team.json';
import partnersData from '../content/partners.json';

export interface Work {
  year: number;
  title: string;
  type: string;
  region: string;
  phase: string;
  image?: string;
  storyline?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  notes?: string;
  license?: string;
  image?: string;
}

export interface Partner {
  name: string;
  area: string;
  logo?: string;
  logoAlt?: string;
  logoScale?: number;
}

export function loadWorks(): Work[] {
  return worksData as Work[];
}

export function loadFeaturedWorks(): Work[] {
  const featured = ['The Super Yacht Club', 'KOTSUBO Jacaranda Market Place', '下馬賃貸マンション'];
  return loadWorks().filter(w => featured.includes(w.title));
}

export function loadTeam() {
  return teamData as {
    core: TeamMember[];
    advisory_legacy: TeamMember[];
    collaborators: TeamMember[];
  };
}

export function loadPartners() {
  return (partnersData as { companies: Partner[] }).companies;
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add src/content/ src/lib/content.ts && git commit -m "feat: migrate content files to src/content/"
```

---

### Task 3: Design system — Global CSS with Tailwind 4 custom properties

**Files:**
- Rewrite: `src/styles/global.css`

- [ ] **Step 1: Write the design system CSS**

Replace `src/styles/global.css` entirely with:

```css
@import 'tailwindcss';

/* ============================================
   APDW Design System — "The Dividing Line"
   ============================================ */

/* --- Fonts --- */
@font-face {
  font-family: 'Syne';
  font-style: normal;
  font-display: swap;
  src: url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
}

/* --- Custom Properties --- */
@theme {
  /* Light Space (APDW Architecture) */
  --color-surface: #F8F6F3;
  --color-ink: #1A1A1A;
  --color-ink-muted: #6B6560;
  --color-accent: #5C4340;
  --color-accent-decorative: #7A5C5A;
  --color-rule: #E2DDD7;

  /* Dark Space (ARCHI-PRISMA Software) */
  --color-surface-dark: #0C0C0C;
  --color-ink-dark: #F0EEEB;
  --color-ink-muted-dark: #8A8580;
  --color-accent-dark: #C4A882;

  /* Typography Scale */
  --text-hero: clamp(3rem, 5vw, 5rem);
  --text-section: clamp(2rem, 3.5vw, 3.5rem);
  --text-project: clamp(1.5rem, 2.5vw, 2.5rem);
  --text-body: clamp(0.9rem, 1vw, 1.1rem);
  --text-caption: 0.8rem;
  --text-nav: 0.85rem;

  /* Layout */
  --max-width: 1440px;
  --content-padding-x: clamp(24px, 4vw, 64px);

  /* Motion */
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --duration-fast: 0.3s;
  --duration-normal: 0.5s;
  --duration-line: 0.8s;

  /* The Line System */
  --line-pos: 30%;

  /* Font families */
  --font-display: 'Syne', sans-serif;
  --font-body: 'Outfit', sans-serif;
  --font-jp: 'Noto Sans JP', sans-serif;
}

/* --- Base --- */
html {
  background-color: var(--color-surface);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-weight: 300;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  min-height: 100vh;
  overflow-x: hidden;
}

/* --- Typography --- */
h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

/* Japanese text defaults to Noto Sans JP */
:lang(ja) {
  font-family: var(--font-jp);
}

/* --- The Line System (Desktop only) --- */
.line-section {
  display: grid;
  grid-template-columns: 1fr;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--content-padding-x);
}

@media (min-width: 768px) {
  .line-section {
    grid-template-columns: var(--line-pos) 1px 1fr;
  }
}

.dividing-line {
  display: none;
  background-color: var(--color-accent-decorative);
  width: 1px;
  min-height: 100%;
}

@media (min-width: 768px) {
  .dividing-line {
    display: block;
  }
}

/* --- Dark Space --- */
.dark-space {
  background-color: var(--color-surface-dark);
  color: var(--color-ink-dark);
}

.dark-space .dividing-line {
  background-color: var(--color-accent-dark);
}

/* --- Reduced Motion --- */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* --- Link hover underline animation --- */
.link-animated {
  position: relative;
  text-decoration: none;
}

.link-animated::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background-color: currentColor;
  transition: width var(--duration-fast) var(--ease);
}

.link-animated:hover::after {
  width: 100%;
}
```

- [ ] **Step 2: Verify Tailwind processes the file**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css && git commit -m "feat: implement APDW design system with Tailwind 4"
```

---

### Task 4: Base layout with fonts and meta

**Files:**
- Rewrite: `src/layouts/Layout.astro`

- [ ] **Step 1: Write the base layout**

Replace `src/layouts/Layout.astro` with:

```astro
---
interface Props {
  title?: string;
  description?: string;
  darkSpace?: boolean;
}

const {
  title = 'Archi-Prisma Design Works | Architecture × Software — Tokyo / London',
  description = 'Archi-Prisma Design Works は建築設計とソフトウェア開発の二軸で、AI × 建築の未来を切り拓く設計事務所です。Tokyo / London.',
  darkSpace = false,
} = Astro.props;

const currentYear = new Date().getFullYear();
---

<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content={description} />

  <!-- OGP -->
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://archi-prisma.co.jp" />
  <meta property="og:image" content="https://archi-prisma.co.jp/og-image.png" />
  <meta property="og:locale" content="ja_JP" />
  <meta name="twitter:card" content="summary_large_image" />

  <!-- Favicon -->
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500&family=Noto+Sans+JP:wght@400;500;700&display=swap"
    rel="stylesheet"
  />

  <!-- JSON-LD -->
  <script type="application/ld+json" set:html={JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Archi-Prisma Design Works",
    "url": "https://archi-prisma.co.jp",
    "logo": "https://archi-prisma.co.jp/assets/branding/apdw-logo.png",
    "foundingDate": "2024",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Shinagawa",
      "addressRegion": "Tokyo",
      "postalCode": "141-0021",
      "addressCountry": "JP"
    }
  })} />
</head>
<body>
  <slot />
</body>
</html>
```

- [ ] **Step 2: Build and verify**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Layout.astro && git commit -m "feat: add base Layout with fonts, meta, JSON-LD"
```

---

### Task 5: Header component with space-aware nav

**Files:**
- Rewrite: `src/components/Header.astro`

- [ ] **Step 1: Write the header component**

Replace `src/components/Header.astro` with:

```astro
---
const navItems = [
  { label: 'Works', href: '/works/' },
  { label: 'Products', href: '/products/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '#contact' },
];
---

<!-- Desktop Header -->
<header
  id="site-header"
  class="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
  data-space="light"
>
  <div class="max-w-[var(--max-width)] mx-auto px-[var(--content-padding-x)] flex items-center justify-between h-16 md:h-20">
    <!-- Logo -->
    <a href="/" class="block">
      <img
        src="/assets/branding/apdw-logo.png"
        alt="APDW"
        class="h-10 md:h-12 w-auto header-logo"
      />
    </a>

    <!-- Desktop Nav -->
    <nav class="hidden md:flex items-center gap-8" aria-label="Main navigation">
      {navItems.map(item => (
        <a
          href={item.href}
          class="text-[var(--text-nav)] font-[var(--font-display)] font-500 tracking-widest uppercase link-animated header-link"
        >
          {item.label}
        </a>
      ))}
    </nav>
  </div>
</header>

<!-- Mobile Bottom Tab Bar -->
<nav
  class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface)] border-t border-[var(--color-rule)] safe-bottom"
  aria-label="Mobile navigation"
>
  <div class="flex items-center justify-around h-14">
    {navItems.map(item => (
      <a
        href={item.href}
        class="flex flex-col items-center gap-0.5 text-[0.65rem] tracking-wider uppercase text-[var(--color-ink-muted)] font-[var(--font-display)] font-500"
      >
        {item.label}
      </a>
    ))}
  </div>
</nav>

<style>
  .safe-bottom {
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  /* Space-aware color inversion via data attribute (toggled by JS) */
  [data-space="dark"] {
    background-color: rgba(12, 12, 12, 0.85);
    backdrop-filter: blur(12px);
  }
  [data-space="dark"] .header-link {
    color: var(--color-ink-dark);
  }
  [data-space="dark"] .header-logo {
    filter: invert(1) brightness(0.9);
  }

  [data-space="light"] {
    background-color: rgba(248, 246, 243, 0.85);
    backdrop-filter: blur(12px);
  }
  [data-space="light"] .header-link {
    color: var(--color-ink);
  }
</style>
```

- [ ] **Step 2: Build and verify**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro && git commit -m "feat: add Header with space-aware nav + mobile tab bar"
```

---

## Chunk 2: The Line System

### Task 6: DividingLine component

**Files:**
- Create: `src/components/DividingLine.astro`

- [ ] **Step 1: Write the DividingLine component**

```astro
---
/**
 * DividingLine — The structural signature of the site.
 * A 1px vertical line that runs through the page.
 * Position is controlled by --line-pos CSS variable, driven by GSAP ScrollTrigger.
 * Hidden on mobile (< 768px).
 */
---

<div
  id="dividing-line"
  class="hidden md:block fixed top-0 w-px h-screen z-10 pointer-events-none"
  style="left: var(--line-pos, 30%); background-color: var(--color-accent-decorative);"
  aria-hidden="true"
  data-line-opacity="1"
></div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DividingLine.astro && git commit -m "feat: add DividingLine component"
```

---

### Task 7: Line system GSAP controller

**Files:**
- Create: `src/lib/line-system.ts`

- [ ] **Step 1: Write the line system controller**

```typescript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface SectionConfig {
  id: string;
  linePos: string;
  lineColor?: string;
  lineOpacity?: number;
}

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'hero',       linePos: '30%' },
  { id: 'works-01',   linePos: '40%' },
  { id: 'works-02',   linePos: '65%' },
  { id: 'works-03',   linePos: '20%' },
  { id: 'bridge',     linePos: '50%', lineColor: undefined }, // gradient handled in CSS
  { id: 'products-compass', linePos: '45%', lineColor: '#C4A882' },
  { id: 'products-kakome',  linePos: '60%', lineColor: '#C4A882' },
  { id: 'products-kozo',    linePos: '40%', lineColor: '#C4A882' },
  { id: 'team',       linePos: '35%' },
  { id: 'company',    linePos: '50%' },
  { id: 'contact',    linePos: '50%', lineOpacity: 0 },
];

export function initLineSystem(sections: SectionConfig[] = DEFAULT_SECTIONS) {
  // Guard: desktop only
  if (!window.matchMedia('(min-width: 768px)').matches) return;

  const line = document.getElementById('dividing-line');
  if (!line) return;

  sections.forEach((section) => {
    const el = document.getElementById(section.id);
    if (!el) return;

    ScrollTrigger.create({
      trigger: el,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => applyLineState(line, section),
      onEnterBack: () => applyLineState(line, section),
    });
  });

  // Initial state
  applyLineState(line, sections[0]);
}

function applyLineState(line: HTMLElement, section: SectionConfig) {
  gsap.to(line, {
    left: section.linePos,
    opacity: section.lineOpacity ?? 1,
    duration: 0.8,
    ease: 'power3.out',
  });

  if (section.lineColor) {
    gsap.to(line, {
      backgroundColor: section.lineColor,
      duration: 0.4,
    });
  }

  // Update CSS custom property for grid layouts
  document.documentElement.style.setProperty('--line-pos', section.linePos);
}

export function destroyLineSystem() {
  ScrollTrigger.getAll().forEach(t => t.kill());
}
```

- [ ] **Step 2: Build to verify TypeScript compiles**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/line-system.ts && git commit -m "feat: add GSAP ScrollTrigger line system controller"
```

---

### Task 8: Footer component

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Write the Footer component**

```astro
---
const currentYear = new Date().getFullYear();
---

<footer id="contact" class="py-24 md:py-32">
  <div class="max-w-[var(--max-width)] mx-auto px-[var(--content-padding-x)]">
    <!-- Contact CTA -->
    <h2 class="font-[var(--font-display)] text-[var(--text-section)] font-700 mb-4">
      お問い合わせ
    </h2>
    <a
      href="mailto:info@archi-prisma.co.jp"
      class="text-[var(--text-body)] link-animated inline-block mb-16"
    >
      info@archi-prisma.co.jp
    </a>

    <!-- Divider -->
    <div class="w-full h-px bg-[var(--color-rule)] mb-8"></div>

    <!-- Footer info -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[var(--text-caption)] text-[var(--color-ink-muted)]">
      <span>&copy; 2024&ndash;{currentYear} Archi-Prisma Design Works</span>
      <span>Tokyo / London</span>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.astro && git commit -m "feat: add Footer with contact CTA"
```

---

## Chunk 3: Top Page Sections

### Task 9: Hero section

**Files:**
- Create: `src/components/Hero.astro` (overwrite existing placeholder)

- [ ] **Step 1: Write the Hero component**

```astro
---
/**
 * Hero — Line position: 30 | 70
 * Left: Identity statement (annotation-style)
 * Right: Featured project image (bleeds right)
 */
---

<section id="hero" class="min-h-screen flex items-center relative pt-20 md:pt-0">
  <div class="line-section w-full items-center">
    <!-- Left zone: Identity -->
    <div class="py-16 md:py-0 md:pr-12 flex flex-col justify-center gap-6">
      <img
        src="/assets/branding/apdw-logotype.png"
        alt="ARCHI-PRISMA"
        class="h-6 md:h-8 w-auto self-start hero-reveal"
        style="animation-delay: 0.1s"
      />
      <div class="flex flex-col gap-2 hero-reveal" style="animation-delay: 0.2s">
        <span class="font-[var(--font-body)] text-[var(--text-caption)] text-[var(--color-ink-muted)] tracking-widest uppercase">
          Est. 2024
        </span>
        <span class="font-[var(--font-body)] text-[var(--text-caption)] text-[var(--color-ink-muted)] tracking-widest uppercase">
          Tokyo / London
        </span>
      </div>
      <p class="font-[var(--font-display)] text-[var(--text-project)] font-600 hero-reveal" style="animation-delay: 0.3s">
        Architecture &times; Software
      </p>
    </div>

    <!-- Line (desktop) -->
    <div class="dividing-line" aria-hidden="true"></div>

    <!-- Right zone: Featured image -->
    <div class="relative md:-mr-[var(--content-padding-x)] hero-image-reveal">
      <img
        src="/assets/hero-poster.webp"
        alt="The Super Yacht Club — aerial night rendering"
        class="w-full h-[50vh] md:h-[80vh] object-cover"
        loading="eager"
        fetchpriority="high"
      />
      <!-- Project caption -->
      <div class="absolute bottom-6 left-6 md:bottom-8 md:left-8">
        <span class="text-white/70 text-[var(--text-caption)] font-[var(--font-body)] tracking-wider uppercase">
          The Super Yacht Club — 2024
        </span>
      </div>
    </div>
  </div>
</section>

<style>
  /* Staggered reveal animation */
  .hero-reveal {
    opacity: 0;
    transform: translateX(-20px);
    animation: heroReveal var(--duration-normal) var(--ease) forwards;
  }

  .hero-image-reveal {
    opacity: 0;
    clip-path: inset(0 100% 0 0);
    animation: heroImageReveal 0.8s var(--ease) 0.4s forwards;
  }

  @keyframes heroReveal {
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes heroImageReveal {
    to {
      opacity: 1;
      clip-path: inset(0 0 0 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-reveal, .hero-image-reveal {
      opacity: 1;
      transform: none;
      clip-path: none;
      animation: none;
    }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Hero.astro && git commit -m "feat: add Hero section with line-section layout + reveal animation"
```

---

### Task 10: WorksHighlight section

**Files:**
- Create: `src/components/WorksHighlight.astro`

- [ ] **Step 1: Write the WorksHighlight component**

```astro
---
import { loadFeaturedWorks } from '../lib/content';
const works = loadFeaturedWorks();

const projects = [
  {
    num: '01',
    id: 'works-01',
    linePos: '40%',
    title: 'The Super Yacht Club',
    titleEn: 'The Super\nYacht Club',
    meta: 'Hospitality\nJapan, 2024\nPlanning / Design',
    storyline: '企画・設計・運営を一貫して手がける、海上クラブの全体構想。',
    image: '/assets/work-yacht-club.jpg',
    imageAlt: 'The Super Yacht Club rendering',
    layout: 'text-left',
  },
  {
    num: '02',
    id: 'works-02',
    linePos: '65%',
    title: 'KOTSUBO Jacaranda Market Place',
    titleEn: 'KOTSUBO\nJacaranda\nMarket Place',
    meta: 'Urban / Commercial\nJapan, 2024\nPlanning / Design',
    storyline: '地域の記憶と商いを結ぶ、漁港発のまちづくり。',
    image: '/assets/work-kotsubo-market.jpg',
    imageAlt: 'KOTSUBO Jacaranda Market Place rendering',
    layout: 'image-left',
  },
  {
    num: '03',
    id: 'works-03',
    linePos: '20%',
    title: '下馬賃貸マンション',
    titleEn: '下馬賃貸\nマンション',
    meta: 'Residential\nJapan, 2024\nDesign',
    storyline: '住まいの品質を、収益性と両立させる設計。',
    image: '/assets/work-shimouma-residence.jpg',
    imageAlt: '下馬賃貸マンション rendering',
    layout: 'image-dominant',
  },
];
---

<section class="py-24 md:py-40">
  {projects.map((project) => (
    <div
      id={project.id}
      class="line-section mb-24 md:mb-40 items-start"
      style={`--section-line-pos: ${project.linePos}`}
      data-line-pos={project.linePos}
    >
      {project.layout === 'image-left' ? (
        <>
          {/* Image on left */}
          <div class="order-2 md:order-1">
            <img
              src={project.image}
              alt={project.imageAlt}
              class="w-full h-[40vh] md:h-[60vh] object-cover"
              loading="lazy"
            />
          </div>
          <div class="dividing-line order-none" aria-hidden="true"></div>
          {/* Text on right */}
          <div class="order-1 md:order-3 py-8 md:py-12 md:pl-12">
            <span class="font-[var(--font-display)] text-[5rem] md:text-[7rem] font-800 text-[var(--color-rule)] leading-none block mb-4">
              {project.num}
            </span>
            <h3 class="font-[var(--font-display)] text-[var(--text-project)] font-600 mb-4 whitespace-pre-line">
              {project.titleEn}
            </h3>
            <div class="text-[var(--text-caption)] text-[var(--color-ink-muted)] font-[var(--font-body)] whitespace-pre-line mb-4">
              {project.meta}
            </div>
            <p class="text-[var(--text-body)] font-[var(--font-jp)]">{project.storyline}</p>
          </div>
        </>
      ) : project.layout === 'image-dominant' ? (
        <>
          {/* Minimal text on left */}
          <div class="order-2 md:order-1 py-8 md:py-12 md:pr-8">
            <span class="font-[var(--font-display)] text-[5rem] md:text-[7rem] font-800 text-[var(--color-rule)] leading-none block mb-4">
              {project.num}
            </span>
            <h3 class="font-[var(--font-display)] text-[var(--text-project)] font-600 whitespace-pre-line">
              {project.titleEn}
            </h3>
          </div>
          <div class="dividing-line" aria-hidden="true"></div>
          {/* Large image on right */}
          <div class="order-1 md:order-3 md:-mr-[var(--content-padding-x)]">
            <img
              src={project.image}
              alt={project.imageAlt}
              class="w-full h-[50vh] md:h-[70vh] object-cover"
              loading="lazy"
            />
          </div>
        </>
      ) : (
        <>
          {/* Default: text left, image right */}
          <div class="order-2 md:order-1 py-8 md:py-12 md:pr-12">
            <span class="font-[var(--font-display)] text-[5rem] md:text-[7rem] font-800 text-[var(--color-rule)] leading-none block mb-4">
              {project.num}
            </span>
            <h3 class="font-[var(--font-display)] text-[var(--text-project)] font-600 mb-4 whitespace-pre-line">
              {project.titleEn}
            </h3>
            <div class="text-[var(--text-caption)] text-[var(--color-ink-muted)] font-[var(--font-body)] whitespace-pre-line mb-4">
              {project.meta}
            </div>
            <p class="text-[var(--text-body)] font-[var(--font-jp)]">{project.storyline}</p>
          </div>
          <div class="dividing-line" aria-hidden="true"></div>
          <div class="order-1 md:order-3">
            <img
              src={project.image}
              alt={project.imageAlt}
              class="w-full h-[40vh] md:h-[60vh] object-cover"
              loading="lazy"
            />
          </div>
        </>
      )}
    </div>
  ))}

  <!-- CTA -->
  <div class="max-w-[var(--max-width)] mx-auto px-[var(--content-padding-x)] text-right">
    <a href="/works/" class="font-[var(--font-display)] text-[var(--text-body)] font-500 link-animated">
      すべての作品を見る &rarr;
    </a>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/WorksHighlight.astro && git commit -m "feat: add WorksHighlight with 3 layout variants"
```

---

### Task 11: BrandBridge section

**Files:**
- Create: `src/components/BrandBridge.astro`

- [ ] **Step 1: Write the BrandBridge component**

```astro
---
/**
 * BrandBridge — The Prism Moment
 * Line position: 50 | 50 (the only time it's centered)
 * Background splits: Light (left) / Dark (right)
 * Text: "建築も、" | "ソフトウェアも。"
 */
---

<section id="bridge" class="relative">
  <!-- Split background -->
  <div class="flex min-h-[50vh]">
    <!-- Light half -->
    <div class="flex-1 bg-[var(--color-surface)] flex items-center justify-end pr-4 md:pr-8">
      <span class="font-[var(--font-jp)] text-[var(--text-section)] font-700 text-[var(--color-ink)]">
        建築も、
      </span>
    </div>

    <!-- Center line -->
    <div class="hidden md:block w-px bg-gradient-to-b from-[var(--color-accent-decorative)] to-[var(--color-accent-dark)]" aria-hidden="true"></div>

    <!-- Dark half -->
    <div class="flex-1 bg-[var(--color-surface-dark)] flex items-center justify-start pl-4 md:pl-8">
      <span class="font-[var(--font-jp)] text-[var(--text-section)] font-700 text-[var(--color-ink-dark)]">
        ソフトウェアも。
      </span>
    </div>
  </div>

  <!-- Mobile: vertical split -->
  <div class="md:hidden absolute inset-0 flex flex-col">
    <div class="flex-1 bg-[var(--color-surface)] flex items-end justify-center pb-4">
      <span class="font-[var(--font-jp)] text-[var(--text-section)] font-700 text-[var(--color-ink)]">
        建築も、
      </span>
    </div>
    <div class="w-16 h-px bg-[var(--color-accent-decorative)] mx-auto" aria-hidden="true"></div>
    <div class="flex-1 bg-[var(--color-surface-dark)] flex items-start justify-center pt-4">
      <span class="font-[var(--font-jp)] text-[var(--text-section)] font-700 text-[var(--color-ink-dark)]">
        ソフトウェアも。
      </span>
    </div>
  </div>
</section>

<style>
  /* Hide desktop version on mobile, mobile version on desktop */
  section > div:first-child { display: none; }
  section > div:last-child { display: flex; }

  @media (min-width: 768px) {
    section > div:first-child { display: flex; }
    section > div:last-child { display: none; }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BrandBridge.astro && git commit -m "feat: add BrandBridge section — the prism moment"
```

---

### Task 12: Products section (Dark Space)

**Files:**
- Create: `src/components/Products.astro`

- [ ] **Step 1: Write the Products component**

```astro
---
const products = [
  {
    id: 'products-compass',
    linePos: '45%',
    name: 'COMPASS',
    tagline: '工程管理',
    description: '建築プロジェクトの全工程をガントチャートで可視化。AIが最適なスケジュールを提案。',
    logo: '/assets/products/compass-logo.png',
    screenshot: '/assets/curated/compass-gantt-ui.png',
    layout: 'text-left',
  },
  {
    id: 'products-kakome',
    linePos: '60%',
    name: 'KAKOME',
    tagline: '写真指示書',
    description: '現場写真から指示書を自動生成。撮って囲むだけで、正確な施工指示が完成。',
    logo: '/assets/products/kakome-logo-black.png',
    screenshot: null,
    layout: 'image-left',
  },
  {
    id: 'products-kozo',
    linePos: '40%',
    name: 'KOZO',
    tagline: '構造計算AI',
    description: 'AIによる構造計算の自動化。複雑な計算を数秒で完了。',
    logo: '/assets/products/kozo-logo.png',
    screenshot: null,
    layout: 'text-left',
  },
];
---

<section class="dark-space py-24 md:py-40">
  <!-- Section header -->
  <div class="max-w-[var(--max-width)] mx-auto px-[var(--content-padding-x)] mb-16 md:mb-24">
    <img
      src="/assets/branding/apdw-logotype.png"
      alt="ARCHI-PRISMA"
      class="h-5 md:h-7 w-auto mb-4 invert brightness-90"
    />
    <p class="font-[var(--font-display)] text-[var(--text-caption)] font-500 tracking-widest uppercase text-[var(--color-ink-muted-dark)]">
      Software Development
    </p>
  </div>

  <!-- Products -->
  {products.map((product) => (
    <div
      id={product.id}
      class="line-section mb-20 md:mb-32 items-center"
      data-line-pos={product.linePos}
    >
      {product.layout === 'image-left' && product.screenshot ? (
        <>
          <div class="order-2 md:order-1">
            <img src={product.screenshot} alt={`${product.name} UI`} class="w-full rounded-lg" loading="lazy" />
          </div>
          <div class="dividing-line" aria-hidden="true" style="background-color: var(--color-accent-dark)"></div>
          <div class="order-1 md:order-3 py-8 md:pl-12">
            <img src={product.logo} alt={product.name} class="h-8 mb-2 invert brightness-90" loading="lazy" />
            <p class="text-[var(--text-caption)] text-[var(--color-accent-dark)] font-[var(--font-jp)] mb-4">{product.tagline}</p>
            <p class="text-[var(--text-body)] text-[var(--color-ink-dark)] font-[var(--font-jp)]">{product.description}</p>
          </div>
        </>
      ) : (
        <>
          <div class="py-8 md:pr-12">
            <img src={product.logo} alt={product.name} class="h-8 mb-2 invert brightness-90" loading="lazy" />
            <p class="text-[var(--text-caption)] text-[var(--color-accent-dark)] font-[var(--font-jp)] mb-4">{product.tagline}</p>
            <p class="text-[var(--text-body)] text-[var(--color-ink-dark)] font-[var(--font-jp)]">{product.description}</p>
          </div>
          <div class="dividing-line" aria-hidden="true" style="background-color: var(--color-accent-dark)"></div>
          <div>
            {product.screenshot ? (
              <img src={product.screenshot} alt={`${product.name} UI`} class="w-full rounded-lg" loading="lazy" />
            ) : (
              <div class="w-full h-[30vh] md:h-[40vh] rounded-lg border border-white/5 flex items-center justify-center">
                <img src={product.logo} alt={product.name} class="h-16 opacity-20 invert" loading="lazy" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  ))}

  <!-- CTA -->
  <div class="max-w-[var(--max-width)] mx-auto px-[var(--content-padding-x)] text-center">
    <a
      href="/products/"
      class="font-[var(--font-display)] text-[var(--text-body)] font-500 text-[var(--color-accent-dark)] link-animated"
    >
      AI建築サークルで、すべてのツールが使い放題 &rarr;
    </a>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Products.astro && git commit -m "feat: add Products section — Dark Space with 3 flagship tools"
```

---

### Task 13: Team section

**Files:**
- Create: `src/components/Team.astro`

- [ ] **Step 1: Write the Team component**

```astro
---
import { loadTeam } from '../lib/content';
const team = loadTeam();
const ceo = team.core[0];
const members = team.core.slice(1);
---

<section id="team" class="py-24 md:py-40">
  <div class="line-section items-start" data-line-pos="35%">
    <!-- Left: CEO portrait -->
    <div class="md:pr-8 mb-8 md:mb-0">
      {ceo.image && (
        <img
          src={ceo.image}
          alt={ceo.name}
          class="w-full max-w-sm md:max-w-none aspect-[3/4] object-cover object-top"
          loading="lazy"
        />
      )}
    </div>

    <div class="dividing-line" aria-hidden="true"></div>

    <!-- Right: CEO info + team -->
    <div class="md:pl-12 py-4 md:py-8">
      <h2 class="font-[var(--font-display)] text-[var(--text-project)] font-700 mb-1">
        {ceo.name}
      </h2>
      <p class="font-[var(--font-body)] text-[var(--text-caption)] text-[var(--color-ink-muted)] mb-6">
        {ceo.role}
      </p>
      <p class="font-[var(--font-jp)] text-[var(--text-body)] mb-12 max-w-md">
        {ceo.notes}
      </p>

      <!-- Other members -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        {members.map(member => (
          <div class="text-center">
            {member.image && (
              <img
                src={member.image}
                alt={member.name}
                class="w-full aspect-square object-cover grayscale mb-2"
                loading="lazy"
              />
            )}
            <p class="font-[var(--font-jp)] text-[var(--text-caption)] font-500">{member.name}</p>
            <p class="text-[0.7rem] text-[var(--color-ink-muted)]">{member.role}</p>
            {member.license && (
              <p class="text-[0.65rem] text-[var(--color-ink-muted)]">{member.license}</p>
            )}
          </div>
        ))}
      </div>

      <!-- International collaborators -->
      <div class="text-[var(--text-caption)] text-[var(--color-ink-muted)]">
        <p class="font-[var(--font-display)] font-500 tracking-wider uppercase mb-2">International Collaborators</p>
        <p class="font-[var(--font-body)]">
          {team.collaborators.map(c => `${c.name} (${c.role})`).join(' / ')}
        </p>
      </div>

      <!-- Advisory -->
      <div class="text-[var(--text-caption)] text-[var(--color-ink-muted)] mt-4">
        <p class="font-[var(--font-body)]">
          Advisory &amp; Legacy: {team.advisory_legacy.map(a => a.name).join(' / ')}
        </p>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Team.astro && git commit -m "feat: add Team section with CEO highlight + B&W members"
```

---

### Task 14: CompanyInfo section

**Files:**
- Create: `src/components/CompanyInfo.astro`

- [ ] **Step 1: Write the CompanyInfo component**

```astro
---
import { loadPartners } from '../lib/content';
const partners = loadPartners();
---

<section id="company" class="py-24 md:py-32">
  <div class="line-section" data-line-pos="50%">
    <!-- Left: heading -->
    <div class="md:pr-12 mb-8 md:mb-0">
      <h2 class="font-[var(--font-display)] text-[var(--text-section)] font-700">
        会社概要
      </h2>
    </div>

    <div class="dividing-line" aria-hidden="true"></div>

    <!-- Right: info table -->
    <div class="md:pl-12">
      <dl class="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-[var(--text-body)] font-[var(--font-jp)]">
        <dt class="text-[var(--color-ink-muted)]">社名</dt>
        <dd>Archi-Prisma Design Works 株式会社</dd>

        <dt class="text-[var(--color-ink-muted)]">所在地</dt>
        <dd>〒141-0021 東京都品川区上大崎2-6-7 SMA白金長者丸301</dd>

        <dt class="text-[var(--color-ink-muted)]">免許</dt>
        <dd>一級建築士事務所登録 東京都知事登録 第6108号</dd>

        <dt class="text-[var(--color-ink-muted)]">管理建築士</dt>
        <dd>国土交通大臣登録 第75397号</dd>
      </dl>

      <!-- Partners -->
      <div class="mt-12">
        <h3 class="font-[var(--font-display)] text-[var(--text-caption)] font-500 tracking-widest uppercase text-[var(--color-ink-muted)] mb-4">
          Partners
        </h3>
        <div class="flex items-center gap-8 flex-wrap">
          {partners.map(partner => (
            partner.logo ? (
              <img
                src={partner.logo}
                alt={partner.logoAlt || partner.name}
                class="h-8 w-auto grayscale opacity-60 hover:opacity-100 transition-opacity"
                loading="lazy"
              />
            ) : (
              <span class="text-[var(--text-caption)] text-[var(--color-ink-muted)]">{partner.name}</span>
            )
          ))}
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CompanyInfo.astro && git commit -m "feat: add CompanyInfo section with partners"
```

---

### Task 15: Assemble top page (index.astro)

**Files:**
- Rewrite: `src/pages/index.astro`

- [ ] **Step 1: Assemble the top page**

```astro
---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import DividingLine from '../components/DividingLine.astro';
import Hero from '../components/Hero.astro';
import WorksHighlight from '../components/WorksHighlight.astro';
import BrandBridge from '../components/BrandBridge.astro';
import Products from '../components/Products.astro';
import Team from '../components/Team.astro';
import CompanyInfo from '../components/CompanyInfo.astro';
import Footer from '../components/Footer.astro';
---

<Layout>
  <Header />
  <DividingLine />

  <main>
    <Hero />
    <WorksHighlight />
    <BrandBridge />
    <Products />
    <Team />
    <CompanyInfo />
  </main>

  <Footer />

  <!-- Line system + Lenis initialization (client-side only) -->
  <script>
    import { initLineSystem } from '../lib/line-system';
    import Lenis from 'lenis';

    // Smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Line system (desktop only)
    if (window.matchMedia('(min-width: 768px)').matches) {
      initLineSystem();
    }

    // Header space awareness
    const header = document.getElementById('site-header');
    const darkSections = document.querySelectorAll('.dark-space');

    if (header && darkSections.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          const isInDark = entries.some(e => e.isIntersecting);
          header.setAttribute('data-space', isInDark ? 'dark' : 'light');
        },
        { rootMargin: '-64px 0px -90% 0px' }
      );
      darkSections.forEach(el => observer.observe(el));
    }
  </script>
</Layout>
```

- [ ] **Step 2: Run dev server and verify**

```bash
pnpm dev
```

Open http://localhost:4321 and verify:
- All sections render
- Light/Dark space transition works
- Line is visible on desktop
- Mobile shows single-column stacked layout
- Navigation works

- [ ] **Step 3: Run production build**

```bash
pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro && git commit -m "feat: assemble top page with all sections + line system init"
```

---

## Chunk 4: Sub-pages

### Task 16: Works page (/works/)

**Files:**
- Create: `src/pages/works/index.astro`

- [ ] **Step 1: Write the Works page**

```astro
---
import Layout from '../../layouts/Layout.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import { loadWorks } from '../../lib/content';

const works = loadWorks();
const types = [...new Set(works.map(w => w.type))].sort();
const eras = ['〜1999', '2000〜', '2024'];
---

<Layout title="Works | Archi-Prisma Design Works">
  <Header />

  <main class="pt-24 md:pt-32 pb-16">
    <div class="max-w-[var(--max-width)] mx-auto px-[var(--content-padding-x)]">
      <h1 class="font-[var(--font-display)] text-[var(--text-section)] font-700 mb-12">
        Works
      </h1>

      <!-- Filters -->
      <div class="flex flex-wrap gap-2 mb-12" id="filters">
        <button class="filter-btn active" data-filter="all">All</button>
        {eras.map(era => (
          <button class="filter-btn" data-filter-era={era}>{era}</button>
        ))}
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="works-grid">
        {works.map(work => {
          const era = work.year <= 1999 ? '〜1999' : work.year <= 2009 ? '2000〜' : '2024';
          return (
            <article class="work-card" data-era={era} data-type={work.type}>
              {work.image ? (
                <img src={work.image} alt={work.title} class="w-full aspect-[4/3] object-cover mb-3" loading="lazy" />
              ) : (
                <div class="w-full aspect-[4/3] bg-[var(--color-rule)] flex items-center justify-center mb-3">
                  <span class="text-[var(--color-ink-muted)] text-[var(--text-caption)]">{work.year}</span>
                </div>
              )}
              <h2 class="font-[var(--font-display)] text-[var(--text-body)] font-600 mb-1">{work.title}</h2>
              <p class="text-[var(--text-caption)] text-[var(--color-ink-muted)] font-[var(--font-body)]">
                {work.type} / {work.region} / {work.year}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  </main>

  <Footer />
</Layout>

<style>
  .filter-btn {
    font-family: var(--font-display);
    font-size: var(--text-caption);
    font-weight: 500;
    padding: 6px 16px;
    border: 1px solid var(--color-rule);
    background: transparent;
    color: var(--color-ink-muted);
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .filter-btn:hover, .filter-btn.active {
    background: var(--color-ink);
    color: var(--color-surface);
    border-color: var(--color-ink);
  }
</style>

<script>
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.work-card');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterEra = btn.getAttribute('data-filter-era');
      const isAll = btn.getAttribute('data-filter') === 'all';

      cards.forEach(card => {
        const cardEl = card as HTMLElement;
        if (isAll || cardEl.dataset.era === filterEra) {
          cardEl.style.display = '';
        } else {
          cardEl.style.display = 'none';
        }
      });
    });
  });
</script>
```

- [ ] **Step 2: Build and verify**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/works/ && git commit -m "feat: add Works page with era filter"
```

---

### Task 17: Products page (/products/) — Dark Space

**Files:**
- Create: `src/pages/products/index.astro`

- [ ] **Step 1: Write the Products page (Dark Space, full treatment)**

Create `src/pages/products/index.astro` with expanded product descriptions, ARCHI-PRISMA branding, and CTA to AI Architecture Circle. Dark Space background throughout. Include all 6 products (Compass, KAKOME, KOZO, SpotPDF, 楽々省エネ計算, AI Commander).

- [ ] **Step 2: Commit**

```bash
git add src/pages/products/ && git commit -m "feat: add Products page — Dark Space with all tools"
```

---

### Task 18: About page (/about/)

**Files:**
- Create: `src/pages/about/index.astro`

- [ ] **Step 1: Write the About page with services, history, global network**

- [ ] **Step 2: Commit**

```bash
git add src/pages/about/ && git commit -m "feat: add About page"
```

---

### Task 19: Contact page (/contact/)

**Files:**
- Create: `src/pages/contact/index.astro`

- [ ] **Step 1: Write the Contact page with address and mailto**

- [ ] **Step 2: Commit**

```bash
git add src/pages/contact/ && git commit -m "feat: add Contact page"
```

---

## Chunk 5: Polish & Verification

### Task 20: Scroll-triggered section reveals

**Files:**
- Modify: `src/lib/line-system.ts` — add section reveal logic
- Modify: `src/styles/global.css` — add reveal animation classes

- [ ] **Step 1: Add scroll reveal CSS classes to global.css**

```css
/* Scroll reveal */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity var(--duration-normal) var(--ease),
              transform var(--duration-normal) var(--ease);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
  }
}
```

- [ ] **Step 2: Add IntersectionObserver for reveals in index.astro script**

```typescript
// Scroll reveals
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.1 }
);
revealElements.forEach(el => revealObserver.observe(el));
```

- [ ] **Step 3: Add `reveal` class to section headings and content blocks**

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css src/pages/index.astro && git commit -m "feat: add scroll-triggered section reveals"
```

---

### Task 21: Performance validation & image optimization

- [ ] **Step 1: Create image optimization script**

```bash
# Install sharp for image conversion
pnpm add -D sharp
```

Create `scripts/optimize-images.ts` to convert JPG/PNG → WebP + AVIF.

- [ ] **Step 2: Run optimization on public/assets/**

- [ ] **Step 3: Run Lighthouse audit**

```bash
pnpm build && npx serve dist -p 3000
# In another terminal: npx lighthouse http://localhost:3000 --output json
```

Verify: Performance > 90, Accessibility > 90, LCP < 2s.

- [ ] **Step 4: Fix any issues and commit**

```bash
git add -A && git commit -m "perf: optimize images to AVIF/WebP, verify Lighthouse targets"
```

---

### Task 22: Final build & deploy verification

- [ ] **Step 1: Clean build**

```bash
rm -rf dist && pnpm build
```

Expected: No errors, no warnings.

- [ ] **Step 2: Preview locally**

```bash
pnpm preview
```

Verify all pages, navigation, line system, mobile layout, dark/light space transitions.

- [ ] **Step 3: Commit any final fixes**

- [ ] **Step 4: Push to trigger GitHub Pages deployment**

```bash
git push origin main
```

Verify live site at https://archi-prisma.co.jp
