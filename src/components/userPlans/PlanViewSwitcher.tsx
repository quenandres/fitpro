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
      style={{
        display: 'flex',
        gap: 4,
        padding: 4,
        borderRadius: 12,
        background: 'var(--bg-overlay)',
        border: '1px solid var(--border)',
        width: 'fit-content',
      }}
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
            className="fp-btn fp-btn-ghost"
            style={{
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              background: activo ? `${ACCENT}20` : 'transparent',
              color: activo ? ACCENT : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 9,
              gap: 6,
              transition: 'all .15s',
            }}
          >
            <Icon size={13} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
