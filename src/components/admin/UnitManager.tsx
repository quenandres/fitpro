import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, Ruler, Beaker } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import type { Unidad } from '../../types';

const emptyUnidad: Omit<Unidad, 'id'> = {
  nombre: '',
  tipo: 'conteo',
  simbolo: '',
  descripcion: ''
};

const tipos = [
  { value: 'conteo', label: 'Conteo', color: 'from-emerald-400 to-green-500' },
  { value: 'distancia', label: 'Distancia', color: 'from-blue-400 to-cyan-500' },
  { value: 'tiempo', label: 'Tiempo', color: 'from-purple-400 to-pink-500' },
  { value: 'peso', label: 'Peso', color: 'from-orange-400 to-red-500' },
  { value: 'energia', label: 'Energía', color: 'from-yellow-400 to-amber-500' },
  { value: 'intensidad', label: 'Intensidad', color: 'from-rose-400 to-red-500' },
];

const getTipoStyle = (tipo: string) => {
  const t = tipos.find(t => t.value === tipo);
  return t || { color: 'from-gray-400 to-gray-500' };
};

export const UnitManager = () => {
  const { unidades, addUnidad, updateUnidad, deleteUnidad } = useDataStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<Omit<Unidad, 'id'>>(emptyUnidad);

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex items-center justify-center">
            <Ruler className="w-5 h-5 text-white"/>
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Gestión de Unidades</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{unidades.length} unidades configuradas</p>
          </div>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))', color: 'black', boxShadow: '0 4px 15px var(--glow-green)' }}
          >
            <Plus className="w-4 h-4"/>Nueva Unidad
          </button>
        )}
      </div>

      {isCreating && (
        <div className="rounded-3xl border p-6" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {editingId ? 'Editar Unidad' : 'Nueva Unidad'}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-muted)' }}>NOMBRE *</label>
              <input 
                type="text" 
                value={form.nombre} 
                onChange={e => setForm({...form, nombre: e.target.value})} 
                className="w-full px-4 py-3 rounded-xl focus:outline-none"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '2px solid var(--border-color)' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-muted)' }}>SÍMBOLO *</label>
              <input 
                type="text" 
                value={form.simbolo} 
                onChange={e => setForm({...form, simbolo: e.target.value})} 
                className="w-full px-4 py-3 rounded-xl focus:outline-none"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '2px solid var(--border-color)' }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-muted)' }}>TIPO</label>
              <select 
                value={form.tipo} 
                onChange={e => setForm({...form, tipo: e.target.value})} 
                className="w-full px-4 py-3 rounded-xl focus:outline-none cursor-pointer"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '2px solid var(--border-color)' }}
              >
                {tipos.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-muted)' }}>DESCRIPCIÓN</label>
              <input 
                type="text" 
                value={form.descripcion} 
                onChange={e => setForm({...form, descripcion: e.target.value})} 
                className="w-full px-4 py-3 rounded-xl focus:outline-none"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '2px solid var(--border-color)' }}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleCancel} 
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              <X className="w-4 h-4"/>Cancelar
            </button>
            <button 
              onClick={handleSave} 
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))', color: 'black', boxShadow: '0 4px 15px var(--glow-green)' }}
            >
              <Save className="w-4 h-4"/>Guardar
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {unidades.map(u => {
          const tipoStyle = getTipoStyle(u.tipo);
          return (
            <div 
              key={u.id} 
              className="group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <div className={`h-1.5 w-full bg-gradient-to-r ${tipoStyle.color}`} />
              
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tipoStyle.color} flex items-center justify-center text-xl font-bold text-white shadow-lg`}>
                    {u.simbolo}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>{u.nombre}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                        {u.tipo}
                      </span>
                    </div>
                    {u.descripcion && (
                      <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{u.descripcion}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <button 
                    onClick={() => handleEdit(u)} 
                    className="p-2.5 rounded-xl transition-all hover:scale-110"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--accent-blue)' }}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(u.id)} 
                    className="p-2.5 rounded-xl transition-all hover:scale-110"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-red-500)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {unidades.length === 0 && (
        <div className="text-center py-12 rounded-3xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--accent-purple)]/20 to-[var(--accent-blue)]/20 flex items-center justify-center">
            <Beaker className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Sin unidades</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Crea tu primera unidad de medida</p>
        </div>
      )}
    </div>
  );
};
