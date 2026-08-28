import { useMemo } from 'react';
import { DayPicker } from '@daypicker/react';
import { es } from '@daypicker/react/locale';
import { CalendarMonthGrid } from './CalendarMonthGrid';
import type { CalendarEvent } from './calendarUtils';

interface FitProCalendarProps {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  entrenoWeekdays: number[];
  citaDates: Date[];
  variant?: 'default' | 'mini' | 'mobile';
  density?: 'default' | 'rich';
  events?: CalendarEvent[];
  month?: Date;
  onMonthChange?: (month: Date) => void;
}

export function FitProCalendar({
  selected,
  onSelect,
  entrenoWeekdays,
  citaDates,
  variant = 'default',
  density = 'default',
  events = [],
  month,
  onMonthChange,
}: FitProCalendarProps) {
  const modifiers = useMemo(
    () => ({
      entreno: entrenoWeekdays.length > 0 ? { dayOfWeek: entrenoWeekdays } : [],
      cita: citaDates,
    }),
    [entrenoWeekdays, citaDates],
  );

  if (density === 'rich' && month) {
    return (
      <CalendarMonthGrid
        month={month}
        selected={selected}
        onSelect={(date) => onSelect(date)}
        events={events}
        variant={variant === 'mobile' ? 'mobile' : 'default'}
      />
    );
  }

  const rootClass = variant === 'mini' ? 'fp-calendar fp-calendar-mini' : 'fp-calendar';

  return (
    <div className={rootClass}>
      <DayPicker
        mode="single"
        locale={es}
        weekStartsOn={1}
        animate
        selected={selected}
        onSelect={onSelect}
        month={month}
        onMonthChange={onMonthChange}
        modifiers={modifiers}
        modifiersClassNames={{
          entreno: 'fp-cal-entreno',
          cita: 'fp-cal-cita',
        }}
      />
    </div>
  );
}
