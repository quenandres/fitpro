import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Plus, Pencil, Trash2, Save, Ruler, X, Check } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import type { Unidad } from '../types';

/* ── Type config ─────────────────────────────────────────── */
const TIPOS = [
  { value: 'conteo',     label: 'Conteo',     emoji: '🔢', accent: '#22c55e'  },
  { value: 'distancia',  label: 'Distancia',  emoji: '📏', accent: '#58a6ff'  },
  { value: 'tiempo',     label: 'Tiempo',     emoji: '⏱',  accent: '#a371f7'  },
  { value: 'peso',       label: 'Peso',       emoji: '⚖️', accent: '#f0883e'  },
  { value: 'energia',    label: 'Energía',    emoji: '⚡', accent: '#d2a679'  },
  { value: 'intensidad', label: 'Intensidad', emoji: '🔥', accent: '#f85149'  },
] as const;

type TipoValue = typeof TIPOS[number]['value'];

function getTipo(tipo: string) {
  return TIPOS.find((t) => t.value === tipo) ?? TIPOS[0];
}

/* ── Shared style helpers ────────────────────────────────── */
const inp: React.CSSProperties = {
  width: '100%', padding: '11px 13px',
  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 11, color: 'var(--text-primary)',
  fontSize: 14, fontFamily: 'inherit', outline: 'none',
  transition: 'border-color .15s',
};

const FLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '.06em', marginBottom: 7 }}>
    {children}{required && <span style={{ color: 'var(--accent-red)', marginLeft: 3 }}>*</span>}
  </label>
);

