import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';

import { getAuthContext } from '../context.service';
import { gatewayKeys, GATEWAY_STALE_TIME } from '../queryKeys';
import type { AuthContext } from '../schemas/auth';

export function useAuthContext(enabled = true): UseQueryResult<AuthContext, Error> {
  return useQuery({
    queryKey: gatewayKeys.authContext(),
    queryFn: getAuthContext,
    enabled,
    staleTime: GATEWAY_STALE_TIME,
  });
}

export function useInvalidateAuthContext(): () => void {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: gatewayKeys.authContext() });
  };
}

export function useRefreshAuthContext() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: getAuthContext,
    onSuccess: (data) => {
      qc.setQueryData(gatewayKeys.authContext(), data);
    },
  });
}
