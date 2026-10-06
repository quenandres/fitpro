import { Link, useLocation } from 'react-router-dom';
import { Check, ChevronRight, ClipboardList, LayoutTemplate, Sparkles, SlidersHorizontal, User } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ROUTES } from '../../../routes/paths';
import { useDataStore } from '../../../store/useDataStore';
import type { RoutineCreationContext } from '../../../utils/routineCreationContext';
import { buildRoutineCreationTarget } from '../../../utils/routineCreationContext';
import type { RoutineCreationMethodId } from '../../../utils/routineCreationEmbed';
import type { RoutineCreationTabId } from './RoutineCreationMethodTabs';
import type { BreadcrumbItem } from './RoutineCreationChrome';
import { RoutineCreationChrome } from './RoutineCreationChrome';
import { RoutineCreationMethodTabs } from './RoutineCreationMethodTabs';
import { RoutineRecentDraftsTable } from './RoutineRecentDraftsTable';

const { library: lib } = ROUTES;

const METHODS = [
  {
    id: 'plantillas' as const,
    to: lib.rutinasPlantillas,
    title: 'Plantillas predefinidas',
    desc: 'Comienza desde esquemas probados (PPL, torso/pierna, full body). Estandariza progresiones y edita volumen antes de guardar.',
    badge: null as string | null,
    accent: 'var(--accent-blue)',
    bg: 'var(--accent-blue-dim)',
    Icon: LayoutTemplate,
    cta: 'Explorar catálogo',
    features: ['Curvas de descarga editables', 'Modular por semanas', 'Periodización base'],
    previewLabel: '5 días / sem · plantilla',
  },
  {
    id: 'paso' as const,
    to: lib.rutinaNueva('intermedia'),
    title: 'Constructor paso a paso',
    desc: 'Diseña la rutina con precisión: microciclo, selección por día y calibración de descansos en tres fases.',
    badge: 'Control total',
    accent: 'var(--brand)',
    bg: 'var(--brand-dim)',
    Icon: SlidersHorizontal,
    cta: 'Iniciar constructor manual',
    features: ['Volumen por día de la semana', 'ExerciseDB integrado', 'Descansos por nivel'],
    previewLabel: 'Fases 01–03 guiadas',
  },
  {
    id: 'ia' as const,
    to: lib.ia,
    title: 'Generar con IA',
    desc: 'Describe objetivo, nivel, equipo y restricciones. Revisa el borrador y guárdalo en biblioteca para afinarlo.',
    badge: 'Asistente',
    accent: 'var(--accent-purple)',
    bg: 'color-mix(in srgb, var(--accent-purple) 12%, transparent)',
    Icon: Sparkles,
    cta: 'Crear mediante prompt',
    primary: true,
    features: ['Modificadores rápidos', 'Tres modos de síntesis', 'Catálogo validado al guardar'],
    previewLabel: 'Prompt → borrador → biblioteca',
  },
] as const;

function MethodCard({
  to,
  title,
  desc,
  badge,
  accent,
  bg,
  Icon,
  cta,
  features,
  previewLabel,
  primary,
  animationDelay,
  onSelect,
}: Omit<(typeof METHODS)[number], 'to'> & {
  to: string;
  animationDelay?: string;
  primary?: boolean;
  onSelect?: () => void;
}) {
  const cardClass =
    `fp-card fp-card-hover relative overflow-hidden flex flex-col min-h-[320px]${animationDelay === '0ms' ? '' : ' animate-slide-up'}`;
  const cardStyle = {
    textDecoration: 'none' as const,
    color: 'inherit' as const,
    animationDelay,
    width: '100%' as const,
    textAlign: 'left' as const,
    border: 'none' as const,
    cursor: onSelect ? ('pointer' as const) : undefined,
  };

  const inner = (
    <>
      <div className="fp-accent-bar" style={{ background: accent }} aria-hidden />
      <div style={{ padding: '18px 18px 16px 21px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={20} color={accent} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <p className="font-sora" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                {title}
              </p>
              {badge ? (
                <span className="badge badge-blue" style={{ fontSize: 9, padding: '2px 6px' }}>
                  {badge}
                </span>
              ) : null}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</p>
          </div>
        </div>

        <div
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 12,
          }}
        >
          <p className="fp-cal-label" style={{ marginBottom: 6 }}>
            Estructura típica
          </p>
          <div className="fp-progress-track" style={{ height: 6, marginBottom: 6 }}>
            <div className="fp-progress-fill" style={{ width: '72%', background: accent }} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{previewLabel}</p>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 14px', flex: 1 }}>
          {features.map((f) => (
            <li
              key={f}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                fontSize: 12,
                color: 'var(--text-secondary)',
                marginBottom: 6,
              }}
            >
              <Check size={14} color="var(--brand)" style={{ flexShrink: 0, marginTop: 1 }} />
              {f}
            </li>
          ))}
        </ul>

        <span
          className={primary ? 'fp-btn fp-btn-primary' : 'fp-btn fp-btn-secondary'}
          style={{
            width: '100%',
            justifyContent: 'center',
            gap: 6,
            pointerEvents: 'none',
          }}
        >
          {cta}
          <ChevronRight size={14} />
        </span>
      </div>
    </>
  );

  if (onSelect) {
    return (
      <button type="button" className={cardClass} style={cardStyle} onClick={onSelect}>
        {inner}
      </button>
    );
  }

  return (
    <Link to={to} className={cardClass} style={cardStyle}>
      {inner}
    </Link>
  );
}

function resolveMethodHref(base: string, context: RoutineCreationContext | null, libraryForward?: (target: string) => string): string {
  if (context) return buildRoutineCreationTarget(base, context);
  if (libraryForward) return libraryForward(base);
  return base;
}

