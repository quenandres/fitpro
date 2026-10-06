import { useEffect, useRef } from 'react';
import type { Usuario } from '../types';
import { useDataStore } from '../store/useDataStore';
import type { usePlanMutations } from './usePlanMutations';

/**
 * Activa perezosamente la rutina en cola de un usuario cuando `activar_en` ya pasó
 * (transición "programar al terminar el bloque" del gestor de reemplazo).
 */
export function useRutinaEnColaActivation(
  user: Usuario | null,
  mutations: Pick<ReturnType<typeof usePlanMutations>, 'reemplazarRutina'>,
) {
  const rutinas = useDataStore((s) => s.rutinas);
  const activadoPara = useRef<string | null>(null);

  useEffect(() => {
    const cola = user?.plan.rutina_en_cola;
    if (!user || !cola) return;
    const key = `${user.id}:${cola.rutina_id}:${cola.activar_en}`;
    if (activadoPara.current === key) return;

    const hoy = new Date().toISOString().slice(0, 10);
    if (hoy < cola.activar_en) return;

    const rutina = rutinas.find((r) => r.id === cola.rutina_id);
    if (!rutina) return;

    activadoPara.current = key;
    mutations.reemplazarRutina(rutina, 'reiniciar');
  }, [user, rutinas, mutations]);
}
