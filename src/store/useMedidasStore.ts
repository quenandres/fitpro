import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SitioMedidaId, SnapshotMedidas, ValoresSitio } from '../types';

interface MedidasStore {
  snapshots: SnapshotMedidas[];
  getSnapshotByDate: (usuarioId: number, fecha: string) => SnapshotMedidas | undefined;
  getLatest: (usuarioId: number) => SnapshotMedidas | undefined;
  getHistory: (usuarioId: number, limit?: number) => SnapshotMedidas[];
  upsertSnapshot: (payload: {
    usuario_id: number;
    fecha: string;
    peso_kg?: number;
    sitios?: Partial<Record<SitioMedidaId, ValoresSitio>>;
  }) => SnapshotMedidas;
  updateSitio: (
    usuarioId: number,
    fecha: string,
    sitioId: SitioMedidaId,
    valores: ValoresSitio,
  ) => SnapshotMedidas;
  updatePeso: (usuarioId: number, fecha: string, peso_kg: number | undefined) => SnapshotMedidas;
}

function newSnapshotId(): string {
  return `med-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sortByFechaDesc(a: SnapshotMedidas, b: SnapshotMedidas): number {
  return b.fecha.localeCompare(a.fecha);
}

export const useMedidasStore = create<MedidasStore>()(
  persist(
    (set, get) => ({
      snapshots: [],

      getSnapshotByDate: (usuarioId, fecha) =>
        get().snapshots.find((s) => s.usuario_id === usuarioId && s.fecha === fecha),

      getLatest: (usuarioId) => {
        const list = get()
          .snapshots.filter((s) => s.usuario_id === usuarioId)
          .sort(sortByFechaDesc);
        return list[0];
      },

      getHistory: (usuarioId, limit = 8) => {
        const list = get()
          .snapshots.filter((s) => s.usuario_id === usuarioId)
          .sort(sortByFechaDesc);
        return limit > 0 ? list.slice(0, limit) : list;
      },

      upsertSnapshot: ({ usuario_id, fecha, peso_kg, sitios }) => {
        let result: SnapshotMedidas;
        set((state) => {
          const idx = state.snapshots.findIndex(
            (s) => s.usuario_id === usuario_id && s.fecha === fecha,
          );
          if (idx >= 0) {
            const prev = state.snapshots[idx];
            result = {
              ...prev,
              peso_kg: peso_kg ?? prev.peso_kg,
              sitios: sitios ? { ...prev.sitios, ...sitios } : prev.sitios,
            };
            const next = [...state.snapshots];
            next[idx] = result;
            return { snapshots: next };
          }
          result = {
            id: newSnapshotId(),
            usuario_id,
            fecha,
            peso_kg,
            sitios: sitios ?? {},
          };
          return { snapshots: [...state.snapshots, result] };
        });
        return result!;
      },

      updateSitio: (usuarioId, fecha, sitioId, valores) => {
        const existing = get().getSnapshotByDate(usuarioId, fecha);
        const sitios = { ...(existing?.sitios ?? {}), [sitioId]: valores };
        return get().upsertSnapshot({
          usuario_id: usuarioId,
          fecha,
          peso_kg: existing?.peso_kg,
          sitios,
        });
      },

      updatePeso: (usuarioId, fecha, peso_kg) => {
        const existing = get().getSnapshotByDate(usuarioId, fecha);
        return get().upsertSnapshot({
          usuario_id: usuarioId,
          fecha,
          peso_kg,
          sitios: existing?.sitios,
        });
      },
    }),
    { name: 'fitpro-medidas' },
  ),
);
