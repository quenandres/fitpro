import { Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../routes/paths';
import type { RoutineFormLevel } from '../types';

/** Preserva query string al migrar rutas legacy de formulario de rutina. */
export const LegacyRoutineFormRedirect = ({ level }: { level: RoutineFormLevel }) => {
  const { search } = useLocation();
  return <Navigate to={`${ROUTES.library.rutinaNueva(level)}${search}`} replace />;
};
