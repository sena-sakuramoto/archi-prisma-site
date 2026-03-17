# APDW Dual-Business Reframing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** コーポレートサイトを「都市・建築企画デザイン設計」と「AI開発・コミュニティ運営」の2事業軸で再構成し、年表・プロダクト・問い合わせを本番運用レベルに引き上げる。

**Architecture:** 既存Astro単一ページ構成を維持しつつ、`index.astro`のデータ定義を事業軸中心に再編。`Method/Works/Products/Partners/Contact`を重点改修し、LP由来アセットと実運用導線を明示する。問い合わせは静的配信対応の外部エンドポイント連携+フォールバックを持つ構成にする。

**Tech Stack:** Astro 5, Tailwind CSS v4, vanilla client-side JS, static asset pipeline (public/)

### Task 1: 事業軸情報の再定義

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: 事業軸とプロダクト配列を定義し直す**
- `liveProducts`, `communityProduct`, `upcomingProducts` を実態に合わせて更新。
- `SpotPDF` を実運用ツールとして追加。
- 2事業軸（建築設計 / AI開発・コミュニティ）の説明データを追加。

**Step 2: Methodデータを再構成する**
- ステップ文言を「AI導入による進行・品質管理」に寄せて短文化。
- バッジに `SpotPDF` と `AI建築サークル` の役割を反映。

**Step 3: 表示連携を更新する**
- 追加データを `About` か `Method` に受け渡しできるよう props を調整。

### Task 2: 年表とスクロール体験の強化

**Files:**
- Modify: `src/components/Works.astro`
- Modify: `src/styles/global.css`
- Modify: `src/layouts/main.astro`

**Step 1: 不要文言の削除**
- `Scroll to Explore` を削除。

**Step 2: 年表ナビを改善**
- 年代ナビに視覚的フック（件数、現在位置、進行）を強化。
- ユーザーが「次の年を見たくなる」誘導文に変更。

**Step 3: スクロール同期演出を調整**
- `IntersectionObserver` と進行バー挙動を調整し、チラつきを抑える。

### Task 3: パートナーとプロダクトの実データ反映

**Files:**
- Modify: `src/components/Partners.astro`
- Modify: `src/components/Products.astro`
- Modify: `content/partners.json` (必要時)
- Create/Copy: `public/assets/products/spotpdf-logo.png`

**Step 1: パートナーセクションの視認性修正**
- 左カラム画像を縮小し、ロゴカードの可読性を優先。

**Step 2: プロダクトセクションの信頼性を向上**
- LP由来ロゴを使用。
- `SpotPDF` を追加し、AI建築サークルとの関係を明文化。
- 「Compassロゴのみ表示」等の既存指示を維持。

### Task 4: 問い合わせを実運用可能な形へ更新

**Files:**
- Modify: `src/components/Contact.astro`

**Step 1: フォームUIを実装**
- `会社名 / お名前 / メール / 相談区分 / 内容` を設置。

**Step 2: 送信方式を実装**
- `PUBLIC_CONTACT_FORM_ENDPOINT` がある場合は `POST` 送信。
- 未設定時は `mailto:` へフォールバック。

**Step 3: ユーザー状態を実装**
- 送信中・成功・失敗メッセージを表示。

### Task 5: 技術訴求セクションの強化

**Files:**
- Modify: `src/components/Method.astro`
- Modify: `src/components/About.astro` (必要時)
- Modify: `src/styles/global.css`

**Step 1: 「設計事務所+開発組織」を短い強い言葉で再構成**
- 多く語らず、根拠（プロダクト運用・実績）で示す。

**Step 2: インタラクションを過剰装飾なしで強化**
- 現行のスクロール連動を洗練し、意図ある動きに寄せる。

### Task 6: 検証

**Files:**
- Verify: `src/**/*.astro`, `src/styles/global.css`

**Step 1: Build確認**
- Run: `pnpm build`
- Expected: build成功、エラーなし。

**Step 2: Preview確認**
- Run: `pnpm preview --host 0.0.0.0 --port 4321`
- Expected: ブラウザで表示可能。

**Step 3: 目視確認項目**
- 2事業軸の訴求が明確。
- 年表が読みやすく、動きが自然。
- パートナーロゴサイズが適正。
- SpotPDFが表示される。
- 問い合わせ導線が機能する。
