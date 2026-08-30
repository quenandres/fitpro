import { Link } from 'react-router-dom';
import { ChevronRight, ClipboardList, LayoutTemplate } from 'lucide-react';
import { ROUTES } from '../../routes/paths';

const { library: lib } = ROUTES;

const PRESET_CARD = {
  to: lib.rutinasPlantillas,
  title: 'Desde plantilla',
  desc: 'Hyrox, isométricos, pliometría, HIIT y más — ejercicios resueltos con ExerciseDB',
  badge: '20+ presets',
  accent: '#58a6ff',
  bg: 'rgba(88,166,255,.12)',
} as const;

const LEVELS = [
  {
    to: lib.rutinaNueva('basica'),
    title: 'Básica',
    desc: 'Nombre + ejercicios (ExerciseDB) + series/reps',
    badge: 'Principiante',
    accent: '#22c55e',
    bg: 'rgba(34,197,94,.12)',
  },
  {
    to: lib.rutinaNueva('intermedia'),
    title: 'Intermedia',
    desc: 'Categoría, duración, descanso, notas y filtros API',
    badge: 'Intermedio',
    accent: '#58a6ff',
    bg: 'rgba(88,166,255,.12)',
  },
  {
    to: lib.rutinaNueva('avanzada'),
    title: 'Avanzada',
    desc: 'Tipo EMOM/AMRAP/circuito, RPE y supersets',
    badge: 'Avanzado',
    accent: '#a371f7',
    bg: 'rgba(163,113,247,.12)',
  },
] as const;

export const RoutineChooserPage = () => (
  <div>
    <section className="animate-slide-up" style={{ paddingBottom: 16 }}>
      <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
        <ClipboardList size={10} style={{ marginRight: 3 }} />
        Crear rutina
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
        Elige el nivel
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
        Tres formularios con más campos según tu experiencia. Después eliges cómo armar las semanas (1–8).
      </p>
    </section>

    <Link
      to={PRESET_CARD.to}
      className="fp-card fp-card-hover animate-slide-up"
      style={{
        textDecoration: 'none',
        padding: '14px 16px',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
        borderColor: 'rgba(88,166,255,.35)',
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 11,
          background: PRESET_CARD.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <LayoutTemplate size={18} color={PRESET_CARD.accent} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <p
            className="font-sora"
            style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}
          >
            {PRESET_CARD.title}
          </p>
          <span className="badge badge-blue" style={{ fontSize: 9, padding: '2px 6px' }}>
            {PRESET_CARD.badge}
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.35 }}>
          {PRESET_CARD.desc}
        </p>
      </div>
      <ChevronRight size={16} color="var(--text-muted)" className="shrink-0" />
    </Link>

    <p
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '.06em',
        marginBottom: 8,
      }}
    >
      O crea desde cero
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      {LEVELS.map(({ to, title, desc, badge, accent, bg }, i) => (
        <Link
          key={to}
          to={to}
          className="fp-card fp-card-hover animate-slide-up"
          style={{
            textDecoration: 'none',
            padding: '14px 16px',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            animationDelay: `${i * 40}ms`,
          }}
        >
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
            <ClipboardList size={18} color={accent} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <p
                className="font-sora"
                style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}
              >
                {title}
              </p>
              <span
                className="badge"
                style={{
                  fontSize: 9,
                  padding: '2px 6px',
                  background: bg,
                  color: accent,
                  border: `1px solid ${accent}33`,
                }}
              >
                {badge}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.35 }}>{desc}</p>
          </div>
          <ChevronRight size={16} color="var(--text-muted)" className="shrink-0" />
        </Link>
      ))}
    </div>
  </div>
);
