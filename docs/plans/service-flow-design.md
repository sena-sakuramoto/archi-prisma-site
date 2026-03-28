# SERVICE FLOW DESIGN SPECIFICATION

**Date**: 2026-03-28
**Section**: AI Page > SERVICE (section 5)
**Status**: DESIGN REVIEW (no code yet)

---

## Problem Statement

The current SERVICE section uses a GSAP-pinned horizontal carousel (scroll-triggered slide swap). While functional, it presents services as a flat list -- the user sees one card at a time, with no sense of *journey*, *branching*, or *depth of engagement*. Previous attempts to redesign were rejected for looking "cheap" (安っぽい). The fundamental issue: **the section communicates *what* we offer but not *how a customer's relationship with us deepens over time***.

### What the section must communicate

```
ENTRY (parallel, pick either or both):
  セミナー — one-time attendance OK. Circle members attend free.
  サークル — all tools + seminars. 5,000/month.

ORGANIZATION (sequential, triggered by need):
  法人研修 — training. Shared language across teams.
    ↓ (larger orgs with deeper needs)
  導入プログラム — 3-6 months. Full business transformation.

RETENTION (converging):
  保守顧問 — after either 研修 or 導入PG. Ongoing monthly support.

ON DEMAND:
  受託開発 — custom development when the need arises.
```

This is NOT a pricing table. It is a customer relationship topology.

---

## Reference Research

### Reference 1: Linear Method (linear.app/method)

