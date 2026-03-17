import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let hasInitialized = false;

const markRevealed = (element: Element) => {
  if (element instanceof HTMLElement) {
    element.classList.add('is-revealed');
  }
};

const revealWithoutMotion = () => {
  document
    .querySelectorAll(
      '[data-reveal], [data-reveal-stagger], [data-bridge], [data-method-step], [data-work-scene], [data-scene]',
    )
    .forEach(markRevealed);
  document
    .querySelectorAll(
      '.product-featured-card, .about-member-card, .contact-form-card, .contact-field, .hero-panel, .sp-panel, .sig-slide, .work-card, .method-step-card',
    )
    .forEach(markRevealed);
  document.querySelectorAll('[data-count]').forEach((counter) => {
    if (!(counter instanceof HTMLElement)) return;
    const target = Number(counter.dataset.count || 0);
    const suffix = counter.dataset.suffix || '';
    counter.textContent = `${target}${suffix}`;
  });
};

/* ================================================================
   Split Headings — shared between desktop & mobile
   ================================================================ */
const initSplitHeadings = async () => {
  const headings = gsap.utils.toArray<HTMLElement>(
    '.works-heading .en, .products-heading .en, .about-heading .en, .contact-heading .en',
  );
  if (headings.length === 0) return;

  try {
    const splitModule = await import('gsap/SplitText');
    const SplitText = splitModule.SplitText ?? splitModule.default;
    if (!SplitText) return;
    gsap.registerPlugin(SplitText);

    headings.forEach((heading) => {
      const split = SplitText.create(heading, {
        type: 'chars',
        autoSplit: true,
        mask: 'chars',
      });

      gsap.from(split.chars, {
        y: 20,
        opacity: 0,
        duration: 0.42,
        stagger: 0.02,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: heading,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });
  } catch (error) {
    console.warn('[scrollAnimations] SplitText unavailable, continuing without it.', error);
  }
};

/* ================================================================
   Scene 1: Opening — Hero + SocialProof crossfade (pinned)
   ================================================================ */
function buildScene1_Opening() {
  const scene = document.querySelector('[data-scene="opening"]');
  if (!(scene instanceof HTMLElement)) return;

  const heroPanel = scene.querySelector('.hero-panel');
  const spPanel = scene.querySelector('.sp-panel');
  if (!(heroPanel instanceof HTMLElement) || !(spPanel instanceof HTMLElement)) return;

  const counters = gsap.utils.toArray<HTMLElement>('[data-count]');
  const bridge = spPanel.querySelector('[data-bridge]');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      start: 'top top',
      end: '+=4000',
    },
  });

  // 0-25%: Hero fully visible, then crossfade to SP
  tl.to(heroPanel, { opacity: 0, duration: 25, ease: 'none' }, 0);
  tl.to(spPanel, { opacity: 1, duration: 25, ease: 'none' }, 0);

  // 40-60%: Counter number animation
  counters.forEach((node, index) => {
    const target = Number(node.dataset.count || 0);
    const suffix = node.dataset.suffix || '';
    tl.fromTo(
      { value: 0 },
      {
        value: target,
        duration: 20,
        ease: 'power2.out',
        onUpdate() {
          const current = Math.floor(
            (this as unknown as gsap.core.Tween).targets()[0].value,
          );
          node.textContent = `${current}${suffix}`;
        },
        onComplete() {
          node.textContent = `${target}${suffix}`;
        },
      },
      40,
    );

    // Stagger reveal for each counter article
    const article = node.closest('article');
    if (article) {
      tl.from(
        article,
        { y: 30, opacity: 0, duration: 10, ease: 'power3.out' },
        40 + index * 5,
      );
    }
  });

  // 75%: Bridge text appears
  if (bridge) {
    tl.from(bridge, { y: 40, opacity: 0, duration: 10, ease: 'power2.out' }, 70);
  }

  // 90-100%: SP fades out
  tl.to(spPanel, { opacity: 0, duration: 10, ease: 'none' }, 90);
}

/* ================================================================
   Scene 2: Signature — horizontal scroll (pinned)
   ================================================================ */
