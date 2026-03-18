import React, { useState, useEffect } from 'react';
import { X, Image, Video, BookOpen, AlertCircle, Check } from 'lucide-react';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { SimpleToast } from './common/Toast';
import type { Ejercicio } from '../../types';

interface ExerciseFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingEjercicio?: Ejercicio | null;
  onSave: (ejercicio: Omit<Ejercicio, 'id'>) => void;
}

const muscleGroups = [
  'Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 
  'Antebrazos', 'Core', 'Cuadriceps', 'Isquiotibiales', 
  'Glúteos', 'Piernas', 'Gemelos'
];

const equipamientos = [
  'Barra', 'Mancuernas', 'Peso Corporal', 'Máquina', 
  'Cable', 'Banda Elástica', 'Kettlebell', 'Banco', 'Ninguno'
];

const dificultades = ['Principiante', 'Intermedio', 'Avanzado'];
const categorias = ['Fuerza', 'Cardio', 'Funcional', 'Core', 'Hipertrofia', 'Metabólico', 'Movilidad'];

export const ExerciseForm: React.FC<ExerciseFormProps> = ({
  isOpen,
  onClose,
  editingEjercicio,
  onSave,
}) => {
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'error'; message: string }>({
    visible: false,
    type: 'success',
    message: '',
  });

  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'Fuerza',
    dificultad: 'Intermedio',
    descripcion: '',
    descripcion_larga: '',
    grupo_muscular: [] as string[],
    equipamiento: [] as string[],
    tags: [] as string[],
    imagen: '',
    videos: [] as string[],
    recomendaciones: [] as string[],
    unidad_id_default: 1,
  });

  const [newTag, setNewTag] = useState('');
  const [newVideo, setNewVideo] = useState('');
  const [newRecomendacion, setNewRecomendacion] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingEjercicio) {
      setFormData({
        nombre: editingEjercicio.nombre,
        categoria: editingEjercicio.categoria,
        dificultad: editingEjercicio.dificultad,
        descripcion: editingEjercicio.descripcion,
        descripcion_larga: editingEjercicio.descripcion_larga || '',
        grupo_muscular: editingEjercicio.grupo_muscular,
        equipamiento: editingEjercicio.equipamiento,
        tags: editingEjercicio.tags,
        imagen: editingEjercicio.imagen || '',
        videos: editingEjercicio.videos || [],
        recomendaciones: editingEjercicio.recomendaciones || [],
        unidad_id_default: editingEjercicio.unidad_id_default,
      });
    } else {
      setFormData({
        nombre: '',
        categoria: 'Fuerza',
        dificultad: 'Intermedio',
        descripcion: '',
        descripcion_larga: '',
        grupo_muscular: [],
        equipamiento: [],
        tags: [],
        imagen: '',
        videos: [],
        recomendaciones: [],
        unidad_id_default: 1,
      });
    }
    setErrors({});
  }, [editingEjercicio, isOpen]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, type, message });
    setTimeout(() => setToast({ visible: false, type: 'success', message: '' }), 3000);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (formData.descripcion.length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSave({
      nombre: formData.nombre,
      categoria: formData.categoria,
      dificultad: formData.dificultad,
      descripcion: formData.descripcion,
      descripcion_larga: formData.descripcion_larga,
      grupo_muscular: formData.grupo_muscular,
      equipamiento: formData.equipamiento,
      tags: formData.tags,
      imagen: formData.imagen,
      videos: formData.videos,
      recomendaciones: formData.recomendaciones,
      unidad_id_default: formData.unidad_id_default,
    });

    showToast(
      editingEjercicio ? 'Ejercicio actualizado' : 'Ejercicio creado',
      'success'
    );
    onClose();
  };

  const toggleArrayField = (field: 'grupo_muscular' | 'equipamiento', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const addVideo = () => {
    if (newVideo.trim()) {
      setFormData(prev => ({ ...prev, videos: [...prev.videos, newVideo.trim()] }));
      setNewVideo('');
    }
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({ ...prev, videos: prev.videos.filter((_, i) => i !== index) }));
  };

  const addRecomendacion = () => {
    if (newRecomendacion.trim()) {
      setFormData(prev => ({ ...prev, recomendaciones: [...prev.recomendaciones, newRecomendacion.trim()] }));
      setNewRecomendacion('');
    }
  };

  const removeRecomendacion = (index: number) => {
    setFormData(prev => ({ ...prev, recomendaciones: prev.recomendaciones.filter((_, i) => i !== index) }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <SimpleToast {...toast} />

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">
            {editingEjercicio ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Imagen Thumbnail */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Image className="w-4 h-4" /> Imagen Thumbnail (URL)
            </label>
            <Input
              value={formData.imagen}
              onChange={(e) => setFormData(prev => ({ ...prev, imagen: e.target.value }))}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            {formData.imagen && (
              <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src={formData.imagen} 
                  alt="Preview" 
                  className="w-full h-48 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Nombre del Ejercicio <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Ej: Press de Banca"
              error={errors.nombre}
            />
          </div>

          {/* Categoría y Dificultad */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:border-orange-500 focus:outline-none"
              >
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Dificultad</label>
              <select
                value={formData.dificultad}
                onChange={(e) => setFormData(prev => ({ ...prev, dificultad: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:border-orange-500 focus:outline-none"
              >
                {dificultades.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grupo Muscular */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Grupos Musculares</label>
            <div className="flex flex-wrap gap-2">
              {muscleGroups.map(muscle => (
                <button
                  key={muscle}
                  type="button"
                  onClick={() => toggleArrayField('grupo_muscular', muscle)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    formData.grupo_muscular.includes(muscle)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {muscle}
                </button>
              ))}
            </div>
          </div>

          {/* Equipamiento */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Equipamiento</label>
            <div className="flex flex-wrap gap-2">
              {equipamientos.map(equip => (
                <button
                  key={equip}
                  type="button"
                  onClick={() => toggleArrayField('equipamiento', equip)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    formData.equipamiento.includes(equip)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {equip}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción Corta */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Descripción Corta
              <span className="text-gray-400 font-normal ml-2">({formData.descripcion.length}/500)</span>
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Breve descripción del ejercicio..."
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-orange-500 focus:outline-none resize-none"
              rows={2}
            />
            {errors.descripcion && (
              <p className="text-red-500 text-sm">{errors.descripcion}</p>
            )}
          </div>

          {/* Descripción Larga */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Descripción Larga
            </label>
            <textarea
              value={formData.descripcion_larga}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion_larga: e.target.value }))}
              placeholder="Descripción detallada del ejercicio, técnica, consejos, errores comunes..."
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-orange-500 focus:outline-none resize-none"
              rows={5}
            />
          </div>

          {/* Videos */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Video className="w-4 h-4" /> Videos Explicativos (URLs)
            </label>
            <div className="flex gap-2">
              <Input
                value={newVideo}
                onChange={(e) => setNewVideo(e.target.value)}
                placeholder="URL del video (YouTube, Vimeo...)"
                className="flex-1"
              />
              <Button onClick={addVideo} size="sm">Agregar</Button>
            </div>
            {formData.videos.length > 0 && (
              <div className="space-y-2 mt-2">
                {formData.videos.map((video, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <Video className="w-4 h-4 text-blue-500" />
                    <span className="flex-1 text-sm text-gray-600 truncate">{video}</span>
                    <button
                      onClick={() => removeVideo(index)}
                      className="p-1 hover:bg-red-100 rounded text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recomendaciones */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Recomendaciones
            </label>
            <div className="flex gap-2">
              <Input
                value={newRecomendacion}
                onChange={(e) => setNewRecomendacion(e.target.value)}
                placeholder="Agregar una recomendación..."
                className="flex-1"
              />
              <Button onClick={addRecomendacion} size="sm">Agregar</Button>
            </div>
            {formData.recomendaciones.length > 0 && (
              <div className="space-y-2 mt-2">
                {formData.recomendaciones.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 bg-orange-50 rounded-lg px-3 py-2">
                    <Check className="w-4 h-4 text-orange-500 mt-0.5" />
                    <span className="flex-1 text-sm text-gray-700">{rec}</span>
                    <button
                      onClick={() => removeRecomendacion(index)}
                      className="p-1 hover:bg-red-100 rounded text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Etiquetas</label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Agregar etiqueta..."
                className="flex-1"
              />
              <Button onClick={addTag} size="sm">Agregar</Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-lg flex items-center gap-1"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {editingEjercicio ? 'Guardar Cambios' : 'Crear Ejercicio'}
          </Button>
        </div>
      </div>
    </div>
  );
};
