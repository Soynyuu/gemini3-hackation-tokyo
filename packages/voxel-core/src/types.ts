export type Vector3 = [number, number, number];

export type VoxelType = 'standard' | 'emissive' | 'transparent';

export const VOXEL_TYPES: readonly VoxelType[] = [
  'standard',
  'emissive',
  'transparent',
] as const;

export interface Voxel {
  pos: Vector3;
  color: string;
  type: VoxelType;
}

export interface VibeVector {
  warmth: number;
  density: number;
  focus: number;
  randomness: number;
  saturation: number;
  verticality: number;
}

export interface DirectorPlan {
  grid_size: Vector3;
  voxels: Voxel[];
  vibe_vector: VibeVector;
  vibe_prompt: string;
}

export interface GridConfig {
  size: Vector3;
}

export interface ScoreResult {
  structureScore: number;
  vibeScore: number;
  totalScore: number;
  rationale: string;
}

export const DEFAULT_GRID_SIZE: Vector3 = [5, 5, 5];
