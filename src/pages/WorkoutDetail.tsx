import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Target, Layers, Pencil, ClipboardList } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { useUnits } from '../hooks/useUnits';
import { EmptyState } from '../components/common/EmptyState';
import { AppShell } from '../components/layout/AppShell';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { routineEditPath } from '../utils/inferRoutineFormLevel';

function getDiff(dif: string) {
  const d = dif.toLowerCase();
  if (d.includes('avanzado'))   return { cls: 'diff-advanced',     accent: '#f85149' };
  if (d.includes('intermedio')) return { cls: 'diff-intermediate',  accent: '#f0883e' };
  return                               { cls: 'diff-beginner',      accent: '#22c55e' };
}

function getCat(cat: string) {
  const c = cat.toLowerCase();
  if (c.includes('fuerza'))    return { emoji: '🏋️', accent: '#f0883e', bg: 'rgba(240,136,62,.12)' };
  if (c.includes('cardio'))    return { emoji: '🔥', accent: '#f85149', bg: 'rgba(248,81,73,.12)'  };
  if (c.includes('funcional')) return { emoji: '⚡', accent: '#d2a679', bg: 'rgba(210,166,121,.12)' };
  if (c.includes('core'))      return { emoji: '🎯', accent: '#a371f7', bg: 'rgba(163,113,247,.12)' };
  if (c.includes('movilidad')) return { emoji: '🧘', accent: '#58a6ff', bg: 'rgba(88,166,255,.12)'  };
  return                              { emoji: '🏃', accent: '#22c55e', bg: 'rgba(34,197,94,.12)'   };
}

export const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatearValor } = useUnits();
  const iniciarWorkout = useWorkoutStore((s) => s.iniciarWorkout);
  const rutinas = useDataStore((s) => s.rutinas);
  const rutina = rutinas.find((r) => r.id === Number(id));

  if (!rutina) {
    return (
      <AppShell>
        <EmptyState
          icon={ClipboardList}
          title="Rutina no encontrada"
          description="La rutina que buscas no existe o fue eliminada."
          action={
            <button type="button" className="fp-btn fp-btn-secondary" onClick={() => navigate(-1)}>
              Volver
            </button>
          }
        />
      </AppShell>
    );
  }

  const cat   = getCat(rutina.categoria);
  const diff  = getDiff(rutina.dificultad);
  const total = rutina.ejercicios.reduce((a, e) => a + e.series, 0);

  const handleStart = () => { iniciarWorkout(rutina); navigate('/player'); };
  const handleEdit = () => navigate(routineEditPath(rutina));

  return (
    <AppShell>
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="fp-btn fp-btn-ghost animate-slide-up"
          style={{ marginBottom: 16, padding: '6px 0', gap: 6 }}
        >
          <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={15} color="var(--text-secondary)" />
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Volver</span>
        </button>

        {/* Header card */}
        <div
          className="fp-card animate-slide-up delay-50 relative overflow-hidden"
          style={{ padding: 18, marginBottom: 16, borderRadius: 16 }}
        >
          <div className="fp-accent-bar" style={{ background: cat.accent }} />
          <div style={{ paddingLeft: 4 }}>
            {/* Category + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {cat.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2" style={{ marginBottom: 3 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: cat.accent, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    {rutina.categoria}
                  </span>
                  <span className={`badge ${diff.cls}`}>{rutina.dificultad}</span>
                </div>
                <h1 className="font-sora" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {rutina.nombre}
                </h1>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
              {rutina.descripcion}
            </p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                { Icon: Clock,  val: `${rutina.duracion_min}`, lbl: 'minutos',    accent: 'var(--accent-blue)'   },
                { Icon: Target, val: `${rutina.ejercicios.length}`, lbl: 'ejercicios', accent: 'var(--brand)'        },
                { Icon: Layers, val: `${total}`,               lbl: 'series',     accent: 'var(--accent-purple)' },
              ].map(({ Icon, val, lbl, accent }) => (
                <div
                  key={lbl}
                  style={{
                    padding: '10px 8px', borderRadius: 11, textAlign: 'center',
                    background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)',
                  }}
                >
                  <Icon size={15} color={accent} style={{ margin: '0 auto 4px' }} />
                  <p className="font-sora" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{val}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{lbl}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Exercise list header */}
        <div className="animate-slide-up delay-100 flex items-center justify-between" style={{ marginBottom: 10 }}>
          <span className="font-sora" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            Ejercicios
          </span>
          <span className="badge" style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
            {rutina.ejercicios.length} total
          </span>
        </div>

        {/* Exercise rows */}
        <div
          className="animate-slide-up delay-150"
          style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 24 }}
        >
          {rutina.ejercicios.map((ej, idx) => (
            <div
              key={idx}
              className="fp-card"
              style={{ padding: '11px 13px' }}
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                    background: cat.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <span className="font-sora" style={{ fontSize: 12, fontWeight: 700, color: cat.accent }}>
                    {idx + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 1 }}>{ej.nombre}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {ej.series} series × {formatearValor(ej.valor, ej.unidad_id)}
                  </p>
                </div>
                <div
                  style={{
                    padding: '4px 10px', borderRadius: 8,
                    background: cat.bg, border: `1px solid ${cat.accent}33`,
                  }}
                >
                  <span className="font-sora" style={{ fontSize: 12, fontWeight: 700, color: cat.accent }}>
                    {ej.series}×
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="animate-slide-up delay-200 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleEdit}
            className="fp-btn fp-btn-primary w-full"
            style={{ width: '100%', padding: '14px', fontSize: 14, borderRadius: 13, gap: 8 }}
          >
            <Pencil size={16} />
            Editar rutina
          </button>
          <button
            type="button"
            onClick={handleStart}
            className="fp-btn fp-btn-secondary w-full"
            style={{ width: '100%', padding: '12px', fontSize: 13, borderRadius: 13, gap: 8 }}
          >
            <Play size={15} />
            Vista previa del player
          </button>
        </div>

    </AppShell>
  );
};
