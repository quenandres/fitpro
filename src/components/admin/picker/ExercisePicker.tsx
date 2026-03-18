import React, { useState, useMemo } from 'react';
import { Search, Plus, Sparkles, GripVertical, Trash2 } from 'lucide-react';
import { useDataStore } from '../../../store/useDataStore';
import type { Ejercicio } from '../../../types';
import { getSuggestions } from '../../../utils/suggestions';
import { Input, Select } from '../common/Input';
import { Button } from '../common/Button';

interface ExercisePickerProps {
  selectedExercises: { nombre: string; series: number; valor: number; unidad_id: number }[];
  onAdd: (exercise: { nombre: string; series: number; valor: number; unidad_id: number }) => void;
  onRemove: (index: number) => void;
}

export const ExercisePicker: React.FC<ExercisePickerProps> = ({
  selectedExercises,
  onAdd,
  onRemove,
}) => {
  const ejercicios = useDataStore(state => state.ejercicios);
  const unidades = useDataStore(state => state.unidades);
  
  const [search, setSearch] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterMusculo, setFilterMusculo] = useState('');
  const [selectedForAdd, setSelectedForAdd] = useState<Ejercicio | null>(null);
  const [addConfig, setAddConfig] = useState({ series: 3, valor: 10, unidad_id: 1 });

  const suggestions = useMemo(() => 
    getSuggestions(selectedExercises, ejercicios, ''),
    [selectedExercises, ejercicios]
  );

  const filteredExercises = useMemo(() => {
    return ejercicios.filter(e => {
      const matchSearch = !search || e.nombre.toLowerCase().includes(search.toLowerCase());
      const matchCategoria = !filterCategoria || e.categoria === filterCategoria;
      const matchMusculo = !filterMusculo || e.grupo_muscular.includes(filterMusculo);
      return matchSearch && matchCategoria && matchMusculo;
    });
  }, [ejercicios, search, filterCategoria, filterMusculo]);

  const categorias = [...new Set(ejercicios.map(e => e.categoria))];
  const musculos = [...new Set(ejercicios.flatMap(e => e.grupo_muscular))];

  const handleAddClick = (ej: Ejercicio) => {
    setSelectedForAdd(ej);
    setAddConfig({
      series: 3,
      valor: 10,
      unidad_id: ej.unidad_id_default || 1,
    });
  };

  const confirmAdd = () => {
    if (selectedForAdd) {
      onAdd({
        nombre: selectedForAdd.nombre,
        series: addConfig.series,
        valor: addConfig.valor,
        unidad_id: addConfig.unidad_id,
      });
      setSelectedForAdd(null);
    }
  };

  const getSimbolo = (id: number) => unidades.find(u => u.id === id)?.simbolo || '';

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="space-y-4">
        <Input
          placeholder="Buscar ejercicios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />
        
        <div className="flex gap-3">
          <Select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            options={[{ value: '', label: 'Todas las categorías' }, ...categorias.map(c => ({ value: c, label: c }))]}
          />
          <Select
            value={filterMusculo}
            onChange={(e) => setFilterMusculo(e.target.value)}
            options={[{ value: '', label: 'Todos los músculos' }, ...musculos.map(m => ({ value: m, label: m }))]}
          />
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && selectedExercises.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">Sugerencias basadas en tu rutina</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s.ejercicio.id}
                onClick={() => handleAddClick(s.ejercicio)}
                className="
                  px-3 py-1.5 rounded-lg text-sm
                  bg-white/5 hover:bg-orange-500/20
                  border border-white/10 hover:border-orange-500/30
                  text-gray-300 hover:text-white
                  transition-all
                "
              >
                + {s.ejercicio.nombre}
                <span className="block text-xs text-gray-500">{s.reason}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Exercise List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {filteredExercises.map((ej) => {
          const isSelected = selectedExercises.some(s => s.nombre === ej.nombre);
          return (
            <div
              key={ej.id}
              className={`
                p-4 rounded-xl border transition-all
                ${isSelected 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-white/5 border-white/10 hover:border-orange-500/30'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-white">{ej.nombre}</h4>
                  <p className="text-xs text-gray-400">
                    {ej.categoria} • {ej.grupo_muscular.slice(0, 2).join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => handleAddClick(ej)}
                  disabled={isSelected}
                  className={`
                    p-2 rounded-lg transition-all
                    ${isSelected 
                      ? 'text-green-400 cursor-not-allowed' 
                      : 'text-orange-400 hover:bg-orange-500/20'
                    }
                  `}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Exercises */}
      {selectedExercises.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">
            Ejercicios en la rutina ({selectedExercises.length})
          </h4>
          <div className="space-y-2">
            {selectedExercises.map((ex, idx) => (
              <div
                key={`${ex.nombre}-${idx}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <GripVertical className="w-4 h-4 text-gray-600 cursor-grab" />
                <span className="text-gray-500 text-sm w-6">{idx + 1}.</span>
                <span className="flex-1 text-white">{ex.nombre}</span>
                <span className="text-orange-400 text-sm font-medium">
                  {ex.series} × {ex.valor}{getSimbolo(ex.unidad_id)}
                </span>
                <button
                  onClick={() => onRemove(idx)}
                  className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {selectedForAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelectedForAdd(null)} />
          <div className="relative w-full max-w-md bg-[#1a1a1a] rounded-2xl p-6 border border-orange-500/30">
            <h3 className="text-lg font-bold text-white mb-4">Configurar {selectedForAdd.nombre}</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Input
                label="Series"
                type="number"
                value={addConfig.series}
                onChange={(e) => setAddConfig({ ...addConfig, series: parseInt(e.target.value) || 1 })}
              />
              <Input
                label="Valor"
                type="number"
                value={addConfig.valor}
                onChange={(e) => setAddConfig({ ...addConfig, valor: parseInt(e.target.value) || 1 })}
              />
              <Select
                label="Unidad"
                value={addConfig.unidad_id}
                onChange={(e) => setAddConfig({ ...addConfig, unidad_id: parseInt(e.target.value) })}
                options={unidades.map(u => ({ value: String(u.id), label: u.simbolo }))}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setSelectedForAdd(null)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={confirmAdd} className="flex-1">
                Agregar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
