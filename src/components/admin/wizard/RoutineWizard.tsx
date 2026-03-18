import React, { useState } from 'react';
import { X, Plus, Trash2, ChevronRight, ChevronLeft, Sparkles, Save, Dumbbell, Settings, ListChecks, Clock, FileText } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { WizardProgress } from './WizardProgress';
import { Input } from '../common/Input';
import { 
  validateStep1, 
  validateStep2, 
  validateStep3, 
  validateStep4,
  categoryOptions, 
  difficultyOptions, 
  routineTypeOptions, 
  durationOptions,
  restOptions,
  type ValidationError
} from '../../../utils/validators';
import { getSuggestions, type ExerciseSuggestion } from '../../../utils/suggestions';
import { useDataStore } from '../../../store/useDataStore';
import type { Ejercicio, Rutina } from '../../../types';

interface RoutineWizardProps {
  isOpen: boolean;
  onClose: () => void;
  editingRutina?: Rutina | null;
}

export interface ExerciseInRoutine {
  nombre: string;
  series: number;
  valor: number;
  unidad_id: number;
  ejercicio_id?: number;
}

export interface RoutineFormData {
  nombre: string;
  categoria: string;
  descripcion: string;
  dificultad: string;
  duracion_min: number;
  tipo: string;
  ejercicios: ExerciseInRoutine[];
  rest_between_sets: number;
  notes: string;
}

const steps = [
  { id: 1, title: 'Información', icon: <Dumbbell className="w-5 h-5" /> },
  { id: 2, title: 'Configuración', icon: <Settings className="w-5 h-5" /> },
  { id: 3, title: 'Ejercicios', icon: <ListChecks className="w-5 h-5" /> },
  { id: 4, title: 'Avanzado', icon: <Clock className="w-5 h-5" /> },
  { id: 5, title: 'Revisión', icon: <FileText className="w-5 h-5" /> },
];

