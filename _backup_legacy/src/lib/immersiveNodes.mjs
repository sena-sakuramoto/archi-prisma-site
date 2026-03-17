export const immersiveNodes = [
  {
    id: 'urban',
    label: '都市開発',
    subtitle: 'Urban Development',
    description: '都市計画と事業条件を整理し、プロジェクトの初速を設計する。',
    position: [-1.1, 0.42, -0.35],
    capabilities: ['都市開発', '用途計画', '開発コンペ'],
  },
  {
    id: 'architecture',
    label: '新築設計',
    subtitle: 'Architecture',
    description: '新築設計から監理までを同一フローで運用し、品質を担保する。',
    position: [-0.36, 0.86, 0.28],
    capabilities: ['新築設計', '設計監理', 'BIM運用'],
  },
  {
    id: 'brand',
    label: 'ブランド設計',
    subtitle: 'Brand Design',
    description: '空間と視覚を統合し、顧客接点を一貫した体験へ変換する。',
    position: [0.54, 0.72, -0.48],
    capabilities: ['ロゴデザイン', 'グラフィック設計', 'サイン計画'],
  },
  {
    id: 'space',
    label: '空間デザイン',
    subtitle: 'Spatial Design',
    description: '家具・照明・店舗導線まで扱い、空間体験の粒度を上げる。',
    position: [1.05, 0.02, 0.36],
    capabilities: ['家具デザイン', '照明計画', '店舗設計'],
  },
  {
    id: 'ai',
    label: 'AI開発',
    subtitle: 'AI Development',
    description: '実務で使うプロダクトを自社開発し、設計プロセスへ直接連携する。',
    position: [0.2, -0.72, -0.16],
    capabilities: ['AI開発', 'ワークフロー実装', '運用改善'],
  },
  {
    id: 'operate',
    label: '運用拡張',
    subtitle: 'Operation',
    description: 'SNS発信とホテル運営までカバーし、公開後の価値を継続拡張する。',
    position: [-0.8, -0.56, 0.48],
    capabilities: ['SNS発信', 'ホテル運営', 'コミュニティ運営'],
  },
];

export const flatCapabilities = Array.from(
  new Set(immersiveNodes.flatMap((node) => node.capabilities)),
);
