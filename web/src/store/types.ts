export type Vector3 = [number, number, number];

export type VoxelType = 'standard' | 'emissive' | 'transparent';

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

export type GamePhase = 'title' | 'build' | 'reveal';

export interface GameState {
    phase: GamePhase;
    directorPlan: DirectorPlan | null;
    playerVoxels: Voxel[];
    timeRemaining: number;
    apiKey: string | null;

    // Actions
    setPhase: (phase: GamePhase) => void;
    setDirectorPlan: (plan: DirectorPlan) => void;
    addVoxel: (voxel: Voxel) => void;
    removeVoxel: (pos: Vector3) => void;
    clearVoxels: () => void;
    setTimeRemaining: (time: number) => void;
    setApiKey: (key: string) => void;
}
