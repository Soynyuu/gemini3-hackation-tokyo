import { ChevronUp, ChevronDown } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import type { Voxel, VoxelType, Vector3 } from '../../store/types';

interface SliceEditorProps {
  activeLayer: number;
  setActiveLayer: (layer: number) => void;
  activeColor: string;
  activeType: VoxelType;
}

const GRID_SIZE = 5;

function cellStyle(voxel: Voxel | undefined, ghost: Voxel | undefined): React.CSSProperties {
  if (voxel) {
    const base: React.CSSProperties = {
      backgroundColor: voxel.color,
    };
    if (voxel.type === 'emissive') {
      base.boxShadow = `0 0 12px ${voxel.color}, inset 0 0 6px rgba(255,255,255,0.3)`;
    }
    if (voxel.type === 'transparent') {
      base.opacity = 0.55;
      base.backgroundImage =
        'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.12) 3px, rgba(255,255,255,0.12) 6px)';
    }
    return base;
  }
  if (ghost) {
    return {
      backgroundColor: ghost.color,
      opacity: 0.15,
    };
  }
  return {};
}

export const SliceEditor = ({
  activeLayer,
  setActiveLayer,
  activeColor,
  activeType,
}: SliceEditorProps) => {
  const playerVoxels = useGameStore((s) => s.playerVoxels);
  const addVoxel = useGameStore((s) => s.addVoxel);
  const removeVoxel = useGameStore((s) => s.removeVoxel);

  const voxelAt = (x: number, y: number, z: number): Voxel | undefined =>
    playerVoxels.find((v) => v.pos[0] === x && v.pos[1] === y && v.pos[2] === z);

  const ghostBelow = (x: number, z: number): Voxel | undefined => {
    if (activeLayer > 0) return voxelAt(x, activeLayer - 1, z);
    return undefined;
  };

  const ghostAbove = (x: number, z: number): Voxel | undefined => {
    if (activeLayer < GRID_SIZE - 1) return voxelAt(x, activeLayer + 1, z);
    return undefined;
  };

  const handleCellClick = (x: number, z: number) => {
    const existing = voxelAt(x, activeLayer, z);
    if (existing) {
      removeVoxel(existing.pos);
    } else {
      const pos: Vector3 = [x, activeLayer, z];
      addVoxel({ pos, color: activeColor, type: activeType });
    }
  };

  const layerCount = playerVoxels.filter((v) => v.pos[1] === activeLayer).length;
  const totalCount = playerVoxels.length;

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveLayer(Math.min(GRID_SIZE - 1, activeLayer + 1))}
          disabled={activeLayer >= GRID_SIZE - 1}
          className="p-1.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-muted hover:text-cyber-text dark:hover:text-white hover:border-cyber-primary disabled:opacity-30 disabled:hover:text-cyber-muted disabled:hover:border-cyber-border transition-colors"
        >
          <ChevronUp size={18} />
        </button>

        <div className="flex gap-1">
          {Array.from({ length: GRID_SIZE }, (_, i) => (
            <button
              key={i}
              onClick={() => setActiveLayer(i)}
              className={`w-8 h-8 rounded-md text-xs font-mono font-bold transition-all ${activeLayer === i
                  ? 'bg-cyber-primary text-black scale-110'
                  : 'bg-cyber-surface border border-cyber-border text-cyber-muted hover:text-cyber-text dark:hover:text-white hover:border-cyber-primary'
                }`}
            >
              {i}
            </button>
          ))}
        </div>

        <button
          onClick={() => setActiveLayer(Math.max(0, activeLayer - 1))}
          disabled={activeLayer <= 0}
          className="p-1.5 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-muted hover:text-cyber-text dark:hover:text-white hover:border-cyber-primary disabled:opacity-30 disabled:hover:text-cyber-muted disabled:hover:border-cyber-border transition-colors"
        >
          <ChevronDown size={18} />
        </button>

        <span className="text-xs font-mono text-cyber-muted ml-2">
          Y={activeLayer}
        </span>
      </div>

      <div className="relative">
        <div className="absolute -top-5 left-0 right-0 flex justify-between px-[10px]">
          {Array.from({ length: GRID_SIZE }, (_, i) => (
            <span key={i} className="text-[10px] font-mono text-cyber-muted/50 w-[calc(100%/5)] text-center">
              {i}
            </span>
          ))}
        </div>
        <div className="absolute -left-5 top-0 bottom-0 flex flex-col justify-between py-[10px]">
          {Array.from({ length: GRID_SIZE }, (_, i) => (
            <span key={i} className="text-[10px] font-mono text-cyber-muted/50 h-[calc(100%/5)] flex items-center">
              {i}
            </span>
          ))}
        </div>

        <div
          className="grid gap-[2px] p-[2px] rounded-lg bg-cyber-surface/60 border border-cyber-border"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            width: 'min(280px, calc(100vw - 80px))',
            aspectRatio: '1',
          }}
        >
          {Array.from({ length: GRID_SIZE }, (_, z) =>
            Array.from({ length: GRID_SIZE }, (_, x) => {
              const current = voxelAt(x, activeLayer, z);
              const below = ghostBelow(x, z);
              const above = ghostAbove(x, z);
              const ghost = below ?? above;
              const hasCurrent = !!current;

              return (
                <button
                  key={`${x}-${z}`}
                  onClick={() => handleCellClick(x, z)}
                  className={`rounded-sm transition-all duration-100 border ${hasCurrent
                      ? 'border-black/20 dark:border-white/20 hover:border-black/50 dark:hover:border-white/50'
                      : ghost
                        ? 'border-cyber-border/50 hover:border-cyber-primary/50'
                        : 'border-transparent hover:border-cyber-primary/30'
                    }`}
                  style={cellStyle(current, ghost)}
                  title={`[${x}, ${activeLayer}, ${z}]${hasCurrent ? ` ${current!.type}` : ''}`}
                />
              );
            }),
          )}
        </div>

        <div className="absolute -bottom-1 right-0 text-[10px] font-mono text-cyber-muted/40">
          X→
        </div>
        <div className="absolute -left-1 bottom-0 text-[10px] font-mono text-cyber-muted/40 [writing-mode:vertical-lr] rotate-180">
          Z→
        </div>
      </div>

      <div className="text-xs font-mono text-cyber-muted">
        このレイヤー: {layerCount}/{GRID_SIZE * GRID_SIZE} | 合計: {totalCount}/{GRID_SIZE ** 3}
      </div>
    </div>
  );
};
