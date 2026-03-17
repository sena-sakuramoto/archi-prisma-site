# APDW Human Preference Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** ヘッダーの情報量を削減し、建築ブランドに合う高品質な3D演出へ再設計する。

**Architecture:** ヘッダーは `src/lib/navigation.mjs` で一次ナビを5項目に制御し、詳細導線はフッターへ分離。3Dは `ImmersiveEngine.astro` を全面更新し、Three.jsで建築マスモデルをリアルタイム描画する。

**Tech Stack:** Astro 5, Tailwind CSS v4, Three.js, Node test runner

### Task 1: Navigation simplification with TDD

**Files:**
- Create: `tests/navigationConfig.test.mjs`
- Create: `src/lib/navigation.mjs`
- Modify: `src/layouts/main.astro`

**Step 1:** 失敗テストで「一次ナビは5項目以下」を固定する。
**Step 2:** `navigation.mjs` に primary / footer を分離定義する。
**Step 3:** `main.astro` をモジュール参照へ置換し、2段ラベルを削除する。

### Task 2: Rebuild 3D experience

**Files:**
- Modify: `src/components/ImmersiveEngine.astro`
- Modify: `src/styles/global.css`

**Step 1:** 粒子中心の演出を廃止し、建築マスモデル + 中央プリズムへ変更。
**Step 2:** pointer / scroll / active node 連動を維持しつつ建築文脈に寄せる。
**Step 3:** HUD・カード・レスポンシブ・reduced-motion のスタイルを調整。

### Task 3: Verification

**Files:**
- No source changes expected

**Step 1:** `node --test tests/navigationConfig.test.mjs`
**Step 2:** `node --test tests/immersiveNodes.test.mjs`
**Step 3:** `node --test tests/signatureTracks.test.mjs`
**Step 4:** `pnpm build`
