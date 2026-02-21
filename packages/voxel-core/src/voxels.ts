import type { Voxel, Vector3 } from './types.js';
import { DEFAULT_GRID_SIZE } from './types.js';
import { isWithinBounds, positionsEqual } from './grid.js';

export function placeVoxel(
  voxels: readonly Voxel[],
  voxel: Voxel,
  gridSize: Vector3 = DEFAULT_GRID_SIZE,
): Voxel[] {
  if (!isWithinBounds(voxel.pos, gridSize)) {
    return [...voxels];
  }

  const exists = voxels.some(v => positionsEqual(v.pos, voxel.pos));
  if (exists) {
    return voxels.map(v => positionsEqual(v.pos, voxel.pos) ? voxel : v);
  }
  return [...voxels, voxel];
}

export function removeVoxel(voxels: readonly Voxel[], pos: Vector3): Voxel[] {
  return voxels.filter(v => !positionsEqual(v.pos, pos));
}

export function findVoxel(voxels: readonly Voxel[], pos: Vector3): Voxel | undefined {
  return voxels.find(v => positionsEqual(v.pos, pos));
}

export function hasVoxelAt(voxels: readonly Voxel[], pos: Vector3): boolean {
  return voxels.some(v => positionsEqual(v.pos, pos));
}
