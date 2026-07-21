import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, Home, BookOpen, LayoutGrid } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

/* ── Top Navbar ─────────────────────────────────────────── */
export const Navbar = () => (
  <header
    className="fp-glass fixed top-0 left-0 right-0 z-50"
    style={{ height: 58 }}
  >
    <div
      className="max-w-md mx-auto px-5 h-full flex items-center justify-between"
    >
      <Link to="/" className="flex items-center gap-2.5">
        <div
          style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg,#22c55e,#15803d)',
            boxShadow: '0 4px 14px rgba(34,197,94,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Dumbbell size={16} color="#fff" />
        </div>
        <span className="font-sora font-bold" style={{ fontSize: 18, color: 'var(--text-primary)' }}>
          Fit<span className="text-gradient-brand">Pro</span>
        </span>
      </Link>

      <div className="flex items-center gap-1">
        <Link
          to="/admin"
          className="fp-btn fp-btn-ghost"
          style={{ padding: '6px 8px', borderRadius: 9 }}
        >
          <LayoutGrid size={16} />
        </Link>
        <ThemeToggle />
      </div>
    </div>
  </header>
);

/* ── Bottom Nav ─────────────────────────────────────────── */
const NAV_ITEMS = [
  { path: '/',        Icon: Home,      label: 'Inicio',     accent: '#22c55e' },
  { path: '/library', Icon: BookOpen,  label: 'Ejercicios', accent: '#58a6ff' },
  { path: '/admin',   Icon: LayoutGrid,label: 'Admin',      accent: '#a371f7' },
] as const;

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        height: 64,
        background: 'rgba(13,17,23,.9)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="max-w-md mx-auto px-4 h-full flex items-center justify-around">
        {NAV_ITEMS.map(({ path, Icon, label, accent }) => {
          const active =
            path === '/'
              ? location.pathname === '/'
              : location.pathname === path || location.pathname.startsWith(`${path}/`);
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center gap-1"
              style={{ padding: '4px 14px' }}
            >
              <div
                style={{
                  width: 38, height: 38, borderRadius: 11,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? `${accent}1a` : 'transparent',
                  transition: 'background .2s',
                }}
              >
                <Icon size={18} color={active ? accent : 'var(--text-muted)'} />
              </div>
              <span
                style={{
                  fontSize: 10, fontWeight: 600,
                  color: active ? accent : 'var(--text-muted)',
                  transition: 'color .2s',
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
