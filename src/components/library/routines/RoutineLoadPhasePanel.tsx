import { useEffect, useMemo, useState } from 'react';
import { Link2, Plus, Sparkles, Trash2, X } from 'lucide-react';
import type { RoutineFormExercise } from '../../../types';
import {
  applyProgressiveRpe,
  appendMockSetRow,
  buildMockSetRows,
  reindexMockRows,
  rowsToExercisePatch,
  stripRowIndex,
  totalTutSeconds,
  type MockSetRow,
  type MockSetRowType,
} from '../../../data/routineBuilderMock';

const TIPO_LABELS: Record<MockSetRowType, string> = {
  calentamiento: 'Calentamiento',
  efectiva: 'Efectiva',
  top: 'TOP set',
  backoff: 'Back-off',
};

const TIPO_OPTIONS: MockSetRowType[] = ['calentamiento', 'efectiva', 'top', 'backoff'];

interface Props {
  ejercicios: RoutineFormExercise[];
  restBetweenSetsSec: number;
  onUpdateExercise: (key: string, patch: Partial<RoutineFormExercise>) => void;
  onCreateSuperset?: (keys: string[]) => void;
  onRemoveSuperset?: (groupId: string) => void;
}

function exerciseKey(ej: RoutineFormExercise): string {
  return ej._key ?? `${ej.ejercicio_id}-${ej.nombre}`;
}

