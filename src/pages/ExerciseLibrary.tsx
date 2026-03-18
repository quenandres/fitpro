import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import type { Ejercicio } from '../types';
import { Navbar, BottomNav } from '../components/layout/Navbar';

export const ExerciseLibrary = () => {
  const ejercicios = useDataStore(state => state.ejercicios);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('');
  const [selectedEquip, setSelectedEquip] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedExercise, setSelectedExercise] = useState<Ejercicio | null>(null);

  const gruposMusculares = [...new Set(ejercicios.flatMap(e => e.grupo_muscular))];
  const equipamientos = [...new Set(ejercicios.flatMap(e => e.equipamiento).filter(Boolean))];
  const categorias = [...new Set(ejercicios.map(e => e.categoria))];

  const filtered = useMemo(() => {
    return ejercicios.filter(e => {
      const matchSearch = !search || e.nombre.toLowerCase().includes(search.toLowerCase());
      const matchMuscle = !selectedMuscle || e.grupo_muscular.includes(selectedMuscle);
      const matchEquip = !selectedEquip || e.equipamiento.includes(selectedEquip);
      const matchCategory = !selectedCategory || e.categoria === selectedCategory;
      return matchSearch && matchMuscle && matchEquip && matchCategory;
    });
  }, [search, selectedMuscle, selectedEquip, selectedCategory, ejercicios]);

  const clearFilters = () => {
    setSearch(''); setSelectedMuscle(''); setSelectedEquip(''); setSelectedCategory('');
  };

  const hasFilters = selectedMuscle || selectedEquip || selectedCategory;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <BottomNav />
      
      <main className="pt-20 pb-24 px-4 max-w-md mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Biblioteca de <span className="text-gradient">Ejercicios</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>{ejercicios.length} ejercicios disponibles</p>
        </header>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Buscar ejercicios..." value={search} onChange={e => setSearch(e.target.value)} className="w-full py-4 pl-12 pr-4 rounded-xl text-base" style={{ background: 'var(--bg-secondary)', border: '2px solid var(--border-color)', color: 'var(--text-primary)' }} />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <select value={selectedMuscle} onChange={e => setSelectedMuscle(e.target.value)} className="py-2.5 px-3 rounded-xl text-sm font-medium whitespace-nowrap" style={{ background: selectedMuscle ? 'var(--accent-green)' : 'var(--bg-secondary)', color: selectedMuscle ? 'white' : 'var(--text-secondary)', border: '2px solid var(--border-color)' }}>
            <option value="">Músculo</option>
            {gruposMusculares.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={selectedEquip} onChange={e => setSelectedEquip(e.target.value)} className="py-2.5 px-3 rounded-xl text-sm font-medium whitespace-nowrap" style={{ background: selectedEquip ? 'var(--accent-blue)' : 'var(--bg-secondary)', color: selectedEquip ? 'white' : 'var(--text-secondary)', border: '2px solid var(--border-color)' }}>
            <option value="">Equipo</option>
            {equipamientos.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="py-2.5 px-3 rounded-xl text-sm font-medium whitespace-nowrap" style={{ background: selectedCategory ? 'var(--accent-purple)' : 'var(--bg-secondary)', color: selectedCategory ? 'white' : 'var(--text-secondary)', border: '2px solid var(--border-color)' }}>
            <option value="">Categoría</option>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {hasFilters && <button onClick={clearFilters} className="py-2.5 px-3 rounded-xl text-sm font-medium flex items-center gap-1" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}><X className="w-4 h-4"/></button>}
        </div>

        <div className="grid gap-3">
          {filtered.map(ej => (
            <div key={ej.id} onClick={() => setSelectedExercise(ej)} className="card-3d rounded-xl p-4 cursor-pointer" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="text-xs font-semibold" style={{ color: 'var(--accent-blue)' }}>{ej.categoria}</span>
                  <h3 className="font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>{ej.nombre}</h3>
                </div>
                <span className="px-2 py-1 rounded-lg text-xs" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{ej.dificultad}</span>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {ej.grupo_muscular.slice(0, 3).map(m => <span key={m} className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: 'var(--accent-green)', color: 'white' }}>{m}</span>)}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && <div className="text-center py-12"><p style={{ color: 'var(--text-muted)' }}>No se encontraron ejercicios</p></div>}
      </main>

      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setSelectedExercise(null)}>
          <div className="w-full max-w-md rounded-3xl p-6 animate-slide-up-3d overflow-y-auto max-h-[80vh]" style={{ background: 'var(--bg-secondary)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2" style={{ background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))', color: 'white' }}>{selectedExercise.categoria}</span>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{selectedExercise.nombre}</h2>
              </div>
              <button onClick={() => setSelectedExercise(null)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}><X className="w-6 h-6"/></button>
            </div>
            <div className="space-y-4">
              <div><h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Descripción</h4><p style={{ color: 'var(--text-primary)' }}>{selectedExercise.descripcion}</p></div>
              <div><h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Grupos Musculares</h4><div className="flex gap-2 flex-wrap">{selectedExercise.grupo_muscular.map(m => <span key={m} className="px-3 py-1 rounded-full text-sm" style={{ background: 'var(--accent-green)', color: 'white' }}>{m}</span>)}</div></div>
              {selectedExercise.equipamiento.length > 0 && <div><h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Equipamiento</h4><div className="flex gap-2 flex-wrap">{selectedExercise.equipamiento.map(e => <span key={e} className="px-3 py-1 rounded-full text-sm" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>{e}</span>)}</div></div>}
              <div className="flex items-center justify-between pt-4 rounded-xl" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}><span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Dificultad</span><span className="font-bold" style={{ color: 'var(--accent-blue)' }}>{selectedExercise.dificultad}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
