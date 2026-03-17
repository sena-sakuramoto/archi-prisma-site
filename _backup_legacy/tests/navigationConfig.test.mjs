import test from 'node:test';
import assert from 'node:assert/strict';

import { primaryNavItems, footerNavItems, fullscreenNavItems } from '../src/lib/navigation.mjs';

test('primary navigation stays concise for fast decisions', () => {
  assert.ok(primaryNavItems.length <= 3, 'primary nav should be 3 items or less');
});

test('primary navigation keeps key entry points', () => {
  const labels = primaryNavItems.map((item) => item.label);
  ['Work', 'Process', 'Contact'].forEach((label) => {
    assert.ok(labels.includes(label), `${label} should exist in primary navigation`);
  });
});

test('fullscreen navigation covers all secondary sections', () => {
  const labels = fullscreenNavItems.map((item) => item.label);
  ['Products', 'Method', 'About'].forEach((label) => {
    assert.ok(labels.includes(label), `${label} should exist in fullscreen navigation`);
  });
});

test('footer navigation can include broader structure', () => {
  assert.ok(footerNavItems.length > primaryNavItems.length);
  assert.ok(footerNavItems.some((item) => item.label === 'Home'));
});
