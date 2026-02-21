import { describe, it, expect } from 'vitest';
import {
  isValidVector3,
  isValidVoxelType,
  isValidHexColour,
  isValidVoxel,
  isValidVibeVector,
  isValidDirectorPlan,
} from '../src/validation.js';

describe('isValidVector3', () => {
  it('accepts [0, 1, 2]', () => {
    expect(isValidVector3([0, 1, 2])).toBe(true);
  });

  it('rejects non-array', () => {
    expect(isValidVector3('nope')).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(isValidVector3([1, 2])).toBe(false);
  });

  it('rejects NaN element', () => {
    expect(isValidVector3([1, NaN, 3])).toBe(false);
  });
});

describe('isValidVoxelType', () => {
  it.each(['standard', 'emissive', 'transparent'] as const)('accepts "%s"', (t) => {
    expect(isValidVoxelType(t)).toBe(true);
  });

  it('rejects unknown type', () => {
    expect(isValidVoxelType('glow')).toBe(false);
  });
});

describe('isValidHexColour', () => {
  it('accepts #AABBCC', () => {
    expect(isValidHexColour('#AABBCC')).toBe(true);
  });

  it('rejects missing hash', () => {
    expect(isValidHexColour('AABBCC')).toBe(false);
  });

  it('rejects short hex', () => {
    expect(isValidHexColour('#ABC')).toBe(false);
  });
});

describe('isValidVoxel', () => {
  it('accepts a valid voxel', () => {
    expect(isValidVoxel({ pos: [0, 0, 0], color: '#FF0000', type: 'standard' })).toBe(true);
  });

  it('rejects out-of-bounds position', () => {
    expect(isValidVoxel({ pos: [5, 0, 0], color: '#FF0000', type: 'standard' })).toBe(false);
  });

  it('rejects bad colour', () => {
    expect(isValidVoxel({ pos: [0, 0, 0], color: 'red', type: 'standard' })).toBe(false);
  });

  it('rejects null', () => {
    expect(isValidVoxel(null)).toBe(false);
  });
});

describe('isValidVibeVector', () => {
  const valid = { warmth: 2, density: 3, focus: 1, randomness: 0, saturation: 4, verticality: 2 };

  it('accepts valid vibe vector', () => {
    expect(isValidVibeVector(valid)).toBe(true);
  });

  it('rejects value out of range', () => {
    expect(isValidVibeVector({ ...valid, warmth: 5 })).toBe(false);
  });

  it('rejects missing field', () => {
    const { warmth: _, ...partial } = valid;
    expect(isValidVibeVector(partial)).toBe(false);
  });
});

describe('isValidDirectorPlan', () => {
  const plan = {
    grid_size: [5, 5, 5],
    voxels: [{ pos: [0, 0, 0], color: '#FF0000', type: 'standard' }],
    vibe_vector: { warmth: 2, density: 2, focus: 2, randomness: 2, saturation: 2, verticality: 2 },
    vibe_prompt: 'a lonely tower',
  };

  it('accepts a valid plan', () => {
    expect(isValidDirectorPlan(plan)).toBe(true);
  });

  it('rejects plan with invalid voxel', () => {
    expect(isValidDirectorPlan({ ...plan, voxels: [{ pos: [99, 0, 0], color: '#FF0000', type: 'standard' }] })).toBe(false);
  });

  it('rejects plan without vibe_prompt', () => {
    const { vibe_prompt: _, ...noPlan } = plan;
    expect(isValidDirectorPlan(noPlan)).toBe(false);
  });
});
