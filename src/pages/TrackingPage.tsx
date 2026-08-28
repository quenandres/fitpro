import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Activity, ChevronLeft } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { ClienteSelector } from '../components/tracking/ClienteSelector';
import { TrackingStats } from '../components/tracking/TrackingStats';
import { ActivityHeatmap } from '../components/tracking/ActivityHeatmap';
import { RecentSessionsList } from '../components/tracking/RecentSessionsList';
import { useUsuariosStore } from '../store/useUsuariosStore';
import { getSesionesByUsuario, getSesionesEnRango } from '../store/useSesionesStore';
import { getRangoUltimasSemanas } from '../utils/trackingUtils';
import { ROUTES } from '../routes/paths';

export function TrackingPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const usuarios = useUsuariosStore((s) => s.usuarios);

  const usuarioId = useMemo(() => {
    const raw = params.get('usuario');
    const parsed = raw ? Number(raw) : NaN;
    if (!Number.isNaN(parsed) && usuarios.some((u) => u.id === parsed)) {
      return parsed;
    }
    return usuarios[0]?.id ?? null;
  }, [params, usuarios]);

  const usuario = useMemo(
    () => (usuarioId != null ? usuarios.find((u) => u.id === usuarioId) ?? null : null),
    [usuarios, usuarioId],
  );

  const rango = getRangoUltimasSemanas(12);
  const sesionesRango = useMemo(() => {
    if (usuarioId == null) return [];
    return getSesionesEnRango(usuarioId, rango.desde, rango.hasta);
  }, [usuarioId, rango.desde, rango.hasta]);

  const sesionesAll = useMemo(() => {
    if (usuarioId == null) return [];
    return getSesionesByUsuario(usuarioId);
  }, [usuarioId]);

  const handleClienteChange = (id: number) => {
    setParams({ usuario: String(id) });
  };

  if (usuarios.length === 0) {
    return (
      <AppShell width="wide">
        <p style={{ padding: 24, color: 'var(--text-muted)' }}>No hay clientes disponibles.</p>
      </AppShell>
    );
  }

  return (
    <AppShell width="wide">
      <div className="fp-tracking-page animate-slide-up min-w-0">
        <section style={{ paddingTop: 12, paddingBottom: 16 }}>
          <button
            type="button"
            className="fp-btn fp-btn-ghost fp-btn-sm mb-3 -ml-1"
            onClick={() => navigate(ROUTES.library.planes)}
          >
            <ChevronLeft size={18} />
            Planes
          </button>

          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="badge badge-brand" style={{ fontSize: 11, padding: '3px 9px' }}>
              <Activity size={10} style={{ marginRight: 3 }} />
              Tracking
            </span>
          </div>

          <h1
            className="font-sora text-[22px] sm:text-2xl"
            style={{ fontWeight: 700, lineHeight: 1.2, letterSpacing: '-.02em', color: 'var(--text-primary)' }}
          >
            Tracking de entrenamientos
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Historial de actividad del cliente — datos de ejemplo (Fase 4 pendiente).
          </p>
        </section>

        <div className="fp-card mb-4" style={{ padding: 16, borderRadius: 16 }}>
          <ClienteSelector
            usuarios={usuarios}
            selectedId={usuarioId}
            onChange={handleClienteChange}
          />
          {usuario ? (
            <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              {usuario.plan.nombre} · {usuario.objetivo}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 min-w-0">
          <TrackingStats sesiones={sesionesRango} />

          <div className="fp-card min-w-0" style={{ padding: 16, borderRadius: 16 }}>
            <h2
              className="font-sora text-base font-bold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Actividad
            </h2>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              Últimos {12} meses · color por modalidad dominante del día
            </p>
            <ActivityHeatmap sesiones={sesionesAll} />
          </div>

          <div className="fp-card min-w-0" style={{ padding: 16, borderRadius: 16 }}>
            <h2
              className="font-sora text-base font-bold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Sesiones recientes
            </h2>
            <RecentSessionsList sesiones={sesionesAll} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
