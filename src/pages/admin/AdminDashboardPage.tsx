import { Shield } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { usePlatformRole } from '../../hooks/usePlatformRole';
import { ROLE_LABEL } from '../../types/adminDashboard';
import { SuperadminDashboardView } from './SuperadminDashboardView';
import { EntrenadorDashboardView } from './EntrenadorDashboardView';
import { LiderComunidadDashboardView } from './LiderComunidadDashboardView';

/**
 * Pantalla de inicio (`/`): dashboard de métricas — 100% datos mock
 * (ver src/data/adminDashboard/*.json). Resuelve la vista según el rol
 * efectivo (`usePlatformRole`) y delega en una de las 3 vistas. El rol se
 * cambia desde `/perfil` mientras el backend no envíe estos valores.
 */
export const AdminDashboardPage = () => {
  const { rol } = usePlatformRole();

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
