import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { UserRound, Clock, ChevronLeft, ChevronRight, MessageSquare, Pause } from 'lucide-react';

const moodColors: Record<string, string> = {
    friendly: 'border-cyber-primary text-cyber-primary',
    annoyed: 'border-cyber-accent text-cyber-accent',
    excited: 'border-yellow-400 text-yellow-400',
    'passive-aggressive': 'border-cyber-secondary text-cyber-secondary',
};

const moodBg: Record<string, string> = {
    friendly: 'bg-cyber-primary/10',
    annoyed: 'bg-cyber-accent/10',
    excited: 'bg-yellow-400/10',
    'passive-aggressive': 'bg-cyber-secondary/10',
};

const moodButtonColors: Record<string, string> = {
    friendly: 'bg-cyber-primary hover:bg-cyber-primary/80 text-black',
    annoyed: 'bg-cyber-accent hover:bg-cyber-accent/80 text-white',
    excited: 'bg-yellow-400 hover:bg-yellow-400/80 text-black',
    'passive-aggressive': 'bg-cyber-secondary hover:bg-cyber-secondary/80 text-white',
};

function InterruptionModal() {
    const vibeCodingState = useGameStore((s) => s.vibeCodingState);
    const dismissActiveInterruption = useGameStore((s) => s.dismissActiveInterruption);
    const active = vibeCodingState?.activeInterruption;

    if (!active) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className={`relative rounded-2xl border-2 ${moodColors[active.mood]} ${moodBg[active.mood]} backdrop-blur-md p-6 md:p-8 shadow-2xl max-w-md w-[90vw] animate-[slideUp_0.4s_ease-out]`}>
                <div className="flex items-center gap-2 mb-1">
                    <Pause size={12} className="text-cyber-muted" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyber-muted">タイマー停止中</span>
                </div>

                <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-full border-2 ${moodColors[active.mood]} flex items-center justify-center flex-shrink-0`}>
                        <UserRound size={24} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-cyber-muted mb-1">
                            クライアントからの連絡
                        </div>
                        <p className="text-base md:text-lg font-bold text-white leading-relaxed">
                            「{active.message}」
                        </p>
                    </div>
                </div>

                {active.referenceImage && (
                    <div className="mb-4 p-3 rounded-lg bg-black/40 border border-cyber-border/50">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-cyber-muted mb-2">
                            クライアントの頭の中のイメージ
                        </div>
                        <div
                            className="flex justify-center"
                            dangerouslySetInnerHTML={{ __html: active.referenceImage }}
                        />
                    </div>
                )}

                {active.timerExtension > 0 && (
                    <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyber-primary/20 text-cyber-primary text-sm font-mono">
                        <Clock size={14} />
                        時間延長 +{active.timerExtension}秒
                    </div>
                )}

                <button
                    onClick={() => dismissActiveInterruption()}
                    className={`w-full py-3 rounded-lg font-bold uppercase tracking-widest text-sm transition-colors ${moodButtonColors[active.mood]}`}
                >
                    了解、続ける
                </button>
            </div>
        </div>
    );
}

function InterruptionHistory() {
    const vibeCodingState = useGameStore((s) => s.vibeCodingState);
    const directorPlan = useGameStore((s) => s.directorPlan);
    const [collapsed, setCollapsed] = useState(false);

    if (!vibeCodingState) return null;

    const hasInterruptions = vibeCodingState.interruptions.length > 0;

    return (
        <div className={`fixed top-16 right-0 z-30 transition-all duration-300 ${collapsed ? 'w-10' : 'w-72'}`}>
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute top-0 left-0 w-10 h-10 flex items-center justify-center bg-cyber-surface/90 border border-cyber-border rounded-l-lg text-cyber-muted hover:text-white pointer-events-auto transition-colors"
            >
                {collapsed ? (
                    <>
                        <ChevronLeft size={16} />
                        <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-cyber-accent text-[9px] font-bold text-white flex items-center justify-center">
                            {vibeCodingState.interruptions.length + 1}
                        </span>
                    </>
                ) : (
                    <ChevronRight size={16} />
                )}
            </button>
            {!collapsed && (
                <div className="ml-10 bg-cyber-surface/90 backdrop-blur-md border border-cyber-border rounded-bl-lg max-h-[60vh] overflow-y-auto p-3 pointer-events-auto">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-cyber-muted mb-3">
                        <MessageSquare size={10} />
                        全指示履歴
                    </div>
                    <div className="space-y-2">
                        <div className="p-2 rounded-lg border border-cyber-border/50 text-xs">
                            <span className="text-cyber-muted font-mono">0:00</span>
                            <span className="ml-2 text-cyber-primary font-bold">初期</span>
                            <span className="ml-1 text-white">「{directorPlan?.vibe_prompt}」</span>
                        </div>
                        {vibeCodingState.interruptions.map((intr, i) => (
                            <div
                                key={intr.id}
                                className={`p-2 rounded-lg border text-xs ${
                                    i === vibeCodingState.interruptions.length - 1
                                        ? `${moodColors[intr.mood]} ${moodBg[intr.mood]}`
                                        : 'border-cyber-border/50 opacity-60'
                                }`}
                            >
                                <span className="text-cyber-muted font-mono">
                                    {Math.floor(intr.timestamp / 60)}:{(intr.timestamp % 60).toString().padStart(2, '0')}
                                </span>
                                <span className="ml-2 text-white">{intr.message}</span>
                            </div>
                        ))}
                        {!hasInterruptions && (
                            <div className="text-[10px] text-cyber-muted/60 italic p-1">
                                追加指示はまだ届いていません
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export function ClientInterruptionOverlay() {
    const isGenerating = useGameStore((s) => s.vibeCodingState?.isGeneratingInterruption);

    return (
        <>
            <InterruptionModal />
            <InterruptionHistory />
            {isGenerating && (
                <div className="fixed bottom-4 right-4 z-40 pointer-events-none">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-surface/80 backdrop-blur-md border border-cyber-border">
                        <div className="w-2 h-2 rounded-full bg-cyber-accent animate-pulse" />
                        <span className="text-[10px] font-mono text-cyber-muted">クライアント入力中...</span>
                    </div>
                </div>
            )}
        </>
    );
}
