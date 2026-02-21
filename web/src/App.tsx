import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { useGameStore } from './store/gameStore';
import { generateGeminiDirectorPlan } from './lib/geminiDirector';
import { calculateScores } from './lib/scoring';
import { evaluateWithGemini } from './lib/geminiJudge';
import { VoxelGrid } from './components/3d/VoxelGrid';
import { Toolbar } from './components/ui/Toolbar';
import { GameHUD } from './components/ui/GameHUD';
import type { VoxelType } from './store/types';

function App() {
  const { phase, setPhase, setDirectorPlan, setTimeRemaining, directorPlan, playerVoxels, apiKey } = useGameStore();

  const [activeColor, setActiveColor] = useState('#FF3B30');
  const [activeType, setActiveType] = useState<VoxelType>('standard');
  const [isGenerating, setIsGenerating] = useState(false);

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiEvalResult, setAiEvalResult] = useState<{ vibeScore: number, rationale: string } | null>(null);

  const startRound = async () => {
    if (!apiKey) return;

    setIsGenerating(true);
    try {
      const plan = await generateGeminiDirectorPlan(apiKey);
      setDirectorPlan(plan);
      setTimeRemaining(120);
      setPhase('build');
    } catch (e) {
      console.error(e);
      alert("Failed to connect to AI Director. Check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderTitle = () => (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-cyber-background text-white p-6 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyber-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-cyber-secondary/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="z-10 text-center max-w-2xl">
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-cyber-muted">VIBE</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyber-primary to-cyber-accent">ARCHITECT</span>
        </h1>

        <p className="text-lg md:text-xl text-cyber-muted mb-12 font-mono leading-relaxed">
          AIディレクターが生成する「直感や雰囲気」を表現する3Dボクセル構築テスト。<br />
          制限時間内に、その抽象的な指示を3D構造へと変換するのがあなたの任務です。
        </p>

        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={startRound}
            className="group relative px-12 py-4 bg-transparent font-bold text-white uppercase tracking-widest overflow-hidden rounded-md border border-cyber-border hover:border-cyber-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!useGameStore.getState().apiKey || isGenerating}
          >
            <div className={`absolute inset-0 w-0 transition-all duration-[250ms] ease-out group-hover:w-full opacity-20 ${useGameStore.getState().apiKey ? 'bg-cyber-primary' : 'bg-transparent'}`}></div>
            <span className={`relative text-xl transition-colors ${useGameStore.getState().apiKey ? 'group-hover:text-cyber-primary' : 'text-cyber-muted'}`}>
              {!useGameStore.getState().apiKey
                ? 'APIキーが必要です'
                : isGenerating
                  ? 'リンク生成中...'
                  : '接続を開始する'}
            </span>
          </button>

          <div className="mt-8 flex flex-col items-center gap-2 max-w-sm w-full">
            <label className="text-xs text-cyber-muted uppercase tracking-wider font-mono">Gemini API Key</label>
            <input
              type="password"
              placeholder="AI_zaSy..."
              defaultValue={useGameStore.getState().apiKey || ''}
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
    <div className="h-screen w-screen relative bg-cyber-background overflow-hidden flex flex-col">
      <GameHUD />
      <div className="flex-grow relative">
        <Canvas camera={{ position: [8, 8, 8], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          <Environment preset="city" />

          <VoxelGrid
            activeColor={activeColor}
            activeType={activeType}
            voxels={playerVoxels}
          />

          <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={20} blur={2} />
          <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.1} />
        </Canvas>
      </div>
      <Toolbar
        activeColor={activeColor}
        setActiveColor={setActiveColor}
        activeType={activeType}
        setActiveType={setActiveType}
      />
    </div>
  );

  const renderReveal = () => {
    if (!directorPlan) return null;
    const scores = calculateScores(playerVoxels, directorPlan);

    // Override the mock rationale with the AI rationale if we have it
    const finalVibeScore = aiEvalResult ? aiEvalResult.vibeScore : scores.vibeScore;
    const finalRationale = aiEvalResult ? aiEvalResult.rationale : scores.rationale;

    return (
      <div className="h-screen w-screen flex flex-col bg-cyber-background text-white overflow-y-auto">
        <div className="p-8 pb-4 text-center border-b border-cyber-border">
          <h1 className="text-4xl font-black uppercase tracking-widest text-cyber-primary">解析完了</h1>
          <p className="text-cyber-muted mt-2 font-mono">お題: 「{directorPlan.vibe_prompt}」</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 flex-grow">
          {/* Player Result */}
          <div className="relative border-r border-cyber-border/50 flex flex-col">
            <div className="absolute top-6 left-6 z-10 font-mono font-bold text-xl text-white/50">あなたの構築</div>
            <div className="flex-grow min-h-[400px]">
              <Canvas camera={{ position: [6, 6, 6], fov: 40 }} gl={{ preserveDrawingBuffer: true }} onCreated={({ gl }) => {
                // If we haven't evaluated yet and we have an API key, trigger it
                if (!aiEvalResult && apiKey && !isEvaluating) {
                  setIsEvaluating(true);
                  // small delay to ensure render is done
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

          {/* Director's Hidden Intent */}
          <div className="relative flex flex-col">
            <div className="absolute top-6 left-6 z-10 font-mono font-bold text-xl text-cyber-accent">ディレクターの理想</div>
            <div className="flex-grow min-h-[400px]">
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

        <div className="p-8 border-t border-cyber-border bg-cyber-surface/50 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="p-6 rounded-xl border border-cyber-border bg-black/40 text-center">
            <div className="text-sm font-mono text-cyber-muted uppercase tracking-widest mb-2">構造一致スコア</div>
            <div className="text-6xl font-black text-white">{scores.structureScore}%</div>
          </div>

          <div className="p-6 rounded-xl border border-cyber-border bg-black/40 text-center relative overflow-hidden">
            {isEvaluating && (
              <div className="absolute inset-0 bg-cyber-surface/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="w-8 h-8 border-4 border-cyber-secondary border-t-transparent rounded-full animate-spin mb-2"></div>
                <div className="text-xs font-bold text-cyber-secondary animate-pulse">VISION 解析中...</div>
              </div>
            )}
            <div className="text-sm font-mono text-cyber-muted uppercase tracking-widest mb-2">Vibe適合度 (AI評価)</div>
            <div className="text-6xl font-black text-cyber-secondary">{finalVibeScore}%</div>
          </div>

          <div className="flex flex-col h-full justify-between">
            <div className="p-4 rounded-lg bg-cyber-primary/10 border border-cyber-primary/30">
              <div className="text-xs uppercase tracking-widest text-cyber-primary font-bold mb-2">ディレクターによる解析</div>
              <p className="text-sm text-cyber-text/80 italic">
                {isEvaluating ? "視覚データをGemini Pro Visionモデルに送信中..." : `「${finalRationale}」`}
              </p>
            </div>
            <button
              onClick={() => {
                setAiEvalResult(null);
                setPhase('title');
              }}
              className="mt-4 w-full py-4 bg-cyber-border hover:bg-cyber-muted text-white uppercase font-bold tracking-widest rounded transition-colors"
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

export default App;
