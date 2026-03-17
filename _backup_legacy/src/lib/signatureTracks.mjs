export const signatureOrder = ['strategy', 'urban', 'architecture', 'brand', 'ai', 'operate'];

export const signatureTracks = [
  {
    id: 'strategy',
    phaseJa: '企画',
    phaseEn: 'Strategy',
    title: '企画 / Strategy',
    summary: '事業の根幹を描く。都市のビジョンから、個人の住まいまで。',
    capabilities: ['事業計画', '都市開発企画', 'ブランド企画'],
    image: '/assets/signature/phase-01.webp',
  },
  {
    id: 'urban',
    phaseJa: '都市',
    phaseEn: 'Urban Development',
    title: '都市 / Urban Development',
    summary: '土地の可能性を最大化する。用途計画から開発コンペまで。',
    capabilities: ['都市開発', '用途計画', '開発コンペ対応'],
    image: '/assets/signature/phase-02.webp',
  },
  {
    id: 'architecture',
    phaseJa: '建築',
    phaseEn: 'Architecture',
    title: '建築 / Architecture',
    summary: '空間に思想を宿す。新築設計から設計監理まで。',
    capabilities: ['新築設計', 'インテリア設計', '設計監理'],
    image: '/assets/signature/phase-03.webp',
  },
  {
    id: 'brand',
    phaseJa: '体験',
    phaseEn: 'Brand & Space',
    title: '体験 / Brand & Space',
    summary: 'ブランドを空間に翻訳する。ロゴから家具、店舗まで。',
    capabilities: ['ロゴデザイン', '家具デザイン', '店舗設計'],
    image: '/assets/signature/phase-04.webp',
  },
  {
    id: 'ai',
    phaseJa: '技術',
    phaseEn: 'AI Development',
    title: '技術 / AI Development',
    summary: 'AIを設計の武器にする。自社開発ツールで精度と速度を両立。',
    capabilities: ['AI開発', 'BIM連携', 'プロダクト運用'],
    image: '/assets/signature/phase-05.webp',
  },
  {
    id: 'operate',
    phaseJa: '運用',
    phaseEn: 'Operation',
    title: '運用 / Operation',
    summary: 'つくって終わりにしない。発信し、運営し、育てる。',
    capabilities: ['SNS発信', 'ホテル運営', 'コミュニティ運営'],
    image: '/assets/signature/phase-06.webp',
  },
];

export const allCapabilities = Array.from(
  new Set(signatureTracks.flatMap((track) => track.capabilities)),
);
