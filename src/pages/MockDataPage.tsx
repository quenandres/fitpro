import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DemoBadge } from '../components/common/DemoBadge';
import { AppShell } from '../components/layout/AppShell';
import { resetComunidadesDemoState } from '../demo/comunidades-demo';
import { isMockMode, setMockMode } from '../lib/mock-mode';
import { ROUTES } from '../routes/paths';

export function MockDataPage() {
  const [enabled, setEnabled] = useState(() => isMockMode());

  const apply = (next: boolean) => {
    setMockMode(next);
    setEnabled(next);
    resetComunidadesDemoState();
    window.location.assign(next ? ROUTES.home : ROUTES.login);
  };

  return (
    <AppShell hideBottomNav width="default">
      <div className="fp-card" style={{ padding: 20, maxWidth: 480, margin: '0 auto' }}>
        <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 12 }}>
          <h1 className="font-sora" style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
            Modo demostración
          </h1>
          <DemoBadge label="Inversores" />
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
          Activa datos de ejemplo en toda la app del entrenador. No se envían cambios al servidor.
          La preferencia se guarda en este navegador (misma clave que la PWA cliente).
        </p>
        <label
          className="flex min-h-11 cursor-pointer items-center justify-between gap-4"
          style={{ marginBottom: 20 }}
        >
          <span>
            <span className="fp-cal-label" style={{ display: 'block' }}>
              Modo mock
            </span>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {enabled
                ? 'Activo — entras como Laura Méndez sin contraseña'
                : 'Inactivo — sesión y datos reales vía gym-gateway'}
            </span>
          </span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => apply(e.target.checked)}
            className="size-5 accent-[var(--brand)]"
            aria-label="Activar modo mock"
          />
        </label>
        {enabled ? (
          <Link to={ROUTES.home} className="fp-btn fp-btn-primary" style={{ width: '100%' }}>
            Ir al inicio
          </Link>
        ) : (
          <Link to={ROUTES.login} className="fp-btn fp-btn-secondary" style={{ width: '100%' }}>
            Ir a iniciar sesión
          </Link>
        )}
      </div>
    </AppShell>
  );
}
