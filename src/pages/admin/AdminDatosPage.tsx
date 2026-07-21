import { useDataStore } from '../../store/useDataStore';
import { useToast } from '../../components/admin/common/Toast';
import { AdminDatosTab } from './AdminDatosTab';

export const AdminDatosPage = () => {
  const { exportData, importData, resetToDefault } = useDataStore();
  const { showToast } = useToast();

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitpro-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Datos exportados', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      importData(ev.target?.result as string)
        ? showToast('Datos importados correctamente', 'success')
        : showToast('Error al importar datos', 'error');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (window.confirm('¿Restaurar datos por defecto? Esto eliminará todos los cambios.')) {
      resetToDefault();
      showToast('Datos restaurados', 'success');
    }
  };

  return (
    <AdminDatosTab onExport={handleExport} onImport={handleImport} onReset={handleReset} />
  );
};
