import { formatDayShort, isSameDay, isToday } from './calendarUtils';

interface WeekStripProps {
  days: Date[];
  selected: Date;
  onSelect: (date: Date) => void;
}

const STRIP_COLORS = [
  'fp-cal-strip-lime',
  'fp-cal-strip-blue',
  'fp-cal-strip-mint',
  'fp-cal-strip-purple',
  'fp-cal-strip-sand',
  'fp-cal-strip-pink',
  'fp-cal-strip-grey',
];

export function WeekStrip({ days, selected, onSelect }: WeekStripProps) {
  return (
    <div className="fp-cal-week-strip">
      {days.map((day, index) => {
        const { weekday, day: dayNum } = formatDayShort(day);
        const active = isSameDay(day, selected);
        const today = isToday(day);

        return (
          <button
            key={day.toISOString()}
            type="button"
            className={`fp-cal-day-card ${STRIP_COLORS[index % STRIP_COLORS.length]}${active ? ' is-active' : ''}${today ? ' is-today' : ''}`}
            onClick={() => onSelect(day)}
          >
            <span className="fp-cal-day-card-weekday">{weekday}</span>
            <span className="fp-cal-day-card-num">{dayNum}</span>
          </button>
        );
      })}
    </div>
  );
}