export const RoutineWizard: React.FC<RoutineWizardProps> = ({ isOpen, onClose, editingRutina }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [suggestions, setSuggestions] = useState<ExerciseSuggestion[]>([]);
  
  const { ejercicios, unidades, addRutina, updateRutina } = useDataStore();

  const getInitialFormData = (): RoutineFormData => {
    if (editingRutina) {
      return {
        nombre: editingRutina.nombre,
        categoria: editingRutina.categoria,
        descripcion: editingRutina.descripcion,
        dificultad: editingRutina.dificultad,
        duracion_min: editingRutina.duracion_min,
        tipo: 'estandar',
        ejercicios: editingRutina.ejercicios.map(e => ({
          nombre: e.nombre,
          series: e.series,
          valor: e.valor,
          unidad_id: e.unidad_id,
        })),
        rest_between_sets: 60,
        notes: '',
      };
    }
    return {
      nombre: '',
      categoria: '',
      descripcion: '',
      dificultad: '',
      duracion_min: 30,
      tipo: 'estandar',
      ejercicios: [],
      rest_between_sets: 60,
      notes: '',
    };
  };
  
  const [formData, setFormData] = useState<RoutineFormData>(getInitialFormData());

  React.useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setCurrentStep(1);
      setErrors([]);
    }
  }, [isOpen, editingRutina]);

  const validateCurrentStep = (): boolean => {
    let stepErrors: ValidationError[] = [];
    
    switch (currentStep) {
      case 1:
        stepErrors = validateStep1(formData);
        break;
      case 2:
        stepErrors = validateStep2(formData);
        break;
      case 3:
        stepErrors = validateStep3(formData);
        break;
      case 4:
        stepErrors = validateStep4(formData);
        break;
    }
    
    setErrors(stepErrors);
    return stepErrors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep === 3) {
        const newSuggestions = getSuggestions(formData.ejercicios, ejercicios, formData.categoria);
        setSuggestions(newSuggestions);
      }
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors([]);
  };

  const handleAddExercise = (ejercicio: Ejercicio) => {
    const existing = formData.ejercicios.find(
      e => e.nombre.toLowerCase() === ejercicio.nombre.toLowerCase()
    );
    
    if (!existing) {
      setFormData(prev => ({
        ...prev,
        ejercicios: [
          ...prev.ejercicios,
          {
            nombre: ejercicio.nombre,
            ejercicio_id: ejercicio.id,
            series: 3,
            valor: 10,
            unidad_id: ejercicio.unidad_id_default,
          }
        ]
      }));
    }
    setShowExercisePicker(false);
  };

  const handleRemoveExercise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ejercicios: prev.ejercicios.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateExercise = (index: number, field: keyof ExerciseInRoutine, value: number | string) => {
    setFormData(prev => ({
      ...prev,
      ejercicios: prev.ejercicios.map((ex, i) => 
        i === index ? { ...ex, [field]: value } : ex
      )
    }));
  };

  const handleSuggestionClick = (suggestion: ExerciseSuggestion) => {
    handleAddExercise(suggestion.ejercicio);
  };

  const handleSave = () => {
    if (validateCurrentStep() && currentStep === 5) {
      const rutinaData = {
        nombre: formData.nombre,
        categoria: formData.categoria,
        dificultad: formData.dificultad,
        duracion_min: formData.duracion_min,
        descripcion: formData.descripcion,
        ejercicios: formData.ejercicios.map(e => ({
          nombre: e.nombre,
          series: e.series,
          valor: e.valor,
          unidad_id: e.unidad_id,
        })),
      };
      
      if (editingRutina) {
        updateRutina(editingRutina.id, rutinaData);
      } else {
        const nuevaRutina: Rutina = {
          id: Date.now(),
          ...rutinaData,
        };
        addRutina(nuevaRutina);
      }
      onClose();
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return errors.find(e => e.field === field)?.message;
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Información de la Rutina</h3>
        <p className="text-gray-500 text-sm">Define los datos básicos de tu nueva rutina</p>
      </div>

      <Input
        label="Nombre de la Rutina"
        value={formData.nombre}
        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
        placeholder="Ej: Rutina de Fuerza"
        error={getFieldError('nombre')}
        icon={<Dumbbell className="w-4 h-4" />}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600">Categoría</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categoryOptions.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, categoria: cat.value }))}
              className={`
                p-3 rounded-xl border-2 transition-all duration-200
                ${formData.categoria === cat.value 
                  ? 'border-orange-500 bg-orange-50 text-gray-800' 
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}
              `}
            >
              <span className="text-2xl block mb-1">{cat.icon}</span>
              <span className="text-sm font-medium">{cat.value}</span>
            </button>
          ))}
        </div>
        {getFieldError('categoria') && (
          <p className="text-red-500 text-sm">{getFieldError('categoria')}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Descripción (opcional)</label>
        <textarea
          value={formData.descripcion}
          onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
          placeholder="Describe los objetivos de esta rutina..."
          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors resize-none"
          rows={3}
        />
        <p className="text-gray-400 text-xs">{formData.descripcion.length}/500 caracteres</p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Configuración</h3>
        <p className="text-gray-500 text-sm">Ajusta los parámetros de entrenamiento</p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-600">Dificultad</label>
        <div className="flex gap-3">
          {difficultyOptions.map(diff => (
            <button
              key={diff.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, dificultad: diff.value }))}
              className={`
                flex-1 p-4 rounded-xl border-2 transition-all duration-200
                ${formData.dificultad === diff.value 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'}
              `}
            >
              <div className="flex items-center justify-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-${diff.color}-500`} />
                <span className={`font-medium ${formData.dificultad === diff.value ? 'text-gray-800' : 'text-gray-500'}`}>
                  {diff.label}
                </span>
              </div>
            </button>
          ))}
        </div>
        {getFieldError('dificultad') && (
          <p className="text-red-500 text-sm">{getFieldError('dificultad')}</p>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-600">Tipo de Rutina</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {routineTypeOptions.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, tipo: type.value }))}
              className={`
                p-3 rounded-xl border-2 transition-all duration-200 text-left
                ${formData.tipo === type.value 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'}
              `}
            >
              <span className={`font-medium block ${formData.tipo === type.value ? 'text-gray-800' : 'text-gray-500'}`}>
                {type.label}
              </span>
              <span className="text-xs text-gray-400">{type.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-600">Duración Estimada</label>
        <div className="flex flex-wrap gap-2">
          {durationOptions.map(dur => (
            <button
              key={dur.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, duracion_min: dur.value }))}
              className={`
                px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium
                ${formData.duracion_min === dur.value 
                  ? 'border-orange-500 bg-orange-50 text-gray-800' 
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}
              `}
            >
              {dur.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Ejercicios</h3>
        <p className="text-gray-500 text-sm">Agrega los ejercicios para tu rutina</p>
      </div>

      <Button 
        onClick={() => setShowExercisePicker(true)} 
        icon={<Plus className="w-5 h-5" />}
        fullWidth
      >
        Agregar Ejercicio
      </Button>

      {getFieldError('ejercicios') && (
        <p className="text-red-500 text-sm text-center">{getFieldError('ejercicios')}</p>
      )}

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {formData.ejercicios.map((ej, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <span className="font-medium text-gray-800">{ej.nombre}</span>
              <button
                onClick={() => handleRemoveExercise(index)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Series</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={ej.series}
                  onChange={(e) => handleUpdateExercise(index, 'series', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-center focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Reps/Kg</label>
                <input
                  type="number"
                  min={1}
                  value={ej.valor}
                  onChange={(e) => handleUpdateExercise(index, 'valor', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-center focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Unidad</label>
                <select
                  value={ej.unidad_id}
                  onChange={(e) => handleUpdateExercise(index, 'unidad_id', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-center focus:border-orange-500 focus:outline-none"
                >
                  {unidades.map(u => (
                    <option key={u.id} value={u.id}>{u.simbolo}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {formData.ejercicios.length > 0 && suggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-orange-500">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium text-gray-700">Sugerencias Inteligentes</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((sugg, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(sugg)}
                className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-600 hover:border-orange-300 hover:bg-orange-50 transition-all flex items-center gap-2"
              >
                <span className="text-orange-500">+</span>
                {sugg.ejercicio.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {formData.ejercicios.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No hay ejercicios agregados</p>
          <p className="text-sm">Agrega ejercicios para continuar</p>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Opciones Avanzadas</h3>
        <p className="text-gray-500 text-sm">Configura opciones adicionales</p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-600">Descanso entre series</label>
        <div className="flex flex-wrap gap-2">
          {restOptions.map(rest => (
            <button
              key={rest.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, rest_between_sets: rest.value }))}
              className={`
                px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium
                ${formData.rest_between_sets === rest.value 
                  ? 'border-orange-500 bg-orange-50 text-gray-800' 
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}
              `}
            >
              {rest.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600">Notas adicionales</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Agrega notas o recomendaciones para esta rutina..."
          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors resize-none"
          rows={4}
        />
      </div>
    </div>
  );

  const renderStep5 = () => {
    const totalSets = formData.ejercicios.reduce((acc, ex) => acc + ex.series, 0);
    
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Revisión Final</h3>
          <p className="text-gray-500 text-sm">Verifica que todo esté correcto</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <span className="text-gray-500">Nombre</span>
            <span className="text-gray-800 font-medium">{formData.nombre}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <span className="text-gray-500">Categoría</span>
            <span className="text-gray-800">{formData.categoria}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <span className="text-gray-500">Dificultad</span>
            <span className="text-gray-800">{formData.dificultad}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <span className="text-gray-500">Duración</span>
            <span className="text-gray-800">{formData.duracion_min} min</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <span className="text-gray-500">Tipo</span>
            <span className="text-gray-800 capitalize">{formData.tipo}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <span className="text-gray-500">Ejercicios</span>
            <span className="text-gray-800">{formData.ejercicios.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Series Totales</span>
            <span className="text-orange-600 font-bold">{totalSets}</span>
          </div>
        </div>

        {formData.descripcion && (
          <div className="space-y-2">
            <span className="text-sm text-gray-500">Descripción</span>
            <p className="text-gray-700 text-sm">{formData.descripcion}</p>
          </div>
        )}

        {formData.notes && (
          <div className="space-y-2">
            <span className="text-sm text-gray-500">Notas</span>
            <p className="text-gray-700 text-sm">{formData.notes}</p>
          </div>
        )}

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-orange-700 text-sm text-center">
            {editingRutina ? '¿Todo correcto? Haz clic en "Guardar Cambios"' : '¿Todo correcto? Haz clic en "Crear Rutina"'} para guardarla
          </p>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">
            {editingRutina ? 'Editar Rutina' : 'Crear Nueva Rutina'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-100">
          <WizardProgress steps={steps} currentStep={currentStep} />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {renderCurrentStep()}
        </div>

        <div className="flex items-center justify-between p-5 border-t border-gray-100 bg-gray-50">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            icon={<ChevronLeft className="w-4 h-4" />}
          >
            Atrás
          </Button>
          
          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              icon={<ChevronRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Continuar
            </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleSave}
                icon={<Save className="w-4 h-4" />}
              >
                {editingRutina ? 'Guardar Cambios' : 'Crear Rutina'}
              </Button>
            )}
        </div>
      </div>

      <Modal
        isOpen={showExercisePicker}
        onClose={() => setShowExercisePicker(false)}
        title="Seleccionar Ejercicio"
        size="lg"
      >
        <ExercisePickerContent
          exercises={ejercicios}
          onSelect={handleAddExercise}
          selectedNames={formData.ejercicios.map(e => e.nombre)}
        />
      </Modal>
    </div>
  );
};

const ExercisePickerContent: React.FC<{
  exercises: Ejercicio[];
  onSelect: (ejercicio: Ejercicio) => void;
  selectedNames: string[];
}> = ({ exercises, onSelect, selectedNames }) => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const filtered = exercises.filter(ej => {
    const matchesSearch = ej.nombre.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !filterCategory || ej.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(exercises.map(e => e.categoria))];

  return (
    <div className="space-y-4">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar ejercicio..."
        icon={<Sparkles className="w-4 h-4" />}
      />
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory('')}
          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
            !filterCategory ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Todos
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              filterCategory === cat ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
        {filtered.map(ej => {
          const isSelected = selectedNames.includes(ej.nombre);
          return (
            <button
              key={ej.id}
              onClick={() => !isSelected && onSelect(ej)}
              disabled={isSelected}
              className={`
                w-full p-3 rounded-xl border-2 transition-all text-left
                ${isSelected 
                  ? 'border-green-500 bg-green-50 opacity-50' 
                  : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'}
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-800 block">{ej.nombre}</span>
                  <span className="text-xs text-gray-500">{ej.categoria} • {ej.dificultad}</span>
                </div>
                {isSelected && <span className="text-green-500 text-sm">✓</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
