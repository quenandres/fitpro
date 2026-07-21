import { Outlet } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { SimpleToast, useToast } from '../../components/admin/common/Toast';

export const AdminShell = () => {
  const { toast } = useToast();
  return (
    <>
      <SimpleToast {...toast} />
      <AdminLayout />
    </>
  );
};

/** Re-export for nested route outlet — AdminLayout already renders Outlet */
export const AdminOutlet = Outlet;
