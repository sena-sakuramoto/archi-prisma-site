# APDW HP Design Spec — "The Dividing Line"

## 1. Overview

Archi-Prisma Design Works (APDW) is a Tokyo-based architecture firm founded in 2024, inheriting
legacy from Archi-Prisma Ltd. London (est. 2001). The firm operates a dual identity: **APDW**
(architecture/design) and **ARCHI-PRISMA** (software development — Compass, KAKOME, KOZO).

This spec defines the complete redesign of archi-prisma.co.jp.

### Purpose (prioritized)
1. **Client acquisition** — Convince developers/business owners: "this firm is real and capable"
2. **Credibility** — Business card: when someone searches APDW, the site confirms legitimacy
3. **AI Circle funnel** — Lead small architecture firms to APDW's AI tools and circle membership

### Target audiences
- **Primary A:** Real estate developers, business owners (architecture clients)
- **Primary B:** Small architecture firms, construction companies (AI Circle/product users)

### Content priorities (from company profile analysis)
1. Quality and scale of architectural work (CG renders are the strongest asset)
2. Team/People (young CEO, international collaborators)
3. Global network (London origin, China/Taiwan/Japan projects)
4. AI Products (Compass, KAKOME, KOZO)
5. Partners (archisoft, BSI, Landcolor)

---

## 2. Design Concept: "The Dividing Line"

### The insight

APDW's name contains "Prisma" — a prism separates white light into its component spectrum.
The APDW logo splits into two colors: AP (warm brown) and DW (grey). The business itself splits
into architecture and software. The site's visual space splits into Light and Dark.

**Separation is APDW's DNA.** The design makes this structural.

### The signature element

A single vertical line (`1px`) runs through the page, dividing the viewport into left and right
zones. **The line's position shifts at each section**, driven by scroll position (GSAP ScrollTrigger).

The line references:
- **Section cuts** in architectural drawings (the fundamental representation tool)
- **The prism boundary** where light separates
- **AP|DW** — the two-color logo split
- **Architecture|Software** — the dual brand identity

The line creates:
- Asymmetric tension in every section (never 50/50 except at the Bridge moment)
- Visual rhythm through changing ratios as user scrolls
- A unified system across all sections (not a collection of unrelated layouts)
- The line disappearing at the footer = integration, unity, resolution

### What this is NOT
- Not decorative. The line is structural — it determines content placement.
- Not a gimmick. It's a persistent, quiet element. Not animated flashily.
- Not metaphorical fluff. It directly determines the CSS grid column ratios.

---

## 3. Design System

### 3.1 Dual Space

| Space | Brand | Background | Text | Accent | Usage |
|-------|-------|-----------|------|--------|-------|
| **Light** | APDW | `#F8F6F3` | `#1A1A1A` | `#7A5C5A` (warm brown) | Architecture, Team, Company |
| **Dark** | ARCHI-PRISMA | `#0C0C0C` | `#F0EEEB` | `#C4A882` (warm gold) | Products, Software |

The dividing line color matches the space's accent color:
- Light Space: `#7A5C5A`
- Dark Space: `#C4A882`

**Banned:** Blue-purple AI gradients, cyan/neon accents, anything that reads as "AI-generated"

### 3.2 Typography

```css
/* Display / Headings */
font-family: 'Syne', sans-serif;
/* Geometric, wide proportions, architectural weight. Echoes ARCHI-PRISMA logotype DNA. */

/* Body (English) */
font-family: 'Outfit', sans-serif;
/* Clean, modern, NOT Inter/Roboto/Arial */

/* Body (Japanese) */
font-family: 'Noto Sans JP', sans-serif;

/* Scale */
--text-hero:     clamp(3rem, 5vw, 5rem);    /* Hero title */
--text-section:  clamp(2rem, 3.5vw, 3.5rem); /* Section headings */
--text-project:  clamp(1.5rem, 2.5vw, 2.5rem); /* Project titles */
--text-body:     clamp(0.9rem, 1vw, 1.1rem);  /* Body copy */
--text-caption:  0.8rem;                       /* Metadata, captions */
--text-nav:      0.85rem;                      /* Navigation */
```

### 3.3 Layout

```css
--max-width: 1440px;
--grid-columns: 12;
--grid-gutter: 24px;
--content-padding-x: clamp(24px, 4vw, 64px);
```

