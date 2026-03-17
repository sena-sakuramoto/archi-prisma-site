# World-Class Critique Loop Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 世界一すごいAI建築設計事務所のHPと呼べる品質まで、ヒーローとSignature体験を磨き込む。

**Architecture:** Heroでブランドの第一印象を固定し、Signatureで「企画から運用まで」の統合力を体験的に示す。3Dは装飾ではなく情報同期のUIとして扱う。批判役（Brand/UX/Motion）を明示し、各ラウンドで否決条件を満たした場合のみ次へ進む。

**Tech Stack:** Astro, Tailwind utility classes, custom CSS, Three.js, Node test runner.

## Research Notes (2026-02-10)

1. Awwwards Architecture category
- URL: https://www.awwwards.com/websites/architecture/
- 抽出: 建築系の高評価サイトは「強いタイポ」「余白」「余計なナビ削減」が共通。

2. Awwwards 3D category
- URL: https://www.awwwards.com/websites/3d/
- 抽出: 3D単体の派手さより、Storytelling/Interactionと併用される構成が評価される。

3. Interaction Design Foundation - Hick’s Law
- URL: https://www.interaction-design.org/literature/article/hick-s-law-making-the-choice-easier-for-users
- 抽出: 選択肢が増えると意思決定が遅くなる。一次導線は最小化が有効。

4. Laws of UX - Hick’s Law
- URL: https://lawsofux.com/hicks-law/
- 抽出: 決定時間は選択肢の数・複雑さで増える。主要導線は短く単純にすべき。

## Critique Roles

1. Brand Critic
- 否決条件: ヒーローのメッセージが一読で記憶に残らない
- チェック: 0.5秒で読める主文、英日2行の視覚一貫、ブランド言語の重み

2. UX Critic
- 否決条件: どこを押すか迷う、スクロール時に情報疲れが出る
- チェック: ヘッダー主要導線3つ、セクション内CTAの優先順位、可読性

3. Motion Critic
- 否決条件: 動きが意図を説明せず、ただ派手
- チェック: 3Dの状態変化が情報選択と同期、reduces-motion時に破綻なし

## Acceptance Criteria

1. Hero
- `MOVE HEARTS.` と `心を動かせ` を固定2行で制御
- モバイル/デスクトップとも改行崩れなし

2. Signature
- 見出しを「統合判断」を伝える文脈に刷新
- コマンドブリッジ型レイアウトで各領域の切替と説明が同期

3. Navigation
- 一次導線は3項目以内を維持

4. Verification
- `node --test tests/*.test.mjs` 全通過
- `pnpm build` 成功
- `http://localhost:4321/` で更新確認

## Execution Loop

1. RED: 体験要件テスト追加
2. GREEN: Hero/Signature再実装
3. CRITIQUE: Brand/UX/Motionで否決条件を確認
4. VERIFY: テスト・ビルド・配信確認
5. Iterate until all critics approve
