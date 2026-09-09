import type { PlanProgresionModo } from '../../types';

interface Props {
  value: PlanProgresionModo;
  onChange: (modo: PlanProgresionModo) => void;
  accent?: string;
}

const OPTIONS: Array<{ id: PlanProgresionModo; title: string; desc: string }> = [
  {
    id: 'fijo',
    title: 'Fijo',
    desc: 'Mismo peso y repeticiones en todo el plan. Los cambios se aplican a las semanas pendientes.',
  },
  {
    id: 'incremental',
    title: 'Incremental',
    desc: 'Progresión automática semana a semana según reglas que defines por ejercicio.',
  },
];

export function PlanProgresionSelector({ value, onChange, accent = '#a371f7' }: Props) {
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
            <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{opt.desc}</p>
          </button>
        );
      })}
    </div>
  );
}
