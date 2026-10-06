import type { PlantillaCategoria, PlantillaMeta, RoutineFormLevel } from '../../../types';
import { PLANTILLA_CATEGORY_LABELS } from '../../../data/plantillasBase';
import { FormField } from './RoutineFormShell';

interface Props {
  value: PlantillaMeta;
  level: RoutineFormLevel;
  accent: string;
  onChange: (next: PlantillaMeta) => void;
}

const CATEGORIES = Object.keys(PLANTILLA_CATEGORY_LABELS) as PlantillaCategoria[];

/** Metadatos exclusivos de plantilla (categoría, tags, destacada) — solo visibles en modo plantilla. */
export const RoutineTemplateMetaFields = ({ value, level, accent, onChange }: Props) => {
  const tagsText = value.tags.join(', ');

  return (
    <div
      className="fp-card"
      style={{ padding: 12, marginBottom: 16, background: 'var(--bg-elevated)', border: '1px dashed var(--border)' }}
    >
      <p className="fp-cal-label" style={{ marginBottom: 8 }}>
        Metadatos de la plantilla
      </p>
      <FormField label="Categoría">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => {
            const sel = value.categoria === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onChange({ ...value, categoria: cat, nivel: level })}
                className="rounded-[10px] cursor-pointer text-xs font-semibold py-2 px-1"
                style={{
                  border: `1px solid ${sel ? accent : 'var(--border)'}`,
                  background: sel ? `${accent}1f` : 'var(--bg-card)',
                  color: sel ? accent : 'var(--text-muted)',
                }}
              >
                {PLANTILLA_CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>
      </FormField>
      <FormField label="Tags (separados por coma)">
        <input
          className="fp-input"
          placeholder="hipertrofia, torso, intermedio"
          value={tagsText}
          onChange={(e) =>
            onChange({
              ...value,
              tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
              nivel: level,
            })
          }
        />
      </FormField>
      <label className="flex items-center gap-2" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
        <input
          type="checkbox"
          checked={Boolean(value.destacada)}
          onChange={(e) => onChange({ ...value, destacada: e.target.checked, nivel: level })}
        />
        Marcar como plantilla destacada (Popular)
      </label>
    </div>
  );
};
