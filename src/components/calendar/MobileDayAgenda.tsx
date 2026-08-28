import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import type { Rutina } from '../../types';
import type { CalendarEvent, SchedulerTimeRange } from './calendarUtils';
import {
  fechaLocalISO,
  filterEventsByTimeRange,
  formatHoraCorta,
  getSchedulerRange,
  isToday,
} from './calendarUtils';
import { CalendarEventCard, EventKindIcon } from './CalendarEventCard';

interface DayAgendaProps {
  selected: Date;
  events: CalendarEvent[];
  timeRange: SchedulerTimeRange;
  rutinas: Rutina[];
  onEventClick: (event: CalendarEvent) => void;
  onCreateCita?: () => void;
}

export function DayAgenda({
  selected,
  events,
  timeRange,
  rutinas,
  onEventClick,
  onCreateCita,
}: DayAgendaProps) {
  const fecha = fechaLocalISO(selected);
  const showNow = isToday(selected);
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const dayEvents = useMemo(() => {
    const forDay = events.filter((e) => e.fecha === fecha);
    return filterEventsByTimeRange(forDay, timeRange);
  }, [events, fecha, timeRange]);

  const { startHour, endHour } = getSchedulerRange(timeRange);
  const rangeStart = startHour * 60;
  const rangeEnd = endHour * 60;

  if (dayEvents.length === 0) {
    return (
      <div className="fp-cal-timeline-empty">
        <p>No hay eventos en este rango horario.</p>
        {onCreateCita ? (
          <button type="button" className="fp-btn fp-btn-primary" onClick={onCreateCita}>
            <Plus size={16} />
            Agendar cita
          </button>
        ) : null}
      </div>
    );
  }

  let nowInserted = !showNow;

  return (
    <div className="fp-cal-timeline fp-cal-day-agenda">
      {dayEvents.map((event) => {
        const insertNow =
          showNow
          && !nowInserted
          && event.startMinutes >= nowMinutes
          && nowMinutes >= rangeStart
          && nowMinutes < rangeEnd;

        if (insertNow) nowInserted = true;

        return (
          <div key={event.id}>
            {insertNow ? (
              <div className="fp-cal-timeline-now">
                <span className="fp-cal-timeline-now-line" />
                <span className="fp-cal-timeline-now-label">Ahora</span>
              </div>
            ) : null}

            <article className="fp-cal-timeline-item" style={{ contentVisibility: 'auto' }}>
              <time className="fp-cal-timeline-time" dateTime={formatHoraCorta(event.startMinutes)}>
                {formatHoraCorta(event.startMinutes)}
              </time>

              <div className="fp-cal-timeline-rail">
                <EventKindIcon kind={event.kind} />
                <span className="fp-cal-timeline-line" aria-hidden />
              </div>

              <CalendarEventCard
                event={event}
                rutinas={rutinas}
                onMenuClick={() => onEventClick(event)}
              />
            </article>
          </div>
        );
      })}

      {showNow && !nowInserted && nowMinutes >= rangeStart && nowMinutes < rangeEnd ? (
        <div className="fp-cal-timeline-now">
          <span className="fp-cal-timeline-now-line" />
          <span className="fp-cal-timeline-now-label">Ahora</span>
        </div>
      ) : null}
    </div>
  );
}

/** @deprecated Usar DayAgenda */
export const MobileDayAgenda = DayAgenda;
