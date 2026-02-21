import { create } from 'zustand';
import { placeVoxel, removeVoxel } from 'microvoxel-5';
import type { GameState, GamePhase, GameMode, DirectorPlan, Voxel, Vector3, VibeCodingLevel, ClientInterruption } from './types';

const MAX_TIMER = 240;

export const useGameStore = create<GameState>((set) => ({
    phase: 'title',
    directorPlan: null,
    playerVoxels: [],
    timeRemaining: 120,
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || null,
    gameMode: 'classic',
    vibeCodingState: null,

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
    },

    setGameMode: (mode: GameMode) => set({ gameMode: mode }),

    initVibeCodingState: (level: VibeCodingLevel, initialPrompt: string) => set({
        vibeCodingState: {
            level,
            interruptions: [],
            activeInterruption: null,
            interruptionCount: 0,
            isGeneratingInterruption: false,
            initialPrompt,
            timerPaused: true,
            showStartModal: true,
        },
    }),

    addInterruption: (interruption: ClientInterruption) => set((state) => {
        if (!state.vibeCodingState) return {};
        const newTime = Math.min(state.timeRemaining + interruption.timerExtension, MAX_TIMER);
        return {
            vibeCodingState: {
                ...state.vibeCodingState,
                interruptions: [...state.vibeCodingState.interruptions, interruption],
                activeInterruption: interruption,
                interruptionCount: state.vibeCodingState.interruptionCount + 1,
                timerPaused: true,
            },
            timeRemaining: newTime,
        };
    }),

    dismissActiveInterruption: () => set((state) => ({
        vibeCodingState: state.vibeCodingState
            ? { ...state.vibeCodingState, activeInterruption: null, timerPaused: false }
            : null,
    })),

    setIsGeneratingInterruption: (v: boolean) => set((state) => ({
        vibeCodingState: state.vibeCodingState
            ? { ...state.vibeCodingState, isGeneratingInterruption: v }
            : null,
    })),

    setTimerPaused: (paused: boolean) => set((state) => ({
        vibeCodingState: state.vibeCodingState
            ? { ...state.vibeCodingState, timerPaused: paused }
            : null,
    })),

    dismissStartModal: () => set((state) => ({
        vibeCodingState: state.vibeCodingState
            ? { ...state.vibeCodingState, showStartModal: false, timerPaused: false }
            : null,
    })),

    resetVibeCodingState: () => set({ vibeCodingState: null }),
}));
