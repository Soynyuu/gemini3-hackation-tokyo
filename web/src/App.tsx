import { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { useGameStore } from './store/gameStore';
import { generateGeminiDirectorPlan, DIFFICULTY_OPTIONS, type DifficultyLevel } from './lib/geminiDirector';
import { generateMockDirectorPlan } from './lib/mockDirector';
import { calculateScores } from './lib/scoring';
import { evaluateWithGemini } from './lib/geminiJudge';
import { VIBE_CODING_OPTIONS } from './lib/geminiClient';
import { VoxelGrid } from './components/3d/VoxelGrid';
import { Toolbar } from './components/ui/Toolbar';
import { GameHUD } from './components/ui/GameHUD';
import { SliceEditor } from './components/ui/SliceEditor';
import { ClientInterruptionOverlay } from './components/ui/ClientInterruption';
import { useInterruptionScheduler } from './hooks/useInterruptionScheduler';
import Teaser from './pages/Teaser';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { Play } from 'lucide-react';
import type { VoxelType, GameMode, VibeCodingLevel } from './store/types';

type Route = 'teaser' | 'game';

function useHashRoute(): [Route, (r: Route) => void] {
  const getRoute = useCallback((): Route => {
    return window.location.hash === '#/game' ? 'game' : 'teaser';
  }, []);

  const [route, setRouteState] = useState<Route>(getRoute);

  useEffect(() => {
    const onHash = () => setRouteState(getRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [getRoute]);

  const setRoute = useCallback((r: Route) => {
    window.location.hash = r === 'game' ? '#/game' : '#/';
  }, []);

  return [route, setRoute];
}

const moodColors: Record<string, string> = {
  friendly: 'border-cyber-primary',
  annoyed: 'border-cyber-accent',
  excited: 'border-yellow-400',
  'passive-aggressive': 'border-cyber-secondary',
};

const moodBg: Record<string, string> = {
  friendly: 'bg-cyber-primary/10',
  annoyed: 'bg-cyber-accent/10',
  excited: 'bg-yellow-400/10',
  'passive-aggressive': 'bg-cyber-secondary/10',
};

function Game() {
  const { phase, setPhase, setDirectorPlan, setTimeRemaining, directorPlan, playerVoxels, apiKey } = useGameStore();
  const gameMode = useGameStore((s) => s.gameMode);
  const vibeCodingState = useGameStore((s) => s.vibeCodingState);
  const setGameMode = useGameStore((s) => s.setGameMode);
  const initVibeCodingState = useGameStore((s) => s.initVibeCodingState);
  const resetVibeCodingState = useGameStore((s) => s.resetVibeCodingState);

  const [activeColor, setActiveColor] = useState('#C2410C');
  const [activeType, setActiveType] = useState<VoxelType>('standard');
  const [activeLayer, setActiveLayer] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiEvalResult, setAiEvalResult] = useState<{ vibeScore: number, rationale: string } | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('concrete');
  const [localGameMode, setLocalGameMode] = useState<GameMode>('classic');
  const [vibeCodingLevel, setVibeCodingLevel] = useState<VibeCodingLevel>('junior-pm');
  const [showStartModal, setShowStartModal] = useState(false);
  const [timerFrozen, setTimerFrozen] = useState(false);
  const [revealTab, setRevealTab] = useState<'timeline' | 'model'>('timeline');

  const { buildStartTimeRef, fireInterruption } = useInterruptionScheduler();
  const pendingFireRef = useRef(false);

  useEffect(() => {
    document.body.classList.add('game-mode');
    return () => document.body.classList.remove('game-mode');
  }, []);

  const activeInterruption = vibeCodingState?.activeInterruption ?? null;
  useEffect(() => {
    if (activeInterruption === null && pendingFireRef.current) {
      pendingFireRef.current = false;
      fireInterruption();
    }
  }, [activeInterruption, fireInterruption]);

  const handleVibeCodingSubmit = useCallback(() => {
    const state = useGameStore.getState();
    const vcs = state.vibeCodingState;
    if (!vcs) { setPhase('reveal'); return; }

    const config = VIBE_CODING_OPTIONS.find(o => o.value === vcs.level);
    if (!config || vcs.interruptionCount >= config.maxInterruptions) {
      setPhase('reveal');
      return;
    }

    const earlySubmitMessages = [
      'ちょっと待って！！まだ言いたいことあるんだけど！',
      'え、もう終わり！？待って待って！これも追加して！',
      'ストップ！！あとひとつだけ！頼む！！',
      'いやまだ早いって！もうちょい聞いてほしいんだけど！',
      'ちょ、提出はまだ！！もうひと仕様あんのよ！！',
    ];
    const msg = earlySubmitMessages[Math.floor(Math.random() * earlySubmitMessages.length)];

    pendingFireRef.current = true;
    useGameStore.getState().addInterruption({
      id: `early-submit-${Date.now()}`,
      message: msg,
      timestamp: Math.floor((Date.now() - buildStartTimeRef.current) / 1000),
      timerExtension: 10,
      mood: 'excited',
    });
  }, [setPhase, buildStartTimeRef]);

  const startRound = async () => {
    setIsGenerating(true);
    setGameMode(localGameMode);

    try {
      const planDifficulty = localGameMode === 'vibe-coding' ? difficulty : difficulty;

      const plan = apiKey
        ? await generateGeminiDirectorPlan(apiKey, planDifficulty)
        : generateMockDirectorPlan();
      setDirectorPlan(plan);
      setTimeRemaining(localGameMode === 'vibe-coding' ? 150 : 120);
      setShowStartModal(true);
      setTimerFrozen(true);
      setPhase('build');

      if (localGameMode === 'vibe-coding') {
        initVibeCodingState(vibeCodingLevel, plan.vibe_prompt);
      }
    } catch (e) {
      console.error(e);
      const plan = generateMockDirectorPlan();
      setDirectorPlan(plan);
      setTimeRemaining(localGameMode === 'vibe-coding' ? 150 : 120);
      setShowStartModal(true);
      setTimerFrozen(true);
      setPhase('build');

      if (localGameMode === 'vibe-coding') {
        initVibeCodingState(vibeCodingLevel, plan.vibe_prompt);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const dismissStartModal = useCallback(() => {
    setShowStartModal(false);
    setTimerFrozen(false);
    if (gameMode === 'vibe-coding') {
      useGameStore.getState().dismissStartModal();
    }
  }, [gameMode]);

  const renderTitle = () => (
    <div className="min-h-[100dvh] w-screen flex flex-col items-center justify-center bg-cyber-background text-cyber-text dark:text-white p-4 md:p-6 relative overflow-y-auto">
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyber-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-cyber-secondary/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="z-10 text-center max-w-2xl py-8 md:py-0">
        <h1 className="text-5xl md:text-8xl font-black mb-4 md:mb-6 tracking-tighter">
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyber-text dark:from-white to-cyber-muted">VIBE</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyber-primary to-cyber-accent">ARCHITECT</span>
        </h1>

        <p className="text-sm md:text-xl text-cyber-muted dark:text-cyber-muted mb-6 md:mb-8 font-mono leading-relaxed">
          AIディレクターが生成する「直感や雰囲気」を表現する3Dボクセル構築テスト。<br />
          制限時間内に、その抽象的な指示を3D構造へと変換するのがあなたの任務です。
        </p>

        <div className="flex flex-col gap-3 md:gap-4 items-center">
          {/* Mode selector */}
          <div className="flex gap-2 w-full max-w-lg mb-2">
            <button
              onClick={() => setLocalGameMode('classic')}
              className={`flex-1 py-2.5 md:py-3 rounded-lg border font-mono font-bold text-sm transition-all ${
                localGameMode === 'classic'
                  ? 'border-cyber-primary bg-cyber-primary/20 text-cyber-primary'
                  : 'border-cyber-border bg-cyber-surface/50 text-cyber-muted hover:border-cyber-muted'
              }`}
            >
              クラシック
              <div className="text-[10px] font-normal mt-0.5 opacity-70">AIディレクターモード</div>
            </button>
            <button
              onClick={() => setLocalGameMode('vibe-coding')}
              className={`flex-1 py-2.5 md:py-3 rounded-lg border font-mono font-bold text-sm transition-all ${
                localGameMode === 'vibe-coding'
                  ? 'border-cyber-accent bg-cyber-accent/20 text-cyber-accent'
                  : 'border-cyber-border bg-cyber-surface/50 text-cyber-muted hover:border-cyber-muted'
              }`}
            >
              バイブコーディング
              <div className="text-[10px] font-normal mt-0.5 opacity-70">気まぐれクライアントモード</div>
            </button>
          </div>

          {/* Difficulty / Vibe Level selector */}
          {localGameMode === 'classic' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full max-w-lg mb-2 md:mb-4">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDifficulty(opt.value)}
                  className={`px-2 md:px-3 py-2 md:py-3 rounded border text-sm font-mono transition-all ${
                    difficulty === opt.value
                      ? 'border-cyber-primary bg-cyber-primary/20 text-cyber-primary'
                      : 'border-cyber-border bg-cyber-surface/50 text-cyber-muted hover:border-cyber-muted'
                  }`}
                >
                  <div className="font-bold text-sm md:text-base">{opt.label}</div>
                  <div className="text-[10px] mt-1 opacity-70">{opt.description}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="w-full max-w-lg mb-2 md:mb-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyber-accent mb-2 text-left">
                クライアントモード選択
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {VIBE_CODING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setVibeCodingLevel(opt.value)}
                    className={`px-2 md:px-3 py-2 md:py-3 rounded border text-sm font-mono transition-all ${
                      vibeCodingLevel === opt.value
                        ? 'border-cyber-accent bg-cyber-accent/20 text-cyber-accent'
                        : 'border-cyber-border bg-cyber-surface/50 text-cyber-muted hover:border-cyber-muted'
                    }`}
                  >
                    <div className="font-bold text-sm md:text-base">{opt.label}</div>
                    <div className="text-[10px] mt-1 opacity-70">{opt.description}</div>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDifficulty(opt.value)}
                    className={`px-2 md:px-3 py-1.5 md:py-2 rounded border text-xs font-mono transition-all ${
                      difficulty === opt.value
                        ? 'border-cyber-primary bg-cyber-primary/20 text-cyber-primary'
                        : 'border-cyber-border bg-cyber-surface/50 text-cyber-muted hover:border-cyber-muted'
                    }`}
                  >
                    <div className="font-bold">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={startRound}
            className="group relative px-8 md:px-12 py-3 md:py-4 bg-transparent font-bold text-cyber-text dark:text-white uppercase tracking-widest overflow-hidden rounded-md border border-cyber-border hover:border-cyber-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isGenerating}
          >
            <div className={`absolute inset-0 w-0 transition-all duration-[250ms] ease-out group-hover:w-full opacity-20 ${
              localGameMode === 'vibe-coding' ? 'bg-cyber-accent' : 'bg-cyber-primary'
            }`}></div>
            <span className={`relative text-lg md:text-xl transition-colors ${
              localGameMode === 'vibe-coding' ? 'group-hover:text-cyber-accent' : 'group-hover:text-cyber-primary'
            }`}>
              {isGenerating
                ? '生成中...'
                : apiKey
                  ? localGameMode === 'vibe-coding' ? 'クライアントと接続する' : '接続を開始する'
                  : 'モックモードで開始'}
            </span>
          </button>

          <div className="mt-4 md:mt-8 flex flex-col items-center gap-2 max-w-sm w-full">
            <label className="text-xs text-cyber-muted uppercase tracking-wider font-mono">Gemini APIキー</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey || ''}
              onChange={(e) => useGameStore.getState().setApiKey(e.target.value)}
              className="w-full bg-cyber-surface border border-cyber-border rounded px-4 py-2 text-cyber-text text-sm font-mono focus:outline-none focus:border-cyber-primary bg-transparent"
            />
            <div className="text-[10px] text-cyber-muted/60 mt-1">※キーはブラウザにのみ保存されます</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBuild = () => (
    <div className="h-[100dvh] w-screen bg-cyber-background select-none flex flex-col md:flex-row overflow-hidden">
      <GameHUD onSubmit={gameMode === 'vibe-coding' ? handleVibeCodingSubmit : undefined} timerFrozen={timerFrozen} />
      {gameMode === 'vibe-coding' && <ClientInterruptionOverlay />}

      {showStartModal && directorPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className={`relative rounded-2xl border-2 backdrop-blur-md p-6 md:p-8 shadow-2xl max-w-md w-[90vw] animate-[slideUp_0.4s_ease-out] ${
            gameMode === 'vibe-coding'
              ? 'border-cyber-accent bg-cyber-accent/10'
              : 'border-cyber-primary bg-cyber-primary/10'
          }`}>
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyber-muted mb-4">
              {gameMode === 'vibe-coding' ? 'バイブコーディングモード' : 'クラシックモード'}
            </div>

            <div className="mb-4">
              <div className={`text-[10px] font-mono uppercase tracking-widest mb-2 ${
                gameMode === 'vibe-coding' ? 'text-cyber-accent' : 'text-cyber-primary'
              }`}>
                {gameMode === 'vibe-coding' ? 'クライアントからの最初の指示' : 'ディレクターからのお題'}
              </div>
              <p className="text-lg md:text-xl font-bold text-white leading-relaxed">
                「{directorPlan.vibe_prompt}」
              </p>
            </div>

            <div className="mb-6 p-3 rounded-lg bg-black/40 border border-cyber-border/50">
              <p className="text-xs text-cyber-muted leading-relaxed">
                {gameMode === 'vibe-coding'
                  ? <>制作中にクライアントから追加の指示が届きます。<br />指示が届くとタイマーが一時停止します。</>
                  : <>制限時間内に、この指示に合った3Dボクセル構造を構築してください。</>
                }
              </p>
            </div>

            <button
              onClick={dismissStartModal}
              className={`w-full py-3 rounded-lg font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2 ${
                gameMode === 'vibe-coding'
                  ? 'bg-cyber-accent hover:bg-cyber-accent/80 text-white'
                  : 'bg-cyber-primary hover:bg-cyber-primary/80 text-black'
              }`}
            >
              <Play size={16} />
              ゲームスタート
            </button>
          </div>
        </div>
      )}

      <div className="order-2 md:order-1 flex-1 flex flex-col items-center justify-center gap-4 p-2 pt-28 md:p-6 md:pt-32 min-h-0 overflow-y-auto md:w-[55%] md:flex-none">
        <SliceEditor
          activeLayer={activeLayer}
          setActiveLayer={setActiveLayer}
          activeColor={activeColor}
          activeType={activeType}
        />
        <Toolbar
          className="relative"
          activeColor={activeColor} setActiveColor={setActiveColor}
          activeType={activeType} setActiveType={setActiveType}
        />
      </div>

      <div className="order-1 md:order-2 h-[200px] md:h-full md:flex-1 relative">
        <Canvas camera={{ position: [8, 8, 8], fov: 40 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          <Environment preset="night" />
          <VoxelGrid activeColor={activeColor} activeType={activeType} readOnly highlightLayer={activeLayer} />
          <OrbitControls autoRotate autoRotateSpeed={2} makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.1} />
          <ContactShadows position={[0, -0.51, 0]} opacity={0.4} scale={20} blur={2} far={4} />
        </Canvas>
      </div>
    </div>
  );

  const renderReveal = () => {
    if (!directorPlan) return null;
    const scores = calculateScores(playerVoxels, directorPlan);
    const isVibeCoding = gameMode === 'vibe-coding';
    const interruptionHistory = isVibeCoding ? vibeCodingState?.interruptions : undefined;

    const finalVibeScore = aiEvalResult ? aiEvalResult.vibeScore : scores.vibeScore;
    const finalRationale = aiEvalResult ? aiEvalResult.rationale : 'AI解析を待機中...';

    const getGradeInfo = (score: number) => {
      if (score >= 95) return { letter: 'S', color: 'text-yellow-400', border: 'border-yellow-400', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.5)]', label: 'OUTSTANDING', glitch: true };
      if (score >= 80) return { letter: 'A', color: 'text-cyber-primary', border: 'border-cyber-primary', glow: 'shadow-[0_0_15px_rgba(255,107,0,0.5)]', label: 'EXCELLENT', glitch: false };
      if (score >= 60) return { letter: 'B', color: 'text-cyber-accent', border: 'border-cyber-accent', glow: 'shadow-[0_0_10px_rgba(8,145,178,0.5)]', label: 'GOOD', glitch: false };
      if (score >= 40) return { letter: 'C', color: 'text-cyber-secondary', border: 'border-cyber-secondary', glow: '', label: 'AVERAGE', glitch: false };
      return { letter: 'F', color: 'text-red-500', border: 'border-red-500', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]', label: 'POOR', glitch: false };
    };

    const grade = getGradeInfo(finalVibeScore);

    return (
      <div className="min-h-[100dvh] w-screen flex flex-col bg-cyber-background text-cyber-text dark:text-white overflow-y-auto animate-slide-up">
        <div className="p-4 md:p-8 pb-2 md:pb-4 text-center border-b border-cyber-border bg-white/50 dark:bg-black/50 backdrop-blur-sm relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-b ${isVibeCoding ? 'from-cyber-accent/10' : 'from-cyber-primary/10'} to-transparent pointer-events-none`}></div>
          <h1 className={`text-2xl md:text-5xl font-black uppercase tracking-[0.2em] animate-pulse-glow relative z-10 ${isVibeCoding ? 'text-cyber-accent' : 'text-cyber-primary'}`}>
            {isVibeCoding ? 'バイブコーディング完了' : '解析完了'}
          </h1>
          <p className="text-cyber-accent mt-2 md:mt-3 font-mono text-sm md:text-lg tracking-wider relative z-10">
            {isVibeCoding ? `初期お題: 「${directorPlan.vibe_prompt}」` : `お題: 「${directorPlan.vibe_prompt}」`}
          </p>
          <div className="absolute top-0 right-0 p-4 opacity-20 font-mono text-xs hidden md:block">VIBE_SYS_EVAL_v2.5</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 flex-grow bg-cyber-background">
          <div className="relative border-b lg:border-b-0 lg:border-r border-cyber-border/50 flex flex-col">
            <div className="absolute top-2 left-2 md:top-6 md:left-6 z-10 flex items-center gap-2 bg-white/60 dark:bg-black/60 px-3 py-1 border border-black/10 dark:border-white/10 rounded-full shadow-lg backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-cyber-text dark:bg-white opacity-50"></div>
              <span className="font-mono font-bold text-xs md:text-sm text-cyber-text/70 dark:text-white/70 uppercase tracking-widest">あなたの構築</span>
            </div>
            <div className="flex-grow min-h-[300px] md:min-h-[400px]">
              <Canvas camera={{ position: [6, 6, 6], fov: 40 }} gl={{ preserveDrawingBuffer: true }} onCreated={({ gl }) => {
                if (!aiEvalResult && apiKey && !isEvaluating) {
                  setIsEvaluating(true);
                  setTimeout(() => {
                    const base64 = gl.domElement.toDataURL('image/png');
                    evaluateWithGemini(apiKey, base64, directorPlan.vibe_prompt, interruptionHistory)
                      .then(result => setAiEvalResult(result))
                      .catch(e => console.error(e))
                      .finally(() => setIsEvaluating(false));
                  }, 500);
                }
              }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} />
                <Environment preset="night" />
                <VoxelGrid activeColor="#fff" activeType="standard" readOnly voxels={playerVoxels} />
                <OrbitControls autoRotate autoRotateSpeed={2} />
              </Canvas>
            </div>
          </div>

          {isVibeCoding ? (
            <div className="relative flex flex-col h-full">
              <div className="flex border-b border-cyber-border">
                <button
                  onClick={() => setRevealTab('timeline')}
                  className={`flex-1 py-2.5 text-xs md:text-sm font-mono font-bold uppercase tracking-widest transition-colors ${
                    revealTab === 'timeline'
                      ? 'text-cyber-accent border-b-2 border-cyber-accent bg-cyber-accent/10'
                      : 'text-cyber-muted hover:text-white'
                  }`}
                >
                  指示タイムライン
                </button>
                <button
                  onClick={() => setRevealTab('model')}
                  className={`flex-1 py-2.5 text-xs md:text-sm font-mono font-bold uppercase tracking-widest transition-colors ${
                    revealTab === 'model'
                      ? 'text-cyber-accent border-b-2 border-cyber-accent bg-cyber-accent/10'
                      : 'text-cyber-muted hover:text-white'
                  }`}
                >
                  ディレクターの理想
                </button>
              </div>
              {revealTab === 'timeline' ? (
                <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                  <div className="space-y-2">
                    <div className="p-2 md:p-3 rounded-lg border border-cyber-border">
                      <span className="text-cyber-muted font-mono text-[10px] md:text-xs">0:00</span>
                      <span className="ml-2 text-white text-xs md:text-sm">初期: 「{directorPlan.vibe_prompt}」</span>
                    </div>
                    {vibeCodingState?.interruptions.map((intr, i) => (
                      <div key={intr.id} className={`p-2 md:p-3 rounded-lg border text-xs md:text-sm ${moodColors[intr.mood]} ${moodBg[intr.mood]}`}>
                        <span className="text-cyber-muted font-mono text-[10px] md:text-xs">
                          {Math.floor(intr.timestamp / 60)}:{(intr.timestamp % 60).toString().padStart(2, '0')}
                        </span>
                        <span className="ml-2 text-white">「{intr.message}」</span>
                        {i === (vibeCodingState?.interruptions.length ?? 0) - 1 && (
                          <span className="ml-1 text-[10px] text-cyber-accent font-mono">← 最終指示</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-grow min-h-[300px] md:min-h-[400px]">
                  <Canvas camera={{ position: [6, 6, 6], fov: 40 }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1.5} />
                    <Environment preset="city" />
                    <VoxelGrid activeColor="#fff" activeType="standard" readOnly voxels={directorPlan.voxels} />
                    <OrbitControls autoRotate autoRotateSpeed={2} />
                  </Canvas>
                </div>
              )}
            </div>
          ) : (
            <div className="relative flex flex-col">
              <div className="absolute top-2 left-2 md:top-6 md:left-6 z-10 font-mono font-bold text-sm md:text-xl text-cyber-accent">ディレクターの理想</div>
              <div className="flex-grow min-h-[200px] md:min-h-[400px]">
                <Canvas camera={{ position: [6, 6, 6], fov: 40 }}>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[10, 10, 5]} intensity={1.5} />
                  <Environment preset="city" />
                  <VoxelGrid activeColor="#fff" activeType="standard" readOnly voxels={directorPlan.voxels} />
                  <OrbitControls autoRotate autoRotateSpeed={2} />
                </Canvas>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 md:p-8 border-t border-cyber-border bg-white/80 dark:bg-black/80 backdrop-blur-md grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 items-center relative z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          {isVibeCoding ? (
            <div className="col-span-2 lg:col-span-1 p-4 md:p-6 rounded-xl border border-cyber-border bg-cyber-surface/40 text-center flex flex-col justify-center items-center shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 dark:from-white/5 to-transparent pointer-events-none group-hover:from-black/10 dark:group-hover:from-white/10 transition-colors"></div>
              <div className="text-xs md:text-sm font-mono text-cyber-accent/80 uppercase tracking-widest mb-1 md:mb-2 z-10">仕様変更回数</div>
              <div className="text-4xl md:text-5xl font-black text-cyber-accent tracking-tighter z-10">{vibeCodingState?.interruptionCount ?? 0}</div>
            </div>
          ) : (
            <div className="col-span-2 lg:col-span-1 p-4 md:p-6 rounded-xl border border-cyber-border bg-cyber-surface/40 text-center flex flex-col justify-center items-center shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 dark:from-white/5 to-transparent pointer-events-none group-hover:from-black/10 dark:group-hover:from-white/10 transition-colors"></div>
              <div className="text-xs md:text-sm font-mono text-cyan-600 dark:text-cyan-500/80 uppercase tracking-widest mb-1 md:mb-2 z-10">構造一致</div>
              <div className="text-4xl md:text-5xl font-black text-cyber-text dark:text-white tracking-tighter z-10">{scores.structureScore}<span className="text-xl md:text-2xl text-cyber-muted">%</span></div>
            </div>
          )}

          <div className={`col-span-2 lg:col-span-1 p-4 md:p-6 rounded-xl border bg-cyber-surface/60 text-center relative overflow-hidden transition-all duration-700 ${aiEvalResult ? grade.border + ' ' + (grade.glow ? 'dark:' + grade.glow : '') : 'border-cyber-border'}`}>
            {isEvaluating && (
              <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-20">
                <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-cyber-accent border-t-transparent rounded-full animate-spin mb-3 shadow-[0_0_15px_rgba(8,145,178,0.5)]"></div>
                <div className="text-[10px] md:text-xs font-mono font-bold text-cyber-accent tracking-widest animate-pulse">VIBE SCANNING...</div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-black/5 dark:from-white/5 to-transparent pointer-events-none"></div>
            <div className="text-xs md:text-sm font-mono text-cyber-primary/80 uppercase tracking-widest mb-1 md:mb-2 z-10 bg-black/5 dark:bg-black/40 inline-block px-2 py-0.5 rounded border border-black/5 dark:border-white/5">Vibe適合度</div>
            <div className={`text-5xl md:text-6xl font-black z-10 transition-colors duration-500 block mt-2 ${aiEvalResult ? grade.color : 'text-cyber-muted'} ${grade.glitch && aiEvalResult ? 'animate-pulse-glow' : ''}`}>
              {finalVibeScore}<span className="text-2xl text-cyber-muted ml-0.5">%</span>
            </div>
            {aiEvalResult && (
              <div className={`absolute top-2 right-2 md:top-3 md:right-3 w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center font-black text-lg md:text-xl ${grade.color} ${grade.border} bg-white dark:bg-black z-10 transform rotate-12 ${grade.glitch ? 'animate-glitch' : ''}`}>
                {grade.letter}
              </div>
            )}
          </div>

          <div className="col-span-2 lg:col-span-2 flex flex-col gap-3 h-full justify-between animate-slide-up-delayed">
            <div className="p-4 md:p-5 rounded-lg bg-gray-100 dark:bg-[#111] border border-cyber-border relative flex-grow flex flex-col justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMxMTEiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMzMzIi8+PC9zdmc+')] opacity-10 dark:opacity-50 pointer-events-none"></div>
              <div className="absolute top-0 right-0 p-2 opacity-30">
                <div className={`w-1.5 h-1.5 rounded-full ${isVibeCoding ? 'bg-cyber-accent' : 'bg-cyber-primary'} animate-ping`}></div>
              </div>
              <div className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-gray-500 dark:text-[#888] font-bold mb-2 flex items-center gap-2 relative z-10">
                <span className={`w-2 h-2 inline-block ${isVibeCoding ? 'bg-cyber-accent/70' : 'bg-cyber-primary/70'}`}></span>
                {isVibeCoding ? 'クライアントの感想' : 'ディレクター解析レポート'}
              </div>
              <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 font-medium leading-relaxed bg-white/60 dark:bg-black/60 p-3 rounded border border-black/10 dark:border-white/10 font-mono shadow-inner relative z-10 min-h-[60px] flex items-center">
                {isEvaluating ? (
                  <span className="animate-pulse text-cyber-accent tracking-widest text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyber-accent rounded-full inline-block"></span>
                    AI審査官が解析中...
                  </span>
                ) : (
                  <span><span className={`${isVibeCoding ? 'text-cyber-accent' : 'text-cyber-primary'} mr-2`}>{'>'}</span>{finalRationale}</span>
                )}
              </p>
            </div>

            <button
              onClick={() => {
                setAiEvalResult(null);
                resetVibeCodingState();
                setPhase('title');
              }}
              className="group relative w-full py-4 bg-transparent border-2 border-cyber-muted hover:border-cyber-primary text-cyber-muted hover:text-white uppercase font-black tracking-[0.3em] overflow-hidden rounded transition-all duration-300 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-cyber-primary/50 flex flex-col items-center justify-center"
            >
              <div className="absolute inset-0 w-0 transition-all duration-300 ease-out group-hover:w-full opacity-30 bg-cyber-primary"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0">←</span> コアシステムへ帰還
              </span>
              <div className="absolute bottom-1 right-2 text-[8px] font-mono text-cyber-muted/50 group-hover:text-cyber-primary/50 transition-colors">INITIATE_REBOOT</div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {phase === 'title' && renderTitle()}
      {phase === 'build' && renderBuild()}
      {phase === 'reveal' && renderReveal()}
    </>
  );
}

function App() {
  const [route] = useHashRoute();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('vibe-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('vibe-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <>
      <ThemeToggle theme={theme} toggle={toggleTheme} />
      {route === 'game' ? <Game /> : <Teaser />}
    </>
  );
}

export default App;
