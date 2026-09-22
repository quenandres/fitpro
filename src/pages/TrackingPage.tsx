import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Activity, Plus, Users } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { DemoBadge } from '../components/common/DemoBadge';
import { PageBackRow } from '../components/common/PageBackButton';
import { AppShell } from '../components/layout/AppShell';
import { ClienteSelector } from '../components/tracking/ClienteSelector';
import { RegistrarSesionSheet } from '../components/tracking/RegistrarSesionSheet';
import { TrackingStats } from '../components/tracking/TrackingStats';
import { ActivityHeatmap } from '../components/tracking/ActivityHeatmap';
import { RecentSessionsList } from '../components/tracking/RecentSessionsList';
import { TrackingPeriodNav } from '../components/tracking/TrackingPeriodNav';
import { useClientHistorial } from '../lib/gateway/hooks';
import { useClientesSync } from '../hooks/useClientesSync';
import { useUsuariosStore } from '../store/useUsuariosStore';
import { useSesionesStore } from '../store/useSesionesStore';
import { mapGatewayHistorial } from '../utils/historialGatewayAdapter';
import {
  TRACKING_PERIOD_LABELS,
  fechaLocalISO,
  getPeriodRange,
  navigatePeriodAnchor,
  parseFechaLocal,
  parsePeriodParam,
  type TrackingPeriod,
} from '../utils/trackingUtils';
import { ROUTES } from '../routes/paths';

export function TrackingPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  useClientesSync();
  const usuarios = useUsuariosStore((s) => s.usuarios);
  const allSesiones = useSesionesStore((s) => s.sesiones);
  const [showRegistrar, setShowRegistrar] = useState(false);

  const period: TrackingPeriod = parsePeriodParam(params.get('period')) ?? 'semana';
  const anchorDate = useMemo(() => {
    const raw = params.get('fecha');
    if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return parseFechaLocal(raw);
    }
    return new Date();
  }, [params]);

  const periodRange = useMemo(
    () => getPeriodRange(period, anchorDate),
    [period, anchorDate],
  );

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

  const historialQuery = useClientHistorial(usuario?.client_uuid);
  const gatewaySesiones = useMemo(() => {
    if (!usuario?.client_uuid || !historialQuery.data) return [];
    return mapGatewayHistorial(historialQuery.data as Parameters<typeof mapGatewayHistorial>[0], usuario.id);
  }, [historialQuery.data, usuario]);

  const sesionesFuente = usuario?.client_uuid ? gatewaySesiones : allSesiones;

  const sesionesPeriodo = useMemo(() => {
    if (usuarioId == null) return [];
    return sesionesFuente
      .filter(
        (s) =>
          s.usuario_id === usuarioId &&
          s.fecha >= periodRange.desde &&
          s.fecha <= periodRange.hasta,
      )
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [sesionesFuente, usuarioId, periodRange.desde, periodRange.hasta]);

  const sesionesAll = useMemo(() => {
    if (usuarioId == null) return [];
    return sesionesFuente
      .filter((s) => s.usuario_id === usuarioId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [sesionesFuente, usuarioId]);

  const updateParams = useCallback(
    (next: { usuario?: number; period?: TrackingPeriod; fecha?: Date }) => {
      const merged = new URLSearchParams(params);
      if (next.usuario != null) merged.set('usuario', String(next.usuario));
      if (next.period != null) merged.set('period', next.period);
      if (next.fecha != null) merged.set('fecha', fechaLocalISO(next.fecha));
      setParams(merged);
    },
    [params, setParams],
  );

  const handleClienteChange = (id: number) => {
    updateParams({ usuario: id });
  };

  const handlePeriodChange = (next: TrackingPeriod) => {
    updateParams({ period: next, fecha: periodRange.anchor });
  };

  const handlePrevPeriod = () => {
    updateParams({ fecha: navigatePeriodAnchor(period, periodRange.anchor, -1) });
  };

  const handleNextPeriod = () => {
    updateParams({ fecha: navigatePeriodAnchor(period, periodRange.anchor, 1) });
  };

  const statsPeriodLabel = TRACKING_PERIOD_LABELS[period].toLowerCase();

  if (usuarios.length === 0) {
    return (
      <AppShell width="wide">
        <EmptyState
          icon={Users}
          title="Sin clientes disponibles"
          description="Agrega clientes desde Usuarios para ver su historial de entrenamientos."
          action={
            <button type="button" className="fp-btn fp-btn-primary" onClick={() => navigate(ROUTES.usuarios)}>
              Ir a usuarios
            </button>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell width="wide">
      <div className="fp-tracking-page animate-slide-up min-w-0">
        <section style={{ paddingTop: 12, paddingBottom: 16 }}>
          <PageBackRow to={ROUTES.usuarios} label="Volver a usuarios" />

          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="badge badge-brand" style={{ fontSize: 11, padding: '3px 9px' }}>
              <Activity size={10} style={{ marginRight: 3 }} />
              Seguimiento
            </span>
            {usuario?.client_uuid ? (
              <span className="badge badge-brand" style={{ fontSize: 11, padding: '3px 9px' }}>
                Gateway
              </span>
            ) : (
              <DemoBadge label="Demo · mock" />
            )}
          </div>

          <h1
            className="font-sora text-[22px] sm:text-2xl"
            style={{ fontWeight: 700, lineHeight: 1.2, letterSpacing: '-.02em', color: 'var(--text-primary)' }}
          >
            Seguimiento de entrenamientos
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {usuario?.client_uuid
              ? 'Historial con series reales desde el servidor (PWA + fallback entrenador).'
              : 'Historial mock local — vincula un cliente real para leer el gateway.'}
          </p>
          <button
            type="button"
            className="fp-btn fp-btn-primary mt-3"
            onClick={() => setShowRegistrar(true)}
          >
            <Plus size={16} />
            Registrar sesión
          </button>
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
          <TrackingStats sesiones={sesionesPeriodo} periodLabel={statsPeriodLabel} />

          <div className="fp-card min-w-0" style={{ padding: 16, borderRadius: 16 }}>
            <h2
              className="font-sora text-base font-bold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Actividad
            </h2>

            <TrackingPeriodNav
              period={period}
              periodLabel={periodRange.label}
              onPeriodChange={handlePeriodChange}
              onPrev={handlePrevPeriod}
              onNext={handleNextPeriod}
            />

            <div className="mt-4">
              <ActivityHeatmap
                sesiones={sesionesAll}
                period={period}
                anchorDate={periodRange.anchor}
              />
            </div>
          </div>

          <div className="fp-card min-w-0" style={{ padding: 16, borderRadius: 16 }}>
            <h2
              className="font-sora text-base font-bold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Sesiones recientes
            </h2>
            <RecentSessionsList sesiones={sesionesPeriodo} />
          </div>
        </div>
      </div>

      <RegistrarSesionSheet
        open={showRegistrar}
        onClose={() => setShowRegistrar(false)}
        usuarios={usuarios}
        defaultUsuarioId={usuarioId}
        onSaved={(id) => navigate(ROUTES.trackingSesion(id))}
      />
    </AppShell>
  );
}
