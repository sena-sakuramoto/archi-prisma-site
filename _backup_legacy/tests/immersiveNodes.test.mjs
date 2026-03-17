import test from 'node:test';
import assert from 'node:assert/strict';

import { immersiveNodes, flatCapabilities } from '../src/lib/immersiveNodes.mjs';

test('immersive nodes include at least six multidisciplinary anchors', () => {
  assert.ok(immersiveNodes.length >= 6);
});

test('each immersive node has normalized 3D position', () => {
  immersiveNodes.forEach((node) => {
    assert.equal(Array.isArray(node.position), true);
    assert.equal(node.position.length, 3);

    node.position.forEach((value) => {
      assert.equal(typeof value, 'number');
      assert.ok(value >= -1.5 && value <= 1.5);
    });
  });
});

test('flat capabilities include full APDW scope', () => {
  const required = [
    '都市開発',
    '新築設計',
    'ロゴデザイン',
    '家具デザイン',
    '店舗設計',
    'AI開発',
    'SNS発信',
    'ホテル運営',
  ];

  required.forEach((item) => {
    assert.ok(flatCapabilities.includes(item), `${item} should exist in flatCapabilities`);
  });
});
