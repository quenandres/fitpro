import { useMemo } from 'react';
import { ArrowRight, CalendarClock, History } from 'lucide-react';
import type { Usuario } from '../../types';
import { DemoBadge } from '../common/DemoBadge';
import { buildMockMesociclos } from '../../data/routineHistoryMock';
import { getSesionesByUsuario } from '../../store/useSesionesStore';
import { useRoutineAssignmentHistoryStore } from '../../store/useRoutineAssignmentHistoryStore';

interface Props {
  user: Usuario;
  onGoToHistorial: () => void;
}

function formatFecha(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

/** Resumen compacto de historial en la pestaña Entrenamientos — el detalle completo vive en la pestaña Historial. */
export function UserTrainingHistorySummary({ user, onGoToHistorial }: Props) {
  const todosLosRegistros = useRoutineAssignmentHistoryStore((s) => s.registros);
  const registros = useMemo(
    () => todosLosRegistros.filter((r) => r.usuarioId === user.id),
    [todosLosRegistros, user.id],
  );
  const mesociclos = useMemo(() => buildMockMesociclos(user.id, []).slice(0, 3), [user.id]);
  const ultimasSesiones = useMemo(() => getSesionesByUsuario(user.id).slice(-5).reverse(), [user.id]);

  if (mesociclos.length === 0 && registros.length === 0 && ultimasSesiones.length === 0) return null;

  return (
    <section className="fp-card animate-slide-up" style={{ padding: 14, marginBottom: 16 }}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <History size={15} color="var(--text-secondary)" />
          <p className="fp-cal-label" style={{ margin: 0 }}>
            Historial reciente
          </p>
          <DemoBadge label="Métricas mock" />
        </div>
        <button
          type="button"
          className="fp-btn fp-btn-ghost"
          style={{ fontSize: 11, padding: '4px 8px', gap: 4 }}
          onClick={onGoToHistorial}
        >
          Ver todo <ArrowRight size={12} />
        </button>
      </div>

      {registros.length > 0 ? (
        <div className="flex flex-col gap-1.5 mb-3">
          {registros.slice(0, 2).map((r) => (
            <div key={r.id} className="flex items-center gap-2 text-[11px] text-secondary">
              <CalendarClock size={12} color="var(--text-muted)" />
              <span className="truncate">
                {r.rutinaNombre} · {r.semanasCompletadas} sem completadas ·{' '}
                {r.modo === 'reiniciar' ? 'reiniciado' : r.modo === 'retomar' ? 'retomado' : 'programado'}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {mesociclos.map((meso) => (
          <div
            key={meso.id}
            className="rounded-[10px]"
            style={{ padding: '8px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          >
            <p className="text-[11px] font-semibold text-primary truncate">{meso.nombreBloque}</p>
            <p className="text-[10px] text-muted">
              {formatFecha(meso.fechaInicio)}–{formatFecha(meso.fechaFin)} · {meso.adherenciaPct}% adherencia
            </p>
          </div>
        ))}
      </div>

      {ultimasSesiones.length > 0 ? (
        <p className="text-[11px] text-muted mt-3">
          Últimas sesiones: {ultimasSesiones.map((s) => formatFecha(s.fecha)).join(' · ')}
        </p>
      ) : null}
    </section>
  );
}
