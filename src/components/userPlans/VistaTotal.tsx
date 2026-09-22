import { useMemo } from 'react';
import type { Ejercicio, Rutina, Usuario } from '../../types';
import { SesionCard } from './SesionCard';
import { compareRutinaSnapshot } from '../../utils/compareRutinaSnapshot';
import { sesionesForDisplay } from '../../utils/planScheduleUtils';

interface Props {
  user: Usuario;
  onOpenSesion: (semana: number, sesionIndex: number) => void;
  rutinas: Rutina[];
  ejercicios: Ejercicio[];
}

const ACCENT = '#a371f7';

export const VistaTotal = ({ user, onOpenSesion, rutinas, ejercicios }: Props) => {
  const stats = useMemo(() => {
    let sesionesConContenido = 0;
    const gruposMusculares = new Map<string, number>();

    user.plan.programacion_semanal.forEach((s) => {
      sesionesForDisplay(s, user.plan.modo).forEach((sesion) => {
        if (sesion.ejercicios_personalizados.length > 0) {
          sesionesConContenido++;
          sesion.ejercicios_personalizados.forEach((ep) => {
            const ej = ejercicios.find((e) => e.id === ep.ejercicio_id);
            if (ej) {
              ej.grupo_muscular.forEach((g) => {
                gruposMusculares.set(g, (gruposMusculares.get(g) || 0) + 1);
              });
            }
          });
        }
      });
    });

    const topGrupos = Array.from(gruposMusculares.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      sesionesConContenido,
      cuotaSemanal: user.plan.dias_entrenar_semana,
      topGrupos,
    };
  }, [user, ejercicios]);

  const repeticiones =
    user.plan.modo === 'repetitiva' ? user.plan.dias_entrenar_semana : undefined;

  return (
    <div>
      <div className="mb-3.5">
        <p className="font-sora text-base font-bold text-primary tracking-tight">Plan completo</p>
        <p className="text-[11px] text-muted">
          {user.plan.semanas} semanas · {stats.cuotaSemanal} entrenos/semana
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2 mb-4">
        <div className="p-2.5 rounded-[10px] bg-[#22c55e15] border border-[#22c55e30]">
          <p className="text-[9px] font-bold text-[#22c55e] tracking-wider">SESIONES</p>
          <p className="font-sora text-xl font-bold text-[#22c55e] tracking-tight">
            {stats.sesionesConContenido}
          </p>
        </div>
        <div className="p-2.5 rounded-[10px] bg-[#a371f715] border border-[#a371f730]">
          <p className="text-[9px] font-bold text-[#a371f7] tracking-wider">CUOTA/SEM</p>
          <p className="font-sora text-xl font-bold text-[#a371f7] tracking-tight">
            {stats.cuotaSemanal}
          </p>
        </div>
        <div
          className="p-2.5 rounded-[10px] border"
          style={{ background: `${ACCENT}15`, borderColor: `${ACCENT}40` }}
        >
          <p className="text-[9px] font-bold tracking-wider mb-1" style={{ color: ACCENT }}>
            TOP MÚSCULOS
          </p>
          <div className="flex gap-1 flex-wrap">
            {stats.topGrupos.length === 0 ? (
              <span className="text-[10px] text-muted">—</span>
            ) : (
              stats.topGrupos.map(([nombre, n]) => (
                <span
                  key={nombre}
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-card"
                  style={{ color: ACCENT }}
                >
                  {nombre} · {n}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {user.plan.programacion_semanal.map((s) => {
          const sesiones = sesionesForDisplay(s, user.plan.modo);
          return (
            <div key={s.semana}>
              <p className="font-sora text-sm font-bold text-primary mb-2">Semana {s.semana}</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {sesiones.map((sesion, sesionIndex) => {
                  const rutina = rutinas.find((r) => r.id === sesion.rutina_id);
                  const syncStatus = compareRutinaSnapshot(rutina, sesion);
                  return (
                    <SesionCard
                      key={sesionIndex}
                      sesion={sesion}
                      semana={s.semana}
                      sesionIndex={sesionIndex}
                      variant="compact"
                      syncStatus={syncStatus}
                      repeticiones={repeticiones}
                      onClick={() => onOpenSesion(s.semana, sesionIndex)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
