import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { useGameStore } from './store/gameStore';
import { generateMockDirectorPlan } from './lib/mockDirector';
import { calculateScores } from './lib/scoring';
import { VoxelGrid } from './components/3d/VoxelGrid';
import { Toolbar } from './components/ui/Toolbar';
import { GameHUD } from './components/ui/GameHUD';
import type { VoxelType } from './store/types';

function App() {
  const { phase, setPhase, setDirectorPlan, setTimeRemaining, directorPlan, playerVoxels } = useGameStore();

  const [activeColor, setActiveColor] = useState('#FF3B30');
  const [activeType, setActiveType] = useState<VoxelType>('standard');

  const startRound = () => {
    setDirectorPlan(generateMockDirectorPlan());
    setTimeRemaining(120);
    setPhase('build');
  };

  const renderTitle = () => (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-cyber-background text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E2D3D22_1px,transparent_1px),linear-gradient(to_bottom,#1E2D3D22_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="z-10 text-center animate-fade-in-up">
        <h2 className="text-cyber-primary font-mono tracking-[0.3em] uppercase mb-4 text-sm font-bold">LLM → Human Project</h2>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-r from-white via-cyber-text to-cyber-muted bg-clip-text text-transparent">
          VIBE <br /> ARCHITECT
        </h1>
        <p className="max-w-md mx-auto text-cyber-muted text-lg mb-12">
          AIディレクターが提示する「バイブス（雰囲気）」を感知せよ。
          制限時間内に、その抽象的な指示を3D構造へと変換するのがあなたの任務です。
        </p>

        <button
          onClick={startRound}
          className="group relative px-12 py-4 bg-transparent font-bold text-white uppercase tracking-widest overflow-hidden rounded-md border border-cyber-border hover:border-cyber-primary transition-colors"
        >
          <div className="absolute inset-0 w-0 bg-cyber-primary transition-all duration-[250ms] ease-out group-hover:w-full opacity-20"></div>
          <span className="relative text-xl group-hover:text-cyber-primary transition-colors">接続を開始する</span>
        </button>
      </div>
    </div>
  );

  const renderBuild = () => (
    <div className="h-screen w-screen bg-cyber-background relative select-none">
      <Canvas camera={{ position: [8, 8, 8], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <Environment preset="night" />

        <VoxelGrid activeColor={activeColor} activeType={activeType} />

        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.1} />
        <ContactShadows position={[0, -0.51, 0]} opacity={0.4} scale={20} blur={2} far={4} />
      </Canvas>
      <GameHUD />
      <div className="absolute bottom-6 left-6 text-cyber-muted text-sm font-mono opacity-60 pointer-events-none">
        左クリック: ブロックを配置<br />
        右クリック: ブロックを削除<br />
        ドラッグ: カメラを回転
      </div>
      <Toolbar
        activeColor={activeColor} setActiveColor={setActiveColor}
        activeType={activeType} setActiveType={setActiveType}
      />
    </div>
  );

  const renderReveal = () => {
    if (!directorPlan) return null;
    const scores = calculateScores(playerVoxels, directorPlan);

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
              <Canvas camera={{ position: [6, 6, 6], fov: 40 }}>
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

          <div className="p-6 rounded-xl border border-cyber-border bg-black/40 text-center">
            <div className="text-sm font-mono text-cyber-muted uppercase tracking-widest mb-2">Vibe適合度 (AI評価)</div>
            <div className="text-6xl font-black text-cyber-secondary">{scores.vibeScore}%</div>
          </div>

          <div className="flex flex-col h-full justify-between">
            <div className="p-4 rounded-lg bg-cyber-primary/10 border border-cyber-primary/30">
              <div className="text-xs uppercase tracking-widest text-cyber-primary font-bold mb-2">ディレクターによる解析</div>
              <p className="text-sm text-cyber-text/80 italic">「{scores.rationale}」</p>
            </div>
            <button
              onClick={() => setPhase('title')}
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
