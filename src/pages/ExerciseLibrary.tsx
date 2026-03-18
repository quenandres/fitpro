import { useState, useMemo } from 'react';
import { Search, X, Dumbbell, CheckCircle } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import type { Ejercicio } from '../types';
import { Navbar, BottomNav } from '../components/layout/Navbar';
import { ExerciseCard } from '../components/exercise/ExerciseCard';

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
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center shadow-lg">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold" style={{ color: 'var(--accent-blue)' }}>
                Biblioteca Completa
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Ejercicios
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {ejercicios.length} ejercicios disponibles para ti
          </p>
        </header>

        <div className="relative mb-6 group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent-green)] via-[var(--accent-blue)] to-[var(--accent-purple)] rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 z-10 transition-colors" style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar ejercicios..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full py-4 pl-12 pr-4 rounded-2xl text-base focus:outline-none transition-all"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '2px solid var(--border-color)' }}
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          <select 
            value={selectedMuscle} 
            onChange={e => setSelectedMuscle(e.target.value)} 
            className="py-3 px-4 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer hover:scale-105"
            style={{ 
              background: selectedMuscle ? 'linear-gradient(135deg, var(--accent-green), #10B981)' : 'var(--bg-secondary)', 
              color: selectedMuscle ? 'black' : 'var(--text-secondary)', 
              border: '2px solid',
              borderColor: selectedMuscle ? 'var(--accent-green)' : 'var(--border-color)'
            }}
          >
            <option value="">Músculo</option>
            {gruposMusculares.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select 
            value={selectedEquip} 
            onChange={e => setSelectedEquip(e.target.value)} 
            className="py-3 px-4 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer hover:scale-105"
            style={{ 
              background: selectedEquip ? 'linear-gradient(135deg, var(--accent-blue), #3B82F6)' : 'var(--bg-secondary)', 
              color: selectedEquip ? 'white' : 'var(--text-secondary)', 
              border: '2px solid',
              borderColor: selectedEquip ? 'var(--accent-blue)' : 'var(--border-color)'
            }}
          >
            <option value="">Equipo</option>
            {equipamientos.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select 
            value={selectedCategory} 
            onChange={e => setSelectedCategory(e.target.value)} 
            className="py-3 px-4 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer hover:scale-105"
            style={{ 
              background: selectedCategory ? 'linear-gradient(135deg, var(--accent-purple), #7C3AED)' : 'var(--bg-secondary)', 
              color: selectedCategory ? 'white' : 'var(--text-secondary)', 
              border: '2px solid',
              borderColor: selectedCategory ? 'var(--accent-purple)' : 'var(--border-color)'
            }}
          >
            <option value="">Categoría</option>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {hasFilters && (
            <button 
              onClick={clearFilters} 
              className="py-3 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              <X className="w-4 h-4" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {hasFilters && (
          <div className="mb-4 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <CheckCircle className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
            <span>Mostrando {filtered.length} de {ejercicios.length} ejercicios</span>
          </div>
        )}

        <div className="grid gap-5">
          {filtered.map((ej) => (
            <ExerciseCard 
              key={ej.id} 
              ejercicio={ej} 
              onClick={() => setSelectedExercise(ej)} 
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[var(--accent-green)]/20 to-[var(--accent-blue)]/20 flex items-center justify-center">
              <Search className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Sin resultados</h3>
            <p style={{ color: 'var(--text-muted)' }}>No se encontraron ejercicios con esos filtros</p>
          </div>
        )}
      </main>

      {selectedExercise && (
        <div 
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 backdrop-blur-md"
          style={{ background: 'rgba(0,0,0,0.85)' }} 
          onClick={() => setSelectedExercise(null)}
        >
          <div 
            className="w-full max-w-md rounded-3xl overflow-hidden border"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} 
            onClick={e => e.stopPropagation()}
          >
            <div className="h-2 bg-gradient-to-r from-[var(--accent-green)] via-[var(--accent-blue)] to-[var(--accent-purple)]" />
            
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-3" style={{ background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))', color: 'black' }}>
                    {selectedExercise.categoria}
                  </span>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{selectedExercise.nombre}</h2>
                </div>
                <button 
                  onClick={() => setSelectedExercise(null)} 
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                >
                  <X className="w-6 h-6"/>
                </button>
              </div>
              
              <div className="space-y-5">
                <div className="p-4 rounded-2xl" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Descripción</h4>
                  <p className="leading-relaxed" style={{ color: 'var(--text-primary)' }}>{selectedExercise.descripcion}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>Grupos Musculares</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.grupo_muscular.map(m => (
                      <span key={m} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))', color: 'black' }}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                
                {selectedExercise.equipamiento.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>Equipamiento</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.equipamiento.map(e => (
                        <span key={e} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Dificultad</span>
                  <span className="font-bold px-4 py-2 rounded-xl" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', color: 'white' }}>
                    {selectedExercise.dificultad}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
