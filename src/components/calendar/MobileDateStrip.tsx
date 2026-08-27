import { useEffect, useMemo, useRef } from 'react';
import {
  fechaLocalISO,
  formatDayShort,
  getDayWindow,
  getMonthChips,
  isSameDay,
  isToday,
} from './calendarUtils';
import type { CalendarEvent } from './calendarUtils';

interface MobileDateStripProps {
  selected: Date;
  onSelect: (date: Date) => void;
  events: CalendarEvent[];
}

export function MobileDateStrip({ selected, onSelect, events }: MobileDateStripProps) {
  const dayScrollRef = useRef<HTMLDivElement>(null);
  const monthScrollRef = useRef<HTMLDivElement>(null);

  const monthChips = useMemo(() => getMonthChips(selected, 3), [selected]);
  const dayWindow = useMemo(() => getDayWindow(selected, 7), [selected]);

  const eventDates = useMemo(
    () => new Set(events.map((e) => e.fecha)),
    [events],
  );

  useEffect(() => {
    const activeDay = dayScrollRef.current?.querySelector('[data-active-day="true"]');
    if (activeDay instanceof HTMLElement) {
      activeDay.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selected]);

  useEffect(() => {
    const activeMonth = monthScrollRef.current?.querySelector('[data-active-month="true"]');
    if (activeMonth instanceof HTMLElement) {
      activeMonth.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selected]);

  const handleMonthSelect = (monthDate: Date) => {
    const next = new Date(selected);
    next.setFullYear(monthDate.getFullYear(), monthDate.getMonth(), 1);
    onSelect(next);
  };

  return (
    <div className="fp-cal-mobile-strip">
      <p className="fp-cal-chip-section-label">Seleccionar mes</p>
      <div
        ref={monthScrollRef}
        className="fp-cal-chip-row scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {monthChips.map(({ date, label, key }) => {
          const active =
            date.getFullYear() === selected.getFullYear()
            && date.getMonth() === selected.getMonth();

          return (
            <button
              key={key}
              type="button"
              data-active-month={active ? 'true' : undefined}
              className={`fp-cal-month-chip${active ? ' is-active' : ''}`}
              onClick={() => handleMonthSelect(date)}
            >
              {label}
            </button>
          );
        })}
      </div>

      <p className="fp-cal-chip-section-label">Seleccionar día</p>
      <div
        ref={dayScrollRef}
        className="fp-cal-chip-row fp-cal-day-chip-row scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {dayWindow.map((day) => {
          const { weekday, day: dayNum } = formatDayShort(day);
          const active = isSameDay(day, selected);
          const today = isToday(day);
          const hasEvents = eventDates.has(fechaLocalISO(day));

          return (
            <button
              key={fechaLocalISO(day)}
              type="button"
              data-active-day={active ? 'true' : undefined}
              className={`fp-cal-day-chip${active ? ' is-active' : ''}${today ? ' is-today' : ''}`}
              onClick={() => onSelect(day)}
            >
              <span className="fp-cal-day-chip-num">{dayNum}</span>
              <span className="fp-cal-day-chip-weekday">{weekday}</span>
              {hasEvents ? <span className="fp-cal-day-chip-dot" aria-hidden /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
