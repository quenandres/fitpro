import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
      style={{
        background: isDark 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
          : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
        boxShadow: isDark
          ? '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
          : '0 4px 15px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div 
        className={`absolute transition-all duration-500 ${
          isDark ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
        }`}
      >
        <Moon className="w-5 h-5 text-neon-green" />
      </div>
      <div 
        className={`absolute transition-all duration-500 ${
          isDark ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
        }`}
      >
        <Sun className="w-5 h-5 text-brand-blue" style={{ color: '#3B82F6' }} />
      </div>
      <div 
        className={`absolute inset-0 rounded-full transition-all duration-300 ${
          isDark ? 'bg-neon-green/0' : 'bg-brand-blue/20'
        }`}
      />
    </button>
  );
};
