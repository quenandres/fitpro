import { useNavigate } from 'react-router-dom';
import { Check, LogOut, Shield, User } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { useAuth } from '../context/AuthContext';
import { usePlatformRole } from '../hooks/usePlatformRole';
import { ROLES_DASHBOARD, ROLE_LABEL, type RolDashboard } from '../types/adminDashboard';
import { ROUTES } from '../routes/paths';

const ROLE_DESC: Record<RolDashboard, string> = {
  superadmin: 'Acceso completo: métricas globales y gestión de roles.',
  admin: 'Gestión de usuarios, plantillas globales y métricas de equipo.',
  entrenador: 'Gestión de clientes, rutinas y calendario.',
};

/**
 * Perfil del usuario (`/perfil`). Además de los datos de cuenta, permite
 * cambiar el rol de plataforma efectivo para probar toda la app: es un
 * override local (`useRoleOverrideStore`), no altera permisos del servidor.
 */
export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { rol, rolReal, rolOverride, setRolOverride } = usePlatformRole();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <AppShell width="narrow">
      <div className="min-w-0" style={{ paddingTop: 20, paddingBottom: 24 }}>
        <section className="animate-slide-up" style={{ marginBottom: 16 }}>
          <span className="badge badge-brand" style={{ fontSize: 11, padding: '3px 9px' }}>
            <User size={10} style={{ marginRight: 3 }} />
            Mi perfil
          </span>
          <h1
            className="font-sora text-[22px] sm:text-2xl"
            style={{ fontWeight: 700, lineHeight: 1.2, letterSpacing: '-.02em', color: 'var(--text-primary)', marginTop: 10 }}
          >
            Cuenta y rol
          </h1>
        </section>

        <section className="fp-card animate-slide-up delay-100" style={{ padding: 16, marginBottom: 14 }}>
          <p className="fp-cal-label" style={{ marginBottom: 10 }}>Datos de cuenta</p>
          <dl className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between gap-3 min-w-0">
              <dt className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>Email</dt>
              <dd className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.email || '—'}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 min-w-0">
              <dt className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>ID</dt>
              <dd className="text-[11px] font-mono truncate" style={{ color: 'var(--text-secondary)' }}>
                {user?.id || '—'}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 min-w-0">
              <dt className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>Rol del servidor</dt>
              <dd className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {user?.role ? ROLE_LABEL[rolReal] : `${ROLE_LABEL[rolReal]} (por defecto)`}
              </dd>
            </div>
          </dl>
          {!user?.role ? (
            <p className="text-[11px]" style={{ color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.5 }}>
              El backend aún no envía un rol para esta cuenta, por eso se aplica
              «{ROLE_LABEL[rolReal]}» como valor por defecto.
            </p>
          ) : null}
        </section>

        {import.meta.env.DEV ? (
        <section className="fp-card animate-slide-up delay-150" style={{ padding: 16, marginBottom: 14 }}>
          <div className="flex items-start gap-2" style={{ marginBottom: 4 }}>
            <Shield size={14} style={{ color: 'var(--brand)', marginTop: 2 }} />
            <div className="min-w-0">
              <p className="font-sora text-sm" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                Rol de plataforma (solo desarrollo)
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 2 }}>
                Cambia la vista de toda la app para hacer pruebas. Es un ajuste
                local de este navegador: no modifica tus permisos reales, que se
                validan en el servidor.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2" style={{ marginTop: 12 }}>
            {ROLES_DASHBOARD.map((opcion) => {
              const activo = rol === opcion;
              return (
                <button
                  key={opcion}
                  type="button"
                  onClick={() => setRolOverride(opcion)}
                  aria-pressed={activo}
                  className="flex items-center gap-3 text-left w-full transition-colors"
                  style={{
                    padding: '11px 12px',
                    borderRadius: 12,
                    border: `1px solid ${activo ? 'var(--border-focus)' : 'var(--border)'}`,
                    background: activo ? 'var(--brand-dim)' : 'var(--bg-elevated)',
                  }}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {ROLE_LABEL[opcion]}
                    </span>
                    <span className="block text-[11px]" style={{ color: 'var(--text-muted)', marginTop: 1 }}>
                      {ROLE_DESC[opcion]}
                    </span>
                  </span>
                  {activo ? <Check size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} /> : null}
                </button>
              );
            })}
          </div>

          {rolOverride ? (
            <button
              type="button"
              className="fp-btn fp-btn-secondary w-full"
              style={{ marginTop: 12 }}
              onClick={() => setRolOverride(null)}
            >
              Usar mi rol real ({ROLE_LABEL[rolReal]})
            </button>
          ) : null}
        </section>
        ) : null}

        <button
          type="button"
          className="fp-btn fp-btn-secondary w-full animate-slide-up delay-150"
          style={{ color: 'var(--accent-red)' }}
          onClick={() => void handleLogout()}
        >
          <LogOut size={15} style={{ marginRight: 6 }} />
          Cerrar sesión
        </button>
      </div>
    </AppShell>
  );
};
