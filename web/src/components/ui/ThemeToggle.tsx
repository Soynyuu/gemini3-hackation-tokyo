import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
    theme: 'light' | 'dark';
    toggle: () => void;
}

export const ThemeToggle = ({ theme, toggle }: ThemeToggleProps) => {
    return (
        <button
            onClick={toggle}
            className="fixed bottom-6 left-6 z-50 p-3 rounded-full border border-cyber-border bg-cyber-surface/80 backdrop-blur-sm shadow-xl text-cyber-primary hover:scale-110 transition-all group"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span className="absolute left-full ml-3 px-2 py-1 bg-cyber-surface border border-cyber-border rounded text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest">
                {theme === 'light' ? 'Tactical Dark' : 'Blueprint Light'}
            </span>
        </button>
    );
};
