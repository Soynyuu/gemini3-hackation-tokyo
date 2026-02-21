import type { VoxelType } from '../../store/types';
import { Box, Sparkles, Droplets } from 'lucide-react';

const COLORS = [
    '#FF3B30', // Red
    '#0A84FF', // Blue
    '#30D158', // Green
    '#FF9F0A', // Orange
    '#BF5AF2', // Purple
    '#FFD60A', // Yellow
    '#E0F0FF', // White/Cyan
    '#1E2D3D', // Dark
];

interface ToolbarProps {
    activeColor: string;
    setActiveColor: (c: string) => void;
    activeType: VoxelType;
    setActiveType: (t: VoxelType) => void;
}

export const Toolbar = ({ activeColor, setActiveColor, activeType, setActiveType }: ToolbarProps) => {
    return (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 p-4 rounded-xl bg-cyber-surface/80 backdrop-blur-md border border-cyber-border shadow-2xl">

            <div className="flex gap-2 border-r border-cyber-border pr-4">
                {COLORS.map(c => (
                    <button
                        key={c}
                        onClick={() => setActiveColor(c)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${activeColor === c ? 'scale-110 border-white' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: c, boxShadow: c === activeColor ? `0 0 10px ${c}88` : 'none' }}
                    />
                ))}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => setActiveType('standard')}
                    className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${activeType === 'standard' ? 'bg-cyber-primary text-black' : 'text-cyber-muted hover:text-white'}`}
                >
                    <Box size={20} />
                    <span className="text-sm font-bold uppercase tracking-wider hidden sm:inline">ソリッド</span>
                </button>
                <button
                    onClick={() => setActiveType('emissive')}
                    className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${activeType === 'emissive' ? 'bg-cyber-accent text-white' : 'text-cyber-muted hover:text-white'}`}
                >
                    <Sparkles size={20} />
                    <span className="text-sm font-bold uppercase tracking-wider hidden sm:inline">発光</span>
                </button>
                <button
                    onClick={() => setActiveType('transparent')}
                    className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${activeType === 'transparent' ? 'bg-cyber-secondary text-white' : 'text-cyber-muted hover:text-white'}`}
                >
                    <Droplets size={20} />
                    <span className="text-sm font-bold uppercase tracking-wider hidden sm:inline">ガラス</span>
                </button>
            </div>

        </div>
    );
};
