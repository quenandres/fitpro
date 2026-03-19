import { useState, useMemo } from 'react';
import { Search, X, BookOpen, SlidersHorizontal } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import type { Ejercicio } from '../types';
import { Navbar, BottomNav } from '../components/layout/Navbar';
import { ExerciseCard } from '../components/exercise/ExerciseCard';

export const ExerciseLibrary = () => {
  const ejercicios = useDataStore((s) => s.ejercicios);
  const [search,   setSearch]   = useState('');
  const [muscle,   setMuscle]   = useState('');
  const [equip,    setEquip]    = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState<Ejercicio | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const muscles    = [...new Set(ejercicios.flatMap((e) => e.grupo_muscular))];
  const equips     = [...new Set(ejercicios.flatMap((e) => e.equipamiento).filter(Boolean))];
  const categories = [...new Set(ejercicios.map((e) => e.categoria))];

  const filtered = useMemo(
    () =>
      ejercicios.filter((e) => {
        const okS = !search   || e.nombre.toLowerCase().includes(search.toLowerCase());
        const okM = !muscle   || e.grupo_muscular.includes(muscle);
        const okE = !equip    || e.equipamiento.includes(equip);
        const okC = !category || e.categoria === category;
        return okS && okM && okE && okC;
      }),
    [search, muscle, equip, category, ejercicios]
  );

  const hasFilters = muscle || equip || category;
  const filterCount = [muscle, equip, category].filter(Boolean).length;
  const clearFilters = () => { setMuscle(''); setEquip(''); setCategory(''); };

  function getDiffCls(d: string) {
    if (d.toLowerCase().includes('avanzado'))   return 'diff-advanced';
    if (d.toLowerCase().includes('intermedio')) return 'diff-intermediate';
    return 'diff-beginner';
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      <Navbar />
      <BottomNav />

      <main
        className="max-w-md mx-auto"
        style={{ paddingTop: 70, paddingBottom: 80, paddingLeft: 16, paddingRight: 16 }}
      >

        {/* ── Hero ──────────────────────────────────────── */}
        <section className="animate-slide-up" style={{ paddingTop: 20, paddingBottom: 16 }}>
          <div style={{ marginBottom: 10 }}>
            <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
              <BookOpen size={10} style={{ marginRight: 3 }} />
              Biblioteca completa
            </span>
          </div>
          <h1
            className="font-sora"
            style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-.02em', color: 'var(--text-primary)', marginBottom: 4 }}
          >
            Ejercicios
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {ejercicios.length} ejercicios disponibles
          </p>
        </section>

        {/* ── Search + filter toggle ────────────────────── */}
        <div className="animate-slide-up delay-100 flex gap-2" style={{ marginBottom: 12 }}>
          <div className="relative flex-1">
            <Search
              size={14}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
            <input
              className="fp-input"
              style={{ paddingLeft: 32 }}
              type="text"
              placeholder="Buscar ejercicios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="fp-btn fp-btn-secondary relative"
            style={{
              width: 40, height: 40, padding: 0, borderRadius: 11, flexShrink: 0,
              borderColor: hasFilters ? 'rgba(34,197,94,.4)' : undefined,
              color: hasFilters ? 'var(--brand)' : undefined,
            }}
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal size={16} />
            {filterCount > 0 && (
              <span
                style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'var(--brand)', color: '#fff',
                  fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {filterCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Filter chips (always-visible quick filters) ── */}
        <div
          className="animate-slide-up delay-150 scrollbar-hide flex gap-1.5 overflow-x-auto"
          style={{ paddingBottom: 4, marginBottom: 12 }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(category === cat ? '' : cat)}
              style={{
                flexShrink: 0,
                padding: '5px 12px',
                borderRadius: 100,
                fontSize: 11, fontWeight: 600,
                cursor: 'pointer', border: 'none', outline: 'none',
                whiteSpace: 'nowrap',
                background: category === cat ? 'rgba(34,197,94,.12)' : 'var(--bg-elevated)',
                color: category === cat ? 'var(--brand-bright)' : 'var(--text-secondary)',
                border: `1px solid ${category === cat ? 'rgba(34,197,94,.3)' : 'var(--border)'}`,
                transition: 'all .15s',
              } as React.CSSProperties}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Expanded filter panel ────────────────────── */}
        {showFilters && (
          <div
            className="fp-card animate-slide-down"
            style={{ padding: 14, marginBottom: 12, borderRadius: 13 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Músculo',   val: muscle,   set: setMuscle,   opts: muscles },
                { label: 'Equipo',    val: equip,    set: setEquip,    opts: equips  },
              ].map(({ label, val, set, opts }) => (
                <div key={label}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    {label}
                  </p>
                  <select
                    className="fp-input"
                    style={{ padding: '8px 12px' }}
                    value={val}
                    onChange={(e) => set(e.target.value)}
                  >
                    <option value="">Todos</option>
                    {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}

              {hasFilters && (
                <button
                  className="fp-btn fp-btn-ghost"
                  style={{ color: 'var(--accent-red)', width: '100%' }}
                  onClick={clearFilters}
                >
                  <X size={14} /> Limpiar filtros
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Results count ────────────────────────────── */}
        {hasFilters && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
            Mostrando{' '}
            <span style={{ color: 'var(--brand)', fontWeight: 600 }}>{filtered.length}</span>
            {' '}de {ejercicios.length} ejercicios
          </p>
        )}

        {/* ── List ─────────────────────────────────────── */}
        <div className="animate-slide-up delay-200" style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {filtered.map((ej, i) => (
            <div
              key={ej.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <ExerciseCard ejercicio={ej} onClick={() => setSelected(ej)} />
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
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Intenta con otros filtros</p>
          </div>
        )}
      </main>

      {/* ── Modal detalle ─────────────────────────────── */}
      {selected && (
        <div
          className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)', padding: 16 }}
          onClick={() => setSelected(null)}
        >
          <div
            className="fp-card animate-slide-up w-full max-w-md overflow-hidden"
            style={{ borderRadius: 20, maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent */}
            <div style={{ height: 3, background: 'linear-gradient(90deg,var(--brand),var(--accent-blue))' }} />

            <div style={{ padding: 18 }}>
              {/* Header */}
              <div className="flex items-start justify-between" style={{ marginBottom: 14 }}>
                <div className="flex-1 min-w-0" style={{ paddingRight: 12 }}>
                  <span className="badge badge-brand" style={{ marginBottom: 6, display: 'inline-flex' }}>
                    {selected.categoria}
                  </span>
                  <h2
                    className="font-sora"
                    style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}
                  >
                    {selected.nombre}
                  </h2>
                </div>
                <button
                  className="fp-btn fp-btn-ghost"
                  style={{ padding: '6px 8px', borderRadius: 9, flexShrink: 0 }}
                  onClick={() => setSelected(null)}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Descripción */}
                <div
                  style={{
                    padding: 12, borderRadius: 11,
                    background: 'var(--bg-overlay)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {selected.descripcion}
                  </p>
                </div>

                {/* Músculos */}
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 7 }}>
                    Grupos Musculares
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {selected.grupo_muscular.map((m) => (
                      <span key={m} className="badge badge-brand">{m}</span>
                    ))}
                  </div>
                </div>

                {/* Equipamiento */}
                {selected.equipamiento.length > 0 && (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 7 }}>
                      Equipamiento
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {selected.equipamiento.map((eq) => (
                        <span
                          key={eq}
                          className="badge"
                          style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                        >
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dificultad */}
                <div
                  className="flex items-center justify-between"
                  style={{ padding: '10px 12px', borderRadius: 11, background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}
                >
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Dificultad</span>
                  <span className={`badge ${getDiffCls(selected.dificultad)}`}>
                    {selected.dificultad}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function getDiffCls(d: string) {
    if (d.toLowerCase().includes('avanzado'))   return 'diff-advanced';
    if (d.toLowerCase().includes('intermedio')) return 'diff-intermediate';
    return 'diff-beginner';
  }
};
