import React, { useState, useEffect } from 'react';
import {
  X, Image, Video, BookOpen, AlertCircle, Check,
  Plus, Dumbbell, Tag, Save,
} from 'lucide-react';
import type { Ejercicio } from '../../types';
import { AnatomyMuscleSelector, canonicalsToGrupos } from '../anatomy';
import { Sheet } from '../common/Sheet';

const EQUIPAMIENTOS = [
  'Barra', 'Mancuernas', 'Peso Corporal', 'Máquina',
  'Cable', 'Banda Elástica', 'Kettlebell', 'Banco', 'Ninguno',
];

const DIFICULTADES = ['Principiante', 'Intermedio', 'Avanzado'];
const CATEGORIAS = ['Fuerza', 'Cardio', 'Funcional', 'Core', 'Hipertrofia', 'Metabólico', 'Movilidad'];

const SectionTitle = ({ icon: Icon, label }: { icon: React.FC<{ size?: number; color?: string }>; label: string }) => (
  <div className="flex items-center gap-1.5 mb-2.5">
    <Icon size={13} color="var(--text-muted)" />
    <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
      {label}
    </span>
  </div>
);

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="mt-1 text-xs text-[var(--accent-red)]">{msg}</p> : null;

function inputClass(hasError?: boolean) {
  return hasError ? 'fp-input border-[var(--accent-red)]' : 'fp-input';
}

interface ToggleChipProps {
  label: string;
  selected: boolean;
  accent?: string;
  onClick: () => void;
}
const ToggleChip = ({ label, selected, accent = 'var(--brand)', onClick }: ToggleChipProps) => (
  <button
    type="button"
    onClick={onClick}
    className="fp-btn fp-btn-ghost"
    style={{
      padding: '5px 12px',
      borderRadius: 100,
      minHeight: 32,
      border: `1px solid ${selected ? accent : 'var(--border)'}`,
      background: selected ? `${accent}18` : 'var(--bg-elevated)',
      color: selected ? accent : 'var(--text-secondary)',
      fontSize: 12,
      fontWeight: 600,
      gap: 5,
    }}
  >
    {selected && <Check size={10} />}
    {label}
  </button>
);

interface ExerciseFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingEjercicio?: Ejercicio | null;
  onSave: (ejercicio: Omit<Ejercicio, 'id'>) => void;
}

const EMPTY_FORM = {
  nombre: '', categoria: 'Fuerza', dificultad: 'Intermedio',
  descripcion: '', descripcion_larga: '',
  grupo_muscular: [] as string[],
  musculos_anatomia: [] as string[],
  equipamiento: [] as string[],
  tags: [] as string[], imagen: '',
  videos: [] as string[], recomendaciones: [] as string[],
  unidad_id_default: 1,
};

