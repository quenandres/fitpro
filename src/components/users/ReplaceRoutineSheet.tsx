import { useMemo, useState } from 'react';
import { Check, RotateCcw, SkipForward, Timer } from 'lucide-react';
import { Sheet } from '../common/Sheet';
import type { PlanUsuario, Rutina } from '../../types';
import { getSemanaActual } from '../../utils/planWeekUtils';
import { fechaLocalISO } from '../../utils/trackingUtils';

export type ReplaceRoutineMode = 'reiniciar' | 'retomar' | 'programado';

interface Props {
  open: boolean;
  plan: PlanUsuario | null;
  rutina: Rutina | null;
  onClose: () => void;
  onConfirm: (rutina: Rutina, modo: 'reiniciar' | 'retomar') => void;
  onProgramar: (rutina: Rutina, activarEn: string) => void;
}

/** Gestor de transición: decide cómo se encadena la nueva rutina sobre el microciclo actual. */
export function ReplaceRoutineSheet({ open, plan, rutina, onClose, onConfirm, onProgramar }: Props) {
  const [modo, setModo] = useState<ReplaceRoutineMode>('reiniciar');

  const semanaActual = plan ? getSemanaActual(plan) : 1;
  const finBloque = useMemo(() => {
    if (!plan?.fecha_inicio) return null;
    const start = new Date(`${plan.fecha_inicio}T12:00:00`);
    start.setDate(start.getDate() + plan.semanas * 7);
    return fechaLocalISO(start);
  }, [plan]);
  const semanasRestantes = plan ? Math.max(0, plan.semanas - semanaActual) : 0;
  const recomendarProgramar = semanasRestantes <= 2 && semanasRestantes > 0;

  if (!rutina || !plan) return null;

  const handleConfirm = () => {
    if (modo === 'programado' && finBloque) {
      onProgramar(rutina, finBloque);
    } else if (modo === 'reiniciar' || modo === 'retomar') {
      onConfirm(rutina, modo);
    }
    onClose();
  };

  const OPTIONS: Array<{
    id: ReplaceRoutineMode;
    icon: typeof RotateCcw;
    title: string;
    desc: string;
    meta: string;
    recommended?: boolean;
  }> = [
    {
      id: 'reiniciar',
      icon: RotateCcw,
      title: 'Reiniciar ahora',
      desc: 'La nueva rutina empieza en la semana 1 desde hoy. Las sesiones pendientes de esta semana se descartan.',
      meta: 'Corte inmediato',
    },
    {
      id: 'retomar',
      icon: Timer,
      title: `Retomar en semana ${semanaActual} de ${plan.semanas}`,
      desc: 'Se mantiene el avance actual del plan; solo cambian las semanas que aún no se han ejecutado.',
      meta: 'Sin perder progreso',
    },
    {
      id: 'programado',
      icon: SkipForward,
      title: 'Programar al terminar el bloque',
      desc: finBloque
        ? `La rutina queda en cola y se activa sola el ${finBloque}, cuando termine el bloque actual.`
        : 'Define primero una fecha de inicio en el plan para poder programar la transición.',
      meta: finBloque ? `Activación: ${finBloque}` : 'Sin fecha de inicio',
      recommended: recomendarProgramar,
    },
  ];

  return (
    <Sheet open={open} onClose={onClose} immersive ariaLabel="Asignar rutina">
      <div className="p-5" style={{ maxWidth: 480 }}>
        <h2 className="font-sora text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          Asignar «{rutina.nombre}»
        </h2>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
          {plan.nombre ? `Reemplaza a «${plan.nombre}» · ` : ''}Semana {semanaActual} de {plan.semanas} ·{' '}
          {semanasRestantes} semanas restantes
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = modo === opt.id;
            const disabled = opt.id === 'programado' && !finBloque;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={disabled}
                onClick={() => setModo(opt.id)}
                className="text-left rounded-[12px]"
                style={{
                  padding: '10px 12px',
                  border: `1px solid ${selected ? 'var(--brand)' : 'var(--border)'}`,
                  background: selected ? 'var(--brand-dim)' : 'var(--bg-elevated)',
                  opacity: disabled ? 0.5 : 1,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    <Icon size={14} color={selected ? 'var(--brand)' : 'var(--text-secondary)'} />
                    {opt.title}
                  </span>
                  <span className="flex items-center gap-1">
                    {opt.recommended ? (
                      <span className="badge badge-brand" style={{ fontSize: 9, padding: '2px 6px' }}>
                        Recomendado
                      </span>
                    ) : null}
                    {selected ? <Check size={14} color="var(--brand)" /> : null}
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {opt.desc}
                </p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  {opt.meta}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex gap-3">
          <button type="button" className="fp-btn fp-btn-secondary flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="fp-btn flex-1"
            style={{ background: 'var(--brand)', color: '#fff' }}
            disabled={modo === 'programado' && !finBloque}
            onClick={handleConfirm}
          >
            Confirmar planificación
          </button>
        </div>
      </div>
    </Sheet>
  );
}
