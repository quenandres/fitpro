import { Outlet } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { AppShell } from './AppShell';
import { AdminSubNav } from './AdminSubNav';

export const AdminLayout = () => (
  <AppShell
    subNav={
      <>
        <section style={{ paddingBottom: 10 }}>
          <span
            className="badge"
            style={{
              fontSize: 11,
              padding: '3px 9px',
              background: 'rgba(163,113,247,.14)',
              color: '#a371f7',
              border: '1px solid rgba(163,113,247,.35)',
            }}
          >
            <Settings size={10} style={{ marginRight: 3, display: 'inline', verticalAlign: -1 }} />
            Administración
          </span>
          <h1
            className="font-sora"
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '-.02em',
              color: 'var(--text-primary)',
              marginTop: 8,
              marginBottom: 4,
            }}
          >
            Gestión FitPro
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Rutinas, ejercicios, catálogo y planes en un solo lugar.
          </p>
        </section>
        <AdminSubNav />
      </>
    }
  >
    <Outlet />
  </AppShell>
);
