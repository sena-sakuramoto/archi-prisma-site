import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface SmoothScrollController {
  readonly lenis: Lenis | null;
  start: () => void;
  stop: () => void;
  scrollTo: (target: string | Element, offset?: number) => void;
  destroy: () => void;
}

const createNoopController = (): SmoothScrollController => ({
  lenis: null,
  start: () => {},
  stop: () => {},
  scrollTo: () => {},
  destroy: () => {},
});

export function initSmoothScroll(): SmoothScrollController {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return createNoopController();
  }

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    autoRaf: false,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    overscroll: false,
  });

  const onLenisScroll = () => ScrollTrigger.update();
  lenis.on('scroll', onLenisScroll);

  const onTick = (time: number) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(onTick);
  gsap.ticker.lagSmoothing(0);

  const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]')).filter(
    (node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement,
  );

  const onAnchorClick = (event: Event) => {
    const anchor = event.currentTarget;
    if (!(anchor instanceof HTMLAnchorElement)) return;
    if (anchor.hasAttribute('data-native-scroll')) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    lenis.scrollTo(target, { offset: -72, duration: 1.15 });
  };

  anchorLinks.forEach((anchor) => anchor.addEventListener('click', onAnchorClick));

  const destroy = () => {
    anchorLinks.forEach((anchor) => anchor.removeEventListener('click', onAnchorClick));
    lenis.off('scroll', onLenisScroll);
    gsap.ticker.remove(onTick);
    lenis.destroy();
  };

  return {
    lenis,
    start: () => lenis.start(),
    stop: () => lenis.stop(),
    scrollTo: (target: string | Element, offset = -72) => {
      lenis.scrollTo(target, { offset });
    },
    destroy,
  };
}
