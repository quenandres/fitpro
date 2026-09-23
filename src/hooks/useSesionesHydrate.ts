import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchClientHistorial } from '../lib/gateway/training.service';
import { isMockMode } from '../lib/mock-mode';
import { useClientesSync } from './useClientesSync';
import { useTrainerClients } from '../lib/gateway/hooks';
import { useSesionesStore } from '../store/useSesionesStore';
import { useUsuariosStore } from '../store/useUsuariosStore';
import { mapGatewayHistorial } from '../utils/historialGatewayAdapter';

export function useSesionesHydrate() {
  useClientesSync();
  const mockMode = isMockMode();
  const clientsQuery = useTrainerClients();
  const usuarios = useUsuariosStore((s) => s.usuarios);
  const replaceSesiones = useSesionesStore((s) => s.replaceSesiones);

  const linked = useMemo(
    () =>
      usuarios
        .filter((u): u is typeof u & { client_uuid: string } => Boolean(u.client_uuid))
        .map((u) => ({ id: u.id, uuid: u.client_uuid })),
    [usuarios],
  );

  const sesionesQuery = useQuery({
    queryKey: ['trainer-sesiones-hydrate', linked.map((l) => l.uuid).join('|')],
    queryFn: async () => {
      const batches = await Promise.all(
        linked.map(async ({ id, uuid }) => {
          const rows = await fetchClientHistorial(uuid);
          return mapGatewayHistorial(rows, id);
        }),
      );
      return batches.flat().sort((a, b) => b.fecha.localeCompare(a.fecha));
    },
    enabled: !mockMode && clientsQuery.isSuccess && linked.length > 0,
    staleTime: 15_000,
  });

  useEffect(() => {
    if (mockMode) return;
    if (!clientsQuery.isSuccess) return;
    if (linked.length === 0) {
      replaceSesiones([]);
    }
  }, [mockMode, clientsQuery.isSuccess, linked.length, replaceSesiones]);

  useEffect(() => {
    if (mockMode) return;
    if (sesionesQuery.data) {
      replaceSesiones(sesionesQuery.data);
    }
  }, [mockMode, sesionesQuery.data, replaceSesiones]);

  return {
    isLoading: mockMode
      ? false
      : clientsQuery.isLoading || (linked.length > 0 && sesionesQuery.isLoading),
    isError: mockMode ? false : sesionesQuery.isError,
    refetch: sesionesQuery.refetch,
  };
}
