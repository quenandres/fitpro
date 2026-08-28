import { CalendarClock, Dumbbell } from 'lucide-react';
import { Sheet } from '../common/Sheet';

export type CalendarAction = 'cita' | 'asignar';

interface CalendarActionSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (action: CalendarAction) => void;
}

const ACTIONS: Array<{
  id: CalendarAction;
  label: string;
  description: string;
  icon: typeof CalendarClock;
}> = [
  {
    id: 'cita',
    label: 'Agendar cita',
    description: 'Entrenamiento o seguimiento de medidas con clientes',
    icon: CalendarClock,
  },
  {
    id: 'asignar',
    label: 'Asignar entrenamiento',
    description: 'Rutina del plan semanal para uno o más clientes',
    icon: Dumbbell,
  },
];

export function CalendarActionSheet({ open, onClose, onSelect }: CalendarActionSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Acción del calendario">
      <div className="p-5">
        <h2 className="font-sora text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          ¿Qué quieres hacer?
        </h2>
        <div className="flex flex-col gap-2">
          {ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-colors hover:bg-[var(--bg-overlay)]"
              onClick={() => onSelect(action.id)}
            >
              <div
                className="flex items-center justify-center rounded-xl shrink-0"
                style={{
                  width: 40,
                  height: 40,
                  background: 'var(--brand-dim)',
                  color: 'var(--brand)',
                }}
              >
                <action.icon size={19} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {action.label}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {action.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  );
}
