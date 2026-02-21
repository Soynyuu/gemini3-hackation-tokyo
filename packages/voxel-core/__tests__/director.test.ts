import { describe, it, expect } from 'vitest';
import { generateMockDirectorPlan, DEFAULT_PALETTE } from '../src/director.js';
import { isValidDirectorPlan } from '../src/validation.js';

describe('generateMockDirectorPlan', () => {
  it('produces a valid DirectorPlan', () => {
    const plan = generateMockDirectorPlan();
    expect(isValidDirectorPlan(plan)).toBe(true);
  });

  it('respects minVoxels / maxVoxels', () => {
    const plan = generateMockDirectorPlan({ minVoxels: 5, maxVoxels: 5 });
    expect(plan.voxels).toHaveLength(5);
  });

  it('uses custom grid size', () => {
    const plan = generateMockDirectorPlan({ gridSize: [8, 8, 8] });
    expect(plan.grid_size).toEqual([8, 8, 8]);
    plan.voxels.forEach(v => {
      expect(v.pos[0]).toBeLessThan(8);
      expect(v.pos[1]).toBeLessThan(8);
      expect(v.pos[2]).toBeLessThan(8);
    });
  });

  it('uses custom palette', () => {
    const palette = ['#000000', '#FFFFFF'];
    const plan = generateMockDirectorPlan({ palette });
    plan.voxels.forEach(v => {
      expect(palette).toContain(v.color);
    });
  });

  it('generates no duplicate positions', () => {
    const plan = generateMockDirectorPlan({ minVoxels: 20, maxVoxels: 20 });
    const keys = plan.voxels.map(v => v.pos.join(','));
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('DEFAULT_PALETTE', () => {
  it('contains valid hex colours', () => {
    DEFAULT_PALETTE.forEach(c => {
      expect(c).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});
