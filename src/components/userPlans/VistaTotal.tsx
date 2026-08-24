import { useMemo } from 'react';
import type { Ejercicio, Rutina, Usuario } from '../../types';
import { DiaCard } from './DiaCard';
import { DIAS_SEMANA } from './diasSemana';
import { compareRutinaSnapshot } from '../../utils/compareRutinaSnapshot';
import { useIsLargeScreen } from '../../hooks/useMediaQuery';

interface Props {
  user: Usuario;
  onOpenDia: (semana: number, diaIndex: number) => void;
  rutinas: Rutina[];
  ejercicios: Ejercicio[];
}

const ACCENT = '#a371f7';

export const VistaTotal = ({ user, onOpenDia, rutinas, ejercicios }: Props) => {
  const isLarge = useIsLargeScreen();

  const stats = useMemo(() => {
    let entrenos = 0;
    let descansos = 0;
    const gruposMusculares = new Map<string, number>();

    user.plan.programacion_semanal.forEach((s) => {
      s.dias.forEach((d) => {
        const activo = d.ejercicios_personalizados.length > 0;
        if (activo) {
          entrenos++;
          d.ejercicios_personalizados.forEach((ep) => {
            const ej = ejercicios.find((e) => e.nombre === ep.nombre);
            if (ej) {
              ej.grupo_muscular.forEach((g) => {
                gruposMusculares.set(g, (gruposMusculares.get(g) || 0) + 1);
              });
            }
          });
        } else {
          descansos++;
        }
      });
    });

    const topGrupos = Array.from(gruposMusculares.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return { entrenos, descansos, topGrupos };
  }, [user, ejercicios]);

  const renderDiaCard = (
    s: (typeof user.plan.programacion_semanal)[0],
    diaIndex: number,
    variant: 'mini' | 'compact'
  ) => {
    const dia = s.dias[diaIndex];
    const rutina = rutinas.find((r) => r.id === dia.rutina_id);
    const syncStatus = compareRutinaSnapshot(rutina, dia);
    return (
      <DiaCard
        key={diaIndex}
        dia={dia}
        semana={s.semana}
        diaIndex={diaIndex}
        variant={variant}
        syncStatus={syncStatus}
        onClick={() => onOpenDia(s.semana, diaIndex)}
      />
    );
  };

  return (
    <div>
      <div className="mb-3.5">
        <p className="font-sora text-base font-bold text-primary tracking-tight">Plan completo</p>
        <p className="text-[11px] text-muted">
          {user.plan.semanas} semanas · {user.plan.semanas * 7} días
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2 mb-4">
        <div className="p-2.5 rounded-[10px] bg-[#22c55e15] border border-[#22c55e30]">
          <p className="text-[9px] font-bold text-[#22c55e] tracking-wider">ENTRENOS</p>
          <p className="font-sora text-xl font-bold text-[#22c55e] tracking-tight">{stats.entrenos}</p>
        </div>
        <div className="p-2.5 rounded-[10px] bg-[#58a6ff15] border border-[#58a6ff30]">
          <p className="text-[9px] font-bold text-[#58a6ff] tracking-wider">DESCANSOS</p>
          <p className="font-sora text-xl font-bold text-[#58a6ff] tracking-tight">{stats.descansos}</p>
        </div>
        <div className="p-2.5 rounded-[10px] border" style={{ background: `${ACCENT}15`, borderColor: `${ACCENT}40` }}>
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

      {isLarge ? (
        <>
          <div className="grid gap-1 mb-1.5" style={{ gridTemplateColumns: '40px repeat(7, 1fr)' }}>
            <div />
            {DIAS_SEMANA.map((d) => (
              <p key={d.dia} className="text-[9px] font-bold text-muted text-center tracking-wider">
                {d.nombreCorto.charAt(0).toUpperCase()}
              </p>
            ))}
          </div>

          <div className="grid gap-1">
            {user.plan.programacion_semanal.map((s) => (
              <div
                key={s.semana}
                className="grid gap-1"
                style={{ gridTemplateColumns: '40px repeat(7, 1fr)' }}
              >
                <div className="flex items-center justify-center text-[10px] font-bold text-muted">
                  S{s.semana}
                </div>
                {s.dias.map((_, diaIndex) => renderDiaCard(s, diaIndex, 'mini'))}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          {user.plan.programacion_semanal.map((s) => (
            <div key={s.semana}>
              <p className="font-sora text-sm font-bold text-primary mb-2">Semana {s.semana}</p>
              <div className="flex flex-col gap-2">
                {s.dias.map((_, diaIndex) => (
                  <div key={diaIndex} className="flex items-stretch gap-2">
                    <div className="shrink-0 w-10 flex items-center justify-center text-[10px] font-bold text-muted">
                      {DIAS_SEMANA[diaIndex]?.nombreCorto ?? ''}
                    </div>
                    <div className="flex-1 min-w-0">{renderDiaCard(s, diaIndex, 'compact')}</div>
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
