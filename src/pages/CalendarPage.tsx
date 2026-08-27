import { useMemo, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { CalendarSidebar } from '../components/calendar/CalendarSidebar';
import { CalendarHeader } from '../components/calendar/CalendarHeader';
import { WeekStrip } from '../components/calendar/WeekStrip';
import { WeekScheduler } from '../components/calendar/WeekScheduler';
import { FitProCalendar } from '../components/calendar/FitProCalendar';
import { CitaDetailSheet } from '../components/calendar/CitaDetailSheet';
import { TimeRangeSelector } from '../components/calendar/TimeRangeSelector';
import { Sheet } from '../components/common/Sheet';
import { CitaForm, minutesToTime } from '../components/calendar/CitaForm';
import {
  buildCalendarEvents,
  fechaLocalISO,
  getDefaultTimeRange,
  getEntrenoWeekdays,
  getSchedulerRange,
  getWeekDays,
  navigateDate,
  parseFechaLocal,
  type CalendarEvent,
  type CalendarViewMode,
  type SchedulerTimeRange,
} from '../components/calendar/calendarUtils';
import usuariosData from '../data/usuarios.json';
import { useDataStore } from '../store/useDataStore';
import { useCitasStore } from '../store/useCitasStore';
import type { Usuario } from '../types';

export function CalendarPage() {
  const [selected, setSelected] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [timeRange, setTimeRange] = useState<SchedulerTimeRange>(() => getDefaultTimeRange());
  const [visibleClientIds, setVisibleClientIds] = useState<number[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createSlot, setCreateSlot] = useState<{ date: Date; minutes: number } | null>(null);
  const [usuarios] = useState<Usuario[]>(() => usuariosData as Usuario[]);
  const citas = useCitasStore((s) => s.citas);
  const rutinas = useDataStore((s) => s.rutinas);

  const weekDays = useMemo(() => {
    if (viewMode === 'day') return [selected];
    return getWeekDays(selected);
  }, [selected, viewMode]);

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

  const createDate = createSlot?.date ?? selected;
  const createHora = createSlot ? minutesToTime(createSlot.minutes) : '10:00';
  const defaultClienteId = visibleClientIds.length === 1 ? visibleClientIds[0] : null;

  return (
    <AppShell width="wide" hideBottomNav={false}>
      <div className="fp-cal-page animate-slide-up">
        <div className="fp-cal-layout">
          <CalendarSidebar
            selected={selected}
            onSelectDate={setSelected}
            entrenoWeekdays={entrenoWeekdays}
            citaDates={citaDates}
            usuarios={usuarios}
            visibleClientIds={visibleClientIds}
            onToggleClient={toggleClient}
            onShowAllClients={() => setVisibleClientIds([])}
          />

          <div className="fp-cal-main">
            <CalendarHeader
              selected={selected}
              viewMode={viewMode}
              onViewChange={setViewMode}
              onPrev={() => setSelected((d) => navigateDate(d, viewMode, -1))}
              onNext={() => setSelected((d) => navigateDate(d, viewMode, 1))}
              onToday={() => setSelected(new Date())}
              onCreateCita={() => openCreate()}
            />

            {viewMode !== 'month' ? (
              <WeekStrip
                days={weekDays}
                selected={selected}
                onSelect={setSelected}
              />
            ) : null}

            {viewMode === 'month' ? (
              <div className="fp-cal-month-view">
                <FitProCalendar
                  selected={selected}
                  onSelect={(date) => date && setSelected(date)}
                  entrenoWeekdays={entrenoWeekdays}
                  citaDates={citaDates}
                  month={selected}
                  onMonthChange={setSelected}
                />
              </div>
            ) : (
              <>
                <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
                <WeekScheduler
                  days={weekDays}
                  events={events}
                  timeRange={timeRange}
                  onEventClick={setSelectedEvent}
                  onSlotClick={(date, startMinutes) => openCreate(date, startMinutes)}
                />
              </>
            )}
          </div>
        </div>
      </div>

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
        <div className="fp-cal-create-sheet">
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
          <CitaForm
            key={`${fechaLocalISO(createDate)}-${createHora}-${defaultClienteId ?? 'all'}`}
            selectedDate={createDate}
            usuarios={usuarios}
            rutinas={rutinas}
            defaultClienteId={defaultClienteId}
            defaultHora={createHora}
            onCreated={() => setShowCreate(false)}
          />
        </div>
      </Sheet>
    </AppShell>
  );
}
