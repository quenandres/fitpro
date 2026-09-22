import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, ClipboardList, LayoutTemplate } from 'lucide-react';
import { ROUTES } from '../../routes/paths';

const { library: lib } = ROUTES;

const PRESET_CARD = {
  to: lib.rutinasPlantillas,
  title: 'Desde plantilla',
  desc: 'Hyrox, isométricos, pliometría, HIIT y más — ejercicios resueltos con ExerciseDB',
  badge: '20+ presets',
  accent: 'var(--accent-blue)',
  bg: 'var(--accent-blue-dim)',
} as const;

const LEVELS = [
  {
    to: lib.rutinaNueva('basica'),
    title: 'Básica',
    desc: 'Nombre + ejercicios (ExerciseDB) + series/reps',
    badgeClass: 'diff-beginner',
    accent: 'var(--brand)',
    bg: 'var(--brand-dim)',
  },
  {
    to: lib.rutinaNueva('intermedia'),
    title: 'Intermedia',
    desc: 'Categoría, duración, descanso, notas y filtros API',
    badgeClass: 'diff-intermediate',
    accent: 'var(--accent-blue)',
    bg: 'var(--accent-blue-dim)',
  },
  {
    to: lib.rutinaNueva('avanzada'),
    title: 'Avanzada',
    desc: 'Tipo EMOM/AMRAP/circuito, RPE y supersets',
    badgeClass: 'diff-advanced',
    accent: 'var(--accent-purple)',
    bg: 'color-mix(in srgb, var(--accent-purple) 12%, transparent)',
  },
] as const;

function ChooserCard({
  to,
  title,
  desc,
  badge,
  badgeClass,
  accent,
  bg,
  icon: Icon,
  animationDelay,
  borderAccent,
}: {
  to: string;
  title: string;
  desc: string;
  badge?: string;
  badgeClass?: string;
  accent: string;
  bg: string;
  icon: typeof ClipboardList;
  animationDelay?: string;
  borderAccent?: boolean;
}) {
  return (
    <Link
      to={to}
      className="fp-card fp-card-hover animate-slide-up relative overflow-hidden block"
      style={{
        textDecoration: 'none',
        color: 'inherit',
        animationDelay,
        ...(borderAccent
          ? {
              marginBottom: 12,
              borderColor: 'color-mix(in srgb, var(--accent-blue) 35%, transparent)',
            }
          : {}),
      }}
    >
      <div className="fp-accent-bar" style={{ background: accent }} aria-hidden />
      <div style={{ padding: '14px 14px 14px 17px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 11,
            background: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={18} color={accent} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
            <p
              className="font-sora"
              style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}
            >
              {title}
            </p>
            {badge ? (
              <span className="badge badge-blue" style={{ fontSize: 9, padding: '2px 6px' }}>
                {badge}
              </span>
            ) : null}
            {badgeClass ? (
              <span className={`badge ${badgeClass}`} style={{ fontSize: 9, padding: '2px 6px' }}>
                {badgeClass === 'diff-beginner'
                  ? 'Principiante'
                  : badgeClass === 'diff-intermediate'
                    ? 'Intermedio'
                    : 'Avanzado'}
              </span>
            ) : null}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{desc}</p>
        </div>
        <ChevronRight size={16} color="var(--text-muted)" className="shrink-0" aria-hidden />
      </div>
    </Link>
  );
}

function keepPara(to: string, paraMi: boolean): string {
  if (!paraMi) return to;
  return `${to}${to.includes('?') ? '&' : '?'}para=mi`;
}

export const RoutineChooserPage = () => {
  const [searchParams] = useSearchParams();
  const paraMi = searchParams.get('para') === 'mi';

  return (
  <div>
    <section style={{ paddingBottom: 14 }}>
      <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
        <ClipboardList size={10} style={{ marginRight: 3 }} />
        {paraMi ? 'Tu entrenamiento' : 'Biblioteca'}
      </span>
      <h1
        className="font-sora"
        style={{
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: '-.02em',
          color: 'var(--text-primary)',
          marginTop: 8,
          marginBottom: 4,
        }}
      >
        {paraMi ? 'Crear mi rutina' : 'Crear rutina'}
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
        {paraMi
          ? 'Esta rutina será tu plan activo. Luego la ejecutas en la app de cliente.'
          : 'Elige plantilla o nivel de formulario. Después defines las semanas del plan (1–8).'}
      </p>
    </section>

    <ChooserCard
      to={keepPara(PRESET_CARD.to, paraMi)}
      title={PRESET_CARD.title}
      desc={PRESET_CARD.desc}
      badge={PRESET_CARD.badge}
      accent={PRESET_CARD.accent}
      bg={PRESET_CARD.bg}
      icon={LayoutTemplate}
      borderAccent
    />

    <p className="fp-cal-label" style={{ marginTop: 16, marginBottom: 8 }}>
      O crea desde cero
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {LEVELS.map(({ to, title, desc, badgeClass, accent, bg }, i) => (
        <ChooserCard
          key={to}
          to={keepPara(to, paraMi)}
          title={title}
          desc={desc}
          badgeClass={badgeClass}
          accent={accent}
          bg={bg}
          icon={ClipboardList}
          animationDelay={`${i * 40}ms`}
        />
      ))}
    </div>
  </div>
  );
};
