import { CalendarClock, ListChecks, Sparkles, X } from 'lucide-react';
import type { Rutina, Usuario } from '../../types';
import { planHasConfiguredSessions } from '../../utils/guidedPlanUtils';
import { getSemanaActual } from '../../utils/planWeekUtils';
import { sesionesForDisplay } from '../../utils/planScheduleUtils';
import { isSesionConfigured } from '../../utils/sesionPlanUtils';
import { getSesionesByUsuario } from '../../store/useSesionesStore';

interface Props {
  user: Usuario;
  rutinas: Rutina[];
  onCancelarCola?: () => void;
}

/** Tarjeta con la rutina actual del cliente (o su estado vacío) en la pestaña Entrenamientos. */
export function UserCurrentRoutineCard({ user, rutinas, onCancelarCola }: Props) {
  const { plan } = user;
  const tieneRutina = planHasConfiguredSessions(plan);
  const semanaActual = getSemanaActual(plan);
  const semanaPlan = plan.programacion_semanal.find((s) => s.semana === semanaActual) ?? plan.programacion_semanal[0];
  const sesionesSemana = semanaPlan ? sesionesForDisplay(semanaPlan, plan.modo) : [];
  const sesionesConfiguradas = sesionesSemana.filter(isSesionConfigured).length;
  const sesionesEjecutadas = getSesionesByUsuario(user.id).length;
  const progresoPct = plan.semanas > 0 ? Math.round((semanaActual / plan.semanas) * 100) : 0;
  const rutinaEnCola = plan.rutina_en_cola;
  const rutinaAsignadaId = plan.rutinas_asignadas[0]?.rutina_id;
  const rutinaActual = rutinaAsignadaId != null ? rutinas.find((r) => r.id === rutinaAsignadaId) : undefined;

  return (
    <section className="fp-card animate-slide-up relative overflow-hidden" style={{ padding: 0, marginBottom: 16 }}>
      <div className="fp-accent-bar" style={{ background: 'var(--brand)' }} aria-hidden />
      <div style={{ padding: '16px 18px' }}>
        {!tieneRutina ? (
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'var(--brand-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ListChecks size={18} color="var(--brand)" />
            </div>
            <div className="min-w-0">
              <p className="font-sora text-sm font-bold text-primary">Sin rutina asignada</p>
              <p className="text-xs text-secondary">Elige un método abajo para crear y asignar la primera rutina.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono uppercase"
                  style={{ fontSize: 10, background: 'var(--brand-dim)', color: 'var(--brand)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--brand)' }} />
                  Semana {semanaActual}/{plan.semanas}
                </span>
              </div>
              {plan.fecha_inicio ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                  <CalendarClock size={12} /> Inicio {plan.fecha_inicio}
                </span>
              ) : null}
            </div>

            <h3 className="font-sora text-base font-bold text-primary mb-1">{plan.nombre || 'Plan activo'}</h3>
            <p className="text-xs text-secondary mb-3">
              {rutinaActual ? `${rutinaActual.nombre} · ` : ''}
              {plan.dias_entrenar_semana} días/sem · {sesionesConfiguradas}/{sesionesSemana.length} sesiones de esta
              semana configuradas
            </p>

            <div className="fp-progress-track mb-3" style={{ height: 5 }}>
              <div className="fp-progress-fill" style={{ width: `${progresoPct}%` }} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-1">
              {sesionesSemana.map((sesion, i) => (
                <div
                  key={`${sesion.orden}-${i}`}
                  className="rounded-[10px]"
                  style={{ padding: '8px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                >
                  <p className="text-[11px] font-semibold text-primary truncate">
                    {sesion.nombre || `Sesión ${i + 1}`}
                  </p>
                  <p className="text-[10px] text-muted truncate">
                    {isSesionConfigured(sesion)
                      ? `${sesion.ejercicios_personalizados.length} ejercicios`
                      : 'Sin configurar'}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-muted mt-2">{sesionesEjecutadas} sesiones registradas en total.</p>

            {rutinaEnCola ? (
              <div
                className="mt-3 flex items-center justify-between gap-2 rounded-[10px]"
                style={{ padding: '8px 10px', background: 'var(--accent-blue-dim)', border: '1px solid var(--border-subtle)' }}
              >
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: 'var(--accent-blue)' }}>
                  <Sparkles size={12} />
                  Siguiente: {rutinaEnCola.rutina_nombre} · desde {rutinaEnCola.activar_en}
                </span>
                {onCancelarCola ? (
                  <button
                    type="button"
                    className="fp-btn fp-btn-ghost"
                    style={{ padding: '3px 6px' }}
                    onClick={onCancelarCola}
                    aria-label="Cancelar rutina en cola"
                  >
                    <X size={13} />
                  </button>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
