import { Pencil, Trash2, Clock, Target, Layers } from 'lucide-react';
import type { Rutina } from '../../types';

interface Props {
  rutina: Rutina;
  onEdit: () => void;
  onDelete: (id: number) => void;
}

function getCat(cat: string) {
  const c = cat.toLowerCase();
  if (c.includes('fuerza') || c.includes('push') || c.includes('pull'))
    return { emoji: '🏋️', accent: '#f0883e', bg: 'rgba(240,136,62,.12)' };
  if (c.includes('cardio') || c.includes('resistencia') || c.includes('hiit'))
    return { emoji: '🔥', accent: '#f85149', bg: 'rgba(248,81,73,.12)' };
  if (c.includes('funcional') || c.includes('hyrox'))
    return { emoji: '⚡', accent: '#d2a679', bg: 'rgba(210,166,121,.12)' };
  if (c.includes('core') || c.includes('abdominal'))
    return { emoji: '🎯', accent: '#a371f7', bg: 'rgba(163,113,247,.12)' };
  if (c.includes('movilidad') || c.includes('recuper'))
    return { emoji: '🧘', accent: '#58a6ff', bg: 'rgba(88,166,255,.12)' };
  return { emoji: '🏃', accent: '#22c55e', bg: 'rgba(34,197,94,.12)' };
}

function getDiff(dif: string) {
  const d = dif.toLowerCase();
  if (d.includes('avanzado'))   return { cls: 'diff-advanced',    dots: 3 };
  if (d.includes('intermedio')) return { cls: 'diff-intermediate', dots: 2 };
  return                               { cls: 'diff-beginner',     dots: 1 };
}

export const RoutineCard = ({ rutina, onEdit, onDelete }: Props) => {
  const cat   = getCat(rutina.categoria);
  const diff  = getDiff(rutina.dificultad);
  const total = rutina.ejercicios.reduce((a, e) => a + e.series, 0);
  const hasExerciseDb = rutina.ejercicios.some((e) => e.exerciseDbId);

  return (
    <article className="fp-card fp-card-hover relative overflow-hidden">
      <div className="fp-accent-bar" style={{ background: cat.accent }} />
      <div style={{ padding: '13px 14px 13px 17px' }}>

        {/* Row 1 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            {cat.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: cat.accent, textTransform: 'uppercase' as const, letterSpacing: '.05em' }}>
                {rutina.categoria}
              </span>
              <span className={`badge ${diff.cls}`}>{rutina.dificultad}</span>
              {hasExerciseDb && (
                <span
                  className="badge badge-blue"
                  style={{ fontSize: 9, padding: '1px 5px' }}
                >
                  ExerciseDB
                </span>
              )}
            </div>
            <p className="font-sora" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              {rutina.nombre}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
            <button
              onClick={() => onEdit()}
              className="fp-btn fp-btn-ghost"
              style={{ width: 30, height: 30, padding: 0, borderRadius: 8 }}
              title="Editar"
            >
              <Pencil size={13} color="var(--accent-blue)" />
            </button>
            <button
              onClick={() => onDelete(rutina.id)}
              className="fp-btn fp-btn-ghost"
              style={{ width: 30, height: 30, padding: 0, borderRadius: 8 }}
              title="Eliminar"
            >
              <Trash2 size={13} color="var(--accent-red)" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
          {rutina.descripcion}
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
          {[
            { Icon: Clock,  val: `${rutina.duracion_min}m`, lbl: 'dur.'    },
            { Icon: Target, val: rutina.ejercicios.length,  lbl: 'ejerc.'  },
            { Icon: Layers, val: total,                     lbl: 'series'  },
          ].map(({ Icon, val, lbl }) => (
            <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon size={11} color="var(--text-muted)" />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lbl}</span>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i <= diff.dots ? cat.accent : 'var(--bg-overlay)', border: `1px solid ${i <= diff.dots ? cat.accent : 'var(--border)'}` }} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};
