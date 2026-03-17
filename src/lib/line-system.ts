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
  { id: 'hero',              linePos: '30%' },
  { id: 'works-01',          linePos: '40%' },
  { id: 'works-02',          linePos: '65%' },
  { id: 'works-03',          linePos: '20%' },
  { id: 'bridge',            linePos: '50%' },
  { id: 'products-compass',  linePos: '45%', lineColor: '#C4A882' },
  { id: 'products-kakome',   linePos: '60%', lineColor: '#C4A882' },
  { id: 'products-kozo',     linePos: '40%', lineColor: '#C4A882' },
  { id: 'team',              linePos: '35%', lineColor: '#7A5C5A' },
  { id: 'company',           linePos: '50%' },
  { id: 'contact',           linePos: '50%', lineOpacity: 0 },
];

/**
 * Convert a percentage line position to actual pixel position
 * relative to the .line-section container (not the viewport).
 * This ensures the fixed overlay line aligns with the CSS Grid column boundary
 * on all viewport widths, including screens wider than max-width.
 */
function toPixel(linePos: string): number {
  const ref = document.querySelector('.line-section');
  if (!ref) return parseFloat(linePos) / 100 * window.innerWidth;
  const rect = ref.getBoundingClientRect();
  return rect.left + rect.width * (parseFloat(linePos) / 100);
}

export function initLineSystem(sections: SectionConfig[] = DEFAULT_SECTIONS) {
  if (!window.matchMedia('(min-width: 768px)').matches) return;

  const line = document.getElementById('dividing-line');
  if (!line) return;

  // Resolve which sections actually exist in the DOM
  const resolved = sections
    .map(s => ({ ...s, el: document.getElementById(s.id) }))
    .filter((s): s is SectionConfig & { el: HTMLElement } => s.el !== null);

  if (resolved.length === 0) return;

  // 1. Lock each section's grid columns to its own position (never changes)
  resolved.forEach((section) => {
    const grid = section.el.querySelector('.line-section') ?? section.el.closest('.line-section');
    if (grid instanceof HTMLElement) {
      grid.style.setProperty('--line-pos', section.linePos);
    }
  });

  // 2. Set initial line position (no animation, instant)
  gsap.set(line, {
    left: toPixel(resolved[0].linePos),
    backgroundColor: resolved[0].lineColor || '#7A5C5A',
    opacity: 1,
  });

  // 3. Create scroll-interpolated transitions between adjacent sections.
  //    As you scroll from section A's center to section B's center,
  //    the line smoothly moves from A's position to B's position.
  for (let i = 0; i < resolved.length - 1; i++) {
    const from = resolved[i];
    const to = resolved[i + 1];

    // Position interpolation
    gsap.fromTo(line,
      { left: () => toPixel(from.linePos) },
      {
        left: () => toPixel(to.linePos),
        ease: 'none',
        scrollTrigger: {
          trigger: from.el,
          endTrigger: to.el,
          start: 'center center',
          end: 'center center',
          scrub: 0.8, // 0.8s smooth lag
          invalidateOnRefresh: true, // recalculate pixel positions on resize
        },
      }
    );

    // Opacity interpolation (for footer fade-out)
    const fromOpacity = from.lineOpacity ?? 1;
    const toOpacity = to.lineOpacity ?? 1;
    if (fromOpacity !== toOpacity) {
      gsap.fromTo(line,
        { opacity: fromOpacity },
        {
          opacity: toOpacity,
          ease: 'none',
          scrollTrigger: {
            trigger: from.el,
            endTrigger: to.el,
            start: 'center center',
            end: 'center center',
            scrub: 0.8,
          },
        }
      );
    }

    // Color interpolation (light → dark space transition)
    const fromColor = from.lineColor || '#7A5C5A';
    const toColor = to.lineColor || '#7A5C5A';
    if (fromColor !== toColor) {
      gsap.fromTo(line,
        { backgroundColor: fromColor },
        {
          backgroundColor: toColor,
          ease: 'none',
          scrollTrigger: {
            trigger: from.el,
            endTrigger: to.el,
            start: 'center center',
            end: 'center center',
            scrub: 0.8,
          },
        }
      );
    }
  }
}

export function destroyLineSystem() {
  ScrollTrigger.getAll().forEach(t => t.kill());
}
