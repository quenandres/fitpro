import { useState } from 'react';
import { Activity, Plus, Search } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { useToast } from './common/Toast';
import { ExerciseForm } from './ExerciseForm';
import { AdminExerciseCard } from './AdminExerciseCard';
import type { Ejercicio } from '../../types';

export const ExerciseManager = () => {
  const { ejercicios, addEjercicio, updateEjercicio, deleteEjercicio } = useDataStore();
  const { showToast } = useToast();
  const [showForm,         setShowForm]         = useState(false);
  const [editingEjercicio, setEditingEjercicio] = useState<Ejercicio | null>(null);
  const [searchTerm,       setSearchTerm]       = useState('');
  const [filterCategory,   setFilterCategory]   = useState('');

  const categorias = [...new Set(ejercicios.map((e) => e.categoria))];
  const filtered   = ejercicios.filter((ej) => {
    const okSearch = ej.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const okCat    = !filterCategory || ej.categoria === filterCategory;
    return okSearch && okCat;
  });

  const handleSave   = (data: Omit<Ejercicio, 'id'>) => {
    editingEjercicio ? updateEjercicio(editingEjercicio.id, data) : addEjercicio(data);
  };
  const handleEdit   = (ej: Ejercicio) => { setEditingEjercicio(ej); setShowForm(true); };
  const handleNew    = () => { setEditingEjercicio(null); setShowForm(true); };
  const handleClose  = () => { setShowForm(false); setEditingEjercicio(null); };
  const handleDelete = (id: number) => {
    if (window.confirm('¿Eliminar este ejercicio?')) {
      deleteEjercicio(id); showToast('Ejercicio eliminado', 'success');
    }
  };

  return (
    <div>
      <div className="fp-card" style={{ padding: 14, marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', borderRadius: 13 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input className="fp-input" style={{ paddingLeft: 32 }} placeholder="Buscar ejercicios..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="fp-input" style={{ width: 'auto', minWidth: 160 }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="fp-btn fp-btn-primary" style={{ gap: 6, flexShrink: 0 }} onClick={handleNew}>
          <Plus size={15} /> Nuevo ejercicio
        </button>
      </div>

      {(searchTerm || filterCategory) && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
          Mostrando <span style={{ color: 'var(--brand)', fontWeight: 600 }}>{filtered.length}</span> de {ejercicios.length} ejercicios
        </p>
      )}

      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {filtered.map((ej) => (
          <AdminExerciseCard key={ej.id} ejercicio={ej} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="fp-card text-center" style={{ padding: '48px 24px', borderRadius: 13 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Activity size={22} color="var(--text-muted)" />
          </div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            {searchTerm || filterCategory ? 'Sin resultados' : 'No hay ejercicios'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            {searchTerm || filterCategory ? 'Intenta con otros filtros' : 'Crea tu primer ejercicio'}
          </p>
          {!searchTerm && !filterCategory && (
            <button className="fp-btn fp-btn-primary" style={{ gap: 6 }} onClick={handleNew}>
              <Plus size={15} /> Crear ejercicio
            </button>
          )}
        </div>
      )}

      <ExerciseForm isOpen={showForm} onClose={handleClose} editingEjercicio={editingEjercicio} onSave={handleSave} />
    </div>
  );
};
