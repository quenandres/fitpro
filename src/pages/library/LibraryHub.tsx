import { Link } from 'react-router-dom';
import {
  Activity,
  Armchair,
  BicepsFlexed,
  BookOpen,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  Layers,
  LayoutTemplate,
  Ruler,
  Sparkles,
  CalendarDays,
  Users,
} from 'lucide-react';
import { ROUTES } from '../../routes/paths';

const LIBRARY_ACCENT = '#58a6ff';
const { library: lib } = ROUTES;

const CREAR_SECTIONS = [
  {
    to: lib.rutinasPlantillas,
    Icon: LayoutTemplate,
    title: 'Plantillas',
    desc: 'Hyrox, isométricos, pliometría, HIIT y más',
    accent: '#58a6ff',
    bg: 'rgba(88,166,255,.12)',
  },
  {
    to: lib.rutinasNueva,
    Icon: ClipboardList,
    title: 'Crear rutina',
    desc: 'Formularios básico, intermedio y avanzado con ExerciseDB',
    accent: '#58a6ff',
    bg: 'rgba(88,166,255,.12)',
  },
  {
    to: lib.ia,
    Icon: Sparkles,
    title: 'Rutina con IA',
    desc: 'Chat multi-turno: propone ejercicios y los enlaza con ExerciseDB',
    accent: '#22c55e',
    bg: 'rgba(34,197,94,.12)',
  },
] as const;

const CATALOGO_SECTIONS = [
  {
    to: lib.catalogo.ejercicios,
    Icon: Dumbbell,
    title: 'Explorar ejercicios',
    desc: 'Busca y filtra por tipo, parte, equipo o músculo (ExerciseDB)',
    accent: LIBRARY_ACCENT,
    bg: 'rgba(88,166,255,.12)',
  },
  {
    to: lib.catalogo.partes,
    Icon: Layers,
    title: 'Partes del cuerpo',
    desc: 'Catálogo de body parts de ExerciseDB',
    accent: '#22c55e',
    bg: 'rgba(34,197,94,.12)',
  },
  {
    to: lib.catalogo.equipo,
    Icon: Armchair,
    title: 'Equipamiento',
    desc: 'Filtra ejercicios por material disponible',
    accent: '#a371f7',
    bg: 'rgba(163,113,247,.12)',
  },
  {
    to: lib.catalogo.tipos,
    Icon: Activity,
    title: 'Tipos de ejercicio',
    desc: 'Fuerza, cardio, yoga, stretching…',
    accent: '#f59e0b',
    bg: 'rgba(245,158,11,.12)',
  },
  {
    to: lib.catalogo.musculos,
    Icon: BicepsFlexed,
    title: 'Músculos',
    desc: 'Objetivos musculares del catálogo',
    accent: '#f472b6',
    bg: 'rgba(244,114,182,.12)',
  },
] as const;

const GESTION_SECTIONS = [  
  {
    to: ROUTES.calendar,
    Icon: CalendarDays,
    title: 'Calendario',
    desc: 'Citas con clientes y días de entreno',
    accent: '#f0883e',
    bg: 'rgba(240,136,62,.12)',
  },
  {
    to: lib.planes,
    Icon: Users,
    title: 'Planes de usuario',
    desc: 'Asigna rutinas semanales a clientes',
    accent: '#a371f7',
    bg: 'rgba(163,113,247,.12)',
  }  
] as const;

const HubSection = ({
  title,
  sections,
}: {
  title?: string;
  sections: ReadonlyArray<{
    to: string;
    Icon: typeof BookOpen;
    title: string;
    desc: string;
    accent: string;
    bg: string;
  }>;
}) => (
  <>
    {title && (
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '.06em',
          margin: '0 0 8px',
        }}
      >
        {title}
      </p>
    )}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
      {sections.map(({ to, Icon, title: sectionTitle, desc, accent, bg }) => (
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
              {sectionTitle}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.35 }}>{desc}</p>
          </div>
          <ChevronRight size={16} color="var(--text-muted)" className="shrink-0" />
        </Link>
      ))}
    </div>
  </>
);

export const LibraryHub = () => (
  <div>
    <section className="animate-slide-up" style={{ paddingBottom: 16 }}>
      <div style={{ marginBottom: 10 }}>
        <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
          <BookOpen size={10} style={{ marginRight: 3 }} />
          Datos
        </span>
      </div>
      <h1 className="font-sora text-2xl md:text-[28px] font-bold leading-tight tracking-tight text-primary mb-1">
        Datos
      </h1>
      <p className="text-sm text-secondary">
        Administra el catálogo, las rutinas y los recursos persistidos.
      </p>
    </section>

    <div className="animate-slide-up delay-100">
      <HubSection title="Gestión" sections={GESTION_SECTIONS} />
      <HubSection title="Catálogo ExerciseDB" sections={CATALOGO_SECTIONS} />
      <HubSection title="Crear" sections={CREAR_SECTIONS} />
    </div>
  </div>
);
