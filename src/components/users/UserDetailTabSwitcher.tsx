import { Activity, ClipboardList } from 'lucide-react';

export type UserDetailTab = 'progreso' | 'entrenamientos';

const ACCENT = '#58a6ff';

const TABS: { id: UserDetailTab; label: string; icon: typeof Activity }[] = [
  { id: 'progreso', label: 'Progreso', icon: Activity },
  { id: 'entrenamientos', label: 'Entrenamientos', icon: ClipboardList },
];

interface Props {
  tab: UserDetailTab;
  onChange: (tab: UserDetailTab) => void;
}

export function UserDetailTabSwitcher({ tab, onChange }: Props) {
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-overlay border border-line w-full sm:w-fit overflow-x-auto scrollbar-hide">
      {TABS.map(({ id, label, icon: Icon }) => {
        const activo = tab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className="fp-btn fp-btn-ghost shrink-0 gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold border-none rounded-[9px] transition-all duration-150"
            style={{
              background: activo ? `${ACCENT}20` : 'transparent',
              color: activo ? ACCENT : 'var(--text-secondary)',
            }}
          >
            <Icon size={13} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
