import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { CalendarSidebar } from '../components/calendar/CalendarSidebar';
import { CalendarHeader } from '../components/calendar/CalendarHeader';
import { CalendarFiltersSheet } from '../components/calendar/CalendarFiltersSheet';
import { WeekStrip } from '../components/calendar/WeekStrip';
import { WeekScheduler } from '../components/calendar/WeekScheduler';
import { FitProCalendar } from '../components/calendar/FitProCalendar';
import { CitaDetailSheet } from '../components/calendar/CitaDetailSheet';
import { TimeRangeSelector } from '../components/calendar/TimeRangeSelector';
import { MobileDateStrip } from '../components/calendar/MobileDateStrip';
import { DayAgenda } from '../components/calendar/MobileDayAgenda';
import { Sheet } from '../components/common/Sheet';
import { CitaForm, minutesToTime } from '../components/calendar/CitaForm';
import {
  buildCalendarEvents,
  fechaLocalISO,
  getDaysInMonth,
  getDefaultTimeRange,
  getDayWindow,
  getEntrenoWeekdays,
  getSchedulerRange,
  getWeekDays,
  navigateDate,
  parseFechaLocal,
  type CalendarEvent,
  type CalendarViewMode,
  type MobileCalendarView,
  type SchedulerTimeRange,
} from '../components/calendar/calendarUtils';
import { useIsLargeScreen, useIsMobile } from '../hooks/useMediaQuery';
import usuariosData from '../data/usuarios.json';
import { useDataStore } from '../store/useDataStore';
import { useCitasStore } from '../store/useCitasStore';
import type { Usuario } from '../types';

