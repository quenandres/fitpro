import { LayoutGrid, ListOrdered, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../routes/paths';

const TABS = [
  { id: 'plantillas', label: 'Plantillas', to: ROUTES.library.rutinasPlantillas, Icon: LayoutGrid },
  { id: 'paso', label: 'Paso a paso', to: ROUTES.library.rutinaNueva('intermedia'), Icon: ListOrdered, match: /\/rutinas\/nueva\/(basica|intermedia|avanzada)/ },
  { id: 'ia', label: 'Generar con IA', to: ROUTES.library.ia, Icon: Sparkles },
] as const;

export const RoutineCreationMethodTabs = () => {
  const { pathname } = useLocation();

  return (
    <div
      className="flex flex-wrap gap-1 p-1 rounded-xl mb-4"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      role="tablist"
      aria-label="Método de creación"
    >
      {TABS.map((tab) => {
        const { label, to, Icon } = tab;
        const match = 'match' in tab ? tab.match : undefined;
        const active = match ? match.test(pathname) : pathname.startsWith(to);
        return (
          <Link
            key={label}
            to={to}
            role="tab"
            aria-selected={active}
            className="fp-btn flex-1 min-w-[100px] justify-center gap-1.5 text-xs font-semibold"
            style={{
              textDecoration: 'none',
              padding: '8px 10px',
              borderRadius: 9,
              background: active ? 'var(--bg-card)' : 'transparent',
              color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: active ? 'var(--shadow-sm)' : 'none',
              border: active ? '1px solid var(--border)' : '1px solid transparent',
            }}
          >
            <Icon size={14} />
            {label}
          </Link>
        );
      })}
    </div>
  );
};
