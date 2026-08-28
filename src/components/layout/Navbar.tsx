import { useEffect, useState, type ComponentType } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Dumbbell,
  Home,
  LogOut,
  Menu,
  Moon,
  Sun,
  Users,
  X,
  type LucideProps,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Sheet } from '../common/Sheet';
import { ROUTES } from '../../routes/paths';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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

const isNavActive = (pathname: string, path: string) =>
  path === '/'
    ? pathname === '/'
    : pathname === path || pathname.startsWith(`${path}/`);

/* ── Top Navbar ─────────────────────────────────────────── */
export const Navbar = ({ width = 'default' }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const noLeidas = useCommunitiesStore((s) => s.notificaciones.filter((n) => !n.leida).length);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate(ROUTES.login, { replace: true });
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const closeOnDesktop = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener('change', closeOnDesktop);
    return () => mq.removeEventListener('change', closeOnDesktop);
  }, []);

  return (
    <header className="fp-glass fixed top-0 left-0 right-0 z-50 h-[58px]">
      <div
        className={`${SHELL_WIDTH_CLASS[width]} mx-auto px-4 md:px-6 lg:px-8 h-full flex items-center justify-between gap-2`}
      >
        <div className="flex items-center gap-1 min-w-0">
          <button
            type="button"
            className="fp-btn fp-btn-ghost md:hidden shrink-0"
            style={{ padding: '6px 8px', borderRadius: 9 }}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <div
              className="shrink-0"
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'linear-gradient(135deg,#22c55e,#15803d)',
                boxShadow: '0 4px 14px rgba(34,197,94,.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Dumbbell size={16} color="#fff" />
            </div>
            <span className="font-sora font-bold text-lg text-primary truncate">
              Fit<span className="text-gradient-brand">Pro</span>
            </span>
            <span className="badge badge-brand hidden lg:inline" style={{ fontSize: 10, padding: '2px 7px' }}>
              Admin
            </span>
          </Link>
        </div>

        {/* Desktop nav — replaces bottom nav at md+ */}
        <nav
          className="hidden md:flex items-center gap-0.5 lg:gap-1 flex-1 justify-center min-w-0"
          aria-label="Navegación principal"
        >
          {NAV_ITEMS.map(({ path, Icon, label, accent }) => {
            const active = isNavActive(location.pathname, path);
            return (
              <Link
                key={path}
                to={path}
                aria-label={label}
                title={label}
                className="fp-btn fp-btn-ghost flex items-center gap-2 rounded-[10px] px-2.5 py-2 lg:px-3 text-sm font-semibold transition-colors"
                style={{
                  color: active ? accent : 'var(--text-secondary)',
                  background: active ? `${accent}1a` : 'transparent',
                }}
              >
                <Icon size={16} />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 shrink-0">
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
          <div className="hidden md:flex items-center gap-1">
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
      </div>

      <MobileNavMenu
        open={menuOpen}
        pathname={location.pathname}
        unread={noLeidas}
        onClose={() => setMenuOpen(false)}
        onLogout={() => void handleLogout()}
      />
    </header>
  );
};

interface MobileNavMenuProps {
  open: boolean;
  pathname: string;
  unread: number;
  onClose: () => void;
  onLogout: () => void;
}

const MobileNavMenu = ({ open, pathname, unread, onClose, onLogout }: MobileNavMenuProps) => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return createPortal(
    <Sheet open={open} onClose={onClose} zIndex={70} ariaLabel="Menú de navegación">
      <div id="mobile-nav-menu" className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <p className="font-sora text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Menú
            </p>
            {user?.email ? (
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                {user.email}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="fp-btn fp-btn-ghost shrink-0"
            style={{ padding: '6px 8px', borderRadius: 9 }}
            aria-label="Cerrar menú"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1" aria-label="Secciones">
          {NAV_ITEMS.map((item) => (
            <MobileNavLink key={item.path} {...item} pathname={pathname} onNavigate={onClose} />
          ))}
        </nav>

        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <Link
            to={ROUTES.notifications}
            onClick={onClose}
            className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 font-semibold text-sm"
            style={{ color: 'var(--text-primary)' }}
          >
            <span
              className="flex items-center justify-center rounded-[10px] relative"
              style={{ width: 36, height: 36, background: 'var(--bg-overlay)' }}
            >
              <Bell size={16} />
              {unread > 0 ? (
                <span
                  className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-[9px] font-bold"
                  style={{ width: 14, height: 14, background: 'var(--accent-pink)', color: '#fff' }}
                >
                  {unread > 9 ? '9+' : unread}
                </span>
              ) : null}
            </span>
            Notificaciones
          </Link>

          <button
            type="button"
            className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 font-semibold text-sm w-full text-left"
            style={{ color: 'var(--text-primary)' }}
            onClick={toggleTheme}
          >
            <span
              className="flex items-center justify-center rounded-[10px]"
              style={{ width: 36, height: 36, background: 'var(--bg-overlay)' }}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </span>
            {isDark ? 'Modo claro' : 'Modo oscuro'}
          </button>

          <button
            type="button"
            className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 font-semibold text-sm w-full text-left"
            style={{ color: 'var(--accent-red)' }}
            onClick={onLogout}
          >
            <span
              className="flex items-center justify-center rounded-[10px]"
              style={{ width: 36, height: 36, background: 'rgba(220,38,38,.12)' }}
            >
              <LogOut size={16} />
            </span>
            Cerrar sesión
          </button>
        </div>
      </div>
    </Sheet>,
    document.body,
  );
};

const MobileNavLink = ({
  path,
  Icon,
  label,
  accent,
  pathname,
  onNavigate,
}: {
  path: string;
  Icon: ComponentType<LucideProps>;
  label: string;
  accent: string;
  pathname: string;
  onNavigate: () => void;
}) => {
  const active = isNavActive(pathname, path);
  return (
    <Link
      to={path}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 font-semibold text-sm"
      style={{
        color: active ? accent : 'var(--text-primary)',
        background: active ? `${accent}1a` : 'transparent',
      }}
    >
      <span
        className="flex items-center justify-center rounded-[10px]"
        style={{ width: 36, height: 36, background: active ? `${accent}1f` : 'var(--bg-overlay)' }}
      >
        <Icon size={16} color={active ? accent : 'var(--text-muted)'} />
      </span>
      {label}
    </Link>
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
      <div className="max-w-md mx-auto px-2 sm:px-4 h-16 flex items-center justify-around min-w-0">
        {NAV_ITEMS.map(({ path, Icon, label, accent }) => {
          const active = isNavActive(location.pathname, path);
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center gap-0.5 min-w-0 flex-1 max-w-[72px] min-h-[44px] justify-center"
              style={{ padding: '4px 2px' }}
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
                className="text-[10px] font-semibold transition-colors truncate max-w-full"
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
