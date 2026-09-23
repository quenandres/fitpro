import { useEffect } from 'react';
import { useTrainerClients } from '../lib/gateway/hooks';
import { isMockMode } from '../lib/mock-mode';
import { useUsuariosStore } from '../store/useUsuariosStore';

export function useClientesSync() {
  const syncFromGateway = useUsuariosStore((s) => s.syncFromGateway);
  const gatewaySynced = useUsuariosStore((s) => s.gatewaySynced);
  const mockMode = isMockMode();
  const query = useTrainerClients();

  useEffect(() => {
    if (mockMode) return;
    if (query.isSuccess && query.data !== undefined) {
      syncFromGateway(query.data);
    }
  }, [mockMode, query.isSuccess, query.data, syncFromGateway]);

  return {
    isLoading: mockMode ? false : query.isLoading,
    gatewaySynced: mockMode ? gatewaySynced : gatewaySynced || Boolean(query.data?.length),
    refetch: query.refetch,
  };
}
