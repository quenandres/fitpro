import { useMemo } from 'react';
import { CalendarCheck } from 'lucide-react';
import type { Usuario } from '../../types';
import { DemoBadge } from '../common/DemoBadge';
import {
  complianceTone,
  getWeeklyCompliance,
} from '../../utils/planComplianceUtils';
import { formatFechaRelativa } from '../../utils/userSummary';

interface Props {
  user: Usuario;
}

const TONE_COLORS = {
  complete: 'var(--brand)',
  partial: '#f0883e',
  empty: 'var(--text-muted)',
} as const;

export function CompliancePanel({ user }: Props) {
  const compliance = useMemo(
    () => getWeeklyCompliance(user.id, user.plan.dias_entrenar_semana),
    [user.id, user.plan.dias_entrenar_semana],
  );

  const tone = complianceTone(compliance.porcentaje);
  const color = TONE_COLORS[tone];

  return (
    <div
      className="fp-card min-w-0"
      style={{
        padding: 16,
        borderRadius: 16,
        border: '1px dashed rgba(240,136,62,.35)',
        background: 'rgba(240,136,62,.04)',
      }}
    >
      <div className="flex items-start gap-2.5 mb-3">
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CalendarCheck size={18} color={color} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
            <h3 className="font-sora text-sm font-bold text-primary">Cumplimiento</h3>
            <DemoBadge label="Demo · mock" />
          </div>
          <p className="text-[11px] text-muted leading-snug">
            Vista previa con datos de ejemplo. La meta ({compliance.objetivo}/sem) sí viene del plan;
            los días registrados vendrán de la app móvil cuando haya backend.
          </p>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <span className="font-sora text-2xl font-bold tabular-nums" style={{ color }}>
            {compliance.completadas}/{compliance.objetivo}
          </span>
          <span className="text-xs font-semibold tabular-nums" style={{ color }}>
            {compliance.porcentaje}%
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: 'var(--bg-overlay)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${compliance.porcentaje}%`, background: color }}
          />
        </div>
        <p className="text-[10px] text-muted mt-2 leading-snug">
          Ilustrativo — no refleja el registro real del cliente todavía.
        </p>
      </div>

      {compliance.fechas.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {compliance.fechas.map((fecha) => (
            <li
              key={fecha}
              className="text-[11px] rounded-lg px-2.5 py-2 flex items-center justify-between gap-2"
              style={{
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              <span>{formatFechaRelativa(fecha)}</span>
              <span className="text-muted tabular-nums">{fecha.slice(5).replace('-', '/')}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p
          className="text-[11px] rounded-lg px-2.5 py-2"
          style={{
            background: 'var(--bg-overlay)',
            border: '1px dashed var(--border-subtle)',
            color: 'var(--text-muted)',
          }}
        >
          Sin entrenamientos de ejemplo esta semana en el mock.
        </p>
      )}
    </div>
  );
}
