import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Dumbbell, Activity, Ruler, ChevronLeft, Download, Upload, RotateCcw, Plus, Trash2, Pencil, Video } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { UnitManager } from '../components/admin/UnitManager';
import { RoutineWizard } from '../components/admin/wizard/RoutineWizard';
import { ExerciseForm } from '../components/admin/ExerciseForm';
import { Button } from '../components/admin/common/Button';
import { Input } from '../components/admin/common/Input';
import { SimpleToast, useToast } from '../components/admin/common/Toast';
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

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <div className="flex flex-col md:flex-row gap-3">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar ejercicios..."
            className="flex-1"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 focus:border-orange-500 focus:outline-none"
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

      {/* Exercise Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filteredEjercicios.map(ej => (
          <div key={ej.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-orange-300 transition-colors group">
            <div className="flex items-start gap-3">
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                {ej.imagen ? (
                  <img src={ej.imagen} alt={ej.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 truncate">{ej.nombre}</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 text-xs">
                    {ej.categoria}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 text-xs">
                    {ej.dificultad}
                  </span>
                  {ej.videos && ej.videos.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-600 text-xs flex items-center gap-0.5">
                      <Video className="w-3 h-3" /> {ej.videos.length}
                    </span>
                  )}
                </div>
                {ej.descripcion && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ej.descripcion}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEditExercise(ej)}
                  className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-all"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('¿Eliminar este ejercicio?')) {
                      deleteEjercicio(ej.id);
                      showToast('Ejercicio eliminado', 'success');
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-all"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEjercicios.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            {searchTerm || filterCategory ? 'No se encontraron ejercicios' : 'No hay ejercicios'}
          </h3>
          <p className="text-gray-500 mb-6">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <SimpleToast {...toast} />
      
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors">
                <ChevronLeft className="w-5 h-5"/>
                <span className="text-sm">Volver</span>
              </Link>
              <div className="w-px h-6 bg-gray-300"/>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
                  <Settings className="w-5 h-5 text-white"/>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800 tracking-wide">Panel de Administración</h1>
                  <p className="text-xs text-orange-500">FitPro Manager</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-xs font-medium text-gray-600">
                <span className="text-orange-500">●</span> {rutinas.length} Rutinas
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-xs font-medium text-gray-600">
                <span className="text-green-500">●</span> {ejercicios.length} Ejercicios
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-xs font-medium text-gray-600">
                <span className="text-blue-500">●</span> {unidades.length} Unidades
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 mt-6">
        <div className="flex gap-2 p-1.5 rounded-2xl bg-white shadow-sm border border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl 
                font-semibold text-sm transition-all duration-300
                ${activeTab === tab.id 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'rutinas' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button 
                onClick={handleNewRoutine} 
                icon={<Plus className="w-5 h-5" />}
              >
                Nueva Rutina
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {rutinas.map(r => (
                <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:border-orange-300 transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg mb-1">{r.nombre}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-600 text-xs font-medium">
                          {r.categoria}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-600 text-xs font-medium">
                          {r.dificultad}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-600 text-xs font-medium">
                          {r.duracion_min} min
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm">{r.ejercicios.length} ejercicios</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditRoutine(r)}
                        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-blue-50 text-blue-500 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('¿Eliminar esta rutina?')) {
                            useDataStore.getState().deleteRutina(r.id);
                            showToast('Rutina eliminada', 'success');
                          }
                        }}
                        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {rutinas.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No hay rutinas</h3>
                <p className="text-gray-500 mb-6">Crea tu primera rutina para comenzar</p>
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

      <div className="max-w-5xl mx-auto px-4 pb-6">
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="secondary" onClick={handleExport} icon={<Download className="w-4 h-4" />}>
            Exportar Datos
          </Button>
          <label className="cursor-pointer">
            <input type="file" accept=".json" onChange={handleImport} className="hidden"/>
            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm">
              <Upload className="w-4 h-4"/>Importar Datos
            </span>
          </label>
          <Button variant="ghost" onClick={handleReset} icon={<RotateCcw className="w-4 h-4" />}>
            Restaurar
          </Button>
        </div>
      </div>

      <footer className="text-center py-6">
        <p className="text-xs text-gray-400">FitPro Admin Panel • {new Date().toISOString().split('T')[0]}</p>
      </footer>

      <RoutineWizard 
        isOpen={showWizard} 
        onClose={handleCloseWizard}
        editingRutina={editingRutina}
      />
    </div>
  );
};
