import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, Target, Flame, Clock, ChevronRight, Users, Ruler, Dumbbell, CalendarDays } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { WorkoutCard } from '../components/dashboard/WorkoutCard';
import { AppShell } from '../components/layout/AppShell';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/paths';

const { library: lib } = ROUTES;

const MODULE_SHORTCUTS = [
  {
    to: ROUTES.calendar,
    Icon: CalendarDays,
    title: 'Calendario',
    desc: 'Citas con clientes y días de rutina',
    accent: '#f0883e',
    bg: 'rgba(240,136,62,.12)',
  },
  {
    to: lib.planes,
    Icon: Users,
    title: 'Planes',
    desc: 'Asignación semanal a clientes',
    accent: '#a371f7',
    bg: 'rgba(163,113,247,.12)',
  },
  {
    to: lib.unidades,
    Icon: Ruler,
    title: 'Unidades',
    desc: 'Conteo, peso, tiempo, distancia',
    accent: '#58a6ff',
    bg: 'rgba(88,166,255,.12)',
  },
  {
    to: lib.catalogo.ejercicios,
    Icon: Dumbbell,
    title: 'Catálogo',
    desc: 'Referencia ExerciseDB',
    accent: '#22c55e',
    bg: 'rgba(34,197,94,.12)',
  },
] as const;

const displayNameFromEmail = (email?: string): string => {
  if (!email) return 'Admin';
  const local = email.split('@')[0]?.trim();
  if (!local) return 'Admin';
  return local.charAt(0).toUpperCase() + local.slice(1);
};

export const Dashboard = () => {
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const rutinas = useDataStore((s) => s.rutinas);
  const displayName = displayNameFromEmail(user?.email);

  const filtered = useMemo(() => {
    if (!search.trim()) return rutinas;
    const s = search.toLowerCase();
    return rutinas.filter(
      (r) => r.nombre.toLowerCase().includes(s) || r.categoria.toLowerCase().includes(s)
    );
  }, [search, rutinas]);

  const totalEjercicios = rutinas.reduce((a, r) => a + r.ejercicios.length, 0);
  const avgMin = Math.round(rutinas.reduce((a, r) => a + r.duracion_min, 0) / (rutinas.length || 1));

  const STATS = [
    { icon: Target, label: 'Rutinas',         value: rutinas.length, accent: '#22c55e',  bg: 'rgba(34,197,94,.12)'  },
    { icon: Flame,  label: 'Ejercicios',      value: totalEjercicios, accent: '#58a6ff', bg: 'rgba(88,166,255,.12)' },
    { icon: Clock,  label: 'Duración media',  value: avgMin,          accent: '#a371f7', bg: 'rgba(163,113,247,.12)'},
  ];

  return (
    <AppShell>
        <section className="animate-slide-up" style={{ paddingTop: 20, paddingBottom: 16 }}>
          <div className="flex items-center gap-1.5 mb-2.5" style={{ marginBottom: 10 }}>
            <span className="badge badge-brand" style={{ fontSize: 11, padding: '3px 9px' }}>
              <Shield size={10} style={{ marginRight: 3 }} />
              Panel de administración
            </span>
          </div>
          <h1
            className="font-sora"
            style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-.02em', color: 'var(--text-primary)', marginBottom: 4 }}
          >
            Hola, <span className="text-gradient">{displayName}</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Gestiona rutinas, catálogo, planes y unidades.
          </p>
        </section>

        <div
          className="animate-slide-up delay-100"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}
        >
          {STATS.map(({ icon: Icon, label, value, accent, bg }) => (
            <div
              key={label}
              className="fp-card"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px 6px', borderRadius: 14 }}
            >
              <div style={{ width: 30, height: 30, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
                <Icon size={14} color={accent} />
              </div>
              <span className="font-sora" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                {value}
              </span>
              <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', textAlign: 'center' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="animate-slide-up delay-150 grid grid-cols-1 md:grid-cols-3 gap-2" style={{ marginBottom: 16 }}>
          {MODULE_SHORTCUTS.map(({ to, Icon, title, desc, accent, bg }) => (
            <Link
              key={to}
              to={to}
              className="fp-card fp-card-hover"
              style={{
                textDecoration: 'none',
                padding: '12px 14px',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={16} color={accent} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="font-sora" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {title}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.35 }}>{desc}</p>
              </div>
              <ChevronRight size={14} color="var(--text-muted)" className="shrink-0" />
            </Link>
          ))}
        </div>

        <div className="animate-slide-up delay-150 relative" style={{ marginBottom: 16 }}>
          <Search
            size={14}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
          <input
            className="fp-input"
            style={{ paddingLeft: 34 }}
            type="text"
            placeholder="Buscar rutinas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div
          className="animate-slide-up delay-200 flex items-center justify-between"
          style={{ marginBottom: 12 }}
        >
          <span className="font-sora" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            Rutinas
          </span>
          <span
            className="badge"
            style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', fontSize: 10, padding: '2px 8px' }}
          >
            {filtered.length} total
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filtered.map((rutina, i) => (
            <div
              key={rutina.id}
              className="animate-slide-up"
              style={{ animationDelay: `${250 + i * 50}ms` }}
            >
              <WorkoutCard rutina={rutina} />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="animate-fade-in text-center" style={{ paddingTop: 48 }}>
            <div
              style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}
            >
              <Search size={22} color="var(--text-muted)" />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Sin resultados</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No se encontraron rutinas</p>
          </div>
        )}

    </AppShell>
  );
};