The dividing line position determines the left/right column ratio at each section.
Implemented as CSS Grid with `grid-template-columns: var(--line-pos) 1px 1fr`.

### 3.4 Motion

```css
--ease: cubic-bezier(0.22, 1, 0.36, 1);    /* Smooth deceleration */
--duration-fast: 0.3s;
--duration-normal: 0.5s;
--duration-line: 0.8s;                       /* Line position transitions */
```

**Principles:**
- The line moves first, content follows. Line is the origin of all layout.
- Page load: Line draws top-to-bottom (0.3s) → left content staggers in → right content reveals via clip-path from line position
- Scroll transitions: Line slides to new position (0.8s, eased) → content fades/slides accordingly
- Hover: Subtle. Images `scale(1.02)`, links get animated underlines
- Page transitions: View Transitions API (Astro native support)

**Performance budget:**
- Total JS (compressed): < 80KB (Astro + GSAP + ScrollTrigger)
- LCP: < 2.0s on 4G mid-tier
- CLS: < 0.03
- No layout shift from line animation (position is CSS Grid, not absolute)

### 3.5 Images

- Format: WebP with AVIF fallback via `<picture>`
- Hero image: max 400KB, preloaded
- Project images: max 200KB each, lazy loaded
- Product UI screenshots: actual application screenshots, not mockups
- Team photos: CEO in color, others in B&W (grayscale via CSS filter, original stored in color)

---

## 4. Site Structure

```
archi-prisma.co.jp/
├── index.astro          (Top page — single scroll experience)
├── works/
│   └── index.astro      (All works — filterable grid)
├── products/
│   └── index.astro      (AI tools — Dark Space)
├── about/
│   └── index.astro      (Company detail)
└── contact/
    └── index.astro      (Contact info/form)
```

### Navigation
- Fixed header, 4 items: Works / Products / About / Contact
- Left: APDW logo mark
- Auto-inverts text color when entering Dark Space (CSS `mix-blend-mode` or scroll-aware class toggle)
- Mobile: Fixed bottom tab bar (not hamburger — architecture industry users benefit from persistent visible navigation)

### Audience routing
```
Developer/Business owner → Top → Works → Contact
Small arch firm           → Top → Products → AI Circle
```

---

## 5. Top Page — Section-by-Section

### 5.1 Hero

**Line position: 30 | 70**

Left zone (30%):
```
Archi-Prisma Design Works        ← ARCHI-PRISMA logotype image (brand asset)
Est. 2024                        ← Outfit 300, caption size
Tokyo / London                   ← Outfit 300, caption size
Architecture × Software          ← Syne 600, slightly larger
```
- Annotation-style layout. Each line precisely placed with generous vertical spacing.
- Left-aligned. Architectural drawing annotation feel.
- Not a "hero headline" — a structured identity statement.

Right zone (70%):
- Featured project image (Yacht Club night aerial CG or equivalent strongest piece)
- Bleeds to right viewport edge (breaks out of max-width container)
- Precisely cropped — not randomly sized

The line:
- `1px solid #7A5C5A` running vertically between zones
- Subtle but structurally essential

Load animation sequence:
1. Line draws from top to bottom (0.3s)
2. Text elements stagger in from left (0.05s intervals)
3. Image reveals via `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)` from line position rightward
4. Total: under 0.8s

### 5.2 Works Highlight

Three featured projects. Each has a DIFFERENT line position.

**Project 01: The Super Yacht Club**
Line position: 40 | 60

Left (40%):
```
01                               ← Syne 800, large (decorative number)

The Super
Yacht Club                       ← Syne 600, project title

Hospitality                      ← Outfit 300, metadata
Japan, 2024
Planning / Design

企画・設計・運営を一貫して       ← Noto Sans JP 400, storyline
手がける、海上クラブの全体構想。
```

Right (60%): Yacht Club CG render (different angle from Hero)

---

**Project 02: KOTSUBO Jacaranda Market Place**
Line position: 65 | 35 (REVERSED — image on left)

Left (65%): KOTSUBO building image (jacaranda trees, the distinctive purple)
Right (35%): Project data

The reversal demonstrates layout versatility within the same system.

---

