import type { PlanModo } from '../../types';

interface Props {
  value: PlanModo;
  onChange: (modo: PlanModo) => void;
  frecuencia: number;
  accent?: string;
}

const OPTIONS: Array<{ id: PlanModo; title: string; desc: string }> = [
  {
    id: 'repetitiva',
    title: 'Repetitiva',
    desc: 'Misma rutina cada semana — el cliente la repite hasta completar la cuota.',
  },
  {
    id: 'sesiones_variables',
    title: 'Sesiones variables',
    desc: 'Cada sesión puede tener rutina y ejercicios distintos definidos por ti.',
  },
];

export function PlanModoSelector({ value, onChange, frecuencia, accent = '#a371f7' }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {OPTIONS.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className="text-left rounded-xl transition-colors"
            style={{
              padding: 12,
              border: active ? `2px solid ${accent}` : '1px solid var(--border)',
              background: active ? `${accent}12` : 'var(--bg-overlay)',
            }}
          >
            <p
              className="font-sora text-sm font-bold mb-1"
              style={{ color: active ? accent : 'var(--text-primary)' }}
            >
              {opt.title}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {opt.desc}
              {opt.id === 'repetitiva' ? (
                <span style={{ display: 'block', marginTop: 4, color: accent, fontWeight: 600 }}>
                  × {frecuencia} veces/semana
                </span>
              ) : null}
            </p>
          </button>
        );
      })}
    </div>
  );
}
