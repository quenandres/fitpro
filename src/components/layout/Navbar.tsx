import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dumbbell, Home, BookOpen, ClipboardList, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { ROUTES } from '../../routes/paths';
import { useAuth } from '../../context/AuthContext';

/* ── Top Navbar ─────────────────────────────────────────── */
export const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.login, { replace: true });
  };

  return (
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
            to={ROUTES.library.rutinas}
            className="fp-btn fp-btn-ghost"
            style={{ padding: '6px 8px', borderRadius: 9 }}
          >
            <ClipboardList size={16} />
          </Link>
          <ThemeToggle />
          <button
            type="button"
            className="fp-btn fp-btn-ghost"
            style={{ padding: '6px 8px', borderRadius: 9 }}
            onClick={() => void handleLogout()}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

/* ── Bottom Nav ─────────────────────────────────────────── */
const NAV_ITEMS = [
  { path: ROUTES.home,               Icon: Home,          label: 'Inicio',     accent: '#22c55e' },
  { path: ROUTES.library.root,       Icon: BookOpen,      label: 'Biblioteca', accent: '#58a6ff' },
  { path: ROUTES.library.rutinas,    Icon: ClipboardList, label: 'Rutinas',    accent: '#a371f7' },
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