**Project 03: Interior (best CG render)**
Line position: 20 | 80 (maximum image space)

Left (20%): Minimal text — project name, year only
Right (80%): The sepia Japanese traditional interior CG, near full-width

When the image is THIS good, the UI steps back. Not "invisible" — **disciplined**.

---

CTA: `すべての作品を見る →` — text link, Syne 500, with animated underline on hover.

### 5.3 Bridge: The Prism Moment

Line position: 50 | 50 (the only time it's centered)

The background splits:
- Left half: `#F8F6F3` (Light Space)
- Right half: `#0C0C0C` (Dark Space)

Text centered, straddling the line:
```
建築も、         ソフトウェアも。
(warm brown)     (warm gold on dark)
```

Left text is `#1A1A1A` on light background.
Right text is `#F0EEEB` on dark background.
The line itself transitions from `#7A5C5A` to `#C4A882` at this point.

This is the prism moment — white light splitting into spectrum. Brief. Impactful. No explanation needed.

Viewport height: ~50vh. Generous vertical padding. Let it breathe.

### 5.4 Products (Dark Space)

Full background: `#0C0C0C`. Line color: `#C4A882`.

**Header:**
ARCHI-PRISMA logotype (actual brand asset, light version) + "Software Development" in Syne 500.

**Compass**
Line position: 45 | 55

Left (45%):
```
COMPASS                          ← Product logo or Syne 700
工程管理

建築プロジェクトの全工程を
ガントチャートで可視化。
```

Right (55%): Actual Compass UI screenshot in a minimal browser frame.
The UI quality of the screenshot itself demonstrates software capability.

---

**KAKOME**
Line position: 60 | 40 (reversed)

Left (60%): KAKOME UI screenshot / example output
Right (40%): KAKOME enso logo + description

---

**KOZO**
Line position: 40 | 60

Similar pattern, structural calculation context.

---

CTA: `AI建築サークルで、すべてのツールが使い放題 →`
This is the conversion point for Primary B audience (small firms).

### 5.5 Team

Back to Light Space. Line color: `#7A5C5A`.

**Line position: 35 | 65**

Left (35%): CEO portrait photograph. Color. The thoughtful pose with glasses.
Large enough to feel personal, not a thumbnail.

Right (65%):
```
櫻本 聖成                        ← Syne 700
代表取締役社長                   ← Outfit 400

最年少でArchicadの代理店契約を    ← Noto Sans JP 400
締結。AI×Archicadの実装・教育・
アドオン開発を推進。
```

Below CEO section:
Team members in a compact row — small B&W photos + name + role + license.
International collaborators as text: "Jose A. Cruzat (Architecture) / Eugenie Van Harinxma (Interior Design, UK) / David Glover (Architecture & Project Design)"
Advisory: "尾ケ井 正敏 / 長行司 倫子 — Advisory & Legacy" in small text.

### 5.6 Company Info

**Line position: 50 | 50** (returning toward center)

Clean table layout:
```
社名      Archi-Prisma Design Works 株式会社
所在地    〒141-0021 東京都品川区上大崎2-6-7 SMA白金長者丸301
免許      一級建築士事務所登録 東京都知事登録 第6108号
管理建築士 国土交通大臣登録 第75397号
```

Partners: archisoft / BSI / Landcolor logos in a row, small, monochrome.

### 5.7 Contact + Footer

**Line: fades out (opacity 1 → 0 over final 100vh)**

The disappearance of the line = resolution. All elements unified in one space.

```
お問い合わせ                     ← Syne 700
info@archi-prisma.co.jp          ← Clickable mailto link

─────────────────────────────────

© 2024 Archi-Prisma Design Works
Tokyo / London
```

Minimal. Direct. No decoration.

---

## 6. Sub-pages

### 6.1 Works (/works/)
- Filterable grid of all 60+ projects
- Filter by: Era (1985-1999 / 2000-2009 / 2010-2024) and Type (Urban, Hotel, Commercial, Residential, etc.)
- Filter uses button presets, not dropdowns (ui-principles rule #1: choices > free input, rule #4: filter presets)
- Grid: 3 columns desktop, 2 tablet, 1 mobile
- Each card: image + title + year + type
- Click → project detail (future expansion, initially scrolls to anchor or opens modal)
- The dividing line is NOT present on sub-pages. It's a top-page signature.

### 6.2 Products (/products/)
- Dark Space throughout (ARCHI-PRISMA brand)
- Each product gets full treatment: logo, description, UI screenshots, feature list
- CTA to AI Architecture Circle sign-up
- Links to individual product pages/apps where applicable

### 6.3 About (/about/)
- Expanded company info: history, service list (all 10 categories), global network
- Timeline if warranted (not the main story, but available for those who dig)
- Full team profiles

### 6.4 Contact (/contact/)
- Email address (primary CTA)
- Office address with embedded map
- Future: contact form

---

## 7. Technical Architecture

### Stack
- **Framework:** Astro 5 (static site generation)
- **Styling:** Tailwind CSS 4 + custom CSS for the line system
- **Animation:** GSAP 3 + ScrollTrigger (line position, section reveals)
- **Smooth scroll:** Lenis (already in project dependencies)
- **3D:** None on initial launch. The line system IS the visual signature. WebGL is optional future enhancement.
- **Page transitions:** View Transitions API (native Astro)
- **Deployment:** GitHub Pages (existing CI/CD)

### The Line System implementation
```typescript
// Conceptual: ScrollTrigger drives CSS custom property
// Each section declares its line position
const sections = [
  { id: 'hero',     linePos: '30%' },
  { id: 'works-01', linePos: '40%' },
  { id: 'works-02', linePos: '65%' },
  { id: 'works-03', linePos: '20%' },
  { id: 'bridge',   linePos: '50%' },
  { id: 'products', linePos: '45%' },
  { id: 'team',     linePos: '35%' },
  { id: 'company',  linePos: '50%' },
  { id: 'footer',   linePos: '50%', opacity: 0 },
];

// GSAP ScrollTrigger updates --line-pos custom property
// CSS Grid reads: grid-template-columns: var(--line-pos) 1px 1fr
```

### File structure
```
src/
├── layouts/
│   └── Layout.astro            (Base layout with Lenis, fonts, meta)
├── components/
│   ├── Header.astro            (Fixed nav, space-aware color invert)
│   ├── DividingLine.astro      (The line element + GSAP controller)
│   ├── Hero.astro
│   ├── WorksHighlight.astro
│   ├── BrandBridge.astro
│   ├── Products.astro
│   ├── Team.astro
│   ├── CompanyInfo.astro
│   └── Footer.astro
├── pages/
│   ├── index.astro
│   ├── works/index.astro
│   ├── products/index.astro
│   ├── about/index.astro
│   └── contact/index.astro
├── lib/
│   ├── line-system.ts          (ScrollTrigger line position controller)
│   └── content.ts              (Content loading utilities)
├── styles/
│   └── global.css              (Tailwind + custom properties + line system CSS)
└── content/
    ├── works.json
    ├── team.json
    ├── partners.json
    ├── services.md
    └── about.md
```

---

## 8. Performance Targets

| Metric | Target | Method |
|--------|--------|--------|
| LCP | < 2.0s (4G mid-tier) | Preload hero image, static HTML |
| CLS | < 0.03 | CSS Grid (no layout shift from line animation) |
| JS bundle | < 80KB compressed | Astro islands (GSAP only loads on client) |
| First paint | < 0.5s | Static HTML, inline critical CSS |
| Image total | < 1.5MB initial viewport | WebP, lazy loading below fold |

---

## 9. Accessibility

- Contrast ratio: 4.5:1 minimum (verified for both Light and Dark spaces)
- Keyboard navigation: full tab order, visible focus indicators
- Screen reader: proper heading hierarchy (h1 → h2 → h3), aria labels
- Reduced motion: `prefers-reduced-motion` disables line animation, uses instant transitions
- The line is decorative (aria-hidden), content is accessible without it

---

## 10. SEO / OGP

- `<title>`: "Archi-Prisma Design Works | Architecture × Software — Tokyo / London"
- `<meta name="description">`: Company positioning in ~150 chars
- OGP image: 1200x630, APDW logotype on `#F8F6F3` background
- JSON-LD: Organization schema
- Sitemap: auto-generated by Astro
- robots.txt: allow all (already exists)
- lang: `ja` primary, bilingual content natural (no separate /en/ route)
