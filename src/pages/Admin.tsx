import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Dumbbell, Activity, Ruler, ChevronLeft, Download, Upload, RotateCcw, Plus, Search } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { UnitManager } from '../components/admin/UnitManager';
import { RoutineWizard } from '../components/admin/wizard/RoutineWizard';
import { ExerciseForm } from '../components/admin/ExerciseForm';
import { Button } from '../components/admin/common/Button';
import { SimpleToast, useToast } from '../components/admin/common/Toast';
import { RoutineCard } from '../components/admin/RoutineCard';
import { AdminExerciseCard } from '../components/admin/AdminExerciseCard';
import type { Rutina, Ejercicio } from '../types';

type Tab = 'rutinas' | 'ejercicios' | 'unidades';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'rutinas', label: 'Rutinas', icon: <Dumbbell className="w-5 h-5" /> },
  { id: 'ejercicios', label: 'Ejercicios', icon: <Activity className="w-5 h-5" /> },
  { id: 'unidades', label: 'Unidades', icon: <Ruler className="w-5 h-5" /> },
];

const ExerciseManager = () => {
  const { ejercicios, addEjercicio, updateEjercicio, deleteEjercicio } = useDataStore();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingEjercicio, setEditingEjercicio] = useState<Ejercicio | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const filteredEjercicios = ejercicios.filter(ej => {
    const matchesSearch = ej.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || ej.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categorias = [...new Set(ejercicios.map(e => e.categoria))];

  const handleNewExercise = () => {
    setEditingEjercicio(null);
    setShowForm(true);
  };

  const handleEditExercise = (ejercicio: Ejercicio) => {
    setEditingEjercicio(ejercicio);
    setShowForm(true);
  };

  const handleSaveExercise = (data: Omit<Ejercicio, 'id'>) => {
    if (editingEjercicio) {
      updateEjercicio(editingEjercicio.id, data);
    } else {
      addEjercicio(data);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEjercicio(null);
  };

  const handleDeleteExercise = (id: number) => {
    if (window.confirm('¿Eliminar este ejercicio?')) {
      deleteEjercicio(id);
      showToast('Ejercicio eliminado', 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border p-5" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent-green)] to-[var(--accent-blue)] rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 z-10" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar ejercicios..."
                className="w-full py-3.5 pl-12 pr-4 rounded-xl focus:outline-none"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '2px solid var(--border-color)' }}
              />
            </div>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 rounded-xl focus:outline-none transition-all cursor-pointer"
            style={{ 
              background: 'var(--bg-tertiary)', 
              color: 'var(--text-primary)', 
              border: '2px solid var(--border-color)'
            }}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Button onClick={handleNewExercise} icon={<Plus className="w-5 h-5" />}>
            Nuevo Ejercicio
          </Button>
        </div>
      </div>

      {(searchTerm || filterCategory) && (
        <div className="text-sm px-2" style={{ color: 'var(--text-muted)' }}>
          Mostrando {filteredEjercicios.length} de {ejercicios.length} ejercicios
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredEjercicios.map(ej => (
          <AdminExerciseCard
            key={ej.id}
            ejercicio={ej}
            onEdit={handleEditExercise}
            onDelete={handleDeleteExercise}
          />
        ))}
      </div>

      {filteredEjercicios.length === 0 && (
        <div className="text-center py-16 rounded-3xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[var(--accent-green)]/20 to-[var(--accent-blue)]/20 flex items-center justify-center">
            <Activity className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {searchTerm || filterCategory ? 'No se encontraron ejercicios' : 'No hay ejercicios'}
          </h3>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
            {searchTerm || filterCategory ? 'Intenta con otros filtros' : 'Crea tu primer ejercicio'}
          </p>
          {!searchTerm && !filterCategory && (
            <Button onClick={handleNewExercise} icon={<Plus className="w-5 h-5" />}>
              Crear Ejercicio
            </Button>
          )}
        </div>
      )}

      <ExerciseForm
        isOpen={showForm}
        onClose={handleCloseForm}
        editingEjercicio={editingEjercicio}
        onSave={handleSaveExercise}
      />
    </div>
  );
};

export const Admin = () => {
  const [activeTab, setActiveTab] = useState<Tab>('rutinas');
  const { exportData, importData, resetToDefault, rutinas, ejercicios, unidades } = useDataStore();
  const [showWizard, setShowWizard] = useState(false);
  const [editingRutina, setEditingRutina] = useState<Rutina | null>(null);
  const { toast, showToast } = useToast();

  const handleNewRoutine = () => {
    setEditingRutina(null);
    setShowWizard(true);
  };

  const handleEditRoutine = (rutina: Rutina) => {
    setEditingRutina(rutina);
    setShowWizard(true);
  };

  const handleCloseWizard = () => {
    setShowWizard(false);
    setEditingRutina(null);
  };

  const handleDeleteRoutine = (id: number) => {
    if (window.confirm('¿Eliminar esta rutina?')) {
      useDataStore.getState().deleteRutina(id);
      showToast('Rutina eliminada', 'success');
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitpro-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Datos exportados correctamente', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (importData(event.target?.result as string)) {
        showToast('Datos importados correctamente', 'success');
      } else {
        showToast('Error al importar datos', 'error');
      }
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
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <SimpleToast {...toast} />
      
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: 'rgba(var(--bg-secondary), 0.9)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 p-2.5 rounded-xl transition-all hover:scale-105"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                <ChevronLeft className="w-5 h-5"/>
              </Link>
              <div className="w-px h-8" style={{ background: 'var(--border-color)' }}/>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)] flex items-center justify-center shadow-lg">
                  <Settings className="w-6 h-6 text-black"/>
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>Panel de Administración</h1>
                  <p className="text-xs font-semibold" style={{ color: 'var(--accent-green)' }}>FitPro Manager</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl border text-sm font-semibold" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
                <span className="text-orange-400">●</span> {rutinas.length} Rutinas
              </div>
              <div className="px-4 py-2 rounded-xl border text-sm font-semibold" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
                <span className="text-green-400">●</span> {ejercicios.length} Ejercicios
              </div>
              <div className="px-4 py-2 rounded-xl border text-sm font-semibold" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
                <span className="text-blue-400">●</span> {unidades.length} Unidades
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex gap-2 p-1.5 rounded-2xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300"
              style={{
                background: activeTab === tab.id 
                  ? 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))' 
                  : 'transparent',
                color: activeTab === tab.id ? 'black' : 'var(--text-secondary)',
                boxShadow: activeTab === tab.id ? '0 4px 20px var(--glow-green)' : 'none'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'rutinas' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={handleNewRoutine} icon={<Plus className="w-5 h-5" />}>
                Nueva Rutina
              </Button>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {rutinas.map(r => (
                <RoutineCard
                  key={r.id}
                  rutina={r}
                  onEdit={handleEditRoutine}
                  onDelete={handleDeleteRoutine}
                />
              ))}
            </div>
            {rutinas.length === 0 && (
              <div className="text-center py-16 rounded-3xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[var(--accent-green)]/20 to-[var(--accent-blue)]/20 flex items-center justify-center">
                  <Dumbbell className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No hay rutinas</h3>
                <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Crea tu primera rutina para comenzar</p>
                <Button onClick={handleNewRoutine} icon={<Plus className="w-5 h-5" />}>
                  Crear Rutina
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ejercicios' && (
          <ExerciseManager />
        )}

        {activeTab === 'unidades' && <UnitManager />}
      </main>

      <div className="max-w-6xl mx-auto px-4 pb-6">
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="secondary" onClick={handleExport} icon={<Download className="w-4 h-4" />}>
            Exportar Datos
          </Button>
          <label className="cursor-pointer">
            <input type="file" accept=".json" onChange={handleImport} className="hidden"/>
            <span className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', color: 'white', boxShadow: '0 4px 15px var(--glow-blue)' }}>
              <Upload className="w-4 h-4"/>Importar Datos
            </span>
          </label>
          <Button variant="ghost" onClick={handleReset} icon={<RotateCcw className="w-4 h-4" />}>
            Restaurar
          </Button>
        </div>
      </div>

      <footer className="text-center py-6">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>FitPro Admin Panel • {new Date().toISOString().split('T')[0]}</p>
      </footer>

      <RoutineWizard 
        isOpen={showWizard} 
        onClose={handleCloseWizard}
        editingRutina={editingRutina}
      />
    </div>
  );
};
