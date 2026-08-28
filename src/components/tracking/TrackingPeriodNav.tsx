import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TrackingPeriod } from '../../utils/trackingUtils';
import { TRACKING_PERIOD_LABELS } from '../../utils/trackingUtils';

const PERIOD_OPTIONS: TrackingPeriod[] = ['semana', 'mes', 'trimestre', 'anio'];

interface TrackingPeriodNavProps {
  period: TrackingPeriod;
  periodLabel: string;
  onPeriodChange: (period: TrackingPeriod) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function TrackingPeriodNav({
  period,
  periodLabel,
  onPeriodChange,
  onPrev,
  onNext,
}: TrackingPeriodNavProps) {
  return (
    <div className="fp-tracking-period-nav">
      <div
        className="fp-cal-view-switch fp-tracking-period-switch"
        role="tablist"
        aria-label="Periodo de actividad"
      >
        {PERIOD_OPTIONS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={period === id}
            className={`fp-cal-view-pill${period === id ? ' is-active' : ''}`}
            onClick={() => onPeriodChange(id)}
          >
            {TRACKING_PERIOD_LABELS[id]}
          </button>
        ))}
      </div>

      <div className="fp-tracking-period-arrows">
        <button
          type="button"
          className="fp-cal-nav-btn"
          onClick={onPrev}
          aria-label="Periodo anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="fp-tracking-period-label capitalize">{periodLabel}</span>
        <button
          type="button"
          className="fp-cal-nav-btn"
          onClick={onNext}
          aria-label="Periodo siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
