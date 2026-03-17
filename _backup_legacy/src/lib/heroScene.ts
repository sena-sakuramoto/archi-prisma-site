import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';
import prismVertexShader from './shaders/prismVertex.glsl?raw';
import prismFragmentShader from './shaders/prismFragment.glsl?raw';
import particleVertexShader from './shaders/particleVertex.glsl?raw';
import particleFragmentShader from './shaders/particleFragment.glsl?raw';
import { createPostProcessing } from './postProcessing';

gsap.registerPlugin(ScrollTrigger);

type Tier = 1 | 2 | 3 | 4;
type Cleanup = () => void;

function detectTier(canvas: HTMLCanvasElement): Tier {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 4;
  const gl = canvas.getContext('webgl2');
  if (!gl) return 4;
  return window.innerWidth < 768 ? 2 : 1;
}

export function initHeroScene(root: HTMLElement) {
  const canvas = root.querySelector('[data-hero-canvas]');
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const tier = detectTier(canvas);
  const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: false, // Depth and Post-processing handle quality
    alpha: true, 
    powerPreference: 'high-performance' 
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0c0c0a, 0.015);
  
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2000);
  camera.position.set(0, 50, 100);

  // 1. ARCHITECTURAL GRID (Infinite Floor & Ceiling)
  const gridHelper = new THREE.GridHelper(2000, 100, 0x30598F, 0x111111);
  gridHelper.position.y = -50;
  scene.add(gridHelper);
  
  const gridHelperTop = gridHelper.clone();
  gridHelperTop.position.y = 150;
  scene.add(gridHelperTop);

  // 2. INFINITE GLASS CITY (Instanced Architectural Slabs)
  const instanceCount = tier === 1 ? 2500 : 800;
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.95,
    roughness: 0.05,
    transmission: 0.6,
    thickness: 5.0,
    ior: 1.5,
    emissive: 0x30598F,
    emissiveIntensity: 0.1,
    transparent: true
  });
  
  const city = new THREE.InstancedMesh(geometry, material, instanceCount);
  scene.add(city);

  const dummy = new THREE.Object3D();
  const buildings: any[] = [];
  
  for (let i = 0; i < instanceCount; i++) {
    const x = (Math.random() - 0.5) * 400;
    const z = (Math.random() - 0.5) * 1000;
    const h = 10 + Math.random() * 80;
    const w = 2 + Math.random() * 10;
    
    buildings.push({
      pos: new THREE.Vector3(x, h/2 - 50, z),
      scale: new THREE.Vector3(w, h, w),
      speed: 0.1 + Math.random() * 0.5
    });
  }

  // 3. DATA STREAMS (Falling Neon Lines)
  const lineCount = 200;
  const lineGeometry = new THREE.BufferGeometry();
  const linePos = new Float32Array(lineCount * 6);
  for(let i=0; i<lineCount; i++) {
    const x = (Math.random() - 0.5) * 400;
    const y = Math.random() * 200 - 50;
    const z = (Math.random() - 0.5) * 1000;
    linePos[i*6] = x; linePos[i*6+1] = y; linePos[i*6+2] = z;
    linePos[i*6+3] = x; linePos[i*6+4] = y + 10; linePos[i*6+5] = z;
  }
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x30598F, transparent: true, opacity: 0.5 });
  const streams = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(streams);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambient);
  
  const sun = new THREE.DirectionalLight(0xffffff, 2.0);
  sun.position.set(100, 200, 100);
  scene.add(sun);

  const post = createPostProcessing(renderer, scene, camera, tier as 1 | 2);

  let scrollY = window.scrollY;
  const clock = new THREE.Clock();

  const render = () => {
    const time = clock.getElapsedTime();
    scrollY = THREE.MathUtils.lerp(scrollY, window.scrollY, 0.05);
    
    // THE ULTIMATE FLY-THROUGH
    // Camera moves forward automatically, scroll accelerates it
    const speed = 0.5 + scrollY * 0.02;
    camera.position.z -= speed;
    if (camera.position.z < -500) camera.position.z = 500;
    
    // Dramatic Camera Sway
    camera.position.x = Math.sin(time * 0.3) * 20;
    camera.position.y = 10 + Math.cos(time * 0.2) * 10;
    camera.lookAt(Math.sin(time * 0.3) * 5, 0, camera.position.z - 100);

    // Update City Matrix
    for (let i = 0; i < instanceCount; i++) {
      const b = buildings[i];
      dummy.position.copy(b.pos);
      // Continuous loop of buildings
      let relativeZ = (b.pos.z - camera.position.z + 500) % 1000 - 500;
      dummy.position.z = camera.position.z + relativeZ;
      
      dummy.scale.copy(b.scale);
      // Pulsate scale based on scroll
      const s = 1.0 + Math.sin(time + i) * 0.05;
      dummy.scale.multiplyScalar(s);
      
      dummy.updateMatrix();
      city.setMatrixAt(i, dummy.matrix);
    }
    city.instanceMatrix.needsUpdate = true;
    
    // Update Streams
    streams.position.z = camera.position.z;

    if (post) post.composer.render();
    else renderer.render(scene, camera);

    requestAnimationFrame(render);
  };

  const resize = () => {
    renderer.setSize(root.clientWidth, root.clientHeight);
    camera.aspect = root.clientWidth / root.clientHeight;
    camera.updateProjectionMatrix();
    post?.setSize(root.clientWidth, root.clientHeight);
  };
  window.addEventListener('resize', resize);
  resize();
  render();

  return { tier, cleanup: () => renderer.dispose() };
}
