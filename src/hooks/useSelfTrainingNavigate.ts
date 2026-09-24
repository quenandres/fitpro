import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUsuariosStore } from '../store/useUsuariosStore';
import { ROUTES } from '../routes/paths';
import { resolveSelfTrainingUsuarioId } from '../utils/selfTrainingClient';
import { useToastHook } from '../components/common/Toast';
import { gatewayErrorMessage } from '../lib/gateway/errors';

export function useSelfTrainingNavigate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToastHook();
  const syncFromGateway = useUsuariosStore((s) => s.syncFromGateway);
  const [isPending, setIsPending] = useState(false);

  const goToSelfTraining = useCallback(async () => {
    setIsPending(true);
    try {
      const id = await resolveSelfTrainingUsuarioId(user?.id, {
        getUsuarios: () => useUsuariosStore.getState().usuarios,
        syncFromGateway,
      });
      navigate(ROUTES.usuarioEntrenamientos(id), { replace: true });
    } catch (err: unknown) {
      toast.error(
        'No se abrió tu plan',
        err instanceof Error ? err.message : gatewayErrorMessage(err, 'Inténtalo de nuevo.'),
      );
    } finally {
      setIsPending(false);
    }
  }, [navigate, syncFromGateway, toast, user?.id]);

  return { goToSelfTraining, isPending };
}
