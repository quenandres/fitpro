export interface BriefingPulse {
  label: string;
  value: number;
  color: string;
}

export interface BriefingAction {
  to: string;
  label: string;
  primary?: boolean;
}

export interface DashboardBriefingModel {
  greeting: string;
  name: string;
  dateLabel: string;
  roleLabel: string;
  lede: string;
  pulse: BriefingPulse[];
  actions: BriefingAction[];
}

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export const greetingForHour = (hour: number): string => {
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

export const displayNameFromEmail = (email?: string): string => {
  if (!email) return 'entrenador';
  const local = email.split('@')[0] ?? '';
  const token = local.split(/[._-]/)[0] ?? local;
  if (!token) return 'entrenador';
  return token.charAt(0).toUpperCase() + token.slice(1);
};

export const formatBriefingDate = (timestamp: number): string => {
  const d = new Date(timestamp);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

const clampShare = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

export const buildPulse = (
  segments: Array<{ label: string; value: number; color: string }>,
): BriefingPulse[] => {
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  if (total <= 0) return segments.map((s) => ({ ...s, value: 0 }));
  return segments.map((s) => ({
    ...s,
    value: clampShare((Math.max(0, s.value) / total) * 100),
  }));
};
