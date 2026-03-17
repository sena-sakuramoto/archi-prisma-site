# Archi-Prisma Design works — Codex完全実装指示書 v3

> v2は「何を見せるか」を設計した。v3は「どう心を震わせるか」を設計する。
> 技術が見える。技術が語る。技術が証明する。
> このサイトを5秒見た人間が「この会社は本物だ」と確信する体験をつくる。

---

## v2からの変更点サマリー

v2の**UXジャーニー・マイクロコピー・情報設計**はそのまま維持。以下を追加・刷新：

| 領域 | v2の状態 | v3で追加 |
|------|---------|---------|
| Hero 3D | 「CylinderGeometry + sin波パーティクル」=入門デモ | カスタムGLSLシェーダー + ポストプロセッシング + GPGPU粒子 |
| スクロール体験 | CSS scroll-snap のみ | Lenis スムーズスクロール + GSAP ScrollTrigger 全セクション連動 |
| セクション出現 | アニメーションなし（静的表示） | 全要素にスクロールトリガーReveal + Stagger |
| 視覚的奥行き | 全セクション同じ `#0C0C0A` 背景 | セクション別グラデーション + ノイズテクスチャ + ambient光彩 |
| CSS品質 | 「暗い背景にボーダーカード」 | 影・グロー・グラデーション・ガラスモーフィズム明記 |
| 既存コード清掃 | 650行の死んだCSS放置 | global.css完全刷新。worldclass.css一本化。 |
| パフォーマンス | 指標なし | デバイスTier別GPU予算・描画コール上限・バンドルサイズ制限 |

---

## 目次

