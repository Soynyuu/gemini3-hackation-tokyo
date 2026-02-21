import type { DirectorPlan, Vector3, Voxel, VoxelType } from '../store/types';

// Simple PRNG to make mock determinism if needed, or just use Math.random
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const MOCK_PROMPTS = [
    "孤立した塔の上に漂う、かすかな朝の光",
    "地下深くにある、混沌としたネオンの市場",
    "一つの焦点を持つ、穏やかで浮遊する禅の庭",
    "平原から突き出す、攻撃的でギザギザした赤い尖塔",
    "高い柱の間にひっそりと佇む、居心地の良い暖かい小屋"
];

const COLORS = [
    '#FF3B30', // Red
    '#0A84FF', // Blue
    '#30D158', // Green
    '#FF9F0A', // Orange
    '#BF5AF2', // Purple
    '#FFD60A', // Yellow
    '#E0F0FF', // White/Cyan
];

export const generateMockDirectorPlan = (): DirectorPlan => {
    const voxelCount = randomInt(15, 45); // Random number of voxels for the plan
    const voxels: Voxel[] = [];
    const grid_size: Vector3 = [5, 5, 5];

    // Pick a random prompt
    const vibe_prompt = MOCK_PROMPTS[randomInt(0, MOCK_PROMPTS.length - 1)];

    // Generate some random voxels loosely based on... nothing for the mock, just random
    const usedPositions = new Set<string>();

    for (let i = 0; i < voxelCount; i++) {
        let pos: Vector3;
        let posStr: string;

        // Simple grounding vs floating logic
        const isGrounded = Math.random() > 0.3;

        do {
            pos = [
                randomInt(0, 4),
                isGrounded ? randomInt(0, 1) : randomInt(0, 4),
                randomInt(0, 4)
            ];
            posStr = pos.join(',');
        } while (usedPositions.has(posStr));

        usedPositions.add(posStr);

        const type: VoxelType = Math.random() > 0.8 ? 'emissive' : 'standard';
        const color = COLORS[randomInt(0, COLORS.length - 1)];

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
            verticality: randomInt(0, 4)
        },
        vibe_prompt
    };
};
