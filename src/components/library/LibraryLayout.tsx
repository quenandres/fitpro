import { Outlet, useLocation } from 'react-router-dom';
import { AppShell } from '../layout/AppShell';
import { LibrarySubNav } from './LibrarySubNav';
import { resolveShellWidth } from '../layout/shellWidth';

export const LibraryLayout = () => {
  const { pathname } = useLocation();
  const width = resolveShellWidth(pathname);

  return (
    <AppShell subNav={<LibrarySubNav />} width={width}>
      <Outlet />
    </AppShell>
  );
};
