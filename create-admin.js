const fs = require('fs');

const exerciseManager = `
import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, Activity } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import type { Ejercicio } from '../../types';

const emptyEjercicio: Omit<Ejercicio, 'id'> = {
  nombre: '',
  categoria: '',
  grupo_muscular: [],
  equipamiento: [],
  dificultad: '',
  unidad_id_default: 1,
  descripcion: '',
  tags: []
};

const categorias = ['Fuerza', 'Cardio', 'Funcional', 'Core', 'Metabólico', 'Movilidad', 'Peso Corporal'];
const dificultades = ['Principiante', 'Intermedio', 'Avanzado', 'Todos'];

export const ExerciseManager = () => {
  const { ejercicios, unidades, addEjercicio, updateEjercicio, deleteEjercicio } = useDataStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<Omit<Ejercicio, 'id'>>(emptyEjercicio);
  const [search, setSearch] = useState('');

  const filtered = ejercicios.filter(e => 
    e.nombre.toLowerCase().includes(search.toLowerCase()) ||
    e.categoria.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.nombre || !form.categoria || !form.dificultad) return;
    if (editingId) { updateEjercicio(editingId, form); setEditingId(null); }
    else { addEjercicio(form); }
    setForm(emptyEjercicio);
    setIsCreating(false);
  };

  const handleEdit = (e: Ejercicio) => {
    setForm({ nombre: e.nombre, categoria: e.categoria, grupo_muscular: [...e.grupo_muscular], equipamiento: [...e.equipamiento], dificultad: e.dificultad, unidad_id_default: e.unidad_id_default, descripcion: e.descripcion, tags: [...e.tags] });
    setEditingId(e.id);
    setIsCreating(true);
  };

  const handleDelete = (id: number) => { if (window.confirm('¿Eliminar?')) { deleteEjercicio(id); } };
  const handleCancel = () => { setForm(emptyEjercicio); setEditingId(null); setIsCreating(false); };

  const addMuscle = (m: string) => { if (m && !form.grupo_muscular.includes(m)) { setForm({...form, grupo_muscular: [...form.grupo_muscular, m]}); } };
  const removeMuscle = (m: string) => { setForm({...form, grupo_muscular: form.grupo_muscular.filter(x => x !== m)}); };
  const addEquip = (e: string) => { if (e && !form.equipamiento.includes(e)) { setForm({...form, equipamiento: [...form.equipamiento, e]}); } };
  const removeEquip = (e: string) => { setForm({...form, equipamiento: form.equipamiento.filter(x => x !== e)}); };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2"><Activity className="w-5 h-5 text-orange-500" />GESTION DE EJERCICIOS</h2>
        {!isCreating && <button onClick={() => setIsCreating(true)} className="flex items-center gap-1 px-3 py-1.5 rounded font-mono text-sm font-bold" style={{background:'linear-gradient(180deg,#ff6b00 0%,#e55a00 100%)',color:'white'}}><Plus className="w-4 h-4" />NUEVO</button>}
      </div>
      {!isCreating && <div className="mb-4"><input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-3 py-2 rounded font-mono text-sm" style={{background:'#0d0d0d',border:'1px solid #333',color:'white'}}/></div>}
      {isCreating && (
        <div className="mb-4 p-4 rounded-lg" style={{background:'#1a1a1a',border:'2px solid #ff6b00'}}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="text-xs text-gray-400 font-mono block mb-1">NOMBRE *</label><input type="text" value={form.nombre} onChange={e => setForm({...form,nombre:e.target.value})} className="w-full px-3 py-2 rounded font-mono text-sm" style={{background:'#0d0d0d',border:'1px solid #333',color:'white'}}/></div>
            <div><label className="text-xs text-gray-400 font-mono block mb-1">CATEGORIA *</label><select value={form.categoria} onChange={e => setForm({...form,categoria:e.target.value})} className="w-full px-3 py-2 rounded font-mono text-sm" style={{background:'#0d0d0d',border:'1px solid #333',color:'white'}}><option value="">Seleccionar</option>{categorias.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="text-xs text-gray-400 font-mono block mb-1">DIFICULTAD *</label><select value={form.dificultad} onChange={e => setForm({...form,dificultad:e.target.value})} className="w-full px-3 py-2 rounded font-mono text-sm" style={{background:'#0d0d0d',border:'1px solid #333',color:'white'}}><option value="">Seleccionar</option>{dificultades.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            <div><label className="text-xs text-gray-400 font-mono block mb-1">UNIDAD</label><select value={form.unidad_id_default} onChange={e => setForm({...form,unidad_id_default:Number(e.target.value)})} className="w-full px-3 py-2 rounded font-mono text-sm" style={{background:'#0d0d0d',border:'1px solid #333',color:'white'}}>{unidades.map(u => <option key={u.id} value={u.id}>{u.nombre} ({u.simbolo})</option>)}</select></div>
          </div>
          <div className="mb-3"><label className="text-xs text-gray-400 font-mono block mb-1">DESCRIPCION</label><textarea value={form.descripcion} onChange={e => setForm({...form,descripcion:e.target.value})} className="w-full px-3 py-2 rounded font-mono text-sm" style={{background:'#0d0d0d',border:'1px solid #333',color:'white'}} rows={2}/></div>
          <div className="mb-3"><label className="text-xs text-gray-400 font-mono block mb-1">GRUPOS MUSCULARES</label><div className="flex flex-wrap gap-1 mb-2">{form.grupo_muscular.map(m => <span key={m} className="px-2 py-1 rounded text-xs font-mono flex items-center gap-1" style={{background:'#ff6b00',color:'white'}}>{m}<button onClick={()=>removeMuscle(m)}><X className="w-3 h-3"/></button></span>)}</div><div className="flex gap-2 mb-2">{['Pecho','Espalda','Piernas','Glúteos','Hombros','Bíceps','Tríceps','Core'].map(g => <button key={g} onClick={()=>addMuscle(g)} className="px-2 py-1 rounded text-xs" style={{background:'#222',color:'#888'}}>+{g}</button>)}</div></div>
          <div className="mb-3"><label className="text-xs text-gray-400 font-mono block mb-1">EQUIPAMIENTO</label><div className="flex flex-wrap gap-1 mb-2">{form.equipamiento.map(e => <span key={e} className="px-2 py-1 rounded text-xs font-mono flex items-center gap-1" style={{background:'#3b82f6',color:'white'}}>{e}<button onClick={()=>removeEquip(e)}><X className="w-3 h-3"/></button></span>)}</div><div className="flex gap-2">{['Barra','Mancuernas','Banco','Cinta','Kettlebell'].map(g => <button key={g} onClick={()=>addEquip(g)} className="px-2 py-1 rounded text-xs" style={{background:'#222',color:'#888'}}>+{g}</button>)}</div></div>
          <div className="flex gap-2"><button onClick={handleCancel} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded font-mono text-sm" style={{background:'#333',color:'white'}}><X className="w-4 h-4"/>CANCELAR</button><button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded font-mono text-sm font-bold" style={{background:'linear-gradient(180deg,#22c55e 0%,#16a34a 100%)',color:'white'}}><Save className="w-4 h-4"/>GUARDAR</button></div>
        </div>
      )}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">{filtered.map(ej => <div key={ej.id} className="flex items-center justify-between p-3 rounded-lg" style={{background:'#1a1a1a',border:'1px solid #333'}}><div className="flex items-center gap-3 flex-1 min-w-0"><span className="w-10 h-10 rounded flex items-center justify-center text-lg" style={{background:'#0d0d0d',border:'1px solid #ff6b00'}}>💪</span><div className="min-w-0"><p className="text-white font-medium font-mono text-sm truncate">{ej.nombre}</p><p className="text-gray-500 text-xs font-mono truncate">{ej.categoria} • {ej.dificultad}</p></div></div><div className="flex gap-1 ml-2">
