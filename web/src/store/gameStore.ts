
import { create } from 'zustand';
import type { GameState, GamePhase, DirectorPlan, Voxel, Vector3 } from './types';

export const useGameStore = create<GameState>((set) => ({
    phase: 'title',
    directorPlan: null,
    playerVoxels: [],
    timeRemaining: 120, // 2 minutes
    apiKey: localStorage.getItem('gemini_api_key') || null,

    setPhase: (phase: GamePhase) => set({ phase }),

    setDirectorPlan: (plan: DirectorPlan) => set({ directorPlan: plan, playerVoxels: [] }),

    addVoxel: (voxel: Voxel) => set((state) => {
        // Check if a voxel already exists at this position
        const exists = state.playerVoxels.some(
            v => v.pos[0] === voxel.pos[0] &&
                v.pos[1] === voxel.pos[1] &&
                v.pos[2] === voxel.pos[2]
        );
        if (exists) {
            // replace it
            return {
                playerVoxels: state.playerVoxels.map(v =>
                    (v.pos[0] === voxel.pos[0] && v.pos[1] === voxel.pos[1] && v.pos[2] === voxel.pos[2])
                        ? voxel : v
                )
            };
        }
        return { playerVoxels: [...state.playerVoxels, voxel] };
    }),

    removeVoxel: (pos: Vector3) => set((state) => ({
        playerVoxels: state.playerVoxels.filter(
            v => !(v.pos[0] === pos[0] && v.pos[1] === pos[1] && v.pos[2] === pos[2])
        )
    })),

    clearVoxels: () => set({ playerVoxels: [] }),

    setTimeRemaining: (time: number) => set({ timeRemaining: time }),

    setApiKey: (key: string) => {
        localStorage.setItem('gemini_api_key', key);
        set({ apiKey: key });
    }
}));

