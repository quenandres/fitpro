import sesionesRaw from '../data/sesiones.json';
import { seedDemoMedidas } from './demoMedidasSeed';
import { buildDemoEjerciciosForRutina } from './demoSessionEjercicios';
import type { Cita, SesionEntrenamiento } from '../types';
import { useCitasStore } from '../store/useCitasStore';
import { useSesionesStore } from '../store/useSesionesStore';
import { useUsuariosStore } from '../store/useUsuariosStore';

type SesionSeed = {
  id: string;
  usuario_id: number;
  days_ago: number;
  rutina_id: number;
  rutina_nombre: string;
  modalidad: SesionEntrenamiento['modalidad'];
  duracion_min: number;
  series_completadas: number;
};

function fechaFromDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function mapSesiones(seeds: SesionSeed[]): SesionEntrenamiento[] {
  return seeds.map((row) => {
    const ejercicios = buildDemoEjerciciosForRutina(row.rutina_id, row.rutina_nombre);
    const seriesFromEj = ejercicios.reduce((acc, ej) => acc + ej.series.length, 0);
    return {
      id: row.id,
      usuario_id: row.usuario_id,
      fecha: fechaFromDaysAgo(row.days_ago),
      rutina_id: row.rutina_id,
      rutina_nombre: row.rutina_nombre,
      modalidad: row.modalidad,
      duracion_min: row.duracion_min,
      series_completadas: seriesFromEj || row.series_completadas,
      ejercicios,
    };
  });
}

const RUTINAS_POR_CLIENTE: Record<number, number[]> = {
  1: [2, 5, 6],
  2: [3, 4, 8],
  3: [1, 9, 10],
};

const HORAS_CITA = ['07:30', '09:00', '11:00', '16:00', '18:00', '19:30'];

function seedCitas(clientIds: number[]): void {
  const citas: Omit<Cita, 'id'>[] = [];
  for (let offset = -1; offset <= 10; offset += 1) {
    clientIds.forEach((clienteId, index) => {
      if (offset !== 0 && (offset + index) % 4 === 0) return;
      const fecha = fechaFromDaysAgo(-offset);
      const rutinas = RUTINAS_POR_CLIENTE[clienteId] ?? [2];
      const esMedidas = offset === 3 && index === 0;
      citas.push({
        cliente_id: clienteId,
        fecha,
        hora_inicio: HORAS_CITA[(offset + index * 2 + 6) % HORAS_CITA.length],
        duracion_min: esMedidas ? 30 : index === 1 ? 45 : 60,
        tipo: esMedidas ? 'medidas' : 'entrenamiento',
        rutina_id: esMedidas ? null : rutinas[Math.abs(offset + index) % rutinas.length],
        notas: esMedidas ? 'Control de medidas' : undefined,
      });
    });
  }
  useCitasStore.getState().addCitas(citas);
}

function patchCarlosSemana4Medidas(): void {
  const { usuarios, updateUsuario } = useUsuariosStore.getState();
  const carlos = usuarios.find((u) => u.id === 1);
  if (!carlos) return;
  const programacion = carlos.plan.programacion_semanal.map((s) =>
    s.semana === 4
      ? {
          ...s,
          notas: 'Semana 4 — control de medidas en consulta + progresión de carga en compuestos',
        }
      : s,
  );
  updateUsuario(1, (u) => ({ ...u, plan: { ...u.plan, programacion_semanal: programacion } }));
}

export function loadDemoTrainingData(): void {
  useUsuariosStore.getState().loadDemoSeed();
  patchCarlosSemana4Medidas();
  const usuarios = useUsuariosStore.getState().usuarios;
  const seeds = (sesionesRaw as SesionSeed[]).slice(0, 40);
  useSesionesStore.getState().replaceSesiones(mapSesiones(seeds));
  useCitasStore.setState({ citas: [] });
  seedCitas(usuarios.slice(0, 3).map((u) => u.id));
  seedDemoMedidas();
}
