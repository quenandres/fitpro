import React, { useState, useEffect } from 'react';
import {
  X, Image, Video, BookOpen, AlertCircle, Check,
  Plus, Dumbbell, Tag, Save,
} from 'lucide-react';
import type { Ejercicio } from '../../types';
import { AnatomyMuscleSelector, canonicalsToGrupos } from '../anatomy';

/* ── Constants ───────────────────────────────────────────── */
const EQUIPAMIENTOS = [
  'Barra', 'Mancuernas', 'Peso Corporal', 'Máquina',
  'Cable', 'Banda Elástica', 'Kettlebell', 'Banco', 'Ninguno',
];

const DIFICULTADES = ['Principiante', 'Intermedio', 'Avanzado'];
const CATEGORIAS   = ['Fuerza', 'Cardio', 'Funcional', 'Core', 'Hipertrofia', 'Metabólico', 'Movilidad'];

/* ── Small internal components ───────────────────────────── */

const SectionTitle = ({ icon: Icon, label }: { icon: React.FC<{ size?: number; color?: string }>; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
    <Icon size={13} color="var(--text-muted)" />
    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '.07em' }}>
      {label}
    </span>
  </div>
);

const FLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '.05em', marginBottom: 6 }}>
    {children}
    {required && <span style={{ color: 'var(--accent-red)', marginLeft: 3 }}>*</span>}
  </label>
);

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p style={{ marginTop: 5, fontSize: 12, color: 'var(--accent-red)' }}>{msg}</p> : null;

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
    style={{
      padding: '5px 12px',
      borderRadius: 100,
      border: `1px solid ${selected ? accent : 'var(--border)'}`,
      background: selected ? `${accent}18` : 'var(--bg-elevated)',
      color: selected ? accent : 'var(--text-secondary)',
      fontSize: 12, fontWeight: 600,
      cursor: 'pointer', outline: 'none',
      transition: 'all .15s',
      display: 'flex', alignItems: 'center', gap: 5,
    }}
  >
    {selected && <Check size={10} />}
    {label}
  </button>
);

/* ── Main form ───────────────────────────────────────────── */

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

