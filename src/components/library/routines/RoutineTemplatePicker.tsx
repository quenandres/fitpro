import { useMemo, useState } from 'react';
import { LayoutTemplate, Search } from 'lucide-react';
import { useDataStore } from '../../../store/useDataStore';
import type { Rutina, RoutineFormData } from '../../../types';
import { MAX_RUTINA_SEMANAS, MIN_RUTINA_SEMANAS } from '../../../utils/routineScheduleUtils';
import { aggregateRoutineMuscles } from '../../../utils/routineMuscles';
import { AnatomyMuscleHeatmapMini } from '../../anatomy/AnatomyMuscleHeatmapMini';

interface Props {
  accent: string;
  excludeId?: number | null;
  onApply: (source: Rutina | RoutineFormData, semanas: number) => void;
}

export const RoutineTemplatePicker = ({ accent, excludeId, onApply }: Props) => {
  const rutinas = useDataStore((s) => s.rutinas);
  const plantillas = useDataStore((s) => s.plantillas);
  const ejercicios = useDataStore((s) => s.ejercicios);
  const [query, setQuery] = useState('');
  const [semanas, setSemanas] = useState(4);

  const filteredRutinas = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rutinas.filter((r) => {
      if (excludeId != null && r.id === excludeId) return false;
      if (!q) return true;
      return r.nombre.toLowerCase().includes(q) || r.categoria.toLowerCase().includes(q);
    });
  }, [excludeId, query, rutinas]);

  const featuredPlantillas = plantillas.slice(0, 6);

  const decSemanas = () => setSemanas((n) => Math.max(MIN_RUTINA_SEMANAS, n - 1));
  const incSemanas = () => setSemanas((n) => Math.min(MAX_RUTINA_SEMANAS, n + 1));

  return (
    <div className="fp-card" style={{ borderRadius: 13, padding: '14px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <LayoutTemplate size={16} color={accent} />
        <p className="font-sora" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          Elegir base
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="fp-cal-label">Semanas del programa</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" className="fp-btn fp-btn-ghost" style={{ width: 32, height: 32, padding: 0 }} onClick={decSemanas}>
            −
          </button>
          <span className="font-sora" style={{ fontWeight: 700, color: accent, minWidth: 20, textAlign: 'center' }}>
            {semanas}
          </span>
          <button type="button" className="fp-btn fp-btn-ghost" style={{ width: 32, height: 32, padding: 0 }} onClick={incSemanas}>
            +
          </button>
        </div>
      </div>

      <div className="fp-input-group" style={{ marginBottom: 12 }}>
        <Search size={15} color="var(--text-muted)" />
        <input
          className="fp-input"
          placeholder="Buscar en mis rutinas…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto', marginBottom: 14 }}>
        {filteredRutinas.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
            No hay rutinas que coincidan.
          </p>
        ) : (
          filteredRutinas.map((r) => {
            const counts = aggregateRoutineMuscles(r.ejercicios, ejercicios);
            const hasMuscles = Object.keys(counts).length > 0;
            return (
              <button
                key={r.id}
                type="button"
                className="fp-btn fp-btn-secondary"
                style={{
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  padding: '10px 12px',
                  fontSize: 13,
                  gap: 8,
                }}
                onClick={() => onApply(r, semanas)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  {hasMuscles ? (
                    <span
                      className="fp-routine-card-muscle-mini"
                      style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--bg-overlay)', overflow: 'hidden', flexShrink: 0 }}
                    >
                      <AnatomyMuscleHeatmapMini counts={counts} ariaLabel={`Músculos de ${r.nombre}`} />
                    </span>
                  ) : null}
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.nombre}
                  </span>
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {r.semanas ?? 1} sem
                </span>
              </button>
            );
          })
        )}
      </div>

      <p className="fp-cal-label" style={{ marginBottom: 8 }}>
        Plantillas rápidas
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {featuredPlantillas.map((p) => (
          <button
            key={p.id}
            type="button"
            className="badge badge-blue"
            style={{ cursor: 'pointer', border: 'none', fontSize: 11, padding: '5px 10px' }}
            onClick={() => onApply(p, semanas)}
          >
            {p.nombre}
          </button>
        ))}
      </div>
    </div>
  );
};