function buildScene2_Signature() {
  const scene = document.querySelector('[data-scene="journey"]');
  if (!(scene instanceof HTMLElement)) return;

  const track = scene.querySelector('.sig-track');
  if (!(track instanceof HTMLElement)) return;

  const slides = gsap.utils.toArray<HTMLElement>('.sig-slide', scene);
  const dots = gsap.utils.toArray<HTMLElement>('.sig-dot', scene);
  const progress = scene.querySelector('[data-sig-progress]');

  const getScrollAmount = () => track.scrollWidth - scene.offsetWidth;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      start: 'top top',
      end: () => `+=${getScrollAmount()}`,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        // Update dot nav based on progress
        if (slides.length === 0) return;
        const idx = Math.round(self.progress * (slides.length - 1));
        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === idx));
        slides.forEach((slide, i) => slide.classList.toggle('is-active', i === idx));
      },
      onEnter: () => {
        if (progress instanceof HTMLElement) {
          progress.style.opacity = '1';
          progress.style.pointerEvents = 'auto';
        }
      },
      onLeave: () => {
        if (progress instanceof HTMLElement) {
          progress.style.opacity = '0';
          progress.style.pointerEvents = 'none';
        }
      },
      onEnterBack: () => {
        if (progress instanceof HTMLElement) {
          progress.style.opacity = '1';
          progress.style.pointerEvents = 'auto';
        }
      },
      onLeaveBack: () => {
        if (progress instanceof HTMLElement) {
          progress.style.opacity = '0';
          progress.style.pointerEvents = 'none';
        }
      },
    },
  });

  tl.to(track, {
    x: () => -getScrollAmount(),
    ease: 'none',
    duration: 100,
  });

  // Each slide fades in as it comes into view
  slides.forEach((slide, i) => {
    const img = slide.querySelector('img');
    const content = slide.querySelector('.sig-phase-content');

    if (img) {
      tl.fromTo(
        img,
        { opacity: 0, scale: 1.02 },
        { opacity: 1, scale: 1, duration: 10, ease: 'power2.out' },
        i * (100 / slides.length) + 2,
      );
    }
    if (content) {
      tl.fromTo(
        content,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 10, ease: 'power2.out' },
        i * (100 / slides.length) + 5,
      );
    }
  });

  // Dot click → scroll to position
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const st = tl.scrollTrigger;
      if (!st) return;
      const targetProgress = i / Math.max(slides.length - 1, 1);
      const scrollTo = st.start + (st.end - st.start) * targetProgress;
      gsap.to(window, { scrollTo, duration: 0.8, ease: 'power2.inOut' });
    });
  });
}

/* ================================================================
   Scene 3: Works — crossfade gallery (pinned) ★核心
   ================================================================ */
function buildScene3_Works() {
  const scene = document.querySelector('[data-scene="gallery"]');
  if (!(scene instanceof HTMLElement)) return;

  const stage = scene.querySelector('.works-stage');
  if (!(stage instanceof HTMLElement)) return;

  const cards = gsap.utils.toArray<HTMLElement>('.work-card', stage);
  if (cards.length === 0) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      start: 'top top',
      end: '+=4000',
    },
  });

  const segmentDuration = 100 / cards.length;

  cards.forEach((card, i) => {
    const img = card.querySelector('img');
    const overlay = card.querySelector('.work-overlay');
    const start = i * segmentDuration;

    if (i === 0) {
      // First card: already visible (opacity:1 via CSS)
      // Ken Burns effect
      if (img) {
        tl.fromTo(img, { scale: 1.1 }, { scale: 1, duration: segmentDuration, ease: 'none' }, start);
      }
      // Overlay fades in at 60% of segment
      if (overlay) {
        tl.from(overlay, { y: 30, opacity: 0, duration: segmentDuration * 0.3, ease: 'power3.out' }, start + segmentDuration * 0.5);
      }
      // Crossfade out at end
      tl.to(card, { opacity: 0, duration: segmentDuration * 0.3, ease: 'none' }, start + segmentDuration * 0.7);
    } else {
      // Subsequent cards: crossfade in
      tl.to(card, { opacity: 1, duration: segmentDuration * 0.3, ease: 'none' }, start);

      // Ken Burns
      if (img) {
        tl.fromTo(img, { scale: 1.1 }, { scale: 1, duration: segmentDuration, ease: 'none' }, start);
      }

      // Overlay
      if (overlay) {
        tl.from(overlay, { y: 30, opacity: 0, duration: segmentDuration * 0.3, ease: 'power3.out' }, start + segmentDuration * 0.5);
      }

      // Crossfade out (except last card)
      if (i < cards.length - 1) {
        tl.to(card, { opacity: 0, duration: segmentDuration * 0.3, ease: 'none' }, start + segmentDuration * 0.7);
      }
    }
  });
}

