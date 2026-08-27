import { ChevronLeft, ChevronRight, Plus, SlidersHorizontal } from 'lucide-react';
import type { CalendarViewMode, MobileCalendarView } from './calendarUtils';
import { formatMonthYear } from './calendarUtils';

interface CalendarHeaderProps {
  selected: Date;
  viewMode: CalendarViewMode;
  onViewChange: (view: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onCreateCita: () => void;
  isMobile?: boolean;
  mobileView?: MobileCalendarView;
  onMobileViewChange?: (view: MobileCalendarView) => void;
  onOpenFilters?: () => void;
}

const DESKTOP_VIEW_OPTIONS: { id: CalendarViewMode; label: string }[] = [
  { id: 'month', label: 'Mes' },
  { id: 'week', label: 'Semana' },
  { id: 'day', label: 'Día' },
];

const MOBILE_VIEW_OPTIONS: { id: MobileCalendarView; label: string }[] = [
  { id: 'day', label: 'Agenda' },
  { id: 'month', label: 'Mes' },
];

export function CalendarHeader({
  selected,
  viewMode,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  onCreateCita,
  isMobile = false,
  mobileView = 'day',
  onMobileViewChange,
  onOpenFilters,
}: CalendarHeaderProps) {
  return (
    <header className="fp-cal-header">
      <div className="fp-cal-header-top">
        <div className="fp-cal-header-nav">
          <h1 className="font-sora fp-cal-header-title">{formatMonthYear(selected)}</h1>
          <button type="button" className="fp-cal-today-btn" onClick={onToday}>
            Hoy
          </button>
          <div className="fp-cal-nav-arrows">
            <button type="button" className="fp-cal-nav-btn" onClick={onPrev} aria-label="Anterior">
              <ChevronLeft size={18} />
            </button>
            <button type="button" className="fp-cal-nav-btn" onClick={onNext} aria-label="Siguiente">
              <ChevronRight size={18} />
            </button>
          </div>
          {!isMobile && onOpenFilters ? (
            <button
              type="button"
              className="fp-cal-nav-btn fp-cal-filter-btn-tablet lg:hidden"
              onClick={onOpenFilters}
              aria-label="Filtros"
            >
              <SlidersHorizontal size={18} />
            </button>
          ) : null}
        </div>

        <div className="fp-cal-header-actions">
          {isMobile ? (
            <>
              <button
                type="button"
                className="fp-cal-nav-btn"
                onClick={onOpenFilters}
                aria-label="Filtros"
              >
                <SlidersHorizontal size={18} />
              </button>
              <div className="fp-cal-view-switch" role="tablist" aria-label="Vista del calendario">
                {MOBILE_VIEW_OPTIONS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={mobileView === id}
                    className={`fp-cal-view-pill${mobileView === id ? ' is-active' : ''}`}
                    onClick={() => onMobileViewChange?.(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="fp-cal-view-switch" role="tablist" aria-label="Vista del calendario">
                {DESKTOP_VIEW_OPTIONS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={viewMode === id}
                    className={`fp-cal-view-pill${viewMode === id ? ' is-active' : ''}`}
                    onClick={() => onViewChange(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button type="button" className="fp-cal-create-btn" onClick={onCreateCita}>
                <Plus size={16} />
                <span className="hidden sm:inline">Nueva cita</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
