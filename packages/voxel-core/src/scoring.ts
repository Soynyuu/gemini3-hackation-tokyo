import type { Voxel, DirectorPlan, ScoreResult } from './types.js';
import { positionKey } from './grid.js';

export function calculateStructureScore(
  playerVoxels: readonly Voxel[],
  targetVoxels: readonly Voxel[],
): number {
  const playerSet = new Set(playerVoxels.map(v => positionKey(v.pos)));
  const targetSet = new Set(targetVoxels.map(v => positionKey(v.pos)));

  let intersection = 0;
  for (const key of playerSet) {
    if (targetSet.has(key)) intersection++;
  }

  const union = new Set([...playerSet, ...targetSet]).size;
  return union === 0 ? 0 : Math.round((intersection / union) * 100);
}

export function calculateScores(
  playerVoxels: readonly Voxel[],
  plan: DirectorPlan,
): ScoreResult {
  const structureScore = calculateStructureScore(playerVoxels, plan.voxels);

  const vibeScore = Math.min(
    100,
    Math.round(structureScore * 0.5 + Math.random() * 50),
  );

  const rationale =
    structureScore > 50
      ? '「孤立した塔」のバイブスをうまく捉えています。エミッシブ（発光）のアクセントが意図を強調していますが、配置のノイズが少し方向性をぼやけさせています。'
      : '核心となる構造的な意図が見失われており、バイブスが集中したものではなく、曖昧になってしまっています。';

  return {
    structureScore,
    vibeScore,
    totalScore: Math.round(structureScore * 0.6 + vibeScore * 0.4),
    rationale,
  };
}
