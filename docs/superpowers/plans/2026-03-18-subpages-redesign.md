# Subpages Full Redesign — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform all 4 subpages (Works, Products, About, Contact) from placeholder-quality to award-worthy, matching the home page's WebGL/GSAP/scroll-driven design language.

**Architecture:** Each page gets scroll-driven GSAP animations, large typography, immersive image treatments, and cohesive dark/light transitions. Reuse existing design tokens (CSS vars), GSAP + ScrollTrigger (already installed), and Lenis smooth scroll.

**Tech Stack:** Astro 5, GSAP ScrollTrigger, Tailwind CSS 4, existing CSS custom properties

---

## Chunk 1: Works Page (`/works/`)

### Task 1: Works Page — Featured Projects Hero + Immersive Grid

**Files:**
- Rewrite: `src/pages/works/index.astro`

**Current problems:**
- Basic grid, no visual hierarchy
- Most projects = grey placeholder boxes
- No scroll animations
- Era filter feels like an afterthought

**Design:**
- Top: 3 featured projects as large hero cards (full-width stacked, with images bleeding edge-to-edge, text overlay with gradient)
- Filter bar: sticky on scroll, cleaner pill-style buttons
- Grid: 2-col on tablet, 3-col on desktop. Projects WITHOUT images get a typographic treatment (large year + project name) instead of grey boxes
- All cards get scroll-reveal (`.reveal` class)
- Image cards get hover zoom + overlay

- [ ] **Step 1: Rewrite works/index.astro with featured hero section + improved grid**
- [ ] **Step 2: Add GSAP scroll reveals and Lenis init**
- [ ] **Step 3: Build check**
- [ ] **Step 4: Commit**

---

## Chunk 2: Products Page (`/products/`)

### Task 2: Products Page — Immersive Dark Space with Scroll Reveals

**Files:**
- Rewrite: `src/pages/products/index.astro`

**Current problems:**
- Flat layout, no scroll animation
- All products look the same weight
- CTA section is generic

**Design:**
- Hero: Large "Products" heading with subtitle, full dark-space
- Each product: alternating layout (left/right), scroll-reveal with stagger
- Products WITH screenshots: image takes 60% width, dramatic presentation
- Products WITHOUT: typographic card with large product name + tagline
- CTA: dramatic full-width section with AI建築サークル pitch
- Smooth scroll init with Lenis

- [ ] **Step 1: Rewrite products/index.astro with immersive layout**
- [ ] **Step 2: Add scroll reveals**
- [ ] **Step 3: Build check**
- [ ] **Step 4: Commit**

---

## Chunk 3: About Page (`/about/`)

### Task 3: About Page — Cinematic Company Story

**Files:**
- Rewrite: `src/pages/about/index.astro`

**Current problems:**
- No visual impact at top
- Services list is generic numbered list
- Team section duplicates home page

**Design:**
- Hero: Full-bleed image (yacht-club-aerial-day) with parallax scroll effect (CSS transform driven by ScrollTrigger)
- "MOVE HEARTS" as massive overlay text on the hero image
- Company story: large pull-quote style, staggered reveal
- Services: clean grid with hover highlights instead of numbered list
- Team: CEO gets dramatic treatment (large portrait), members in clean grid
- Global Network: side-by-side cards with subtle border animations

- [ ] **Step 1: Rewrite about/index.astro with cinematic hero + improved sections**
- [ ] **Step 2: Add parallax + scroll reveals**
- [ ] **Step 3: Build check**
- [ ] **Step 4: Commit**

---

## Chunk 4: Contact Page (`/contact/`)

### Task 4: Contact Page — Dramatic Minimalism

**Files:**
- Rewrite: `src/pages/contact/index.astro`

**Current problems:**
- Too plain, no visual interest
- "フォーム準備中" feels unfinished

**Design:**
- Split layout on desktop: left = dark panel with large email + address, right = curated architecture image
- Mobile: stacked, image on top
- Email address: massive typography, animated underline on hover
- Remove "フォーム準備中" — just present the email as the primary CTA
- Add social/professional links if available

- [ ] **Step 1: Rewrite contact/index.astro with split layout**
- [ ] **Step 2: Build check**
- [ ] **Step 3: Commit**

---

## Final: Build + Push

- [ ] **Step 1: Full build check**
- [ ] **Step 2: Commit all changes**
- [ ] **Step 3: Push to remote**
