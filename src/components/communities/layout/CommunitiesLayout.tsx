import { Outlet } from 'react-router-dom';
import { AppShell } from '../../layout/AppShell';

/**
 * Shell del módulo Comunidades. Placeholder de Fase 0 — Fase 1 añade
 * `CommunityLayout` (3 columnas) para las rutas anidadas bajo `/communities/:id`.
 */
export const CommunitiesLayout = () => (
  <AppShell width="wide">
    <Outlet />
  </AppShell>
);
