import { isDiaEntreno } from '../userPlans/diasSemana';
import type { Cita, CitaTipo, Rutina, Usuario } from '../../types';

export type CalendarViewMode = 'week' | 'month' | 'day';

export type CalendarEventKind = 'cita' | 'entreno';

export interface CalendarEvent {
  id: string;
  kind: CalendarEventKind;
  title: string;
  subtitle: string;
  fecha: string;
  startMinutes: number;
  durationMin: number;
  accent: string;
  citaId?: number;
  citaTipo?: CitaTipo;
  clienteId: number;
  rutinaId?: number | null;
  notas?: string;
}

export const SCHEDULER_HOUR_HEIGHT = 56;

/** Rango operativo del gimnasio: 4:00 – 22:00 */
export const SCHEDULER_DAY_START_HOUR = 4;
export const SCHEDULER_DAY_END_HOUR = 22;

export type SchedulerTimeRange = 'morning' | 'afternoon';

export const SCHEDULER_TIME_RANGES: Record<
  SchedulerTimeRange,
  { startHour: number; endHour: number; label: string; sublabel: string }
> = {
  morning: {
    startHour: 4,
    endHour: 12,
    label: 'Mañana',
    sublabel: '4 am – 12 pm',
  },
  afternoon: {
    startHour: 12,
    endHour: 22,
    label: 'Tarde / noche',
    sublabel: '12 pm – 10 pm',
  },
};

/** @deprecated Usar getSchedulerRange(timeRange) */
export const SCHEDULER_START_HOUR = SCHEDULER_DAY_START_HOUR;
/** @deprecated Usar getSchedulerRange(timeRange) */
export const SCHEDULER_END_HOUR = SCHEDULER_DAY_END_HOUR;

export function getSchedulerRange(timeRange: SchedulerTimeRange) {
  return SCHEDULER_TIME_RANGES[timeRange];
}

export function getSchedulerHours(timeRange: SchedulerTimeRange): number[] {
  const { startHour, endHour } = getSchedulerRange(timeRange);
  return Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
}

export function getDefaultTimeRange(): SchedulerTimeRange {
  return new Date().getHours() >= 12 ? 'afternoon' : 'morning';
}

export function eventOverlapsRange(
  event: CalendarEvent,
  startHour: number,
  endHour: number,
): boolean {
  const rangeStart = startHour * 60;
  const rangeEnd = endHour * 60;
  const eventEnd = event.startMinutes + event.durationMin;
  return eventEnd > rangeStart && event.startMinutes < rangeEnd;
}

export function getEventBlockStyle(
  event: CalendarEvent,
  startHour: number,
  endHour: number,
  hourHeight: number,
): { top: number; height: number } | null {
  if (!eventOverlapsRange(event, startHour, endHour)) return null;

  const rangeStart = startHour * 60;
  const rangeEnd = endHour * 60;
  const eventEnd = event.startMinutes + event.durationMin;
  const visibleStart = Math.max(event.startMinutes, rangeStart);
  const visibleEnd = Math.min(eventEnd, rangeEnd);
  const top = ((visibleStart - rangeStart) / 60) * hourHeight;
  const height = Math.max(((visibleEnd - visibleStart) / 60) * hourHeight - 4, 32);

  return { top, height };
}

export function formatHourLabel(hour: number): string {
  if (hour === 0) return '12 am';
  if (hour === 12) return '12 pm';
  return hour > 12 ? `${hour - 12} pm` : `${hour} am`;
}

const CITA_ACCENTS = ['#c4b5fd', '#93c5fd', '#f9a8d4', '#fcd34d', '#86efac'];
const ENTRENO_ACCENT = '#bbf7d0';