0. [技術思想：なぜ技術を「見せる」のか](#0-技術思想)
1. [技術アーキテクチャ全体図](#1-技術アーキテクチャ)
2. [Hero 3D — 本気のWebGL](#2-hero-3d)
3. [スクロール演出システム — Lenis + GSAP](#3-スクロール演出)
4. [セクション別アニメーション振付表](#4-セクション別振付)
5. [ビジュアルレイヤーシステム — 奥行きと空気感](#5-ビジュアルレイヤー)
6. [CSS品質基準 — 二度と「しょぼい」と言わせない](#6-css品質基準)
7. [既存コード清掃指示](#7-コード清掃)
8. [パフォーマンス予算](#8-パフォーマンス予算)
9. [実装ロードマップ v3](#9-実装ロードマップ)
10. [Codex実装タスク（全指示）](#10-codex実装タスク)

---

## 0. 技術思想：なぜ技術を「見せる」のか

「AI × 建築 × デザイン」を名乗る会社のサイトが、テンプレートサイトと区別がつかないのは**詐欺**。

訪問者は言語化しないが、無意識に判定している：
- 「このサイト自体が、この会社の技術力の証拠か？」
- 「この会社に頼んだら、このレベルの体験がつくれるのか？」

**サイト = 最大のポートフォリオ作品。** サイトがしょぼければ、建築もしょぼいと判断される。

技術を見せる原則：
1. **見せびらかさない** — 技術は空気のように存在する。「すごい」と感じるが何がすごいかわからない。
2. **全てに目的がある** — 動くものは全て意味を持つ。装飾的な動きは存在しない。
3. **壊れても美しい** — WebGL非対応でもポスター画像で格を保つ。減速モーションでもコンテンツは完全に読める。

---

## 1. 技術アーキテクチャ全体図

### 1.1 技術スタック

```
フレームワーク:  Astro 5.x (SSG)
スタイル:        Tailwind CSS v4 + worldclass.css (custom)
3D:              Three.js r182 + カスタムGLSLシェーダー
スクロール:      Lenis (スムーズスクロール) + GSAP ScrollTrigger (アニメーション)
ビルド:          Vite (Astro内蔵)
デプロイ:        静的ホスティング (Cloudflare Pages推奨)
```

### 1.2 依存関係の追加

```json
{
  "dependencies": {
    "three": "^0.172.0",
    "postprocessing": "^6.36.0",
    "lenis": "^1.3.13",
    "gsap": "^3.13.0"
  }
}
```

> **postprocessing** (pmndrs): Three.js native EffectComposer の上位互換。
> 複数エフェクトを**自動で単一シェーダーパスにマージ**し、描画コールを削減。
> WebGLプロジェクトではpmndrs/postprocessingが性能面で確実に優位。

> **GSAP**: 2025年5月にWebflow買収後、SplitText・ScrollSmoother含む全プラグインが**完全無料化**。
> ライセンスはMITではなく独自（Standard License No-Charge）だが、通常のウェブサイト制作は問題なし。
> 禁止事項: Webflowのビジュアルアニメーションビルダーと競合するツールへの組み込みのみ。
> **Motion One代替パスは不要。GSAP一本で進める。**

### 1.3 ファイル構成（新規・変更）

```
src/
├── styles/
│   ├── global.css          ← 刷新（Tailwind + @theme のみ。旧CSS全削除）
│   └── worldclass.css      ← 刷新（v1部分削除。v2セクション強化）
├── lib/
│   ├── smoothScroll.ts     ← 【新規】Lenis初期化 + GSAP連携
│   ├── heroScene.ts        ← 【新規】Three.js シーン（Hero専用）
│   ├── shaders/
│   │   ├── prismVertex.glsl    ← 【新規】プリズム頂点シェーダー
│   │   ├── prismFragment.glsl  ← 【新規】プリズム フラグメントシェーダー
│   │   ├── particleVertex.glsl ← 【新規】パーティクル頂点
│   │   └── particleFragment.glsl ← 【新規】パーティクル フラグメント
│   ├── postProcessing.ts   ← 【新規】pmndrs/postprocessing EffectComposer セットアップ
│   └── scrollAnimations.ts ← 【新規】全セクションのGSAPアニメーション定義
├── components/
│   ├── Hero.astro          ← 3Dスクリプトを外部モジュールに分離
│   └── ...                 ← 各コンポーネントはそのまま（CSSのみ変更）
```

### 1.4 スクリプトロード戦略

```
0ms:     HTML + Critical CSS (インライン <style>)
         → First Paint: ダーク背景 + "AP" ローダー

100ms:   Lenis + GSAP ロード (ESM dynamic import)
         → スムーズスクロール有効化
         → ScrollTrigger 全セクションにバインド

500ms:   Hero poster 表示完了 (preload済)
         → ローダー消失
         → テキスト stagger reveal 開始

2000ms:  Three.js 動的 import 開始
         → メインスレッドブロックなし

2500ms:  Three.js シーン初期化
         → カスタムシェーダーコンパイル
         → ポストプロセッシング有効化
         → canvas fade-in (600ms)

∞:       prefers-reduced-motion: reduce の場合
         → Three.js import しない
         → Lenis は有効（スムーズスクロールは減速モーションと別）
         → GSAP アニメーションは全て duration: 0 に上書き
```

---

## 2. Hero 3D — 本気のWebGL

### 2.1 現状の問題（再掲）

```
現在:
  CylinderGeometry(1.2, 1.2, 3.5, 6)     ← プリセット形状
  MeshPhysicalMaterial({ transmission })   ← 組み込みマテリアル
  2500 Points + sin/cos 波                ← 入門チュートリアル
  ポインター追従カメラ                     ← 基本実装
  ポストプロセッシング: なし
  カスタムシェーダー: なし

問題: Three.jsの公式exampleのコピペと区別がつかない。
```

### 2.2 新しい3Dシーンの設計思想

プリズムは「AI × 建築」の**メタファー**:
- **プリズム** = 建築的構造体。六角柱は建築のモジュール性。
- **光の屈折** = 一つの光（クライアントの要望）を複数のスペクトル（6領域）に分解する会社の能力。
- **パーティクル** = データ/AI。構造体の周りを知性のように循環する。

この意味が無意識に伝わる3Dをつくる。

### 2.3 カスタムシェーダー仕様

#### プリズム — スペクトル分散シェーダー

```glsl
// prismFragment.glsl — フラグメントシェーダー核心部

// 目的: プリズムが光を虹色に分散する。入門デモの「半透明六角柱」ではない。

uniform float uTime;
uniform vec3 uCameraPosition;
uniform samplerCube uEnvMap;       // 環境マップ（動的生成 or HDR）
uniform float uIOR;                // 屈折率 1.45-1.55
uniform float uDispersion;         // 分散強度 0.03-0.08
uniform float uFresnelPower;       // フレネル指数 2.0-5.0

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;

// スペクトル分散: 波長ごとに異なるIORで屈折させる
vec3 spectralRefraction(vec3 incident, vec3 normal, float baseIOR, float dispersion) {
    float iorR = baseIOR - dispersion;      // 赤: 屈折率低い（曲がり少ない）
    float iorG = baseIOR;                    // 緑: 基準
    float iorB = baseIOR + dispersion;      // 青: 屈折率高い（曲がり多い）

    vec3 refractR = refract(incident, normal, 1.0 / iorR);
    vec3 refractG = refract(incident, normal, 1.0 / iorG);
    vec3 refractB = refract(incident, normal, 1.0 / iorB);

    float r = textureCube(uEnvMap, refractR).r;
    float g = textureCube(uEnvMap, refractG).g;
    float b = textureCube(uEnvMap, refractB).b;

    return vec3(r, g, b);
}

// フレネル効果: 視線角度で反射率が変わる
float fresnel(vec3 viewDir, vec3 normal, float power) {
    return pow(1.0 - max(dot(viewDir, normal), 0.0), power);
}

void main() {
    vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
    vec3 normal = normalize(vNormal);

    // スペクトル分散された屈折色
    vec3 refractionColor = spectralRefraction(-viewDir, normal, uIOR, uDispersion);

    // 反射色
    vec3 reflectionColor = textureCube(uEnvMap, reflect(-viewDir, normal)).rgb;

    // フレネル混合
    float f = fresnel(viewDir, normal, uFresnelPower);
    vec3 color = mix(refractionColor, reflectionColor, f);

    // エッジグロー（プリズムの輪郭が微かに青く光る）
    float edgeGlow = pow(1.0 - abs(dot(viewDir, normal)), 3.0);
    color += vec3(0.29, 0.5, 0.83) * edgeGlow * 0.15;  // accent blueの微光

    // 時間による微かな虹彩変化
    float iridescence = sin(vUv.y * 12.0 + uTime * 0.5) * 0.03;
    color += vec3(iridescence, iridescence * 0.7, -iridescence);

    gl_FragColor = vec4(color, 0.92);
}
```

**Three.js側の実装:**

```typescript
// heroScene.ts

import * as THREE from 'three';
// ポストプロセッシングは pmndrs/postprocessing を使用（§2.4 参照）
// Three.js native EffectComposer は使わない

// プリズム: ShaderMaterial で完全カスタム
const prismMaterial = new THREE.ShaderMaterial({
    vertexShader: prismVertexGLSL,
    fragmentShader: prismFragmentGLSL,
    uniforms: {
        uTime: { value: 0 },
        uCameraPosition: { value: new THREE.Vector3() },
        uEnvMap: { value: envCubeTexture },
        uIOR: { value: 1.5 },
        uDispersion: { value: 0.05 },
        uFresnelPower: { value: 3.0 },
    },
    transparent: true,
    side: THREE.DoubleSide,
});

// ジオメトリ: 六角柱だがsubdivision追加でスムーズ
const prismGeometry = new THREE.CylinderGeometry(1.2, 1.2, 3.5, 6, 8, false);
```

#### パーティクル — GPGPUシステム（50,000個）

```
現在: CPU上で2500個のsin/cos波 → しょぼい
新:   GPU上で50,000個の物理シミュレーション → 圧倒的

技術: GPUComputationRenderer (Three.js addon)
原理:
  1. パーティクルの位置と速度をテクスチャ(DataTexture)に格納
  2. フラグメントシェーダーでテクスチャの各ピクセルを更新 = 物理計算
  3. 頂点シェーダーでテクスチャから位置を読み取り描画
  → 全計算がGPU上で完結。CPUはuniform更新のみ。
```

```glsl
// particleCompute.glsl — GPU物理シミュレーション

uniform float uTime;
uniform float uDeltaTime;
uniform vec3 uPrismCenter;       // プリズム中心
uniform float uPrismRadius;      // プリズム影響半径
uniform vec2 uPointer;           // マウス位置（正規化）
uniform float uPointerStrength;  // マウス影響力

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 posData = texture2D(texturePosition, uv);  // xyz=位置, w=寿命
    vec4 velData = texture2D(textureVelocity, uv);  // xyz=速度, w=質量

    vec3 pos = posData.xyz;
    vec3 vel = velData.xyz;
    float life = posData.w;
    float mass = velData.w;

    // 1. プリズムへの引力（逆二乗則）
    vec3 toPrism = uPrismCenter - pos;
    float dist = length(toPrism);
    vec3 gravity = normalize(toPrism) * 0.8 / (dist * dist + 0.5);

    // 2. 軌道運動（角運動量保存）
    vec3 tangent = normalize(cross(toPrism, vec3(0.0, 1.0, 0.0)));
    vec3 orbital = tangent * 1.2 / (dist + 0.3);

    // 3. 乱流（Curl Noise的な揺らぎ）
    float noise1 = sin(pos.x * 2.3 + uTime * 0.7) * cos(pos.z * 1.8 + uTime * 0.5);
    float noise2 = cos(pos.y * 3.1 + uTime * 0.9) * sin(pos.x * 1.4 + uTime * 0.3);
    float noise3 = sin(pos.z * 2.7 + uTime * 0.6) * cos(pos.y * 2.0 + uTime * 0.8);
    vec3 turbulence = vec3(noise1, noise2, noise3) * 0.15;

    // 4. マウスインタラクション（斥力）
    vec3 pointerWorld = vec3(uPointer.x * 4.0, uPointer.y * 3.0, 2.0);
    vec3 toPointer = pos - pointerWorld;
    float pointerDist = length(toPointer);
    vec3 pointerForce = normalize(toPointer) * uPointerStrength / (pointerDist * pointerDist + 0.3);

    // 5. 減衰
    vel *= 0.98;

    // 合力
    vel += (gravity + orbital + turbulence + pointerForce) * uDeltaTime;
    pos += vel * uDeltaTime;

    // 寿命管理
    life -= uDeltaTime * 0.1;
    if (life <= 0.0) {
        // リスポーン: プリズム周辺のランダム位置
        float angle = fract(sin(uv.x * 12345.6789 + uTime) * 43758.5453) * 6.2832;
        float radius = 1.5 + fract(cos(uv.y * 67890.1234 + uTime) * 23456.789) * 2.0;
        float height = (fract(sin(uv.x * uv.y * 98765.0 + uTime) * 65432.1) - 0.5) * 4.0;
        pos = uPrismCenter + vec3(cos(angle) * radius, height, sin(angle) * radius);
        vel = vec3(0.0);
        life = 0.8 + fract(sin(uv.x * 54321.0) * 12345.6) * 0.4;
    }

    gl_FragColor = vec4(pos, life);
}
```

```glsl
// particleFragment.glsl — パーティクル描画

uniform vec3 uAccentColor;    // #4A7FD4
varying float vLife;
varying float vDistToCenter;

void main() {
    // 円形パーティクル（四角テクスチャを円に切り抜き）
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    // 中心ほど明るい
    float brightness = 1.0 - smoothstep(0.0, 0.5, dist);

    // 寿命で透明度変化（生まれたてと消える直前は透明）
    float alpha = smoothstep(0.0, 0.15, vLife) * smoothstep(0.0, 0.15, 1.0 - vLife);

    // プリズムに近いほど青く光る
    vec3 color = mix(
        vec3(0.93, 0.92, 0.91),     // 遠い: ほぼ白
        uAccentColor,                 // 近い: accent blue
        smoothstep(3.0, 0.5, vDistToCenter)
    );

    // グロー
    color += uAccentColor * brightness * 0.3;

    gl_FragColor = vec4(color, alpha * brightness * 0.7);
}
```

### 2.4 ポストプロセッシングパイプライン

> **pmndrs/postprocessing を使用。** Three.js native EffectComposer ではない。
> 理由: 複数エフェクトを自動で**単一コンパウンドシェーダー**にマージし、
> パスチェーンのパフォーマンスペナルティを排除。HDRパイプライン対応。

```typescript
// postProcessing.ts

import { EffectComposer, RenderPass, EffectPass,
         BloomEffect, VignetteEffect, ChromaticAberrationEffect,
         NoiseEffect, ToneMappingEffect, ToneMappingMode,
         SMAAEffect, SMAAPreset, BlendFunction } from 'postprocessing';
import * as THREE from 'three';

export function createPostProcessing(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    const composer = new EffectComposer(renderer, {
        frameBufferType: THREE.HalfFloatType, // HDRパイプライン
        multisampling: 0, // SMAA が AA を担当
    });

    // Pass 1: シーンレンダリング
    composer.addPass(new RenderPass(scene, camera));

    // Pass 2: 全エフェクトをマージした単一パス
    // pmndrs が自動的にこれらを1つのシェーダーに合成する
    const bloomEffect = new BloomEffect({
        luminanceThreshold: 0.9,   // 明るい部分のみ。建築サイトなので控えめ。
        luminanceSmoothing: 0.025,
        intensity: 0.6,
        radius: 0.85,
        mipmapBlur: true,          // 高品質ブラー
    });

    const vignetteEffect = new VignetteEffect({
        offset: 0.3,
        darkness: 0.7,
    });

    const chromaticAberrationEffect = new ChromaticAberrationEffect({
        offset: new THREE.Vector2(0.001, 0.001), // 微量。プリズムテーマの強化。
        radialModulation: true,
        modulationOffset: 0.15,
    });

    const noiseEffect = new NoiseEffect({
        blendFunction: BlendFunction.OVERLAY,
        premultiply: true,
    });
    noiseEffect.blendMode.opacity.value = 0.03; // ほぼ見えない。空気感のため。

    const toneMappingEffect = new ToneMappingEffect({
        mode: ToneMappingMode.ACES_FILMIC, // シネマティックなトーンカーブ
    });

    const smaaEffect = new SMAAEffect({ preset: SMAAPreset.HIGH });

    // pmndrs は EffectPass 内の全エフェクトを1つのシェーダーにマージ
    composer.addPass(new EffectPass(camera,
        bloomEffect, vignetteEffect, chromaticAberrationEffect,
        noiseEffect, toneMappingEffect, smaaEffect
    ));

    return { composer, bloomEffect };
}
```

**パイプラインまとめ:**
```
RenderPass → EffectPass (自動マージ: Bloom + Vignette + ChromAb + Noise + ToneMap + SMAA)
   描画         pmndrs が6エフェクトを1シェーダーパスに統合。描画コール最小。
```

### 2.5 環境マップ（FastHDR + CubeCameraハイブリッド）

> **FastHDR** (Needle社) を使用。従来のEXR/HDRIと比較して:
> - ロード速度 **10倍高速**
> - GPU メモリ **95%削減**（KTX2スーパー圧縮 + プリフィルタリング済みPMREM）
> - ランタイムPMREM生成が**不要**（最大のボトルネック排除）
> - Three.js 完全サポート
>
> **戦略**: FastHDR静的環境マップをベース + CubeCameraを低解像度・低頻度で補助的に使用。

```typescript
// 静的環境マップ（FastHDR — メインの環境光源）
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';

const ktx2Loader = new KTX2Loader()
    .setTranscoderPath('/basis/')
    .detectSupport(renderer);

// FastHDR: プリフィルタリング済みPMREMをKTX2で読み込み
// → PMREM生成をスキップ。即座にenvMapとして使用可能
const envTexture = await ktx2Loader.loadAsync('/assets/env/studio-soft.ktx2');
envTexture.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = envTexture;
prismMaterial.uniforms.uEnvMap.value = envTexture;

// 動的CubeCamera（補助 — パーティクルの反射を拾う）
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, { // 低解像度で十分
    format: THREE.RGBAFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
});
const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);

// 10フレームに1回だけ更新（静的HDRIがベースなので頻度を落とせる）
let envUpdateCounter = 0;
function updateEnvMap() {
    envUpdateCounter++;
    if (envUpdateCounter % 10 !== 0) return;
    prism.visible = false;
    cubeCamera.position.copy(prism.position);
    cubeCamera.update(renderer, scene);
    prism.visible = true;
    // 動的反射をシェーダーにブレンド（静的20% + 動的80%等で調整）
}
```

### 2.6 スクロール連動（Hero → 次セクション遷移）

```typescript
// Heroセクションをスクロールで離れると、カメラがズームアウトしながらフェードアウト

gsap.to(camera.position, {
    z: 14,           // 8 → 14 にズームアウト
    y: 4,            // 2 → 4 に上昇
    scrollTrigger: {
        trigger: '#hero',
        start: 'bottom bottom',
        end: 'bottom top',
        scrub: 1.5,   // スクロール位置に追従（1.5秒の遅延で滑らかに）
    },
});

gsap.to('.hero-canvas-slot', {
    opacity: 0,
    scrollTrigger: {
        trigger: '#social-proof',
        start: 'top 80%',
        end: 'top 20%',
        scrub: true,
    },
});
```

### 2.7 フォールバック戦略

```
Tier 1 (GPU強 + WebGL2 — デスクトップ):
  フルシェーダー + GPGPU 50K粒子 + ポストプロセッシング(EffectPass統合)
  目安: デスクトップWebGL2で100K-1M粒子が実用範囲。50Kは余裕。

Tier 2 (GPU中 + WebGL2 — モバイルハイエンド):
  シェーダー簡略版 + GPGPU 10K粒子 + ポストプロセッシング(Bloom+Vignette)
  目安: モバイルGPGPUは1-5万粒子が推奨範囲。10Kは安全域。

Tier 3 (GPU弱 or WebGL1 — モバイルローエンド):
  MeshPhysicalMaterial + CPU粒子 2000個 + ポストプロセッシングなし

Tier 4 (WebGL非対応 or reduced-motion):
  poster画像のみ。CSS filter: saturate(0.9) contrast(1.05) で色調整。

判定方法:
  const gl = canvas.getContext('webgl2');
  const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
  const gpuName = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
  // 既知の低性能GPUリストと照合 + ベンチマーク (初回10フレームのFPS計測)
```

---

## 3. スクロール演出システム — Lenis + GSAP

### 3.1 Lenis（スムーズスクロール）

```typescript
// smoothScroll.ts

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initSmoothScroll() {
    const lenis = new Lenis({
        duration: 1.2,           // スクロールの滑らかさ（1.0-1.5推奨）
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // exponential ease-out
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        autoRaf: false,          // v1.3.13: 自前のGSAP ticker管理のため無効化
        wheelMultiplier: 1,      // スクロール速度（デフォルト）
        touchMultiplier: 2,      // モバイルスワイプ感度
        overscroll: false,       // v1.3.13: iOS overscroll bounce 抑制
    });

    // GSAP ScrollTrigger と Lenis を同期
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // アンカーリンク対応
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) lenis.scrollTo(target, { offset: -72 }); // ヘッダー高さ分オフセット
        });
    });

    return lenis;
}
```

### 3.2 GSAP ScrollTrigger パターン

全セクションで使う共通Revealパターン:

```typescript
// scrollAnimations.ts

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initScrollAnimations() {

    // ============================================
    // 共通: Reveal（スクロールで要素が出現）
    // ============================================

    // [data-reveal] 属性を持つ全要素にアニメーションを適用
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, {
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',     // 要素が画面下15%に入ったら開始
                toggleActions: 'play none none none',  // 一度だけ再生
            },
        });
    });

    // [data-reveal-stagger] 属性: 子要素が順番に出現
    gsap.utils.toArray('[data-reveal-stagger]').forEach((container) => {
        const children = container.children;
        gsap.from(children, {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,        // 子要素が100msずつ遅れて出現
            ease: 'power3.out',
            scrollTrigger: {
                trigger: container,
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
        });
    });

    // ============================================
    // Hero: テキストの段階的出現
    // ============================================

    const heroTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
    });

    heroTl
        .from('.hero-title-en', { y: 30, opacity: 0, duration: 0.7 })
        .from('.hero-title-ja', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
        .from('.hero-sub', { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
        .from('.hero-cta', { y: 15, opacity: 0, duration: 0.5 }, '-=0.2')
        .from('.hero-scroll', { opacity: 0, duration: 0.4 }, '-=0.1');

    // サイトレディ後にトリガー
    document.addEventListener('site-ready', () => heroTl.play());

    // ============================================
    // Social Proof: 数字カウントアップ
    // ============================================

    ScrollTrigger.create({
        trigger: '#social-proof',
        start: 'top 70%',
        once: true,
        onEnter: () => {
            document.querySelectorAll('[data-count]').forEach((el) => {
                const target = parseInt(el.dataset.count, 10);
                const suffix = el.dataset.suffix || '';
                gsap.to({ val: 0 }, {
                    val: target,
                    duration: 1.2,
                    ease: 'power2.out',
                    onUpdate: function () {
                        el.textContent = Math.floor(this.targets()[0].val) + suffix;
                    },
                });
            });
        },
    });

    // ============================================
    // Works: カードの非対称Reveal
    // ============================================

    gsap.utils.toArray('.work-card').forEach((card, i) => {
        const isLeft = i % 2 === 0;
        gsap.from(card, {
            x: isLeft ? -60 : 60,    // 左右から交互に出現
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
        });
    });

    // Works: 画像パララックス
    gsap.utils.toArray('.work-card img').forEach((img) => {
        gsap.to(img, {
            y: -30,                    // スクロールにつれて画像が上に動く
            ease: 'none',
            scrollTrigger: {
                trigger: img.closest('.work-card'),
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,           // スクロール位置に連動
            },
        });
    });

    // ============================================
    // Method: 横スクロールカードの出現
    // ============================================

    gsap.from('.method-horizontal-track', {
        x: 100,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '#method',
            start: 'top 75%',
            toggleActions: 'play none none none',
        },
    });

    // ============================================
    // Products: Featured カードの拡大出現
    // ============================================

    gsap.from('.product-featured-card', {
        scale: 0.92,
        opacity: 0,
        duration: 1.0,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.product-featured-card',
            start: 'top 80%',
            toggleActions: 'play none none none',
        },
    });

    // Secondary カードのstagger
    gsap.from('.product-secondary-card', {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.product-secondary-grid',
            start: 'top 80%',
            toggleActions: 'play none none none',
        },
    });

    // ============================================
    // About: メンバーカードのstagger
    // ============================================

    gsap.from('.about-member-card', {
        y: 50,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.about-core-members',
            start: 'top 80%',
            toggleActions: 'play none none none',
        },
    });

    // Partner logos: 順番にフェードイン
    gsap.from('.about-partner-logos img', {
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        scrollTrigger: {
            trigger: '.about-partner-logos',
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
    });

    // ============================================
    // Contact: フォームフィールドのstagger
    // ============================================

    gsap.from('.contact-field', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.contact-form',
            start: 'top 80%',
            toggleActions: 'play none none none',
        },
    });

    // ============================================
    // 全セクション: 見出しの分割アニメーション
    // ============================================

    // 英語見出し(.en)は文字単位で出現 — GSAP SplitText（無料化済み）使用
    // SplitText: autoSplit, a11y対応, 50%軽量化（2025リライト版）
    gsap.utils.toArray('.works-heading .en, .products-heading .en, .about-heading .en, .contact-heading .en').forEach((heading) => {
        const split = SplitText.create(heading, {
            type: 'chars',
            autoSplit: true,     // リサイズ時に自動再分割
            mask: 'chars',       // overflow:hidden マスクで洗練された出現
        });

        gsap.from(split.chars, {
            y: 20,
            opacity: 0,
            duration: 0.4,
            stagger: 0.02,      // 文字が20msずつ出現 = タイプライター効果
            ease: 'power3.out',
            scrollTrigger: {
                trigger: heading,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
        });
    });
}
```

---

## 4. セクション別アニメーション振付表

### 全体タイムライン（スクロール進行度 0-100%）

```
0%    Hero         3D + テキストstagger
      │             ↓ スクロール開始
5%    │→ Hero zoom-out + canvas fade-out
      │
10%   Social Proof  数字カウントアップ + カード stagger fade-in
      │
15%   │→ bridge text reveal
      │
20%   Signature     intro text reveal
25-60% │→ Phase 1-6: 画像 scale(1.02→1) + opacity 0→1 + テキスト translateY
      │              交互レイアウト。プログレスドット連動。
      │
62%   │→ bridge text「言葉より、仕事で語る。」
      │
65%   Works         見出し文字バラバラ出現 + カード左右交互スライドイン + 画像パララックス
      │
72%   │→ bridge text reveal
      │
75%   Method        見出し reveal + カードトラック スライドイン
      │
80%   Products      見出し reveal + Featured scale出現 + Secondary stagger
      │
85%   │→ bridge text reveal
      │
87%   About         見出し reveal + メンバーカード stagger + パートナーロゴ順次 fade-in
      │
92%   Contact       見出し reveal + side card slide-in + フォームフィールド stagger
      │
100%  Footer        fade-in
```

### セクション境界の視覚遷移

```css
/* 各セクション間にグラデーション遷移を作る（CSSのみ） */

.social-proof-section {
    background: linear-gradient(
        180deg,
        var(--color-bg-base) 0%,
        var(--color-bg-elevated) 15%,
        var(--color-bg-elevated) 85%,
        var(--color-bg-base) 100%
    );
}

.works-section {
    background:
        radial-gradient(ellipse 80% 50% at 20% 0%, rgba(74, 127, 212, 0.04), transparent),
        var(--color-bg-base);
}

.method-scroll-section {
    background:
        radial-gradient(ellipse 60% 40% at 80% 100%, rgba(74, 127, 212, 0.03), transparent),
        var(--color-bg-elevated);
}

.products-focus-section {
    background: var(--color-bg-base);
}

.about-team-section {
    background:
        radial-gradient(ellipse 100% 60% at 50% 0%, rgba(74, 127, 212, 0.05), transparent),
        var(--color-bg-elevated);
}

.contact-premium-section {
    background: linear-gradient(
        180deg,
        var(--color-bg-base) 0%,
        var(--color-bg-elevated) 30%,
        var(--color-bg-elevated) 100%
    );
}
```

---

## 5. ビジュアルレイヤーシステム — 奥行きと空気感

### 5.1 ノイズテクスチャオーバーレイ

```css
/* 全体にうっすらとフィルムグレインを敷く */
main::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: 60;
    pointer-events: none;
    opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 256px 256px;
    mix-blend-mode: overlay;
}

/* reduced-motion: テクスチャは維持（静的なので問題なし） */
```

### 5.2 カードのグラスモーフィズム強化

```css
/* v2のカード: border + flat background → v3: ガラス質感 */

.soft-card,
.method-scroll-card,
.product-featured-card,
.about-member-card,
.contact-form-card {
    background: rgba(28, 28, 24, 0.6);          /* 半透明 */
    backdrop-filter: blur(12px) saturate(1.2);   /* ガラス効果 */
    border: 1px solid rgba(237, 236, 232, 0.08);
    box-shadow:
        0 0 0 1px rgba(237, 236, 232, 0.04),    /* 内側の微かな線 */
        0 8px 32px rgba(0, 0, 0, 0.24),          /* メイン影 */
        0 2px 8px rgba(0, 0, 0, 0.12);           /* 近接影 */
    transition:
        border-color 280ms var(--ease-out),
        box-shadow 280ms var(--ease-out),
        transform 280ms var(--ease-out);
}

.soft-card:hover,
.method-scroll-card:hover,
.product-featured-card:hover {
    border-color: rgba(74, 127, 212, 0.2);       /* accent blueの微かな境界 */
    box-shadow:
        0 0 0 1px rgba(74, 127, 212, 0.08),
        0 16px 48px rgba(0, 0, 0, 0.32),
        0 4px 12px rgba(74, 127, 212, 0.06);     /* blueのambient shadow */
    transform: translateY(-2px);
}
```

### 5.3 セクション見出しのアクセントライン

```css
/* 英語見出し(.en)の下にaccentカラーのアニメーションライン */
.works-heading .en,
.products-heading .en,
.about-heading .en,
.contact-heading .en {
    position: relative;
}

.works-heading .en::after,
.products-heading .en::after,
.about-heading .en::after,
.contact-heading .en::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--color-accent), transparent);
    transition: width 800ms var(--ease-out);
}

/* GSAPのScrollTriggerで.is-revealedクラスを付与 */
.is-revealed .en::after {
    width: 60%;
}
```

### 5.4 Ambient光彩（背景の呼吸する光）

```css
/* 各セクションの背景に、微かに脈動する光球 */
.signature-section-v2::before {
    content: '';
    position: absolute;
    top: 20%;
    left: -10%;
    width: 40vw;
    height: 40vw;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(74, 127, 212, 0.06), transparent 70%);
    filter: blur(80px);
    animation: ambient-pulse 8s ease-in-out infinite;
    pointer-events: none;
}

@keyframes ambient-pulse {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.1); }
}

/* reduced-motion: パルス停止、静的表示 */
@media (prefers-reduced-motion: reduce) {
    .signature-section-v2::before {
        animation: none;
        opacity: 0.5;
    }
}
```

---

## 6. CSS品質基準 — 二度と「しょぼい」と言わせない

### 6.1 チェックリスト（各セクション必須）

| # | 基準 | 確認方法 |
|---|------|----------|
| CSS-1 | 背景がフラットな単色ではない（グラデーション or radial gradient） | 目視 |
| CSS-2 | カードにbackdrop-filter + 多層shadow | CSSプロパティ確認 |
| CSS-3 | ホバー時にborder-color, shadow, transformの3つが変化 | hover検証 |
| CSS-4 | 見出しにtransition付きの視覚的アクセント（ライン or グロー） | 目視 |
| CSS-5 | スクロールトリガーの出現アニメーションがある | スクロール検証 |
| CSS-6 | テキスト階層が3段以上（primary/secondary/tertiary） | color値確認 |
| CSS-7 | 隣接セクションと視覚的に区別できる（背景 or 余白 or 境界） | 通しスクロール |
| CSS-8 | モバイルで独自レイアウト（デスクトップの縮小ではない） | 実機確認 |
| CSS-9 | `prefers-reduced-motion` で全アニメーションが無効化可能 | メディアクエリ検証 |
| CSS-10 | CTAボタンにmin-height: 48px + ホバー・アクティブ・フォーカス状態 | a11y検証 |

### 6.2 CTAボタンの完全な状態定義

```css
.hero-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    padding: 14px 32px;
    border: 1px solid var(--color-text-primary);
    color: var(--color-text-primary);
    font-size: var(--text-body);
    letter-spacing: 0.04em;
    background: transparent;
    position: relative;
    overflow: hidden;
    transition:
        color 220ms var(--ease-out),
        border-color 220ms var(--ease-out),
        transform 220ms var(--ease-out);
}

/* ホバー: 背景がaccentで塗りつぶされる（左→右スライド） */
.hero-cta::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--color-accent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 320ms var(--ease-out);
    z-index: -1;
}

.hero-cta:hover::before {
    transform: scaleX(1);
}

.hero-cta:hover {
    color: #fff;
    border-color: var(--color-accent);
    transform: translateY(-1px);
}

/* アクティブ（押下） */
.hero-cta:active {
    transform: translateY(0) scale(0.98);
    transition-duration: 80ms;
}

/* フォーカス（キーボード） */
.hero-cta:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
}
```

### 6.3 hero-scroll のアニメーション（v2で欠落していた）

```css
.hero-scroll {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-tertiary);
    animation: scroll-bob 2s ease-in-out infinite;
}

@keyframes scroll-bob {
    0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.4; }
    50% { transform: translateX(-50%) translateY(8px); opacity: 0.7; }
}

@media (prefers-reduced-motion: reduce) {
    .hero-scroll { animation: none; opacity: 0.4; }
}
```

---

## 7. 既存コード清掃指示

### 7.1 global.css 刷新

```
削除対象（global.css内）:
  Line 100-800+: @layer components 内の全旧コンポーネントCSS
    - .hero-chip, .hero-manifest, .hero-premium-layout, .hero-word-stack,
      .hero-kicker, .hero-main-title, .hero-title-line-main, .hero-title-line-sub,
      .hero-main-subtitle, .hero-main-actions, .hero-cinematic-frame,
      .hero-title-lockup, .hero-trustline, .hero-strata-board,
      .hero-strata-eyebrow, .hero-proof-grid, .hero-proof-item,
      .hero-registration-note, .hero-operations-ribbon,
      .hero-operations-track, .hero-shell, .hero-grid-overlay,
      .hero-layout, .hero-main-copy, .hero-console-shell, .hero-console,
      .hero-console-eyebrow, .hero-console-title, .hero-console-summary,
      .hero-console-flow, .hero-console-stats
    - 全signature旧CSS (.signature-section, .signature-shell, .signature-track, etc.)

  Line 41-43: ゴールド色変数を削除
    --color-accent-300: #d6c6a1;  ← 削除
    --color-accent-500: #b79a6a;  ← 削除
    --color-accent-600: #8f7447;  ← 削除

残す:
  Line 1: @import "tailwindcss";
  Line 3-55: @theme（ゴールド変数削除後）
  Line 57-98: @layer base（HTMLリセット）
  @layer components: .site-container, .section-space のみ残す（worldclass.cssと整合）
```

### 7.2 worldclass.css 刷新

```
削除対象:
  Line 406-611: 旧Hero CSS（.hero-shell, .hero-stage, .hero-scene, .hero-overlay,
    .hero-content-wrap, .hero-cinematic-frame, .hero-title-lockup,
    .hero-title-line-main, .hero-title-line-sub, .hero-main-subtitle,
    .hero-primary-cta, .hero-registration-note, .hero-scroll-indicator）

  Line 613-808: 旧Signature CSS（.signature-phase-experience,
    .signature-intro, .signature-phases-shell, .signature-phases,
    .signature-phase, .phase-image, .phase-content, .phase-number,
    .capabilities, .proof, .signature-progress, .progress-dot）

残す:
  Line 1-69: :root CSS変数
  Line 71-405: 基盤CSS + ヘッダー + メニュー
  Line 809-1820: Works, About, Products, Method, Contact, Footer（現行CSS）
  Line 1821-2522: v2 overrides（全残す）

追加:
  - セクション別グラデーション背景
  - ノイズテクスチャオーバーレイ
  - カードのbackdrop-filter強化
  - 見出しアクセントライン
  - ambient光彩
  - hero-scroll アニメーション
  - CTA完全状態定義
```

### 7.3 削除対象コンポーネントファイル

```
確認→削除:
  src/components/ImmersiveEngine.astro  ← index.astroで未使用。削除。
  src/components/Services.astro         ← 未使用なら削除。

確認→維持:
  src/lib/immersiveNodes.mjs            ← SignatureのデータソースかもしれないのでGrepで確認。
```

---

## 8. パフォーマンス予算

### 8.1 バンドルサイズ

| モジュール | 上限 | 現状推定 | 戦略 |
|-----------|------|---------|------|
| Three.js (tree-shaken) | 180KB gzip | ~150KB | 使用クラスのみimport |
| GSAP + ScrollTrigger + SplitText | 40KB gzip | ~36KB | 全プラグイン無料。SplitText追加(50%軽量化版) |
| Lenis | 8KB gzip | ~7KB | — |
| カスタムシェーダー (GLSL) | 5KB gzip | ~3KB | テキストとして最小 |
| アプリケーションコード | 15KB gzip | ~10KB | — |
| **合計JS** | **<250KB gzip** | — | — |
| CSS (worldclass.css + global.css) | 15KB gzip | ~12KB | 旧CSS削除で削減 |
| フォント (Google Fonts) | 外部CDN | — | font-display: swap |
| Hero poster (WebP) | 120KB | — | 1920w, quality 80 |

### 8.2 レンダリング予算（60fps = 16.67ms/frame）

| 処理 | 上限 | 戦略 |
|------|------|------|
| Three.js render | 8ms | DPR上限2。描画コール<50。 |
| Post-processing | 2ms | pmndrs EffectPass 単一パス統合。Bloom: half-res。 |
| GPGPU compute | 2ms | 224×224テクスチャ(≈50K粒子)。Bitangent Noise推奨(Curl Noiseの2/3コスト)。 |
| GSAP tick | 1ms | 同時アニメーション<10 |
| Lenis RAF | 0.5ms | — |
| **合計** | **<15ms** | **余裕: 1.67ms** |

### 8.3 デバイスTier判定

```typescript
function detectTier(): 1 | 2 | 3 | 4 {
    // Tier 4: reduced-motion or no WebGL
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 4;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return 4;

    // GPU名取得
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    const gpu = debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : '';

    // Tier 3: 既知の低性能GPU
    const lowEndGPUs = ['Mali-4', 'Mali-T', 'Adreno 3', 'Adreno 4', 'PowerVR'];
    if (lowEndGPUs.some(name => gpu.includes(name))) return 3;

    // Tier判定: 画面サイズ + モバイル判定
    const isMobile = window.innerWidth < 768;
    const isHighDPI = window.devicePixelRatio > 1.5;

    if (isMobile) return 2;
    if (!isHighDPI && gpu.includes('Intel')) return 2;

    return 1; // フル品質
}
```

---

## 9. 実装ロードマップ v3

### Phase A: 基盤清掃 + スクロールシステム（1日）

| # | タスク | 完了基準 |
|---|--------|----------|
| A-01 | global.css清掃: 旧CSS全削除、ゴールド変数削除 | @theme + @layer base のみ残存 |
| A-02 | worldclass.css清掃: 旧Hero/Signature CSS削除 | v2 override以降のみ残存 |
| A-03 | npm install lenis gsap | package.json更新 |
| A-04 | smoothScroll.ts 実装 + main.astroに接続 | Lenisでスムーズスクロール動作確認 |
| A-05 | scrollAnimations.ts 骨格実装 | [data-reveal] で基本fade-in動作 |
| A-06 | 全コンポーネントに data-reveal 属性追加 | 全セクションがスクロールで出現 |

### Phase B: 視覚品質向上（1日）

| # | タスク | 完了基準 |
|---|--------|----------|
| B-01 | セクション別グラデーション背景 | 隣接セクションが視覚的に区別可能 |
| B-02 | ノイズテクスチャオーバーレイ | main::before で全体にフィルムグレイン |
| B-03 | カードのbackdrop-filter + 多層shadow | 全カードがガラス質感 |
| B-04 | CTA完全状態定義（hover/active/focus） | 左→右スライド塗りつぶし動作 |
| B-05 | 見出しアクセントライン | .is-revealed でライン出現 |
| B-06 | hero-scroll bob アニメーション | 上下に微動 |
| B-07 | ambient光彩（Signature背景） | 脈動する光球 |
| B-08 | セクション出現アニメーション全調整 | Works左右交互、Products scale、About stagger |

### Phase C: Hero 3D 刷新（2-3日）

| # | タスク | 完了基準 |
|---|--------|----------|
| C-01 | heroScene.ts 新規作成（シーン骨格） | 旧is:inlineスクリプトをモジュールに分離 |
| C-02 | カスタムShaderMaterial（スペクトル分散） | プリズムが虹色に光を屈折 |
| C-03 | 環境マップ（FastHDR + CubeCameraハイブリッド） | FastHDR(KTX2)静的環境マップ + 低頻度CubeCamera補助 |
| C-04 | GPGPUパーティクルシステム | 50K粒子がプリズム周りを公転 |
| C-05 | ポストプロセッシング(pmndrs EffectPass統合) | Bloom + ChromAb + Grain + Vignette + ToneMap + SMAA → 単一パス |
| C-06 | スクロール連動カメラ（GSAP ScrollTrigger） | Hero離脱時にズームアウト |
| C-07 | Tier別フォールバック | 4段階。Tier4=poster only |
| C-08 | ポインター追従（斥力パーティクル） | マウスがパーティクルを弾く |

### Phase D: 統合テスト + 最適化（1日）

| # | タスク | 完了基準 |
|---|--------|----------|
| D-01 | 全セクション通しスクロール検証 | アニメーション衝突なし |
| D-02 | モバイル実機テスト | iPhone SE / 15 Pro / Android |
| D-03 | Lighthouse: Performance > 85 | Three.js込みで85以上 |
| D-04 | reduced-motion テスト | 全アニメーション無効化確認 |
| D-05 | WebGL非対応テスト | Tier4フォールバック確認 |
| D-06 | CSS品質チェックリスト全項目通過 | CSS-1〜CSS-10 |

---

## 10. Codex実装タスク（全指示）

> 以下はCodexへの直接指示。各タスクは番号順に実行。

### Task A-01: global.css 清掃

```
対象: src/styles/global.css

手順:
1. @theme ブロックから以下の3行を削除:
   --color-accent-300: #d6c6a1;
   --color-accent-500: #b79a6a;
   --color-accent-600: #8f7447;

2. @layer components ブロック内を以下のみに縮小:
   .site-container { @apply mx-auto w-full max-w-[1280px]; padding-inline: clamp(20px, 5vw, 120px); }
   .section-space { padding-block: var(--space-section-md, 160px); }

   その他全て（.section-eyebrow, .section-title, .section-summary, .soft-card, .photo-frame,
   .hero-*, .signature-*, 全旧コンポーネントCSS）を削除。

3. @layer base は現状維持。

完了条件: global.css が100行以内。@import + @theme + @layer base + @layer components(2クラスのみ)。
```

### Task A-03: Lenis + GSAP インストール

```
コマンド:
  cd D:\senaa_dev\Archi-Prisma HP\archi-prisma-site
  npm install lenis gsap

確認:
  package.json に "lenis" と "gsap" が追加されていること。
  node_modules/lenis, node_modules/gsap が存在すること。

注意:
  GSAP v3.13+ は全プラグイン無料。以下のimportパスを使用:
    import { gsap } from 'gsap';
    import { ScrollTrigger } from 'gsap/ScrollTrigger';
    import { SplitText } from 'gsap/SplitText';
  Lenis v1.3.13 は ESM default export。autoRaf オプション追加済み。
```

### Task A-04: smoothScroll.ts 実装

```
新規ファイル: src/lib/smoothScroll.ts

内容: 本計画書 §3.1 のコードをそのまま使用。

接続: src/layouts/main.astro の <script> 内で:
  import { initSmoothScroll } from '../lib/smoothScroll';

  // ローダー消失後に初期化
  const lenis = initSmoothScroll();

注意:
  - Astro の is:inline スクリプトではなく、モジュール <script> を使用。
  - Lenis は body の overflow を制御するため、既存の overflow: hidden（メニュー開閉時）と競合しないよう注意。
    → メニュー開時: lenis.stop()、閉時: lenis.start()
```

### Task A-05: scrollAnimations.ts 実装

```
新規ファイル: src/lib/scrollAnimations.ts

内容: 本計画書 §3.2 のコードをそのまま使用。

接続: src/layouts/main.astro の <script> 内で:
  import { initScrollAnimations } from '../lib/scrollAnimations';

  // DOM Ready後に初期化
  initScrollAnimations();
```

### Task A-06: 全コンポーネントに data-reveal 追加

```
対象: 全 .astro コンポーネント

追加位置: 各セクションの主要要素に data-reveal 属性を追加。

例（SocialProof.astro）:
  <h2 class="social-proof-title" data-reveal>23年の実績。{domains}つの専門領域。</h2>
  <div class="social-proof-grid" data-reveal-stagger>
    ...
  </div>

例（Works.astro）:
  <h2 class="works-heading" data-reveal>
    ...
  </h2>
  <!-- work-card はGSAPで個別制御するためdata-revealは不要 -->

各セクションで data-reveal を付ける要素:
  - セクション見出し（h2）
  - サブテキスト
  - bridge テキスト
  - カードコンテナ（data-reveal-stagger）

data-reveal を付けない要素:
  - Hero（独自タイムラインで制御）
  - Signature phases（IntersectionObserverで制御）
  - Work cards（GSAPで左右交互制御）
  - 画像（パララックスで個別制御）
```

### Task B-01〜B-08: 視覚品質向上

```
対象: src/styles/worldclass.css

内容: 本計画書 §4（セクション別グラデーション）、§5（ビジュアルレイヤー）、§6（CSS品質基準）の
全CSSを worldclass.css の末尾（v2 overrides セクション後）に追加。

具体的に追加するCSS:
  1. §4 のセクション境界グラデーション背景（.social-proof-section, .works-section 等）
  2. §5.1 のノイズテクスチャ（main::before）
  3. §5.2 のカードbackdrop-filter強化
  4. §5.3 の見出しアクセントライン
  5. §5.4 のambient光彩
  6. §6.2 のCTA完全状態定義
  7. §6.3 のhero-scroll bobアニメーション

既存のv2 override CSSで上書きが必要なもの:
  - .works-section 等の background: var(--color-bg-base) → グラデーションに置換
  - カード系の background/shadow → backdrop-filter版に置換

完了条件: CSS品質チェックリスト CSS-1〜CSS-10 の全項目通過。
```

### Task C-01〜C-08: Hero 3D 刷新

```
この一連のタスクは本計画書 §2 の仕様に従う。

作業手順:
1. Hero.astro の <script is:inline> を完全に削除
2. src/lib/heroScene.ts を新規作成（§2.3〜§2.6 の全コード統合）
3. src/lib/shaders/ 配下に4つの .glsl ファイル作成
4. src/lib/postProcessing.ts を新規作成（§2.4 のコード）
5. Hero.astro に <script> タグ（is:inline なし）で heroScene.ts を import
6. Tier判定（§2.7）を heroScene.ts 内に実装
7. スクロール連動（§2.6）を scrollAnimations.ts に追加

完了条件:
  - Tier 1: カスタムシェーダーでプリズムが虹色に屈折 + 50K GPGPU粒子 + pmndrs EffectPass統合
  - Tier 2: 簡略シェーダー + 10K GPGPU粒子 + Bloom+Vignette（モバイル推奨域内）
  - Tier 3: MeshPhysicalMaterial + 2K CPU粒子
  - Tier 4: poster画像のみ
  - Hero→次セクションでカメラズームアウト + canvas fade-out
```

---

## 付録: v2計画との関係

v2計画（CODEX_MASTER_PLAN_v2.md）は**そのまま有効**。以下のチャプターはv2を参照：

- 訪問者ジャーニー（§2）→ v2 Chapter 2
- ダークモード戦略（§3）→ v2 Chapter 3
- ローディング体験（§4）→ v2 Chapter 4
- セクション再設計（§5）→ v2 Chapter 5
- マイクロコピー（§6）→ v2 Chapter 6
- インタラクション状態マシン（§7）→ v2 Chapter 7
- モバイル専用設計（§8）→ v2 Chapter 8
- カスタムカーソル（§9）→ v2 Chapter 9
- コンバージョンファネル（§10）→ v2 Chapter 10
- ビジュアルシステム（§11）→ v2 Chapter 11
- コンテンツ要件（§12）→ v2 Chapter 12
- 批判役レビュー（§13）→ v2 Chapter 13
- 計測・検証（§16）→ v2 Chapter 16

**v3が上書きするもの:**
- v2 Chapter 14（実装ロードマップ）→ v3 §9
- v2 Chapter 17（Codex実装タスク）→ v3 §10
- v2のHero 3D仕様 → v3 §2 で完全置換

---

> この計画書に従って実装されたサイトは、
> Three.jsの入門デモではなく、カスタムGLSLシェーダーが光を分散させ、
> 50,000のGPGPUパーティクルが知性のように公転し、
> Lenisのシルクのようなスクロールがセクションを繋ぎ、
> 全要素がスクロールの呼吸で生まれる。
>
> 「AI × 建築 × デザイン」を名乗る会社のサイトとして、
> このサイト自体が技術力の証拠になる。

---

## 付録B: v3技術判断ログ（2026-02リサーチに基づく）

以下はv3更新時に実施した技術リサーチの結果と採否判断。

### 採用した技術

| 技術 | 根拠 | 備考 |
|------|------|------|
| **pmndrs/postprocessing** | Three.js native EffectComposer の上位互換。複数エフェクトを自動で単一シェーダーパスにマージ。HDRパイプライン対応。 | EffectPass 1つで6エフェクト統合 |
| **FastHDR (Needle)** | KTX2スーパー圧縮、プリフィルタリング済みPMREM。ロード10x高速、VRAM 95%削減。ランタイムPMREM生成不要。 | CubeCameraと併用（ハイブリッド） |
| **GSAP全面採用** | 2025年5月Webflow買収後に全プラグイン完全無料化。SplitText・ScrollSmoother含む。 | Motion One代替パス不要に |
| **SplitText** | GSAP無料化で使用可能に。2025年リライト版はautoSplit（リサイズ再分割）、a11y対応、50%軽量化。手動span分割を完全置換。 | `type: 'chars', mask: 'chars'` |
| **Lenis v1.3.13** | autoRaf、data-lenis-prevent、overscroll-behavior: contain。安定版。 | autoRaf: false でGSAP ticker管理 |
| **Bitangent Noise** | Curl Noiseの2/3コスト（gradient 2回 vs 3回）。パーティクル乱流に十分。 | GPU予算削減に貢献 |
| **backdrop-filter blur(12px)** | ブラウザ対応 92-95%。blur ≤20px ならモバイル性能OK。12pxは安全域。 | Safariも対応済み |

### 見送った技術

| 技術 | 理由 |
|------|------|
| **TSL (Three.js Shading Language)** | WebGPU/WebGL両対応だが、8秒コンパイル問題、API不安定、デバッグ困難。カスタムGLSLを維持。 |
| **WebGPURenderer** | Three.js r171+ で auto-fallback対応だが、全ブラウザ標準化は2026年中。Safari/Firefoxが遅い。GPUComputationRenderer(WebGL2)で十分。 |
| **WebGPU Compute Shaders** | 150x高速だがブラウザ対応が未成熟。GPUComputationRenderer(WebGL2)で50K粒子は余裕で動く。 |
| **CSS scroll-driven animations** | ~80%対応（Safari 26+, Chrome 115+）だが**Firefox未対応**。GSAPフォールバック必須で二重実装になる。GSAP一本で統一。 |
| **View Transitions API** | 実験的。Chromeのみ安定。SPA/MPA遷移には有用だが、Astro SSGの単一ページでは不要。 |

### パフォーマンスベンチマーク参考値（リサーチ結果）

| 環境 | GPGPU粒子数 | FPS | 出典 |
|------|------------|-----|------|
| デスクトップ WebGL2 | 100K-1M | 60fps | Expo 2025 Osaka プロダクション実績 |
| モバイル ハイエンド | 1-5万 | 60fps | コミュニティ推奨範囲 |
| モバイル ローエンド | 5K-1万 | 30-60fps | テスト推奨 |
| WebGPU Compute | 数百万 | 60fps | ベンチマーク（WebGL比150x） |
