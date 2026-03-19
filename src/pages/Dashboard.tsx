import { useState, useMemo } from 'react';
import { Search, Zap, Target, Flame, Clock } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { WorkoutCard } from '../components/dashboard/WorkoutCard';
import { Navbar, BottomNav } from '../components/layout/Navbar';

export const Dashboard = () => {
  const [search, setSearch] = useState('');
  const rutinas = useDataStore((s) => s.rutinas);

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
    { icon: Target, label: 'Rutinas',    value: rutinas.length, accent: '#22c55e',  bg: 'rgba(34,197,94,.12)'  },
    { icon: Flame,  label: 'Ejercicios', value: totalEjercicios, accent: '#58a6ff', bg: 'rgba(88,166,255,.12)' },
    { icon: Clock,  label: 'Prom. min',  value: avgMin,          accent: '#a371f7', bg: 'rgba(163,113,247,.12)'},
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      <Navbar />
      <BottomNav />

      <main
        className="max-w-md mx-auto"
        style={{ paddingTop: 70, paddingBottom: 80, paddingLeft: 16, paddingRight: 16 }}
      >

        {/* ── Hero ─────────────────────────────────────── */}
        <section className="animate-slide-up" style={{ paddingTop: 20, paddingBottom: 16 }}>
          {/* Eyebrow badge */}
          <div className="flex items-center gap-1.5 mb-2.5" style={{ marginBottom: 10 }}>
            <span className="badge badge-brand" style={{ fontSize: 11, padding: '3px 9px' }}>
              <Zap size={10} style={{ marginRight: 3 }} />
              Bienvenido de vuelta
            </span>
          </div>
          <h1
            className="font-sora"
            style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-.02em', color: 'var(--text-primary)', marginBottom: 4 }}
          >
            Hola, <span className="text-gradient">Atleta</span> 👋
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            ¿Listo para entrenar hoy?
          </p>
        </section>

        {/* ── Stats ────────────────────────────────────── */}
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
              <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Search ───────────────────────────────────── */}
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

        {/* ── Section header ───────────────────────────── */}
        <div
          className="animate-slide-up delay-200 flex items-center justify-between"
          style={{ marginBottom: 12 }}
        >
          <span className="font-sora" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            Tus Rutinas
          </span>
          <span
            className="badge"
            style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', fontSize: 10, padding: '2px 8px' }}
          >
            {filtered.length} total
          </span>
        </div>

        {/* ── Cards ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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

        {/* ── Empty state ──────────────────────────────── */}
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

      </main>
    </div>
  );
};
