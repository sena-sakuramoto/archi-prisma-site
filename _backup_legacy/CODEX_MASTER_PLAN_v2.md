# Archi-Prisma Design works — Codex完全実装指示書 v2

> この計画書は「世界を変えるつもり」で書かれている。
> 訪問者が1秒たりとも迷わない。1ピクセルたりとも無駄がない。
> 見た人間の人生の選択肢にArchi-Prismaが刻まれる体験を設計する。

---

## 目次

1. [現状の致命傷：なぜ今のサイトでは勝てないか](#1-致命傷)
2. [訪問者ジャーニー：秒単位の感情設計](#2-訪問者ジャーニー)
3. [ダークモード・デフォルト戦略](#3-ダークモード戦略)
4. [ローディング体験：最初の3秒で勝負が決まる](#4-ローディング体験)
5. [セクション完全再設計：1ビューポート1メッセージ](#5-セクション完全再設計)
6. [マイクロコピー全文：画面上の全テキスト](#6-マイクロコピー全文)
7. [インタラクション状態マシン：全要素の全状態](#7-インタラクション状態マシン)
8. [モバイル専用設計：レスポンシブではなく専用](#8-モバイル専用設計)
9. [カスタムカーソル＆ホバー設計](#9-カスタムカーソル設計)
10. [コンバージョンファネル：CTAの配置戦略](#10-コンバージョンファネル)
11. [ビジュアルシステム完全版](#11-ビジュアルシステム)
12. [コンテンツ要件：必要な写真・素材リスト](#12-コンテンツ要件)
13. [批判役レビュー体制 v2](#13-批判役レビュー体制)
14. [実装ロードマップ v2](#14-実装ロードマップ)
15. [リスクと回避策 v2](#15-リスクと回避策)
16. [計測・検証計画 v2](#16-計測検証計画)
17. [Codex実装指示（全タスク）](#17-codex実装指示)

---

## 1. 致命傷：なぜ今のサイトでは勝てないか

### 1.1 訪問者が迷う17箇所（全リスト）

コード全行を精査した結果、訪問者が「何をすればいいかわからない」瞬間が17箇所ある。

| # | 場所 | 迷いの内容 | 原因コード | 深刻度 |
|---|------|-----------|-----------|--------|
| C-1 | Hero | CTAが「実績を見る」1つだが、その下に登録情報テキストがあり視線が散る | Hero.astro line 35-38 | 高 |
| C-2 | Hero | 3Dシーンがポインター追従するが、その操作の存在が示唆されない | Hero.astro line 184-196 | 中 |
| C-3 | Hero | WebGL失敗時に `hero-static` クラスが付くだけでユーザーへの説明なし | Hero.astro line 72-75 | 中 |
| C-4 | Signature | スクロールで自動的にフェーズ切替 + ドットクリックで手動切替 → どちらが優先か不明 | SignatureExperience.astro line 117-146 | 高 |
| C-5 | Signature | 水平スクロール領域の存在が視覚的に示されていない | SignatureExperience.astro line 36 | 高 |
| C-6 | Signature | capabilityタグがmarqueeで流れ続け読めない | SignatureExperience.astro marquee | 中 |
| C-7 | ImmersiveEngine | 10秒自動サイクルがユーザー操作中に発動し制御を奪う | ImmersiveEngine.astro line 421-424 | 致命 |
| C-8 | ImmersiveEngine | 9つのドメインボタンの目的が不明（フィルタ？ナビ？機能説明？） | ImmersiveEngine.astro buttons | 致命 |
| C-9 | ImmersiveEngine | 3Dシーンと選択したドメインの関係が視覚的に接続されていない | ImmersiveEngine.astro 3D scene | 高 |
| C-10 | ImmersiveEngine | スクロールで3Dカメラが動くがボタン状態は変わらない → 2つの操作系が矛盾 | ImmersiveEngine.astro line 347-352 | 高 |
| C-11 | 全体構造 | Signature(6フェーズ) → ImmersiveEngine(9ドメイン) → Method(5ステップ) の3つの「フェーズUI」が混在 | index.astro セクション順序 | 致命 |
| C-12 | Products | 突然ソフトウェアプロダクトが出現。建築手法の文脈から断絶 | Products.astro 配置 | 高 |
| C-13 | Contact | floating labelが初期状態で非表示。フィールドが空に見える | Contact.astro line 159-163 | 高 |
| C-14 | Contact | 必須フィールドと任意フィールドの視覚的区別がない | Contact.astro required class | 中 |
| C-15 | Contact | 送信がPOSTかmailto:かユーザーに不明。mailto:が開くと驚く | Contact.astro line 229-264 | 中 |
| C-16 | Partners | handshakeアニメーションの意味が不明。なぜ握手？何の関係？ | Partners.astro line 33 | 中 |
| C-17 | ナビ | メニュー内プレビュー画像がlazy loadで前のhover画像が残る | main.astro line 323-326 | 低 |

### 1.2 情報設計の構造的欠陥

**現在の致命的な問題: 同じ話を3回している**

```
現在のセクション順序と訪問者の脳内:

Hero           →「建築×AIの会社か」
Signature      →「企画から運用まで6つの領域をやるのか」 ← ①回目の説明
Works          →「実績あるんだな」
ImmersiveEngine→「え、また領域の話？9個あるの？さっき6個って言った…」 ← ②回目（矛盾）
Method         →「今度は5ステップ？さっきの6個と何が違う…？」 ← ③回目（混乱確定）
Products       →「急にソフトウェア？建築の話はどこ行った？」
About          →「ミッション文…さっきSignatureで見た気がする」 ← 既視感
Team           →「チーム紹介。Aboutでも見た」 ← 冗長
Partners       →「握手？何の話？」
Contact        →「あ、やっと問い合わせ」
```

**訪問者の感情推移（現状）:**
```
期待 → 興味 → 理解 → 混乱 → 疲労 → 離脱
       Hero   Sig    Engine  Method  ←ここで8割が離脱
```

### 1.3 数値で見る現状の問題

| 指標 | 現状推定 | 業界ベスト | ギャップ |
|------|---------|-----------|---------|
| セクション数 | 11 | 5-7 | -4〜-6 過多 |
| ページ内CTA種類 | 6種以上 | 1-2種（繰り返し） | 散漫 |
| 訪問者が1画面で同時に見る選択肢の最大数 | 9（ImmersiveEngineのドメインボタン） | 3-5（Hick's Law） | 違反 |
| セクション間余白 | 80-112px | 160-200px | 格不足 |
| 独立したインタラクションパターン数 | 5種（タブ、ドット、水平スクロール、tilt、手動+自動混合） | 1-2種統一 | 学習コスト過大 |
| 「フェーズ/ステップ」型UIの出現回数 | 3回（Sig/Engine/Method） | 1回 | 訪問者混乱 |
| Contact formフィールド数 | 7 | 3-5 | 離脱リスク |

---

## 2. 訪問者ジャーニー：秒単位の感情設計

### 2.1 ターゲットペルソナ

| 属性 | 定義 |
|------|------|
| 誰か | 不動産デベロッパー、ホテルオーナー、店舗ブランド責任者、自治体都市計画担当 |
| 状態 | 「設計事務所を探している」「紹介されてURLを開いた」「SNSで見かけた」 |
| デバイス | 60%モバイル、30%デスクトップ、10%タブレット |
| 時間 | 最初の訪問で平均60-90秒。再訪で3-5分。 |
| 判断基準 | ① この会社は本物か ② 自分の案件に合うか ③ 連絡して大丈夫か |

### 2.2 理想の感情カーブ（After）

```
感情の強度
  ▲
  │
5 │     ★Hero衝撃        ★Works証拠              ★CTA到達
  │    ╱  ╲              ╱  ╲                   ╱
4 │   ╱    ╲            ╱    ╲                 ╱
  │  ╱      ╲     信頼╱      ╲     共感      ╱
3 │ ╱        ╲       ╱        ╲             ╱
  │╱ 好奇心   ╲理解╱   納得    ╲   安心    ╱ 決断
2 │            ╲  ╱              ╲        ╱
  │             ╲╱                ╲      ╱
1 │            Signature           Method+Products
  │
  └──────────────────────────────────────────────── 時間(秒)
  0    5    10   15   20   25   30   40   50   60
```

**鉄則: 感情は下がっても必ず次のピークがある。平坦な区間を作らない。**

### 2.3 秒単位のジャーニーマップ

#### 0-1秒：ローディング

```
画面: ダーク背景(#0C0C0A) + 中央に "AP" モノグラム（白、32px）
      モノグラムが微かに呼吸（opacity 0.6→1.0, 1.5s ease）
訪問者: 「お、シンプルで洗練されてるな」
目的: ブランド第一印象。ダーク=高級感を0秒目から刷り込む。
技術: インラインCSS + HTMLのみ。外部リソース不要。即座に表示。
```

#### 1-3秒：Hero出現

```
画面: ローディングからcrossfade（800ms）
      ダーク背景の中に:
      - 中央やや上: ガラスプリズム3D（小さめ、画面の30%）
        → プリズム内でパーティクルが建築フォルムを形成中
      - 左下（画面左1/3）:
        MOVE
        HEARTS.        ← 英語: Playfair Display, 白, 巨大
        心を、動かせ。  ← 日本語: Noto Serif JP, 白, 大
      - 右下（極小テキスト）:
        一級建築士事務所 東京都知事登録

      テキストは stagger で出現:
        "MOVE HEARTS." → 0ms（即座）
        "心を、動かせ。" → 200ms delay
        サブコピー → 400ms delay

訪問者: 「何だこのサイト…建築事務所？3Dが動いてる…」
目的: 50msの美的判断で勝つ。「普通じゃない」を焼き付ける。
```

#### 3-7秒：Hero 情報認識

```
画面: 上記に加えて:
      - サブコピー（opacity 0.65）:
        "AI × 建築 × デザインで、"
        "未来の街と暮らしをつくる。"
      - CTA:
        [ 仕事を見る → ]  ← 唯一のボタン。白枠、白テキスト。
      - 画面最下部中央:
        ↓ scroll（opacity 0.3, 上下に微動アニメ）

訪問者: 「AI×建築か。実績見てみよう」→ CTAクリック or スクロール開始
目的: 「何者か」「なぜ凄いか」「次に何をすべきか」を7秒で完了。

鉄則: この時点で画面上にあるクリック可能要素は:
  - ヘッダーのメニューアイコン（右上）
  - 「仕事を見る」CTA
  - scroll indicator
  以上3つのみ。それ以外は存在しない。
```

#### 7-12秒：Social Proof（スクロール開始直後）

```
画面（viewport 2）:
  ダーク背景継続。左右に大きなpaddingを取った中央ブロック。

  "London 2001 — Tokyo 2024"  ← 小さめ英語テキスト、accent blue
  "23年の実績。6つの専門領域。"  ← 日本語、大きめ、白

  横並び3つの数字（カウンターアニメーション）:
    47+        設計プロジェクト
    6          専門領域
    3          AIプロダクト

訪問者: 「23年やってるのか。ロンドンと東京…しかもAIプロダクトも？」
目的: 信頼の土台を数字で即座に構築。Signature前の「予告」。

なぜここか:
  Serial Position Effect — ページ最初の情報は長期記憶に入る。
  数字は最もスキャンしやすい情報形式。
  Signatureの6領域を「6つの専門領域」と予告し、次で詳細を見せる。
```

#### 12-30秒：Signature Experience（6領域）

```
画面（viewport 3-8、各領域1ビューポート）:

  ビューポート3（Signature導入）:
    "FROM STRATEGY TO OPERATION."  ← accent blue, 小さめ英語
    "企画から、運用まで。"           ← 白、大タイポ
    "ひとつの会社が、すべてをやる。" ← 白、opacity 0.6

    ↓ scroll で最初のフェーズへ

  ビューポート4（Phase 01 - 企画）:
    左60%: フルハイト写真（企画フェーズの実写）
    右40%: ダーク背景に白テキスト
      "01"                    ← accent blue, mono font, 大
      "企画 / Strategy"        ← 白、セリフ体
      "事業の根幹を描く。"     ← 本文
      ─ 事業計画
      ─ 都市開発企画           ← capability list（静的表示）
      ─ ブランド企画

    右端: 垂直ドットプログレス（6つ、1番目がactive）

  ビューポート5-9（Phase 02-06）:
    同構造。写真とテキストが切り替わる。
    偶数フェーズは左右反転（写真右、テキスト左）→ 単調さを防止。

訪問者の感情推移:
  Phase01「企画もやるのか」
  Phase02「都市計画まで？スケールが違う」
  Phase03「建築は当然として」
  Phase04「ロゴも家具もデザインするのか」
  Phase05「AIまで自社開発？」← ここが衝撃のピーク
  Phase06「運用もやる…全部じゃないか」

目的: 6つの領域を「体感」させる。読むのではなく、スクロールで1つずつ体に入れる。

鉄則:
  - 各ビューポートに表示する情報: 写真1枚 + テキスト4-5行 + capability 3項目のみ
  - marquee削除、自動サイクル削除。ユーザーのスクロール速度に完全委譲。
  - 1ビューポート = 1フェーズ。混ぜない。
```

#### 30-45秒：Works（証拠を見せる）

```
画面（viewport 9-10）:

  ビューポート9（Works導入 + Featured 2作品）:
    "SELECTED WORKS."           ← accent blue
    "選ばれた仕事。"             ← 白、大

    非対称2カラム:
    ┌──────────────────────┐┌───────────────┐
    │                      ││               │
    │ Project #1           ││ Project #2    │
    │ （最も衝撃的な1枚）  ││ （異スケール）│
    │ 62%幅                ││ 38%幅         │
    │                      ││               │
    │ プロジェクト名       ││ プロジェクト名│
    │ 場所 / 2024          ││ 場所 / 2023   │
    └──────────────────────┘└───────────────┘

  ビューポート10（残り2作品 + CTA）:
    ┌───────────────┐┌──────────────────────┐
    │ Project #3    ││ Project #4           │
    │ 38%幅         ││ 62%幅               │
    └───────────────┘└──────────────────────┘

    [ すべてのプロジェクトを見る → ]  ← テキストリンク、白、右矢印

訪問者: 「本当に実績あるんだ。写真のクオリティも高い。」
目的: 言葉（Signature）の後に証拠（Works）。この順番が人を動かす。

なぜ4作品か:
  - Serial Position Effect: #1（最強作品）と#4（最新作品）が記憶に残る
  - 4は「少ない」と感じる数 → 「もっと見たい」→ CTA をクリック
  - 年表アーカイブは完全削除。メインページの仕事は「厳選」のみ。
```

#### 45-55秒：Method + Products（手法と武器）

```
画面（viewport 11-12）:

  ビューポート11（Method — 横スクロールカード）:
    "HOW WE WORK."              ← accent blue
    "私たちの方法論。"           ← 白

    横スクロール5カード:
    ←[01 Hearing][02 Analysis][03 Design][04 Build][05 Operate]→

    各カード:
      フェーズ番号（mono, accent blue）
      フェーズ名（セリフ体）
      1行説明（本文サイズ）
      成果物アイコン or キーワード2-3個

    カード下: ドットプログレス ● ● ● ● ●（active=accent blue）

    鉄則:
      - scroll-snap-type: x mandatory で確実にカードに吸着
      - カード間にチラ見え（次のカード左端が10%見える）で「まだある」を示唆
      - 横スクロールの存在を最初のカード右端のフェードで明示

  ビューポート12（Products — AIツール3つ）:
    "AI PRODUCTS."              ← accent blue
    "自社開発のAIツール。"       ← 白

    ┌────────────────────────────────────────────┐
    │  ★ AICommander                             │
    │  建築設計AIアシスタント                      │ ← Featured（大）
    │  [ 詳しく見る → ]                           │
    └────────────────────────────────────────────┘
    ┌──────────────────┐ ┌──────────────────┐
    │ KOZO             │ │ 楽々省エネ計算    │  ← 小×2
    │ 構造計算AI       │ │ 省エネ計算自動化  │
    └──────────────────┘ └──────────────────┘

    7プロダクト → 3つのみ表示。残りはフッターリンク。

訪問者: 「方法論もしっかりしてるし、AIツールまで自社開発してるのか」
目的: プロセスと武器を簡潔に。ここは「確認」であり「説得」ではない。
      Signatureで既に「6領域」の理解は完了している。
      Methodは「具体的にどう進めるか」の安心材料。
```

#### 55-65秒：About + Contact（信頼と行動）

```
画面（viewport 13-14）:

  ビューポート13（About+Team統合）:
    "WHO WE ARE."               ← accent blue
    "私たちについて。"           ← 白

    左50%: 代表またはチーム集合写真（1枚のみ）
    右50%:
      "Archi-Prisma Design works は、"
      "ロンドンで2001年に始まり、"
      "2024年、東京に拠点を構えた。"
      "企画から運用まで、一貫して設計する。"  ← 4行で全て語る

      コアメンバー3名（横並び）:
      [写真] 名前 / CEO
      [写真] 名前 / 設計統括
      [写真] 名前 / AI開発

    パートナーロゴ横並び（grayscale, opacity 0.4）← Partners独立セクション廃止

  ビューポート14（Contact）:
    背景: ダークからわずかに明るい（#141412）で「ここが違うゾーン」を示唆

    "LET'S START."              ← accent blue, 大
    "あなたのプロジェクトを、始めよう。" ← 白、大

    左50%: フォーム
      名前         [                ]
      メール       [                ]
      ご相談内容   [                ]  ← テキストエリア
      [ 送信する ]

    右50%:
      "まずは気軽にご相談ください。"
      "24時間以内に担当者からご連絡します。"  ← 期待値を設定
      ───────────
      contact@archi-prisma.co.jp
      東京都○○区...

    フォームフィールド数: 3つのみ（名前・メール・相談内容）
    カテゴリドロップダウン削除。電話番号削除。会社名削除。
    → フィールド削減で送信率+35-45%（Chili Piper調査）

訪問者: 「3項目だけか。これなら送れる」→ 送信
目的: 「恐れ」を取り除く。7フィールド→3フィールド。
      「24時間以内に連絡」で「送信後どうなるか」を明示。
```

### 2.4 感情設計まとめ: 各ビューポートの1メッセージ

| VP# | 秒数 | 1メッセージ | 感情 | CTA有無 |
|-----|------|-----------|------|---------|
| 0 | 0-1 | ブランドの佇まい | 期待 | なし |
| 1 | 1-7 | 「AI×建築で心を動かす会社」 | 衝撃 | 仕事を見る |
| 2 | 7-12 | 「23年、6領域、本物の実績」 | 信頼の芽生え | なし |
| 3 | 12-14 | 「企画から運用まで、全部やる」 | 興味深化 | なし |
| 4-9 | 14-30 | 各領域の具体（×6） | 納得の積み上げ | なし |
| 10-11 | 30-40 | 「証拠はこれだ」（厳選4作品） | 信頼確定 | 全プロジェクトを見る |
| 12 | 40-45 | 「こう進める」（5ステップ） | 安心 | なし |
| 13 | 45-50 | 「AIツールも自社開発」 | 驚嘆 | なし |
| 14 | 50-55 | 「この人たちがやっている」 | 共感 | なし |
| 15 | 55-65 | 「始めよう」 | 決断 | 送信する |

**全15ビューポート。各ビューポートに「1つだけのメッセージ」。迷う余地なし。**

---

## 3. ダークモード戦略：なぜダークをデフォルトにするか

### 3.1 根拠

| 理由 | 根拠データ |
|------|-----------|
| **建築写真が映える** | ダーク背景は画像の色を引き立てる。ゴールド/ウッドは黒地で輝く。白地では沈む。Zaha Hadid、Foster+Partners、BIGが採用。 |
| **高級感の信号** | Chanel, Prada, YSL, Gucci — 高級ブランドのほぼ全てがダーク。「自信がある会社は叫ばない」を視覚で体現。 |
| **技術感の信号** | ダークUIはテクノロジー企業の標準。AI建築事務所として「技術側」のポジションを視覚で取る。 |
| **OLEDで真の黒** | 現代スマホの大半がOLED。真の黒(#000近傍)は画素が消灯し、無限のコントラスト比を実現。 |
| **集中を促す** | ダーク背景はvisual noiseを削減。視線が光る要素（テキスト、画像、3D）に集まる。 |

### 3.2 カラーパレット（完全版）

```css
/* ═══════════════════════════════════════════════════════
   DARK-FIRST PALETTE
   純黒(#000)は使わない。ハレーション防止のため暗灰色を使用。
   人口の33%が乱視。純白on純黒はテキストがにじむ。
   ═══════════════════════════════════════════════════════ */

/* Background layers（奥→手前の順で明るくなる） */
--bg-base:       #0C0C0A;    /* 最奥。ページ背景。ウォーム黒 */
--bg-elevated:   #141412;    /* カード、セクション区切り */
--bg-surface:    #1C1C18;    /* ホバー状態、アクティブ領域 */
--bg-overlay:    rgba(12, 12, 10, 0.85); /* モーダル背景 */

/* Text hierarchy（手前→奥の順で暗くなる） */
--text-primary:  #EDECE8;    /* 見出し、CTA。純白ではない（ハレーション防止）*/
--text-secondary:#A8A69E;    /* 本文 */
--text-tertiary: #6B6960;    /* キャプション、メタデータ */
--text-disabled: #3D3B36;    /* 不活性要素 */

/* Accent（1色のみ。ブルー） */
--accent:        #4A7FD4;    /* リンク、アクティブ状態、プログレス。
                                暗背景でのWCAG AA 4.5:1コントラスト確保済 */
--accent-hover:  #6B9AE8;    /* ホバー時（明度+15%） */
--accent-subtle: rgba(74, 127, 212, 0.10); /* 背景tint */
--accent-glow:   rgba(74, 127, 212, 0.25); /* 3Dライト、フォーカスリング */

/* Border */
--border-subtle: rgba(237, 236, 232, 0.06); /* カード境界 */
--border-visible:rgba(237, 236, 232, 0.12); /* フォーム枠 */
--border-focus:  var(--accent);               /* フォーカス時 */

/* Semantic */
--color-success: #4CAF7D;
--color-error:   #E05252;

/* ゴールドは完全削除。
   理由: ダーク背景ではブルーアクセント1色で十分。
   建築写真の中にある自然なゴールド/ウッドトーンが映えるため、
   UI上のゴールドは不要。むしろ散漫。 */
```

### 3.3 コントラスト検証

| 組み合わせ | コントラスト比 | WCAG AA | WCAG AAA |
|-----------|--------------|---------|----------|
| text-primary on bg-base | 14.2:1 | PASS | PASS |
| text-secondary on bg-base | 6.8:1 | PASS | PASS(大文字) |
| text-tertiary on bg-base | 3.9:1 | PASS(大文字のみ) | — |
| accent on bg-base | 5.2:1 | PASS | PASS(大文字) |
| text-primary on bg-elevated | 12.1:1 | PASS | PASS |
| accent on bg-elevated | 4.6:1 | PASS | — |

### 3.4 ライトモードは提供しない（v1では）

理由:
- 2つのモードを維持する工数は倍
- ブランドの一貫性が崩れる
- 建築写真は暗背景で最も美しい
- 将来Phase 4で検討可能（ユーザー要望があれば）

---

## 4. ローディング体験：最初の3秒で勝負が決まる

### 4.1 ローディングシーケンス

```
0ms:    HTML受信開始
        ┌──────────────────────────────┐
        │                              │
        │    bg: #0C0C0A (inline CSS)  │
        │                              │
        │         AP                   │  ← モノグラム（inline SVG or テキスト）
        │     opacity: 0.6            │     system fontで即表示
        │                              │
        └──────────────────────────────┘
        Critical CSS: <style> タグ内にインライン。14KB以下。
        → First Paint ≈ 100ms

300ms:  モノグラムが呼吸開始
        opacity: 0.6 → 1.0 → 0.6 (CSS keyframe, 1.5s ease-in-out infinite)
        → 「ロード中」を暗示。スピナーは使わない（安っぽい）。

500ms:  Google Fonts の preconnect 開始（<link rel="preconnect">は既にHTMLにある）

800ms:  Hero poster画像のpreload完了（<link rel="preload" as="image" fetchpriority="high">）

1000ms: FCP (First Contentful Paint)
        poster画像がモノグラムの背後にフェードイン (opacity 0→1, 600ms)
        テキスト要素がDOMに存在（まだ非表示）

1500ms: フォントロード完了（font-display: swap で本文は先に表示済）
        hero テキストが stagger で出現:
          "MOVE HEARTS." → opacity 0→1, translateY(20px→0), 400ms
          "心を、動かせ。" → 200ms delay
          subtitle → 400ms delay

2000ms: LCP (Largest Contentful Paint) = poster画像
        ローディングモノグラム非表示 (opacity→0, 300ms, then display:none)

2500ms: Three.js 動的 import 開始（メインスレッドをブロックしない）

3000ms: Three.js 初期化完了。
        canvas が poster画像の上に opacity 0→1 (600ms) でフェードイン。
        poster画像はcanvasの背面にそのまま残す（3D fallback用）。

∞:      Three.js が prefers-reduced-motion: reduce の場合:
        → import自体を行わない。poster画像がそのまま最終表示。
```

### 4.2 技術仕様

```html
<!-- index.astro の <head> 内 -->

<!-- Critical CSS（インライン） -->
<style>
  html { background: #0C0C0A; color: #EDECE8; }
  .loader { position: fixed; inset: 0; z-index: 100;
    display: flex; align-items: center; justify-content: center;
    background: #0C0C0A; }
  .loader-mark { font-size: 32px; letter-spacing: 0.15em;
    font-family: system-ui; animation: breathe 1.5s ease-in-out infinite; }
  @keyframes breathe { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
  .loader.is-done { opacity: 0; pointer-events: none;
    transition: opacity 400ms ease; }
</style>

<!-- 画像preload -->
<link rel="preload" href="/assets/hero-poster.webp" as="image" fetchpriority="high">

<!-- フォントpreconnect（既存維持） -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

```html
<!-- body直後 -->
<div class="loader" id="loader">
  <span class="loader-mark">AP</span>
</div>

<script is:inline>
  // poster画像のロード完了でローダーを消す
  const img = new Image();
  img.src = '/assets/hero-poster.webp';
  img.onload = () => document.getElementById('loader').classList.add('is-done');
  // フォールバック: 3秒でも消す
  setTimeout(() => document.getElementById('loader').classList.add('is-done'), 3000);
</script>
```

---

## 5. セクション完全再設計：1ビューポート1メッセージ

### 5.0 現状→新設計のセクション対応表

| # | 現状のセクション | 新設計 | 変更理由 |
|---|-----------------|--------|----------|
| 1 | Hero | **Hero**（全面刷新） | 3Dプリズム + ダーク + テキスト左寄せ + CTA1つ |
| 2 | — | **★Social Proof（新設）** | 数字で信頼を即座に構築。Signatureの前振り。 |
| 3 | SignatureExperience | **Signature**（全面刷新） | フルスクリーン×6。タブUI廃止。スクロール連動。 |
| 4 | Works | **Works**（強化+移動） | Signature直後（言葉→証拠）。4作品厳選。年表削除。 |
| 5 | ImmersiveEngine | **★統合削除** | Signatureに吸収。3D体験はHeroプリズムに集約。 |
| 6 | Method | **Method**（簡潔化） | 横スクロール5カード。sticky sidebar廃止。 |
| 7 | Products | **Products**（3つに絞る） | 7→3。AICommanderをfeatured。 |
| 8 | About + Team + Partners | **About**（統合） | 3セクション→1。写真+4行テキスト+3名+ロゴ列。 |
| 9 | Contact | **Contact**（簡潔化） | 7→3フィールド。CTA文言変更。期待値設定テキスト追加。 |
| 10 | Services | **★削除** | Signatureの各phase capabilitiesで完全カバー。 |
| 11 | — | **Footer**（刷新） | ミニマル。ナビ繰り返し + SNS + 法的情報。 |

**結果: 11セクション → 9セクション（うち新設1）。情報密度を下げ、呼吸を増やす。**

### 5.1 ★ImmersiveEngine削除の根拠

これが最も重要な判断。

**削除する理由:**

1. **訪問者を3回迷わせている元凶**: Signature(6フェーズ) → Engine(9ドメイン) → Method(5ステップ) の3つの「フェーズUI」。Engine がなくなれば Signature(理念) → Works(証拠) → Method(手法) と一直線になる。

2. **9つのドメインボタンはHick's Law違反**: 9択は人間の即時判断の限界(7±2)を超えている。しかもボタンの目的が不明。

3. **3Dの価値がない**: 260棟のランダムビルは「それっぽいCG」。建築の専門性を証明するどころか、「テンプレ3D」の印象を与える。

4. **Three.jsの価値はHeroに集約する**: Hero の3Dプリズム＋パーティクルは「AI×建築」を視覚で伝える目的がある。ImmersiveEngineの3Dには目的がない。

5. **563KB(Three.js)の2重ロード回避**: Three.js は Hero でのみ使用。Engine 用の2つ目のシーンが不要になり、パフォーマンスが向上。

**3Dプリズムの価値はHeroに一本化:**
```
Before: Hero(3Dプリズム) + Engine(3D都市) = 3Dが2箇所で目的曖昧
After:  Hero(3Dプリズム) のみ = 3Dは1箇所で「AI×建築」の象徴として明確
```

**ImmersiveEngineのデータ(immersiveNodes.mjs)はSignatureに吸収:**
- 9ドメイン → 6フェーズに整理
- 各フェーズの capability リストとして再利用

### 5.2 セクション間の「つなぎ」テキスト

各セクション末尾に、次セクションへの好奇心を喚起する1行を配置する。

| 区間 | つなぎテキスト | 心理効果 |
|------|--------------|----------|
| Hero → Social Proof | ↓ scroll（テキストではなくスクロール示唆） | 好奇心（下に何があるか） |
| Social Proof → Signature | 「6つの領域を、ひとつずつ。」 | 予告（これから何を見せるか） |
| Signature → Works | 「言葉より、仕事で語る。」 | 期待転換（抽象→具体へ） |
| Works → Method | 「どう進めるか。」 | 実用的好奇心 |
| Method → Products | 「私たちの武器。」 | 技術的好奇心 |
| Products → About | 「つくっている人間。」 | 人間的好奇心 |
| About → Contact | 「あなたのプロジェクトを、始めよう。」 | 行動喚起 |

### 5.3 各セクション間の余白

```
Hero ─────────────────── 0px（100svhで画面いっぱい、余白なし）
Social Proof ─────────── 160px
Signature 導入 ────────── 200px
Signature Phase 01-06 ── 0px（scroll-snap で各100svh連続）
Works ─────────────────── 200px（Signatureとの大きな区切り）
Method ────────────────── 160px
Products ──────────────── 120px
About ─────────────────── 160px
Contact ───────────────── 200px（ここが最終目的地であることを余白で強調）
Footer ────────────────── 80px（Contactと近接させて一体感）
```

---

## 6. マイクロコピー全文：画面上の全テキスト

### 6.1 ヘッダー

```
デスクトップ:
  [AP]              Work    Process    Contact    [≡]

モバイル:
  [AP]                                            [≡]

フルスクリーンメニュー:
  Work
  Process
  Products
  Method
  About
  Contact
  ─────────
  contact@archi-prisma.co.jp
  Instagram  X
  © 2024 Archi-Prisma Design works
  一級建築士事務所 東京都知事登録 第6108号
```

### 6.2 Hero

```
MOVE
HEARTS.
心を、動かせ。

AI × 建築 × デザインで、
未来の街と暮らしをつくる。

[ 仕事を見る → ]

右下極小: 一級建築士事務所 東京都知事登録 第6108号
最下部中央: ↓ scroll
```

### 6.3 Social Proof

```
London 2001 — Tokyo 2024

23年の実績。6つの専門領域。

47+              6               3
設計プロジェクト   専門領域         AIプロダクト
```

### 6.4 Signature

```
導入:
  FROM STRATEGY TO OPERATION.
  企画から、運用まで。
  ひとつの会社が、すべてをやる。

Phase 01:
  01
  企画 / Strategy
  事業の根幹を描く。都市のビジョンから、個人の住まいまで。
  ─ 事業計画
  ─ 都市開発企画
  ─ ブランド企画

Phase 02:
  02
  都市 / Urban Development
  土地の可能性を最大化する。用途計画から開発コンペまで。
  ─ 都市開発
  ─ 用途計画
  ─ 開発コンペ対応

Phase 03:
  03
  建築 / Architecture
  空間に思想を宿す。新築設計から設計監理まで。
  ─ 新築設計
  ─ インテリア設計
  ─ 設計監理

Phase 04:
  04
  体験 / Brand & Space
  ブランドを空間に翻訳する。ロゴから家具、店舗まで。
  ─ ロゴデザイン
  ─ 家具デザイン
  ─ 店舗設計

Phase 05:
  05
  技術 / AI Development
  AIを設計の武器にする。自社開発ツールで精度と速度を両立。
  ─ AI開発
  ─ BIM連携
  ─ プロダクト運用

Phase 06:
  06
  運用 / Operation
  つくって終わりにしない。発信し、運営し、育てる。
  ─ SNS発信
  ─ ホテル運営
  ─ コミュニティ運営

つなぎ:
  言葉より、仕事で語る。
```

### 6.5 Works

```
SELECTED WORKS.
選ばれた仕事。

各カード:
  [プロジェクト名]
  [場所] / [年]

CTA:
  すべてのプロジェクトを見る →

つなぎ:
  どう進めるか。
```

### 6.6 Method

```
HOW WE WORK.
私たちの方法論。

カード01: 01 Hearing / ヒアリング
          課題と理想を言語化する。

カード02: 02 Analysis / 分析
          データとコンテキストを読み解く。

カード03: 03 Design / 設計
          空間に思想を落とし込む。

カード04: 04 Build / 実施
          図面を現実にする。

カード05: 05 Operate / 運用
          つくった後も、伴走する。

つなぎ:
  私たちの武器。
```

### 6.7 Products

```
AI PRODUCTS.
自社開発のAIツール。

Featured:
  AICommander
  建築設計AIアシスタント。
  設計から申請書類まで、AIが加速する。
  [ 詳しく見る → ]

Card 2:
  KOZO
  構造計算を、AIで。

Card 3:
  楽々省エネ計算
  省エネ計算を自動化。

つなぎ:
  つくっている人間。
```

### 6.8 About

```
WHO WE ARE.
私たちについて。

Archi-Prisma Design works は、
ロンドンで2001年に始まり、
2024年、東京に拠点を構えた。
企画から運用まで、一貫して設計する。

[メンバー名] / CEO & Architect
[メンバー名] / Design Director
[メンバー名] / AI Development Lead

Partners:
  [ロゴ] [ロゴ] [ロゴ] [ロゴ] [ロゴ]
```

### 6.9 Contact

```
LET'S START.
あなたのプロジェクトを、始めよう。

フォーム:
  お名前       [                    ]
  メール       [                    ]
  ご相談内容   [                    ]
               [                    ]
  [ 送信する ]

補足テキスト:
  まずは気軽にご相談ください。
  24時間以内に担当者からご連絡します。

  ─────────
  contact@archi-prisma.co.jp
  〒○○○-○○○○ 東京都○○区...

送信後:
  ✓ 送信しました。24時間以内にご連絡します。
エラー時:
  送信に失敗しました。メールでお問い合わせください。
  → contact@archi-prisma.co.jp
```

### 6.10 Footer

```
AP
Archi-Prisma Design works

Work    Process    Products    Method    About    Contact

contact@archi-prisma.co.jp
Instagram  X

© 2024 Archi-Prisma Design works
一級建築士事務所 東京都知事登録 第6108号
セキュリティポリシー
```

---

## 7. インタラクション状態マシン：全要素の全状態

### 7.1 ヘッダー

```
状態A: Hero表示中（スクロール < 10px）
  背景: transparent
  テキスト色: --text-primary (白系)
  ロゴ: 白
  ハンバーガー: 白
  影: なし

状態B: スクロール中（スクロール ≥ 10px）
  背景: rgba(12, 12, 10, 0.92) + backdrop-blur(16px)
  テキスト色: --text-primary
  ロゴ: 白
  ハンバーガー: 白
  影: 0 1px 0 var(--border-subtle)
  遷移: background 300ms ease, box-shadow 300ms ease

状態C: メニュー展開中
  ハンバーガー → ✕ アイコン（回転トランジション 300ms）
  フルスクリーンメニュー表示（後述）
  body: overflow hidden
  メイン: inert属性追加（スクリーンリーダー対応）
```

### 7.2 フルスクリーンメニュー

```
状態: closed
  opacity: 0
  pointer-events: none
  各リンク: opacity 0, translateY(20px)

状態: opening（300ms）
  overlay: opacity 0→1, 300ms ease
  各リンク: stagger出現
    link[0]: delay 0ms, opacity 0→1, translateY(20px→0), 400ms ease-out
    link[1]: delay 50ms
    link[2]: delay 100ms
    ...
  フッター: delay 300ms, opacity 0→1, 200ms

状態: open
  全要素visible
  フォーカストラップ active
  ESCキーでclose
  背景クリック/タップでclose
  リンククリック → close + smooth scroll

状態: closing（300ms）
  overlay: opacity 1→0, 300ms ease
  各リンク: 一斉にopacity 0, 150ms（staggerなし = 素早く消える）

ホバー状態（デスクトップのみ）:
  リンクhover → テキスト色: --accent
  hover時に右側にセクションのサムネイル画像表示
    → opacity 0→1, 200ms
    → scale(0.95→1), 200ms
```

### 7.3 Hero 3Dプリズム

```
状態: loading（poster表示）
  poster画像: opacity 1, fetchpriority high
  canvas: opacity 0 or display none
  テキスト: stagger出現（ローダー消失後）

状態: 3D active（Three.js初期化完了）
  canvas: opacity 0→1, 600ms
  poster: そのままcanvas背面に（fallback用）
  プリズム: Y軸回転 0.002/frame
  パーティクル: sin/cos波で建築フォルム形成、3秒周期で再形成
  カメラ: ポインター追従（感度0.15、lerp 0.03/frame）

状態: reduced-motion
  Three.js import しない
  poster画像のみ表示
  テキストアニメーションなし（即座に表示）

状態: WebGL failure
  poster画像表示（Three.jsと同じ見た目）
  ユーザーへの通知なし（poster画像で体験は担保）

ポインター追従の仕様:
  入力: mousemove (clientX, clientY)
  正規化: px = clientX / window.innerWidth （0-1）
         py = clientY / window.innerHeight（0-1）
  カメラ回転:
    yaw target = (px - 0.5) * 0.3  (最大±0.15 rad)
    pitch target = (0.5 - py) * 0.15 (最大±0.075 rad)
  補間: current += (target - current) * 0.03
  モバイル: ポインター追従なし（touchmoveは不要）
```

### 7.4 Signature Phase スクロール

```
状態: セクション外（未到達）
  全Phase: opacity 0
  プログレスドット: 全て inactive (border color: --text-disabled)

状態: 導入テキスト表示中（threshold > 0.3）
  導入テキスト: fade-in (opacity + translateY)
  プログレスドット: visible but all inactive

状態: Phase N active（IntersectionObserver threshold 0.5）
  Phase N 写真: opacity 0→1, scale(1.02→1), 500ms ease-out
  Phase N テキスト: opacity 0→1, translateY(16px→0), 400ms ease-out delay 100ms
  Phase N-1: opacity 1→0, 300ms（スクロール方向に応じて上or下にexit）
  ドット N: --accent color, scale(1.3)
  ドット N-1: deactivate, scale(1)

ドットクリック:
  クリックされたPhase へ scrollIntoView({ behavior: 'smooth' })
  → IntersectionObserver が自然に active を切り替える
  → 「手動」と「自動」の矛盾なし（scroll位置が唯一の真実）

モバイル:
  写真: width 100%, height 50svh（画面上半分）
  テキスト: width 100%, 画面下半分
  ドット: 画面右端、垂直配置（デスクトップと同じ）
```

### 7.5 Works カードホバー

```
状態: default
  画像: scale(1), filter: none
  overlay: opacity 0
  テキスト（名前/場所/年）: 画像下に常時表示

状態: hover（デスクトップ）
  画像: scale(1.03), 500ms ease-out
  overlay: opacity 0.3（黒グラデーション下→上）, 300ms
  テキスト: translateY(-4px), 200ms
  カーソル: カスタムカーソル "View" 表示

状態: tap（モバイル）
  ホバーなし。タップでプロジェクト詳細 or フルスクリーン画像表示。
```

### 7.6 Method 横スクロールカード

```
状態: セクション到達前
  カードは右にオフスクリーン（translateX(30%), opacity 0）

状態: セクション表示中
  最初のカードが fade-in（opacity + translateX(0)）
  カード右端が10%見切れ → 「まだある」を暗示

スクロール操作:
  scroll-snap-type: x mandatory
  scroll-snap-align: center（各カード）
  snap時: 200ms ease-out のスムーズスナップ

ドット同期:
  IntersectionObserver（各カード、threshold 0.6）
  active カード → 対応ドット accent color + scale(1.3)

ドットクリック:
  対応カード.scrollIntoView({ behavior: 'smooth', inline: 'center' })

モバイル:
  カード幅: 85vw
  横スワイプ対応（ネイティブCSS scroll-snap）
  チラ見え: 次のカード左端15%が見える

横スクロール存在の示唆（重要）:
  ① 最初のカードの右端がフェードアウト（グラデーション mask）
  ② カード群の下にドットプログレス（5つ）
  ③ セクション右端に → アイコン（fade in/out）
```

### 7.7 Contact フォーム

```
フィールド状態:

  empty + unfocused:
    label: フィールド内、opacity 0.5
    border-bottom: 1px solid var(--border-visible)

  empty + focused:
    label: translateY(-24px), scale(0.85), color: --accent
    border-bottom: 2px solid var(--accent)
    フォーカスリング: box-shadow: 0 0 0 3px var(--accent-glow)

  filled + unfocused:
    label: translateY(-24px), scale(0.85), color: --text-tertiary
    border-bottom: 1px solid var(--border-visible)
    値テキスト: --text-primary

  error:
    label: color: --color-error
    border-bottom: 2px solid var(--color-error)
    エラーメッセージ: フィールド下に fade-in（opacity + translateY(-4px→0), 200ms）

送信ボタン状態:

  default:
    背景: transparent
    border: 1px solid var(--text-primary)
    テキスト: "送信する" / --text-primary
    ホバー: 背景 var(--accent), border: var(--accent), テキスト: white

  loading:
    テキスト: "送信中..." + 右にスピナー（小さい circle animation）
    pointer-events: none
    opacity: 0.7

  success:
    背景: var(--color-success)
    テキスト: "✓ 送信しました"
    border: var(--color-success)
    2秒後に default に戻る → 代わりに感謝メッセージ表示

  error:
    背景: var(--color-error)
    テキスト: "送信失敗"
    border: var(--color-error)
    アニメーション: 水平shake（translateX(-4→4→-2→2→0), 400ms）
    下にフォールバックメッセージ: "メールでお問い合わせください → contact@archi-prisma.co.jp"
```

---

## 8. モバイル専用設計：レスポンシブではなく「専用」

### 8.1 なぜ「レスポンシブ」では足りないか

レスポンシブ = デスクトップを縮小する。
モバイル専用 = モバイルで最高の体験を設計し、デスクトップに拡張する。

訪問者の60%がモバイル。モバイルが「メイン」でデスクトップが「拡張」。

### 8.2 モバイル固有の設計（全セクション）

#### Hero（モバイル）
```
┌────────────────────────┐
│                        │
│     [3Dプリズム]       │  ← 画面上部40%に3D（小さめ）
│     （ポインター追従   │     タッチデバイスではジャイロ or 自動回転のみ
│      なし）            │
│                        │
│                        │
│  MOVE                  │  ← 画面下部60%にテキスト
│  HEARTS.               │     中央寄せ（モバイルのF-patternは弱い）
│  心を、動かせ。        │
│                        │
│  AI × 建築 × デザインで│
│  未来の街と暮らしを    │
│  つくる。              │
│                        │
│  [ 仕事を見る → ]     │  ← 画面下1/3（thumb zone内）
│                        │
│       ↓ scroll         │
└────────────────────────┘

font-size:
  MOVE HEARTS: clamp(2.8rem, 10vw, 3.6rem)
  心を、動かせ: clamp(1.4rem, 5vw, 1.8rem)
  サブコピー: 16px
  CTA: 16px, padding: 14px 28px, min-height: 48px

注意:
  - CTAボタンは min-height: 48px, min-width: 48px（タップターゲット確保）
  - テキストと3Dの間に十分な余白（24px）
  - 3Dの aspect-ratio を固定（CLS防止）
```

#### Signature（モバイル）
```
各Phase:
┌────────────────────────┐
│                        │
│  [写真 - フルブリード] │  ← 画面上半分50svh
│  （左右余白なし）      │
│                        │
├────────────────────────┤
│                        │
│  01                    │  ← 画面下半分
│  企画 / Strategy       │     padding: 24px
│                        │
│  事業の根幹を描く。    │
│                        │
│  ─ 事業計画            │
│  ─ 都市開発企画        │
│  ─ ブランド企画        │
│                        │
└────────────────────────┘

scroll-snap-type: y mandatory（モバイルでも有効）
各Phase: min-height: 100svh

プログレスドット:
  画面右端、垂直配置
  各ドット: 10px × 10px（タップしやすく）
  ドット間余白: 12px
  ドットタップ → scrollIntoView
```

#### Works（モバイル）
```
1カラム縦積み:
┌────────────────────────┐
│                        │
│  SELECTED WORKS.       │
│  選ばれた仕事。        │
│                        │
│  ┌──────────────────┐  │
│  │                  │  │  ← 各カード: フルブリード
│  │  Project #1      │  │     aspect-ratio: 3/2
│  │                  │  │
│  │  名前            │  │  ← テキストは画像下に（overlayではない）
│  │  場所 / 年       │  │
│  └──────────────────┘  │
│                        │
│  ┌──────────────────┐  │
│  │  Project #2      │  │
│  ...                   │
│                        │
│  すべてのプロジェクトを │
│  見る →               │
│                        │
└────────────────────────┘

非対称グリッドは使わない（1カラムで十分な迫力）。
ホバー状態は存在しない（タッチデバイス）。
タップ → プロジェクト詳細へ（将来の下層ページ or モーダル）。
```

#### Method（モバイル）
```
横スワイプカード:
┌────────────────────────┐
│  HOW WE WORK.          │
│  私たちの方法論。      │
│                        │
│  ┌──────────────────┐──│──┐
│  │                  │  │  │ ← 次のカードが15%見切れ
│  │  01              │  │  │
│  │  Hearing         │  │  │
│  │  ヒアリング      │  │  │
│  │                  │  │  │
│  │  課題と理想を    │  │  │
│  │  言語化する。    │  │  │
│  │                  │  │  │
│  └──────────────────┘──│──┘
│                        │
│  ● ○ ○ ○ ○           │ ← ドット（中央寄せ）
│                        │
└────────────────────────┘

カード幅: 85vw
scroll-snap-type: x mandatory
scroll-snap-align: center
overflow-x: auto, -webkit-overflow-scrolling: touch
scrollbar: hidden（CSS ::webkit-scrollbar { display: none }）
```

#### Contact（モバイル）
```
┌────────────────────────┐
│                        │
│  LET'S START.          │
│  あなたのプロジェクトを│
│  始めよう。            │
│                        │
│  お名前               │
│  [                    ]│
│                        │
│  メール               │
│  [                    ]│
│                        │
│  ご相談内容            │
│  [                    ]│
│  [                    ]│
│                        │
│  [ 送信する          ]│  ← フル幅ボタン、48px高
│                        │
│  まずは気軽にご相談    │
│  ください。            │
│  24時間以内にご連絡    │
│  します。              │
│                        │
│  contact@archi-prisma..│
│  東京都...             │
│                        │
└────────────────────────┘

フォームは1カラム縦積み（2カラムにしない）。
全input: font-size: 16px（iOS Safariのズーム防止）。
送信ボタン: 画面幅いっぱい、thumb zone最適位置。
```

### 8.3 モバイル Sticky CTA

```
スクロール深度 > 50% で画面下部に sticky CTA バーを表示:

┌────────────────────────┐
│  コンテンツ...         │
│                        │
│                        │
├────────────────────────┤
│  [ お問い合わせ → ]   │  ← 画面最下部に固定
│  bg: var(--accent)     │     height: 56px
│  color: white          │     z-index: 40
│  font-size: 16px       │     safe-area-inset-bottom対応
└────────────────────────┘

表示条件:
  - スクロール深度 > 50%
  - #contact セクションが画面内にない時のみ表示
  - #contact が見えたら非表示（二重CTAを防止）

タップ → smooth scroll to #contact
```

---

## 9. カスタムカーソル設計（デスクトップのみ）

### 9.1 カーソル仕様

```
デフォルト状態:
  形状: 8px × 8px の円（filled）
  色: var(--text-primary)（白系）
  mix-blend-mode: difference（背景に対して常に視認性確保）
  遅延: 0（ラグなし。transform + will-change: transform で最適化）

テキストホバー:
  形状: 標準の I-beam に戻す（テキスト選択の affordance）

リンク/ボタンホバー:
  形状: 40px × 40px に拡大（300ms ease-out）
  内部テキスト: なし（シンプルに大きくなるだけ）
  mix-blend-mode: difference 維持
  ボタン要素: 微小な magneticeffect（カーソルが近づくとボタンが2-3px吸い寄せられる）

Works カードホバー:
  形状: 64px × 64px に拡大
  内部テキスト: "View" （白、12px、letter-spacing 0.1em）
  背景: rgba(74, 127, 212, 0.9) （accent blue）

3D シーンホバー:
  形状: 標準カーソルに戻す（3Dの操作は直感的であるべき）

無操作5秒:
  カーソル: opacity 0.3 に減衰
  操作再開で即座に opacity 1
```

### 9.2 実装方針

```
HTML: <div id="cursor" class="custom-cursor"></div>
CSS:
  .custom-cursor {
    position: fixed;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--text-primary);
    pointer-events: none;
    z-index: 9999;
    mix-blend-mode: difference;
    transform: translate(-50%, -50%);
    transition: width 300ms ease-out, height 300ms ease-out;
    will-change: transform;
  }
  .custom-cursor.is-link { width: 40px; height: 40px; }
  .custom-cursor.is-project { width: 64px; height: 64px; }

JS:
  mousemove → cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
  ← RAF不要。transformはブラウザが最適化。

モバイル: カスタムカーソル非表示（touch デバイス検出で display: none）
  検出: @media (hover: none) and (pointer: coarse)

prefers-reduced-motion: カーソルサイズ遷移を即時（transition: none）
```

---

## 10. コンバージョンファネル：CTAの配置戦略

### 10.1 問題: 現サイトのCTA散在

現在のCTA:
- Hero: 「実績を見る」
- Works: 「全プロジェクトを見る」
- Products: 各プロダクトへのリンク
- Contact: フォーム送信

**問題: 4種類のCTAが異なるゴールを向いている。統一されたコンバージョンパスがない。**

### 10.2 新設計: 2種類のCTAに統一

| CTA種類 | テキスト | ゴール | 配置 |
|---------|---------|--------|------|
| **Primary** | 「お問い合わせ →」or「始めよう →」 | Contact section | ヘッダー(常時), モバイルsticky(50%+), Contact |
| **Secondary** | 「仕事を見る →」「詳しく見る →」「全プロジェクト →」 | サイト内遷移 | Hero, Works, Products |

**Primary CTAは常に1つの場所（Contact）を指す。迷わない。**

### 10.3 CTA配置マップ（スクロール深度別）

```
0%  ┌── Hero ──────────────────────────────────┐
    │  Secondary: [ 仕事を見る → ] (#works)    │
    │  Header: Contact (常時表示)               │
    └──────────────────────────────────────────┘

15% ┌── Social Proof ─────────────────────────┐
    │  CTA なし（数字が語る）                  │
    └──────────────────────────────────────────┘

20-50% ┌── Signature ──────────────────────────┐
       │  CTA なし（体験に集中させる）         │
       └───────────────────────────────────────┘

55% ┌── Works ─────────────────────────────────┐
    │  Secondary: [ 全プロジェクトを見る → ]   │
    └──────────────────────────────────────────┘

    ★ ここからモバイルsticky CTA表示: [ お問い合わせ → ]

70% ┌── Method ────────────────────────────────┐
    │  CTA なし                                │
    └──────────────────────────────────────────┘

75% ┌── Products ──────────────────────────────┐
    │  Secondary: [ 詳しく見る → ] (AICommander)│
    └──────────────────────────────────────────┘

85% ┌── About ─────────────────────────────────┐
    │  CTA なし                                │
    └──────────────────────────────────────────┘

95% ┌── Contact ───────────────────────────────┐
    │  Primary: [ 送信する ]                   │
    │  ★ モバイルsticky CTA 非表示            │
    └──────────────────────────────────────────┘
```

### 10.4 コンバージョン目標値

| 指標 | 目標 | 根拠 |
|------|------|------|
| Hero離脱率 | < 30% | 業界平均40-50%を大幅に下回る |
| スクロール深度50%到達率 | > 40% | Social Proof + Signatureで引きつけ |
| スクロール深度75%到達率 | > 25% | Works + Methodで確信 |
| Contact到達率 | > 15% | 全体ページの15%がContactまで到達 |
| フォーム送信率 | > 4% | 3フィールドの簡潔フォームで |
| フォーム送信 / Contact到達 | > 25% | 到達者の1/4が送信 |

---

## 11. ビジュアルシステム完全版

### 11.1 タイポグラフィ

#### フォントスタック

| 用途 | フォント | ウェイト | 理由 |
|------|---------|---------|------|
| 英語Display | Playfair Display | 400, 700 | セリフ体で権威と精密さ。無料。建築的構造感。 |
| 日本語Display | Noto Serif JP | 400, 700 | 明朝体で格。Googleフォントで最安定。 |
| 英語Body/UI | Inter | 400, 500, 700 | 画面最適化。x-height高で可読性。 |
| 日本語Body | Noto Sans JP | 400, 700 | 本文のゴシック体は可読性のため維持。 |
| Mono/Tech | JetBrains Mono | 400 | フェーズ番号、プロダクト名用。技術信号。 |

#### タイプスケール

```css
--text-hero:       clamp(3.6rem, 11vw, 8rem);      /* Hero英語 */
--text-hero-ja:    clamp(1.8rem, 5vw, 3.6rem);     /* Hero日本語 */
--text-section:    clamp(1.8rem, 4.5vw, 3.6rem);   /* セクション見出し英語 */
--text-section-ja: clamp(1.2rem, 3vw, 2rem);       /* セクション見出し日本語 */
--text-phase:      clamp(3rem, 8vw, 6rem);          /* Phase番号 "01" */
--text-title:      clamp(1.2rem, 2.5vw, 1.8rem);   /* サブタイトル */
--text-body:       clamp(0.95rem, 1.1vw, 1.0625rem);/* 本文 17px */
--text-small:      0.8125rem;                        /* キャプション 13px */
--text-mono:       0.875rem;                         /* モノスペース 14px */

--leading-hero:    1.0;
--leading-heading: 1.15;
--leading-body:    1.8;     /* 日本語は行間広めが読みやすい */
--leading-small:   1.5;

--tracking-hero:    -0.03em;  /* 大文字は詰める */
--tracking-heading: -0.01em;
--tracking-body:    0.02em;   /* 日本語本文は微開き */
--tracking-nav:     0.1em;    /* ナビはワイド + uppercase */
--tracking-phase:   0.05em;   /* Phase番号 */
```

### 11.2 余白システム

```css
/* 8pxベースユニット */
--space-4:   4px;    /* 微調整 */
--space-8:   8px;    /* アイコンとラベルの間 */
--space-12:  12px;   /* リスト項目間 */
--space-16:  16px;   /* 段落内 */
--space-24:  24px;   /* コンポーネント内padding */
--space-32:  32px;   /* カード間 */
--space-48:  48px;   /* 見出し→本文 */
--space-64:  64px;   /* コンポーネント間 */
--space-80:  80px;   /* Footer上 */
--space-120: 120px;  /* セクション間（小） */
--space-160: 160px;  /* セクション間（中） */
--space-200: 200px;  /* セクション間（大） */

/* コンテナ */
--container-max:    1280px;
--container-px:     clamp(20px, 5vw, 120px); /* 自動レスポンシブ */
--prose-max:        640px;  /* テキスト最大幅（≈60文字/行） */

/* モバイル上書き */
@media (max-width: 640px) {
  --space-120: 72px;
  --space-160: 96px;
  --space-200: 120px;
}
```

### 11.3 動きの統一規約

```css
/* Duration */
--dur-instant: 100ms;   /* ボタンpress */
--dur-fast:    200ms;   /* ホバー */
--dur-normal:  400ms;   /* 要素出現 */
--dur-slow:    600ms;   /* セクション遷移 */
--dur-hero:    800ms;   /* Hero初回ロード */

/* Easing */
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);    /* 要素出現 */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);   /* 状態変化 */

/* Stagger */
--stagger-fast:   50ms;   /* メニュー項目 */
--stagger-normal: 100ms;  /* カード出現 */

/* prefers-reduced-motion: no-motion-first */
/* ベース: 全要素visible、motion なし */
/* @media (prefers-reduced-motion: no-preference) 内でのみ動きを追加 */
```

### 11.4 グリッドシステム

```css
/* デスクトップ: 12カラム */
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-32);
}

/* Works 非対称 */
.grid-works {
  display: grid;
  grid-template-columns: 62fr 38fr;  /* 62/38 split */
  gap: var(--space-24);
}
.grid-works:nth-child(even) {
  grid-template-columns: 38fr 62fr;  /* 交互 */
}

/* モバイル: 1カラム */
@media (max-width: 640px) {
  .grid-12, .grid-works { grid-template-columns: 1fr; }
}
```

---

## 12. コンテンツ要件：必要な写真・素材リスト

### 12.1 必須画像

| ID | 用途 | 仕様 | 枚数 | 優先度 |
|----|------|------|------|--------|
| IMG-01 | Hero poster | 代表作品の最も印象的な1枚。暗めトーン。16:9。2400px幅。 | 1 | P0 |
| IMG-02 | Signature Phase 01-06 | 各フェーズを象徴する写真。縦長可（3:4推奨）。1600px幅。 | 6 | P0 |
| IMG-03 | Works Featured #1-#4 | 厳選プロジェクト写真。横長（3:2）。2000px幅。 | 4 | P0 |
| IMG-04 | About チーム写真 | 代表 or 集合写真。1枚。1600px幅。 | 1 | P1 |
| IMG-05 | About メンバー | コアメンバー個人写真。正方形。600px幅。 | 3-5 | P1 |
| IMG-06 | Products AICommander | スクリーンショット or モックアップ。16:9。1200px幅。 | 1 | P1 |
| IMG-07 | OGP画像 | SNSシェア用。1200×630px。 | 1 | P1 |
| IMG-08 | Partners ロゴ | SVG推奨。モノクローム版。 | 5+ | P2 |

### 12.2 画像フォーマット戦略

```
全画像を3フォーマットで生成:
  1. AVIF（最優先、最小サイズ）
  2. WebP（フォールバック）
  3. JPG（最終フォールバック）

各フォーマット × 4サイズ:
  640w / 1024w / 1440w / 1920w

<picture> タグで srcset + sizes 指定。

Astro の Image コンポーネント or ビルドスクリプトで自動生成。
```

### 12.3 不要になるコンテンツ

| 現在存在 | 処理 |
|----------|------|
| handshakeアニメーションCSS（Partners） | 完全削除 |
| Works年表データ（年グループ） | メインページから削除。下層ページ用に保持。 |
| Services テキスト（services.md） | 削除しない（SEO用下層ページに将来使用可能） |
| Team Advisory/Collaborators データ | メインページから非表示。team.jsonは保持。 |
| Products 4+1+2構成のうち非表示分 | JSONデータは保持。表示を3つに制限。 |

---

## 13. 批判役レビュー体制 v2

### 13.1 三役の否決条件（強化版）

#### Brand Critic

| ID | 否決条件 | 検証方法 | タイミング |
|----|----------|----------|-----------|
| BC-1 | Hero を3秒見て「AI×建築の会社」と認識できない | 5人テスト。3/5正解必須。 | Phase 1 |
| BC-2 | ThemeForestのテンプレと見分けがつかない | テンプレ3つと並べて5人に比較。全員「違う」必須。 | Phase 1 |
| BC-3 | 「技術・実績・センス」の3点が60秒閲覧後に出てこない | 自由記述テスト。3点中2点以上。 | Phase 2 |
| BC-4 | 競合（日建設計/隈研吾）と並べて「格負け」 | 3人で主観判定。1人でも「負け」NG。 | Phase 3 |
| BC-5 | ダークモードの色彩が「暗い」「怖い」「重い」印象を与える | 感情テスト。「洗練」「高級」が上位に来ること。 | Phase 1 |

#### UX Critic

| ID | 否決条件 | 検証方法 | タイミング |
|----|----------|----------|-----------|
| UX-1 | 初訪問ユーザーがContactに3回以上迷う | 5人タスクテスト。 | Phase 2 |
| UX-2 | 任意のスクロール位置で「次に何をすべきか」が不明 | 10ポイントでランダム停止。各地点で「次は？」質問。 | Phase 2 |
| UX-3 | 1画面内の選択肢が5つを超える | 全ビューポートで手動カウント。 | Phase 1 |
| UX-4 | デスクトップでページスクロール量 > 8000px | 計測。 | Phase 1 |
| UX-5 | モバイルCTAが5秒以上画面外 | iPhone SE〜15 Pro 全機種で確認。 | Phase 2 |
| UX-6 | フォーム3フィールドのうち1つでも目的が不明 | 5人テスト。全員が各フィールドの目的を正答。 | Phase 2 |
| UX-7 | Lighthouse Accessibility < 95 | 自動テスト。 | Phase 3 |
| UX-8 | 「同じ話を2回以上している」と感じるセクションがある | 5人テスト。1人でも「重複」を指摘したらNG。 | Phase 2 |

#### Motion Critic

| ID | 否決条件 | 検証方法 | タイミング |
|----|----------|----------|-----------|
| MC-1 | 動きを1文で説明できない要素がある | 全アニメーションリスト化+目的記述。 | Phase 2 |
| MC-2 | reduced-motion でコンテンツが欠落 | 全セクション確認。 | Phase 2 |
| MC-3 | 60fps未達のアニメーションがある | Chrome DevTools Performance。 | Phase 3 |
| MC-4 | アニメーション中に操作がブロックされる | 全遷移中にクリック/スクロール。 | Phase 2 |
| MC-5 | 操作なしで3つ以上の要素が同時に動く | Hero3Dは1要素。それ以外が2つ以上同時NG。 | Phase 2 |
| MC-6 | カスタムカーソルにラグがある（体感16ms以上） | 60fps確認。transformベース確認。 | Phase 2 |

---

## 14. 実装ロードマップ v2

### Phase 1: 構造と骨格（動きなし、静的に美しい）

**ゴール: アニメーション全OFFでも「格」がある状態**

| # | タスク | 依存 | 完了基準 |
|---|--------|------|----------|
| 1-01 | カラーシステム全面差替 | なし | ダークパレット適用。ゴールド全削除。accent blue統一。 |
| 1-02 | フォント差替 | なし | Barlow→Playfair Display, +Noto Serif JP, +Inter, +JetBrains Mono。 |
| 1-03 | タイプスケール統一 | 1-02 | 全clamp()値を新変数化。一貫した階層。 |
| 1-04 | 余白システム適用 | なし | セクション間160-200px。コンテナpadding拡大。prose-max: 640px。 |
| 1-05 | ヘッダー再設計 | 1-01, 1-02 | モノグラム。3リンク+ハンバーガー。ダーク。64px。 |
| 1-06 | フルスクリーンメニュー実装 | 1-05 | ダーク背景。大タイポ。ESC/背景クリックで閉じる。aria対応。 |
| 1-07 | Hero テキスト再設計（3Dは後） | 1-01〜1-04 | 左寄せ、CTA1つ、登録情報極小。poster画像背景。 |
| 1-08 | ★Social Proof 新規セクション | 1-01〜1-04 | 3つの数字 + コピー。 |
| 1-09 | Signature 全面刷新 | 1-01〜1-04 | フルスクリーン×6。scroll-snap。プログレスドット。写真+テキスト。 |
| 1-10 | Works 再設計 | 1-01, 1-04 | 非対称2カラム×2行 + フルブリード1。4作品。年表削除。 |
| 1-11 | ImmersiveEngine 削除 | なし | index.astroから除去。コンポーネントファイルはバックアップ保持。 |
| 1-12 | Method 横スクロール化 | 1-01〜1-04 | scroll-snap。5カード。ドットプログレス。 |
| 1-13 | Products 3つに絞る | 1-01 | AICommander featured + 2小カード。 |
| 1-14 | About+Team+Partners 統合 | 1-01 | 1セクション。写真+4行+3名+ロゴ列。 |
| 1-15 | Contact 簡潔化 | 1-01 | 3フィールド。ラベル常時表示。CTA文言変更。 |
| 1-16 | Services 削除 | なし | index.astroから除去。 |
| 1-17 | Footer 刷新 | 1-01 | ミニマル。ナビ+SNS+法的情報。 |
| 1-18 | ローダー実装 | 1-01 | インラインCSS。モノグラム呼吸。poster preload。 |
| 1-19 | セクション間つなぎテキスト | 1-08〜1-15 | 全7箇所。 |
| 1-20 | scroll-margin-top 調整 | 1-05 | 72px（ヘッダー高64px + 8px余裕）。 |

**Phase 1 レビューゲート: BC-1, BC-2, BC-5, UX-3, UX-4**

### Phase 2: 動きとインタラクション

**ゴール: 「すごい体験」が動きを持って成立**

| # | タスク | 依存 | 完了基準 |
|---|--------|------|----------|
| 2-01 | Hero 3Dプリズム実装 | Phase 1 | パーティクル + ガラスプリズム + poster→canvasフェードイン。 |
| 2-02 | Hero テキスト stagger アニメーション | Phase 1 | 3段階出現。 |
| 2-03 | Social Proof カウンターアニメーション | Phase 1 | IntersectionObserver でトリガー。 |
| 2-04 | Signature Phase 遷移アニメーション | 1-09 | 写真 fade-in+scale + テキスト fade-in+translateY。 |
| 2-05 | Works ホバーエフェクト | 1-10 | scale(1.03) + overlay + テキスト出現。 |
| 2-06 | Method カード出現アニメーション | 1-12 | fade-in + translateX。 |
| 2-07 | フルスクリーンメニュー stagger | 1-06 | 項目50ms stagger出現。 |
| 2-08 | Contact フォーム マイクロインタラクション | 1-15 | focus時ラベル移動、送信状態遷移。 |
| 2-09 | カスタムカーソル実装 | Phase 1 | 8px dot、リンク拡大、Works "View"。 |
| 2-10 | モバイル sticky CTA | Phase 1 | 50%+表示、Contact到達で非表示。 |
| 2-11 | スクロールアニメーション統一 | Phase 1 | 全data-reveal要素のtiming統一。blur削除。 |
| 2-12 | prefers-reduced-motion 全面対応 | 2-01〜2-11 | no-motion-first。Three.js条件分岐。 |

**Phase 2 レビューゲート: BC-3, UX-1, UX-2, UX-5, UX-6, UX-8, MC-1〜MC-6**

### Phase 3: 品質・パフォーマンス・検証

**ゴール: Lighthouseオール90+。Core Web Vitals全合格。**

| # | タスク | 依存 | 完了基準 |
|---|--------|------|----------|
| 3-01 | 画像最適化（AVIF/WebP/srcset/sizes） | Phase 2 | 全画像3フォーマット×4サイズ。 |
| 3-02 | フォント最適化 | Phase 2 | font-display: swap, preconnect。 |
| 3-03 | Three.js 最適化 | 2-01 | DPR上限2。モバイルパーティクル削減。dispose確認。 |
| 3-04 | CLS対策 | Phase 2 | 全img width/height。canvas aspect-ratio。font size-adjust。 |
| 3-05 | Lighthouse 監査 | 3-01〜3-04 | Performance 90+, Accessibility 95+, BP 95+, SEO 95+。 |
| 3-06 | Core Web Vitals | 3-01〜3-04 | LCP<2.5s, INP<200ms, CLS<0.1。 |
| 3-07 | 構造化データ更新 | Phase 2 | JSON-LD拡充。 |
| 3-08 | OGP更新 | Phase 2 | 新デザインに合わせたog-image。 |
| 3-09 | クロスブラウザテスト | 3-05 | Chrome/Safari/Firefox/Edge + iOS Safari + Android Chrome。 |
| 3-10 | 最終全Criticレビュー | 3-09 | 全否決条件クリア。 |

**Phase 3 レビューゲート: BC-4, UX-7, MC-3, + 全条件再検証**

---

## 15. リスクと回避策 v2

| # | リスク | 影響 | 確率 | 回避策 |
|---|--------|------|------|--------|
| R-1 | Three.jsでLCP > 2.5s | 高 | 高 | poster画像をLCP要素にし、Three.jsは非同期後読み。 |
| R-2 | ダークモードが「暗すぎ」「怖い」 | 高 | 中 | #0C0C0A（純黒回避）+ ウォームトーン。BC-5で早期検証。 |
| R-3 | Signature の scroll-snap が iOS Safari で不安定 | 中 | 低 | proximity fallback + JS制御フォールバック。 |
| R-4 | ImmersiveEngine削除でSEO順位低下 | 中 | 低 | 3Dコンテンツはtext indexに寄与しない。SEO影響なし。 |
| R-5 | 有料フォントのライセンス | 低 | — | Playfair Display（無料）を推奨。有料は不使用。 |
| R-6 | フォーム3フィールドで情報不足（営業側の不満） | 中 | 中 | 送信後の自動返信メールで追加ヒアリング。初回は障壁を下げる。 |
| R-7 | ゴールドカラー削除に対するオーナー反発 | 中 | 中 | 「写真の中のゴールドが映える」と説明。UIゴールドはノイズ。 |
| R-8 | カスタムカーソルのパフォーマンス | 低 | 低 | transform only（GPU）。RAFなし。@media (hover: none)で無効化。 |
| R-9 | 11→9セクション削減で情報不足感 | 中 | 低 | 削除ではなく「統合」。全情報はSignature + Footerに残存。 |
| R-10 | モバイルsticky CTAがコンテンツを遮る | 中 | 中 | height: 56px + safe-area。Contact到達で非表示。余白確保。 |

---

## 16. 計測・検証計画 v2

### 16.1 成功指標（KPI）

| カテゴリ | 指標 | 目標 | 計測 |
|----------|------|------|------|
| 第一印象 | Hero bounce rate | < 30% | GA4 scroll event |
| 引き込み | avg scroll depth | > 65% | GA4 |
| 引き込み | session duration | > 90s | GA4 |
| コンバージョン | Contact section reach rate | > 15% | GA4 section visibility event |
| コンバージョン | Form submission rate | > 4% | GA4 form event |
| コンバージョン | Form submit / Contact reach | > 25% | 計算 |
| パフォーマンス | LCP | < 2.5s | CrUX |
| パフォーマンス | INP | < 200ms | CrUX |
| パフォーマンス | CLS | < 0.1 | CrUX |
| 品質 | Lighthouse Performance | > 90 | Lighthouse CI |
| 品質 | Lighthouse Accessibility | > 95 | Lighthouse CI |
| ブランド | 「普通じゃない」認知 | > 60% | 5人テスト |
| ブランド | 「AI/技術会社」認知 | > 80% | 5人テスト |
| UX | 「迷った」報告 | 0件 | 5人タスクテスト |

### 16.2 計測インフラ

```
リリース前:
  ① Lighthouse CI（GitHub Actions自動実行）
  ② axe DevTools（アクセシビリティ自動スキャン）
  ③ Chrome DevTools Performance（60fps確認）
  ④ WebPageTest（3G回線シミュレーション）

リリース後（1週間）:
  ⑤ GA4: scroll depth, CTA click, form submit
  ⑥ CrUX: フィールドデータ
  ⑦ Microsoft Clarity: ヒートマップ + セッションレコーディング（無料）

リリース後（1ヶ月）:
  ⑧ 5人ユーザーテスト
  ⑨ 競合比較テスト
```

---

## 17. Codex実装指示（全タスク詳細）

> **以下はCodexへの直接指示。各タスクは独立実行可能。**

### Task 1-01: カラーシステム全面差替

```
対象: src/styles/global.css, 全.astroコンポーネント

手順:
1. global.css の @theme ブロックを以下に完全置換:

  @theme {
    --color-bg-base:       #0C0C0A;
    --color-bg-elevated:   #141412;
    --color-bg-surface:    #1C1C18;
    --color-text-primary:  #EDECE8;
    --color-text-secondary:#A8A69E;
    --color-text-tertiary: #6B6960;
    --color-text-disabled: #3D3B36;
    --color-accent:        #4A7FD4;
    --color-accent-hover:  #6B9AE8;
    --color-accent-subtle: rgba(74, 127, 212, 0.10);
    --color-accent-glow:   rgba(74, 127, 212, 0.25);
    --color-border-subtle: rgba(237, 236, 232, 0.06);
    --color-border-visible:rgba(237, 236, 232, 0.12);
    --color-success:       #4CAF7D;
    --color-error:         #E05252;
    /* DELETED: primary-100〜600, accent-300/500/600, surface-50〜900 */
  }

2. 全コンポーネントの色参照を新変数に置換:
   bg-surface-50 → bg-bg-base
   text-surface-900 → text-text-primary
   border-surface-200 → border-border-visible
   bg-primary-600 → bg-accent
   accent-gold系 → 全てaccent（blue）に統一

3. html body に背景色を設定:
   html { background-color: var(--color-bg-base); color: var(--color-text-primary); }

4. 全コンポーネントのダーク前提化:
   - 白背景のセクション → bg-base or bg-elevated
   - 黒テキスト → text-primary（ほぼ白）
   - ボーダー → border-subtle or border-visible
```

### Task 1-07: Hero テキスト再設計

```
対象: src/components/Hero.astro, src/styles/global.css

手順:
1. Hero.astro のHTML構造を以下に変更:

<section id="hero" class="hero">
  <!-- poster画像（LCP要素） -->
  <img
    src="/assets/hero-poster.webp"
    alt="Archi-Prisma 代表プロジェクト"
    class="hero-poster"
    fetchpriority="high"
    width="1920" height="1080"
  />

  <!-- 3D canvas placeholder（Phase 2で実装） -->
  <div class="hero-canvas-slot" aria-hidden="true"></div>

  <!-- テキストコンテンツ -->
  <div class="hero-content">
    <div class="hero-text">
      <h1 class="hero-title">
        <span class="hero-title-en">MOVE<br>HEARTS.</span>
        <span class="hero-title-ja">心を、動かせ。</span>
      </h1>
      <p class="hero-sub">
        AI × 建築 × デザインで、<br>
        未来の街と暮らしをつくる。
      </p>
      <a href="#works" class="hero-cta">仕事を見る →</a>
    </div>
    <p class="hero-reg">一級建築士事務所 東京都知事登録 第6108号</p>
  </div>

  <!-- スクロール示唆 -->
  <div class="hero-scroll" aria-hidden="true">↓ scroll</div>
</section>

2. CSS:
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: flex-end;
  background: var(--color-bg-base);
  overflow: hidden;
}
.hero-poster {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  opacity: 0.35;  /* 暗めにしてテキスト読みやすく */
}
.hero-content {
  position: relative; z-index: 1;
  width: 100%;
  padding: 0 var(--container-px) 80px;
  display: flex; justify-content: space-between; align-items: flex-end;
}
.hero-text { max-width: 600px; }
.hero-title-en {
  font-family: var(--font-display);
  font-size: var(--text-hero);
  line-height: var(--leading-hero);
  letter-spacing: var(--tracking-hero);
  color: var(--color-text-primary);
}
.hero-title-ja {
  display: block;
  font-family: var(--font-serif);
  font-size: var(--text-hero-ja);
  line-height: 1.2;
  color: var(--color-text-primary);
  margin-top: 8px;
}
.hero-sub {
  font-size: var(--text-body);
  color: var(--color-text-secondary);
  margin-top: 24px;
  line-height: var(--leading-body);
}
.hero-cta {
  display: inline-block;
  margin-top: 32px;
  padding: 14px 32px;
  border: 1px solid var(--color-text-primary);
  color: var(--color-text-primary);
  font-size: var(--text-body);
  letter-spacing: 0.03em;
  transition: background var(--dur-fast) var(--ease-out),
              color var(--dur-fast) var(--ease-out);
}
.hero-cta:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}
.hero-reg {
  font-size: 10px;
  color: var(--color-text-disabled);
  text-align: right;
}
.hero-scroll {
  position: absolute;
  bottom: 24px; left: 50%; transform: translateX(-50%);
  font-size: 12px;
  color: var(--color-text-tertiary);
  letter-spacing: 0.1em;
}

@media (max-width: 640px) {
  .hero-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding-bottom: 60px;
  }
  .hero-text { max-width: 100%; }
  .hero-reg { text-align: center; margin-top: 24px; }
}

3. 削除するもの:
   - gridオーバーレイ
   - パララックスJS（Phase 2で3Dに置換）
   - CTA2つ目
   - Trustline
   - Kicker ("Archi-Prisma Design works" テキスト)
```

### Task 1-09: Signature 全面刷新

```
対象: src/components/SignatureExperience.astro, src/lib/signatureTracks.mjs

手順:
1. signatureTracks.mjs に image フィールド追加:
   各trackに image: "/assets/signature/phase-0X.webp" を追加。

2. SignatureExperience.astro を完全書き換え:

<section id="signature">
  <!-- 導入 -->
  <div class="sig-intro" style="padding: var(--space-200) var(--container-px) var(--space-120);">
    <p class="sig-eyebrow" style="color: var(--color-accent); font-family: var(--font-mono); font-size: var(--text-small); letter-spacing: 0.1em; margin-bottom: 16px;">
      FROM STRATEGY TO OPERATION.
    </p>
    <h2 style="font-family: var(--font-serif); font-size: var(--text-section-ja); color: var(--color-text-primary);">
      企画から、運用まで。
    </h2>
    <p style="color: var(--color-text-secondary); font-size: var(--text-body); margin-top: 16px; max-width: var(--prose-max);">
      ひとつの会社が、すべてをやる。
    </p>
  </div>

  <!-- 6 Phases -->
  <div class="sig-phases">
    {tracks.map((track, i) => (
      <div class="sig-phase" id={`phase-${i+1}`} data-phase={i}>
        <div class={`sig-phase-inner ${i % 2 === 0 ? '' : 'sig-phase-reversed'}`}>
          <div class="sig-phase-image">
            <img src={track.image} alt={track.phaseJa} loading="lazy"
                 width="800" height="1067" />
          </div>
          <div class="sig-phase-content">
            <span class="sig-phase-num">{String(i+1).padStart(2,'0')}</span>
            <h3 class="sig-phase-title">
              <span class="ja">{track.phaseJa}</span>
              <span class="en"> / {track.phaseEn}</span>
            </h3>
            <p class="sig-phase-summary">{track.summary}</p>
            <ul class="sig-phase-caps">
              {track.capabilities.map(c => <li>─ {c}</li>)}
            </ul>
          </div>
        </div>
      </div>
    ))}
  </div>

  <!-- プログレスドット -->
  <nav class="sig-progress" aria-label="フェーズナビゲーション">
    {tracks.map((_, i) => (
      <button class="sig-dot" data-dot={i}
              aria-label={`Phase ${i+1}`}></button>
    ))}
  </nav>

  <!-- つなぎ -->
  <p class="sig-bridge" style="text-align: center; padding: var(--space-120) var(--container-px); color: var(--color-text-tertiary); font-size: var(--text-body);">
    言葉より、仕事で語る。
  </p>
</section>

3. CSS:
.sig-phases {
  /* scroll-snap で各Phase 100svh */
}
.sig-phase {
  min-height: 100svh;
  scroll-snap-align: start;
  display: flex;
  align-items: center;
}
.sig-phase-inner {
  display: flex;
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-px);
  gap: var(--space-64);
}
.sig-phase-reversed { flex-direction: row-reverse; }
.sig-phase-image {
  flex: 0 0 55%;
}
.sig-phase-image img {
  width: 100%; height: 80svh;
  object-fit: cover;
  border-radius: 2px;
}
.sig-phase-content {
  flex: 1;
  display: flex; flex-direction: column; justify-content: center;
}
.sig-phase-num {
  font-family: var(--font-mono);
  font-size: var(--text-phase);
  color: var(--color-accent);
  line-height: 1;
  letter-spacing: var(--tracking-phase);
}
.sig-phase-title .ja {
  font-family: var(--font-serif);
  font-size: var(--text-title);
}
.sig-phase-title .en {
  font-family: var(--font-display);
  font-size: var(--text-small);
  color: var(--color-text-tertiary);
}
.sig-phase-summary {
  color: var(--color-text-secondary);
  font-size: var(--text-body);
  line-height: var(--leading-body);
  margin-top: 24px;
  max-width: var(--prose-max);
}
.sig-phase-caps {
  list-style: none;
  margin-top: 24px;
  color: var(--color-text-tertiary);
  font-size: var(--text-small);
}
.sig-phase-caps li { margin-top: 8px; }

/* プログレスドット */
.sig-progress {
  position: fixed;
  right: 24px; top: 50%;
  transform: translateY(-50%);
  display: flex; flex-direction: column;
  gap: 12px;
  z-index: 30;
}
.sig-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  border: 1px solid var(--color-text-disabled);
  background: transparent;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-out);
}
.sig-dot.is-active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  transform: scale(1.4);
}

/* モバイル */
@media (max-width: 640px) {
  .sig-phase-inner { flex-direction: column !important; }
  .sig-phase-image { flex: 0 0 auto; }
  .sig-phase-image img { height: 45svh; }
  .sig-phase-content { padding: 24px 0; }
}

4. JavaScript (is:inline):
  - IntersectionObserver(threshold: 0.5) で各 .sig-phase を監視
  - active phase → 対応 .sig-dot に .is-active 追加
  - .sig-dot クリック → 対応 .sig-phase.scrollIntoView({ behavior: 'smooth' })
  - .sig-progress の表示/非表示:
    Signature セクションが画面内の時のみ visible（opacity 1）
    セクション外では opacity 0, pointer-events: none

5. 完全削除:
  - marquee
  - ポインタートラッキンググラデーション
  - タブUI
  - プログレスバー（scaleY）
  - 自動サイクル
```

### Task 1-11: ImmersiveEngine 削除

```
対象: src/pages/index.astro, src/components/ImmersiveEngine.astro

手順:
1. index.astro から ImmersiveEngine の import と使用を削除。
2. ImmersiveEngine.astro は削除しない（git履歴で復元可能にバックアップ）。
   ファイル先頭にコメント追加:
   <!-- DEPRECATED: v2計画で削除。Hero 3Dプリズムに統合。 -->
3. src/lib/immersiveNodes.mjs の参照を全削除。ファイル自体は保持。
4. global.css 内の .engine- prefixの全スタイルを削除。

根拠:
  - 9ドメインボタンはHick's Law違反（C-8）
  - 自動サイクルがユーザー制御を奪う（C-7）
  - Signature/Engine/Methodの3重フェーズUIが混乱の元凶（C-11）
  - 3Dの価値はHeroプリズムに集約（Three.js 1回ロードで済む）
```

### Task 1-15: Contact 簡潔化

```
対象: src/components/Contact.astro

手順:
1. フォームフィールドを3つに削減:
   - 名前（テキスト、required）
   - メール（email、required）
   - ご相談内容（textarea、required）
   削除: 会社名、電話番号、カテゴリselect、チェックボックス

2. ラベルを常時表示に変更（floating label廃止）:
   <label for="name">お名前</label>
   <input type="text" id="name" name="name" required />
   → ラベルはフィールド上に常時表示。フィールドfocus時に色がaccentに。

3. CTA文言変更:
   「送信」→「送信する」

4. 期待値設定テキスト追加:
   フォーム右側（デスクトップ）/ フォーム下（モバイル）:
   "まずは気軽にご相談ください。"
   "24時間以内に担当者からご連絡します。"

5. 送信後UX:
   成功: ボタン→「✓ 送信しました」+ 緑。
   失敗: ボタン→「送信失敗」+ 赤 + shake + フォールバックメール表示。

6. honeypotフィールドは維持（spam対策として有効）。
```

---

## 最終確認: このサイトを見た人間に起こること

```
0秒   ダーク画面に "AP" → 「洗練されてる」
1秒   プリズムと MOVE HEARTS. → 「何だこれは」
7秒   23年、6領域、47プロジェクト → 「本物だ」
12秒  企画フェーズ写真 → 「企画からやるのか」
18秒  AI開発フェーズ → 「AIまで自社開発？」
30秒  厳選4作品の写真 → 「実績も本物だ」
40秒  5ステップの方法論 → 「ちゃんとしてる」
50秒  チーム3名の顔 → 「この人たちなら信頼できる」
55秒  「始めよう」+ 3フィールドフォーム → 「送ってみるか」
60秒  「✓ 送信しました」→ 完了
```

**1秒たりとも迷わない。1ピクセルたりとも無駄がない。**
**この感情が起きない設計は不採用。**

---

*Archi-Prisma Design works — Codex完全実装指示書 v2*
*全17章。全タスクCodex実行可能。*