/* ── Unit card ───────────────────────────────────────────── */
const UnitCard = ({
  unidad, onEdit, onDelete,
}: { unidad: Unidad; onEdit: (u: Unidad) => void; onDelete: (id: number) => void }) => {
  const tipo = getTipo(unidad.tipo);
  return (
    <article className="fp-card fp-card-hover relative overflow-hidden animate-slide-up">
      <div className="fp-accent-bar" style={{ background: tipo.accent }} />
      <div style={{ padding: '12px 13px 12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          {/* Symbol badge */}
          <div
            style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: `${tipo.accent}18`, border: `1px solid ${tipo.accent}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span className="font-sora" style={{ fontSize: 14, fontWeight: 800, color: tipo.accent }}>
              {unidad.simbolo}
            </span>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: tipo.accent, textTransform: 'uppercase' as const, letterSpacing: '.05em' }}>
                {tipo.emoji} {tipo.label}
              </span>
            </div>
            <p className="font-sora" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              {unidad.nombre}
            </p>
            {unidad.descripcion && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {unidad.descripcion}
              </p>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
            <button
              onClick={() => onEdit(unidad)}
              className="fp-btn fp-btn-ghost"
              style={{ width: 30, height: 30, padding: 0, borderRadius: 8 }}
              title="Editar"
            >
              <Pencil size={13} color="var(--accent-blue)" />
            </button>
            <button
              onClick={() => onDelete(unidad.id)}
              className="fp-btn fp-btn-ghost"
              style={{ width: 30, height: 30, padding: 0, borderRadius: 8 }}
              title="Eliminar"
            >
              <Trash2 size={13} color="var(--accent-red)" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

/* ── Form panel ──────────────────────────────────────────── */
interface FormPanelProps {
  form: Omit<Unidad, 'id'>;
  setForm: React.Dispatch<React.SetStateAction<Omit<Unidad, 'id'>>>;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  errors: Record<string, string>;
}

const FormPanel = ({ form, setForm, isEditing, onSave, onCancel, errors }: FormPanelProps) => (
  <div className="fp-card animate-slide-down" style={{ padding: 18, marginBottom: 16, borderRadius: 16 }}>
    {/* Top accent */}
    <div style={{ height: 3, background: 'linear-gradient(90deg,var(--brand),var(--accent-blue))', margin: '-18px -18px 16px', borderRadius: '16px 16px 0 0' }} />

    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--brand-dim)', border: '1px solid rgba(34,197,94,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Ruler size={15} color="var(--brand)" />
      </div>
      <div>
        <p className="font-sora" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
          {isEditing ? 'Editar unidad' : 'Nueva unidad'}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {isEditing ? 'Modifica los campos y guarda' : 'Completa los campos para crear'}
        </p>
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Nombre + Símbolo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
        <div>
          <FLabel required>Nombre</FLabel>
          <input
            style={{ ...inp, borderColor: errors.nombre ? 'rgba(248,81,73,.5)' : undefined }}
            placeholder="Ej: Repeticiones"
            value={form.nombre}
            onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
          />
          {errors.nombre && <p style={{ marginTop: 4, fontSize: 11, color: 'var(--accent-red)' }}>{errors.nombre}</p>}
        </div>
        <div style={{ width: 90 }}>
          <FLabel required>Símbolo</FLabel>
          <input
            style={{ ...inp, textAlign: 'center' as const, fontWeight: 700, fontSize: 16 }}
            placeholder="rep"
            value={form.simbolo}
            onChange={(e) => setForm((p) => ({ ...p, simbolo: e.target.value }))}
          />
          {errors.simbolo && <p style={{ marginTop: 4, fontSize: 11, color: 'var(--accent-red)' }}>{errors.simbolo}</p>}
        </div>
      </div>

      {/* Tipo — toggle chips */}
      <div>
        <FLabel>Tipo</FLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {TIPOS.map((t) => {
            const sel = form.tipo === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, tipo: t.value }))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 13px', borderRadius: 100,
                  border: `1px solid ${sel ? t.accent : 'var(--border)'}`,
                  background: sel ? `${t.accent}18` : 'var(--bg-elevated)',
                  color: sel ? t.accent : 'var(--text-secondary)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none',
                  transition: 'all .15s',
                }}
              >
                {sel && <Check size={10} />}
                <span>{t.emoji}</span>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Descripción */}
      <div>
        <FLabel>Descripción</FLabel>
        <input
          style={inp}
          placeholder="Describe brevemente esta unidad..."
          value={form.descripcion}
          onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 9, paddingTop: 4 }}>
        <button className="fp-btn fp-btn-ghost" style={{ flex: 1, fontSize: 13 }} onClick={onCancel}>
          <X size={14} /> Cancelar
        </button>
        <button className="fp-btn fp-btn-primary" style={{ flex: 2, fontSize: 13, gap: 7 }} onClick={onSave}>
          <Save size={14} /> {isEditing ? 'Guardar cambios' : 'Crear unidad'}
        </button>
      </div>
    </div>
  </div>
);

/* ── Main page ───────────────────────────────────────────── */
const EMPTY: Omit<Unidad, 'id'> = { nombre: '', tipo: 'conteo', simbolo: '', descripcion: '' };

export const UnitPage = () => {
  const navigate       = useNavigate();
  const [params]       = useSearchParams();
  const editId         = params.get('id') ? Number(params.get('id')) : null;

  const { unidades, addUnidad, updateUnidad, deleteUnidad } = useDataStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form,     setForm]     = useState<Omit<Unidad, 'id'>>(EMPTY);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [filter,   setFilter]   = useState<TipoValue | ''>('');

  /* Open edit form if ?id= is in URL */
  useEffect(() => {
    if (editId) {
      const u = unidades.find((u) => u.id === editId);
      if (u) {
        setForm({ nombre: u.nombre, tipo: u.tipo, simbolo: u.simbolo, descripcion: u.descripcion });
        setEditingId(u.id);
        setShowForm(true);
      }
    }
  }, [editId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim())  e.nombre  = 'El nombre es obligatorio';
    if (!form.simbolo.trim()) e.simbolo = 'El símbolo es obligatorio';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingId) {
      updateUnidad(editingId, form);
    } else {
      addUnidad(form);
    }
    setForm(EMPTY);
    setEditingId(null);
    setErrors({});
    setShowForm(false);
    // Remove id param if present
    if (editId) navigate('/admin/unidades', { replace: true });
  };

  const handleEdit = (u: Unidad) => {
    setForm({ nombre: u.nombre, tipo: u.tipo, simbolo: u.simbolo, descripcion: u.descripcion });
    setEditingId(u.id);
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Eliminar esta unidad?')) deleteUnidad(id);
  };

  const handleCancel = () => {
    setForm(EMPTY);
    setEditingId(null);
    setErrors({});
    setShowForm(false);
  };

  const handleNew = () => {
    setForm(EMPTY);
    setEditingId(null);
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Grouped by tipo */
  const filtered = filter ? unidades.filter((u) => u.tipo === filter) : unidades;

  /* Counts per tipo for filter chips */
  const counts: Record<string, number> = {};
  unidades.forEach((u) => { counts[u.tipo] = (counts[u.tipo] ?? 0) + 1; });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>

      {/* ── Header ─────────────────────────────────────── */}
      <header className="fp-glass sticky top-0 z-50">
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 16px', height: 58, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="fp-btn fp-btn-ghost"
            style={{ padding: '7px 9px', borderRadius: 10, background: 'var(--bg-overlay)', border: '1px solid var(--border)', flexShrink: 0 }}
            onClick={() => navigate('/admin')}
          >
            <ChevronLeft size={16} />
          </button>

          <div style={{ width: 1, height: 26, background: 'var(--border)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#a371f7,#58a6ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(163,113,247,.25)', flexShrink: 0 }}>
              <Ruler size={15} color="#fff" />
            </div>
            <div>
              <p className="font-sora" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Unidades de medida
              </p>
              <p style={{ fontSize: 10, color: 'var(--accent-purple)', fontWeight: 600 }}>
                {unidades.length} configuradas
              </p>
            </div>
          </div>

          {!showForm && (
            <button
              className="fp-btn fp-btn-primary"
              style={{ gap: 6, fontSize: 12, padding: '8px 14px', flexShrink: 0 }}
              onClick={handleNew}
            >
              <Plus size={14} /> Nueva
            </button>
          )}
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 40px' }}>

        {/* ── Form ───────────────────────────────────────── */}
        {showForm && (
          <FormPanel
            form={form}
            setForm={setForm}
            isEditing={!!editingId}
            onSave={handleSave}
            onCancel={handleCancel}
            errors={errors}
          />
        )}

        {/* ── Filter chips ───────────────────────────────── */}
        <div
          className="scrollbar-hide"
          style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}
        >
          <button
            onClick={() => setFilter('')}
            style={{
              flexShrink: 0, padding: '6px 13px', borderRadius: 100,
              border: `1px solid ${!filter ? 'rgba(34,197,94,.4)' : 'var(--border)'}`,
              background: !filter ? 'rgba(34,197,94,.1)' : 'var(--bg-elevated)',
              color: !filter ? 'var(--brand)' : 'var(--text-muted)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none',
              transition: 'all .15s',
            }}
          >
            Todos · {unidades.length}
          </button>
          {TIPOS.map((t) => {
            const sel = filter === t.value;
            const count = counts[t.value] ?? 0;
            if (!count) return null;
            return (
              <button
                key={t.value}
                onClick={() => setFilter(sel ? '' : t.value as TipoValue)}
                style={{
                  flexShrink: 0, padding: '6px 13px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 5,
                  border: `1px solid ${sel ? t.accent : 'var(--border)'}`,
                  background: sel ? `${t.accent}18` : 'var(--bg-elevated)',
                  color: sel ? t.accent : 'var(--text-muted)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none',
                  transition: 'all .15s',
                }}
              >
                {t.emoji} {t.label} · {count}
              </button>
            );
          })}
        </div>

        {/* ── Grid ───────────────────────────────────────── */}
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {filtered.map((u, i) => (
            <div key={u.id} className="animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
              <UnitCard unidad={u} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
          ))}
        </div>

        {/* ── Empty ──────────────────────────────────────── */}
        {filtered.length === 0 && (
          <div className="fp-card animate-fade-in text-center" style={{ padding: '48px 24px', borderRadius: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Ruler size={22} color="var(--text-muted)" />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Sin unidades</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              {filter ? 'No hay unidades de este tipo' : 'Crea tu primera unidad de medida'}
            </p>
            {!filter && (
              <button className="fp-btn fp-btn-primary" style={{ gap: 6 }} onClick={handleNew}>
                <Plus size={14} /> Crear unidad
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