export function fechaLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseFechaLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatFechaLarga(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDayShort(date: Date): { weekday: string; day: number } {
  const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(date);
  return { weekday: weekday.replace('.', ''), day: date.getDate() };
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekDays(date: Date): Date[] {
  const start = getWeekStart(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function formatMinutesRange(startMin: number, durationMin: number): string {
  const endMin = startMin + durationMin;
  const fmt = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const suffix = h >= 12 ? 'pm' : 'am';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return m === 0 ? `${hour12} ${suffix}` : `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
  };
  return `${fmt(startMin)} – ${fmt(endMin)}`;
}

function usuariosVisibles(usuarios: Usuario[], visibleClientIds: number[]): Usuario[] {
  if (visibleClientIds.length === 0) return usuarios;
  return usuarios.filter((u) => visibleClientIds.includes(u.id));
}

export function getEntrenoWeekdays(usuarios: Usuario[], visibleClientIds: number[]): number[] {
  const weekdays = new Set<number>();

  for (const usuario of usuariosVisibles(usuarios, visibleClientIds)) {
    const semana1 = usuario.plan.programacion_semanal.find((s) => s.semana === 1);
    if (!semana1) continue;

    for (const dia of semana1.dias) {
      if (isDiaEntreno(dia.rutina_id)) {
        weekdays.add(dia.dia);
      }
    }
  }

  return [...weekdays].sort((a, b) => a - b);
}

export interface EntrenoDelDia {
  clienteId: number;
  clienteNombre: string;
  rutinaNombre: string;
  rutinaId: number | null;
}

export function getEntrenosDelDia(
  usuarios: Usuario[],
  date: Date,
  visibleClientIds: number[],
): EntrenoDelDia[] {
  const weekday = date.getDay();
  const result: EntrenoDelDia[] = [];

  for (const usuario of usuariosVisibles(usuarios, visibleClientIds)) {
    const semana1 = usuario.plan.programacion_semanal.find((s) => s.semana === 1);
    const dia = semana1?.dias.find((d) => d.dia === weekday);

    if (dia && isDiaEntreno(dia.rutina_id)) {
      result.push({
        clienteId: usuario.id,
        clienteNombre: usuario.nombre,
        rutinaNombre: dia.rutina_nombre,
        rutinaId: dia.rutina_id,
      });
    }
  }

  return result;
}

export function filterCitas(citas: Cita[], visibleClientIds: number[]): Cita[] {
  if (visibleClientIds.length === 0) return citas;
  return citas.filter((c) => visibleClientIds.includes(c.cliente_id));
}

export function citasDelDia(citas: Cita[], fecha: string): Cita[] {
  return citas
    .filter((c) => c.fecha === fecha)
    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
}

const MEDIDAS_ACCENT = '#38bdf8';

function citaAccentFor(clienteId: number, tipo: CitaTipo): string {
  if (tipo === 'medidas') return MEDIDAS_ACCENT;
  return CITA_ACCENTS[clienteId % CITA_ACCENTS.length];
}

export function buildCalendarEvents(
  usuarios: Usuario[],
  citas: Cita[],
  visibleClientIds: number[],
  weekDays: Date[],
  rutinas: Rutina[],
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const fechasSemana = new Set(weekDays.map(fechaLocalISO));

  for (const cita of filterCitas(citas, visibleClientIds)) {
    if (!fechasSemana.has(cita.fecha)) continue;
    const cliente = usuarios.find((u) => u.id === cita.cliente_id);
    const rutina = rutinaNombre(rutinas, cita.rutina_id);
    events.push({
      id: `cita-${cita.id}`,
      kind: 'cita',
      title: cita.tipo === 'medidas'
        ? `Medidas · ${cliente?.nombre ?? 'Cliente'}`
        : (rutina ?? cliente?.nombre ?? 'Cita'),
      subtitle: cliente?.nombre ?? 'Cliente',
      fecha: cita.fecha,
      startMinutes: parseTimeToMinutes(cita.hora_inicio),
      durationMin: cita.duracion_min,
      accent: citaAccentFor(cita.cliente_id, cita.tipo),
      citaId: cita.id,
      citaTipo: cita.tipo,
      clienteId: cita.cliente_id,
      rutinaId: cita.rutina_id,
      notas: cita.notas,
    });
  }

  for (const day of weekDays) {
    const entrenos = getEntrenosDelDia(usuarios, day, visibleClientIds);
    entrenos.forEach((entreno, index) => {
      events.push({
        id: `entreno-${entreno.clienteId}-${fechaLocalISO(day)}-${index}`,
        kind: 'entreno',
        title: entreno.rutinaNombre,
        subtitle: entreno.clienteNombre,
        fecha: fechaLocalISO(day),
        startMinutes: 5 * 60 + index * 75,
        durationMin: 60,
        accent: ENTRENO_ACCENT,
        clienteId: entreno.clienteId,
        rutinaId: entreno.rutinaId,
      });
    });
  }

  return events.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
    return a.startMinutes - b.startMinutes;
  });
}

export function eventsForDay(events: CalendarEvent[], fecha: string): CalendarEvent[] {
  return events.filter((e) => e.fecha === fecha);
}

export function navigateDate(date: Date, view: CalendarViewMode, direction: -1 | 1): Date {
  if (view === 'week') return addDays(date, direction * 7);
  if (view === 'month') return addMonths(date, direction);
  return addDays(date, direction);
}

export function clienteIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function rutinaNombre(rutinas: Rutina[], id: number | null | undefined): string | null {
  if (id == null) return null;
  return rutinas.find((r) => r.id === id)?.nombre ?? null;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatHoraCorta(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatDurationShort(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

export interface MonthChip {
  date: Date;
  label: string;
  key: string;
}

export function getMonthChips(center: Date, range = 3): MonthChip[] {
  return Array.from({ length: range * 2 + 1 }, (_, i) => {
    const date = addMonths(center, i - range);
    const label = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date);
    return {
      date,
      label: label.charAt(0).toUpperCase() + label.slice(1),
      key: `${date.getFullYear()}-${date.getMonth()}`,
    };
  });
}

export function getDayWindow(center: Date, radius = 7): Date[] {
  return Array.from({ length: radius * 2 + 1 }, (_, i) => addDays(center, i - radius));
}

/** All days shown in a month grid (includes leading/trailing days from adjacent months). */
export function getDaysInMonth(month: Date): Date[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const start = getWeekStart(first);
  const end = addDays(getWeekStart(last), 6);
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) {
    days.push(d);
  }
  return days;
}

export interface DayEventSummary {
  rutinas: string[];
  kinds: CalendarEventKind[];
  totalCount: number;
  extraCount: number;
}

export function summarizeEventsForDay(
  events: CalendarEvent[],
  fecha: string,
  maxVisible = 2,
): DayEventSummary {
  const dayEvents = events.filter((e) => e.fecha === fecha);
  const rutinas: string[] = [];

  for (const event of dayEvents) {
    if (event.title && !rutinas.includes(event.title)) {
      rutinas.push(event.title);
    }
  }

  const kinds = [...new Set(dayEvents.map((e) => e.kind))];

  return {
    rutinas: rutinas.slice(0, maxVisible),
    kinds,
    totalCount: dayEvents.length,
    extraCount: Math.max(0, rutinas.length - maxVisible),
  };
}

export interface TimeSlot {
  minutes: number;
  label: string;
}

export function generateTimeSlots(
  timeRange: SchedulerTimeRange,
  stepMinutes = 30,
): TimeSlot[] {
  const { startHour, endHour } = getSchedulerRange(timeRange);
  const startMin = startHour * 60;
  const endMin = endHour * 60;
  const slots: TimeSlot[] = [];

  for (let m = startMin; m < endMin; m += stepMinutes) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const label = min === 0
      ? `${hour12}:00 ${suffix}`
      : `${hour12}:${String(min).padStart(2, '0')} ${suffix}`;
    slots.push({ minutes: m, label });
  }

  return slots;
}

export interface EventKindMeta {
  accent: string;
  bg: string;
  label: string;
}

export function getEventKindMeta(kind: CalendarEventKind, citaTipo?: CitaTipo): EventKindMeta {
  if (kind === 'cita') {
    if (citaTipo === 'medidas') {
      return {
        accent: '#0ea5e9',
        bg: 'rgba(14,165,233,.18)',
        label: 'Medidas',
      };
    }
    return {
      accent: '#a371f7',
      bg: 'rgba(163,113,247,.18)',
      label: 'Cita',
    };
  }
  return {
    accent: '#22c55e',
    bg: 'rgba(34,197,94,.18)',
    label: 'Entreno',
  };
}

export function dayHasEvents(fecha: string, events: CalendarEvent[]): boolean {
  return events.some((e) => e.fecha === fecha);
}

export function filterEventsByTimeRange(
  events: CalendarEvent[],
  timeRange: SchedulerTimeRange,
): CalendarEvent[] {
  const { startHour, endHour } = getSchedulerRange(timeRange);
  return events.filter((e) => eventOverlapsRange(e, startHour, endHour));
}

export interface EjercicioResumen {
  series: number;
  nombre: string;
  totalReps: number;
}

export function resumenEjercicios(
  rutina: Rutina | undefined,
  max = 5,
): { items: EjercicioResumen[]; remaining: number } {
  if (!rutina?.ejercicios?.length) {
    return { items: [], remaining: 0 };
  }

  const items = rutina.ejercicios.slice(0, max).map((ej) => ({
    series: ej.series,
    nombre: ej.nombre,
    totalReps: ej.series * ej.valor,
  }));

  return {
    items,
    remaining: Math.max(0, rutina.ejercicios.length - max),
  };
}

export function isSlotOccupied(
  fecha: string,
  slotMinutes: number,
  durationMin: number,
  citas: Cita[],
  clienteId: number,
): boolean {
  const slotEnd = slotMinutes + durationMin;

  return citas.some((cita) => {
    if (cita.fecha !== fecha || cita.cliente_id !== clienteId) return false;
    const citaStart = parseTimeToMinutes(cita.hora_inicio);
    const citaEnd = citaStart + cita.duracion_min;
    return slotEnd > citaStart && slotMinutes < citaEnd;
  });
}

export type MobileCalendarView = 'day' | 'month';
