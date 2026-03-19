import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Check, Save, Plus, Trash2,
  Dumbbell, Settings, ListChecks, Clock, FileText, Search,
  Sparkles, X,
} from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import {
  validateStep1, validateStep2, validateStep3, validateStep4,
  categoryOptions, difficultyOptions, routineTypeOptions,
  durationOptions, restOptions, type ValidationError,
} from '../utils/validators';
import { getSuggestions } from '../utils/suggestions';
import type { Ejercicio, Rutina } from '../types';

/* ── Types ───────────────────────────────────────────────── */
interface ExerciseInRoutine {
  nombre: string;
  series: number;
  valor: number;
  unidad_id: number;
  ejercicio_id?: number;
}

interface FormData {
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

const EMPTY: FormData = {
  nombre: '', categoria: '', descripcion: '', dificultad: '',
  duracion_min: 30, tipo: 'estandar', ejercicios: [],
  rest_between_sets: 60, notes: '',
};

const STEPS = [
  { id: 1, label: 'Info',       Icon: Dumbbell  },
  { id: 2, label: 'Config',     Icon: Settings  },
  { id: 3, label: 'Ejercicios', Icon: ListChecks },
  { id: 4, label: 'Avanzado',   Icon: Clock     },
  { id: 5, label: 'Revisión',   Icon: FileText  },
];

/* ── Shared helpers ──────────────────────────────────────── */
const FLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '.06em', marginBottom: 7 }}>
    {children}{required && <span style={{ color: 'var(--accent-red)', marginLeft: 3 }}>*</span>}
  </label>
);

const FieldErr = ({ msg }: { msg?: string }) =>
  msg ? <p style={{ marginTop: 5, fontSize: 12, color: 'var(--accent-red)' }}>{msg}</p> : null;

const inp: React.CSSProperties = {
  width: '100%', padding: '11px 13px',
  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 11, color: 'var(--text-primary)',
  fontSize: 14, fontFamily: 'inherit', outline: 'none',
  transition: 'border-color .15s',
};

/* ── Step 1: Info ────────────────────────────────────────── */
const Step1 = ({ form, set, errors }: { form: FormData; set: (k: string, v: unknown) => void; errors: ValidationError[] }) => {
  const getErr = (f: string) => errors.find((e) => e.field === f)?.message;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Nombre */}
      <div>
        <FLabel required>Nombre de la rutina</FLabel>
        <input
          style={{ ...inp, borderColor: getErr('nombre') ? 'rgba(248,81,73,.5)' : undefined }}
          placeholder="Ej: Fuerza Total — Full Body"
          value={form.nombre}
          onChange={(e) => set('nombre', e.target.value)}
        />
        <FieldErr msg={getErr('nombre')} />
      </div>

      {/* Categoría */}
      <div>
        <FLabel required>Categoría</FLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {categoryOptions.map((cat) => {
            const sel = form.categoria === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => set('categoria', cat.value)}
                style={{
                  padding: '10px 6px', borderRadius: 12, border: `1px solid ${sel ? 'rgba(34,197,94,.4)' : 'var(--border)'}`,
                  background: sel ? 'rgba(34,197,94,.1)' : 'var(--bg-elevated)',
                  cursor: 'pointer', outline: 'none', transition: 'all .15s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                }}
              >
                <span style={{ fontSize: 22 }}>{cat.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: sel ? 'var(--brand)' : 'var(--text-muted)', lineHeight: 1.2, textAlign: 'center' }}>
                  {cat.value}
                </span>
              </button>
            );
          })}
        </div>
        <FieldErr msg={getErr('categoria')} />
      </div>

      {/* Descripción */}
      <div>
        <FLabel>Descripción <span style={{ fontWeight: 400, textTransform: 'none' as const, fontSize: 11 }}>(opcional)</span></FLabel>
        <div style={{ position: 'relative' }}>
          <textarea
            rows={3}
            style={{ ...inp, resize: 'none' }}
            placeholder="Describe el objetivo de esta rutina..."
            value={form.descripcion}
            onChange={(e) => set('descripcion', e.target.value)}
          />
          <span style={{ position: 'absolute', bottom: 8, right: 11, fontSize: 10, color: 'var(--text-muted)' }}>
            {form.descripcion.length}/500
          </span>
        </div>
        <FieldErr msg={getErr('descripcion')} />
      </div>
    </div>
  );
};

