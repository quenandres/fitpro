import { useEffect } from 'react';
import { useTrainerClients } from '../lib/gateway/hooks';
import { useUsuariosStore } from '../store/useUsuariosStore';

export function useClientesSync() {
  const syncFromGateway = useUsuariosStore((s) => s.syncFromGateway);
  const gatewaySynced = useUsuariosStore((s) => s.gatewaySynced);
  const query = useTrainerClients();

  useEffect(() => {
    if (query.data?.length) {
      syncFromGateway(query.data);
    }
  }, [query.data, syncFromGateway]);

  return {
    isLoading: query.isLoading,
    gatewaySynced: gatewaySynced || Boolean(query.data?.length),
    refetch: query.refetch,
  };
}
