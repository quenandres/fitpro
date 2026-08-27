import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dumbbell, Home, BookOpen, ClipboardList, CalendarDays, Users, Bell, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { ROUTES } from '../../routes/paths';
import { useAuth } from '../../context/AuthContext';
import { useCommunitiesStore } from '../../store/useCommunitiesStore';
import { SHELL_WIDTH_CLASS, type ShellWidth } from './shellWidth';

const NAV_ITEMS = [
  { path: ROUTES.home,               Icon: Home,          label: 'Inicio',      accent: '#22c55e' },
  { path: ROUTES.library.root,       Icon: BookOpen,      label: 'Datos',       accent: '#58a6ff' },
  { path: ROUTES.library.rutinas,    Icon: ClipboardList, label: 'Rutinas',     accent: '#a371f7' },
  { path: ROUTES.calendar,           Icon: CalendarDays,  label: 'Calendario',  accent: '#f0883e' },
  { path: ROUTES.communities.root,   Icon: Users,         label: 'Comunidades', accent: '#f778ba' },
] as const;

interface NavbarProps {
  width?: ShellWidth;
}

/* ── Top Navbar ─────────────────────────────────────────── */
export const Navbar = ({ width = 'default' }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const noLeidas = useCommunitiesStore((s) => s.notificaciones.filter((n) => !n.leida).length);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.login, { replace: true });
  };

  const isNavActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <header className="fp-glass fixed top-0 left-0 right-0 z-50 h-[58px]">
      <div
        className={`${SHELL_WIDTH_CLASS[width]} mx-auto px-4 md:px-6 lg:px-8 h-full flex items-center justify-between gap-3`}
      >
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
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
          <span className="font-sora font-bold text-lg text-primary">
            Fit<span className="text-gradient-brand">Pro</span>
          </span>
          <span className="badge badge-brand hidden sm:inline" style={{ fontSize: 10, padding: '2px 7px' }}>
            Admin
          </span>
        </Link>

        {/* Desktop nav — replaces bottom nav at md+ */}
        <nav
          className="hidden md:flex items-center gap-1 flex-1 justify-center"
          aria-label="Navegación principal"
        >
          {NAV_ITEMS.map(({ path, Icon, label, accent }) => {
            const active = isNavActive(path);
            return (
              <Link
                key={path}
                to={path}
                className="fp-btn fp-btn-ghost flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-semibold transition-colors"
                style={{
                  color: active ? accent : 'var(--text-secondary)',
                  background: active ? `${accent}1a` : 'transparent',
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 shrink-0">
          <Link
            to={ROUTES.library.rutinas}
            className="fp-btn fp-btn-ghost md:hidden"
            style={{ padding: '6px 8px', borderRadius: 9 }}
            aria-label="Rutinas"
          >
            <ClipboardList size={16} />
          </Link>
          <Link
            to={ROUTES.notifications}
            className="fp-btn fp-btn-ghost relative"
            style={{ padding: '6px 8px', borderRadius: 9 }}
            aria-label={noLeidas > 0 ? `Notificaciones (${noLeidas} sin leer)` : 'Notificaciones'}
          >
            <Bell size={16} />
            {noLeidas > 0 ? (
              <span
                className="absolute top-1 right-1 flex items-center justify-center rounded-full text-[9px] font-bold"
                style={{ width: 14, height: 14, background: 'var(--accent-pink)', color: '#fff' }}
              >
                {noLeidas > 9 ? '9+' : noLeidas}
              </span>
            ) : null}
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
export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav
      className="fp-glass fp-safe-bottom fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-line"
      style={{ minHeight: 64 }}
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {NAV_ITEMS.map(({ path, Icon, label, accent }) => {
          const active =
            path === '/'
              ? location.pathname === '/'
              : location.pathname === path || location.pathname.startsWith(`${path}/`);
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center"
              style={{ padding: '4px 14px' }}
            >
              <div
                className="flex items-center justify-center rounded-[11px] transition-colors"
                style={{
                  width: 44, height: 44,
                  background: active ? `${accent}1a` : 'transparent',
                }}
              >
                <Icon size={18} color={active ? accent : 'var(--text-muted)'} />
              </div>
              <span
                className="text-[10px] font-semibold transition-colors"
                style={{ color: active ? accent : 'var(--text-muted)' }}
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
