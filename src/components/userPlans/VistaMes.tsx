import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Rutina, Usuario } from '../../types';
import { DiaCard } from './DiaCard';
import { DIAS_SEMANA } from './diasSemana';
import { compareRutinaSnapshot } from '../../utils/compareRutinaSnapshot';
import { useIsLargeScreen } from '../../hooks/useMediaQuery';

interface Props {
  user: Usuario;
  onOpenDia: (semana: number, diaIndex: number) => void;
  rutinas: Rutina[];
}

const ACCENT = '#a371f7';

export const VistaMes = ({ user, onOpenDia, rutinas }: Props) => {
  const isLarge = useIsLargeScreen();
  const totalMeses = Math.max(1, Math.ceil(user.plan.semanas / 4));
  const [mes, setMes] = useState(1);

  const semanasVisibles = useMemo(() => {
    const startSemana = (mes - 1) * 4 + 1;
    const endSemana = Math.min(mes * 4, user.plan.semanas);
    return user.plan.programacion_semanal.filter(
      (s) => s.semana >= startSemana && s.semana <= endSemana
    );
  }, [user, mes]);

  const renderDiaCard = (s: (typeof semanasVisibles)[0], diaIndex: number) => {
    const dia = s.dias[diaIndex];
    const rutina = rutinas.find((r) => r.id === dia.rutina_id);
    const syncStatus = compareRutinaSnapshot(rutina, dia);
    return (
      <DiaCard
        key={diaIndex}
        dia={dia}
        semana={s.semana}
        diaIndex={diaIndex}
        variant="compact"
        syncStatus={syncStatus}
        onClick={() => onOpenDia(s.semana, diaIndex)}
      />
    );
  };

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

      {isLarge ? (
        <>
          <div className="grid gap-1.5 mb-2" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
            <div />
            {DIAS_SEMANA.map((d) => (
              <p
                key={d.dia}
                className="text-[10px] font-bold text-muted text-center tracking-wider"
              >
                {d.nombreCorto.toUpperCase()}
              </p>
            ))}
          </div>

          <div className="grid gap-1.5">
            {semanasVisibles.map((s) => (
              <div
                key={s.semana}
                className="grid gap-1.5"
                style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}
              >
                <div className="flex items-center justify-center rounded-lg bg-overlay border border-line text-[11px] font-bold text-muted">
                  S{s.semana}
                </div>
                {s.dias.map((_, diaIndex) => renderDiaCard(s, diaIndex))}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          {semanasVisibles.map((s) => (
            <div key={s.semana}>
              <p className="font-sora text-sm font-bold text-primary mb-2">Semana {s.semana}</p>
              <div className="flex flex-col gap-2">
                {s.dias.map((_, diaIndex) => (
                  <div key={diaIndex} className="flex items-stretch gap-2">
                    <div className="shrink-0 w-11 flex items-center justify-center rounded-lg bg-overlay border border-line text-[10px] font-bold text-muted">
                      {DIAS_SEMANA[diaIndex]?.nombreCorto ?? ''}
                    </div>
                    <div className="flex-1 min-w-0">{renderDiaCard(s, diaIndex)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
