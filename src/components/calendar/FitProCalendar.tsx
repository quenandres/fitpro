import { useEffect, useMemo, useState } from 'react';
import { DayPicker } from '@daypicker/react';
import { es } from '@daypicker/react/locale';
import { CalendarMonthGrid } from './CalendarMonthGrid';
import { startOfLocalDay, startOfLocalMonth } from './calendarUtils';
import type { CalendarEvent } from './calendarUtils';

interface FitProCalendarProps {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  loggedSessionDates: Date[];
  citaDates: Date[];
  variant?: 'default' | 'mini' | 'mobile';
  density?: 'default' | 'rich';
  events?: CalendarEvent[];
  month?: Date;
  onMonthChange?: (month: Date) => void;
}

const normalizeDates = (dates: Date[]): Date[] =>
  dates.map((d) => startOfLocalDay(d));

export function FitProCalendar({
  selected,
  onSelect,
  loggedSessionDates,
  citaDates,
  variant = 'default',
  density = 'default',
  events = [],
  month,
  onMonthChange,
}: FitProCalendarProps) {
  const monthControlled = month !== undefined && onMonthChange !== undefined;
  const [navMonth, setNavMonth] = useState(() =>
    startOfLocalMonth(month ?? selected ?? new Date()),
  );

  useEffect(() => {
    if (monthControlled || month === undefined) return;
    setNavMonth(startOfLocalMonth(month));
  }, [month, monthControlled]);

  const pickerMonth = monthControlled ? startOfLocalMonth(month!) : navMonth;
  const handleMonthChange = monthControlled ? onMonthChange! : setNavMonth;

  const normalizedSelected = selected ? startOfLocalDay(selected) : undefined;

  const modifiers = useMemo(
    () => ({
      entreno: normalizeDates(loggedSessionDates),
      cita: normalizeDates(citaDates),
    }),
    [loggedSessionDates, citaDates],
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
        showOutsideDays
        captionLayout="label"
        navLayout="around"
        selected={normalizedSelected}
        onSelect={onSelect}
        month={pickerMonth}
        onMonthChange={handleMonthChange}
        modifiers={modifiers}
        modifiersClassNames={{
          entreno: 'fp-cal-entreno',
          cita: 'fp-cal-cita',
        }}
      />
    </div>
  );
}
