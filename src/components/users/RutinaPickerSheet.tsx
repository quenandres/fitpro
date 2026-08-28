import { useState } from 'react';
import { Copy, X } from 'lucide-react';
import type { Rutina } from '../../types';
import { Sheet } from '../common/Sheet';

interface Props {
  open: boolean;
  rutinas: Rutina[];
  semanasRestantes: number;
  diaLabel: string;
  onClose: () => void;
  onSelect: (rutina: Rutina, replicar: boolean) => void;
}

export function RutinaPickerSheet({
  open,
  rutinas,
  semanasRestantes,
  diaLabel,
  onClose,
  onSelect,
}: Props) {
  const [pending, setPending] = useState<Rutina | null>(null);

  const handleClose = () => {
    setPending(null);
    onClose();
  };

  const confirm = (replicar: boolean) => {
    if (!pending) return;
    onSelect(pending, replicar);
    setPending(null);
    onClose();
  };

  return (
    <Sheet open={open} onClose={handleClose} flexColumn ariaLabel="Asignar rutina">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 shrink-0 border-b border-line">
        <div className="min-w-0">
          <p className="font-sora text-base font-bold text-primary">Asignar rutina</p>
          <p className="text-xs text-muted truncate">{diaLabel}</p>
        </div>
        <button type="button" className="fp-btn fp-btn-ghost shrink-0 p-2" onClick={handleClose} aria-label="Cerrar">
          <X size={18} />
        </button>
      </div>

      <div className="overflow-y-auto min-h-0 flex-1 px-5 py-4">
        {pending ? (
          <div className="animate-slide-up">
            <p className="text-sm font-semibold text-primary mb-1">{pending.nombre}</p>
            <p className="text-xs text-muted mb-4 leading-relaxed">
              ¿Aplicar solo a {diaLabel} o replicar en las{' '}
              {semanasRestantes === 1 ? 'semana siguiente' : `${semanasRestantes} semanas siguientes`}?
            </p>
            <div className="flex flex-col gap-2">
              {semanasRestantes > 0 ? (
                <button
                  type="button"
                  className="fp-btn fp-btn-primary w-full justify-center gap-2"
                  onClick={() => confirm(true)}
                >
                  <Copy size={14} />
                  Replicar en semanas siguientes
                </button>
              ) : null}
              <button
                type="button"
                className="fp-btn fp-btn-secondary w-full justify-center"
                onClick={() => confirm(false)}
              >
                Solo esta semana
              </button>
              <button type="button" className="fp-btn fp-btn-ghost w-full" onClick={() => setPending(null)}>
                Elegir otra rutina
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {rutinas.map((r) => (
              <button
                key={r.id}
                type="button"
                className="fp-card fp-card-hover text-left w-full"
                style={{ padding: 12, borderRadius: 11 }}
                onClick={() => {
                  if (semanasRestantes <= 0) {
                    onSelect(r, false);
                    handleClose();
                  } else {
                    setPending(r);
                  }
                }}
              >
                <p className="text-sm font-semibold text-primary">{r.nombre}</p>
                <p className="text-[11px] text-muted mt-0.5">
                  {r.dificultad} · {r.duracion_min} min · {r.ejercicios.length} ejercicios
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </Sheet>
  );
}
