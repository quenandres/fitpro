import { Link } from 'react-router-dom';
import {
  Activity,
  Armchair,
  BicepsFlexed,
  BookOpen,
  ChevronRight,
  ClipboardList,
  Database,
  Dumbbell,
  Layers,
  LayoutTemplate,
  Ruler,
  Sparkles,
  Users,
} from 'lucide-react';

const LIBRARY_ACCENT = '#58a6ff';

const SECTIONS = [
  {
    to: '/library/rutina/plantillas',
    Icon: LayoutTemplate,
    title: 'Plantillas',
    desc: 'Hyrox, isométricos, pliometría, HIIT y más',
    accent: '#58a6ff',
    bg: 'rgba(88,166,255,.12)',
  },
  {
    to: '/library/rutina',
    Icon: ClipboardList,
    title: 'Crear rutina',
    desc: 'Formularios básico, intermedio y avanzado con ExerciseDB',
    accent: '#58a6ff',
    bg: 'rgba(88,166,255,.12)',
  },
  {
    to: '/library/ia',
    Icon: Sparkles,
    title: 'Rutina con IA',
    desc: 'Chat multi-turno: propone ejercicios y los enlaza con ExerciseDB',
    accent: '#22c55e',
    bg: 'rgba(34,197,94,.12)',
  },
  {
    to: '/library/ejercicios',
    Icon: Dumbbell,
    title: 'Explorar ejercicios',
    desc: 'Busca y filtra por tipo, parte, equipo o músculo',
    accent: LIBRARY_ACCENT,
    bg: 'rgba(88,166,255,.12)',
  },
  {
    to: '/library/partes',
    Icon: Layers,
    title: 'Partes del cuerpo',
    desc: 'Catálogo de body parts de ExerciseDB',
    accent: '#22c55e',
    bg: 'rgba(34,197,94,.12)',
  },
  {
    to: '/library/equipo',
    Icon: Armchair,
    title: 'Equipamiento',
    desc: 'Filtra ejercicios por material disponible',
    accent: '#a371f7',
    bg: 'rgba(163,113,247,.12)',
  },
  {
    to: '/library/tipos',
    Icon: Activity,
    title: 'Tipos de ejercicio',
    desc: 'Fuerza, cardio, yoga, stretching…',
    accent: '#f59e0b',
    bg: 'rgba(245,158,11,.12)',
  },
  {
    to: '/library/musculos',
    Icon: BicepsFlexed,
    title: 'Músculos',
    desc: 'Objetivos musculares del catálogo',
    accent: '#f472b6',
    bg: 'rgba(244,114,182,.12)',
  },
] as const;

const GESTION_SECTIONS = [
  {
    to: '/library/rutinas',
    Icon: ClipboardList,
    title: 'Mis rutinas',
    desc: 'Lista, edita y elimina rutinas guardadas',
    accent: '#58a6ff',
    bg: 'rgba(88,166,255,.12)',
  },
  {
    to: '/library/mis-ejercicios',
    Icon: Activity,
    title: 'Mis ejercicios',
    desc: 'Ejercicios personalizados fuera de ExerciseDB',
    accent: '#22c55e',
    bg: 'rgba(34,197,94,.12)',
  },
  {
    to: '/library/planes',
    Icon: Users,
    title: 'Planes de usuario',
    desc: 'Asigna rutinas semanales a clientes',
    accent: '#a371f7',
    bg: 'rgba(163,113,247,.12)',
  },
  {
    to: '/library/unidades',
    Icon: Ruler,
    title: 'Unidades',
    desc: 'Conteo, peso, tiempo, distancia…',
    accent: '#58a6ff',
    bg: 'rgba(88,166,255,.12)',
  },
  {
    to: '/library/datos',
    Icon: Database,
    title: 'Datos locales',
    desc: 'Exportar, importar o restaurar backup JSON',
    accent: '#f0883e',
    bg: 'rgba(240,136,62,.12)',
  },
] as const;

export const LibraryHub = () => (
  <div>
    <section className="animate-slide-up" style={{ paddingBottom: 16 }}>
      <div style={{ marginBottom: 10 }}>
        <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
          <BookOpen size={10} style={{ marginRight: 3 }} />
          ExerciseDB
        </span>
      </div>
      <h1
        className="font-sora"
        style={{
          fontSize: 28,
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: '-.02em',
          color: 'var(--text-primary)',
          marginBottom: 4,
        }}
      >
        Biblioteca
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
        Explora el catálogo externo: ejercicios, partes, equipo, tipos y músculos.
      </p>
    </section>

    <div
      className="animate-slide-up delay-100"
      style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      {SECTIONS.map(({ to, Icon, title, desc, accent, bg }, i) => (
        <Link
          key={to}
          to={to}
          className="fp-card fp-card-hover animate-slide-up"
          style={{
            textDecoration: 'none',
            padding: '14px 14px 14px 16px',
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
            <Icon size={18} color={accent} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              className="font-sora"
              style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}
            >
              {title}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.35 }}>
              {desc}
            </p>
          </div>
          <ChevronRight size={16} color="var(--text-muted)" className="shrink-0" />
        </Link>
      ))}
    </div>

    <p
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '.06em',
        margin: '20px 0 8px',
      }}
    >
      Gestión
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {GESTION_SECTIONS.map(({ to, Icon, title, desc, accent, bg }) => (
        <Link
          key={to}
          to={to}
          className="fp-card fp-card-hover"
          style={{
            textDecoration: 'none',
            padding: '14px 14px 14px 16px',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
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
            <Icon size={18} color={accent} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              className="font-sora"
              style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}
            >
              {title}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.35 }}>
              {desc}
            </p>
          </div>
          <ChevronRight size={16} color="var(--text-muted)" className="shrink-0" />
        </Link>
      ))}
    </div>
  </div>
);
