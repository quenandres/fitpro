import type {
  Ejercicio,
  EjercicioPersonalizado,
  EjercicioRutina,
  PlanUsuario,
  Rutina,
} from '../types';
import { ensureLocalExercise } from './ensureLocalExercise';

type EjercicioRutinaLegacy = Omit<EjercicioRutina, 'ejercicio_id'> & { ejercicio_id?: number };
type EjercicioPersonalizadoLegacy = EjercicioPersonalizado & { ejercicio_id?: number };

function resolveExerciseId(
  ejercicios: Ejercicio[],
  item: { nombre: string; unidad_id?: number; exerciseDbId?: string; musculos_anatomia?: string[] },
): { ejercicios: Ejercicio[]; id: number } {
  const exerciseDbId = item.exerciseDbId;
  const byDbTag =
    exerciseDbId != null
      ? ejercicios.find((e) => e.tags.includes(`exdb:${exerciseDbId}`))
      : undefined;
  if (byDbTag) {
    return { ejercicios, id: byDbTag.id };
  }

  return ensureLocalExercise(ejercicios, {
    nombre: item.nombre,
    unidad_id_default: item.unidad_id ?? 1,
    exerciseDbId,
    musculos_anatomia: item.musculos_anatomia,
  });
}

export function migrateEjercicioRutina(
  ejercicios: Ejercicio[],
  item: EjercicioRutinaLegacy,
): { ejercicios: Ejercicio[]; migrated: EjercicioRutina } {
  if (item.ejercicio_id != null && ejercicios.some((e) => e.id === item.ejercicio_id)) {
    return { ejercicios, migrated: item as EjercicioRutina };
  }

  const resolved = resolveExerciseId(ejercicios, item);
  return {
    ejercicios: resolved.ejercicios,
    migrated: { ...item, ejercicio_id: resolved.id },
  };
}

export function migrateEjercicioPersonalizado(
  ejercicios: Ejercicio[],
  item: EjercicioPersonalizadoLegacy,
): { ejercicios: Ejercicio[]; migrated: EjercicioPersonalizado } {
  if (item.ejercicio_id != null && ejercicios.some((e) => e.id === item.ejercicio_id)) {
    return { ejercicios, migrated: item as EjercicioPersonalizado };
  }

  const resolved = resolveExerciseId(ejercicios, {
    nombre: item.nombre,
    unidad_id: item.unidad_id,
    musculos_anatomia: item.musculos_anatomia,
  });
  return {
    ejercicios: resolved.ejercicios,
    migrated: { ...item, ejercicio_id: resolved.id },
  };
}

/** Migra rutinas legacy sin ejercicio_id; crea entradas faltantes en el catálogo mock. */
export function migrateRutinasWithExerciseIds(
  rutinas: Rutina[],
  ejercicios: Ejercicio[],
): { rutinas: Rutina[]; ejercicios: Ejercicio[] } {
  let catalog = [...ejercicios];
  const migratedRutinas = rutinas.map((rutina) => {
    let nextCatalog = catalog;
    const flat: EjercicioRutina[] = [];

    for (const item of rutina.ejercicios) {
      const result = migrateEjercicioRutina(nextCatalog, item);
      nextCatalog = result.ejercicios;
      flat.push(result.migrated);
    }
    catalog = nextCatalog;

    const programacion = rutina.programacion_semanal?.map((semana) => ({
      ...semana,
      dias: semana.dias.map((dia) => {
        let diaCatalog = catalog;
        const diaEjercicios: EjercicioRutina[] = [];
        for (const item of dia.ejercicios) {
          const result = migrateEjercicioRutina(diaCatalog, item);
          diaCatalog = result.ejercicios;
          diaEjercicios.push(result.migrated);
        }
        catalog = diaCatalog;
        return { ...dia, ejercicios: diaEjercicios };
      }),
    }));

    return {
      ...rutina,
      ejercicios: flat,
      programacion_semanal: programacion,
    };
  });

  return { rutinas: migratedRutinas, ejercicios: catalog };
}

function migrateEjerciciosList(
  ejercicios: Ejercicio[],
  list: EjercicioPersonalizadoLegacy[],
): { ejercicios: Ejercicio[]; migrated: EjercicioPersonalizado[] } {
  let catalog = ejercicios;
  const migrated = list.map((item) => {
    const result = migrateEjercicioPersonalizado(catalog, item);
    catalog = result.ejercicios;
    return result.migrated;
  });
  return { ejercicios: catalog, migrated };
}

/** Migra snapshots de plan sin ejercicio_id. */
export function migratePlanUsuarioEjercicios(
  plan: PlanUsuario,
  ejercicios: Ejercicio[],
): { plan: PlanUsuario; ejercicios: Ejercicio[] } {
  let catalog = [...ejercicios];

  const topLevel = migrateEjerciciosList(catalog, plan.ejercicios_personalizados ?? []);
  catalog = topLevel.ejercicios;

  const programacion_semanal = plan.programacion_semanal.map((semana) => ({
    ...semana,
    sesiones: semana.sesiones.map((sesion) => {
      const result = migrateEjerciciosList(catalog, sesion.ejercicios_personalizados);
      catalog = result.ejercicios;
      return { ...sesion, ejercicios_personalizados: result.migrated };
    }),
  }));

  return {
    plan: {
      ...plan,
      ejercicios_personalizados: topLevel.migrated,
      programacion_semanal,
    },
    ejercicios: catalog,
  };
}
