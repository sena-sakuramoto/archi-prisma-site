import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const heroSource = readFileSync(new URL('../src/components/Hero.astro', import.meta.url), 'utf8');
const engineSource = readFileSync(
  new URL('../src/components/ImmersiveEngine.astro', import.meta.url),
  'utf8',
);
const signatureSource = readFileSync(
  new URL('../src/components/SignatureExperience.astro', import.meta.url),
  'utf8',
);
const methodSource = readFileSync(new URL('../src/components/Method.astro', import.meta.url), 'utf8');
const contactSource = readFileSync(new URL('../src/components/Contact.astro', import.meta.url), 'utf8');
const layoutSource = readFileSync(new URL('../src/layouts/main.astro', import.meta.url), 'utf8');
const indexSource = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');

test('hero uses v2 composition primitives', () => {
  ['hero-canvas-slot', 'hero-title-en', 'hero-title-ja', 'hero-scroll', 'hero-cta'].forEach((token) => {
    assert.match(heroSource, new RegExp(token), `${token} should exist in Hero`);
  });
});

test('hero title locks line breaks for english and japanese phrasing', () => {
  ['MOVE', 'HEARTS.', '心を、動かせ。', 'MOVE<br />HEARTS.'].forEach((token) => {
    assert.match(heroSource, new RegExp(token), `${token} should exist in Hero title composition`);
  });
});

test('immersive engine is deprecated and removed from index flow', () => {
  assert.match(engineSource, /DEPRECATED: v2計画で削除/, 'deprecation notice should exist');
  assert.equal(indexSource.includes('ImmersiveEngine'), false, 'index should not mount ImmersiveEngine');
});

test('signature zone uses fullscreen phase-scroll primitives', () => {
  ['sig-phases', 'sig-phase', 'sig-progress', 'sig-dot'].forEach((token) => {
    assert.match(
      signatureSource,
      new RegExp(token),
      `${token} should exist in SignatureExperience`,
    );
  });
});

test('signature heading is upgraded from the previous generic statement', () => {
  assert.equal(
    signatureSource.includes('ひとつの意思決定システムで貫く。'),
    false,
    'old signature heading copy should be removed',
  );
  assert.match(
    signatureSource,
    /企画から、運用まで。/,
    'new signature heading copy should exist',
  );
});

test('method section uses horizontal snap cards with progress dots', () => {
  ['method-horizontal-track', 'method-scroll-card', 'method-dot', 'data-method-track'].forEach((token) => {
    assert.match(methodSource, new RegExp(token), `${token} should exist in Method`);
  });
});

test('contact section includes premium interaction states', () => {
  ['contact-premium-section', 'contact-field', 'contact-submit', 'is-success', 'is-error'].forEach((token) => {
    assert.match(contactSource, new RegExp(token), `${token} should exist in Contact`);
  });
});

test('fullscreen menu includes preview capability', () => {
  ['menu-preview', 'data-menu-preview-image', 'data-menu-link'].forEach((token) => {
    assert.match(layoutSource, new RegExp(token), `${token} should exist in Layout`);
  });
});
