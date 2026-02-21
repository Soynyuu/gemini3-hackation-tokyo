import type { Vector3, Voxel, VoxelType, VibeVector, DirectorPlan } from './types.js';
import { VOXEL_TYPES, DEFAULT_GRID_SIZE } from './types.js';
import { isWithinBounds } from './grid.js';

export function isValidVector3(v: unknown): v is Vector3 {
  return (
    Array.isArray(v) &&
    v.length === 3 &&
    v.every(n => typeof n === 'number' && Number.isFinite(n))
  );
}

export function isValidVoxelType(v: unknown): v is VoxelType {
  return typeof v === 'string' && (VOXEL_TYPES as readonly string[]).includes(v);
}

export function isValidHexColour(v: unknown): v is string {
  return typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v);
}

export function isValidVoxel(v: unknown, gridSize: Vector3 = DEFAULT_GRID_SIZE): v is Voxel {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    isValidVector3(obj.pos) &&
    isWithinBounds(obj.pos as Vector3, gridSize) &&
    isValidHexColour(obj.color) &&
    isValidVoxelType(obj.type)
  );
}

export function isValidVibeVector(v: unknown): v is VibeVector {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  const fields = ['warmth', 'density', 'focus', 'randomness', 'saturation', 'verticality'] as const;
  return fields.every(
    f => typeof obj[f] === 'number' && obj[f] >= 0 && obj[f] <= 4,
  );
}

export function isValidDirectorPlan(v: unknown): v is DirectorPlan {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    isValidVector3(obj.grid_size) &&
    (obj.grid_size as number[]).every(n => Number.isInteger(n) && n >= 1) &&
    Array.isArray(obj.voxels) &&
    obj.voxels.every((vx: unknown) => isValidVoxel(vx, obj.grid_size as Vector3)) &&
    isValidVibeVector(obj.vibe_vector) &&
    typeof obj.vibe_prompt === 'string'
  );
}
