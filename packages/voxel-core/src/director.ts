import type { DirectorPlan, Vector3, Voxel, VoxelType } from './types.js';
import { DEFAULT_GRID_SIZE } from './types.js';

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const MOCK_PROMPTS = [
  '孤立した塔の上に漂う、かすかな朝の光',
  '地下深くにある、混沌としたネオンの市場',
  '一つの焦点を持つ、穏やかで浮遊する禅の庭',
  '平原から突き出す、攻撃的でギザギザした赤い尖塔',
  '高い柱の間にひっそりと佇む、居心地の良い暖かい小屋',
];

export const DEFAULT_PALETTE = [
  '#FF3B30',
  '#0A84FF',
  '#30D158',
  '#FF9F0A',
  '#BF5AF2',
  '#FFD60A',
  '#E0F0FF',
] as const;

export interface GenerateOptions {
  gridSize?: Vector3;
  minVoxels?: number;
  maxVoxels?: number;
  palette?: readonly string[];
  prompts?: readonly string[];
}

export function generateMockDirectorPlan(
  options: GenerateOptions = {},
): DirectorPlan {
  const {
    gridSize = DEFAULT_GRID_SIZE,
    minVoxels = 15,
    maxVoxels = 45,
    palette = DEFAULT_PALETTE,
    prompts = MOCK_PROMPTS,
  } = options;

  const voxelCount = randomInt(minVoxels, maxVoxels);
  const voxels: Voxel[] = [];
  const grid_size: Vector3 = [...gridSize];

  const vibe_prompt = prompts[randomInt(0, prompts.length - 1)];

  const usedPositions = new Set<string>();

  for (let i = 0; i < voxelCount; i++) {
    let pos: Vector3;
    let posStr: string;

    const isGrounded = Math.random() > 0.3;

    do {
      pos = [
        randomInt(0, gridSize[0] - 1),
        isGrounded ? randomInt(0, 1) : randomInt(0, gridSize[1] - 1),
        randomInt(0, gridSize[2] - 1),
      ];
      posStr = pos.join(',');
    } while (usedPositions.has(posStr));

    usedPositions.add(posStr);

    const type: VoxelType = Math.random() > 0.8 ? 'emissive' : 'standard';
    const color = palette[randomInt(0, palette.length - 1)];

    voxels.push({ pos, color, type });
  }

  return {
    grid_size,
    voxels,
    vibe_vector: {
      warmth: randomInt(0, 4),
      density: randomInt(0, 4),
      focus: randomInt(0, 4),
      randomness: randomInt(0, 4),
      saturation: randomInt(0, 4),
      verticality: randomInt(0, 4),
    },
    vibe_prompt,
  };
}