export const LocalExerciseForm: React.FC<ExerciseFormProps> = ({
  isOpen, onClose, editingEjercicio, onSave,
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');
  const [newVideo, setNewVideo] = useState('');
  const [newRecomendacion, setNewRecomendacion] = useState('');

  useEffect(() => {
    if (editingEjercicio) {
      setForm({
        nombre: editingEjercicio.nombre,
        categoria: editingEjercicio.categoria,
        dificultad: editingEjercicio.dificultad,
        descripcion: editingEjercicio.descripcion,
        descripcion_larga: editingEjercicio.descripcion_larga || '',
        grupo_muscular: editingEjercicio.grupo_muscular,
        musculos_anatomia: editingEjercicio.musculos_anatomia ?? [],
        equipamiento: editingEjercicio.equipamiento,
        tags: editingEjercicio.tags,
        imagen: editingEjercicio.imagen || '',
        videos: editingEjercicio.videos || [],
        recomendaciones: editingEjercicio.recomendaciones || [],
        unidad_id_default: editingEjercicio.unidad_id_default,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editingEjercicio, isOpen]);

  const set = (key: string, val: unknown) => setForm((p) => ({ ...p, [key]: val }));
  const toggle = (field: 'equipamiento', val: string) =>
    set(field, form[field].includes(val) ? form[field].filter((v) => v !== val) : [...form[field], val]);

  const addListItem = (field: 'tags' | 'videos' | 'recomendaciones', val: string, setter: (v: string) => void) => {
    if (!val.trim()) return;
    if (field === 'tags' && form.tags.includes(val.trim())) return;
    set(field, [...form[field], val.trim()]);
    setter('');
  };
  const removeListItem = (field: 'tags' | 'videos' | 'recomendaciones', idx: number) =>
    set(field, (form[field] as string[]).filter((_, i) => i !== idx));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (form.nombre.length < 2) e.nombre = 'Mínimo 2 caracteres';
    if (form.descripcion.length > 500) e.descripcion = 'Máximo 500 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const musculos = form.musculos_anatomia ?? [];
    onSave({ ...form, musculos_anatomia: musculos, grupo_muscular: canonicalsToGrupos(musculos) });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Sheet
      open
      onClose={onClose}
      flexColumn
      ariaLabel={editingEjercicio ? 'Editar ejercicio' : 'Nuevo ejercicio'}
      panelClassName="md:max-w-2xl"
      panelStyle={{ maxHeight: '92vh' }}
    >
      <form className="flex flex-col min-h-0 flex-1" onSubmit={handleSubmit}>
        <div style={{ height: 3, background: 'linear-gradient(90deg,var(--brand),var(--accent-blue))', flexShrink: 0 }} />

        <div className="flex items-center justify-between px-[18px] py-[15px] border-b border-line shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-[9px] bg-[var(--brand-dim)] border border-[rgba(34,197,94,.2)]">
              <Dumbbell size={15} color="var(--brand)" />
            </div>
            <div>
              <p className="font-sora text-sm font-bold text-primary leading-tight">
                {editingEjercicio ? 'Editar ejercicio' : 'Nuevo ejercicio'}
              </p>
              <p className="text-[11px] text-muted">
                {editingEjercicio ? editingEjercicio.nombre : 'Completa los campos para crear'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="fp-btn fp-btn-ghost"
            style={{ padding: '6px 8px', borderRadius: 9 }}
            aria-label="Cerrar formulario"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-[18px] py-5">
          <div className="flex flex-col gap-[22px]">
            <div>
              <SectionTitle icon={Image} label="Imagen (URL)" />
              <input
                className="fp-input"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={form.imagen}
                onChange={(e) => set('imagen', e.target.value)}
              />
              {form.imagen ? (
                <div className="mt-2 rounded-[11px] overflow-hidden border border-line h-[140px]">
                  <img
                    src={form.imagen}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              ) : null}
            </div>

            <div>
              <label className="fp-cal-label">
                Nombre del ejercicio <span className="text-[var(--accent-red)]">*</span>
              </label>
              <input
                className={inputClass(!!errors.nombre)}
                placeholder="Ej: Press de banca con barra"
                value={form.nombre}
                onChange={(e) => set('nombre', e.target.value)}
              />
              <FieldError msg={errors.nombre} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="fp-cal-label">Categoría</label>
                <select
                  className="fp-input cursor-pointer"
                  value={form.categoria}
                  onChange={(e) => set('categoria', e.target.value)}
                >
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="fp-cal-label">Dificultad</label>
                <div className="flex gap-1.5">
                  {DIFICULTADES.map((d) => {
                    const sel = form.dificultad === d;
                    const col = d === 'Avanzado' ? 'var(--accent-red)' : d === 'Intermedio' ? 'var(--accent-orange)' : 'var(--brand)';
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => set('dificultad', d)}
                        className="fp-btn fp-btn-ghost flex-1"
                        style={{
                          padding: '9px 6px',
                          minHeight: 36,
                          borderRadius: 10,
                          border: `1px solid ${sel ? col : 'var(--border)'}`,
                          background: sel ? `${col}18` : 'var(--bg-elevated)',
                          color: sel ? col : 'var(--text-muted)',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <label className="fp-cal-label">Músculos trabajados</label>
              <AnatomyMuscleSelector
                value={form.musculos_anatomia ?? []}
                onChange={(next) => set('musculos_anatomia', next)}
              />
              {(form.musculos_anatomia?.length ?? 0) > 0 ? (
                <p className="mt-1.5 text-[11px] font-semibold text-brand">
                  {form.musculos_anatomia!.length} músculo{form.musculos_anatomia!.length > 1 ? 's' : ''} seleccionado{form.musculos_anatomia!.length > 1 ? 's' : ''}
                </p>
              ) : null}
            </div>

            <div>
              <label className="fp-cal-label">Equipamiento</label>
              <div className="flex flex-wrap gap-1.5">
                {EQUIPAMIENTOS.map((eq) => (
                  <ToggleChip
                    key={eq}
                    label={eq}
                    selected={form.equipamiento.includes(eq)}
                    accent="var(--accent-blue)"
                    onClick={() => toggle('equipamiento', eq)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="fp-cal-label">Descripción corta</label>
              <div className="relative">
                <textarea
                  rows={2}
                  className={`${inputClass(!!errors.descripcion)} resize-none`}
                  placeholder="Breve descripción del ejercicio..."
                  value={form.descripcion}
                  onChange={(e) => set('descripcion', e.target.value)}
                />
                <span className={`absolute bottom-2 right-3 text-[10px] ${form.descripcion.length > 450 ? 'text-[var(--accent-orange)]' : 'text-muted'}`}>
                  {form.descripcion.length}/500
                </span>
              </div>
              <FieldError msg={errors.descripcion} />
            </div>

            <div>
              <SectionTitle icon={BookOpen} label="Descripción larga" />
              <textarea
                rows={5}
                className="fp-input resize-y min-h-[100px]"
                placeholder="Técnica detallada, consejos, errores comunes..."
                value={form.descripcion_larga}
                onChange={(e) => set('descripcion_larga', e.target.value)}
              />
            </div>

            <div>
              <SectionTitle icon={AlertCircle} label="Recomendaciones" />
              <div className={`flex gap-2 ${form.recomendaciones.length ? 'mb-2.5' : ''}`}>
                <input
                  className="fp-input flex-1"
                  placeholder="Añadir una recomendación..."
                  value={newRecomendacion}
                  onChange={(e) => setNewRecomendacion(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addListItem('recomendaciones', newRecomendacion, setNewRecomendacion); } }}
                />
                <button
                  type="button"
                  className="fp-btn fp-btn-secondary shrink-0 text-xs gap-1"
                  onClick={() => addListItem('recomendaciones', newRecomendacion, setNewRecomendacion)}
                >
                  <Plus size={13} /> Añadir
                </button>
              </div>
              {form.recomendaciones.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {form.recomendaciones.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-[10px] bg-overlay border border-[var(--border-subtle)]">
                      <Check size={13} color="var(--brand)" className="mt-0.5 shrink-0" />
                      <span className="flex-1 text-sm text-primary leading-snug">{rec}</span>
                      <button type="button" className="fp-btn fp-btn-ghost p-0.5 min-h-0" aria-label="Quitar recomendación" onClick={() => removeListItem('recomendaciones', i)}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <SectionTitle icon={Video} label="Videos explicativos (URLs)" />
              <div className={`flex gap-2 ${form.videos.length ? 'mb-2.5' : ''}`}>
                <input
                  className="fp-input flex-1"
                  placeholder="URL de YouTube, Vimeo..."
                  value={newVideo}
                  onChange={(e) => setNewVideo(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addListItem('videos', newVideo, setNewVideo); } }}
                />
                <button type="button" className="fp-btn fp-btn-secondary shrink-0 text-xs gap-1" onClick={() => addListItem('videos', newVideo, setNewVideo)}>
                  <Plus size={13} /> Añadir
                </button>
              </div>
              {form.videos.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {form.videos.map((v, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-[10px] bg-overlay border border-[var(--border-subtle)]">
                      <Video size={13} color="var(--accent-blue)" className="shrink-0" />
                      <span className="flex-1 text-xs text-secondary truncate">{v}</span>
                      <button type="button" className="fp-btn fp-btn-ghost p-0.5 min-h-0" aria-label="Quitar video" onClick={() => removeListItem('videos', i)}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <SectionTitle icon={Tag} label="Etiquetas" />
              <div className={`flex gap-2 ${form.tags.length ? 'mb-2.5' : ''}`}>
                <input
                  className="fp-input flex-1"
                  placeholder="Añadir etiqueta y presionar Enter..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addListItem('tags', newTag, setNewTag); } }}
                />
                <button type="button" className="fp-btn fp-btn-secondary shrink-0 text-xs gap-1" onClick={() => addListItem('tags', newTag, setNewTag)}>
                  <Plus size={13} /> Añadir
                </button>
              </div>
              {form.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {form.tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-overlay border border-line text-xs text-secondary">
                      {tag}
                      <button type="button" className="fp-btn fp-btn-ghost p-0 min-h-0" aria-label="Quitar etiqueta" onClick={() => removeListItem('tags', i)}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-end gap-2.5 px-[18px] py-3.5 border-t border-line bg-elevated">
          <button type="button" className="fp-btn fp-btn-ghost text-[13px]" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="fp-btn fp-btn-primary text-[13px] gap-1.5">
            <Save size={14} />
            {editingEjercicio ? 'Guardar cambios' : 'Crear ejercicio'}
          </button>
        </div>
      </form>
    </Sheet>
  );
};
