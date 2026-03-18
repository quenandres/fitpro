import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, BookOpen, Home, Settings } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b" style={{ borderColor: 'var(--border-color)' }}>
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center animate-float transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg, var(--accent-green) 0%, var(--accent-blue) 100%)', boxShadow: '0 4px 20px var(--glow-green)' }}>
            <Dumbbell className="w-6 h-6 text-black" />
          </div>
          <span className="font-bold text-2xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Fit<span className="text-gradient">Pro</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link 
            to="/admin" 
            className="p-2.5 rounded-xl transition-all hover:scale-110 glass-effect"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Settings className="w-5 h-5" />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Inicio', activeColor: 'var(--accent-green)' },
    { path: '/library', icon: BookOpen, label: 'Ejercicios', activeColor: 'var(--accent-blue)' },
    { path: '/admin', icon: Settings, label: 'Admin', activeColor: 'var(--accent-orange)' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t md:hidden" style={{ borderColor: 'var(--border-color)' }}>
      <div className="max-w-md mx-auto px-4 h-20 flex items-center justify-around">
        {navItems.map(({ path, icon: Icon, label, activeColor }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link 
              key={path}
              to={path} 
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-300"
            >
              <div 
                className={`p-3 rounded-2xl transition-all duration-300 ${isActive ? 'scale-110 shadow-lg' : 'hover:scale-105'}`}
                style={{ 
                  background: isActive 
                    ? `linear-gradient(135deg, ${activeColor}20, ${activeColor}10)`
                    : 'transparent'
                }}
              >
                <Icon 
                  className={`w-6 h-6 transition-all ${isActive ? 'scale-110' : ''}`} 
                  style={{ color: isActive ? activeColor : 'var(--text-muted)' }} 
                />
              </div>
              <span 
                className={`text-xs font-semibold transition-all ${isActive ? 'scale-110' : ''}`}
                style={{ color: isActive ? activeColor : 'var(--text-muted)' }}
              >
                {label}
              </span>
              {isActive && (
                <div 
                  className="w-1 h-1 rounded-full animate-pulse"
                  style={{ background: activeColor }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
