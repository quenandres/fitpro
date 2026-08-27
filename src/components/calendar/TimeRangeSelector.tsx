import type { SchedulerTimeRange } from './calendarUtils';
import { SCHEDULER_TIME_RANGES } from './calendarUtils';

interface TimeRangeSelectorProps {
  value: SchedulerTimeRange;
  onChange: (range: SchedulerTimeRange) => void;
}

const RANGE_OPTIONS: SchedulerTimeRange[] = ['morning', 'afternoon'];

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="fp-cal-time-range-bar">
      <span className="fp-cal-time-range-label">Horario</span>
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
              <span className="fp-cal-time-range-pill-sub">{sublabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
