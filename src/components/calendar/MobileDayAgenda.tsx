import { useMemo } from 'react';
import { CalendarClock, Dumbbell, MoreVertical, Plus } from 'lucide-react';
import type { Rutina } from '../../types';
import type { CalendarEvent, SchedulerTimeRange } from './calendarUtils';
import {
  fechaLocalISO,
  filterEventsByTimeRange,
  formatDurationShort,
  formatHoraCorta,
  getEventKindMeta,
  getSchedulerRange,
  isToday,
  resumenEjercicios,
  rutinaNombre,
} from './calendarUtils';

interface MobileDayAgendaProps {
  selected: Date;
  events: CalendarEvent[];
  timeRange: SchedulerTimeRange;
  rutinas: Rutina[];
  onEventClick: (event: CalendarEvent) => void;
  onCreateCita: () => void;
}

function TimelineIcon({ kind }: { kind: CalendarEvent['kind'] }) {
  const meta = getEventKindMeta(kind);
  const Icon = kind === 'cita' ? CalendarClock : Dumbbell;

  return (
    <span className="fp-cal-timeline-icon" style={{ background: meta.bg, color: meta.accent }}>
      <Icon size={16} aria-hidden />
    </span>
  );
}

export function MobileDayAgenda({
  selected,
  events,
  timeRange,
  rutinas,
  onEventClick,
  onCreateCita,
}: MobileDayAgendaProps) {
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
        <button type="button" className="fp-btn fp-btn-primary" onClick={onCreateCita}>
          <Plus size={16} />
          Agendar cita
        </button>
      </div>
    );
  }

  let nowInserted = !showNow;

  return (
    <div className="fp-cal-timeline">
      {dayEvents.map((event) => {
        const insertNow =
          showNow
          && !nowInserted
          && event.startMinutes >= nowMinutes
          && nowMinutes >= rangeStart
          && nowMinutes < rangeEnd;

        if (insertNow) nowInserted = true;

        const rutina = event.rutinaId != null
          ? rutinas.find((r) => r.id === event.rutinaId)
          : undefined;
        const ejercicios = event.kind === 'entreno' ? resumenEjercicios(rutina) : null;
        const rutinaLabel = rutinaNombre(rutinas, event.rutinaId);

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
                <TimelineIcon kind={event.kind} />
                <span className="fp-cal-timeline-line" aria-hidden />
              </div>

              <div className="fp-cal-timeline-card">
                <div className="fp-cal-timeline-card-head">
                  <div>
                    <p className="fp-cal-timeline-card-title">{event.title}</p>
                    <p className="fp-cal-timeline-card-meta">
                      {formatDurationShort(event.durationMin)}
                      {event.kind === 'cita' ? ` · ${event.subtitle}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="fp-cal-timeline-menu"
                    aria-label="Ver detalle"
                    onClick={() => onEventClick(event)}
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>

                {event.kind === 'entreno' && ejercicios && ejercicios.items.length > 0 ? (
                  <ul className="fp-cal-timeline-exercises">
                    {ejercicios.items.map((ej) => (
                      <li key={ej.nombre}>
                        <span>{ej.series} × {ej.nombre}</span>
                        <span>{ej.totalReps} total reps</span>
                      </li>
                    ))}
                    {ejercicios.remaining > 0 ? (
                      <li className="fp-cal-timeline-exercises-more">
                        +{ejercicios.remaining} más
                      </li>
                    ) : null}
                  </ul>
                ) : null}

                {rutinaLabel && event.kind === 'cita' ? (
                  <p className="fp-cal-timeline-rutina-tag">{rutinaLabel}</p>
                ) : null}
              </div>
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
