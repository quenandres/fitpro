import { ChevronRight } from 'lucide-react';
import type { Ejercicio } from '../../types';

interface Props {
  ejercicio: Ejercicio;
  onClick: () => void;
}

function getCat(cat: string) {
  const c = cat.toLowerCase();
  if (c.includes('fuerza'))    return { emoji: '🏋️', accent: '#f0883e', bg: 'rgba(240,136,62,.12)' };
  if (c.includes('cardio'))    return { emoji: '🔥', accent: '#f85149', bg: 'rgba(248,81,73,.12)' };
  if (c.includes('funcional')) return { emoji: '⚡', accent: '#d2a679', bg: 'rgba(210,166,121,.12)' };
  if (c.includes('core') || c.includes('abdominal')) return { emoji: '🎯', accent: '#a371f7', bg: 'rgba(163,113,247,.12)' };
  if (c.includes('movilidad')) return { emoji: '🧘', accent: '#58a6ff', bg: 'rgba(88,166,255,.12)' };
  return                              { emoji: '🏃', accent: '#22c55e', bg: 'rgba(34,197,94,.12)' };
}

function getDiffCls(dif: string) {
  const d = dif.toLowerCase();
  if (d.includes('avanzado'))   return 'diff-advanced';
  if (d.includes('intermedio')) return 'diff-intermediate';
  return 'diff-beginner';
}

export const ExerciseCard = ({ ejercicio, onClick }: Props) => {
  const cat = getCat(ejercicio.categoria);

  return (
    <article
      onClick={onClick}
      className="fp-card fp-card-hover relative overflow-hidden cursor-pointer"
    >
      {/* Accent bar */}
      <div className="fp-accent-bar" style={{ background: cat.accent }} />

      <div style={{ padding: '10px 12px 10px 15px' }}>

        {/* Row 1 */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center shrink-0"
            style={{ width: 38, height: 38, borderRadius: 10, background: cat.bg, fontSize: 17 }}
          >
            {cat.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span
                className="uppercase tracking-wider"
                style={{ fontSize: 10, fontWeight: 600, color: cat.accent }}
              >
                {ejercicio.categoria}
              </span>
              <span className={`badge ${getDiffCls(ejercicio.dificultad)}`}>
                {ejercicio.dificultad}
              </span>
            </div>
            <p
              className="font-sora font-semibold truncate"
              style={{ fontSize: 12, color: 'var(--text-primary)' }}
            >
              {ejercicio.nombre}
            </p>
          </div>

          <ChevronRight size={14} color="var(--text-muted)" className="shrink-0" />
        </div>

        {/* Muscle tags */}
        {ejercicio.grupo_muscular.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {ejercicio.grupo_muscular.slice(0, 4).map((m) => (
              <span
                key={m}
                style={{
                  fontSize: 10, fontWeight: 500, padding: '2px 7px',
                  borderRadius: 100, whiteSpace: 'nowrap',
                  background: 'var(--bg-overlay)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {m}
              </span>
            ))}
            {ejercicio.grupo_muscular.length > 4 && (
              <span
                style={{
                  fontSize: 10, fontWeight: 500, padding: '2px 7px',
                  borderRadius: 100,
                  background: 'var(--bg-overlay)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                +{ejercicio.grupo_muscular.length - 4}
              </span>
            )}
          </div>
        )}

      </div>
    </article>
  );
};
