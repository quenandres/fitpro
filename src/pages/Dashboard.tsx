import { useState, useMemo } from 'react';
import { Search, Sparkles } from 'lucide-react';
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
        <header className="mb-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-gradient" />
            <span className="text-sm font-medium" style={{ color: 'var(--accent-green)' }}>
              Tu fitapp personal
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Hola, <span className="text-gradient">Atleta</span>
          </h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            ¿Qué entrenamiento harás hoy?
          </p>
        </header>

        <div className="relative mb-6 group">
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, var(--glow-green), var(--glow-blue))', filter: 'blur(15px)' }} />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Buscar rutinas..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full py-4 pl-12 pr-4 rounded-xl text-base transition-all focus:outline-none" style={{ background: 'var(--bg-secondary)', border: '2px solid var(--border-color)', color: 'var(--text-primary)', boxShadow: '0 4px 20px var(--shadow-color)' }} />
          </div>
        </div>

        <div className="space-y-4">
          {filteredRutinas.map((rutina, index) => (
            <div key={rutina.id} className="animate-slide-up-3d" style={{ animationDelay: `${index * 80}ms` }}>
              <WorkoutCard rutina={rutina} />
            </div>
          ))}
        </div>

        {filteredRutinas.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
              <Search className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
            </div>
            <p style={{ color: 'var(--text-muted)' }}>No se encontraron rutinas</p>
          </div>
        )}
      </main>
    </div>
  );
};
