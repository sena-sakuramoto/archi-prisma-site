# Archi-Prisma Corporate Site Rebuild Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 建築設計事務所としての信頼感を高める、写真中心・日本語中心のコーポレートサイトへ全面刷新する。

**Architecture:** Astro 5 の静的構成は維持し、`content/` の既存データを `src/lib/content.ts` で読み込む方式を継続する。コンポーネントをセクションごとに再編成し、不要セクションを削除して 1 ページ構成を簡潔化する。

**Tech Stack:** Astro 5 / Tailwind CSS v4 / GitHub Pages (GitHub Actions)

### Task 1: 情報設計とデータ整形

**Files:**
- Modify: `src/lib/content.ts`
- Modify: `src/pages/index.astro`

**Step 1:** 既存 `content/` データ読み込み API を維持しつつ、AIプロダクト表示に必要なデータを `index.astro` 内で構築する。
**Step 2:** セクション順を #hero → #about → #works → #products → #services → #team → #partners → #contact に更新する。

### Task 2: レイアウトとデザイン刷新

**Files:**
- Modify: `src/layouts/main.astro`
- Modify: `src/styles/global.css`
- Modify: `src/components/Hero.astro`
- Modify: `src/components/WorksTimeline.astro`
- Modify: `src/components/Services.astro`
- Modify: `src/components/Team.astro`
- Modify: `src/components/Partners.astro`
- Modify: `src/components/Contact.astro`

**Step 1:** 日本語ナビゲーション・余白中心レイアウトへ更新する。
**Step 2:** 建築写真を主役にしたカード/グリッドを実装する。
**Step 3:** 動画を廃止しヒーロー静止画へ差し替える。

### Task 3: AIプロダクトセクション実装

**Files:**
- Create: `src/components/Products.astro`
- Modify: `src/pages/index.astro`

**Step 1:** ライブ4製品と開発中2製品を分離表示する。
**Step 2:** AICommanderを最も目立つレイアウトで表示する。
**Step 3:** 外部リンクは `target="_blank" rel="noopener noreferrer"` を徹底する。

### Task 4: 不要要素削除と整合性調整

**Files:**
- Delete: `src/components/BrandPanel.astro`
- Delete: `src/components/StatsRibbon.astro`
- Modify: `src/pages/security-policy.astro`

**Step 1:** BrandPanel/StatsRibbon の参照を削除する。
**Step 2:** security-policy ページを新UIトーンへ統一する。

### Task 5: 検証

**Files:**
- Verify: `pnpm build`
- Verify: `pnpm preview`

**Step 1:** ビルド成功確認。
**Step 2:** 主要要件（動画未使用、日本語ナビ、AIプロダクト、誇大表現なし）をセルフチェック。
