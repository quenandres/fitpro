import { useDataStore } from '../../store/useDataStore';
import { useToast } from '../../components/admin/common/Toast';
import { AdminRutinasTab } from './AdminRutinasTab';

export const AdminRutinasPage = () => {
  const { showToast } = useToast();

  const handleDelete = (id: number) => {
    if (window.confirm('¿Eliminar esta rutina?')) {
      useDataStore.getState().deleteRutina(id);
      showToast('Rutina eliminada', 'success');
    }
  };

  return <AdminRutinasTab onDelete={handleDelete} />;
};
