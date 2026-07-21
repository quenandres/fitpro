import { Link } from 'react-router-dom';
import {
  Activity,
  Armchair,
  BicepsFlexed,
  ChevronRight,
  Dumbbell,
  Layers,
} from 'lucide-react';

const CATALOG_SECTIONS = [
  {
    to: '/library/ejercicios',
    Icon: Dumbbell,
    title: 'Explorar ejercicios',
    desc: 'Busca y filtra en ExerciseDB',
    accent: '#58a6ff',
    bg: 'rgba(88,166,255,.12)',
  },
  {
    to: '/library/partes',
    Icon: Layers,
    title: 'Partes del cuerpo',
    desc: 'Catálogo body parts',
    accent: '#22c55e',
    bg: 'rgba(34,197,94,.12)',
  },
  {
    to: '/library/equipo',
    Icon: Armchair,
    title: 'Equipamiento',
    desc: 'Filtra por material',
    accent: '#a371f7',
    bg: 'rgba(163,113,247,.12)',
  },
  {
    to: '/library/tipos',
    Icon: Activity,
    title: 'Tipos de ejercicio',
    desc: 'Fuerza, cardio, yoga…',
    accent: '#f59e0b',
    bg: 'rgba(245,158,11,.12)',
  },
  {
    to: '/library/musculos',
    Icon: BicepsFlexed,
    title: 'Músculos',
    desc: 'Objetivos musculares',
    accent: '#f472b6',
    bg: 'rgba(244,114,182,.12)',
  },
] as const;

export const AdminCatalogoTab = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
      Mismo catálogo ExerciseDB que en Biblioteca, accesible desde Admin.
    </p>
    {CATALOG_SECTIONS.map(({ to, Icon, title, desc, accent, bg }) => (
      <Link
        key={to}
        to={to}
        className="fp-card fp-card-hover"
        style={{
          textDecoration: 'none',
          padding: '14px 16px',
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
          <p className="font-sora" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            {title}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</p>
        </div>
        <ChevronRight size={16} color="var(--text-muted)" />
      </Link>
    ))}
  </div>
);
