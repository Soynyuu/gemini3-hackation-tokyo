import { describe, it, expect } from 'vitest';
import { isWithinBounds, positionKey, positionsEqual, createGridConfig } from '../src/grid.js';
import type { Vector3 } from '../src/types.js';

describe('isWithinBounds', () => {
  const grid: Vector3 = [5, 5, 5];

  it('returns true for origin', () => {
    expect(isWithinBounds([0, 0, 0], grid)).toBe(true);
  });

  it('returns true for max corner', () => {
    expect(isWithinBounds([4, 4, 4], grid)).toBe(true);
  });

  it('returns false when x is out of range', () => {
    expect(isWithinBounds([5, 0, 0], grid)).toBe(false);
  });

  it('returns false when y is negative', () => {
    expect(isWithinBounds([0, -1, 0], grid)).toBe(false);
  });

  it('returns false when z exceeds grid', () => {
    expect(isWithinBounds([0, 0, 5], grid)).toBe(false);
  });

  it('uses default grid size when none provided', () => {
    expect(isWithinBounds([4, 4, 4])).toBe(true);
    expect(isWithinBounds([5, 0, 0])).toBe(false);
  });
});

describe('positionKey', () => {
  it('returns comma-separated string', () => {
    expect(positionKey([1, 2, 3])).toBe('1,2,3');
  });

  it('handles zeroes', () => {
    expect(positionKey([0, 0, 0])).toBe('0,0,0');
  });
});

describe('positionsEqual', () => {
  it('returns true for identical positions', () => {
    expect(positionsEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it('returns false when any component differs', () => {
    expect(positionsEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(positionsEqual([0, 2, 3], [1, 2, 3])).toBe(false);
  });
});

describe('createGridConfig', () => {
  it('returns config with given size', () => {
    expect(createGridConfig([8, 8, 8])).toEqual({ size: [8, 8, 8] });
  });

  it('defaults to 5x5x5', () => {
    expect(createGridConfig()).toEqual({ size: [5, 5, 5] });
  });
});
