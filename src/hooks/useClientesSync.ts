import { useEffect } from 'react';
import { useTrainerClients } from '../lib/gateway/hooks';
import { TRAINER_CLIENTS_PAGE_SIZE } from '../lib/gateway/training.service';
import { isMockMode } from '../lib/mock-mode';
import { useUsuariosStore } from '../store/useUsuariosStore';

export function useClientesSync(page = 1, limit = TRAINER_CLIENTS_PAGE_SIZE) {
  const syncFromGateway = useUsuariosStore((s) => s.syncFromGateway);
  const gatewaySynced = useUsuariosStore((s) => s.gatewaySynced);
  const mockMode = isMockMode();
  const query = useTrainerClients(page, limit);

  useEffect(() => {
    if (mockMode) return;
    if (query.isSuccess && query.data !== undefined) {
      syncFromGateway(query.data.clients);
    }
  }, [mockMode, query.isSuccess, query.data, syncFromGateway]);

  return {
    query,
    isLoading: mockMode ? false : query.isLoading,
    gatewaySynced: mockMode ? gatewaySynced : gatewaySynced || query.isSuccess,
    refetch: query.refetch,
  };
}
