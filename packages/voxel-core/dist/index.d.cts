type Vector3 = [number, number, number];
type VoxelType = 'standard' | 'emissive' | 'transparent';
declare const VOXEL_TYPES: readonly VoxelType[];
interface Voxel {
    pos: Vector3;
    color: string;
    type: VoxelType;
}
interface VibeVector {
    warmth: number;
    density: number;
    focus: number;
    randomness: number;
    saturation: number;
    verticality: number;
}
interface DirectorPlan {
    grid_size: Vector3;
    voxels: Voxel[];
    vibe_vector: VibeVector;
    vibe_prompt: string;
}
interface GridConfig {
    size: Vector3;
}
interface ScoreResult {
    structureScore: number;
    vibeScore: number;
    totalScore: number;
    rationale: string;
}
declare const DEFAULT_GRID_SIZE: Vector3;

declare function isWithinBounds(pos: Vector3, gridSize?: Vector3): boolean;
declare function positionKey(pos: Vector3): string;
declare function positionsEqual(a: Vector3, b: Vector3): boolean;
declare function createGridConfig(size?: Vector3): GridConfig;

declare function placeVoxel(voxels: readonly Voxel[], voxel: Voxel, gridSize?: Vector3): Voxel[];
declare function removeVoxel(voxels: readonly Voxel[], pos: Vector3): Voxel[];
declare function findVoxel(voxels: readonly Voxel[], pos: Vector3): Voxel | undefined;
declare function hasVoxelAt(voxels: readonly Voxel[], pos: Vector3): boolean;

declare function calculateStructureScore(playerVoxels: readonly Voxel[], targetVoxels: readonly Voxel[]): number;
declare function calculateScores(playerVoxels: readonly Voxel[], plan: DirectorPlan): ScoreResult;

declare const DEFAULT_PALETTE: readonly ["#FF3B30", "#0A84FF", "#30D158", "#FF9F0A", "#BF5AF2", "#FFD60A", "#E0F0FF"];
interface GenerateOptions {
    gridSize?: Vector3;
    minVoxels?: number;
    maxVoxels?: number;
    palette?: readonly string[];
    prompts?: readonly string[];
}
declare function generateMockDirectorPlan(options?: GenerateOptions): DirectorPlan;

declare function isValidVector3(v: unknown): v is Vector3;
declare function isValidVoxelType(v: unknown): v is VoxelType;
declare function isValidHexColour(v: unknown): v is string;
declare function isValidVoxel(v: unknown, gridSize?: Vector3): v is Voxel;
declare function isValidVibeVector(v: unknown): v is VibeVector;
declare function isValidDirectorPlan(v: unknown): v is DirectorPlan;

export { DEFAULT_GRID_SIZE, DEFAULT_PALETTE, type DirectorPlan, type GenerateOptions, type GridConfig, type ScoreResult, VOXEL_TYPES, type Vector3, type VibeVector, type Voxel, type VoxelType, calculateScores, calculateStructureScore, createGridConfig, findVoxel, generateMockDirectorPlan, hasVoxelAt, isValidDirectorPlan, isValidHexColour, isValidVector3, isValidVibeVector, isValidVoxel, isValidVoxelType, isWithinBounds, placeVoxel, positionKey, positionsEqual, removeVoxel };
