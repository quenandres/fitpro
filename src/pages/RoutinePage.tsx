import { Navigate, useSearchParams } from 'react-router-dom';
import { useDataStore } from '../store/useDataStore';
import { inferRoutineFormLevel, routineFormPath } from '../utils/inferRoutineFormLevel';
import { ROUTES } from '../routes/paths';

/** Redirect legacy /admin/rutina → builder unificado en library */
export const RoutinePageRedirect = () => {
  const [params] = useSearchParams();
  const id = params.get('id') ? Number(params.get('id')) : null;
  const rutinas = useDataStore((s) => s.rutinas);

  if (id == null) {
    return <Navigate to={ROUTES.library.rutinasNueva} replace />;
  }

  const rutina = rutinas.find((r) => r.id === id);
  if (!rutina) {
    return <Navigate to={ROUTES.library.rutinas} replace />;
  }

  const level = inferRoutineFormLevel(rutina);
  return <Navigate to={routineFormPath(level, id)} replace />;
};
