import { Navigate } from 'react-router-dom';
import { ROUTES } from '../routes/paths';

/** @deprecated Usar `/usuarios` — redirección legacy desde biblioteca. */
const UserPlansPage = () => <Navigate to={ROUTES.usuarios} replace />;

export { UserPlansPage };
