import type { Voxel, DirectorPlan } from '../store/types';

export const calculateScores = (playerVoxels: Voxel[], plan: DirectorPlan) => {
    const planSet = new Set(plan.voxels.map(v => v.pos.join(',')));
    const playerSet = new Set(playerVoxels.map(v => v.pos.join(',')));

    let intersectionCount = 0;

    // Basic structural match
    playerVoxels.forEach(pv => {
        const key = pv.pos.join(',');
        if (planSet.has(key)) {
            // It's a structural hit.
            // We could also check color match, but for simplicity let's just do pos + basic penalty.
            intersectionCount++;
        }
    });

    const unionCount = new Set([...Array.from(planSet), ...Array.from(playerSet)]).size;
    const structureScore = unionCount === 0 ? 0 : Math.round((intersectionCount / unionCount) * 100);

    // Mock Vibe Score (this would normally come from Gemini Pro Vision)
    // For the MVP mock, we just generate a random good score if structure is somewhat okay
    const vibeScore = Math.min(100, Math.round(structureScore * 0.5 + Math.random() * 50));

    // A mock qualitative rationale
    const rationale = structureScore > 50
        ? "「孤立した塔」のバイブスをうまく捉えています。エミッシブ（発光）のアクセントが意図を強調していますが、配置のノイズが少し方向性をぼやけさせています。"
        : "核心となる構造的な意図が見失われており、バイブスが集中したものではなく、曖昧になってしまっています。";

    return {
        structureScore,
        vibeScore,
        totalScore: Math.round(structureScore * 0.6 + vibeScore * 0.4),
        rationale
    };
};
