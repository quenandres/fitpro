import { useMemo } from 'react';
import { CalendarClock, CheckCircle2, ClipboardList, Scale, TrendingUp } from 'lucide-react';
import type { Rutina, Usuario } from '../../types';
import { DemoBadge } from '../common/DemoBadge';
import { EmptyState } from '../common/EmptyState';
import { buildMockMesociclos, type MesocicloHistorial } from '../../data/routineHistoryMock';
import { getSesionesByUsuario } from '../../store/useSesionesStore';
import { getSemanaActual } from '../../utils/planWeekUtils';

interface Props {
  user: Usuario;
  rutinas: Rutina[];
  onGoToEntrenamientos: () => void;
}

const METRIC_ICON = { trending: TrendingUp, scale: Scale, check: CheckCircle2 } as const;

function formatFecha(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function MesocicloCard({
  meso,
  rutina,
  onReplicar,
}: {
  meso: MesocicloHistorial;
  rutina: Rutina | undefined;
  onReplicar: () => void;
}) {
  return (
    <article className="fp-card" style={{ padding: 14, borderRadius: 13 }}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className="font-mono"
              style={{
                fontSize: 10,
                padding: '2px 7px',
                borderRadius: 6,
                background: 'var(--bg-overlay)',
                color: 'var(--text-secondary)',
              }}
            >
              {meso.codigo}
            </span>
            <span className="text-[11px] text-muted">
              {formatFecha(meso.fechaInicio)} — {formatFecha(meso.fechaFin)}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: 'var(--brand)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand)' }} />
              Completado ({meso.duracionSemanas} sem)
            </span>
          </div>
          <h4 className="font-sora text-sm font-bold text-primary">{meso.nombreBloque}</h4>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-secondary">
            <span>
              Frecuencia: <strong className="text-primary">{meso.frecuenciaDiasSemana} días/sem</strong>
            </span>
            <span>·</span>
            <span>
              Volumen: <strong className="text-primary">{meso.volumenKg.toLocaleString('es-ES')} kg</strong>
            </span>
            <span>·</span>
            <span>
              RPE promedio: <strong className="text-primary">{meso.rpePromedio.toFixed(1)}</strong>
            </span>
          </div>
        </div>
        <button
          type="button"
          className="fp-btn fp-btn-secondary shrink-0 gap-1.5 text-xs"
          onClick={onReplicar}
          disabled={!rutina}
          title={rutina ? undefined : 'La rutina de este bloque ya no está en tu biblioteca'}
        >
          <ClipboardList size={13} />
          Replicar
        </button>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        {meso.metricas.map((m) => {
          const Icon = METRIC_ICON[m.icon];
          return (
            <div key={m.label} className="flex items-center gap-2 px-2 py-1">
              <Icon size={15} color="var(--brand)" />
              <div className="min-w-0">
                <span className="block text-[10px] text-muted uppercase tracking-wide">{m.label}</span>
                <span className="text-xs font-semibold text-primary">{m.value}</span>
              </div>
            </div>
          );
        })}
        <div className="flex items-center gap-2 px-2 py-1">
          <CheckCircle2 size={15} color="var(--brand)" />
          <div className="min-w-0">
            <span className="block text-[10px] text-muted uppercase tracking-wide">Sesiones ejecutadas</span>
            <span className="text-xs font-semibold text-primary">
              {meso.sesionesCompletadas}/{meso.sesionesTotales} · {meso.adherenciaPct}%
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function UserRoutineHistoryPanel({ user, rutinas, onGoToEntrenamientos }: Props) {
  const rutinaIds = useMemo(() => rutinas.map((r) => r.id), [rutinas]);
  const mesociclos = useMemo(() => buildMockMesociclos(user.id, rutinaIds), [user.id, rutinaIds]);
  const sesiones = getSesionesByUsuario(user.id);

  const semanaActual = getSemanaActual(user.plan);
  const progresoPct = user.plan.semanas > 0 ? Math.round((semanaActual / user.plan.semanas) * 100) : 0;

  if (mesociclos.length === 0) {
    return (
      <div className="mt-4">
        <EmptyState
          icon={CalendarClock}
          title="Sin historial todavía"
          description="Cuando este cliente complete su primer mesociclo, aparecerá aquí con sus métricas de adherencia y volumen."
        />
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <section className="fp-card" style={{ padding: 14, borderRadius: 14, border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono uppercase"
              style={{ fontSize: 10, background: 'var(--brand-dim)', color: 'var(--brand)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--brand)' }} />
              En progreso · Semana {Math.max(1, semanaActual)}/{user.plan.semanas}
            </span>
            <DemoBadge label="Métricas mock" />
          </div>
        </div>
        <h3 className="font-sora text-base font-bold text-primary mb-3">{user.plan.nombre || 'Plan activo'}</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <span className="block text-[10px] text-muted uppercase tracking-wide mb-1">Progreso</span>
            <span className="font-sora text-lg font-bold text-primary">{progresoPct}%</span>
            <div className="fp-progress-track mt-1" style={{ height: 4 }}>
              <div className="fp-progress-fill" style={{ width: `${progresoPct}%` }} />
            </div>
          </div>
          <div>
            <span className="block text-[10px] text-muted uppercase tracking-wide mb-1">Sesiones registradas</span>
            <span className="font-sora text-lg font-bold text-primary">{sesiones.length}</span>
          </div>
          <div>
            <span className="block text-[10px] text-muted uppercase tracking-wide mb-1">Mesociclos previos</span>
            <span className="font-sora text-lg font-bold text-primary">{mesociclos.length}</span>
          </div>
          <div>
            <span className="block text-[10px] text-muted uppercase tracking-wide mb-1">Frecuencia objetivo</span>
            <span className="font-sora text-lg font-bold text-primary">{user.plan.dias_entrenar_semana}/sem</span>
          </div>
        </div>
      </section>

      <div>
        <p className="fp-cal-label mb-2">Historial de mesociclos</p>
        <div className="flex flex-col gap-3">
          {mesociclos.map((meso) => (
            <MesocicloCard
              key={meso.id}
              meso={meso}
              rutina={meso.rutinaId != null ? rutinas.find((r) => r.id === meso.rutinaId) : undefined}
              onReplicar={onGoToEntrenamientos}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