/* ── Step 2: Config ──────────────────────────────────────── */
const Step2 = ({ form, set, errors }: { form: FormData; set: (k: string, v: unknown) => void; errors: ValidationError[] }) => {
  const getErr = (f: string) => errors.find((e) => e.field === f)?.message;
  const diffColors: Record<string, string> = { Principiante: 'var(--brand)', Intermedio: 'var(--accent-orange)', Avanzado: 'var(--accent-red)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Dificultad */}
      <div>
        <FLabel required>Dificultad</FLabel>
        <div style={{ display: 'flex', gap: 8 }}>
          {difficultyOptions.map((d) => {
            const sel = form.dificultad === d.value;
            const col = diffColors[d.value] || 'var(--brand)';
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => set('dificultad', d.value)}
                style={{
                  flex: 1, padding: '12px 8px', borderRadius: 12,
                  border: `1px solid ${sel ? col : 'var(--border)'}`,
                  background: sel ? `${col}18` : 'var(--bg-elevated)',
                  color: sel ? col : 'var(--text-muted)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', outline: 'none',
                  transition: 'all .15s',
                }}
              >
                {d.label}
              </button>
            );
          })}
        </div>
        <FieldErr msg={getErr('dificultad')} />
      </div>

      {/* Tipo de rutina */}
      <div>
        <FLabel required>Tipo de rutina</FLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {routineTypeOptions.map((t) => {
            const sel = form.tipo === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => set('tipo', t.value)}
                style={{
                  padding: '11px 12px', borderRadius: 11, textAlign: 'left' as const,
                  border: `1px solid ${sel ? 'rgba(34,197,94,.4)' : 'var(--border)'}`,
                  background: sel ? 'rgba(34,197,94,.1)' : 'var(--bg-elevated)',
                  cursor: 'pointer', outline: 'none', transition: 'all .15s',
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: sel ? 'var(--brand)' : 'var(--text-primary)', marginBottom: 2 }}>{t.label}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.desc}</p>
              </button>
            );
          })}
        </div>
        <FieldErr msg={getErr('tipo')} />
      </div>

      {/* Duración */}
      <div>
        <FLabel required>Duración estimada</FLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {durationOptions.map((d) => {
            const sel = form.duracion_min === d.value;
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => set('duracion_min', d.value)}
                style={{
                  padding: '8px 14px', borderRadius: 100,
                  border: `1px solid ${sel ? 'rgba(88,166,255,.4)' : 'var(--border)'}`,
                  background: sel ? 'rgba(88,166,255,.1)' : 'var(--bg-elevated)',
                  color: sel ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', outline: 'none',
                  transition: 'all .15s',
                }}
              >
                {d.label}
              </button>
            );
          })}
        </div>
        <FieldErr msg={getErr('duracion_min')} />
      </div>
    </div>
  );
};

