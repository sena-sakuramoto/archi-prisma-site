# Archi-Prisma Design Works — Corporate Site

静的ジェネレーター [Astro](https://astro.build/) と Tailwind CSS v4 を使った Archi-Prisma Design Works 株式会社のコーポレートサイトです。コンテンツは `content/` ディレクトリの Markdown / JSON から読み込み、トップページのセクションへ動的に渡しています。

## Stack

- Astro 5 + @tailwindcss/vite
- Node.js 20 / PNPM 8（Corepack）
- GitHub Pages（`dist/` を Actions で自動デプロイ）

## 開発フロー

```bash
corepack enable && corepack prepare pnpm@latest --activate
pnpm install
pnpm dev
```

## ビルド

```bash
pnpm build
```

生成された静的ファイルは `dist/` に出力されます。

## ディレクトリ構成

- `content/` — 会社概要・サービス・実績などの元データ
- `src/components/` — セクション単位の Astro コンポーネント（Hero / Services / WorksTimeline など）
- `src/lib/content.ts` — Markdown / JSON を読み込むユーティリティ
- `public/assets/` — 最適化済み画像を配置するフォルダ（空でも Git 管理）
- `.github/workflows/pages.yml` — GitHub Pages への自動デプロイ用ワークフロー

## 品質メモ

- ページメタ・OGP（`public/og-image.png`）・JSON-LD を設定済み
- Works タイムラインは地域 / フェーズ / キーワードでフィルタ可能
- Tailwind v4 の `@theme` でカラーパレットとフォントを定義
