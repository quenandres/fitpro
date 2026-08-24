import { CalendarDays, LayoutGrid, Grid3x3, CalendarClock } from 'lucide-react';

export type PlanView = 'dia' | 'semana' | 'mes' | 'total';

interface Props {
  view: PlanView;
  onChange: (v: PlanView) => void;
  totalSemanas: number;
}

const ACCENT = '#a371f7';

const TABS: { id: PlanView; label: string; icon: typeof CalendarDays }[] = [
  { id: 'dia', label: 'Día', icon: CalendarClock },
  { id: 'semana', label: 'Semana', icon: CalendarDays },
  { id: 'mes', label: 'Mes', icon: LayoutGrid },
  { id: 'total', label: 'Total', icon: Grid3x3 },
];

export const PlanViewSwitcher = ({ view, onChange, totalSemanas }: Props) => {
  return (
    <div
      className="flex gap-1 p-1 rounded-xl bg-overlay border border-line w-full sm:w-fit overflow-x-auto scrollbar-hide"
    >
      {TABS.map((tab) => {
        const disabled = tab.id === 'mes' && totalSemanas < 1;
        const activo = view === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => !disabled && onChange(tab.id)}
            disabled={disabled}
            className="fp-btn fp-btn-ghost shrink-0 gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold border-none rounded-[9px] transition-all duration-150"
            style={{
              background: activo ? `${ACCENT}20` : 'transparent',
              color: activo ? ACCENT : 'var(--text-secondary)',
            }}
            aria-label={tab.label}
            title={tab.label}
          >
            <Icon size={13} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
