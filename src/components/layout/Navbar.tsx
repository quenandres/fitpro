import { Link } from 'react-router-dom';
import { Dumbbell, BookOpen, Home, Settings } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b" style={{ borderColor: 'var(--border-color)' }}>
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-float" style={{ background: 'linear-gradient(135deg, var(--accent-green) 0%, var(--accent-blue) 100%)', boxShadow: '0 4px 20px var(--glow-green)' }}>
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Fit<span className="text-gradient">Pro</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/admin" className="p-2 rounded-lg transition-colors hover:bg-gray-700/50" style={{ color: 'var(--text-secondary)' }}>
            <Settings className="w-5 h-5" />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t md:hidden" style={{ borderColor: 'var(--border-color)' }}>
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        <Link to="/" className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 hover:scale-105" style={{ color: 'var(--text-secondary)' }}>
          <div className="p-2 rounded-lg bg-[var(--accent-green)]/10">
            <Home className="w-6 h-6" style={{ color: 'var(--accent-green)' }} />
          </div>
          <span className="text-xs font-medium">Inicio</span>
        </Link>
        <Link to="/library" className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 hover:scale-105" style={{ color: 'var(--text-secondary)' }}>
          <div className="p-2 rounded-lg bg-[var(--accent-blue)]/10">
            <BookOpen className="w-6 h-6" style={{ color: 'var(--accent-blue)' }} />
          </div>
          <span className="text-xs font-medium">Ejercicios</span>
        </Link>
        <Link to="/admin" className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 hover:scale-105" style={{ color: 'var(--text-secondary)' }}>
          <div className="p-2 rounded-lg bg-orange-500/10">
            <Settings className="w-6 h-6 text-orange-500" />
          </div>
          <span className="text-xs font-medium">Admin</span>
        </Link>
      </div>
    </nav>
  );
};
