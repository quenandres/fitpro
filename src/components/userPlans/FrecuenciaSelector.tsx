import { Minus, Plus } from 'lucide-react';
import {
  FRECUENCIA_IDEAL,
  MAX_FRECUENCIA,
  MIN_FRECUENCIA,
} from '../../utils/planScheduleUtils';

interface Props {
  value: number;
  onChange: (n: number) => void;
  accent?: string;
}

function frecuenciaLabel(n: number): string {
  if (n <= 2) return 'Pocos';
  if (n >= 7) return 'Muchos';
  if (n === FRECUENCIA_IDEAL) return 'Ideal';
  if (n < FRECUENCIA_IDEAL) return 'Moderado';
  return 'Intenso';
}

function frecuenciaColor(n: number): string {
  if (n <= 2) return 'var(--text-muted)';
  if (n >= 7) return '#f0883e';
  if (n === FRECUENCIA_IDEAL) return 'var(--brand)';
  return '#58a6ff';
}

export function FrecuenciaSelector({ value, onChange, accent = '#a371f7' }: Props) {
  const dec = () => onChange(Math.max(MIN_FRECUENCIA, value - 1));
  const inc = () => onChange(Math.min(MAX_FRECUENCIA, value + 1));
  const label = frecuenciaLabel(value);
  const color = frecuenciaColor(value);

  return (
    <div
      className="fp-card"
      style={{ padding: 14, borderRadius: 12, border: `1px solid ${accent}30` }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="fp-cal-label" style={{ marginBottom: 2 }}>
            Entrenamientos por semana
          </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
          Meta semanal que defines tú. Cuándo entrena el cliente se verá en cumplimiento (mock hasta backend).
        </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="fp-btn fp-btn-ghost p-1.5"
            onClick={dec}
            disabled={value <= MIN_FRECUENCIA}
            aria-label="Menos días"
          >
            <Minus size={14} />
          </button>
          <span
            className="font-sora tabular-nums"
            style={{ fontSize: 28, fontWeight: 800, color, minWidth: 36, textAlign: 'center' }}
          >
            {value}
          </span>
          <button
            type="button"
            className="fp-btn fp-btn-ghost p-1.5"
            onClick={inc}
            disabled={value >= MAX_FRECUENCIA}
            aria-label="Más días"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mb-2">
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{MIN_FRECUENCIA} · Pocos</span>
        <span
          className="badge"
          style={{
            fontSize: 10,
            padding: '3px 8px',
            background: `${color}18`,
            color,
            border: `1px solid ${color}40`,
          }}
        >
          {label}
          {value === FRECUENCIA_IDEAL ? ' ★' : ''}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Muchos · {MAX_FRECUENCIA}</span>
      </div>

      <input
        type="range"
        min={MIN_FRECUENCIA}
        max={MAX_FRECUENCIA}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: accent }}
        aria-label="Entrenamientos por semana"
      />
    </div>
  );
}
