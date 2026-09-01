import { Navigate, useSearchParams } from 'react-router-dom';
import { useTemplates } from '../lib/gateway/hooks/useTemplates';
import { inferRoutineFormLevel, routineFormPath } from '../utils/inferRoutineFormLevel';
import { ROUTES } from '../routes/paths';

/** Redirect legacy /admin/rutina → builder unificado en library */
export const RoutinePageRedirect = () => {
  const [params] = useSearchParams();
  const id = params.get('id');
  const { data: rutinas = [] } = useTemplates();

  if (!id) {
    return <Navigate to={ROUTES.library.rutinasNueva} replace />;
  }

  const rutina = rutinas.find((r) => r.id === id);
  if (!rutina) {
    return <Navigate to={ROUTES.library.rutinas} replace />;
  }

  const level = inferRoutineFormLevel(rutina);
  return <Navigate to={routineFormPath(level, id)} replace />;
};