export function CalendarPage() {
  const isMobile = useIsMobile();
  const isLargeScreen = useIsLargeScreen();
  const [selected, setSelected] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [mobileView, setMobileView] = useState<MobileCalendarView>('day');
  const [timeRange, setTimeRange] = useState<SchedulerTimeRange>(() => getDefaultTimeRange());
  const [visibleClientIds, setVisibleClientIds] = useState<number[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [createSlot, setCreateSlot] = useState<{ date: Date; minutes: number } | null>(null);
  const [usuarios] = useState<Usuario[]>(() => usuariosData as Usuario[]);
  const citas = useCitasStore((s) => s.citas);
  const rutinas = useDataStore((s) => s.rutinas);

  const weekDays = useMemo(() => {
    if (isMobile || viewMode === 'day') return [selected];
    return getWeekDays(selected);
  }, [selected, viewMode, isMobile]);

  const monthDays = useMemo(() => getDaysInMonth(selected), [selected]);

  const entrenoWeekdays = useMemo(
    () => getEntrenoWeekdays(usuarios, visibleClientIds),
    [usuarios, visibleClientIds],
  );

  const citaDates = useMemo(() => {
    const filtered = visibleClientIds.length === 0
      ? citas
      : citas.filter((c) => visibleClientIds.includes(c.cliente_id));
    return filtered.map((c) => parseFechaLocal(c.fecha));
  }, [citas, visibleClientIds]);

  const events = useMemo(
    () => buildCalendarEvents(usuarios, citas, visibleClientIds, weekDays, rutinas),
    [usuarios, citas, visibleClientIds, weekDays, rutinas],
  );

  const monthEvents = useMemo(
    () => buildCalendarEvents(usuarios, citas, visibleClientIds, monthDays, rutinas),
    [usuarios, citas, visibleClientIds, monthDays, rutinas],
  );

  const allEvents = useMemo(
    () => buildCalendarEvents(
      usuarios,
      citas,
      visibleClientIds,
      getDayWindow(selected, 7),
      rutinas,
    ),
    [usuarios, citas, visibleClientIds, selected, rutinas],
  );

  const toggleClient = (clienteId: number) => {
    setVisibleClientIds((prev) => {
      if (prev.length === 0) {
        return usuarios.filter((u) => u.id !== clienteId).map((u) => u.id);
      }
      if (prev.includes(clienteId)) {
        return prev.filter((id) => id !== clienteId);
      }
      const next = [...prev, clienteId];
      return next.length === usuarios.length ? [] : next;
    });
  };

  const openCreate = (date?: Date, minutes?: number) => {
    const { startHour } = getSchedulerRange(timeRange);
    const defaultMinutes = timeRange === 'morning' ? Math.max(startHour, 8) * 60 : 14 * 60;
    setCreateSlot(
      date && minutes != null ? { date, minutes } : { date: selected, minutes: defaultMinutes },
    );
    setShowCreate(true);
  };

  const handleMobileViewChange = (view: MobileCalendarView) => {
    setMobileView(view);
    if (view === 'day') {
      setViewMode('day');
    } else {
      setViewMode('month');
    }
  };

  const handleMonthDaySelect = (date: Date) => {
    setSelected(date);
    if (isMobile) {
      setMobileView('day');
      setViewMode('day');
    }
  };

  const handleNavigate = (direction: -1 | 1) => {
    if (isMobile) {
      const mode = mobileView === 'month' ? 'month' : 'day';
      setSelected((d) => navigateDate(d, mode, direction));
      return;
    }
    setSelected((d) => navigateDate(d, viewMode, direction));
  };

  const sidebarProps = {
    selected,
    onSelectDate: setSelected,
    entrenoWeekdays,
    citaDates,
    usuarios,
    visibleClientIds,
    onToggleClient: toggleClient,
    onShowAllClients: () => setVisibleClientIds([]),
  };

  const createDate = createSlot?.date ?? selected;
  const createHora = createSlot ? minutesToTime(createSlot.minutes) : '10:00';
  const defaultClienteId = visibleClientIds.length === 1 ? visibleClientIds[0] : null;

  const showDesktopSidebar = isLargeScreen;
  const showFiltersSheet = !isLargeScreen;
  const isMonthView = isMobile ? mobileView === 'month' : viewMode === 'month';

  return (
    <AppShell width="wide" hideBottomNav={false}>
      <div className="fp-cal-page fp-cal-page-responsive animate-slide-up">
        <div className="fp-cal-layout">
          {showDesktopSidebar ? <CalendarSidebar {...sidebarProps} /> : null}

          <div className={`fp-cal-main${isMonthView ? ' fp-cal-main--month' : ''}`}>
            <CalendarHeader
              selected={selected}
              viewMode={viewMode}
              onViewChange={setViewMode}
              onPrev={() => handleNavigate(-1)}
              onNext={() => handleNavigate(1)}
              onToday={() => setSelected(new Date())}
              onCreateCita={() => openCreate()}
              isMobile={isMobile}
              mobileView={mobileView}
              onMobileViewChange={handleMobileViewChange}
              onOpenFilters={() => setShowFilters(true)}
            />

            {isMobile ? (
              mobileView === 'month' ? (
                <div className="fp-cal-month-view fp-cal-month-view-mobile">
                  <FitProCalendar
                    selected={selected}
                    onSelect={(date) => date && handleMonthDaySelect(date)}
                    entrenoWeekdays={entrenoWeekdays}
                    citaDates={citaDates}
                    month={selected}
                    onMonthChange={setSelected}
                    density="rich"
                    events={monthEvents}
                    variant="mobile"
                  />
                </div>
              ) : (
                <>
                  <MobileDateStrip
                    selected={selected}
                    onSelect={setSelected}
                    events={allEvents}
                  />
                  <TimeRangeSelector
                    value={timeRange}
                    onChange={setTimeRange}
                    compact
                  />
                  <DayAgenda
                    selected={selected}
                    events={events}
                    timeRange={timeRange}
                    rutinas={rutinas}
                    onEventClick={setSelectedEvent}
                    onCreateCita={() => openCreate()}
                  />
                </>
              )
            ) : (
              <>
                {viewMode !== 'month' ? (
                  <WeekStrip
                    days={weekDays}
                    selected={selected}
                    onSelect={setSelected}
                  />
                ) : null}

                {viewMode === 'month' ? (
                  <div className="fp-cal-month-view fp-cal-month-view-desktop">
                    <FitProCalendar
                      selected={selected}
                      onSelect={(date) => date && setSelected(date)}
                      entrenoWeekdays={entrenoWeekdays}
                      citaDates={citaDates}
                      month={selected}
                      onMonthChange={setSelected}
                      density="rich"
                      events={monthEvents}
                    />
                  </div>
                ) : viewMode === 'day' ? (
                  <>
                    <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
                    <DayAgenda
                      selected={selected}
                      events={events}
                      timeRange={timeRange}
                      rutinas={rutinas}
                      onEventClick={setSelectedEvent}
                      onCreateCita={() => openCreate()}
                    />
                  </>
                ) : (
                  <>
                    <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
                    <WeekScheduler
                      days={weekDays}
                      events={events}
                      rutinas={rutinas}
                      timeRange={timeRange}
                      onEventClick={setSelectedEvent}
                      onSlotClick={(date, startMinutes) => openCreate(date, startMinutes)}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {isMobile && !showCreate ? (
        <button
          type="button"
          className="fp-cal-fab"
          onClick={() => openCreate()}
          aria-label="Nueva cita"
        >
          <Plus size={22} />
        </button>
      ) : null}

      {showFiltersSheet ? (
        <CalendarFiltersSheet
          open={showFilters}
          onClose={() => setShowFilters(false)}
          {...sidebarProps}
        />
      ) : null}

      <CitaDetailSheet
        event={selectedEvent}
        usuarios={usuarios}
        rutinas={rutinas}
        onClose={() => setSelectedEvent(null)}
      />

      <Sheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
        ariaLabel="Nueva cita"
        flexColumn
      >
        <div className="fp-cal-create-sheet flex flex-col min-h-0 flex-1">
          <div className="shrink-0">
            <h2 className="font-sora text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Nueva cita
            </h2>
            <p className="mb-4 capitalize" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {new Intl.DateTimeFormat('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              }).format(createDate)}
            </p>
          </div>
          <CitaForm
            key={`${fechaLocalISO(createDate)}-${createHora}-${defaultClienteId ?? 'all'}`}
            selectedDate={createDate}
            usuarios={usuarios}
            rutinas={rutinas}
            defaultClienteId={defaultClienteId}
            defaultHora={createHora}
            timeRange={timeRange}
            isMobile={isMobile}
            onCreated={() => setShowCreate(false)}
          />
        </div>
      </Sheet>
    </AppShell>
  );
}
