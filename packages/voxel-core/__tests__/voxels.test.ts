import { describe, it, expect } from 'vitest';
import { placeVoxel, removeVoxel, findVoxel, hasVoxelAt } from '../src/voxels.js';
import type { Voxel, Vector3 } from '../src/types.js';

const mkVoxel = (pos: Vector3, color = '#FF0000'): Voxel => ({
  pos,
  color,
  type: 'standard',
});

describe('placeVoxel', () => {
  it('adds a voxel to an empty array', () => {
    const result = placeVoxel([], mkVoxel([0, 0, 0]));
    expect(result).toHaveLength(1);
    expect(result[0].pos).toEqual([0, 0, 0]);
  });

  it('replaces a voxel at the same position', () => {
    const initial = [mkVoxel([1, 1, 1], '#FF0000')];
    const result = placeVoxel(initial, mkVoxel([1, 1, 1], '#00FF00'));
    expect(result).toHaveLength(1);
    expect(result[0].color).toBe('#00FF00');
  });

  it('rejects voxels outside the grid', () => {
    const result = placeVoxel([], mkVoxel([5, 0, 0]), [5, 5, 5]);
    expect(result).toHaveLength(0);
  });

  it('rejects voxels with negative coordinates', () => {
    const result = placeVoxel([], mkVoxel([-1, 0, 0]));
    expect(result).toHaveLength(0);
  });

  it('does not mutate the input array', () => {
    const initial: Voxel[] = [];
    placeVoxel(initial, mkVoxel([0, 0, 0]));
    expect(initial).toHaveLength(0);
  });
});

describe('removeVoxel', () => {
  it('removes a voxel at the given position', () => {
    const voxels = [mkVoxel([0, 0, 0]), mkVoxel([1, 1, 1])];
    const result = removeVoxel(voxels, [0, 0, 0]);
    expect(result).toHaveLength(1);
    expect(result[0].pos).toEqual([1, 1, 1]);
  });

  it('returns same contents when position not found', () => {
    const voxels = [mkVoxel([0, 0, 0])];
    const result = removeVoxel(voxels, [9, 9, 9]);
    expect(result).toHaveLength(1);
  });
});

describe('findVoxel', () => {
  it('returns the voxel at the given position', () => {
    const voxels = [mkVoxel([2, 3, 4], '#ABCDEF')];
    expect(findVoxel(voxels, [2, 3, 4])?.color).toBe('#ABCDEF');
  });

  it('returns undefined when not found', () => {
    expect(findVoxel([], [0, 0, 0])).toBeUndefined();
  });
});

describe('hasVoxelAt', () => {
  it('returns true when a voxel exists', () => {
    expect(hasVoxelAt([mkVoxel([1, 2, 3])], [1, 2, 3])).toBe(true);
  });

  it('returns false when no voxel exists', () => {
    expect(hasVoxelAt([mkVoxel([1, 2, 3])], [0, 0, 0])).toBe(false);
  });
});
