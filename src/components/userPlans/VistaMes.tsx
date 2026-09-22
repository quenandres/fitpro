import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Rutina, Usuario } from '../../types';
import { SesionCard } from './SesionCard';
import { compareRutinaSnapshot } from '../../utils/compareRutinaSnapshot';
import { sesionesForDisplay } from '../../utils/planScheduleUtils';

interface Props {
  user: Usuario;
  onOpenSesion: (semana: number, sesionIndex: number) => void;
  rutinas: Rutina[];
}

const ACCENT = '#a371f7';

export const VistaMes = ({ user, onOpenSesion, rutinas }: Props) => {
  const totalMeses = Math.max(1, Math.ceil(user.plan.semanas / 4));
  const [mes, setMes] = useState(1);

  const semanasVisibles = useMemo(() => {
    const startSemana = (mes - 1) * 4 + 1;
    const endSemana = Math.min(mes * 4, user.plan.semanas);
    return user.plan.programacion_semanal.filter(
      (s) => s.semana >= startSemana && s.semana <= endSemana,
    );
  }, [user, mes]);

  const repeticiones =
    user.plan.modo === 'repetitiva' ? user.plan.dias_entrenar_semana : undefined;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMes(Math.max(1, mes - 1))}
            disabled={mes === 1}
            className="fp-btn fp-btn-ghost p-1.5"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-center min-w-[140px]">
            <p className="font-sora text-[15px] font-bold text-primary">Mes {mes}</p>
            <p className="text-[10px] text-muted">
              Semanas {(mes - 1) * 4 + 1}-{Math.min(mes * 4, user.plan.semanas)}
            </p>
          </div>
          <button
            onClick={() => setMes(Math.min(totalMeses, mes + 1))}
            disabled={mes === totalMeses}
            className="fp-btn fp-btn-ghost p-1.5"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="scrollbar-hide flex gap-1 overflow-x-auto pb-0.5">
          {Array.from({ length: totalMeses }, (_, i) => i + 1).map((m) => (
            <button
              key={m}
              onClick={() => setMes(m)}
              className="shrink-0 w-7 h-7 rounded-md text-[11px] font-semibold cursor-pointer"
              style={{
                border: mes === m ? `2px solid ${ACCENT}` : '1px solid var(--border)',
                background: mes === m ? `${ACCENT}20` : 'transparent',
                color: mes === m ? ACCENT : 'var(--text-muted)',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {semanasVisibles.map((s) => {
          const sesiones = sesionesForDisplay(s, user.plan.modo);
          return (
            <div key={s.semana}>
              <p className="font-sora text-sm font-bold text-primary mb-2">Semana {s.semana}</p>
              <div className="grid gap-2 sm:grid-cols-2">
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
