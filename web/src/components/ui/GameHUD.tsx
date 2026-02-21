import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Timer } from 'lucide-react';

export const GameHUD = () => {
    const { directorPlan, timeRemaining, setTimeRemaining, setPhase } = useGameStore();

    useEffect(() => {
        let interval: number;
        if (timeRemaining > 0) {
            interval = window.setInterval(() => {
                setTimeRemaining(timeRemaining - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            setPhase('reveal');
        }
        return () => clearInterval(interval);
    }, [timeRemaining, setTimeRemaining, setPhase]);

    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;

    return (
        <div className="absolute top-0 left-0 w-full p-2 md:p-8 flex justify-between items-start pointer-events-none z-20">

            <div className="max-w-[55%] md:max-w-xl min-w-0">
                <div className="uppercase tracking-widest text-cyber-primary text-[10px] md:text-xs font-bold mb-0.5 md:mb-2">ディレクターの要請</div>
                <h1 className="text-sm md:text-3xl font-mono text-white font-bold tracking-tight drop-shadow-md line-clamp-2 md:line-clamp-none">
                    「{directorPlan?.vibe_prompt}」
                </h1>
            </div>

            <div className="flex flex-col items-end flex-shrink-0">
                <div className={`flex items-center gap-1.5 md:gap-3 text-base md:text-2xl font-mono font-bold px-3 md:px-6 py-1.5 md:py-3 rounded-lg md:rounded-xl bg-cyber-surface/80 backdrop-blur-md border ${timeRemaining <= 30 ? 'border-cyber-accent text-cyber-accent animate-pulse' : 'border-cyber-border text-white'}`}>
                    <Timer size={16} className="md:w-5 md:h-5" />
                    <span>{mins}:{secs.toString().padStart(2, '0')}</span>
                </div>

                <button
                    onClick={() => setPhase('reveal')}
                    className="mt-1.5 md:mt-4 px-4 md:px-8 py-1.5 md:py-3 bg-white text-black font-bold uppercase tracking-widest rounded-lg hover:bg-cyber-primary transition-colors pointer-events-auto shadow-[0_0_20px_rgba(255,255,255,0.3)] text-xs md:text-base"
                >
                    完了（提出）
                </button>
            </div>

        </div>
    );
};
