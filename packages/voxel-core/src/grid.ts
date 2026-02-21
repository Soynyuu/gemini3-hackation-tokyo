import type { Vector3, GridConfig } from './types.js';
import { DEFAULT_GRID_SIZE } from './types.js';

export function isWithinBounds(pos: Vector3, gridSize: Vector3 = DEFAULT_GRID_SIZE): boolean {
  return (
    pos[0] >= 0 && pos[0] < gridSize[0] &&
    pos[1] >= 0 && pos[1] < gridSize[1] &&
    pos[2] >= 0 && pos[2] < gridSize[2]
  );
}

export function positionKey(pos: Vector3): string {
  return pos.join(',');
}

export function positionsEqual(a: Vector3, b: Vector3): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

export function createGridConfig(size: Vector3 = DEFAULT_GRID_SIZE): GridConfig {
  return { size };
}
