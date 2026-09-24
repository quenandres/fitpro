import { Link, useNavigate, useParams } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { PageBackRow } from '../components/common/PageBackButton';
import { EmptyState } from '../components/common/EmptyState';
import { useUsuariosStore } from '../store/useUsuariosStore';
import { useSesionesStore } from '../store/useSesionesStore';
import { useUnits } from '../hooks/useUnits';
import {
  TRACKING_MODALIDAD_LABELS,
  formatSessionDate,
} from '../utils/trackingUtils';
import { unidadAceptaPeso } from '../utils/sessionSetUtils';
import { ROUTES } from '../routes/paths';

export function TrackingSessionDetailPage() {
  const { sesionId } = useParams<{ sesionId: string }>();
  const navigate = useNavigate();
  const { formatearValor } = useUnits();
  const usuarios = useUsuariosStore((s) => s.usuarios);
  const hydrated = useSesionesStore((s) => s.hydrated);
  const sesion = useSesionesStore((s) =>
    sesionId ? s.sesiones.find((row) => row.id === sesionId) : undefined,
  );

  const usuario = sesion
    ? usuarios.find((u) => u.id === sesion.usuario_id)
    : undefined;

  if (!hydrated) {
    return (
      <AppShell width="wide">
        <div
          className="flex min-h-[40vh] items-center justify-center"
          style={{ color: 'var(--text-muted)', fontSize: 13 }}
        >
          <div className="auth-spinner-lg" aria-label="Cargando sesión" />
        </div>
      </AppShell>
    );
  }

  if (!sesion) {
    return (
      <AppShell width="wide">
        <EmptyState
          icon={Dumbbell}
          title="Sesión no encontrada"
          description="No hay datos para este identificador."
          action={
            <button type="button" className="fp-btn fp-btn-primary" onClick={() => navigate(ROUTES.tracking)}>
              Volver al tracking
            </button>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell width="wide">
      <div className="fp-tracking-page animate-slide-up min-w-0">
        <PageBackRow
          to={ROUTES.trackingUsuario(sesion.usuario_id)}
          label="Volver al tracking"
        />

        <div className="flex flex-wrap items-center gap-2 mb-2 mt-3">
          <span className={`fp-tracking-badge fp-tracking-badge--${sesion.modalidad}`}>
            {TRACKING_MODALIDAD_LABELS[sesion.modalidad]}
          </span>
        </div>

        <h1
          className="font-sora text-[22px] sm:text-2xl"
          style={{ fontWeight: 700, lineHeight: 1.2, letterSpacing: '-.02em', color: 'var(--text-primary)' }}
        >
          {sesion.rutina_nombre}
        </h1>
        <p className="text-sm text-muted mt-1">
          {usuario?.nombre ?? `Cliente #${sesion.usuario_id}`} · {formatSessionDate(sesion.fecha)} ·{' '}
          {sesion.duracion_min} min · {sesion.series_completadas} series
          {sesion.sesion_orden ? ` · Sesión ${sesion.sesion_orden} del plan` : ''}
        </p>

        <div className="flex flex-col gap-4 mt-6">
          {sesion.ejercicios.map((ej) => (
            <div key={ej.ejercicio_id} className="fp-card" style={{ padding: 16, borderRadius: 16 }}>
              <h2 className="font-sora text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                {ej.nombre}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                      <th className="text-left py-1 pr-3">Serie</th>
                      <th className="text-left py-1 pr-3">Reps / valor</th>
                      {unidadAceptaPeso(ej.unidad_id) ? (
                        <th className="text-left py-1">Peso (kg)</th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {ej.series.map((s) => (
                      <tr key={s.n} style={{ borderTop: '1px solid var(--border)' }}>
                        <td className="py-2 pr-3 text-muted">{s.n}</td>
                        <td className="py-2 pr-3">
                          {unidadAceptaPeso(ej.unidad_id)
                            ? s.reps
                            : formatearValor(s.reps, ej.unidad_id)}
                        </td>
                        {unidadAceptaPeso(ej.unidad_id) ? (
                          <td className="py-2">{s.peso_kg != null ? `${s.peso_kg} kg` : '—'}</td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {usuario ? (
          <p className="mt-6 text-sm">
            <Link
              to={ROUTES.usuario(usuario.id)}
              className="text-brand hover:underline"
            >
              Ver ficha de {usuario.nombre}
            </Link>
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
