import { CalendarClock, Dumbbell, MoreVertical } from 'lucide-react';
import type { Rutina } from '../../types';
import type { CalendarEvent } from './calendarUtils';
import {
  formatDurationShort,
  formatMinutesRange,
  getEventKindMeta,
  resumenEjercicios,
  rutinaNombre,
} from './calendarUtils';

interface CalendarEventCardProps {
  event: CalendarEvent;
  rutinas: Rutina[];
  onMenuClick?: () => void;
  compact?: boolean;
  maxExercises?: number;
  showTimeRange?: boolean;
}

export function EventKindIcon({
  kind,
  citaTipo,
  size = 16,
}: {
  kind: CalendarEvent['kind'];
  citaTipo?: CalendarEvent['citaTipo'];
  size?: number;
}) {
  const meta = getEventKindMeta(kind, citaTipo);
  const Icon = kind === 'cita' && citaTipo === 'medidas'
    ? CalendarClock
    : kind === 'cita'
      ? CalendarClock
      : Dumbbell;

  return (
    <span className="fp-cal-timeline-icon" style={{ background: meta.bg, color: meta.accent }}>
      <Icon size={size} aria-hidden />
    </span>
  );
}

export function CalendarEventCard({
  event,
  rutinas,
  onMenuClick,
  compact = false,
  maxExercises = 5,
  showTimeRange = false,
}: CalendarEventCardProps) {
  const rutina = event.rutinaId != null
    ? rutinas.find((r) => r.id === event.rutinaId)
    : undefined;
  const ejercicios = event.kind === 'entreno' && maxExercises > 0
    ? resumenEjercicios(rutina, maxExercises)
    : null;
  const rutinaLabel = rutinaNombre(rutinas, event.rutinaId);

  const cardClass = compact
    ? 'fp-cal-event-card fp-cal-event-card-compact'
    : 'fp-cal-timeline-card';

  return (
    <div
      className={cardClass}
      style={compact ? { borderLeftColor: event.accent } : undefined}
    >
      <div className={compact ? 'fp-cal-event-card-head' : 'fp-cal-timeline-card-head'}>
        <div className="min-w-0 flex-1">
          <p className={compact ? 'fp-cal-event-card-title' : 'fp-cal-timeline-card-title'}>
            {event.title}
          </p>
          <p className={compact ? 'fp-cal-event-card-meta' : 'fp-cal-timeline-card-meta'}>
            {showTimeRange
              ? formatMinutesRange(event.startMinutes, event.durationMin)
              : formatDurationShort(event.durationMin)}
            {event.kind === 'cita' || compact ? ` · ${event.subtitle}` : ''}
          </p>
        </div>
        {!compact && onMenuClick ? (
          <button
            type="button"
            className="fp-cal-timeline-menu"
            aria-label="Ver detalle"
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick();
            }}
          >
            <MoreVertical size={16} />
          </button>
        ) : null}
      </div>

      {event.kind === 'entreno' && ejercicios && ejercicios.items.length > 0 ? (
        <ul className={compact ? 'fp-cal-event-card-exercises' : 'fp-cal-timeline-exercises'}>
          {ejercicios.items.map((ej) => (
            <li key={ej.nombre}>
              <span>{ej.series} × {ej.nombre}</span>
              {!compact ? <span>{ej.totalReps} total reps</span> : null}
            </li>
          ))}
          {ejercicios.remaining > 0 ? (
            <li className={compact ? 'fp-cal-event-card-exercises-more' : 'fp-cal-timeline-exercises-more'}>
              +{ejercicios.remaining} más
            </li>
          ) : null}
        </ul>
      ) : null}

      {rutinaLabel && event.kind === 'cita' && !compact ? (
        <p className="fp-cal-timeline-rutina-tag">{rutinaLabel}</p>
      ) : null}
    </div>
  );
}