/* ================================================================
   Scene 4: Method — sequential reveal (pinned)
   ================================================================ */
function buildScene4_Method() {
  const scene = document.querySelector('[data-scene="chapters"]');
  if (!(scene instanceof HTMLElement)) return;

  const track = scene.querySelector('.method-vertical-track');
  if (!(track instanceof HTMLElement)) return;

  const steps = gsap.utils.toArray<HTMLElement>('.method-step-card', track);
  if (steps.length === 0) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      start: 'top top',
      end: '+=3000',
    },
  });

  const segmentDuration = 100 / steps.length;

  steps.forEach((step, i) => {
    const header = step.querySelector('.method-step-header');
    const body = step.querySelector('.method-step-body');
    const numberEl = step.querySelector('.method-card-index');
    const start = i * segmentDuration;

    // Fade in
    tl.to(step, { opacity: 1, duration: segmentDuration * 0.25, ease: 'power2.out' }, start);

    // Number animation
    if (numberEl) {
      tl.from(numberEl, { scale: 0.8, x: -40, duration: segmentDuration * 0.3, ease: 'power3.out' }, start);
    }

    // Header slide in
    if (header) {
      tl.from(header, { x: -20, opacity: 0, duration: segmentDuration * 0.3, ease: 'power3.out' }, start + segmentDuration * 0.05);
    }

    // Body slide up (slight delay)
    if (body) {
      tl.from(body, { y: 30, opacity: 0, duration: segmentDuration * 0.3, ease: 'power3.out' }, start + segmentDuration * 0.15);
    }

    // Fade out (except last step)
    if (i < steps.length - 1) {
      tl.to(step, { opacity: 0, duration: segmentDuration * 0.2, ease: 'none' }, start + segmentDuration * 0.75);
    }
  });
}

/* ================================================================
   Scene 5: Products — breathing room (NOT pinned)
   ================================================================ */
