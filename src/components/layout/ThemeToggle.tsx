import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 fp-btn fp-btn-ghost p-0"
      style={{
        background: isDark ? 'var(--bg-elevated)' : 'var(--bg-overlay)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <div className={`absolute transition-all duration-500 ${isDark ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}>
        <Moon className="w-5 h-5" style={{ color: 'var(--brand-bright)' }} />
      </div>
      <div className={`absolute transition-all duration-500 ${isDark ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}>
        <Sun className="w-5 h-5" style={{ color: 'var(--accent-orange)' }} />
      </div>
    </button>
  );
};