function formatMinSec(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

function getRows(ej: RoutineFormExercise, restBetweenSetsSec: number): MockSetRow[] {
  if (ej.series_detalle && ej.series_detalle.length === ej.series) {
    return ej.series_detalle.map((s, i) => ({ ...s, index: i + 1 }));
  }
  return buildMockSetRows(ej.series, ej.valor, ej.rpe, restBetweenSetsSec);
}

export const RoutineLoadPhasePanel = ({
  ejercicios,
  restBetweenSetsSec,
  onUpdateExercise,
  onCreateSuperset,
  onRemoveSuperset,
}: Props) => {
  const [selectedForSuperset, setSelectedForSuperset] = useState<string[]>([]);

  // Semilla: cualquier ejercicio sin `series_detalle` calibrado recibe una tabla generada,
  // así el dato queda persistido en el form (no solo en memoria de este panel).
  useEffect(() => {
    for (const ej of ejercicios) {
      if (!ej.series_detalle || ej.series_detalle.length !== ej.series) {
        const rows = buildMockSetRows(ej.series, ej.valor, ej.rpe, restBetweenSetsSec);
        onUpdateExercise(exerciseKey(ej), { series_detalle: rows.map(stripRowIndex) });
      }
    }
    // Solo cuando cambia el conjunto de ejercicios o sus series/valor — no en cada patch de fila.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ejercicios.map((e) => `${exerciseKey(e)}:${e.series}:${e.valor}`).join('|')]);

  const commitRows = (ej: RoutineFormExercise, rows: MockSetRow[]) => {
    onUpdateExercise(exerciseKey(ej), {
      series_detalle: rows.map(stripRowIndex),
      ...rowsToExercisePatch(rows),
    });
  };

  const updateRow = (ej: RoutineFormExercise, rowIndex: number, patch: Partial<MockSetRow>) => {
    const rows = getRows(ej, restBetweenSetsSec);
    commitRows(ej, rows.map((r) => (r.index === rowIndex ? { ...r, ...patch } : r)));
  };

  const addRow = (ej: RoutineFormExercise) => {
    const rows = getRows(ej, restBetweenSetsSec);
    commitRows(ej, appendMockSetRow(rows, restBetweenSetsSec));
  };

  const removeRow = (ej: RoutineFormExercise, rowIndex: number) => {
    const rows = getRows(ej, restBetweenSetsSec);
    if (rows.length <= 1) return;
    commitRows(ej, reindexMockRows(rows.filter((r) => r.index !== rowIndex)));
  };

  const applyRpeRamp = (ej: RoutineFormExercise) => {
    commitRows(ej, applyProgressiveRpe(getRows(ej, restBetweenSetsSec)));
  };

  const toggleSupersetSelection = (key: string) => {
    setSelectedForSuperset((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const linkSuperset = () => {
    if (selectedForSuperset.length >= 2) {
      onCreateSuperset?.(selectedForSuperset);
      setSelectedForSuperset([]);
    }
  };

  const totalSeries = ejercicios.reduce((acc, e) => acc + e.series, 0);
  const allRows = useMemo(
    () => ejercicios.map((ej) => getRows(ej, restBetweenSetsSec)),
    [ejercicios, restBetweenSetsSec],
  );
  const tonnage = allRows.reduce((acc, rows) => acc + rows.reduce((s, r) => s + r.cargaKg * r.reps, 0), 0);
  const tutSeconds = allRows.reduce((acc, rows) => acc + totalTutSeconds(rows), 0);
  const estMin = Math.max(30, Math.round(totalSeries * 2.8));

  if (ejercicios.length === 0) {
    return (
      <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '12px 0' }}>
        Añade ejercicios en la fase anterior para calibrar cargas aquí.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Series sesión', value: String(totalSeries) },
          { label: 'Tonelaje est.', value: `${Math.round(tonnage).toLocaleString('es')} kg` },
          { label: 'TUT acum.', value: formatMinSec(tutSeconds) },
          { label: 'Duración est.', value: `~${estMin} min` },
        ].map((m) => (
          <div
            key={m.label}
            className="fp-card"
            style={{ padding: '8px 10px', boxShadow: 'none', background: 'var(--bg-elevated)' }}
          >
            <p className="fp-cal-label" style={{ marginBottom: 2 }}>
              {m.label}
            </p>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{m.value}</p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
        Ajusta cada serie aquí; al cambiar reps, RPE o filas se actualizan las series efectivas del ejercicio
        (lo que se guarda en biblioteca).
      </p>

      {onCreateSuperset && selectedForSuperset.length >= 2 ? (
        <button
          type="button"
          className="fp-btn fp-btn-secondary"
          style={{ fontSize: 12, gap: 6, alignSelf: 'flex-start' }}
          onClick={linkSuperset}
        >
          <Link2 size={13} /> Vincular {selectedForSuperset.length} ejercicios como superserie
        </button>
      ) : null}

      {ejercicios.map((ej, idx) => {
        const key = exerciseKey(ej);
        const rows = allRows[idx];
        const exTonnage = rows.reduce((s, r) => s + r.cargaKg * r.reps, 0);
        const inSuperset = Boolean(ej.grupo_superset);
        const supersetSelected = selectedForSuperset.includes(key);

        return (
          <div
            key={key}
            className="fp-card"
            style={{
              padding: 12,
              borderColor: inSuperset ? 'rgba(163,113,247,.35)' : undefined,
              background: inSuperset ? 'rgba(163,113,247,.06)' : undefined,
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
              <p className="font-sora" style={{ fontSize: 14, fontWeight: 600 }}>
                {String(idx + 1).padStart(2, '0')} {ej.nombre}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Tonelaje: {Math.round(exTonnage).toLocaleString('es')} kg
                </span>
                {onCreateSuperset || onRemoveSuperset ? (
                  inSuperset ? (
                    <button
                      type="button"
                      className="badge"
                      style={{
                        fontSize: 9,
                        padding: '2px 6px',
                        cursor: 'pointer',
                        border: '1px solid rgba(163,113,247,.35)',
                        background: 'rgba(163,113,247,.14)',
                        color: 'var(--accent-purple)',
                      }}
                      onClick={() => ej.grupo_superset && onRemoveSuperset?.(ej.grupo_superset)}
                    >
                      <Link2 size={10} style={{ marginRight: 3 }} />
                      Superserie <X size={10} style={{ marginLeft: 3 }} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="fp-btn fp-btn-ghost"
                      style={{
                        fontSize: 10,
                        padding: '3px 8px',
                        color: supersetSelected ? 'var(--accent-purple)' : 'var(--text-muted)',
                      }}
                      onClick={() => toggleSupersetSelection(key)}
                    >
                      {supersetSelected ? '✓ Seleccionado' : 'Vincular a superserie'}
                    </button>
                  )
                ) : null}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: 520 }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '6px 4px', textAlign: 'left' }}>#</th>
                    <th style={{ padding: '6px 4px', textAlign: 'left' }}>Tipo</th>
                    <th style={{ padding: '6px 4px', textAlign: 'left' }}>Carga (kg)</th>
                    <th style={{ padding: '6px 4px', textAlign: 'left' }}>Reps</th>
                    <th style={{ padding: '6px 4px', textAlign: 'left' }}>RPE</th>
                    <th style={{ padding: '6px 4px', textAlign: 'left' }}>Tempo</th>
                    <th style={{ padding: '6px 4px', textAlign: 'left' }}>Descanso</th>
                    <th style={{ padding: '6px 4px' }} aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.index} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '6px 4px' }}>{row.index}</td>
                      <td style={{ padding: '6px 4px' }}>
                        <select
                          className="fp-input"
                          style={{ padding: '4px 6px', fontSize: 10, minWidth: 100 }}
                          value={row.tipo}
                          onChange={(e) =>
                            updateRow(ej, row.index, { tipo: e.target.value as MockSetRowType })
                          }
                        >
                          {TIPO_OPTIONS.map((t) => (
                            <option key={t} value={t}>
                              {TIPO_LABELS[t]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '6px 4px' }}>
                        <input
                          type="number"
                          className="fp-input"
                          style={{ width: 72, padding: '4px 6px', fontSize: 11 }}
                          min={0}
                          step={0.5}
                          value={row.cargaKg}
                          onChange={(e) =>
                            updateRow(ej, row.index, { cargaKg: Number(e.target.value) || 0 })
                          }
                        />
                      </td>
                      <td style={{ padding: '6px 4px' }}>
                        <input
                          type="number"
                          className="fp-input"
                          style={{ width: 56, padding: '4px 6px', fontSize: 11 }}
                          min={1}
                          max={100}
                          value={row.reps}
                          onChange={(e) =>
                            updateRow(ej, row.index, { reps: Number(e.target.value) || 1 })
                          }
                        />
                      </td>
                      <td style={{ padding: '6px 4px' }}>
                        <input
                          type="number"
                          className="fp-input"
                          style={{ width: 56, padding: '4px 6px', fontSize: 11 }}
                          min={1}
                          max={10}
                          step={0.5}
                          value={row.rpe ?? ''}
                          placeholder="—"
                          onChange={(e) => {
                            const v = e.target.value;
                            updateRow(ej, row.index, { rpe: v === '' ? undefined : Number(v) });
                          }}
                        />
                      </td>
                      <td style={{ padding: '6px 4px' }}>
                        <input
                          className="fp-input"
                          style={{ width: 72, padding: '4px 6px', fontSize: 11 }}
                          value={row.tempo}
                          onChange={(e) => updateRow(ej, row.index, { tempo: e.target.value })}
                        />
                      </td>
                      <td style={{ padding: '6px 4px' }}>
                        <input
                          type="number"
                          className="fp-input"
                          style={{ width: 64, padding: '4px 6px', fontSize: 11 }}
                          min={0}
                          step={15}
                          value={row.descansoSec}
                          onChange={(e) =>
                            updateRow(ej, row.index, { descansoSec: Number(e.target.value) || 0 })
                          }
                        />
                      </td>
                      <td style={{ padding: '6px 4px' }}>
                        <button
                          type="button"
                          className="fp-btn fp-btn-ghost"
                          style={{ padding: 4 }}
                          aria-label="Eliminar serie"
                          disabled={rows.length <= 1}
                          onClick={() => removeRow(ej, row.index)}
                        >
                          <Trash2 size={14} color="var(--accent-red)" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                type="button"
                className="fp-btn fp-btn-secondary"
                style={{ fontSize: 11, gap: 4, padding: '6px 10px' }}
                onClick={() => addRow(ej)}
              >
                <Plus size={14} /> Añadir serie
              </button>
              <button
                type="button"
                className="fp-btn fp-btn-ghost"
                style={{ fontSize: 11, gap: 4, padding: '6px 10px' }}
                onClick={() => applyRpeRamp(ej)}
                title="Rampa de RPE desde calentamiento hasta el top set"
              >
                <Sparkles size={14} /> Aplicar RPE progresivo
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
