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

/**
 * Calculate the pixel position of the line, aligned to the container grid.
 * The grid lives inside a container with max-width and padding.
 * The fixed overlay line must match the grid column boundary exactly.
 */
function calcLinePixelPos(linePos: string): number {
  // Find any .line-section to measure the container
  const ref = document.querySelector('.line-section');
  if (!ref) return parseFloat(linePos) / 100 * window.innerWidth;

  const rect = ref.getBoundingClientRect();
  const pct = parseFloat(linePos) / 100;
  // The grid-template-columns is: linePos 1px 1fr
  // So the line sits at containerLeft + containerWidth * pct
  return rect.left + rect.width * pct;
}

export function initLineSystem(sections: SectionConfig[] = DEFAULT_SECTIONS) {
  if (!window.matchMedia('(min-width: 768px)').matches) return;

  const line = document.getElementById('dividing-line');
  if (!line) return;

  // Lock each section's grid to its own line position
  sections.forEach((section) => {
    const el = document.getElementById(section.id);
    if (!el) return;

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

  // Recalculate line position on resize (container offset changes)
  let currentSection = sections[0];
  window.addEventListener('resize', () => {
    const px = calcLinePixelPos(currentSection.linePos);
    gsap.set(line, { left: px });
  });

  // Store current section reference for resize handler
  const origAnimateLine = animateLine;
  animateLine = (l, s) => {
    currentSection = s;
    origAnimateLine(l, s);
  };

  // Initial state
  animateLine(line, sections[0]);
}

/**
 * Animates the fixed overlay line to match the grid column boundary.
 * Uses pixel position calculated from the container, not viewport %.
 */
let animateLine = function(line: HTMLElement, section: SectionConfig) {
  const px = calcLinePixelPos(section.linePos);

  gsap.to(line, {
    left: px,
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
};

export function destroyLineSystem() {
  ScrollTrigger.getAll().forEach(t => t.kill());
}
