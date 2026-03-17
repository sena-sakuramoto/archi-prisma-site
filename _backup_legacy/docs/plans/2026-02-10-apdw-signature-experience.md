# APDW Signature Experience Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Archi-Prisma Design works株式会社ならではの「AI × 建築実務」価値を、スクロール体験と実証情報で明確に伝えるコーポレートサイトへ仕上げる。

**Architecture:** 既存の Astro 単一ページ構成は維持し、`index.astro` に「APDW Method（実務オペレーティングシステム）」セクションを新設する。ロゴ・実績・プロダクト情報は `content/` と `public/assets/` の既存資産を再利用し、`main.astro` の軽量なクライアント JS でスクロール連動のみを追加する。

**Tech Stack:** Astro 5, Tailwind CSS v4, TypeScript (Astro script), pnpm

### Task 1: APDW Method セクションの新設（独自価値の可視化）

**Files:**
- Create: `src/components/Method.astro`
- Modify: `src/pages/index.astro`

**Step 1: Method コンポーネントを作成**
- Sticky 左カラム（現在ステップ表示 + 説明）
- 右カラムに 5 ステップ（構想 / BIM設計 / 申請検証 / 現場伝達 / 運用改善）
- 各ステップに対応プロダクト（AICommander, KAKOME, Compass, AI建築サークル, KOZO, 楽々省エネ計算）をタグ表示

**Step 2: index から実データを渡す**
- `works` の年レンジ
- 掲載案件数
- コアメンバー数
- これらを Method セクションの実証値として表示

**Step 3: AI建築サークルを「コミュニティ」として明示**
- Method 内のステップで、ツール単体ではなく「運用コミュニティ」として扱う
- プロダクトセクションとの役割差分を明確化

### Task 2: 年表/Method のスクロール連動ロジック実装

**Files:**
- Modify: `src/layouts/main.astro`

**Step 1: Method ステップのアクティブ同期**
- `data-method-shell`, `data-method-step`, `data-method-label` を監視
- 画面中央に近いステップをアクティブ化し、左カラム表示を更新

**Step 2: 年表ナビとの干渉確認**
- 既存年表アクティブ同期は維持
- イベントリスナーの責務を分離し、双方が動作することを確認

### Task 3: 視覚トーンの高級化（ミニマル維持）

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/components/Hero.astro`
- Modify: `src/components/Products.astro`

**Step 1: Method 専用スタイル追加**
- 左カラム sticky / 進行ライン / ステップアクティブ状態
- PC と mobile の読解性調整

**Step 2: Hero を APDWらしく微調整**
- 技術デモ風ではなく、建築ポートフォリオ文脈で強い導線（Works / AIプロダクト）
- 重い動画・過度エフェクトは使わない

**Step 3: Products の意味構造を整理**
- ライブプロダクトとコミュニティ（AI建築サークル）の境界を明快化
- 「確認申請・法改正対応に繋がる実務導線」を短文で示す

### Task 4: 最終検証

**Files:**
- Verify only

**Step 1: ビルド確認**
- Run: `pnpm build`
- Expected: build 成功（エラーなし）

**Step 2: プレビュー確認**
- `http://localhost:4321/` の表示確認
- Method と Works 年表のスクロール連動が機能すること

**Step 3: 仕上げ報告**
- 変更ファイル、要件反映点、確認リンクを共有
