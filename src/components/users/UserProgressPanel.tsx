import { useMemo, useState } from 'react';
import { ActivityHeatmap } from '../tracking/ActivityHeatmap';
import { RecentSessionsList } from '../tracking/RecentSessionsList';
import { TrackingPeriodNav } from '../tracking/TrackingPeriodNav';
import { TrackingStats } from '../tracking/TrackingStats';
import { useSesionesStore } from '../../store/useSesionesStore';
import { useDataStore } from '../../store/useDataStore';
import {
  TRACKING_PERIOD_LABELS,
  getPeriodRange,
  navigatePeriodAnchor,
  type TrackingPeriod,
} from '../../utils/trackingUtils';

interface Props {
  usuarioId: number;
}

export function UserProgressPanel({ usuarioId }: Props) {
  const { rutinas, ejercicios } = useDataStore();
  const allSesiones = useSesionesStore((s) => s.sesiones);
  const [period, setPeriod] = useState<TrackingPeriod>('semana');
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [showMuscleMap, setShowMuscleMap] = useState(false);
  const hydrated = useSesionesStore((s) => s.hydrated);

  const periodRange = useMemo(
    () => getPeriodRange(period, anchorDate),
    [period, anchorDate],
  );

  const sesionesPeriodo = useMemo(
    () =>
      allSesiones
        .filter(
          (s) =>
            s.usuario_id === usuarioId &&
            s.fecha >= periodRange.desde &&
            s.fecha <= periodRange.hasta,
        )
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [allSesiones, usuarioId, periodRange.desde, periodRange.hasta],
  );

  const sesionesAll = useMemo(
    () =>
      allSesiones
        .filter((s) => s.usuario_id === usuarioId)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [allSesiones, usuarioId],
  );

  const statsPeriodLabel = TRACKING_PERIOD_LABELS[period].toLowerCase();

  if (!hydrated) {
    return (
      <div
        className="flex min-h-[200px] items-center justify-center"
        style={{ color: 'var(--text-muted)', fontSize: 13 }}
      >
        <div className="auth-spinner-lg" aria-label="Cargando progreso" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 min-w-0 animate-slide-up">
      <TrackingStats sesiones={sesionesPeriodo} periodLabel={statsPeriodLabel} />

      <div className="fp-card min-w-0" style={{ padding: 16, borderRadius: 16 }}>
        <div className="fp-admin-section-head fp-admin-section-head--compact" style={{ marginBottom: 14 }}>
          <h3 className="font-sora fp-admin-section-title">Actividad</h3>
          <span className="fp-admin-section-rule" aria-hidden />
        </div>
        <TrackingPeriodNav
          period={period}
          periodLabel={periodRange.label}
          onPeriodChange={setPeriod}
          onPrev={() => setAnchorDate(navigatePeriodAnchor(period, periodRange.anchor, -1))}
          onNext={() => setAnchorDate(navigatePeriodAnchor(period, periodRange.anchor, 1))}
        />

        <label
          className="flex items-start gap-2.5 mt-4 cursor-pointer rounded-[10px] px-3 py-2.5"
          style={{
            background: showMuscleMap ? 'rgba(240,136,62,.08)' : 'var(--bg-overlay)',
            border: showMuscleMap ? '1px dashed rgba(240,136,62,.45)' : '1px solid var(--border-subtle)',
          }}
        >
          <input
            type="checkbox"
            checked={showMuscleMap}
            onChange={(e) => setShowMuscleMap(e.target.checked)}
            className="mt-0.5 shrink-0"
            style={{ cursor: 'pointer' }}
          />
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-1.5 mb-0.5">
              <span className="text-xs font-semibold text-primary">Mapa muscular entrenado</span>
              <span
                className="badge"
                style={{
                  fontSize: 9,
                  padding: '2px 6px',
                  background: 'rgba(240,136,62,.18)',
                  color: '#f0883e',
                  border: '1px solid rgba(240,136,62,.35)',
                  fontWeight: 700,
                }}
              >
                Demo · no producción
              </span>
            </span>
            <span className="text-[10px] text-muted leading-snug block">
              Mapa desde ejercicios ejecutados en la PWA (series reales del servidor).
            </span>
          </span>
        </label>

        <div className="mt-4">
          <ActivityHeatmap
            sesiones={sesionesAll}
            period={period}
            anchorDate={periodRange.anchor}
            showMuscleMap={showMuscleMap}
            rutinas={rutinas}
            ejercicios={ejercicios}
          />
        </div>
      </div>

      <div className="fp-card min-w-0" style={{ padding: 16, borderRadius: 16 }}>
        <div className="fp-admin-section-head fp-admin-section-head--compact" style={{ marginBottom: 14 }}>
          <h3 className="font-sora fp-admin-section-title">Sesiones recientes</h3>
          <span className="fp-admin-section-rule" aria-hidden />
        </div>
        <RecentSessionsList sesiones={sesionesPeriodo} />
      </div>

    </div>
  );
}
