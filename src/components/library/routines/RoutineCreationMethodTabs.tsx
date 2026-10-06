import { LayoutGrid, ListOrdered, Sparkles } from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../../routes/paths';
import type { RoutineCreationContext } from '../../../utils/routineCreationContext';
import { buildRoutineCreationTarget, forwardRoutineCreationContext } from '../../../utils/routineCreationContext';
import type { RoutineCreationMethodId } from '../../../utils/routineCreationEmbed';

const TABS = [
  { id: 'plantillas' as const, label: 'Plantillas', to: ROUTES.library.rutinasPlantillas, Icon: LayoutGrid },
  {
    id: 'paso' as const,
    label: 'Paso a paso',
    to: ROUTES.library.rutinaNueva('intermedia'),
    Icon: ListOrdered,
    match: /\/rutinas\/nueva\/(basica|intermedia|avanzada)/,
  },
  { id: 'ia' as const, label: 'Generar con IA', to: ROUTES.library.ia, Icon: Sparkles },
] as const;

export type RoutineCreationTabId = (typeof TABS)[number]['id'] | 'hub';

interface Props {
  mode?: 'route' | 'embedded';
  creationContext?: RoutineCreationContext | null;
  embeddedActiveTab?: RoutineCreationTabId;
  /** Sin navegación: botones que cambian vista in-place (pestaña Entrenamientos del cliente) */
  inPlace?: {
    activeTab: RoutineCreationTabId;
    onTabChange: (tab: RoutineCreationTabId) => void;
  };
  /** Hub de métodos: tabs solo cambian la tarjeta visible, sin cambiar de ruta */
  hubPicker?: {
    active: RoutineCreationMethodId;
    onChange: (method: RoutineCreationMethodId) => void;
  };
}

export const RoutineCreationMethodTabs = ({
  mode = 'route',
  creationContext = null,
  embeddedActiveTab,
  inPlace,
  hubPicker,
}: Props) => {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  const resolveTo = (base: string) => {
    if (mode === 'embedded' && creationContext) {
      return buildRoutineCreationTarget(base, creationContext);
    }
    return forwardRoutineCreationContext(base, searchParams);
  };

  return (
    <div
      className="flex flex-wrap gap-1 p-1 rounded-xl mb-4"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      role="tablist"
      aria-label="Método de creación"
    >
      {TABS.map((tab) => {
        const { id, label, to, Icon } = tab;
        const match = 'match' in tab ? tab.match : undefined;
        let active: boolean;
        if (hubPicker) {
          active = hubPicker.active === id;
        } else if (inPlace) {
          active = inPlace.activeTab === id;
        } else if (mode === 'embedded') {
          active = embeddedActiveTab != null && embeddedActiveTab !== 'hub' && embeddedActiveTab === id;
        } else {
          active = match ? match.test(pathname) : pathname.startsWith(to);
        }

        const tabClass =
          'fp-btn flex-1 min-w-[100px] justify-center gap-1.5 text-xs font-semibold';
        const tabStyle = {
          textDecoration: 'none' as const,
          padding: '8px 10px',
          borderRadius: 9,
          background: active ? 'var(--bg-card)' : 'transparent',
          color: active ? 'var(--text-primary)' : 'var(--text-muted)',
          boxShadow: active ? 'var(--shadow-sm)' : 'none',
          border: active ? '1px solid var(--border)' : '1px solid transparent',
        };

        if (hubPicker) {
          return (
            <button
              key={label}
              id={`routine-method-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`routine-method-panel-${id}`}
              className={tabClass}
              style={tabStyle}
              onClick={() => hubPicker.onChange(id)}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        }

        if (inPlace) {
          return (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={active}
              className={tabClass}
              style={tabStyle}
              onClick={() => inPlace.onTabChange(id)}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        }

        return (
          <Link
            key={label}
            to={resolveTo(to)}
            role="tab"
            aria-selected={active}
            className={tabClass}
            style={tabStyle}
          >
            <Icon size={14} />
            {label}
          </Link>
        );
      })}
    </div>
  );
};
