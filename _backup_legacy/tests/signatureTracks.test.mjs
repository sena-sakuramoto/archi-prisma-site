import test from 'node:test';
import assert from 'node:assert/strict';

import {
  signatureTracks,
  signatureOrder,
  allCapabilities,
} from '../src/lib/signatureTracks.mjs';

const expectedOrder = ['strategy', 'urban', 'architecture', 'brand', 'ai', 'operate'];

test('signature track order is fixed for storytelling flow', () => {
  assert.deepEqual(signatureOrder, expectedOrder);
  assert.deepEqual(
    signatureTracks.map((track) => track.id),
    expectedOrder,
  );
});

test('each track has enough capability points', () => {
  signatureTracks.forEach((track) => {
    assert.ok(track.capabilities.length >= 3, `${track.id} should include at least 3 capabilities`);
    assert.equal(typeof track.image, 'string');
    assert.ok(track.image.startsWith('/assets/'), `${track.id} should include an image path`);
  });
});

test('core multidisciplinary capabilities are present', () => {
  const required = ['ロゴデザイン', '家具デザイン', '店舗設計', 'SNS発信', 'ホテル運営'];

  required.forEach((item) => {
    assert.ok(allCapabilities.includes(item), `${item} should exist in allCapabilities`);
  });
});
