import { useNavigate } from 'react-router-dom';
import { Dumbbell, LayoutTemplate, Plus, Sparkles } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { RoutineCard } from '../../components/library/RoutineCard';
import { useToastHook } from '../../components/common/Toast';
import { EmptyState } from '../../components/common/EmptyState';
import { routineEditPath } from '../../utils/inferRoutineFormLevel';
import { ROUTES } from '../../routes/paths';

export const LibraryRutinasPage = () => {
  const navigate = useNavigate();
  const rutinas = useDataStore((s) => s.rutinas);
  const toast = useToastHook();
  const { library: lib } = ROUTES;

  const handleDelete = (id: number) => {
    if (window.confirm('¿Eliminar esta rutina?')) {
      useDataStore.getState().deleteRutina(id);
      toast.success('Rutina eliminada');
    }
  };

  return (
    <div>
        <section className="animate-slide-up" style={{ paddingBottom: 14 }}>
          <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
            <Dumbbell size={10} style={{ marginRight: 3 }} />
            Rutinas
          </span>
          <h1
            className="font-sora"
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '-.02em',
              color: 'var(--text-primary)',
              marginTop: 8,
              marginBottom: 4,
            }}
          >
            Rutinas
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Inventario de rutinas: edita, elimina o crea desde plantilla, IA o formulario.
          </p>
        </section>

        <div className="flex flex-col sm:flex-row gap-2 mb-3.5">
          <button
            className="fp-btn fp-btn-primary w-full sm:w-auto sm:order-3 gap-1.5 text-xs"
            onClick={() => navigate(lib.rutinasNueva)}
          >
            <Plus size={14} /> Nueva rutina
          </button>
          <div className="flex gap-2 sm:ml-auto">
            <button
              className="fp-btn fp-btn-secondary flex-1 sm:flex-none gap-1.5 text-xs"
              onClick={() => navigate(lib.rutinasPlantillas)}
            >
              <LayoutTemplate size={14} /> Plantillas
            </button>
            <button
              className="fp-btn fp-btn-secondary flex-1 sm:flex-none gap-1.5 text-xs"
              onClick={() => navigate(lib.ia)}
            >
              <Sparkles size={14} /> Rutina IA
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {rutinas.map((r) => (
            <RoutineCard
              key={r.id}
              rutina={r}
              onEdit={() => navigate(routineEditPath(r))}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {rutinas.length === 0 && (
          <EmptyState
            icon={Dumbbell}
            title="No hay rutinas"
            description="Crea desde plantilla, IA o formulario por nivel"
            action={
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <button
                  type="button"
                  className="fp-btn fp-btn-primary gap-1.5"
                  onClick={() => navigate(lib.rutinasNueva)}
                >
                  <Plus size={15} /> Crear rutina
                </button>
                <button
                  type="button"
                  className="fp-btn fp-btn-secondary gap-1.5"
                  onClick={() => navigate(lib.rutinasPlantillas)}
                >
                  <LayoutTemplate size={15} /> Ver plantillas
                </button>
              </div>
            }
          />
        )}
    </div>
  );
};
