import { useState } from 'react';
import { Check } from 'lucide-react';
import { Sheet } from '../../common/Sheet';
import type { Plan } from '../../../types/billing';
import { formatCOP, labelPeriodicidad } from '../../../utils/billingFormat';

interface Props {
  open: boolean;
  onClose: () => void;
  planes: Plan[];
  planActualId: string;
  onConfirm: (planId: string) => void;
}

export function CambiarPlanSheet({ open, onClose, planes, planActualId, onConfirm }: Props) {
  const [selected, setSelected] = useState(planActualId);

  const handleClose = () => {
    setSelected(planActualId);
    onClose();
  };

  const handleConfirm = () => {
    if (selected === planActualId) {
      handleClose();
      return;
    }
    onConfirm(selected);
    setSelected(planActualId);
  };

  const activos = planes.filter((p) => p.activo);

  return (
    <Sheet open={open} onClose={handleClose} ariaLabel="Cambiar plan" flexColumn>
      <div className="flex flex-col min-h-0 flex-1 px-5 pt-5">
        <div className="shrink-0">
          <h2
            className="font-sora"
            style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}
          >
            Cambiar plan
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
            Selecciona el nuevo plan. El cambio queda registrado en el historial de la suscripción.
          </p>
        </div>

        <div className="flex flex-col gap-2 min-h-0 flex-1 overflow-y-auto mt-5">
          {activos.map((plan) => {
            const isSelected = selected === plan.id;
            const isCurrent = plan.id === planActualId;

            return (
              <button
                key={plan.id}
                type="button"
                className="fp-bill-plan-option"
                style={
                  isSelected
                    ? {
                        borderColor: 'var(--accent-blue)',
                        background: 'var(--accent-blue-dim)',
                      }
                    : undefined
                }
                onClick={() => setSelected(plan.id)}
              >
                <div className="min-w-0 flex-1 text-left">
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {plan.nombre}
                    {isCurrent ? (
                      <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
                        (actual)
                      </span>
                    ) : null}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {formatCOP(plan.precio)} · {labelPeriodicidad(plan.periodicidad)}
                  </p>
                </div>
                {isSelected ? <Check size={18} style={{ color: 'var(--accent-blue)' }} /> : null}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 shrink-0 pt-5 pb-5">
          <button type="button" className="fp-btn fp-btn-secondary flex-1" onClick={handleClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="fp-btn fp-btn-primary flex-1"
            disabled={selected === planActualId}
            onClick={handleConfirm}
          >
            Aplicar cambio
          </button>
        </div>
      </div>
    </Sheet>
  );
}
