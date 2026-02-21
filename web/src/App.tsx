import { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { useGameStore } from './store/gameStore';
import { generateGeminiDirectorPlan, DIFFICULTY_OPTIONS, type DifficultyLevel } from './lib/geminiDirector';
import { generateMockDirectorPlan } from './lib/mockDirector';
import { calculateScores } from './lib/scoring';
import { evaluateWithGemini } from './lib/geminiJudge';
import { VoxelGrid } from './components/3d/VoxelGrid';
import { Toolbar } from './components/ui/Toolbar';
import { GameHUD } from './components/ui/GameHUD';
import { SliceEditor } from './components/ui/SliceEditor';
import Teaser from './pages/Teaser';
import type { VoxelType } from './store/types';

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

function Game() {
  const { phase, setPhase, setDirectorPlan, setTimeRemaining, directorPlan, playerVoxels, apiKey } = useGameStore();

  const [activeColor, setActiveColor] = useState('#EF4444');
  const [activeType, setActiveType] = useState<VoxelType>('standard');
  const [activeLayer, setActiveLayer] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiEvalResult, setAiEvalResult] = useState<{ vibeScore: number, rationale: string } | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('concrete');

  useEffect(() => {
    document.body.classList.add('game-mode');
    return () => document.body.classList.remove('game-mode');
  }, []);

  const startRound = async () => {
    setIsGenerating(true);
    try {
      const plan = apiKey
        ? await generateGeminiDirectorPlan(apiKey, difficulty)
        : generateMockDirectorPlan();
      setDirectorPlan(plan);
      setTimeRemaining(120);
      setPhase('build');
    } catch (e) {
      console.error(e);
      const plan = generateMockDirectorPlan();
      setDirectorPlan(plan);
      setTimeRemaining(120);
      setPhase('build');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderTitle = () => (
    <div className="min-h-[100dvh] w-screen flex flex-col items-center justify-center bg-cyber-background text-white p-4 md:p-6 relative overflow-y-auto">
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyber-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-cyber-secondary/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="z-10 text-center max-w-2xl py-8 md:py-0">
        <h1 className="text-5xl md:text-8xl font-black mb-4 md:mb-6 tracking-tighter">
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-cyber-muted">VIBE</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyber-primary to-cyber-accent">ARCHITECT</span>
        </h1>

        <p className="text-sm md:text-xl text-cyber-muted mb-6 md:mb-12 font-mono leading-relaxed">
          AIディレクターが生成する「直感や雰囲気」を表現する3Dボクセル構築テスト。<br />
          制限時間内に、その抽象的な指示を3D構造へと変換するのがあなたの任務です。
        </p>

        <div className="flex flex-col gap-3 md:gap-4 items-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full max-w-lg mb-2 md:mb-4">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDifficulty(opt.value)}
                className={`px-2 md:px-3 py-2 md:py-3 rounded border text-sm font-mono transition-all ${difficulty === opt.value
                    ? 'border-cyber-primary bg-cyber-primary/20 text-cyber-primary'
                    : 'border-cyber-border bg-cyber-surface/50 text-cyber-muted hover:border-cyber-muted'
                  }`}
              >
                <div className="font-bold text-sm md:text-base">{opt.label}</div>
                <div className="text-[10px] mt-1 opacity-70">{opt.description}</div>
              </button>
            ))}
          </div>

          <button
            onClick={startRound}
            className="group relative px-8 md:px-12 py-3 md:py-4 bg-transparent font-bold text-white uppercase tracking-widest overflow-hidden rounded-md border border-cyber-border hover:border-cyber-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isGenerating}
          >
            <div className="absolute inset-0 w-0 transition-all duration-[250ms] ease-out group-hover:w-full opacity-20 bg-cyber-primary"></div>
            <span className="relative text-lg md:text-xl transition-colors group-hover:text-cyber-primary">
              {isGenerating
                ? '生成中...'
                : apiKey
                  ? '接続を開始する'
                  : 'モックモードで開始'}
            </span>
          </button>

          <div className="mt-4 md:mt-8 flex flex-col items-center gap-2 max-w-sm w-full">
            <label className="text-xs text-cyber-muted uppercase tracking-wider font-mono">Gemini API Key</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey || ''}
              onChange={(e) => useGameStore.getState().setApiKey(e.target.value)}
              className="w-full bg-cyber-surface border border-cyber-border rounded px-4 py-2 text-cyber-text text-sm font-mono focus:outline-none focus:border-cyber-primary"
            />
            <div className="text-[10px] text-cyber-muted/60 mt-1">※キーはブラウザにのみ保存されます</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBuild = () => (
    <div className="h-[100dvh] w-screen bg-cyber-background select-none flex flex-col md:flex-row overflow-hidden">
      <GameHUD />

      <div className="order-2 md:order-1 flex-1 flex flex-col items-center gap-2 p-2 md:p-6 min-h-0 overflow-y-auto md:w-[55%] md:flex-none">
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

      <div className="order-1 md:order-2 h-[30dvh] md:h-full md:flex-1 relative flex-shrink-0">
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

    const finalVibeScore = aiEvalResult ? aiEvalResult.vibeScore : scores.vibeScore;
    const finalRationale = aiEvalResult ? aiEvalResult.rationale : 'AI解析を待機中...';

    return (
      <div className="min-h-[100dvh] w-screen flex flex-col bg-cyber-background text-white overflow-y-auto">
        <div className="p-4 md:p-8 pb-2 md:pb-4 text-center border-b border-cyber-border">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-cyber-primary">解析完了</h1>
          <p className="text-cyber-muted mt-1 md:mt-2 font-mono text-sm md:text-base">お題: 「{directorPlan.vibe_prompt}」</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-2 flex-grow">
          <div className="relative border-r border-cyber-border/50 flex flex-col">
            <div className="absolute top-2 left-2 md:top-6 md:left-6 z-10 font-mono font-bold text-sm md:text-xl text-white/50">あなたの構築</div>
            <div className="flex-grow min-h-[200px] md:min-h-[400px]">
              <Canvas camera={{ position: [6, 6, 6], fov: 40 }} gl={{ preserveDrawingBuffer: true }} onCreated={({ gl }) => {
                if (!aiEvalResult && apiKey && !isEvaluating) {
                  setIsEvaluating(true);
                  setTimeout(() => {
                    const base64 = gl.domElement.toDataURL('image/png');
                    evaluateWithGemini(apiKey, base64, directorPlan.vibe_prompt)
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
        </div>

        <div className="p-4 md:p-8 border-t border-cyber-border bg-cyber-surface/50 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8 items-center">
          <div className="p-3 md:p-6 rounded-xl border border-cyber-border bg-black/40 text-center">
            <div className="text-[10px] md:text-sm font-mono text-cyber-muted uppercase tracking-widest mb-1 md:mb-2">構造一致</div>
            <div className="text-4xl md:text-6xl font-black text-white">{scores.structureScore}%</div>
          </div>

          <div className="p-3 md:p-6 rounded-xl border border-cyber-border bg-black/40 text-center relative overflow-hidden">
            {isEvaluating && (
              <div className="absolute inset-0 bg-cyber-surface/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="w-6 h-6 md:w-8 md:h-8 border-4 border-cyber-secondary border-t-transparent rounded-full animate-spin mb-2"></div>
                <div className="text-[10px] md:text-xs font-bold text-cyber-secondary animate-pulse">解析中...</div>
              </div>
            )}
            <div className="text-[10px] md:text-sm font-mono text-cyber-muted uppercase tracking-widest mb-1 md:mb-2">Vibe適合度</div>
            <div className="text-4xl md:text-6xl font-black text-cyber-secondary">{finalVibeScore}%</div>
          </div>

          <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
            <div className="p-3 md:p-4 rounded-lg bg-cyber-primary/10 border border-cyber-primary/30">
              <div className="text-[10px] md:text-xs uppercase tracking-widest text-cyber-primary font-bold mb-1 md:mb-2">ディレクターによる解析</div>
              <p className="text-xs md:text-sm text-cyber-text/80 italic">
                {isEvaluating ? "Gemini Visionで解析中..." : `「${finalRationale}」`}
              </p>
            </div>
            <button
              onClick={() => {
                setAiEvalResult(null);
                setPhase('title');
              }}
              className="w-full py-3 md:py-4 bg-cyber-border hover:bg-cyber-muted text-white uppercase font-bold tracking-widest rounded transition-colors text-sm md:text-base"
            >
              コアへ戻る
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

  if (route === 'game') {
    return <Game />;
  }

  return <Teaser />;
}

export default App;
