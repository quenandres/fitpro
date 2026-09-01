import { AppShell } from '../../components/layout/AppShell';
import { DashboardBriefing } from '../../components/admin/dashboard/DashboardBriefing';
import { usePlatformRole } from '../../hooks/usePlatformRole';
import { SuperadminDashboardView } from './SuperadminDashboardView';
import { EntrenadorDashboardView } from './EntrenadorDashboardView';

/**
 * Pantalla de inicio (`/`): briefing del día + métricas mock
 * (ver src/data/adminDashboard/*.json). La vista de gráficas sigue el rol
 * efectivo (`usePlatformRole`). El rol se cambia desde `/perfil`.
 */
export const AdminDashboardPage = () => {
  const { rol } = usePlatformRole();

  const View = rol === 'superadmin' ? SuperadminDashboardView : EntrenadorDashboardView;

  return (
    <AppShell width="wide">
      <div className="fp-admin-dash min-w-0">
        <DashboardBriefing />
        <View />
      </div>
    </AppShell>
  );
};
