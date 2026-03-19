import { Pencil, Trash2 } from 'lucide-react';
import type { Ejercicio } from '../../types';

interface Props {
  ejercicio: Ejercicio;
  onEdit: (ejercicio: Ejercicio) => void;
  onDelete: (id: number) => void;
}

function getCat(cat: string) {
  const c = cat.toLowerCase();
  if (c.includes('fuerza'))    return { emoji: '🏋️', accent: '#f0883e', bg: 'rgba(240,136,62,.12)' };
  if (c.includes('cardio'))    return { emoji: '🔥', accent: '#f85149', bg: 'rgba(248,81,73,.12)'  };
  if (c.includes('funcional')) return { emoji: '⚡', accent: '#d2a679', bg: 'rgba(210,166,121,.12)' };
  if (c.includes('core') || c.includes('abdominal')) return { emoji: '🎯', accent: '#a371f7', bg: 'rgba(163,113,247,.12)' };
  if (c.includes('movilidad')) return { emoji: '🧘', accent: '#58a6ff', bg: 'rgba(88,166,255,.12)'  };
  return                              { emoji: '🏃', accent: '#22c55e', bg: 'rgba(34,197,94,.12)'   };
}

function getDiffCls(dif: string) {
  const d = dif.toLowerCase();
  if (d.includes('avanzado'))   return 'diff-advanced';
  if (d.includes('intermedio')) return 'diff-intermediate';
  return 'diff-beginner';
}

export const AdminExerciseCard = ({ ejercicio, onEdit, onDelete }: Props) => {
  const cat = getCat(ejercicio.categoria);

  return (
    <article className="fp-card fp-card-hover relative overflow-hidden">
      <div className="fp-accent-bar" style={{ background: cat.accent }} />
      <div style={{ padding: '12px 13px 12px 16px' }}>

        {/* Row 1 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 9 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
            {cat.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: cat.accent, textTransform: 'uppercase' as const, letterSpacing: '.04em' }}>
                {ejercicio.categoria}
              </span>
              <span className={`badge ${getDiffCls(ejercicio.dificultad)}`}>{ejercicio.dificultad}</span>
            </div>
            <p className="font-sora" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {ejercicio.nombre}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button onClick={() => onEdit(ejercicio)} className="fp-btn fp-btn-ghost" style={{ width: 28, height: 28, padding: 0, borderRadius: 7 }} title="Editar">
              <Pencil size={12} color="var(--accent-blue)" />
            </button>
            <button onClick={() => onDelete(ejercicio.id)} className="fp-btn fp-btn-ghost" style={{ width: 28, height: 28, padding: 0, borderRadius: 7 }} title="Eliminar">
              <Trash2 size={12} color="var(--accent-red)" />
            </button>
          </div>
        </div>

        {/* Description */}
        {ejercicio.descripcion && (
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 9, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
            {ejercicio.descripcion}
          </p>
        )}

        {/* Muscle + equip tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {ejercicio.grupo_muscular.slice(0, 3).map((m) => (
            <span key={m} className="badge badge-brand" style={{ fontSize: 10 }}>{m}</span>
          ))}
          {ejercicio.grupo_muscular.length > 3 && (
            <span className="badge" style={{ fontSize: 10, background: 'var(--bg-overlay)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
              +{ejercicio.grupo_muscular.length - 3}
            </span>
          )}
          {ejercicio.equipamiento.slice(0, 2).map((eq) => (
            <span key={eq} className="badge" style={{ fontSize: 10, background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
              {eq}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};
