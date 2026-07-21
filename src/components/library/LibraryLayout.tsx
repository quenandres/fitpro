import { Outlet } from 'react-router-dom';
import { AppShell } from '../layout/AppShell';
import { LibrarySubNav } from './LibrarySubNav';

export const LibraryLayout = () => (
  <AppShell subNav={<LibrarySubNav />}>
    <Outlet />
  </AppShell>
);
