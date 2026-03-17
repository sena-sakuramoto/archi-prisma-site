# APDW Wow Finish Experience Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 現行トンマナを維持したまま、Archi-Prisma固有の強み（企画〜都市開発〜設計〜ブランド〜AI〜運用）を技術的演出と高い可読性で伝えるトップページへ仕上げる。

**Architecture:** 既存 Astro 構成を維持し、`index.astro` に表示データを追加、`SignatureExperience.astro` で新セクションを実装、`main.astro` の既存スクロール同期スクリプトに新インタラクションを統合する。スタイルは `global.css` の既存トークンに乗せて拡張する。

**Tech Stack:** Astro 5, Tailwind CSS v4, TypeScript, Node built-in test runner (`node --test`)

### Task 1: Data Utility + TDD

**Files:**
- Create: `src/lib/signatureTracks.ts`
- Create: `tests/signatureTracks.test.mjs`

**Step 1: Write the failing test**
- `tests/signatureTracks.test.mjs` で以下を検証するテストを作成する。
- 表示順が `strategy -> urban -> architecture -> brand -> ai -> operate` になること
- すべてのトラックに少なくとも3つの capability があること
- `allCapabilities` に「ロゴデザイン」「家具デザイン」「店舗設計」「SNS発信」「ホテル運営」が含まれること

**Step 2: Run test to verify it fails**
- Run: `node --test tests/signatureTracks.test.mjs`
- Expected: `ERR_MODULE_NOT_FOUND` またはエクスポート不足で FAIL

**Step 3: Write minimal implementation**
- `src/lib/signatureTracks.ts` に `signatureTracks`, `signatureOrder`, `allCapabilities` をエクスポートして、テスト要件を満たす最小実装を行う。

**Step 4: Run test to verify it passes**
- Run: `node --test tests/signatureTracks.test.mjs`
- Expected: PASS

### Task 2: New Signature Section

**Files:**
- Create: `src/components/SignatureExperience.astro`
- Modify: `src/pages/index.astro`

**Step 1: Component skeleton**
- `SignatureExperience.astro` に新セクションを実装し、左側にアクティブ詳細、右側に capability cards を配置する。

**Step 2: Data wiring**
- `index.astro` で `signatureTracks` と `allCapabilities` を読み込み、`<SignatureExperience />` を Hero の直後へ挿入する。

**Step 3: Accessibility checks in markup**
- card list を button ベースで実装し、`aria-current`, `aria-controls`, `aria-live` を設定する。

### Task 3: Motion + Visual System Enhancements

**Files:**
- Modify: `src/components/Hero.astro`
- Modify: `src/layouts/main.astro`
- Modify: `src/styles/global.css`

**Step 1: Hero enhancement**
- Hero 内に「tech console」的な補助パネルと subtle animation layer を追加する（主見出しの可読性優先）。

**Step 2: Signature interaction logic**
- `main.astro` に `data-signature-shell` 向けのスクロール同期・ボタンクリック同期ロジックを追加。

**Step 3: CSS implementation**
- 新セクション用スタイル、3Dライクなカード、進捗バー、モバイル最適化、`prefers-reduced-motion` 対応を `global.css` に追加。

### Task 4: Verification

**Files:**
- No source changes expected (unless fix required)

**Step 1: Run focused tests**
- Run: `node --test tests/signatureTracks.test.mjs`
- Expected: PASS

**Step 2: Run full build**
- Run: `pnpm build`
- Expected: Astro build succeeds with no runtime errors

**Step 3: Quick regression check**
- 既存セクション（Method, Works, Products, Contact）の描画とアンカー遷移に破綻がないことを確認する。