export const ExerciseForm: React.FC<ExerciseFormProps> = ({
  isOpen, onClose, editingEjercicio, onSave,
}) => {
  const [form,              setForm]              = useState(EMPTY_FORM);
  const [errors,            setErrors]            = useState<Record<string, string>>({});
  const [newTag,            setNewTag]            = useState('');
  const [newVideo,          setNewVideo]          = useState('');
  const [newRecomendacion,  setNewRecomendacion]  = useState('');

  useEffect(() => {
    if (editingEjercicio) {
      setForm({
        nombre:            editingEjercicio.nombre,
        categoria:         editingEjercicio.categoria,
        dificultad:        editingEjercicio.dificultad,
        descripcion:       editingEjercicio.descripcion,
        descripcion_larga: editingEjercicio.descripcion_larga || '',
        grupo_muscular:    editingEjercicio.grupo_muscular,
        musculos_anatomia: editingEjercicio.musculos_anatomia ?? [],
        equipamiento:      editingEjercicio.equipamiento,
        tags:              editingEjercicio.tags,
        imagen:            editingEjercicio.imagen || '',
        videos:            editingEjercicio.videos || [],
        recomendaciones:   editingEjercicio.recomendaciones || [],
        unidad_id_default: editingEjercicio.unidad_id_default,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editingEjercicio, isOpen]);

  /* Handlers */
  const set  = (key: string, val: unknown) => setForm((p) => ({ ...p, [key]: val }));
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
    if (!form.nombre.trim())       e.nombre      = 'El nombre es obligatorio';
    if (form.nombre.length < 2)    e.nombre      = 'Mínimo 2 caracteres';
    if (form.descripcion.length > 500) e.descripcion = 'Máximo 500 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const musculos = form.musculos_anatomia ?? [];
    onSave({ ...form, musculos_anatomia: musculos, grupo_muscular: canonicalsToGrupos(musculos) });
    onClose();
  };

  if (!isOpen) return null;

  /* Shared input style */
  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 13px',
    background: 'var(--bg-elevated)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: 11, color: 'var(--text-primary)',
    fontSize: 13, fontFamily: 'inherit', outline: 'none',
    transition: 'border-color .15s',
  };
  const inpErr: React.CSSProperties = { ...inp, borderColor: 'rgba(248,81,73,.5)' };

  return (
    <div
      className="animate-fade-in"
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="fp-card animate-slide-up"
        style={{ width: '100%', maxWidth: 680, maxHeight: '92vh', display: 'flex', flexDirection: 'column', borderRadius: 20, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Top accent ──────────────────────────────── */}
        <div style={{ height: 3, background: 'linear-gradient(90deg,var(--brand),var(--accent-blue))', flexShrink: 0 }} />

        {/* ── Header ──────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--brand-dim)', border: '1px solid rgba(34,197,94,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Dumbbell size={15} color="var(--brand)" />
            </div>
            <div>
              <p className="font-sora" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {editingEjercicio ? 'Editar ejercicio' : 'Nuevo ejercicio'}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {editingEjercicio ? editingEjercicio.nombre : 'Completa los campos para crear'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="fp-btn fp-btn-ghost"
            style={{ padding: '6px 8px', borderRadius: 9 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* ─ Imagen + preview ─ */}
            <div>
              <SectionTitle icon={Image} label="Imagen (URL)" />
              <input
                style={inp}
                placeholder="https://ejemplo.com/imagen.jpg"
                value={form.imagen}
                onChange={(e) => set('imagen', e.target.value)}
              />
              {form.imagen && (
                <div style={{ marginTop: 8, borderRadius: 11, overflow: 'hidden', border: '1px solid var(--border)', height: 140 }}>
                  <img
                    src={form.imagen}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </div>

            {/* ─ Nombre ─ */}
            <div>
              <FLabel required>Nombre del ejercicio</FLabel>
              <input
                style={errors.nombre ? inpErr : inp}
                placeholder="Ej: Press de Banca con Barra"
                value={form.nombre}
                onChange={(e) => set('nombre', e.target.value)}
              />
              <FieldError msg={errors.nombre} />
            </div>

            {/* ─ Categoría + Dificultad ─ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <FLabel>Categoría</FLabel>
                <select
                  style={{ ...inp, cursor: 'pointer' }}
                  value={form.categoria}
                  onChange={(e) => set('categoria', e.target.value)}
                >
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <FLabel>Dificultad</FLabel>
                <div style={{ display: 'flex', gap: 6 }}>
                  {DIFICULTADES.map((d) => {
                    const sel = form.dificultad === d;
                    const col = d === 'Avanzado' ? 'var(--accent-red)' : d === 'Intermedio' ? 'var(--accent-orange)' : 'var(--brand)';
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => set('dificultad', d)}
                        style={{
                          flex: 1, padding: '9px 6px',
                          borderRadius: 10, border: `1px solid ${sel ? col : 'var(--border)'}`,
                          background: sel ? `${col}18` : 'var(--bg-elevated)',
                          color: sel ? col : 'var(--text-muted)',
                          fontSize: 11, fontWeight: 600, cursor: 'pointer', outline: 'none',
                          transition: 'all .15s',
                        }}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ─ Músculos trabajados (anatomía) ─ */}
            <div>
              <FLabel>Músculos trabajados</FLabel>
              <AnatomyMuscleSelector
                value={form.musculos_anatomia ?? []}
                onChange={(next) => set('musculos_anatomia', next)}
              />
              {(form.musculos_anatomia?.length ?? 0) > 0 && (
                <p style={{ marginTop: 7, fontSize: 11, color: 'var(--brand)', fontWeight: 600 }}>
                  {form.musculos_anatomia!.length} músculo{form.musculos_anatomia!.length > 1 ? 's' : ''} seleccionado{form.musculos_anatomia!.length > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* ─ Equipamiento ─ */}
            <div>
              <FLabel>Equipamiento</FLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
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

            {/* ─ Descripción corta ─ */}
            <div>
              <FLabel>Descripción corta</FLabel>
              <div style={{ position: 'relative' }}>
                <textarea
                  rows={2}
                  style={{ ...inp, resize: 'none', borderColor: errors.descripcion ? 'rgba(248,81,73,.5)' : undefined }}
                  placeholder="Breve descripción del ejercicio..."
                  value={form.descripcion}
                  onChange={(e) => set('descripcion', e.target.value)}
                />
                <span style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 10, color: form.descripcion.length > 450 ? 'var(--accent-orange)' : 'var(--text-muted)' }}>
                  {form.descripcion.length}/500
                </span>
              </div>
              <FieldError msg={errors.descripcion} />
            </div>

            {/* ─ Descripción larga ─ */}
            <div>
              <SectionTitle icon={BookOpen} label="Descripción larga" />
              <textarea
                rows={5}
                style={{ ...inp, resize: 'vertical', minHeight: 100 }}
                placeholder="Técnica detallada, consejos, errores comunes..."
                value={form.descripcion_larga}
                onChange={(e) => set('descripcion_larga', e.target.value)}
              />
            </div>

            {/* ─ Recomendaciones ─ */}
            <div>
              <SectionTitle icon={AlertCircle} label="Recomendaciones" />
              <div style={{ display: 'flex', gap: 8, marginBottom: form.recomendaciones.length ? 10 : 0 }}>
                <input
                  style={{ ...inp, flex: 1 }}
                  placeholder="Añadir una recomendación..."
                  value={newRecomendacion}
                  onChange={(e) => setNewRecomendacion(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addListItem('recomendaciones', newRecomendacion, setNewRecomendacion); }}}
                />
                <button
                  type="button"
                  className="fp-btn fp-btn-secondary"
                  style={{ gap: 5, flexShrink: 0, fontSize: 12 }}
                  onClick={() => addListItem('recomendaciones', newRecomendacion, setNewRecomendacion)}
                >
                  <Plus size={13} /> Añadir
                </button>
              </div>
              {form.recomendaciones.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {form.recomendaciones.map((rec, i) => (
                    <div
                      key={i}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '9px 12px', borderRadius: 10, background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}
                    >
                      <Check size={13} color="var(--brand)" style={{ marginTop: 1, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{rec}</span>
                      <button
                        type="button"
                        onClick={() => removeListItem('recomendaciones', i)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ─ Videos ─ */}
            <div>
              <SectionTitle icon={Video} label="Videos explicativos (URLs)" />
              <div style={{ display: 'flex', gap: 8, marginBottom: form.videos.length ? 10 : 0 }}>
                <input
                  style={{ ...inp, flex: 1 }}
                  placeholder="URL de YouTube, Vimeo..."
                  value={newVideo}
                  onChange={(e) => setNewVideo(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addListItem('videos', newVideo, setNewVideo); }}}
                />
                <button
                  type="button"
                  className="fp-btn fp-btn-secondary"
                  style={{ gap: 5, flexShrink: 0, fontSize: 12 }}
                  onClick={() => addListItem('videos', newVideo, setNewVideo)}
                >
                  <Plus size={13} /> Añadir
                </button>
              </div>
              {form.videos.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {form.videos.map((v, i) => (
                    <div
                      key={i}
                      style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', borderRadius: 10, background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}
                    >
                      <Video size={13} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
                      <button
                        type="button"
                        onClick={() => removeListItem('videos', i)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ─ Tags ─ */}
            <div>
              <SectionTitle icon={Tag} label="Etiquetas" />
              <div style={{ display: 'flex', gap: 8, marginBottom: form.tags.length ? 10 : 0 }}>
                <input
                  style={{ ...inp, flex: 1 }}
                  placeholder="Añadir etiqueta y presionar Enter..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addListItem('tags', newTag, setNewTag); }}}
                />
                <button
                  type="button"
                  className="fp-btn fp-btn-secondary"
                  style={{ gap: 5, flexShrink: 0, fontSize: 12 }}
                  onClick={() => addListItem('tags', newTag, setNewTag)}
                >
                  <Plus size={13} /> Añadir
                </button>
              </div>
              {form.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {form.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 100, background: 'var(--bg-overlay)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-secondary)' }}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeListItem('tags', i)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Footer ──────────────────────────────────── */}
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '14px 18px', borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)', flexShrink: 0 }}
        >
          <button className="fp-btn fp-btn-ghost" onClick={onClose} style={{ fontSize: 13 }}>
            Cancelar
          </button>
          <button className="fp-btn fp-btn-primary" onClick={handleSubmit} style={{ gap: 7, fontSize: 13 }}>
            <Save size={14} />
            {editingEjercicio ? 'Guardar cambios' : 'Crear ejercicio'}
          </button>
        </div>

      </div>
    </div>
  );
};