/* ── Exercise Picker overlay ─────────────────────────────── */
const ExercisePicker = ({
  exercises, selectedNames, onSelect, onClose,
}: { exercises: Ejercicio[]; selectedNames: string[]; onSelect: (e: Ejercicio) => void; onClose: () => void }) => {
  const [search, setSearch]     = useState('');
  const [cat,    setCat]        = useState('');
  const cats = [...new Set(exercises.map((e) => e.categoria))];
  const filtered = exercises.filter((e) => {
    const okS = !search || e.nombre.toLowerCase().includes(search.toLowerCase());
    const okC = !cat    || e.categoria === cat;
    return okS && okC;
  });

  return (
    <div
      className="animate-fade-in"
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        className="fp-card animate-slide-up"
        style={{ width: '100%', maxWidth: 480, borderRadius: '20px 20px 0 0', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '12px auto 0' }} />

        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p className="font-sora" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Seleccionar ejercicio</p>
          <button className="fp-btn fp-btn-ghost" style={{ padding: '5px 7px', borderRadius: 9 }} onClick={onClose}><X size={16} /></button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input className="fp-input" style={{ paddingLeft: 32, fontSize: 13 }} placeholder="Buscar ejercicio..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {/* Category chips */}
          <div className="scrollbar-hide" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            <button
              onClick={() => setCat('')}
              style={{ flexShrink: 0, padding: '4px 11px', borderRadius: 100, border: `1px solid ${!cat ? 'rgba(34,197,94,.4)' : 'var(--border)'}`, background: !cat ? 'rgba(34,197,94,.1)' : 'var(--bg-elevated)', color: !cat ? 'var(--brand)' : 'var(--text-muted)', fontSize: 11, fontWeight: 600, cursor: 'pointer', outline: 'none' }}
            >
              Todos
            </button>
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(cat === c ? '' : c)}
                style={{ flexShrink: 0, padding: '4px 11px', borderRadius: 100, border: `1px solid ${cat === c ? 'rgba(34,197,94,.4)' : 'var(--border)'}`, background: cat === c ? 'rgba(34,197,94,.1)' : 'var(--bg-elevated)', color: cat === c ? 'var(--brand)' : 'var(--text-muted)', fontSize: 11, fontWeight: 600, cursor: 'pointer', outline: 'none' }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 24px' }}>
          {filtered.map((ej) => {
            const isSel = selectedNames.includes(ej.nombre);
            return (
              <button
                key={ej.id}
                onClick={() => { if (!isSel) { onSelect(ej); onClose(); } }}
                disabled={isSel}
                style={{
                  width: '100%', padding: '11px 12px', borderRadius: 11, border: `1px solid ${isSel ? 'rgba(34,197,94,.3)' : 'var(--border)'}`, background: isSel ? 'rgba(34,197,94,.06)' : 'var(--bg-elevated)', cursor: isSel ? 'default' : 'pointer', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, textAlign: 'left' as const, opacity: isSel ? 0.7 : 1, transition: 'all .15s',
                }}
              >
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{ej.nombre}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ej.categoria} · {ej.dificultad}</p>
                </div>
                {isSel && <Check size={14} color="var(--brand)" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ── Step 3: Exercises ───────────────────────────────────── */
const Step3 = ({
  form, set, errors, ejerciciosLib, unidades,
}: { form: FormData; set: (k: string, v: unknown) => void; errors: ValidationError[]; ejerciciosLib: Ejercicio[]; unidades: { id: number; simbolo: string }[] }) => {
  const [showPicker, setShowPicker] = useState(false);
  const getErr = (f: string) => errors.find((e) => e.field === f)?.message;

  const addExercise = (ej: Ejercicio) => {
    if (!form.ejercicios.find((e) => e.nombre === ej.nombre)) {
      set('ejercicios', [...form.ejercicios, { nombre: ej.nombre, ejercicio_id: ej.id, series: 3, valor: 10, unidad_id: ej.unidad_id_default }]);
    }
  };
  const removeExercise = (i: number) => set('ejercicios', form.ejercicios.filter((_, idx) => idx !== i));
  const updateExercise = (i: number, field: string, val: number) =>
    set('ejercicios', form.ejercicios.map((e, idx) => idx === i ? { ...e, [field]: val } : e));

  const suggestions = getSuggestions(form.ejercicios, ejerciciosLib, form.categoria);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <button
        type="button"
        className="fp-btn fp-btn-secondary"
        style={{ width: '100%', gap: 7, fontSize: 13, padding: '12px', borderRadius: 12, borderStyle: 'dashed' }}
        onClick={() => setShowPicker(true)}
      >
        <Plus size={16} color="var(--brand)" /> Añadir ejercicio
      </button>

      <FieldErr msg={getErr('ejercicios')} />

      {/* Exercise rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {form.ejercicios.map((ej, i) => (
          <div key={i} className="fp-card" style={{ padding: '12px 13px', borderRadius: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--brand-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="font-sora" style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)' }}>{i + 1}</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{ej.nombre}</p>
              </div>
              <button className="fp-btn fp-btn-ghost" style={{ padding: '4px 6px', borderRadius: 7 }} onClick={() => removeExercise(i)}>
                <Trash2 size={13} color="var(--accent-red)" />
              </button>
            </div>

            {/* Series / Valor / Unidad */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { lbl: 'Series', field: 'series', val: ej.series, min: 1, max: 10 },
                { lbl: 'Reps / Val', field: 'valor', val: ej.valor, min: 1, max: 999 },
              ].map(({ lbl, field, val, min, max }) => (
                <div key={field}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '.05em', marginBottom: 5 }}>{lbl}</p>
                  <input
                    type="number"
                    min={min}
                    max={max}
                    value={val}
                    onChange={(e) => updateExercise(i, field, parseInt(e.target.value) || min)}
                    style={{ ...inp, textAlign: 'center' as const, padding: '8px 4px', fontSize: 14, fontWeight: 600 }}
                  />
                </div>
              ))}
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '.05em', marginBottom: 5 }}>Unidad</p>
                <select
                  value={ej.unidad_id}
                  onChange={(e) => updateExercise(i, 'unidad_id', parseInt(e.target.value))}
                  style={{ ...inp, textAlign: 'center' as const, padding: '8px 4px', fontSize: 13 }}
                >
                  {unidades.map((u) => <option key={u.id} value={u.id}>{u.simbolo}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {form.ejercicios.length === 0 && (
        <div style={{ textAlign: 'center', padding: '28px 16px', borderRadius: 13, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <Dumbbell size={28} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Aún no hay ejercicios.<br />Toca el botón de arriba para añadir.</p>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && form.ejercicios.length > 0 && (
        <div style={{ paddingTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 9 }}>
            <Sparkles size={13} color="var(--accent-orange)" />
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '.06em' }}>Sugerencias inteligentes</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => addExercise(s.ejercicio)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 100, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer', outline: 'none', transition: 'all .15s' }}
              >
                <Plus size={11} color="var(--brand)" />{s.ejercicio.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {showPicker && (
        <ExercisePicker
          exercises={ejerciciosLib}
          selectedNames={form.ejercicios.map((e) => e.nombre)}
          onSelect={addExercise}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
};

/* ── Step 4: Advanced ────────────────────────────────────── */
const Step4 = ({ form, set }: { form: FormData; set: (k: string, v: unknown) => void }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
    <div>
      <FLabel>Descanso entre series</FLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {restOptions.map((r) => {
          const sel = form.rest_between_sets === r.value;
          return (
            <button
              key={r.value}
              type="button"
              onClick={() => set('rest_between_sets', r.value)}
              style={{ padding: '8px 14px', borderRadius: 100, border: `1px solid ${sel ? 'rgba(163,113,247,.4)' : 'var(--border)'}`, background: sel ? 'rgba(163,113,247,.1)' : 'var(--bg-elevated)', color: sel ? 'var(--accent-purple)' : 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', outline: 'none', transition: 'all .15s' }}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
    <div>
      <FLabel>Notas adicionales</FLabel>
      <textarea
        rows={4}
        style={{ ...inp, resize: 'none', minHeight: 100 }}
        placeholder="Recomendaciones, advertencias, variantes..."
        value={form.notes}
        onChange={(e) => set('notes', e.target.value)}
      />
    </div>
  </div>
);

/* ── Step 5: Review ──────────────────────────────────────── */
const Step5 = ({ form, isEdit }: { form: FormData; isEdit: boolean }) => {
  const totalSeries = form.ejercicios.reduce((a, e) => a + e.series, 0);
  const rows = [
    { lbl: 'Nombre',    val: form.nombre },
    { lbl: 'Categoría', val: form.categoria },
    { lbl: 'Dificultad',val: form.dificultad },
    { lbl: 'Duración',  val: `${form.duracion_min} min` },
    { lbl: 'Tipo',      val: form.tipo },
    { lbl: 'Ejercicios',val: form.ejercicios.length },
    { lbl: 'Series totales', val: totalSeries, accent: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="fp-card" style={{ borderRadius: 13, overflow: 'hidden' }}>
        {rows.map(({ lbl, val, accent }, i) => (
          <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', borderBottom: i < rows.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{lbl}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: accent ? 'var(--brand)' : 'var(--text-primary)' }}>{val}</span>
          </div>
        ))}
      </div>

      {form.descripcion && (
        <div className="fp-card" style={{ borderRadius: 13, padding: '12px 14px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '.06em', marginBottom: 6 }}>Descripción</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{form.descripcion}</p>
        </div>
      )}

      {form.notes && (
        <div className="fp-card" style={{ borderRadius: 13, padding: '12px 14px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '.06em', marginBottom: 6 }}>Notas</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{form.notes}</p>
        </div>
      )}

      {/* CTA hint */}
      <div style={{ padding: '12px 14px', borderRadius: 13, background: 'var(--brand-dim)', border: '1px solid rgba(34,197,94,.2)', textAlign: 'center' as const }}>
        <p style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 500 }}>
          {isEdit ? '¿Todo correcto? Guarda los cambios abajo.' : '¿Todo correcto? Crea la rutina abajo.'}
        </p>
      </div>
    </div>
  );
};

/* ── Main Page ───────────────────────────────────────────── */
export const RoutinePage: React.FC = () => {
  const navigate         = useNavigate();
  const [params]         = useSearchParams();
  const rutinaId         = params.get('id') ? Number(params.get('id')) : null;
  const { rutinas, ejercicios, unidades, addRutina, updateRutina } = useDataStore();
  const editingRutina    = rutinaId ? rutinas.find((r) => r.id === rutinaId) ?? null : null;

  const [step,   setStep]   = useState(1);
  const [form,   setForm]   = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (editingRutina) {
      setForm({
        nombre:           editingRutina.nombre,
        categoria:        editingRutina.categoria,
        descripcion:      editingRutina.descripcion,
        dificultad:       editingRutina.dificultad,
        duracion_min:     editingRutina.duracion_min,
        tipo:             'estandar',
        ejercicios:       editingRutina.ejercicios.map((e) => ({ nombre: e.nombre, series: e.series, valor: e.valor, unidad_id: e.unidad_id })),
        rest_between_sets:60,
        notes:            '',
      });
    } else {
      setForm(EMPTY);
    }
    setStep(1);
    setErrors([]);
  }, [rutinaId]);

  const setField = (key: string, val: unknown) => setForm((p) => ({ ...p, [key]: val }));

  const validate = () => {
    const e =
      step === 1 ? validateStep1(form) :
      step === 2 ? validateStep2(form) :
      step === 3 ? validateStep3(form) :
      step === 4 ? validateStep4(form) : [];
    setErrors(e);
    return e.length === 0;
  };

  const handleNext = () => { if (validate()) setStep((s) => Math.min(s + 1, 5)); };
  const handleBack = () => { setStep((s) => Math.max(s - 1, 1)); setErrors([]); };

  const handleSave = () => {
    if (step !== 5) return;
    const rutinaData: Omit<Rutina, 'id'> = {
      nombre:       form.nombre,
      categoria:    form.categoria,
      dificultad:   form.dificultad,
      duracion_min: form.duracion_min,
      descripcion:  form.descripcion,
      ejercicios:   form.ejercicios.map((e) => ({ nombre: e.nombre, series: e.series, valor: e.valor, unidad_id: e.unidad_id })),
    };
    if (editingRutina) {
      updateRutina(editingRutina.id, rutinaData);
    } else {
      addRutina(rutinaData);
    }
    navigate('/admin');
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ─────────────────────────────────────── */}
      <header className="fp-glass sticky top-0 z-50">
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px', height: 58, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="fp-btn fp-btn-ghost"
            style={{ padding: '7px 9px', borderRadius: 10, background: 'var(--bg-overlay)', border: '1px solid var(--border)', flexShrink: 0 }}
            onClick={() => navigate('/admin')}
          >
            <ChevronLeft size={16} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="font-sora" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {editingRutina ? 'Editar rutina' : 'Nueva rutina'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {STEPS[step - 1].label} · Paso {step} de {STEPS.length}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 2, background: 'var(--bg-overlay)' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--brand)', transition: 'width .3s ease', borderRadius: 1 }} />
        </div>
      </header>

      {/* ── Step indicator ─────────────────────────────── */}
      <div style={{ maxWidth: 480, margin: '0 auto', width: '100%', padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {STEPS.map((s, i) => {
            const done    = s.id < step;
            const current = s.id === step;
            const accent  = done ? 'var(--brand)' : current ? 'var(--brand)' : 'var(--text-muted)';
            return (
              <React.Fragment key={s.id}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? 'var(--brand)' : current ? 'var(--brand-dim)' : 'var(--bg-overlay)', border: `1px solid ${current ? 'var(--brand)' : done ? 'var(--brand)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .25s' }}>
                    {done
                      ? <Check size={14} color="#fff" />
                      : <s.Icon size={14} color={accent} />
                    }
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 600, color: current ? 'var(--brand)' : done ? 'var(--brand)' : 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '.04em' }}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 1, background: s.id < step ? 'var(--brand)' : 'var(--border)', margin: '0 4px', marginBottom: 18, transition: 'background .25s' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Step content ───────────────────────────────── */}
      <div style={{ flex: 1, maxWidth: 480, margin: '0 auto', width: '100%', padding: '20px 16px 120px' }}>
        {step === 1 && <Step1 form={form} set={setField} errors={errors} />}
        {step === 2 && <Step2 form={form} set={setField} errors={errors} />}
        {step === 3 && <Step3 form={form} set={setField} errors={errors} ejerciciosLib={ejercicios} unidades={unidades} />}
        {step === 4 && <Step4 form={form} set={setField} />}
        {step === 5 && <Step5 form={form} isEdit={!!editingRutina} />}
      </div>

      {/* ── Footer nav ─────────────────────────────────── */}
      <div
        className="fp-glass"
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid var(--border)', borderBottom: 'none', padding: '12px 16px 24px' }}
      >
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', gap: 10 }}>
          <button
            className="fp-btn fp-btn-secondary"
            style={{ flex: 1, gap: 6, fontSize: 13, opacity: step === 1 ? 0.4 : 1 }}
            onClick={handleBack}
            disabled={step === 1}
          >
            <ChevronLeft size={16} /> Atrás
          </button>

          {step < 5 ? (
            <button className="fp-btn fp-btn-primary" style={{ flex: 2, gap: 6, fontSize: 13 }} onClick={handleNext}>
              Continuar <ChevronRight size={16} />
            </button>
          ) : (
            <button className="fp-btn fp-btn-primary" style={{ flex: 2, gap: 7, fontSize: 13 }} onClick={handleSave}>
              <Save size={15} />
              {editingRutina ? 'Guardar cambios' : 'Crear rutina'}
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
