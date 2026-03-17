import * as THREE from 'three';
import {
  BlendFunction,
  BloomEffect,
  EffectComposer,
  EffectPass,
  NoiseEffect,
  RenderPass,
  SMAAEffect,
  SMAAPreset,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect,
} from 'postprocessing';

export interface PostProcessingBundle {
  composer: EffectComposer;
  bloomEffect: BloomEffect;
  setSize: (width: number, height: number) => void;
}

export function createPostProcessing(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  tier: 1 | 2,
): PostProcessingBundle {
  const composer = new EffectComposer(renderer, {
    frameBufferType: THREE.HalfFloatType,
    multisampling: 0,
  });

  composer.addPass(new RenderPass(scene, camera));

  const bloomEffect = new BloomEffect({
    luminanceThreshold: tier === 1 ? 0.94 : 0.96,
    luminanceSmoothing: 0.02,
    intensity: tier === 1 ? 0.35 : 0.2,
    radius: 0.65,
    mipmapBlur: true,
  });

  const vignetteEffect = new VignetteEffect({
    offset: 0.35,
    darkness: tier === 1 ? 0.5 : 0.4,
  });

  if (tier === 1) {
    const noiseEffect = new NoiseEffect({
      blendFunction: BlendFunction.OVERLAY,
      premultiply: true,
    });
    noiseEffect.blendMode.opacity.value = 0.018;

    const toneMappingEffect = new ToneMappingEffect({
      mode: ToneMappingMode.ACES_FILMIC,
    });

    const smaaEffect = new SMAAEffect({ preset: SMAAPreset.HIGH });

    composer.addPass(new EffectPass(camera, bloomEffect, vignetteEffect, noiseEffect, toneMappingEffect, smaaEffect));
  } else {
    composer.addPass(new EffectPass(camera, bloomEffect, vignetteEffect));
  }

  return {
    composer,
    bloomEffect,
    setSize: (width: number, height: number) => {
      composer.setSize(width, height);
    },
  };
}
