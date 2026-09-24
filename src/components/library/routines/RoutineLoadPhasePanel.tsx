import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { RoutineFormExercise } from '../../../types';
import {
  appendMockSetRow,
  buildMockSetRows,
  reindexMockRows,
  rowsToExercisePatch,
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
}

function exerciseKey(ej: RoutineFormExercise): string {
  return ej._key ?? `${ej.ejercicio_id}-${ej.nombre}`;
}

export const RoutineLoadPhasePanel = ({
  ejercicios,
  restBetweenSetsSec,
  onUpdateExercise,
}: Props) => {
  const [rowsByKey, setRowsByKey] = useState<Record<string, MockSetRow[]>>({});

  const syncFromParent = useMemo(() => {
    const map: Record<string, { series: number; valor: number; rpe?: number }> = {};
    for (const ej of ejercicios) {
      map[exerciseKey(ej)] = { series: ej.series, valor: ej.valor, rpe: ej.rpe };
    }
    return map;
  }, [ejercicios]);

  useEffect(() => {
    setRowsByKey((prev) => {
      const next = { ...prev };
      for (const ej of ejercicios) {
        const key = exerciseKey(ej);
        const snap = syncFromParent[key];
        const existing = prev[key];
        if (!snap) continue;
        if (!existing || existing.length !== snap.series) {
          next[key] = buildMockSetRows(snap.series, snap.valor, snap.rpe, restBetweenSetsSec);
        }
      }
      for (const k of Object.keys(next)) {
        if (!syncFromParent[k]) delete next[k];
      }
      return next;
    });
  }, [ejercicios, restBetweenSetsSec, syncFromParent]);

  const pushToParent = useCallback(
    (ej: RoutineFormExercise, rows: MockSetRow[]) => {
      const key = exerciseKey(ej);
      const patch = rowsToExercisePatch(rows);
      onUpdateExercise(key, patch);
    },
    [onUpdateExercise],
  );

  const updateRow = useCallback(
    (ej: RoutineFormExercise, rowIndex: number, patch: Partial<MockSetRow>) => {
      const key = exerciseKey(ej);
      setRowsByKey((prev) => {
        const rows = prev[key] ?? buildMockSetRows(ej.series, ej.valor, ej.rpe, restBetweenSetsSec);
        const updated = reindexMockRows(
          rows.map((r) => (r.index === rowIndex ? { ...r, ...patch } : r)),
        );
        pushToParent(ej, updated);
        return { ...prev, [key]: updated };
      });
    },
    [pushToParent, restBetweenSetsSec],
  );

  const addRow = useCallback(
    (ej: RoutineFormExercise) => {
      const key = exerciseKey(ej);
      setRowsByKey((prev) => {
        const rows = prev[key] ?? buildMockSetRows(ej.series, ej.valor, ej.rpe, restBetweenSetsSec);
        const updated = appendMockSetRow(rows, restBetweenSetsSec);
        pushToParent(ej, updated);
        return { ...prev, [key]: updated };
      });
    },
    [pushToParent, restBetweenSetsSec],
  );

  const removeRow = useCallback(
    (ej: RoutineFormExercise, rowIndex: number) => {
      const key = exerciseKey(ej);
      setRowsByKey((prev) => {
        const rows = prev[key] ?? [];
        if (rows.length <= 1) return prev;
        const updated = reindexMockRows(rows.filter((r) => r.index !== rowIndex));
        pushToParent(ej, updated);
        return { ...prev, [key]: updated };
      });
    },
    [pushToParent],
  );

  const totalSeries = ejercicios.reduce((acc, e) => acc + e.series, 0);
  const tonnage = ejercicios.reduce((acc, ej) => {
    const key = exerciseKey(ej);
    const rows = rowsByKey[key] ?? [];
    return (
      acc +
      rows.reduce((s, r) => s + r.cargaKg * r.reps, 0)
    );
  }, 0);
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
          { label: 'Duración est.', value: `~${estMin} min` },
          { label: 'Modo', value: 'Editable' },
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

      {ejercicios.map((ej, idx) => {
        const key = exerciseKey(ej);
        const rows =
          rowsByKey[key] ?? buildMockSetRows(ej.series, ej.valor, ej.rpe, restBetweenSetsSec);
        const exTonnage = rows.reduce((s, r) => s + r.cargaKg * r.reps, 0);

        return (
          <div key={key} className="fp-card" style={{ padding: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
              <p className="font-sora" style={{ fontSize: 14, fontWeight: 600 }}>
                {String(idx + 1).padStart(2, '0')} {ej.nombre}
              </p>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Tonelaje: {Math.round(exTonnage).toLocaleString('es')} kg
              </span>
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
            <button
              type="button"
              className="fp-btn fp-btn-secondary mt-2"
              style={{ fontSize: 11, gap: 4, padding: '6px 10px' }}
              onClick={() => addRow(ej)}
            >
              <Plus size={14} /> Añadir serie
            </button>
          </div>
        );
      })}
    </div>
  );
};