**What**: Vertical editorial layout with numbered sections (1.1, 2.1, 3.1...) separated by spacer elements. Serif-display headings (Tiempos Headline) on dark background (#121212). Content progresses conceptually from "Direction" to "Building" to "Design."

**Applicable pattern**: Numbered typographic sections that create a reading rhythm. The progression feels like reading a well-structured essay, not navigating a product page. The 64px vertical spacer system creates breathing room.

**Key CSS**: CSS custom properties for color tokens (--color-text-primary through --color-text-quaternary), scoped component classes, serif-display font for hierarchy contrast against sans-serif body.

### Reference 2: Apple Product Pages (apple.com)

**What**: Full-viewport sections on black backgrounds. Each section fades in on scroll. Headlines are massive (48-56px), followed by smaller supporting text. Typography does all the work -- no boxes, no cards, no visible containers. Content reveals sequentially as the user scrolls.

**Applicable pattern**: The "scroll-reveal editorial" approach where each service occupies generous vertical space, uses typography scale to establish importance, and dark backgrounds create natural section boundaries without visible dividers. San Francisco font with strategic weight variation.

**Key CSS**: scroll-triggered opacity/transform animations, lazy-loaded assets, progressive disclosure through font-size hierarchy alone.

### Reference 3: Raycast (raycast.com)

**What**: Deep dark palette (rgb 7,9,10). Product capabilities unfold through a narrative structure -- hero establishes value, then sections demonstrate expanding functionality. Radial gradients create dimensional depth. Glassmorphism and chromatic aberration enhance premium feel.

**Applicable pattern**: The "depth layers" approach where the background itself creates spatial meaning -- deeper engagement = different visual treatment. Radial gradient backgrounds that subtly shift between sections.

**Key CSS**: background: rgb(7,9,10), radial-gradient backgrounds, inset/outer shadow systems, blur properties for translucent overlays.

### Reference 4: Stripe Homepage (stripe.com)

**What**: Modular card system with alternating full-width and constrained layouts. Strategic dark sections ("Stripe の最前線") break the rhythm and force attention. 16px-based spacing system. Gradient backgrounds (dark blue fading to light green/aquamarine) in wave patterns.

**Applicable pattern**: The "rhythm break" technique -- most sections are consistent, then one section shifts to dark/light treatment to signal importance. Also: nested accordions that reveal complexity progressively.

**Key CSS**: 16px-based spacing grid, 60-120px section padding, subtle gradient background imagery, progressive disclosure via accordion/expansion.

### Reference 5: Vercel Homepage (vercel.com)

**What**: Dark-first design with Geist font family. Features unfold as product categories (AI Apps, Web Apps, etc.). CSS gradient text effects using linear-gradient with background-clip: text (colors: #ef008f, #6ec3f4, #7038ff, #c9c9c9). Scroll-driven animations for section transitions.

**Applicable pattern**: Gradient text as a visual accent for key moments (not everywhere -- only at transition points). The "categorical unfolding" where each product category gets its own visual zone.

**Key CSS**: -webkit-background-clip: text, -webkit-text-fill-color: transparent, linear-gradient(90deg, ...), 8s infinite animation for color cycling.

### Reference 6: SVG Line Scroll Animation Pattern (CSS-only)

**What**: A vertical SVG path with pathLength="1" attribute, animated via stroke-dashoffset from 1 to 0 as the user scrolls. A circle element follows the path using offset-path. Cards at branching points reveal (opacity 0.3 to 1) when the circle reaches them. animation-timeline: scroll() controls everything -- zero JavaScript.

**Applicable pattern**: The connective tissue between service nodes. Instead of boxes-and-arrows, a single organic line that the user "draws" as they scroll. Cards/content appear as the line reaches branching points.

**Key CSS**: animation-timeline: scroll(), stroke-dasharray: 1, stroke-dashoffset keyframes, offset-path for follower element, animation-range for precise trigger timing.

---

## Three Design Approaches

---

### APPROACH A: "Topographic Depth Map"

**Concept**: The entire section is a single tall vertical composition on a dark surface (#0C0C0C). Services are positioned at different *visual depths* -- entry services (seminar, circle) are at the "surface" (full opacity, large type, positioned normally). As the user scrolls down, services that represent deeper engagement are rendered with progressively different treatment: slightly inset, different typographic weight, a faint luminous line connecting related nodes.

There are no boxes. No cards. No visible containers. Each service is a typographic block:
- A large Japanese heading (the service name)
- A small English label (the engagement stage)
- A one-line description
- A subtle horizontal hairline rule below

The *relationship* between services is expressed through:
1. **Vertical position** = chronological/depth order
2. **Horizontal offset** = branching (研修 and 導入PG are offset right of center; 受託開発 is offset left)
3. **A single thin SVG line** (1px, rgba(196,168,130,0.15)) that connects the nodes -- it branches at the 研修→導入PG point, then converges at 保守顧問

The SVG line animates via CSS scroll-driven animation (stroke-dashoffset) as the user scrolls. No JavaScript needed.

**HTML Structure Sketch**:
```
<section class="svc-depth" data-section="service">
  <div class="svc-depth__canvas">
    <!-- The connective SVG line (absolute, behind content) -->
    <svg class="svc-depth__line" viewBox="0 0 800 2400" preserveAspectRatio="none">
      <path class="svc-depth__path" d="..." pathLength="1" />
    </svg>

    <!-- Entry layer (two nodes side by side) -->
    <div class="svc-depth__layer svc-depth__layer--entry">
      <span class="svc-depth__label">ENTRY</span>
      <div class="svc-depth__pair">
        <article class="svc-depth__node">
          <span class="svc-depth__en">Seminar</span>
          <h3 class="svc-depth__name">AI x 建築セミナー</h3>
          <p class="svc-depth__desc">...</p>
        </article>
        <article class="svc-depth__node">
          <span class="svc-depth__en">Circle</span>
          <h3 class="svc-depth__name">AI x 建築サークル</h3>
          <p class="svc-depth__desc">...</p>
          <span class="svc-depth__price">月額 5,000円</span>
        </article>
      </div>
    </div>

    <!-- Org layer -->
    <div class="svc-depth__layer svc-depth__layer--org">
      <span class="svc-depth__label">ORGANIZATION</span>
      <article class="svc-depth__node svc-depth__node--inset">...</article>
      <article class="svc-depth__node svc-depth__node--deep">...</article>
    </div>

    <!-- Retention layer (converging) -->
    <div class="svc-depth__layer svc-depth__layer--retain">
      <span class="svc-depth__label">RETENTION</span>
      <article class="svc-depth__node">...</article>
    </div>

    <!-- On-demand layer (offset left) -->
    <div class="svc-depth__layer svc-depth__layer--demand">
      <article class="svc-depth__node svc-depth__node--aside">...</article>
    </div>
  </div>
</section>
```

**CSS Approach**:
- Background: var(--color-surface-dark) (#0C0C0C)
- SVG line: stroke: var(--color-accent-dark) at 15% opacity, stroke-width: 1, animated via `animation-timeline: view()` with `stroke-dashoffset` keyframes
- Typography: Service names in var(--font-jp) at clamp(1.3rem, 2.5vw, 2rem), weight 700. Descriptions at var(--text-body), weight 300, color var(--color-ink-muted-dark). English labels in var(--font-display) at 0.6rem, letter-spacing 0.35em, color var(--color-accent-dark)
- Layers: Each layer has padding-top: clamp(6rem, 10vw, 12rem) for breathing room
- Horizontal offset: CSS grid with named areas; --org nodes use grid-column: 2 / 3 on a 3-column grid to shift right
- Reveal: Each node uses the existing .reveal class (opacity 0, translateY 24px, visible on intersection)

**Branching visualization**: At the org layer, the SVG path forks into two sub-paths (Y-shape). The left fork reaches 法人研修, then continues to a short connector between 研修 and 導入PG. The right sub-path reconnects at 保守顧問.

**Convergence visualization**: Both the 研修 path and the 導入PG path merge into a single point above 保守顧問. Visually this is a simple inverted-Y in the SVG.

**Mobile adaptation**: On screens < 768px, horizontal offsets collapse. All nodes stack vertically centered. The SVG line becomes a straight vertical line with small circles at each node. The branching is communicated through indentation (padding-left) rather than horizontal position.

**Pros**:
- Most architecturally resonant. The topographic metaphor communicates depth without flowchart aesthetics.
- SVG line animation via CSS scroll API = zero JS, smooth 60fps.
- Maximally editorial -- feels like a magazine feature, not a SaaS page.
- The spatial layout makes branching/convergence intuitive.

**Cons**:
- SVG path coordinates are manual -- must be carefully tuned to match content positions.
- Responsive behavior requires separate SVG viewBox or path for mobile.
- Browser support: CSS scroll-driven animations require Chrome 115+ / Edge 115+. Safari and Firefox need fallback (static line, no animation). Fallback is graceful -- the line is just visible immediately.
- The spatial layout can feel abstract to users who expect a structured list.

---

### APPROACH B: "Editorial Strata"

**Concept**: Inspired by Apple product pages and the Linear Method. Each service occupies a full-viewport (or near-full) vertical section. As the user scrolls, they move through *geological strata* -- each stratum has a subtly different background treatment, creating the feeling of descending into deeper engagement.

The background shifts are not dramatic gradient transitions. They are barely perceptible tonal changes: #0C0C0C (entry) -> #0A0A0A (org) -> #080808 (retention). Each stratum border is marked by a single full-width hairline rule (1px, rgba(196,168,130,0.06)) that fades in on scroll.

Services within each stratum follow a strict editorial grid:
- Left column (30%): Stage label + abstract number (01, 02, 03...)
- Right column (70%): Service name (large), one-line value prop, description

The entry stratum is special: it shows two services side-by-side (seminar | circle) separated by a vertical hairline, echoing the site's existing dividing-line system.

Branching (研修 → 導入PG) is expressed through a small connector element between the two nodes -- a vertical line segment (height: 48px) with a subtle "or if deeper..." caption.

**HTML Structure Sketch**:
```
<section class="svc-strata" data-section="service">
  <!-- Stratum: Entry -->
  <div class="svc-stratum svc-stratum--entry">
    <div class="svc-stratum__inner">
      <div class="svc-stratum__meta">
        <span class="svc-stratum__label">ENTRY</span>
        <span class="svc-stratum__num">01</span>
      </div>
      <div class="svc-stratum__content svc-stratum__content--dual">
        <article class="svc-stratum__item">
          <h3>AI x 建築セミナー</h3>
          <p class="svc-stratum__step">AIで何が変わるかを知る</p>
          <p class="svc-stratum__desc">...</p>
        </article>
        <div class="svc-stratum__divider" aria-hidden="true"></div>
        <article class="svc-stratum__item">
          <h3>AI x 建築サークル</h3>
          <p class="svc-stratum__step">まず、自分が触る</p>
          <p class="svc-stratum__desc">...</p>
          <span class="svc-stratum__price">月額 5,000円</span>
        </article>
      </div>
    </div>
  </div>

  <!-- Stratum: Organization -->
  <div class="svc-stratum svc-stratum--org">
    <div class="svc-stratum__inner">
      <div class="svc-stratum__meta">
        <span class="svc-stratum__label">ORGANIZATION</span>
        <span class="svc-stratum__num">02</span>
      </div>
      <div class="svc-stratum__content">
        <article class="svc-stratum__item">
          <h3>法人研修</h3>
          ...
        </article>
        <div class="svc-stratum__connector" aria-hidden="true">
          <span class="svc-stratum__connector-line"></span>
          <span class="svc-stratum__connector-text">さらに深く</span>
        </div>
        <article class="svc-stratum__item">
          <h3>AI導入プログラム</h3>
          ...
        </article>
      </div>
    </div>
  </div>

  <!-- Stratum: Retention -->
  <div class="svc-stratum svc-stratum--retain">...</div>

  <!-- Stratum: On-demand -->
  <div class="svc-stratum svc-stratum--demand">...</div>
</section>
```

**CSS Approach**:
- Each stratum: min-height 70vh (not full vh -- allows peek of next stratum), padding: clamp(6rem, 10vw, 10rem) 0
- Background tonal shift: --stratum-bg custom property per stratum (#0C0C0C, #0A0A0A, #080808, #0B0B0B)
- Hairline borders: border-top: 1px solid rgba(196,168,130,0.06)
- Grid: 30% / 70% on desktop; stack on mobile
- Stage numbers (01, 02...): var(--font-display) at clamp(3rem, 6vw, 5rem), weight 800, color rgba(196,168,130,0.08) -- ghosted watermark
- Connector element: height 48px, width 1px, background linear-gradient(to bottom, var(--color-accent-dark), transparent), centered between 研修 and 導入PG
- Connector text: font-size 0.6rem, letter-spacing 0.3em, color var(--color-ink-muted-dark), rotated -90deg or placed beside the line

**Branching**: Within the ORG stratum, 法人研修 and 導入PG are stacked vertically with the connector between them. The connector implies sequence (研修 first, then optionally 導入PG). No explicit arrows.

**Convergence**: The RETENTION stratum has a subtle annotation: "研修後でも、導入後でも" set in small muted text above the heading. This textually communicates that both paths lead here, without needing a visual merge graphic.

**Mobile adaptation**: Straightforward. Grid collapses to single column. Stage labels move above content. Connector element remains as a vertical line between stacked items.

**Pros**:
- Most structurally clear. Each engagement level is visually distinct.
- Leverages the existing site's design language (hairline rules, grid-based, font-jp headings).
- Simple responsive behavior -- no complex SVG or positioning changes needed.
- The tonal background shift is elegant and nearly imperceptible, but creates a genuine "descent" feeling.
- Easiest to implement and maintain.

**Cons**:
- Less visually dramatic than Approach A. Could feel like a styled list.
- The branching/convergence is communicated textually rather than spatially -- less intuitive.
- The full-viewport-per-stratum model means lots of scrolling. On a page that already has HERO + PROOF + MANIFESTO + VISION before the SERVICE section, adding 4 more viewport-sized sections could feel exhausting.
- Parallel entry services (seminar + circle) side-by-side may not work well on narrow tablets.

---

### APPROACH C: "Architectural Section Drawing" (RECOMMENDED)

**Concept**: The metaphor is an architectural section drawing -- a vertical cut through a building that reveals its layers. The viewer looks at a single composition that shows all services simultaneously, but at different *elevations*. The scroll interaction is not per-section pinning, but rather a subtle ambient animation where a luminous accent (a thin horizontal beam of light) descends through the composition as the user scrolls, illuminating each service level as it passes.

The layout is a single viewport-height sticky section with a tall scrollable container behind it (similar to the current carousel, but the visual is a static composition that gets "scanned" by light).

**The composition**:

```
     ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌

     ENTRY                  セミナー    |    サークル
                            ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
                                        |
     ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

     ORGANIZATION               法人研修
                                    |
                              導入プログラム

     ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

     RETENTION                保守顧問
                          (研修後でも導入後でも)

     ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

     ON DEMAND                受託開発

     ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
```

All services are visible at once, but in a muted, dormant state (color: rgba(240,238,235,0.15)). As the user scrolls through the tall container, a CSS-animated horizontal luminous line descends through the sticky composition. When the line reaches a service level, that level illuminates (transitions to full opacity over ~0.3s). After the line passes, the level dims back slightly but remains more visible than before (settles at 0.5 opacity).

The currently-illuminated level shows expanded detail: the description text, price (if any), and a subtle border-left accent in var(--color-accent-dark). Non-active levels show only the name.

**Architectural quality**: This evokes a section drawing because:
1. All layers are visible simultaneously -- you see the whole building at once
2. The vertical ordering maps to engagement depth, like floor levels
3. Thin horizontal rules separate levels, like floor plates in a section
4. The luminous scan line references a laser level or datum line -- architectural tools
5. The composition is static and restrained -- not animated cards flying around

**HTML Structure Sketch**:
```
<section class="svc-arch" data-section="service">
  <div class="svc-arch__scroll-height">
    <!-- This element is tall (400vh) to create scroll distance -->
  </div>
  <div class="svc-arch__sticky">
    <div class="svc-arch__frame">
      <!-- Section heading -->
      <div class="svc-arch__header">
        <span class="section-label">SERVICE</span>
        <h2 class="svc-arch__title">関わり方を、選べる。</h2>
      </div>

      <!-- The luminous scan line (absolute, animated by GSAP ScrollTrigger) -->
      <div class="svc-arch__scanline" aria-hidden="true"></div>

      <!-- Service levels -->
      <div class="svc-arch__levels">

        <!-- Level: Entry (two items horizontal) -->
        <div class="svc-arch__level" data-level="entry">
          <div class="svc-arch__level-meta">
            <span class="svc-arch__level-label">ENTRY</span>
          </div>
          <div class="svc-arch__level-body svc-arch__level-body--dual">
            <div class="svc-arch__item" data-svc="seminar">
              <h3 class="svc-arch__item-name">AI x 建築セミナー</h3>
              <div class="svc-arch__item-detail">
                <p class="svc-arch__item-step">AIで何が変わるかを知る</p>
                <p class="svc-arch__item-desc">単発参加OK。サークル会員は月額内で受講可能。</p>
              </div>
            </div>
            <div class="svc-arch__level-split" aria-hidden="true"></div>
            <div class="svc-arch__item" data-svc="circle">
              <h3 class="svc-arch__item-name">AI x 建築サークル</h3>
              <div class="svc-arch__item-detail">
                <p class="svc-arch__item-step">まず、自分が触る</p>
                <p class="svc-arch__item-desc">全ツール使い放題。Discord + 月1イベント + セミナー受講。</p>
                <span class="svc-arch__item-price">月額 5,000円</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Level: Organization (two items vertical with connector) -->
        <div class="svc-arch__level" data-level="org">
          <div class="svc-arch__level-meta">
            <span class="svc-arch__level-label">ORGANIZATION</span>
          </div>
          <div class="svc-arch__level-body">
            <div class="svc-arch__item" data-svc="training">
              <h3 class="svc-arch__item-name">法人研修</h3>
              <div class="svc-arch__item-detail">...</div>
            </div>
            <div class="svc-arch__level-connector" aria-hidden="true">
              <span class="svc-arch__connector-line"></span>
              <span class="svc-arch__connector-note">さらに深く</span>
            </div>
            <div class="svc-arch__item" data-svc="program">
              <h3 class="svc-arch__item-name">AI導入プログラム</h3>
              <div class="svc-arch__item-detail">...</div>
            </div>
          </div>
        </div>

        <!-- Level: Retention -->
        <div class="svc-arch__level" data-level="retain">
          <div class="svc-arch__level-meta">
            <span class="svc-arch__level-label">RETENTION</span>
          </div>
          <div class="svc-arch__level-body">
            <div class="svc-arch__item" data-svc="advisory">
              <h3 class="svc-arch__item-name">AI保守顧問</h3>
              <div class="svc-arch__item-detail">
                <p class="svc-arch__item-convergence">
                  研修後でも、導入後でも。
                </p>
                ...
              </div>
            </div>
          </div>
        </div>

        <!-- Level: On-demand -->
        <div class="svc-arch__level" data-level="demand">
          <div class="svc-arch__level-meta">
            <span class="svc-arch__level-label">ON DEMAND</span>
          </div>
          <div class="svc-arch__level-body">
            <div class="svc-arch__item" data-svc="bespoke">
              <h3 class="svc-arch__item-name">受託開発</h3>
              <div class="svc-arch__item-detail">...</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</section>
```

**CSS Approach**:

Background and frame:
- Background: var(--color-surface-dark) (#0C0C0C)
- The frame (.svc-arch__frame) has max-width: 900px, centered, with a faint border: 1px solid rgba(196,168,130,0.04). This creates the "drawing frame" metaphor
- Padding: clamp(3rem, 5vw, 5rem) internal padding

Scroll mechanics:
- .svc-arch: position relative
- .svc-arch__scroll-height: height 350vh (creates scroll distance)
- .svc-arch__sticky: position sticky, top 0, height 100vh, display flex, align-items center
- Scan line position: controlled by GSAP ScrollTrigger mapping scroll progress to CSS custom property --scan-y (0% to 100%)

Scan line:
- .svc-arch__scanline: position absolute, left 0, right 0, height 1px
- background: linear-gradient(90deg, transparent 0%, var(--color-accent-dark) 20%, var(--color-accent-dark) 80%, transparent 100%)
- box-shadow: 0 0 20px rgba(196,168,130,0.15), 0 0 60px rgba(196,168,130,0.05) -- creates the "luminous" glow
- transform: translateY(var(--scan-y)) -- driven by scroll

Level states:
- Default: opacity 0.12, transition: opacity 0.4s var(--ease)
- Active (scan line is at this level): opacity 1
- Passed (scan line has moved past): opacity 0.55
- State toggled via GSAP ScrollTrigger onEnter/onLeave callbacks, applying .svc-arch__level--dormant / --active / --passed classes

Typography:
- Level label: var(--font-display), 0.55rem, weight 600, letter-spacing 0.35em, uppercase, color var(--color-accent-dark)
- Service name: var(--font-jp), clamp(1.1rem, 1.8vw, 1.4rem), weight 700, color var(--color-ink-dark)
- Detail text: var(--font-jp), var(--text-body), weight 300, color var(--color-ink-muted-dark), max-height 0 when dormant, auto when active (with overflow hidden and transition)
- Step text: var(--font-jp), 0.85rem, weight 400, color var(--color-accent-dark), opacity 0.8
- Price: var(--font-body), 0.8rem, weight 400, color var(--color-accent-dark)

Level spacing:
- Each level: padding 2rem 0
- Level separator: 1px solid rgba(255,255,255,0.04) -- thin floor plate lines
- Between 研修 and 導入PG within the ORG level: connector line (height 32px, width 1px, margin 1.5rem auto, background linear-gradient(to bottom, rgba(196,168,130,0.2), transparent))

Entry level dual layout:
- display: grid, grid-template-columns: 1fr 1px 1fr, gap 2rem
- The center 1px column (.svc-arch__level-split): background rgba(255,255,255,0.04), a vertical divider between the two entry options

Active state detail expansion:
- .svc-arch__item-detail: max-height 0, opacity 0, overflow hidden, transition: max-height 0.5s var(--ease), opacity 0.3s var(--ease)
- .svc-arch__level--active .svc-arch__item-detail: max-height 200px, opacity 1
- Active level also gets: border-left: 2px solid var(--color-accent-dark) on the .svc-arch__item, with padding-left: 1.5rem

**Branching visualization**: Within the ORG level, 法人研修 and 導入プログラム are stacked vertically with the connector line between them. The connector line is a thin vertical gradient (accent color to transparent). The small text "さらに深く" beside the line communicates that 導入PG is an escalation from 研修, not an alternative. When this level is active, both services expand their details, but 導入PG has a slightly indented left margin (padding-left: 1rem extra) to visually subordinate it as a deeper variant.

**Convergence visualization**: The 保守顧問 level shows the text "研修後でも、導入後でも。" as its step text, communicating convergence textually. Visually, the level separator above 保守顧問 uses a slightly different treatment: two thin lines converging into one (achieved with a small inline SVG -- a simple inverted Y, 40px tall, using two stroked paths that meet at a center point). This is static, not animated, and rendered at rgba(196,168,130,0.1) -- barely perceptible but architecturally meaningful.

**受託開発 positioning**: This service sits below the main progression, separated by additional space (padding-top: clamp(3rem, 5vw, 5rem)). Its level label reads "ON DEMAND" and the overall treatment is lighter/more separated -- communicating that it is outside the main journey, available when needed.

**Mobile adaptation**:
- Frame border removed (too constrained on small screens)
- Entry dual grid collapses to single column (1fr) with a horizontal rule between the two items instead of a vertical split
- Scan line replaced by a simpler interaction: levels fade in sequentially as each scrolls into the viewport (using existing .reveal pattern)
- Connector between 研修 and 導入PG remains as a vertical line
- Overall padding reduced
- The convergence SVG Y-shape is hidden on mobile; the textual "研修後でも、導入後でも" suffices

**Pros**:
- The strongest architectural metaphor. An actual section drawing -- the audience (architects) will recognize and appreciate it.
- All services visible simultaneously = better overview comprehension than carousel.
- The scan line animation is subtle and purposeful, not gratuitous.
- Leverages existing GSAP + ScrollTrigger (already in the project).
- Detail expansion means the dormant state is clean and minimal. No visual clutter.
- The frame + levels + floor-plate-lines composition is genuinely premium.
- Both branching and convergence are handled with clear visual logic.

**Cons**:
- Requires careful vertical sizing to fit all levels within one viewport. On shorter screens (laptops with 768px height), the frame might feel cramped. Mitigation: use container queries or a min-height media query to switch to a scrolling (non-sticky) mode on short viewports.
- The scroll-to-scan-line mapping requires precise GSAP calibration.
- The convergence Y-shape SVG, while small, is one more bespoke element to maintain.
- The "all visible but dimmed" pattern could feel unclear to users who expect each section to be fully legible on first view. Mitigation: add a small "SCROLL" hint (matching existing hero scroll hint pattern) at the top of the frame.

---

## Recommendation: APPROACH C

**Justification**:

1. **Audience resonance**: The target audience is architects and construction professionals. An architectural section drawing is the most natural visual metaphor for them. It communicates professionalism and domain expertise without saying a word.

2. **Information architecture**: Unlike the current carousel (one service at a time) or Approach B (one per viewport), Approach C shows all services simultaneously. This lets the viewer understand the entire engagement topology at a glance -- then scroll to explore details. This matches how architects read drawings: overview first, then zoom in.

3. **Premium without gimmicks**: The scan line is the only animated element. Everything else is static typography and thin rules. This aligns with the project's design rules (no CSS gimmicks, win with proportion/spacing/restraint).

4. **Branching/convergence clarity**: The vertical stacking within the ORG level, the connector element, and the convergence Y-shape handle the topology naturally. No flowchart arrows needed.

5. **Technical fit**: Uses GSAP ScrollTrigger (already imported), existing CSS custom properties, existing typography and color system. The scroll-pinned sticky pattern is already proven in the current carousel section.

6. **Mobile degradation is graceful**: The mobile version simply becomes a reveal-on-scroll vertical list -- the simplest possible pattern, using the existing .reveal system.

---

## Implementation Notes (for Codex)

### Dependencies
- GSAP + ScrollTrigger (already imported)
- No new libraries required

### Files to modify
- `src/pages/ai/index.astro` -- replace section 5 (SERVICE) HTML + CSS + JS

### CSS tokens to use (from global.css)
- --color-surface-dark: #0C0C0C
- --color-ink-dark: #F0EEEB
- --color-ink-muted-dark: #8A8580
- --color-accent-dark: #C4A882
- --font-display: 'Syne'
- --font-jp: 'Noto Sans JP'
- --font-body: 'Outfit'
- --text-body: clamp(0.9rem, 1vw, 1.1rem)
- --ease: cubic-bezier(0.22, 1, 0.36, 1)
- --duration-normal: 0.5s

### Accessibility
- aria-label on the section
- aria-hidden on decorative elements (scan line, connector lines, convergence SVG)
- All service content is in the DOM and accessible to screen readers regardless of visual state
- prefers-reduced-motion: show all levels at full opacity, no animation, no sticky pinning
- Keyboard navigable: each service item is focusable

### Performance
- No images in this section (pure typography + SVG)
- SVG is inline (no external fetch)
- Scroll listener is via GSAP ScrollTrigger (throttled, rAF-based)
- CSS transitions use transform and opacity only (compositor-friendly)

### Fallback
- No-JS: all levels shown at full opacity (via noscript style block or :has() selector)
- Short viewport (< 700px height): disable sticky, let the composition scroll naturally with levels fading in via IntersectionObserver

---

## Sources

- [Linear Method](https://linear.app/method) -- editorial section layout, numbered typography
- [Linear Features](https://linear.app/features) -- dark theme feature cards, visual hierarchy
- [Linear Style](https://linear.style/) -- dark mode colors (#121212), Inter typography, spacing system
- [Apple Design Analysis](https://www.dbswebsite.com/blog/how-to-design-a-website-like-apples/) -- scroll-reveal, progressive disclosure, San Francisco typography
- [Raycast](https://raycast.com/) -- deep dark palette rgb(7,9,10), radial gradient depth, narrative structure
- [Stripe](https://stripe.com/) -- modular cards, rhythm-break dark sections, 16px spacing
- [Vercel](https://vercel.com/) -- gradient text (background-clip), Geist fonts, dark-first
- [Vercel Gradient CSS](https://kevinhufnagl.com/verceltext-gradient/) -- gradient text implementation detail
- [SVG Line Scroll Animation](https://medium.com/@r_tripti/scroll-triggered-css-animation-svg-line-reveals-card-requested-by-you-6950d51a1241) -- CSS-only scroll-driven SVG path animation
- [Section Scroll Progress](https://frontendmasters.com/blog/using-css-scroll-driven-animations-for-section-based-scroll-progress-indicators/) -- animation-timeline: view(), scaleY progress bars
- [CSS Scroll-Driven Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) -- MDN reference
- [Smashing Magazine Scroll Animations](https://www.smashingmagazine.com/2024/12/introduction-css-scroll-driven-animations/) -- scroll/view timeline patterns
