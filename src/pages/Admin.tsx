import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Settings, Dumbbell, Activity, Ruler, ChevronLeft, ChevronRight,
  Download, Upload, RotateCcw, Plus, Search,
} from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { ExerciseForm } from '../components/admin/ExerciseForm';
import { SimpleToast, useToast } from '../components/admin/common/Toast';
import { RoutineCard } from '../components/admin/RoutineCard';
import { AdminExerciseCard } from '../components/admin/AdminExerciseCard';
import type { Ejercicio } from '../types';

type Tab = 'rutinas' | 'ejercicios' | 'unidades';

/* ── Exercise Manager ─────────────────────────────────────── */
const ExerciseManager = () => {
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

/* ── Admin Page ───────────────────────────────────────────── */
export const Admin = () => {
  const navigate    = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('rutinas');
  const { exportData, importData, resetToDefault, rutinas, ejercicios, unidades } = useDataStore();
  const { toast, showToast } = useToast();

  const handleNewRoutine    = () => navigate('/admin/rutina');
  const handleEditRoutine   = (id: number) => navigate(`/admin/rutina?id=${id}`);
  const handleDeleteRoutine = (id: number) => {
    if (window.confirm('¿Eliminar esta rutina?')) {
      useDataStore.getState().deleteRutina(id); showToast('Rutina eliminada', 'success');
    }
  };

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `fitpro-backup-${new Date().toISOString().split('T')[0]}.json`; a.click();
    URL.revokeObjectURL(url); showToast('Datos exportados', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      importData(ev.target?.result as string)
        ? showToast('Datos importados correctamente', 'success')
        : showToast('Error al importar datos', 'error');
    };
    reader.readAsText(file); e.target.value = '';
  };

  const handleReset = () => {
    if (window.confirm('¿Restaurar datos por defecto? Esto eliminará todos los cambios.')) {
      resetToDefault(); showToast('Datos restaurados', 'success');
    }
  };

  const TABS: { id: Tab; label: string; Icon: React.FC<{ size?: number; color?: string }>; count: number; accent: string }[] = [
    { id: 'rutinas',    label: 'Rutinas',    Icon: Dumbbell, count: rutinas.length,    accent: '#f0883e' },
    { id: 'ejercicios', label: 'Ejercicios', Icon: Activity, count: ejercicios.length, accent: '#22c55e' },
    { id: 'unidades',   label: 'Unidades',   Icon: Ruler,    count: unidades.length,   accent: '#58a6ff' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      <SimpleToast {...toast} />

      {/* Header */}
      <header className="fp-glass sticky top-0 z-50">
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/" className="fp-btn fp-btn-ghost" style={{ padding: '7px 9px', borderRadius: 10, background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}>
              <ChevronLeft size={16} />
            </Link>
            <div style={{ width: 1, height: 26, background: 'var(--border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#22c55e,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(34,197,94,.25)' }}>
                <Settings size={15} color="#fff" />
              </div>
              <div>
                <p className="font-sora" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>Administración</p>
                <p style={{ fontSize: 10, color: 'var(--brand)', fontWeight: 600 }}>FitPro Manager</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { val: rutinas.length,    dot: '#f0883e', lbl: 'rutinas'    },
              { val: ejercicios.length, dot: '#22c55e', lbl: 'ejercicios' },
              { val: unidades.length,   dot: '#58a6ff', lbl: 'unidades'   },
            ].map(({ val, dot, lbl }) => (
              <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 8, background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{val} {lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 20px 0' }}>

        {/* Tab bar */}
        <div className="fp-card" style={{ display: 'flex', gap: 4, padding: 4, marginBottom: 18, borderRadius: 14 }}>
          {TABS.map(({ id, label, Icon, count, accent }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 10px', borderRadius: 10, border: 'none', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, background: active ? 'var(--bg-overlay)' : 'transparent', color: active ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: active ? `inset 0 -2px 0 ${accent}` : 'none', transition: 'all .15s' }}>
                <Icon size={14} color={active ? accent : 'var(--text-muted)'} />
                {label}
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 100, background: active ? `${accent}20` : 'var(--bg-overlay)', color: active ? accent : 'var(--text-muted)', border: `1px solid ${active ? `${accent}30` : 'var(--border-subtle)'}` }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Rutinas */}
        {activeTab === 'rutinas' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <button className="fp-btn fp-btn-primary" style={{ gap: 6 }} onClick={handleNewRoutine}>
                <Plus size={15} /> Nueva rutina
              </button>
            </div>
            <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {rutinas.map((r) => (
                <RoutineCard key={r.id} rutina={r} onEdit={() => handleEditRoutine(r.id)} onDelete={handleDeleteRoutine} />
              ))}
            </div>
            {rutinas.length === 0 && (
              <div className="fp-card text-center" style={{ padding: '48px 24px', borderRadius: 13 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Dumbbell size={22} color="var(--text-muted)" />
                </div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>No hay rutinas</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Crea tu primera rutina para comenzar</p>
                <button className="fp-btn fp-btn-primary" style={{ gap: 6 }} onClick={handleNewRoutine}>
                  <Plus size={15} /> Crear rutina
                </button>
              </div>
            )}
          </div>
        )}

        {/* Ejercicios */}
        {activeTab === 'ejercicios' && <ExerciseManager />}

        {/* Unidades — navega a página propia */}
        {activeTab === 'unidades' && (
          <div>
            {/* Preview de unidades con acceso directo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>{unidades.length}</span> unidades configuradas
              </p>
              <button className="fp-btn fp-btn-primary" style={{ gap: 6 }} onClick={() => navigate('/admin/unidades')}>
                <Ruler size={14} /> Gestionar unidades
              </button>
            </div>

            {/* Quick grid preview */}
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', marginBottom: 16 }}>
              {unidades.map((u) => {
                const ACCENT: Record<string, string> = { conteo: '#22c55e', distancia: '#58a6ff', tiempo: '#a371f7', peso: '#f0883e', energia: '#d2a679', intensidad: '#f85149' };
                const EMOJI:  Record<string, string> = { conteo: '🔢', distancia: '📏', tiempo: '⏱', peso: '⚖️', energia: '⚡', intensidad: '🔥' };
                const accent = ACCENT[u.tipo] ?? '#22c55e';
                const emoji  = EMOJI[u.tipo]  ?? '📐';
                return (
                  <div key={u.id} className="fp-card" style={{ padding: '11px 13px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: `${accent}18`, border: `1px solid ${accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="font-sora" style={{ fontSize: 11, fontWeight: 800, color: accent }}>{u.simbolo}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.nombre}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{emoji} {u.tipo}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA to full page */}
            <button
              className="fp-btn fp-btn-secondary"
              style={{ width: '100%', gap: 7, fontSize: 13, justifyContent: 'center', padding: '12px' }}
              onClick={() => navigate('/admin/unidades')}
            >
              Ver y gestionar todas las unidades <ChevronRight size={15} />
            </button>
          </div>
        )}

        {/* Data actions */}
        <div className="fp-card" style={{ padding: '12px 16px', marginTop: 20, marginBottom: 24, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', borderRadius: 13 }}>
          <button className="fp-btn fp-btn-secondary" style={{ gap: 6, fontSize: 12 }} onClick={handleExport}>
            <Download size={13} /> Exportar datos
          </button>
          <label style={{ cursor: 'pointer' }}>
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            <span className="fp-btn fp-btn-secondary" style={{ gap: 6, fontSize: 12, display: 'inline-flex', alignItems: 'center', color: 'var(--accent-blue)', borderColor: 'rgba(88,166,255,.3)' }}>
              <Upload size={13} /> Importar datos
            </span>
          </label>
          <button className="fp-btn fp-btn-ghost" style={{ gap: 6, fontSize: 12, color: 'var(--accent-red)' }} onClick={handleReset}>
            <RotateCcw size={13} /> Restaurar
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', paddingBottom: 32 }}>
          FitPro Admin Panel · {new Date().toISOString().split('T')[0]}
        </p>
      </div>
    </div>
  );
};
