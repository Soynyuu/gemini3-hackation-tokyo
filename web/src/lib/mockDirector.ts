import { generateMockDirectorPlan as _generateMockDirectorPlan } from 'microvoxel-5';

const JAPANESE_PROMPTS = [
    '孤塔の上にたゆたう淡い朝焼け',
    '地下深くに広がる混沌のネオン市場',
    '一点の焦点を持つ穏やかな浮遊庭園',
    '平原から噴出する鋭い赤の尖塔群',
    '高い柱の間にひっそりと佇む温かな隠れ家',
    '水底から聞こえる光の残響',
    '静寂の中に芽生える不安',
    '夕焼けに染まる歪んだ灯台',
    '森の奥にひっそり佇む小さな家',
    '崩壊する秩序と再生の予感',
];

export function generateMockDirectorPlan() {
    return _generateMockDirectorPlan({ prompts: JAPANESE_PROMPTS });
}
