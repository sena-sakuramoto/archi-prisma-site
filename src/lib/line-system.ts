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
  // Animate the fixed overlay line position
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

  // Update ALL visible .line-section elements to match.
  // This keeps the CSS Grid columns in sync with the animated fixed line.
  document.querySelectorAll('.line-section').forEach((el) => {
    if (el instanceof HTMLElement) {
      el.style.setProperty('--line-pos', section.linePos);
    }
  });
}

export function destroyLineSystem() {
  ScrollTrigger.getAll().forEach(t => t.kill());
}
