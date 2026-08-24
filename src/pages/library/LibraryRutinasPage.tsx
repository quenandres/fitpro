import { useNavigate } from 'react-router-dom';
import { Dumbbell, LayoutTemplate, Plus, Sparkles } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { RoutineCard } from '../../components/library/RoutineCard';
import { SimpleToast, useToast } from '../../components/common/Toast';
import { routineEditPath } from '../../utils/inferRoutineFormLevel';
import { ROUTES } from '../../routes/paths';

export const LibraryRutinasPage = () => {
  const navigate = useNavigate();
  const rutinas = useDataStore((s) => s.rutinas);
  const { toast, showToast } = useToast();
  const { library: lib } = ROUTES;

  const handleDelete = (id: number) => {
    if (window.confirm('¿Eliminar esta rutina?')) {
      useDataStore.getState().deleteRutina(id);
      showToast('Rutina eliminada', 'success');
    }
  };

  return (
    <>
      <SimpleToast {...toast} />
      <div>
        <section className="animate-slide-up" style={{ paddingBottom: 14 }}>
          <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
            <Dumbbell size={10} style={{ marginRight: 3 }} />
            Mis rutinas
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
            Rutinas guardadas
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Edita, elimina o crea nuevas rutinas desde plantilla, IA o formulario.
          </p>
        </section>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 14,
            justifyContent: 'flex-end',
          }}
        >
          <button
            className="fp-btn fp-btn-secondary"
            style={{ gap: 6, fontSize: 12 }}
            onClick={() => navigate(lib.rutinasPlantillas)}
          >
            <LayoutTemplate size={14} /> Plantillas
          </button>
          <button
            className="fp-btn fp-btn-secondary"
            style={{ gap: 6, fontSize: 12 }}
            onClick={() => navigate(lib.ia)}
          >
            <Sparkles size={14} /> Rutina IA
          </button>
          <button
            className="fp-btn fp-btn-primary"
            style={{ gap: 6, fontSize: 12 }}
            onClick={() => navigate(lib.rutinasNueva)}
          >
            <Plus size={14} /> Nueva rutina
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Crea desde plantilla, IA o formulario por nivel
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                className="fp-btn fp-btn-primary"
                style={{ gap: 6 }}
                onClick={() => navigate(lib.rutinasNueva)}
              >
                <Plus size={15} /> Crear rutina
              </button>
              <button
                className="fp-btn fp-btn-secondary"
                style={{ gap: 6 }}
                onClick={() => navigate(lib.rutinasPlantillas)}
              >
                <LayoutTemplate size={15} /> Ver plantillas
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
