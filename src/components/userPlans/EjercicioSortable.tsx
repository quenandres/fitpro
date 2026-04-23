import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import type { EjercicioPersonalizado } from '../../types';

interface Props {
  id: string;
  ejercicio: EjercicioPersonalizado;
  onRemove: () => void;
  onUpdate: (updates: Partial<EjercicioPersonalizado>) => void;
}

export const EjercicioSortable = ({ id, ejercicio, onRemove, onUpdate }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        padding: 14,
        borderRadius: 10,
        background: 'var(--bg-overlay)',
        border: '1px solid var(--border)',
        boxShadow: isDragging ? 'var(--shadow-md)' : 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <button
            {...attributes}
            {...listeners}
            aria-label="Reordenar ejercicio"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'grab',
              padding: 4,
              color: 'var(--text-muted)',
              touchAction: 'none',
            }}
          >
            <GripVertical size={16} />
          </button>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {ejercicio.nombre}
          </p>
        </div>
        <button
          onClick={onRemove}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          aria-label="Eliminar ejercicio"
        >
          <Trash2 size={14} color="#f85149" />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Series</p>
          <input
            type="number"
            className="fp-input"
            value={ejercicio.series}
            onChange={(e) => onUpdate({ series: parseInt(e.target.value) || 1 })}
            min={1}
            style={{ padding: '8px 10px', fontSize: 13 }}
          />
        </div>
        <div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Reps</p>
          <input
            type="number"
            className="fp-input"
            value={ejercicio.reps}
            onChange={(e) => onUpdate({ reps: parseInt(e.target.value) || 1 })}
            min={1}
            style={{ padding: '8px 10px', fontSize: 13 }}
          />
        </div>
      </div>
      {ejercicio.notas && (
        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>{ejercicio.notas}</p>
      )}
    </div>
  );
};
