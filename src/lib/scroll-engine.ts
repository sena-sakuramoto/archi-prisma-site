/**
 * Shared scroll engine — single source of truth for Lenis + GSAP + reveal.
 * Each page calls `createScrollEngine()` once; teardown is automatic on re-init.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

interface ScrollEngine {
  lenis: Lenis | null;
  destroy: () => void;
  prefersReduced: boolean;
}

let currentEngine: ScrollEngine | null = null;
let swapController: AbortController | null = null;

/**
 * Register a page init function that runs immediately and re-runs on each
 * View Transition swap. The previous page's after-swap listener is automatically
 * aborted when a new page calls registerPageInit(), preventing listener
 * accumulation across navigations.
 */
export function registerPageInit(initFn: () => void): void {
  if (swapController) swapController.abort();
  swapController = new AbortController();

  // Run init immediately for the current page
  initFn();

  // Register for future page swaps (aborted when next page loads)
  document.addEventListener('astro:after-swap', initFn, { signal: swapController.signal });
}

export function createScrollEngine(): ScrollEngine {
  // Teardown previous
  if (currentEngine) {
    currentEngine.destroy();
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lenis: Lenis | null = null;
  let tickerCb: ((time: number) => void) | null = null;

  if (!prefersReduced) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenis.on('scroll', ScrollTrigger.update);
    tickerCb = (time: number) => lenis!.raf(time * 1000);
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);
  }

  function destroy() {
    if (lenis) { lenis.destroy(); lenis = null; }
    if (tickerCb) { gsap.ticker.remove(tickerCb); tickerCb = null; }
    // Kill ALL ScrollTriggers globally. This is safe because registerPageInit()
    // ensures only one page's init function is active at a time — the previous
    // page's after-swap listener is aborted before the new page initialises.
    ScrollTrigger.getAll().forEach(t => t.kill());
  }

  currentEngine = { lenis, destroy, prefersReduced };
  return currentEngine;
}

/**
 * Activate `.reveal` elements with staggered IntersectionObserver.
 * If prefers-reduced-motion, all reveals fire immediately.
 */
export function initReveals(prefersReduced: boolean): void {
  document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
    if (prefersReduced) {
      el.classList.add('visible');
      return;
    }
    const delay = parseFloat((el as HTMLElement).style.getPropertyValue('--delay') || '0');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('visible'), delay * 1000);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
  });
}
