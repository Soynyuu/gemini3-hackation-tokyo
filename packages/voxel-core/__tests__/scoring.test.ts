import { describe, it, expect } from 'vitest';
import { calculateStructureScore, calculateScores } from '../src/scoring.js';
import type { Voxel, DirectorPlan } from '../src/types.js';

const mkVoxel = (x: number, y: number, z: number): Voxel => ({
  pos: [x, y, z],
  color: '#FF0000',
  type: 'standard',
});

describe('calculateStructureScore', () => {
  it('returns 100 for identical sets', () => {
    const voxels = [mkVoxel(0, 0, 0), mkVoxel(1, 1, 1)];
    expect(calculateStructureScore(voxels, voxels)).toBe(100);
  });

  it('returns 0 for completely disjoint sets', () => {
    const a = [mkVoxel(0, 0, 0)];
    const b = [mkVoxel(4, 4, 4)];
    expect(calculateStructureScore(a, b)).toBe(0);
  });

  it('returns 0 for two empty sets', () => {
    expect(calculateStructureScore([], [])).toBe(0);
  });

  it('computes partial overlap correctly', () => {
    const player = [mkVoxel(0, 0, 0), mkVoxel(1, 1, 1)];
    const target = [mkVoxel(0, 0, 0), mkVoxel(2, 2, 2)];
    // intersection = 1, union = 3 → 33%
    expect(calculateStructureScore(player, target)).toBe(33);
  });
});

describe('calculateScores', () => {
  it('returns a ScoreResult with all fields', () => {
    const plan: DirectorPlan = {
      grid_size: [5, 5, 5],
      voxels: [mkVoxel(0, 0, 0)],
      vibe_vector: { warmth: 2, density: 2, focus: 2, randomness: 2, saturation: 2, verticality: 2 },
      vibe_prompt: 'test',
    };
    const result = calculateScores([mkVoxel(0, 0, 0)], plan);
    expect(result.structureScore).toBe(100);
    expect(result).toHaveProperty('vibeScore');
    expect(result).toHaveProperty('totalScore');
    expect(result).toHaveProperty('rationale');
  });
});
