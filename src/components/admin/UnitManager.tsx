import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, Ruler } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useTheme } from '../../context/ThemeContext';
import type { Unidad } from '../../types';

const emptyUnidad: Omit<Unidad, 'id'> = {
  nombre: '',
  tipo: 'conteo',
  simbolo: '',
  descripcion: ''
};

const tipos = ['conteo', 'distancia', 'tiempo', 'peso', 'energia', 'intensidad'];

export const UnitManager = () => {
  const { unidades, addUnidad, updateUnidad, deleteUnidad } = useDataStore();
  const { isDark } = useTheme();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<Omit<Unidad, 'id'>>(emptyUnidad);

  const styles = {
    bg: isDark ? '#1a1a1a' : '#f1f5f9',
    bgInput: isDark ? '#0d0d0d' : '#ffffff',
    border: isDark ? '#ff6b00' : '#f97316',
    borderLight: isDark ? '#333' : '#e2e8f0',
    text: isDark ? '#ffffff' : '#1e293b',
    textMuted: isDark ? '#888' : '#64748b',
    accent: '#ff6b00',
    success: '#22c55e',
    danger: '#ef4444',
  };

  const handleSave = () => {
    if (!form.nombre || !form.simbolo) return;
    if (editingId) {
      updateUnidad(editingId, form);
      setEditingId(null);
    } else {
      addUnidad(form);
    }
    setForm(emptyUnidad);
    setIsCreating(false);
  };

  const handleEdit = (u: Unidad) => {
    setForm({ nombre: u.nombre, tipo: u.tipo, simbolo: u.simbolo, descripcion: u.descripcion });
    setEditingId(u.id);
    setIsCreating(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Eliminar esta unidad?')) {
      deleteUnidad(id);
    }
  };

  const handleCancel = () => {
    setForm(emptyUnidad);
    setEditingId(null);
    setIsCreating(false);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-mono flex items-center gap-2" style={{ color: styles.text }}>
          <Ruler className="w-5 h-5" style={{ color: styles.accent }}/>GESTION DE UNIDADES
        </h2>
        {!isCreating && (
          <button onClick={() => setIsCreating(true)} className="flex items-center gap-1 px-3 py-1.5 rounded font-mono text-sm font-bold" style={{ background: `linear-gradient(180deg, ${styles.accent} 0%, #e55a00 100%)`, color: 'white' }}>
            <Plus className="w-4 h-4"/>NUEVA
          </button>
        )}
      </div>

      {isCreating && (
        <div className="mb-4 p-4 rounded-lg" style={{ background: styles.bg, border: `2px solid ${styles.border}` }}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-mono block mb-1" style={{ color: styles.textMuted }}>NOMBRE *</label>
              <input type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full px-3 py-2 rounded font-mono text-sm" style={{ background: styles.bgInput, border: `1px solid ${styles.borderLight}`, color: styles.text }}/>
            </div>
            <div>
              <label className="text-xs font-mono block mb-1" style={{ color: styles.textMuted }}>SIMBOLO *</label>
              <input type="text" value={form.simbolo} onChange={e => setForm({...form, simbolo: e.target.value})} className="w-full px-3 py-2 rounded font-mono text-sm" style={{ background: styles.bgInput, border: `1px solid ${styles.borderLight}`, color: styles.text }}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-mono block mb-1" style={{ color: styles.textMuted }}>TIPO</label>
              <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className="w-full px-3 py-2 rounded font-mono text-sm" style={{ background: styles.bgInput, border: `1px solid ${styles.borderLight}`, color: styles.text }}>
                {tipos.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono block mb-1" style={{ color: styles.textMuted }}>DESCRIPCION</label>
              <input type="text" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className="w-full px-3 py-2 rounded font-mono text-sm" style={{ background: styles.bgInput, border: `1px solid ${styles.borderLight}`, color: styles.text }}/>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCancel} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded font-mono text-sm" style={{ background: styles.borderLight, color: styles.text }}><X className="w-4 h-4"/>CANCELAR</button>
            <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded font-mono text-sm font-bold" style={{ background: styles.success, color: 'white' }}><Save className="w-4 h-4"/>GUARDAR</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {unidades.map(u => (
          <div key={u.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: styles.bg, border: `1px solid ${styles.borderLight}` }}>
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded flex items-center justify-center font-mono text-sm font-bold" style={{ background: styles.bgInput, border: `1px solid ${styles.accent}`, color: styles.accent }}>{u.simbolo}</span>
              <div>
                <p className="font-medium font-mono text-sm" style={{ color: styles.text }}>{u.nombre}</p>
                <p className="text-xs font-mono" style={{ color: styles.textMuted }}>{u.tipo}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(u)} className="p-2 rounded hover:bg-gray-700"><Pencil className="w-4 h-4" style={{ color: '#eab308' }}/></button>
              <button onClick={() => handleDelete(u.id)} className="p-2 rounded hover:bg-gray-700"><Trash2 className="w-4 h-4" style={{ color: styles.danger }}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
