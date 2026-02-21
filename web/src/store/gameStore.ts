import { create } from 'zustand';
import { placeVoxel, removeVoxel } from 'microvoxel-5';
import type { GameState, GamePhase, DirectorPlan, Voxel, Vector3 } from './types';

export const useGameStore = create<GameState>((set) => ({
    phase: 'title',
    directorPlan: null,
    playerVoxels: [],
    timeRemaining: 120,
    apiKey: localStorage.getItem('gemini_api_key') || null,

    setPhase: (phase: GamePhase) => set({ phase }),

    setDirectorPlan: (plan: DirectorPlan) => set({
        directorPlan: plan,
        playerVoxels: plan.hint_foundation || []
    }),

    addVoxel: (voxel: Voxel) => set((state) => ({
        playerVoxels: placeVoxel(state.playerVoxels, voxel)
    })),

    removeVoxel: (pos: Vector3) => set((state) => ({
        playerVoxels: removeVoxel(state.playerVoxels, pos)
    })),

    clearVoxels: () => set({ playerVoxels: [] }),

    setTimeRemaining: (time: number) => set({ timeRemaining: time }),

    setApiKey: (key: string) => {
        const trimmed = key.trim();
        localStorage.setItem('gemini_api_key', trimmed);
        set({ apiKey: trimmed });
    }
}));
