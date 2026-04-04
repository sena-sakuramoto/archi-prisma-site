/**
 * WebGL Hero — "Architectural Lens" Effect
 *
 * A clean, premium image effect for the hero section:
 * 1. REVEAL: Image starts blurred (gaussian) → focuses in over 1.5s
 * 2. MOUSE PARALLAX: Subtle depth shift following cursor (like looking through a window)
 * 3. EDGE CHROMATIC ABERRATION: Lens-like RGB split at edges (subtle, always-on)
 * 4. SCROLL: Gentle parallax zoom
 *
 * Properly handles object-fit:cover UV mapping so aspect ratio is always correct.
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

// ---------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform vec2  uTextureSize;   // original image dimensions
  uniform vec2  uContainerSize; // container dimensions
  uniform vec2  uMouse;         // normalized mouse position (0-1), smoothed
  uniform float uReveal;        // 0.0 = fully blurred, 1.0 = sharp
  uniform float uScrollZoom;    // subtle zoom from scroll (1.0 = no zoom)
  uniform float uParallax;      // parallax strength (0.0-1.0)

  varying vec2 vUv;

  // Replicate CSS object-fit: cover
  vec2 coverUV(vec2 uv, vec2 texSize, vec2 containerSize) {
    float containerAspect = containerSize.x / containerSize.y;
    float textureAspect = texSize.x / texSize.y;

    vec2 scale;
    if (containerAspect > textureAspect) {
      scale = vec2(1.0, textureAspect / containerAspect);
    } else {
      scale = vec2(containerAspect / textureAspect, 1.0);
    }

    return (uv - 0.5) * scale + 0.5;
  }

  // 13-tap gaussian blur (radius controlled by uReveal)
  vec4 gaussianBlur(sampler2D tex, vec2 uv, float radius) {
    vec4 color = vec4(0.0);
    float total = 0.0;
    vec2 pixelSize = 1.0 / uContainerSize;

    // Blur radius: 0 when fully revealed, up to 12px when fully blurred
    float r = radius * 12.0;

    for (int x = -3; x <= 3; x++) {
      for (int y = -3; y <= 3; y++) {
        float fx = float(x);
        float fy = float(y);
        float weight = exp(-(fx * fx + fy * fy) / max(r * r * 0.5, 0.001));
        vec2 offset = vec2(fx, fy) * pixelSize * r * 0.5;
        color += texture2D(tex, uv + offset) * weight;
        total += weight;
      }
    }
    return color / total;
  }

  void main() {
    vec2 uv = vUv;

    // Apply cover UV mapping
    uv = coverUV(uv, uTextureSize, uContainerSize);

    // Mouse parallax — shift UV based on cursor (max ~1.5% shift)
    vec2 mouseOffset = (uMouse - 0.5) * 0.015 * uParallax;
    uv += mouseOffset;

    // Scroll zoom — subtle scale from center
    uv = (uv - 0.5) / uScrollZoom + 0.5;

    // Blur amount (inverse of reveal)
    float blurAmount = 1.0 - uReveal;

    // Edge chromatic aberration — lens-like, proportional to distance from center
    float dist = length(vUv - 0.5);
    float aberration = dist * dist * 0.008 * (0.3 + blurAmount * 0.7);
    vec2 dir = normalize(vUv - 0.5 + 0.001) * aberration;

    if (blurAmount > 0.01) {
      // During reveal: apply blur + chromatic aberration
      float r = gaussianBlur(uTexture, uv + dir, blurAmount).r;
      float g = gaussianBlur(uTexture, uv, blurAmount).g;
      float b = gaussianBlur(uTexture, uv - dir, blurAmount).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    } else {
      // After reveal: sharp image with very subtle edge aberration
      float r = texture2D(uTexture, uv + dir).r;
      float g = texture2D(uTexture, uv).g;
      float b = texture2D(uTexture, uv - dir).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  }
`;

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.OrthographicCamera | null = null;
let material: THREE.ShaderMaterial | null = null;
let geometry: THREE.PlaneGeometry | null = null;
let mesh: THREE.Mesh | null = null;
let texture: THREE.Texture | null = null;
let canvas: HTMLCanvasElement | null = null;
let containerEl: HTMLElement | null = null;
let rafId: number | null = null;
let isDestroyed = false;

// Smooth mouse tracking
let mouseTarget = { x: 0.5, y: 0.5 };
let mouseCurrent = { x: 0.5, y: 0.5 };

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function initWebGLHero(container: HTMLElement): void {
  if (!window.matchMedia('(min-width: 768px)').matches) return;

  try {
    setup(container);
  } catch (err) {
    console.warn('[webgl-hero] Init failed, falling back to static image.', err);
    cleanup();
  }
}

export function revealHero(): void {
  if (!material) return;

  gsap.to(material.uniforms.uReveal, {
    value: 1.0,
    duration: 1.8,
    ease: 'power2.out',
  });

  // Fade in parallax after reveal starts
  gsap.to(material.uniforms.uParallax, {
    value: 1.0,
    duration: 2.5,
    ease: 'power1.out',
    delay: 0.5,
  });
}

export function destroyWebGLHero(): void {
  isDestroyed = true;
  removeListeners();
  cleanup();
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

function setup(container: HTMLElement): void {
  containerEl = container;
  isDestroyed = false;

  const imgEl = container.querySelector('img') as HTMLImageElement | null;
  const imageSrc = container.dataset.webglSrc || imgEl?.src;
  if (!imageSrc) {
    console.warn('[webgl-hero] No image source found.');
    return;
  }

  // Create canvas
  canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';
  container.appendChild(canvas);

  // Hide the static <img> so WebGL takes over
  if (imgEl) imgEl.style.opacity = '0';

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: false,
    antialias: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  updateSize();

  // Context loss handling
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);

  // Scene + Camera
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.01, 10);
  camera.position.z = 1;

  // Load texture
  const loader = new THREE.TextureLoader();
  loader.load(
    imageSrc,
    (tex: THREE.Texture) => {
      if (isDestroyed) { tex.dispose(); return; }
      texture = tex;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      buildMesh(tex);
    },
    undefined,
    (err: unknown) => console.warn('[webgl-hero] Texture load failed:', err),
  );

  // Listeners
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScroll, { passive: true });

  // Start render loop
  tick();
}

function buildMesh(tex: THREE.Texture): void {
  if (!scene || !renderer || !containerEl) return;

  const { clientWidth: w, clientHeight: h } = containerEl;
  const textureImage = tex.image as { width: number; height: number };

  geometry = new THREE.PlaneGeometry(1, 1);
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTexture:       { value: tex },
      uTextureSize:   { value: new THREE.Vector2(textureImage.width, textureImage.height) },
      uContainerSize: { value: new THREE.Vector2(w, h) },
      uMouse:         { value: new THREE.Vector2(0.5, 0.5) },
      uReveal:        { value: 0.0 },
      uScrollZoom:    { value: 1.0 },
      uParallax:      { value: 0.0 },
    },
    transparent: false,
    depthTest: false,
    depthWrite: false,
  });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
}

// ---------------------------------------------------------------------------
// Render loop
// ---------------------------------------------------------------------------

function tick(): void {
  if (isDestroyed) return;
  rafId = requestAnimationFrame(tick);

  if (!renderer || !scene || !camera || !material) return;

  // Smooth mouse interpolation (lerp)
  const lerp = 0.08;
  mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * lerp;
  mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * lerp;
  (material.uniforms.uMouse.value as THREE.Vector2).set(mouseCurrent.x, mouseCurrent.y);

  renderer.render(scene, camera);
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

function onMouseMove(e: MouseEvent): void {
  mouseTarget.x = e.clientX / window.innerWidth;
  mouseTarget.y = 1.0 - e.clientY / window.innerHeight;
}

function onResize(): void {
  updateSize();
}

function onScroll(): void {
  if (!material || !containerEl) return;

  // Subtle zoom on scroll: 1.0 at top, up to 1.05 when scrolled past hero
  const rect = containerEl.getBoundingClientRect();
  const progress = Math.max(0, -rect.top / (rect.height || 1));
  const zoom = 1.0 + Math.min(progress, 1.0) * 0.05;

  gsap.to(material.uniforms.uScrollZoom, {
    value: zoom,
    duration: 0.3,
    ease: 'none',
    overwrite: true,
  });
}

function onContextLost(e: Event): void {
  e.preventDefault();
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
}

function onContextRestored(): void {
  if (!isDestroyed) tick();
}

// ---------------------------------------------------------------------------
// Sizing
// ---------------------------------------------------------------------------

function updateSize(): void {
  if (!renderer || !containerEl) return;

  const { clientWidth: w, clientHeight: h } = containerEl;
  renderer.setSize(w, h);

  if (material) {
    (material.uniforms.uContainerSize.value as THREE.Vector2).set(w, h);
  }
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

function removeListeners(): void {
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('resize', onResize);
  window.removeEventListener('scroll', onScroll);
}

function cleanup(): void {
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }

  if (canvas) {
    canvas.removeEventListener('webglcontextlost', onContextLost);
    canvas.removeEventListener('webglcontextrestored', onContextRestored);
  }

  // Restore static image visibility
  if (containerEl) {
    const imgEl = containerEl.querySelector('img');
    if (imgEl) imgEl.style.opacity = '';
  }

  if (mesh && scene) scene.remove(mesh);
  geometry?.dispose();
  material?.dispose();
  texture?.dispose();
  renderer?.dispose();

  if (canvas && containerEl?.contains(canvas)) {
    containerEl.removeChild(canvas);
  }

  renderer = null;
  scene = null;
  camera = null;
  material = null;
  geometry = null;
  mesh = null;
  texture = null;
  canvas = null;
  containerEl = null;
}
