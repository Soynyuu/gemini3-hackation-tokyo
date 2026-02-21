export type {
  Vector3,
  VoxelType,
  Voxel,
  VibeVector,
  DirectorPlan,
  GridConfig,
  ScoreResult,
} from './types.js';
export { VOXEL_TYPES, DEFAULT_GRID_SIZE } from './types.js';

export { isWithinBounds, positionKey, positionsEqual, createGridConfig } from './grid.js';

export { placeVoxel, removeVoxel, findVoxel, hasVoxelAt } from './voxels.js';

export { calculateStructureScore, calculateScores } from './scoring.js';

export type { GenerateOptions } from './director.js';
export { generateMockDirectorPlan, DEFAULT_PALETTE } from './director.js';

export {
  isValidVector3,
  isValidVoxelType,
  isValidHexColour,
  isValidVoxel,
  isValidVibeVector,
  isValidDirectorPlan,
} from './validation.js';
