export type { Vector3, VoxelType, Voxel, VibeVector } from 'microvoxel-5';

import type { Voxel, Vector3, VibeVector } from 'microvoxel-5';

export interface DirectorPlan {
    grid_size: Vector3;
    voxels: Voxel[];
    vibe_vector: VibeVector;
    vibe_prompt: string;
    hint_svg?: string;
    hint_foundation?: Voxel[];
}

export type GamePhase = 'title' | 'build' | 'reveal';

export interface GameState {
    phase: GamePhase;
    directorPlan: DirectorPlan | null;
    playerVoxels: Voxel[];
    timeRemaining: number;
    apiKey: string | null;

    setPhase: (phase: GamePhase) => void;
    setDirectorPlan: (plan: DirectorPlan) => void;
    addVoxel: (voxel: Voxel) => void;
    removeVoxel: (pos: Vector3) => void;
    clearVoxels: () => void;
    setTimeRemaining: (time: number) => void;
    setApiKey: (key: string) => void;
}
