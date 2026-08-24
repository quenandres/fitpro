import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRoutineFormWithPreset } from '../../../hooks/useRoutineFormWithPreset';
import { CalculatedDurationField } from '../../../components/library/routines/CalculatedDurationField';
import { ExerciseListEditor } from '../../../components/library/routines/ExerciseListEditor';
import { RoutineBuilderShell } from '../../../components/library/routines/RoutineBuilderShell';
import { FormField, LEVEL_ACCENTS, RoutineFormShell } from '../../../components/library/routines/RoutineFormShell';
import { categoryOptions, restOptions } from '../../../utils/validators';
import { getFieldError } from '../../../utils/routineFormValidators';

export const IntermediateRoutineForm = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const {
    form,
    errors,
    savedId,
    presetName,
    matchInfo,
    isEdit,
    setField,
    addExercise,
    updateExercise,
    removeExercise,
    createSuperset,
    removeSuperset,
    mergeResolvedMuscles,
    save,
    validateStep1,
    selectedNames,
    durationBreakdown,
  } = useRoutineFormWithPreset('intermedia');

  const accent = LEVEL_ACCENTS.intermedia;

  return (
    <RoutineFormShell
      level="intermedia"
      errors={errors}
      presetName={presetName}
      matchInfo={matchInfo}
      isEdit={isEdit}
      hideActions
    >
      <RoutineBuilderShell
        level="intermedia"
        step={step}
        onStepChange={setStep}
        form={form}
        isEdit={isEdit}
        errors={errors}
        savedId={savedId}
        accent={accent}
        onSave={save}
        onValidateStep1={validateStep1}
        onMusclesResolved={mergeResolvedMuscles}
      >
        <FormField label="Nombre de la rutina" required error={getFieldError(errors, 'nombre')}>
          <input
            className="fp-input"
            placeholder="Ej: Fuerza tren superior"
            value={form.nombre}
            onChange={(e) => setField('nombre', e.target.value)}
          />
        </FormField>

        <FormField label="Categoría" required error={getFieldError(errors, 'categoria')}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {categoryOptions.map((cat) => {
              const sel = form.categoria === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setField('categoria', cat.value)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 10,
                    border: `1px solid ${sel ? 'rgba(88,166,255,.4)' : 'var(--border)'}`,
                    background: sel ? 'rgba(88,166,255,.12)' : 'var(--bg-elevated)',
                    cursor: 'pointer',
                    fontSize: 10,
                    fontWeight: 600,
                    color: sel ? accent : 'var(--text-muted)',
                  }}
                >
                  {cat.icon} {cat.value}
                </button>
              );
            })}
          </div>
        </FormField>

        <FormField label="Descripción" error={getFieldError(errors, 'descripcion')}>
          <textarea
            className="fp-input"
            rows={3}
            placeholder="Objetivo, enfoque, recomendaciones…"
            value={form.descripcion}
            onChange={(e) => setField('descripcion', e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </FormField>

        <FormField label="Descanso entre series" error={getFieldError(errors, 'rest_between_sets')}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {restOptions.map((r) => {
              const sel = form.rest_between_sets === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setField('rest_between_sets', r.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 100,
                    border: `1px solid ${sel ? 'rgba(88,166,255,.4)' : 'var(--border)'}`,
                    background: sel ? 'rgba(88,166,255,.12)' : 'var(--bg-elevated)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: sel ? accent : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </FormField>

        <FormField label="Notas" error={getFieldError(errors, 'notes')}>
          <textarea
            className="fp-input"
            rows={2}
            placeholder="Advertencias, variantes, progresión…"
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </FormField>

        <ExerciseListEditor
          level="intermedia"
          ejercicios={form.ejercicios}
          errors={errors}
          selectedNames={selectedNames}
          restBetweenSetsSec={form.rest_between_sets}
          onAdd={addExercise}
          onUpdate={updateExercise}
          onRemove={removeExercise}
          onCreateSuperset={createSuperset}
          onRemoveSuperset={removeSuperset}
        />

        <FormField label="Duración total (min)" error={getFieldError(errors, 'duracion_min')}>
          <CalculatedDurationField breakdown={durationBreakdown} accent={accent} />
        </FormField>
      </RoutineBuilderShell>

      {savedId !== null && step === 2 && (
        <Link
          to="/library/rutinas"
          className="fp-btn fp-btn-secondary"
          style={{ width: '100%', justifyContent: 'center', gap: 7, marginTop: 8, textDecoration: 'none' }}
        >
          Ver mis rutinas
        </Link>
      )}
    </RoutineFormShell>
  );
};
