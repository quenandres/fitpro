import type { SnapshotMedidas } from '../types';
import { useMedidasStore } from '../store/useMedidasStore';

function fechaFromDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Carlos Martínez (id 1): progreso ~4 semanas para /usuarios/1?tab=medidas */
function snapshotsCarlos(): SnapshotMedidas[] {
  return [
    {
      id: 'demo-med-1-baseline',
      usuario_id: 1,
      fecha: fechaFromDaysAgo(28),
      peso_kg: 79.8,
      sitios: {
        cuello: { unico: 38.5 },
        pecho: { unico: 101.0 },
        brazo: { der: 35.8, izq: 36.0 },
        cintura: { unico: 87.0 },
        cadera: { unico: 98.5 },
        muslo: { der: 58.0, izq: 58.5 },
        pantorrilla: { der: 37.5, izq: 37.8 },
      },
    },
    {
      id: 'demo-med-1-w3',
      usuario_id: 1,
      fecha: fechaFromDaysAgo(21),
      peso_kg: 79.2,
      sitios: {
        pecho: { unico: 102.0 },
        brazo: { der: 36.2, izq: 36.4 },
        cintura: { unico: 86.5 },
        muslo: { der: 58.5, izq: 59.0 },
      },
    },
    {
      id: 'demo-med-1-w4',
      usuario_id: 1,
      fecha: fechaFromDaysAgo(14),
      peso_kg: 78.8,
      sitios: {
        cuello: { unico: 38.3 },
        pecho: { unico: 102.5 },
        brazo: { der: 36.6, izq: 36.8 },
        antebrazo: { der: 29.0, izq: 29.2 },
        cintura: { unico: 85.5 },
        cadera: { unico: 98.0 },
        muslo: { der: 59.0, izq: 59.5 },
        pantorrilla: { der: 38.0, izq: 38.2 },
      },
    },
    {
      id: 'demo-med-1-hoy',
      usuario_id: 1,
      fecha: fechaFromDaysAgo(0),
      peso_kg: 78.2,
      sitios: {
        cuello: { unico: 38.2 },
        pecho: { unico: 104.0 },
        brazo: { der: 37.0, izq: 37.2 },
        antebrazo: { der: 29.5, izq: 29.6 },
        cintura: { unico: 84.5 },
        cadera: { unico: 97.5 },
        muslo: { der: 59.5, izq: 60.0 },
        pantorrilla: { der: 38.5, izq: 38.8 },
      },
    },
  ];
}

function snapshotsValentina(): SnapshotMedidas[] {
  return [
    {
      id: 'demo-med-3-prev',
      usuario_id: 3,
      fecha: fechaFromDaysAgo(21),
      peso_kg: 62.8,
      sitios: {
        cintura: { unico: 68.0 },
        cadera: { unico: 96.0 },
        muslo: { der: 52.0, izq: 52.5 },
      },
    },
    {
      id: 'demo-med-3-hoy',
      usuario_id: 3,
      fecha: fechaFromDaysAgo(0),
      peso_kg: 62.1,
      sitios: {
        pecho: { unico: 88.0 },
        cintura: { unico: 67.0 },
        cadera: { unico: 95.5 },
        muslo: { der: 52.5, izq: 53.0 },
        pantorrilla: { der: 34.0, izq: 34.2 },
      },
    },
  ];
}

export function buildDemoMedidasSnapshots(): SnapshotMedidas[] {
  return [...snapshotsCarlos(), ...snapshotsValentina()];
}

export function seedDemoMedidas(): void {
  useMedidasStore.setState({ snapshots: buildDemoMedidasSnapshots() });
}
