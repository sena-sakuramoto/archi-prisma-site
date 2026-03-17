# APDW WebGL Wow Engine Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** GitHub Pagesの静的配信でも成立する、実時間3D(WebGL)演出を持つ没入セクションを追加し、技術力を視覚的に証明する。

**Architecture:** `src/lib/immersiveNodes.mjs` に演出ノードデータを定義し、`ImmersiveEngine.astro` でUIとWebGL Canvasを構成する。Three.jsはクライアント側でバンドル読み込みし、`prefers-reduced-motion` と可視領域判定で負荷を制御する。

**Tech Stack:** Astro 5, Tailwind CSS v4, Three.js, Node test runner (`node --test`)

### Task 1: TDD for Immersive Data

**Files:**
- Create: `tests/immersiveNodes.test.mjs`
- Create: `src/lib/immersiveNodes.mjs`

**Step 1: Write the failing test**
- `tests/immersiveNodes.test.mjs` を作成し、以下を検証。
- `immersiveNodes` が6件以上ある
- 各 `position` が3要素配列で、値が -1.5〜1.5 の範囲
- `flatCapabilities` に「都市開発」「新築設計」「ロゴデザイン」「家具デザイン」「店舗設計」「AI開発」「SNS発信」「ホテル運営」が含まれる

**Step 2: Run test to verify it fails**
- Run: `node --test tests/immersiveNodes.test.mjs`
- Expected: module not found で FAIL

**Step 3: Write minimal implementation**
- `src/lib/immersiveNodes.mjs` に `immersiveNodes` と `flatCapabilities` を実装。

**Step 4: Run test to verify it passes**
- Run: `node --test tests/immersiveNodes.test.mjs`
- Expected: PASS

### Task 2: WebGL Section Implementation

**Files:**
- Create: `src/components/ImmersiveEngine.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/layouts/main.astro`

**Step 1: Component scaffold**
- Canvasコンテナ、overlay、capability listを持つ新セクションを作成。

**Step 2: Three.js runtime**
- `script` 内で Three.js を import し、点群・ワイヤーフレーム・リングを生成。
- Pointer と scroll でカメラ/グループ挙動を連動。

**Step 3: Integrate into page**
- `index.astro` に追加し、ナビ項目に `#engine` を追加。

### Task 3: Visual + Accessibility Hardening

**Files:**
- Modify: `src/styles/global.css`

**Step 1: Visual system**
- Engineセクションの背景、HUD、card、grid、mobile layoutを追加。

**Step 2: Reduced motion fallback**
- `prefers-reduced-motion` 時はWebGLを停止し、静的背景のみ表示。

### Task 4: Verification

**Files:**
- No source changes expected (unless fixes)

**Step 1: Run tests**
- `node --test tests/immersiveNodes.test.mjs`
- `node --test tests/signatureTracks.test.mjs`

**Step 2: Build**
- `pnpm build`

**Step 3: Preview smoke check**
- `pnpm preview --host 127.0.0.1 --port 4321` で `/` と `/#engine` が表示可能であることを確認。
