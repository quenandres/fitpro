import sesionesRaw from '../data/sesiones.json';
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
  return seeds.map((row) => ({
    id: row.id,
    usuario_id: row.usuario_id,
    fecha: fechaFromDaysAgo(row.days_ago),
    rutina_id: row.rutina_id,
    rutina_nombre: row.rutina_nombre,
    modalidad: row.modalidad,
    duracion_min: row.duracion_min,
    series_completadas: row.series_completadas,
    ejercicios: [],
  }));
}

function seedCitas(clientIds: number[]): void {
  const citas: Omit<Cita, 'id'>[] = [];
  for (let day = 1; day <= 14; day += 1) {
    const fecha = fechaFromDaysAgo(-day);
    const clienteId = clientIds[day % clientIds.length] ?? clientIds[0];
    citas.push({
      cliente_id: clienteId,
      fecha,
      hora_inicio: day % 2 === 0 ? '09:00' : '18:30',
      duracion_min: day % 3 === 0 ? 45 : 60,
      tipo: day % 5 === 0 ? 'medidas' : 'entrenamiento',
      rutina_id: day % 3 === 0 ? 2 : 5,
      notas: day % 5 === 0 ? 'Control de medidas' : undefined,
    });
  }
  useCitasStore.getState().addCitas(citas);
}

export function loadDemoTrainingData(): void {
  useUsuariosStore.getState().loadDemoSeed();
  const usuarios = useUsuariosStore.getState().usuarios;
  const seeds = (sesionesRaw as SesionSeed[]).slice(0, 40);
  useSesionesStore.getState().replaceSesiones(mapSesiones(seeds));
  useCitasStore.setState({ citas: [] });
  seedCitas(usuarios.slice(0, 3).map((u) => u.id));
}
