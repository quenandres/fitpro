import { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import type { EjercicioPersonalizado, PlanProgresionModo, ReglaProgresion, Unidad } from '../../types';
import { calcularValorProgresivo } from '../../utils/planProgresionUtils';

interface Props {
  id: string;
  ejercicio: EjercicioPersonalizado;
  progresion: PlanProgresionModo;
  totalSemanas: number;
  semanaBase: number;
  unidades: Unidad[];
  onRemove: () => void;
  onUpdate: (updates: Partial<EjercicioPersonalizado>) => void;
}

const UNIDADES_PLAN = new Set(['conteo', 'peso', 'tiempo']);

function updateRegla(
  regla: ReglaProgresion | undefined,
  patch: Partial<ReglaProgresion>,
): ReglaProgresion {
  const next = { ...regla, ...patch };
  if (next.peso_incremento == null && next.reps_incremento == null) {
    return { cada_semanas: next.cada_semanas ?? 1 };
  }
  return next;
}

export const EjercicioSortable = ({
  id,
  ejercicio,
  progresion,
  totalSemanas,
  semanaBase,
  unidades,
  onRemove,
  onUpdate,
}: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const unidadesFiltradas = useMemo(
    () => unidades.filter((u) => UNIDADES_PLAN.has(u.tipo)),
    [unidades],
  );

  const unidad = unidades.find((u) => u.id === ejercicio.unidad_id);
  const regla = ejercicio.regla_progresion;

  const previewSemanas = useMemo(() => {
    if (progresion !== 'incremental' || totalSemanas <= 1) return [];
    const mid = Math.ceil((totalSemanas + semanaBase) / 2);
    const keys = [...new Set([semanaBase, mid, totalSemanas])].sort((a, b) => a - b);
    return keys.map((sem) => ({
      sem,
      valor: calcularValorProgresivo(
        ejercicio.valor,
        ejercicio.unidad_id,
        regla,
        sem,
        semanaBase,
      ),
    }));
  }, [
    progresion,
    totalSemanas,
    semanaBase,
    ejercicio.valor,
    ejercicio.unidad_id,
    regla,
  ]);

  const simbolo = unidad?.simbolo ?? '';

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
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
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Valor</p>
          <input
            type="number"
            className="fp-input"
            value={ejercicio.valor}
            onChange={(e) =>
              onUpdate({ valor: parseFloat(e.target.value) || 1 })
            }
            min={0}
            step={ejercicio.unidad_id === 6 ? 0.5 : 1}
            style={{ padding: '8px 10px', fontSize: 13 }}
          />
        </div>
        <div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Unidad</p>
          <select
            className="fp-input"
            value={ejercicio.unidad_id}
            onChange={(e) => onUpdate({ unidad_id: parseInt(e.target.value) || 1 })}
            style={{ padding: '8px 6px', fontSize: 12 }}
          >
            {unidadesFiltradas.map((u) => (
              <option key={u.id} value={u.id}>
                {u.simbolo}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>RPE</p>
          <input
            type="number"
            className="fp-input"
            value={ejercicio.rpe ?? 7}
            onChange={(e) =>
              onUpdate({ rpe: Math.min(10, Math.max(1, parseInt(e.target.value) || 7)) })
            }
            min={1}
            max={10}
            style={{ padding: '8px 10px', fontSize: 13 }}
          />
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Notas</p>
        <textarea
          className="fp-input resize-none w-full"
          rows={2}
          placeholder="Variantes, tempo, advertencias…"
          value={ejercicio.notas ?? ''}
          onChange={(e) => onUpdate({ notas: e.target.value })}
          style={{ padding: '8px 10px', fontSize: 12 }}
        />
      </div>

      {progresion === 'incremental' ? (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid var(--border-subtle, var(--border))',
          }}
        >
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>
            Progresión automática
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>+ kg/sem</p>
              <input
                type="number"
                className="fp-input"
                placeholder="—"
                value={regla?.peso_incremento ?? ''}
                onChange={(e) => {
                  const v = e.target.value.trim();
                  onUpdate({
                    regla_progresion: updateRegla(regla, {
                      peso_incremento: v ? parseFloat(v) : undefined,
                    }),
                  });
                }}
                min={0}
                step={0.5}
                style={{ padding: '8px 10px', fontSize: 13 }}
              />
            </div>
            <div>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>+ reps/sem</p>
              <input
                type="number"
                className="fp-input"
                placeholder="—"
                value={regla?.reps_incremento ?? ''}
                onChange={(e) => {
                  const v = e.target.value.trim();
                  onUpdate({
                    regla_progresion: updateRegla(regla, {
                      reps_incremento: v ? parseInt(v) : undefined,
                    }),
                  });
                }}
                min={0}
                step={1}
                style={{ padding: '8px 10px', fontSize: 13 }}
              />
            </div>
            <div>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Cada N sem</p>
              <input
                type="number"
                className="fp-input"
                value={regla?.cada_semanas ?? 1}
                onChange={(e) =>
                  onUpdate({
                    regla_progresion: updateRegla(regla, {
                      cada_semanas: Math.max(1, parseInt(e.target.value) || 1),
                    }),
                  })
                }
                min={1}
                style={{ padding: '8px 10px', fontSize: 13 }}
              />
            </div>
          </div>
          {previewSemanas.length > 0 &&
          (regla?.peso_incremento != null || regla?.reps_incremento != null) ? (
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
              Vista previa:{' '}
              {previewSemanas
                .map(({ sem, valor }) => `Sem ${sem} → ${valor}${simbolo}`)
                .join(' · ')}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
