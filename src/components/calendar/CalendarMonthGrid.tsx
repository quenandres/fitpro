import { useMemo } from 'react';
import {
  addDays,
  fechaLocalISO,
  getWeekStart,
  isSameDay,
  isToday,
  summarizeEventsForDay,
  type CalendarEvent,
} from './calendarUtils';

interface CalendarMonthGridProps {
  month: Date;
  selected: Date | undefined;
  onSelect: (date: Date) => void;
  events: CalendarEvent[];
  variant?: 'default' | 'mobile';
}

const WEEKDAY_LABELS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

function getMonthGridDays(month: Date): Date[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const start = getWeekStart(first);
  const end = addDays(getWeekStart(last), 6);
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) {
    days.push(d);
  }
  return days;
}

export function CalendarMonthGrid({
  month,
  selected,
  onSelect,
  events,
  variant = 'default',
}: CalendarMonthGridProps) {
  const days = useMemo(() => getMonthGridDays(month), [month]);
  const monthIndex = month.getMonth();

  return (
    <div className={`fp-cal-month-grid${variant === 'mobile' ? ' fp-cal-month-grid-mobile' : ''}`}>
      <div className="fp-cal-month-grid-weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="fp-cal-month-grid-weekday">{label}</span>
        ))}
      </div>
      <div className="fp-cal-month-grid-cells">
        {days.map((day) => {
          const fecha = fechaLocalISO(day);
          const outside = day.getMonth() !== monthIndex;
          const summary = summarizeEventsForDay(events, fecha);
          const active = selected != null && isSameDay(day, selected);
          const today = isToday(day);
          const hasCita = summary.kinds.includes('cita');
          const hasEntreno = summary.kinds.includes('entreno');

          return (
            <button
              key={fecha}
              type="button"
              className={[
                'fp-cal-month-cell',
                outside ? 'is-outside' : '',
                active ? 'is-active' : '',
                today ? 'is-today' : '',
                hasCita ? 'has-cita' : '',
                hasEntreno ? 'has-entreno' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelect(day)}
            >
              <span className="fp-cal-month-cell-num">{day.getDate()}</span>
              {summary.rutinas.map((rutina) => (
                <span key={rutina} className="fp-cal-month-cell-rutina">{rutina}</span>
              ))}
              {summary.extraCount > 0 ? (
                <span className="fp-cal-month-cell-more">+{summary.extraCount}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
