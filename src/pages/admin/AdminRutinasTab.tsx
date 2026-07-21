import { useNavigate } from 'react-router-dom';
import { Dumbbell, LayoutTemplate, Plus, Sparkles } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';
import { RoutineCard } from '../../components/admin/RoutineCard';
import { routineEditPath } from '../../utils/inferRoutineFormLevel';

interface Props {
  onDelete: (id: number) => void;
}

export const AdminRutinasTab = ({ onDelete }: Props) => {
  const navigate = useNavigate();
  const rutinas = useDataStore((s) => s.rutinas);

  return (
    <div>
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
          onClick={() => navigate('/library/rutina/plantillas?from=admin')}
        >
          <LayoutTemplate size={14} /> Plantillas
        </button>
        <button
          className="fp-btn fp-btn-secondary"
          style={{ gap: 6, fontSize: 12 }}
          onClick={() => navigate('/library/ia?from=admin')}
        >
          <Sparkles size={14} /> Rutina IA
        </button>
        <button
          className="fp-btn fp-btn-primary"
          style={{ gap: 6, fontSize: 12 }}
          onClick={() => navigate('/library/rutina?from=admin')}
        >
          <Plus size={14} /> Nueva rutina
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rutinas.map((r) => (
          <RoutineCard
            key={r.id}
            rutina={r}
            onEdit={() => navigate(`${routineEditPath(r)}&from=admin`)}
            onDelete={onDelete}
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
              onClick={() => navigate('/library/rutina?from=admin')}
            >
              <Plus size={15} /> Crear rutina
            </button>
            <button
              className="fp-btn fp-btn-secondary"
              style={{ gap: 6 }}
              onClick={() => navigate('/library/rutina/plantillas?from=admin')}
            >
              <LayoutTemplate size={15} /> Ver plantillas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