function buildScene5_Products() {
  const featuredCard = document.querySelector('.product-featured-card');
  if (featuredCard) {
    const featuredCopy = featuredCard.querySelector('.product-featured-copy');
    const featuredVisual = featuredCard.querySelector('.product-featured-visual');

    const featuredTl = gsap.timeline({
      scrollTrigger: {
        trigger: featuredCard,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    featuredTl.from(featuredCard, {
      y: 60,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
    });

    if (featuredVisual) {
      featuredTl.from(
        featuredVisual,
        { x: 40, opacity: 0, duration: 0.9, ease: 'power3.out' },
        '-=0.6',
      );
    }

    if (featuredCopy) {
      featuredTl.from(
        featuredCopy,
        { x: -30, opacity: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.7',
      );
    }
  }

  // Secondary cards stagger
  const secondaryGrid = document.querySelector('.product-secondary-grid');
  if (secondaryGrid) {
    const children = Array.from(secondaryGrid.children);
    gsap.from(children, {
      y: 30,
      opacity: 0,
      duration: 0.64,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: secondaryGrid,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }
}

/* ================================================================
   Scene 6: About — portraits sequential rise (pinned)
   ================================================================ */
function buildScene6_About() {
  const scene = document.querySelector('[data-scene="portraits"]');
  if (!(scene instanceof HTMLElement)) return;

  const membersContainer = scene.querySelector('.about-core-members');
  if (!(membersContainer instanceof HTMLElement)) return;

  const members = gsap.utils.toArray<HTMLElement>('.about-member-card', membersContainer);
  if (members.length === 0) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      start: 'top top',
      end: '+=2000',
    },
  });

  const segmentDuration = 100 / members.length;

  members.forEach((member, i) => {
    const start = i * segmentDuration;

    // Rise up from below
    tl.fromTo(
      member,
      { y: 100, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: segmentDuration * 0.5, ease: 'power3.out' },
      start,
    );

    // Members stay visible — only fade all at the very end
  });

  // Fade all out at end
  tl.to(members, { opacity: 0, duration: 8, ease: 'none' }, 92);
}

/* ================================================================
   Scene 7: Contact — invitation (NOT pinned)
   ================================================================ */
function buildScene7_Contact() {
  const heading = document.querySelector('.contact-heading');
  if (heading) {
    gsap.from(heading, {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: heading,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }

  const contactFormCard = document.querySelector('.contact-form-card');
  if (contactFormCard) {
    gsap.from(contactFormCard, {
      y: 60,
      opacity: 0,
      duration: 0.9,
      delay: 0.3,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: contactFormCard,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    const fields = contactFormCard.querySelectorAll('.contact-field');
    if (fields.length > 0) {
      gsap.from(fields, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: contactFormCard,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      });
    }
  }

  const metaFooter = document.querySelector('.contact-meta-footer');
  if (metaFooter) {
    gsap.from(metaFooter, {
      y: 20,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: metaFooter,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  }
}

/* ================================================================
   Mobile: simple reveals (no pin, no scrub)
   ================================================================ */
function buildMobileReveals() {
  // Generic [data-reveal]
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
    gsap.from(element, {
      y: 40,
      opacity: 0,
      duration: 0.82,
      ease: 'power3.out',
      onStart: () => markRevealed(element),
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Generic [data-reveal-stagger]
  gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]').forEach((container) => {
    const children = Array.from(container.children);
    gsap.from(children, {
      y: 30,
      opacity: 0,
      duration: 0.64,
      stagger: 0.1,
      ease: 'power3.out',
      onStart: () => markRevealed(container),
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Bridge text reveals
  gsap.utils.toArray<HTMLElement>('[data-bridge]').forEach((bridge) => {
    gsap.from(bridge, {
      y: 50,
      opacity: 0,
      duration: 1.4,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: bridge,
        start: 'top 78%',
        toggleActions: 'play none none none',
      },
    });
  });

  // SocialProof counter animation
  ScrollTrigger.create({
    trigger: '#social-proof',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      const counters = gsap.utils.toArray<HTMLElement>('[data-count]');
      counters.forEach((node, index) => {
        const target = Number(node.dataset.count || 0);
        const suffix = node.dataset.suffix || '';
        gsap.to(
          { value: 0 },
          {
            value: target,
            duration: 1.4,
            delay: index * 0.3,
            ease: 'power2.out',
            onUpdate(this: gsap.core.Tween) {
              const value = Math.floor((this.targets()[0] as { value: number }).value);
              node.textContent = `${value}${suffix}`;
            },
            onComplete() {
              node.textContent = `${target}${suffix}`;
            },
          },
        );
      });
    },
  });

  // Works scene reveal
  gsap.utils.toArray<HTMLElement>('[data-work-scene]').forEach((card) => {
    const img = card.querySelector('img');
    const overlay = card.querySelector('.work-overlay');

    gsap.fromTo(
      card,
      { opacity: 0.3 },
      {
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'top 30%',
          scrub: true,
        },
      },
    );

    if (img) {
      gsap.fromTo(
        img,
        { scale: 1.06 },
        {
          scale: 1,
          y: -60,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    }

    if (overlay) {
      gsap.from(overlay, {
        y: 30,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 50%',
          toggleActions: 'play none none none',
        },
      });
    }
  });

  // Method steps
  gsap.utils.toArray<HTMLElement>('[data-method-step]').forEach((card) => {
    const header = card.querySelector('.method-step-header');
    const body = card.querySelector('.method-step-body');

    const stepTl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    stepTl.fromTo(
      card,
      { borderColor: 'rgba(74, 127, 212, 0)' },
      { borderColor: 'rgba(74, 127, 212, 0.25)', duration: 0.6, ease: 'power2.out' },
    );

    if (header) {
      stepTl.from(header, { x: -20, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.3');
    }

    if (body) {
      stepTl.from(body, { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4');
    }

    markRevealed(card);
  });

  // Products
  buildScene5_Products();

  // About member cards
  gsap.utils.toArray<HTMLElement>('.about-member-card').forEach((card, index) => {
    gsap.from(card, {
      y: 80,
      scale: 0.95,
      opacity: 0,
      duration: 0.9,
      delay: index * 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.about-core-members',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Contact
  buildScene7_Contact();
}

/* ================================================================
   Hero timeline (plays on page load, not scroll-driven)
   ================================================================ */
function initHeroTimeline() {
  const heroTl = gsap.timeline({
    paused: true,
    defaults: { ease: 'power3.out' },
  });

  heroTl
    .from('.hero-title-en', { y: 28, opacity: 0, duration: 0.7 })
    .from('.hero-title-ja', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
    .from('.hero-sub', { y: 16, opacity: 0, duration: 0.54 }, '-=0.28')
    .from('.hero-cta', { y: 14, opacity: 0, duration: 0.52 }, '-=0.24')
    .from('.hero-scroll', { opacity: 0, duration: 0.4 }, '-=0.16');

  if (document.body.classList.contains('site-ready')) {
    heroTl.play(0);
  } else {
    document.addEventListener(
      'site-ready',
      () => {
        heroTl.play(0);
      },
      { once: true },
    );
  }
}

/* ================================================================
   Main entry point
   ================================================================ */
export async function initScrollAnimations() {
  if (hasInitialized) return;
  hasInitialized = true;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    revealWithoutMotion();
    return;
  }

  // Hero intro timeline (always plays, desktop & mobile)
  initHeroTimeline();

  gsap.matchMedia({
    // Desktop: pin + scrub cinematic experience
    '(min-width: 769px)': () => {
      buildScene1_Opening();
      buildScene2_Signature();
      buildScene3_Works();
      buildScene4_Method();
      buildScene5_Products();
      buildScene6_About();
      buildScene7_Contact();

      // Generic [data-reveal] for elements outside pinned scenes
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        // Skip elements inside pinned scenes (they're handled by scene builders)
        if (element.closest('[data-scene]')) return;
        gsap.from(element, {
          y: 40,
          opacity: 0,
          duration: 0.82,
          ease: 'power3.out',
          onStart: () => markRevealed(element),
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      });

      // Generic [data-reveal-stagger] outside pinned scenes
      gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]').forEach((container) => {
        if (container.closest('[data-scene]')) return;
        const children = Array.from(container.children);
        gsap.from(children, {
          y: 30,
          opacity: 0,
          duration: 0.64,
          stagger: 0.1,
          ease: 'power3.out',
          onStart: () => markRevealed(container),
          scrollTrigger: {
            trigger: container,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        });
      });

      // Bridge text reveals outside pinned scenes
      gsap.utils.toArray<HTMLElement>('[data-bridge]').forEach((bridge) => {
        if (bridge.closest('[data-scene]')) return;
        gsap.from(bridge, {
          y: 50,
          opacity: 0,
          duration: 1.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: bridge,
            start: 'top 78%',
            toggleActions: 'play none none none',
          },
        });
      });

      // Works vignette
      const worksSection = document.querySelector('.works-section');
      if (worksSection instanceof HTMLElement) {
        ScrollTrigger.create({
          trigger: worksSection,
          start: 'top 80%',
          end: 'bottom 20%',
          onEnter: () => worksSection.classList.add('in-view'),
          onLeave: () => worksSection.classList.remove('in-view'),
          onEnterBack: () => worksSection.classList.add('in-view'),
          onLeaveBack: () => worksSection.classList.remove('in-view'),
        });
      }

      return () => {
        /* matchMedia cleanup — ScrollTrigger handles this automatically */
      };
    },

    // Mobile: simple reveal animations (no pin)
    '(max-width: 768px)': () => {
      buildMobileReveals();

      return () => {
        /* matchMedia cleanup */
      };
    },
  });

  await initSplitHeadings();
}
