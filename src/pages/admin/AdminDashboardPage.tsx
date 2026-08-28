import { Shield } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { useAuth } from '../../context/AuthContext';
import { resolveDashboardRole, type RolDashboard } from '../../types/adminDashboard';
import { SuperadminDashboardView } from './SuperadminDashboardView';
import { EntrenadorDashboardView } from './EntrenadorDashboardView';
import { LiderComunidadDashboardView } from './LiderComunidadDashboardView';

const ROLE_LABEL = {
  superadmin: 'Superadmin',
  entrenador: 'Entrenador',
  lider_comunidad: 'Líder de comunidad',
} as const;

const rolFromQuery = (raw: string | null): RolDashboard | null => {
  if (raw === 'superadmin' || raw === 'entrenador' || raw === 'lider_comunidad') return raw;
  return null;
};

/**
 * Dashboard Admin — 100% datos mock (ver src/data/adminDashboard/*.json).
 * Resuelve la vista según el rol (`resolveDashboardRole`) y delega en una de
 * las 3 vistas; cada una compone sus propias secciones/gráficas con
 * los componentes de src/components/admin/dashboard/.
 * `?rol=superadmin|entrenador|lider_comunidad` fuerza la vista (útil mientras
 * el backend no envíe esos roles).
 */
export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const rol = rolFromQuery(params.get('rol')) ?? resolveDashboardRole(user?.role);

  const View =
    rol === 'superadmin'
      ? SuperadminDashboardView
      : rol === 'lider_comunidad'
        ? LiderComunidadDashboardView
        : EntrenadorDashboardView;

  return (
    <AppShell width="wide">
      <div className="fp-admin-dash min-w-0">
        <section className="animate-slide-up" style={{ paddingTop: 20, paddingBottom: 16 }}>
          <div className="flex flex-wrap items-center gap-1.5" style={{ marginBottom: 10 }}>
            <span className="badge badge-brand" style={{ fontSize: 11, padding: '3px 9px' }}>
              <Shield size={10} style={{ marginRight: 3 }} />
              Dashboard Admin
            </span>
            <span
              className="badge"
              style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', fontSize: 10, padding: '2px 8px' }}
            >
              {ROLE_LABEL[rol]}
            </span>
          </div>
          <h1
            className="font-sora text-[22px] sm:text-2xl"
            style={{ fontWeight: 700, lineHeight: 1.2, letterSpacing: '-.02em', color: 'var(--text-primary)' }}
          >
            Panel de métricas
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Datos de ejemplo — vista según tu rol.
          </p>
        </section>

        <View />
      </div>
    </AppShell>
  );
};
