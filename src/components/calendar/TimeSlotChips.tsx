import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import type { Cita } from '../../types';
import {
  fechaLocalISO,
  generateTimeSlots,
  isSlotOccupied,
  minutesToTime,
  type SchedulerTimeRange,
} from './calendarUtils';

interface TimeSlotChipsProps {
  selectedDate: Date;
  value: string;
  onChange: (time: string) => void;
  timeRange: SchedulerTimeRange;
  duracionMin: number;
  clienteId: number;
  citas: Cita[];
}

export function TimeSlotChips({
  selectedDate,
  value,
  onChange,
  timeRange,
  duracionMin,
  clienteId,
  citas,
}: TimeSlotChipsProps) {
  const fecha = fechaLocalISO(selectedDate);
  const slots = useMemo(() => generateTimeSlots(timeRange, 30), [timeRange]);
  const selectedMinutes = useMemo(() => {
    const [h, m] = value.split(':').map(Number);
    return h * 60 + m;
  }, [value]);

  return (
    <div className="fp-cal-time-slots">
      <p className="fp-cal-chip-section-label">Seleccionar hora</p>
      <div
        className="fp-cal-chip-row scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {slots.map(({ minutes, label }) => {
          const active = selectedMinutes === minutes;
          const occupied = isSlotOccupied(fecha, minutes, duracionMin, citas, clienteId);

          return (
            <button
              key={minutes}
              type="button"
              disabled={occupied}
              className={`fp-cal-time-chip${active ? ' is-active' : ''}${occupied ? ' is-occupied' : ''}`}
              onClick={() => onChange(minutesToTime(minutes))}
            >
              <Clock size={14} aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
