import { useNavigate } from 'react-router-dom';
import { Dumbbell, LayoutTemplate, Loader2, Plus, Sparkles } from 'lucide-react';
import { useTemplates, useTemplateMutations } from '../../lib/gateway/hooks/useTemplates';
import { RoutineCard } from '../../components/library/RoutineCard';
import { SimpleToast, useToast } from '../../components/common/Toast';
import { routineEditPath } from '../../utils/inferRoutineFormLevel';
import { ROUTES } from '../../routes/paths';
import { ErrorState } from '../../components/common/ErrorState';

export const LibraryRutinasPage = () => {
  const navigate = useNavigate();
  const { data: rutinas = [], isLoading, isError, error, refetch } = useTemplates();
  const { remove } = useTemplateMutations();
  const { toast, showToast } = useToast();
  const { library: lib } = ROUTES;

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta rutina?')) return;
    try {
      await remove.mutateAsync(id);
      showToast('Rutina eliminada', 'success');
    } catch {
      showToast('No se pudo eliminar la rutina', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin" size={28} color="var(--text-muted)" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="No se pudieron cargar las rutinas"
        description={error?.message ?? 'Revisa la conexión con el gateway'}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <>
      <SimpleToast {...toast} />
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
            Inventario de rutinas en Supabase: edita, elimina o crea desde plantilla, IA o formulario.
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
          <div className="fp-card text-center" style={{ padding: '48px 24px', borderRadius: 13 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: 'var(--bg-overlay)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <Dumbbell size={22} color="var(--text-muted)" />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              No hay rutinas
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Crea tu primera rutina o importa una plantilla global.
            </p>
            <button
              className="fp-btn fp-btn-primary gap-1.5 text-xs"
              onClick={() => navigate(lib.rutinasNueva)}
            >
              <Plus size={14} /> Nueva rutina
            </button>
          </div>
        )}
      </div>
    </>
  );
};
