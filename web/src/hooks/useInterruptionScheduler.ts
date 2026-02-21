import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateClientInterruption, generateMockInterruption, getVibeCodingConfig } from '../lib/geminiClient';

const MOCK_FIXED_TIMES = [20, 50, 80, 100, 120];

export function useInterruptionScheduler() {
    const phase = useGameStore((s) => s.phase);
    const gameMode = useGameStore((s) => s.gameMode);
    const vibeCodingState = useGameStore((s) => s.vibeCodingState);
    const apiKey = useGameStore((s) => s.apiKey);
    const addInterruption = useGameStore((s) => s.addInterruption);
    const setIsGeneratingInterruption = useGameStore((s) => s.setIsGeneratingInterruption);

    const timeoutRef = useRef<number | null>(null);
    const buildStartTimeRef = useRef<number>(0);
    const isSchedulingRef = useRef(false);

    const isActive = phase === 'build' && gameMode === 'vibe-coding' && vibeCodingState !== null && !vibeCodingState.showStartModal;

    const fireInterruption = useCallback(async () => {
        const state = useGameStore.getState();
        const vcs = state.vibeCodingState;
        if (!vcs || state.phase !== 'build') return;

        const config = getVibeCodingConfig(vcs.level);
        if (vcs.interruptionCount >= config.maxInterruptions) return;

        setIsGeneratingInterruption(true);
        try {
            let interruption;
            if (apiKey) {
                interruption = await generateClientInterruption(
                    apiKey,
                    vcs.level,
                    vcs.initialPrompt,
                    vcs.interruptions,
                    vcs.interruptionCount,
                );
            } else {
                interruption = generateMockInterruption(
                    vcs.level,
                    vcs.interruptionCount,
                );
            }
            interruption.timestamp = Math.floor((Date.now() - buildStartTimeRef.current) / 1000);
            addInterruption(interruption);
        } catch (e) {
            console.error('Interruption generation failed:', e);
            const mock = generateMockInterruption(
                vcs.level,
                vcs.interruptionCount,
            );
            mock.timestamp = Math.floor((Date.now() - buildStartTimeRef.current) / 1000);
            addInterruption(mock);
        } finally {
            setIsGeneratingInterruption(false);
        }
    }, [apiKey, addInterruption, setIsGeneratingInterruption]);

    const scheduleMockSequence = useCallback(() => {
        const state = useGameStore.getState();
        const vcs = state.vibeCodingState;
        if (!vcs) return;

        const config = getVibeCodingConfig(vcs.level);
        const times = MOCK_FIXED_TIMES.slice(0, config.maxInterruptions);

        times.forEach((seconds) => {
            const delay = seconds * 1000;
            const t = window.setTimeout(() => {
                if (!isSchedulingRef.current) return;
                const current = useGameStore.getState();
                if (current.phase !== 'build' || !current.vibeCodingState) return;
                const cfg = getVibeCodingConfig(current.vibeCodingState.level);
                if (current.vibeCodingState.interruptionCount >= cfg.maxInterruptions) return;

                const mock = generateMockInterruption(
                    current.vibeCodingState.level,
                    current.vibeCodingState.interruptionCount,
                );
                mock.timestamp = seconds;
                addInterruption(mock);
            }, delay);

            if (!timeoutRef.current) timeoutRef.current = t;
        });
    }, [addInterruption]);

    const scheduleApiSequence = useCallback(() => {
        const doSchedule = () => {
            const state = useGameStore.getState();
            const vcs = state.vibeCodingState;
            if (!vcs || state.phase !== 'build' || !isSchedulingRef.current) return;

            const config = getVibeCodingConfig(vcs.level);
            if (vcs.interruptionCount >= config.maxInterruptions) return;

            const [minInterval, maxInterval] = config.intervalRange;
            const delay = (minInterval + Math.random() * (maxInterval - minInterval)) * 1000;

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = window.setTimeout(() => {
                fireInterruption().then(() => {
                    if (isSchedulingRef.current) doSchedule();
                });
            }, delay);
        };

        const initialDelay = (20 + Math.random() * 10) * 1000;
        timeoutRef.current = window.setTimeout(() => {
            fireInterruption().then(() => {
                if (isSchedulingRef.current) doSchedule();
            });
        }, initialDelay);
    }, [fireInterruption]);

    useEffect(() => {
        if (!isActive) {
            isSchedulingRef.current = false;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            return;
        }

        isSchedulingRef.current = true;
        buildStartTimeRef.current = Date.now();

        if (apiKey) {
            scheduleApiSequence();
        } else {
            scheduleMockSequence();
        }

        return () => {
            isSchedulingRef.current = false;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isActive, apiKey, scheduleApiSequence, scheduleMockSequence]);

    return { fireInterruption, buildStartTimeRef };
}
