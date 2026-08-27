import type { SchedulerTimeRange } from './calendarUtils';
import { SCHEDULER_TIME_RANGES } from './calendarUtils';

interface TimeRangeSelectorProps {
  value: SchedulerTimeRange;
  onChange: (range: SchedulerTimeRange) => void;
  compact?: boolean;
}

const RANGE_OPTIONS: SchedulerTimeRange[] = ['morning', 'afternoon'];

export function TimeRangeSelector({ value, onChange, compact = false }: TimeRangeSelectorProps) {
  return (
    <div className={`fp-cal-time-range-bar${compact ? ' is-compact' : ''}`}>
      {!compact ? (
        <span className="fp-cal-time-range-label">Horario</span>
      ) : null}
      <div className="fp-cal-time-range-switch" role="tablist" aria-label="Rango horario">
        {RANGE_OPTIONS.map((rangeId) => {
          const { label, sublabel } = SCHEDULER_TIME_RANGES[rangeId];
          const active = value === rangeId;

          return (
            <button
              key={rangeId}
              type="button"
              role="tab"
              aria-selected={active}
              className={`fp-cal-time-range-pill${active ? ' is-active' : ''}`}
              onClick={() => onChange(rangeId)}
            >
              <span className="fp-cal-time-range-pill-title">{label}</span>
              {!compact ? (
                <span className="fp-cal-time-range-pill-sub">{sublabel}</span>
              ) : (
                <span className="fp-cal-time-range-pill-sub fp-cal-time-range-pill-sub-compact">
                  {sublabel}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
