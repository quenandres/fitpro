import type { RoutineCreateMode } from '../../../types';

const MODES: Array<{
  id: RoutineCreateMode;
  label: string;
  desc: string;
}> = [
  {
    id: 'semana_tipo',
    label: 'Semana tipo',
    desc: 'Arma lunes a domingo y replica hasta 8 semanas.',
  },
  {
    id: 'semana_a_semana',
    label: 'Semana a semana',
    desc: 'Progresión: cada semana puede ser distinta.',
  },
  {
    id: 'desde_plantilla',
    label: 'Desde plantilla',
    desc: 'Parte de una rutina o preset y elige la duración.',
  },
];

interface Props {
  mode: RoutineCreateMode;
  onChange: (mode: RoutineCreateMode) => void;
  accent: string;
  notice?: string | null;
}

export const RoutineCreateModeTabs = ({ mode, onChange, accent, notice }: Props) => (
  <div style={{ marginBottom: 16 }}>
    <div
      className="fp-week-mode-tabs"
      role="tablist"
      aria-label="Forma de crear el programa"
    >
      {MODES.map(({ id, label }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className="fp-week-mode-tab font-sora"
            style={{
              borderColor: active ? `${accent}66` : 'var(--border)',
              background: active ? `${accent}18` : 'var(--bg-elevated)',
              color: active ? accent : 'var(--text-secondary)',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.45 }}>
      {MODES.find((m) => m.id === mode)?.desc}
    </p>
    {notice ? (
      <p
        style={{
          fontSize: 12,
          color: 'var(--accent-orange, #f0883e)',
          marginTop: 6,
        }}
      >
        {notice}
      </p>
    ) : null}
  </div>
);
