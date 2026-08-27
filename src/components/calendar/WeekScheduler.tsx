import { useMemo } from 'react';
import { clienteIniciales } from './calendarUtils';
import type { CalendarEvent, SchedulerTimeRange } from './calendarUtils';
import {
  SCHEDULER_HOUR_HEIGHT,
  fechaLocalISO,
  formatHourLabel,
  formatMinutesRange,
  getEventBlockStyle,
  getSchedulerHours,
  getSchedulerRange,
} from './calendarUtils';

interface WeekSchedulerProps {
  days: Date[];
  events: CalendarEvent[];
  timeRange: SchedulerTimeRange;
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick?: (date: Date, startMinutes: number) => void;
}

export function WeekScheduler({
  days,
  events,
  timeRange,
  onEventClick,
  onSlotClick,
}: WeekSchedulerProps) {
  const { startHour, endHour } = getSchedulerRange(timeRange);
  const hours = useMemo(() => getSchedulerHours(timeRange), [timeRange]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const day of days) {
      map.set(fechaLocalISO(day), []);
    }
    for (const event of events) {
      map.get(event.fecha)?.push(event);
    }
    return map;
  }, [days, events]);

  const gridHeight = (endHour - startHour) * SCHEDULER_HOUR_HEIGHT;

  return (
    <div className="fp-cal-scheduler fp-cal-scheduler-tablet">
      <div className="fp-cal-scheduler-scroll">
        <div
          className="fp-cal-scheduler-grid"
          style={{
            minHeight: gridHeight + 24,
            ['--cal-cols' as string]: String(days.length),
            minWidth: days.length > 1 ? `${52 + days.length * 96}px` : undefined,
          }}
        >
          <div className="fp-cal-time-axis">
            {hours.map((hour) => (
              <div
                key={hour}
                className="fp-cal-time-label"
                style={{ height: SCHEDULER_HOUR_HEIGHT }}
              >
                {formatHourLabel(hour)}
              </div>
            ))}
          </div>

          {days.map((day) => {
            const fecha = fechaLocalISO(day);
            const dayEvents = eventsByDay.get(fecha) ?? [];

            return (
              <div key={fecha} className="fp-cal-day-column">
                <div className="fp-cal-day-column-inner" style={{ height: gridHeight }}>
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      className="fp-cal-hour-slot"
                      style={{ height: SCHEDULER_HOUR_HEIGHT }}
                      aria-label={`Agendar ${fecha} ${formatHourLabel(hour)}`}
                      onClick={() => onSlotClick?.(day, hour * 60)}
                    />
                  ))}

                  {dayEvents.map((event) => {
                    const block = getEventBlockStyle(
                      event,
                      startHour,
                      endHour,
                      SCHEDULER_HOUR_HEIGHT,
                    );
                    if (!block) return null;

                    return (
                      <button
                        key={event.id}
                        type="button"
                        className={`fp-cal-event fp-cal-event-${event.kind}`}
                        style={{
                          top: block.top,
                          height: block.height,
                          background: event.accent,
                        }}
                        onClick={() => onEventClick(event)}
                      >
                        <p className="fp-cal-event-title">{event.title}</p>
                        <p className="fp-cal-event-time">
                          {formatMinutesRange(event.startMinutes, event.durationMin)}
                        </p>
                        {event.kind === 'cita' ? (
                          <span className="fp-cal-event-avatar">
                            {clienteIniciales(event.subtitle)}
                          </span>
                        ) : (
                          <p className="fp-cal-event-sub">{event.subtitle}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
