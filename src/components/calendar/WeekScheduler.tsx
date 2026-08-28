import { useMemo } from 'react';
import type { Rutina } from '../../types';
import type { CalendarEvent, SchedulerTimeRange } from './calendarUtils';
import {
  SCHEDULER_HOUR_HEIGHT,
  fechaLocalISO,
  formatHourLabel,
  getEventBlockStyle,
  getSchedulerHours,
  getSchedulerRange,
} from './calendarUtils';
import { CalendarEventCard } from './CalendarEventCard';

interface WeekSchedulerProps {
  days: Date[];
  events: CalendarEvent[];
  rutinas: Rutina[];
  timeRange: SchedulerTimeRange;
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick?: (date: Date, startMinutes: number) => void;
}

function maxExercisesForHeight(height: number): number {
  if (height >= 100) return 3;
  if (height >= 72) return 2;
  if (height >= 48) return 1;
  return 0;
}

export function WeekScheduler({
  days,
  events,
  rutinas,
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
  const colMinWidth = days.length > 1 ? 120 : undefined;

  return (
    <div className="fp-cal-scheduler fp-cal-scheduler-tablet fp-cal-scheduler-rich">
      <div className="fp-cal-scheduler-scroll">
        <div
          className="fp-cal-scheduler-grid"
          style={{
            minHeight: gridHeight + 24,
            ['--cal-cols' as string]: String(days.length),
            minWidth: days.length > 1 && colMinWidth
              ? `${52 + days.length * colMinWidth}px`
              : undefined,
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
                        className={`fp-cal-event fp-cal-event-rich fp-cal-event-${event.kind}`}
                        style={{
                          top: block.top,
                          height: block.height,
                        }}
                        onClick={() => onEventClick(event)}
                      >
                        <CalendarEventCard
                          event={event}
                          rutinas={rutinas}
                          compact
                          showTimeRange
                          maxExercises={maxExercisesForHeight(block.height)}
                        />
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
