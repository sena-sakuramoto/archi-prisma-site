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
  { id: 'bridge',     linePos: '50%' },
  { id: 'products-compass', linePos: '45%', lineColor: '#C4A882' },
  { id: 'products-kakome',  linePos: '60%', lineColor: '#C4A882' },
  { id: 'products-kozo',    linePos: '40%', lineColor: '#C4A882' },
  { id: 'team',       linePos: '35%' },
  { id: 'company',    linePos: '50%' },
  { id: 'contact',    linePos: '50%', lineOpacity: 0 },
];

export function initLineSystem(sections: SectionConfig[] = DEFAULT_SECTIONS) {
  if (!window.matchMedia('(min-width: 768px)').matches) return;

  const line = document.getElementById('dividing-line');
  if (!line) return;

  // Ensure each section's .line-section has its OWN --line-pos locked in.
  // The grid columns never change — only the fixed overlay line animates.
  sections.forEach((section) => {
    const el = document.getElementById(section.id);
    if (!el) return;

    // Lock this section's grid to its own line position
    const lineSection = el.querySelector('.line-section') ?? el.closest('.line-section');
    if (lineSection instanceof HTMLElement) {
      lineSection.style.setProperty('--line-pos', section.linePos);
    }

    ScrollTrigger.create({
      trigger: el,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => animateLine(line, section),
      onEnterBack: () => animateLine(line, section),
    });
  });

  // Initial state
  animateLine(line, sections[0]);
}

/**
 * Only animates the fixed overlay line.
 * Does NOT touch any section's grid columns — those are locked per-section.
 */
function animateLine(line: HTMLElement, section: SectionConfig) {
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
}

export function destroyLineSystem() {
  ScrollTrigger.getAll().forEach(t => t.kill());
}
