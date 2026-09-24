import { Link, useSearchParams } from 'react-router-dom';
import { Check, ChevronRight, ClipboardList, LayoutTemplate, Sparkles, SlidersHorizontal } from 'lucide-react';
import { SelfTrainingRedirect } from '../../components/training/SelfTrainingRedirect';
import { ROUTES } from '../../routes/paths';
import { ROUTINE_PRESETS } from '../../data/routinePresets';
import { RoutineCreationMethodTabs } from '../../components/library/routines/RoutineCreationMethodTabs';
import { RoutineRecentDraftsTable } from '../../components/library/routines/RoutineRecentDraftsTable';
import { RoutineCreationChrome } from '../../components/library/routines/RoutineCreationChrome';

const { library: lib } = ROUTES;

const METHODS = [
  {
    to: lib.rutinasPlantillas,
    title: 'Plantillas predefinidas',
    desc: 'Comienza desde esquemas probados (PPL, torso/pierna, full body). Estandariza progresiones y edita volumen antes de guardar.',
    badge: `${ROUTINE_PRESETS.length} arquitecturas`,
    accent: 'var(--accent-blue)',
    bg: 'var(--accent-blue-dim)',
    Icon: LayoutTemplate,
    cta: 'Explorar catálogo',
    features: ['Curvas de descarga editables', 'Modular por semanas', 'Periodización base'],
    previewLabel: '5 días / sem · plantilla',
  },
  {
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
}: (typeof METHODS)[number] & { animationDelay?: string; primary?: boolean }) {
  return (
    <Link
      to={to}
      className="fp-card fp-card-hover animate-slide-up relative overflow-hidden flex flex-col min-h-[320px]"
      style={{
        textDecoration: 'none',
        color: 'inherit',
        animationDelay,
      }}
    >
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
              <span className="badge badge-blue" style={{ fontSize: 9, padding: '2px 6px' }}>
                {badge}
              </span>
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
    </Link>
  );
}

export const RoutineChooserPage = () => {
  const [searchParams] = useSearchParams();
  if (searchParams.get('para') === 'mi') return <SelfTrainingRedirect />;

  return (
    <div>
      <RoutineCreationMethodTabs />

      <RoutineCreationChrome
        crumbs={[
          { label: 'Rutinas', to: lib.rutinas },
          { label: 'Nueva rutina' },
        ]}
        title="Crear nueva rutina"
        subtitle="Selecciona el método que mejor se adapte a tu flujo: plantilla validada, constructor en tres fases o asistente con IA."
        badges={
          <>
            <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
              <ClipboardList size={10} style={{ marginRight: 3 }} />
              Biblioteca
            </span>
            <span className="badge badge-brand" style={{ fontSize: 10, padding: '3px 8px' }}>
              Constructor listo
            </span>
          </>
        }
        aside={
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
            {ROUTINE_PRESETS.length}+ plantillas · ExerciseDB
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {METHODS.map((m, i) => (
          <MethodCard key={m.to} {...m} animationDelay={`${i * 50}ms`} />
        ))}
      </div>

      <RoutineRecentDraftsTable />
    </div>
  );
};
