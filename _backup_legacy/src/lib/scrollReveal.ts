
/**
 * Simple Scroll Reveal Logic using IntersectionObserver
 * 
 * Usage:
 * - Add `data-reveal` to elements you want to fade in.
 * - Add `data-reveal-stagger` to containers whose children should stagger in.
 * - Add `data-bridge` for bridge text (slower fade).
 * 
 * CSS in global.css handles the actual transition (opacity/transform).
 * This script just toggles the .in-view class.
 */

export function initScrollReveal() {
  // Respect user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // If reduced motion is preferred, show everything immediately
    document.querySelectorAll('[data-reveal], [data-reveal-stagger] > *, [data-bridge]').forEach(el => {
      el.classList.add('in-view');
      // Ensure opacity is 1 via inline style if CSS is tricky
      if (el instanceof HTMLElement) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px', // Trigger when element is 10% from bottom
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  }, observerOptions);

  // Single elements
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    observer.observe(el);
  });

  // Staggered containers
  document.querySelectorAll('[data-reveal-stagger]').forEach((container) => {
    // Observe the container itself to trigger children
    const containerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const children = entry.target.children;
          Array.from(children).forEach((child, index) => {
            if (child instanceof HTMLElement) {
              // Add delay based on index
              child.style.transitionDelay = `${index * 100}ms`;
              child.classList.add('in-view');
              // Ensure base transition class is present if needed, 
              // but global.css usually handles [data-reveal] on children?
              // Actually, global.css handles [data-reveal]. 
              // For stagger, we might need children to have data-reveal too?
              // Or we just add .in-view to children manually here.
              // Let's assume children might NOT have data-reveal but we want to animate them.
              // We'll add a class .reveal-child or just rely on CSS.
              // The global.css says: .motion-ready [data-reveal].in-view
              // So children need data-reveal AND in-view.
              // If container has data-reveal-stagger, we can assume children act like data-reveal.
              child.setAttribute('data-reveal', ''); // effortless compatibility
              requestAnimationFrame(() => child.classList.add('in-view'));
            }
          });
          containerObserver.unobserve(entry.target);
        }
      });
    }, { ...observerOptions, threshold: 0.2 });
    
    containerObserver.observe(container);
  });

  // Bridge text (slower)
  document.querySelectorAll('[data-bridge]').forEach((el) => {
    observer.observe(el);
  });

  // Add motion-ready class to body to enable CSS transitions
  document.body.classList.add('motion-ready');
}