export interface RoutineCreationChooserViewProps {
  context: RoutineCreationContext | null;
  /** Nombre del cliente cuando hay contexto de plan */
  clienteNombre?: string;
  /** Rutas de biblioteca: reenvía query desde URL actual */
  libraryForward?: (target: string) => string;
  variant: 'library' | 'client';
  sesionLabel?: string;
  semana?: number;
  showDrafts?: boolean;
  onAssignDraft?: (rutinaId: number) => void;
  /** Acciones extra bajo el chrome (p. ej. plan guiado en empty state) */
  headerActions?: ReactNode;
  inPlace?: {
    activeTab: RoutineCreationTabId;
    onTabChange: (tab: RoutineCreationTabId) => void;
    onSelectMethod: (method: RoutineCreationMethodId) => void;
  };
}

export function RoutineCreationChooserView({
  context,
  clienteNombre,
  libraryForward,
  variant,
  sesionLabel,
  semana,
  showDrafts = true,
  onAssignDraft,
  headerActions,
  inPlace,
}: RoutineCreationChooserViewProps) {
  const { pathname } = useLocation();
  const plantillasCount = useDataStore((s) => s.plantillas.length);
  const isClientContext = context != null && clienteNombre != null;
  const isLibraryMethodHub =
    !inPlace && pathname === lib.rutinasNueva;
  const isEmbeddedMethodHub = inPlace?.activeTab === 'hub';
  const useMethodStage = isLibraryMethodHub || isEmbeddedMethodHub;
  const [hubMethod, setHubMethod] = useState<RoutineCreationMethodId>('plantillas');

  const libraryCrumbs: BreadcrumbItem[] = [
    { label: 'Rutinas', to: lib.rutinas },
    { label: 'Nueva rutina' },
  ];

  const clientCrumbs: BreadcrumbItem[] =
    context && clienteNombre
      ? [
          { label: clienteNombre, to: ROUTES.usuario(context.usuarioId) },
          { label: 'Entrenamientos' },
          { label: 'Crear rutina' },
        ]
      : libraryCrumbs;

  const crumbs = variant === 'client' ? clientCrumbs : libraryCrumbs;

  const defaultSubtitle =
    'Selecciona el método que mejor se adapte a tu flujo: plantilla validada, constructor en tres fases o asistente con IA.';

  const sesionContext = sesionLabel != null && semana != null ? `${sesionLabel} · Semana ${semana}. ` : '';
  const clientSubtitle = `${sesionContext}Reemplazará la rutina actual del cliente. ${defaultSubtitle}`;

  const subtitle = variant === 'client' && isClientContext ? clientSubtitle : defaultSubtitle;

  const title = isClientContext
    ? `Crear rutina para ${clienteNombre}`
    : 'Crear nueva rutina';

  const badges = (
    <>
      {isClientContext ? (
        <span className="badge badge-brand" style={{ fontSize: 11, padding: '3px 9px' }}>
          <User size={10} style={{ marginRight: 3 }} />
          Se asignará al guardar
        </span>
      ) : (
        <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
          <ClipboardList size={10} style={{ marginRight: 3 }} />
          Biblioteca
        </span>
      )}
      <span className="badge badge-brand" style={{ fontSize: 10, padding: '3px 8px' }}>
        Constructor listo
      </span>
    </>
  );

  const tabsMode = inPlace || context ? 'embedded' : 'route';

  const methodCards = METHODS.map((m) => ({
    ...m,
    badge: m.id === 'plantillas' ? `${plantillasCount} arquitecturas` : m.badge,
    to: inPlace ? '#' : resolveMethodHref(m.to, context, libraryForward),
    onSelect: inPlace ? () => inPlace.onSelectMethod(m.id) : undefined,
  }));

  const activeMethodCard = methodCards.find((m) => m.id === hubMethod) ?? methodCards[0];

  return (
    <div>
      {headerActions ? <div className="mb-4 flex flex-wrap items-center gap-2">{headerActions}</div> : null}

      {useMethodStage ? (
        <section className="mb-4" aria-label="Elegir método de creación">
          <RoutineCreationMethodTabs
            mode={tabsMode}
            creationContext={context}
            hubPicker={{ active: hubMethod, onChange: setHubMethod }}
          />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={hubMethod}
              id={`routine-method-panel-${hubMethod}`}
              role="tabpanel"
              aria-labelledby={`routine-method-tab-${hubMethod}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3"
            >
              <MethodCard {...activeMethodCard} animationDelay="0ms" />
            </motion.div>
          </AnimatePresence>
        </section>
      ) : (
        <>
          <RoutineCreationMethodTabs
            mode={tabsMode}
            creationContext={context}
            embeddedActiveTab={inPlace ? inPlace.activeTab : tabsMode === 'embedded' ? 'hub' : undefined}
            inPlace={inPlace ? { activeTab: inPlace.activeTab, onTabChange: inPlace.onTabChange } : undefined}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {methodCards.map((m, i) => (
              <MethodCard key={m.id} {...m} animationDelay={`${i * 50}ms`} />
            ))}
          </div>
        </>
      )}

      <RoutineCreationChrome
        crumbs={crumbs}
        title={title}
        subtitle={subtitle}
        badges={badges}
        aside={
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
            {plantillasCount}+ plantillas · ExerciseDB
          </span>
        }
      />

      {showDrafts && (onAssignDraft != null || context == null) ? (
        <RoutineRecentDraftsTable
          onAssignDraft={onAssignDraft}
          assignLabel={isClientContext ? `Asignar a ${clienteNombre}` : 'Asignar aquí'}
        />
      ) : null}
    </div>
  );
}
