import { useState, useMemo } from 'react';
import { Search, Sparkles, TrendingUp, Target } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { WorkoutCard } from '../components/dashboard/WorkoutCard';
import { Navbar, BottomNav } from '../components/layout/Navbar';

export const Dashboard = () => {
  const [search, setSearch] = useState('');
  const rutinas = useDataStore(state => state.rutinas);

  const filteredRutinas = useMemo(() => {
    if (!search.trim()) return rutinas;
    const s = search.toLowerCase();
    return rutinas.filter(r => 
      r.nombre.toLowerCase().includes(s) || 
      r.categoria.toLowerCase().includes(s)
    );
  }, [search, rutinas]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <BottomNav />
      
      <main className="pt-20 pb-24 px-4 max-w-md mx-auto">
        <header className="mb-8 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--accent-green)' }}>
              Bienvenido de vuelta
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Hola, <span className="text-gradient">Atleta</span> 👋
          </h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            ¿Listo para un nuevo entrenamiento?
          </p>
        </header>

        <div className="grid grid-cols-2 gap-3 mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="relative overflow-hidden rounded-2xl p-4 glass-effect group cursor-pointer transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute -right-2 -top-2 w-16 h-16 bg-gradient-to-br from-[var(--accent-green)]/20 to-transparent rounded-full blur-xl group-hover:scale-110 transition-transform" />
            <Target className="w-6 h-6 mb-2" style={{ color: 'var(--accent-green)' }} />
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{rutinas.length}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Rutinas</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl p-4 glass-effect group cursor-pointer transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute -right-2 -top-2 w-16 h-16 bg-gradient-to-br from-[var(--accent-blue)]/20 to-transparent rounded-full blur-xl group-hover:scale-110 transition-transform" />
            <TrendingUp className="w-6 h-6 mb-2" style={{ color: 'var(--accent-blue)' }} />
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{rutinas.reduce((acc, r) => acc + r.ejercicios.length, 0)}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Ejercicios</p>
          </div>
        </div>

        <div className="relative mb-8 group animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent-green)] to-[var(--accent-blue)] rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity blur" />
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 transition-colors z-10" style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar rutinas..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full py-4 pl-12 pr-4 rounded-2xl text-base glass-effect focus:outline-none transition-all"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Tus Rutinas
          </h2>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full glass-effect" style={{ color: 'var(--text-muted)' }}>
            {filteredRutinas.length} total
          </span>
        </div>

        <div className="space-y-4">
          {filteredRutinas.map((rutina, index) => (
            <div key={rutina.id} className="animate-slide-up" style={{ animationDelay: `${400 + index * 100}ms` }}>
              <WorkoutCard rutina={rutina} />
            </div>
          ))}
        </div>

        {filteredRutinas.length === 0 && (
          <div className="text-center py-16 animate-slide-up">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl glass-effect flex items-center justify-center">
              <Search className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Sin resultados</h3>
            <p style={{ color: 'var(--text-muted)' }}>No se encontraron rutinas con ese nombre</p>
          </div>
        )}
      </main>
    </div>
  );
};
