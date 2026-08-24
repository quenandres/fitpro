import { Link } from 'react-router-dom';
import { Clock, ChevronRight, Target, Layers } from 'lucide-react';
import type { Rutina } from '../../types';
import { routineEditPath } from '../../utils/inferRoutineFormLevel';

/* ── Helpers ─────────────────────────────────────────────── */
function getCat(cat: string) {
  const c = cat.toLowerCase();
  if (c.includes('fuerza') || c.includes('push') || c.includes('pull'))
    return { emoji: '🏋️', accent: '#f0883e', bg: 'rgba(240,136,62,.12)', label: 'Fuerza' };
  if (c.includes('cardio') || c.includes('resistencia') || c.includes('hiit'))
    return { emoji: '🔥', accent: '#f85149', bg: 'rgba(248,81,73,.12)', label: 'Cardio' };
  if (c.includes('funcional') || c.includes('hyrox'))
    return { emoji: '⚡', accent: '#d2a679', bg: 'rgba(210,166,121,.12)', label: 'Funcional' };
  if (c.includes('core') || c.includes('abdominal'))
    return { emoji: '🎯', accent: '#a371f7', bg: 'rgba(163,113,247,.12)', label: 'Core' };
  if (c.includes('movilidad') || c.includes('recuper'))
    return { emoji: '🧘', accent: '#58a6ff', bg: 'rgba(88,166,255,.12)', label: 'Movilidad' };
  if (c.includes('metabólico') || c.includes('crossfit') || c.includes('wod'))
    return { emoji: '⏱', accent: '#22c55e', bg: 'rgba(34,197,94,.12)', label: 'Metabólico' };
  if (c.includes('peso') || c.includes('calistenia'))
    return { emoji: '🤸', accent: '#22c55e', bg: 'rgba(34,197,94,.12)', label: 'Calistenia' };
  return { emoji: '🏃', accent: '#22c55e', bg: 'rgba(34,197,94,.12)', label: cat };
}

function getDiff(dif: string): { cls: string; dots: number } {
  const d = dif.toLowerCase();
  if (d.includes('avanzado'))   return { cls: 'diff-advanced',     dots: 3 };
  if (d.includes('intermedio')) return { cls: 'diff-intermediate',  dots: 2 };
  return                               { cls: 'diff-beginner',      dots: 1 };
}

/* ── Component ───────────────────────────────────────────── */
export const WorkoutCard = ({ rutina }: { rutina: Rutina }) => {
  const cat  = getCat(rutina.categoria);
  const diff = getDiff(rutina.dificultad);
  const totalSeries = rutina.ejercicios.reduce((a, e) => a + e.series, 0);

  return (
    <Link to={routineEditPath(rutina)} className="block group">
      <article className="fp-card fp-card-hover relative overflow-hidden">
        {/* Accent bar */}
        <div className="fp-accent-bar" style={{ background: cat.accent }} />

        <div style={{ padding: '12px 13px 12px 16px' }}>

          {/* Row 1: emoji + meta + chevron */}
          <div className="flex items-start gap-2.5 mb-2">
            <div
              className="flex items-center justify-center shrink-0 text-lg"
              style={{ width: 40, height: 40, borderRadius: 11, background: cat.bg }}
            >
              {cat.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="uppercase tracking-wider"
                  style={{ fontSize: 10, fontWeight: 600, color: cat.accent }}
                >
                  {cat.label}
                </span>
                <span className={`badge ${diff.cls}`}>{rutina.dificultad}</span>
              </div>
              <p
                className="font-sora font-semibold truncate"
                style={{ fontSize: 13, color: 'var(--text-primary)' }}
              >
                {rutina.nombre}
              </p>
            </div>

            <div
              className="shrink-0 flex items-center justify-center"
              style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg-overlay)' }}
            >
              <ChevronRight size={14} color="var(--text-muted)" />
            </div>
          </div>

          {/* Description */}
          <p
            className="line-clamp-2 mb-2.5"
            style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}
          >
            {rutina.descripcion}
          </p>

          {/* Stats row */}
          <div
            className="flex items-center gap-2.5"
            style={{ paddingTop: 9, borderTop: '1px solid var(--border-subtle)' }}
          >
            {[
              { Icon: Clock,  val: `${rutina.duracion_min}m`, lbl: 'dur.' },
              { Icon: Target, val: rutina.ejercicios.length,  lbl: 'ejerc.' },
              { Icon: Layers, val: totalSeries,               lbl: 'series' },
            ].map(({ Icon, val, lbl }) => (
              <div key={lbl} className="flex items-center gap-1">
                <Icon size={11} color="var(--text-muted)" />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lbl}</span>
              </div>
            ))}

            {/* Intensity dots */}
            <div className="ml-auto flex items-center gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: i <= diff.dots ? cat.accent : 'var(--bg-overlay)',
                    border: `1px solid ${i <= diff.dots ? cat.accent : 'var(--border)'}`,
                    transition: 'background .2s',
                  }}
                />
              ))}
            </div>
          </div>

        </div>
      </article>
    </Link>
  );
};
