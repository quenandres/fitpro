import { Activity, ClipboardList, Ruler } from 'lucide-react';

export type UserDetailTab = 'progreso' | 'entrenamientos' | 'medidas';

const TABS: { id: UserDetailTab; label: string; icon: typeof Activity }[] = [
  { id: 'progreso', label: 'Progreso', icon: Activity },
  { id: 'entrenamientos', label: 'Entrenamientos', icon: ClipboardList },
  { id: 'medidas', label: 'Medidas', icon: Ruler },
];

interface Props {
  tab: UserDetailTab;
  onChange: (tab: UserDetailTab) => void;
}

export function UserDetailTabSwitcher({ tab, onChange }: Props) {
  return (
    <div
      className="flex gap-1 p-1 rounded-xl w-full sm:w-fit overflow-x-auto scrollbar-hide"
      style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}
      role="tablist"
      aria-label="Secciones del cliente"
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const activo = tab === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activo}
            onClick={() => onChange(id)}
            className="fp-btn fp-btn-ghost shrink-0 gap-1.5 px-3 py-1.5 text-xs font-semibold border-none rounded-[9px]"
            style={{
              background: activo ? 'var(--accent-blue-dim)' : 'transparent',
              color: activo ? 'var(--accent-blue)' : 'var(--text-secondary)',
            }}
          >
            <Icon size={13} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
