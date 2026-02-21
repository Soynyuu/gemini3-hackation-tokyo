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
export type GameMode = 'classic' | 'vibe-coding';
export type VibeCodingLevel = 'engineer' | 'junior-pm' | 'senior-pm' | 'ceo' | 'investor';

export interface ClientInterruption {
    id: string;
    message: string;
    referenceImage?: string;
    timestamp: number;
    timerExtension: number;
    mood: 'friendly' | 'annoyed' | 'excited' | 'passive-aggressive';
}

export interface VibeCodingState {
    level: VibeCodingLevel;
    interruptions: ClientInterruption[];
    activeInterruption: ClientInterruption | null;
    interruptionCount: number;
    isGeneratingInterruption: boolean;
    initialPrompt: string;
    timerPaused: boolean;
    showStartModal: boolean;
}

export interface GameState {
    phase: GamePhase;
    directorPlan: DirectorPlan | null;
    playerVoxels: Voxel[];
    timeRemaining: number;
    apiKey: string | null;
    gameMode: GameMode;
    vibeCodingState: VibeCodingState | null;

    setPhase: (phase: GamePhase) => void;
    setDirectorPlan: (plan: DirectorPlan) => void;
    addVoxel: (voxel: Voxel) => void;
    removeVoxel: (pos: Vector3) => void;
    clearVoxels: () => void;
    setTimeRemaining: (time: number) => void;
    setApiKey: (key: string) => void;
    setGameMode: (mode: GameMode) => void;
    initVibeCodingState: (level: VibeCodingLevel, initialPrompt: string) => void;
    addInterruption: (interruption: ClientInterruption) => void;
    dismissActiveInterruption: () => void;
    setIsGeneratingInterruption: (v: boolean) => void;
    setTimerPaused: (paused: boolean) => void;
    dismissStartModal: () => void;
    resetVibeCodingState: () => void;
}
