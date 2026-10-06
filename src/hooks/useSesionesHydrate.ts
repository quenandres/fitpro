import { useEffect, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { fetchClientHistorial } from '../lib/gateway/training.service';
import { trainerKeys } from '../lib/gateway/hooks';
import { isMockMode } from '../lib/mock-mode';
import { useSesionesStore } from '../store/useSesionesStore';
import { useUsuariosStore } from '../store/useUsuariosStore';
import { mapGatewayHistorial } from '../utils/historialGatewayAdapter';

function dedupeLinkedByUuid(
  linked: Array<{ id: number; uuid: string }>,
): Array<{ id: number; uuid: string }> {
  const seen = new Set<string>();
  const out: Array<{ id: number; uuid: string }> = [];
  for (const entry of linked) {
    if (seen.has(entry.uuid)) continue;
    seen.add(entry.uuid);
    out.push(entry);
  }
  return out;
}

export function useSesionesHydrate() {
  const mockMode = isMockMode();
  const gatewaySynced = useUsuariosStore((s) => s.gatewaySynced);
  const usuarios = useUsuariosStore((s) => s.usuarios);
  const replaceSesiones = useSesionesStore((s) => s.replaceSesiones);

  const linked = useMemo(() => {
    const raw = usuarios
      .filter((u): u is typeof u & { client_uuid: string } => Boolean(u.client_uuid))
      .map((u) => ({ id: u.id, uuid: u.client_uuid }));
    return dedupeLinkedByUuid(raw);
  }, [usuarios]);

  const historialQueryDefs = useMemo(
    () =>
      linked.map(({ id, uuid }) => ({
        id,
        uuid,
        queryKey: trainerKeys.clientHistorial(uuid),
        queryFn: () => fetchClientHistorial(uuid),
        enabled: !mockMode && gatewaySynced,
        staleTime: 60_000,
      })),
    [linked, mockMode, gatewaySynced],
  );

  const historialQueries = useQueries({ queries: historialQueryDefs });

  const historialSyncKey = historialQueries
    .map((q) => `${q.fetchStatus}:${q.status}:${q.dataUpdatedAt}`)
    .join('|');

  const mergedSesiones = useMemo(() => {
    if (mockMode || !gatewaySynced || linked.length === 0) return null;
    if (historialQueries.some((q) => q.isPending)) return undefined;
    const merged = historialQueries.flatMap((q, index) => {
      if (!q.data) return [];
      return mapGatewayHistorial(q.data, linked[index]!.id);
    });
    merged.sort((a, b) => b.fecha.localeCompare(a.fecha));
    return merged;
  }, [mockMode, gatewaySynced, linked, historialQueries, historialSyncKey]);

  useEffect(() => {
    if (mockMode) return;
    if (!gatewaySynced) return;
    if (linked.length === 0) {
      replaceSesiones([]);
      return;
    }
    if (mergedSesiones === undefined || mergedSesiones === null) return;
    replaceSesiones(mergedSesiones);
  }, [mockMode, gatewaySynced, linked.length, mergedSesiones, replaceSesiones]);

  const isLoading =
    !mockMode &&
    gatewaySynced &&
    linked.length > 0 &&
    historialQueries.some((q) => q.isPending);

  const isError =
    !mockMode && historialQueries.some((q) => q.isError);

  return {
    isLoading,
    isError,
    refetch: () =>
      Promise.all(historialQueries.map((q) => q.refetch())).then(() => undefined),
  };
}
