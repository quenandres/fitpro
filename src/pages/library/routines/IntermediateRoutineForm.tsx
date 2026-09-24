import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SelfTrainingRedirect } from '../../../components/training/SelfTrainingRedirect';
import { useRoutineFormWithPreset } from '../../../hooks/useRoutineFormWithPreset';
import { CalculatedDurationField } from '../../../components/library/routines/CalculatedDurationField';
import { ExerciseListEditor } from '../../../components/library/routines/ExerciseListEditor';
import { RoutineBuilderShell } from '../../../components/library/routines/RoutineBuilderShell';
import { RoutineScheduleSection } from '../../../components/library/routines/RoutineScheduleSection';
import { FormField, LEVEL_ACCENTS, RoutineFormShell } from '../../../components/library/routines/RoutineFormShell';
import { RoutineFormPageLayout } from '../../../components/library/routines/RoutineFormPageLayout';
import { categoryOptions, restOptions } from '../../../utils/validators';
import { getFieldError } from '../../../utils/routineFormValidators';
import { ROUTES } from '../../../routes/paths';

export const IntermediateRoutineForm = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const formHook = useRoutineFormWithPreset('intermedia');
  const {
    form,
    errors,
    savedId,
    isSaving,
    saveError,
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
    validatePhase1,
    validatePhase2,
    selectedExerciseIds,
    durationBreakdown,
    semanaActiva,
  } = formHook;

  const accent = LEVEL_ACCENTS.intermedia;

  if (searchParams.get('para') === 'mi') return <SelfTrainingRedirect />;

  const scheduleProps = { accent, schedule: formHook };

  return (
    <RoutineFormShell
      level="intermedia"
      errors={errors}
      presetName={presetName}
      matchInfo={matchInfo}
      isEdit={isEdit}
      hideActions
    >
      <RoutineFormPageLayout
        level="intermedia"
        form={form}
        savedId={savedId}
        presetName={presetName}
        isSaving={isSaving}
        onSaveDraft={save}
        builder={
          <RoutineBuilderShell
            level="intermedia"
            step={step}
            onStepChange={setStep}
            form={form}
            isEdit={isEdit}
            errors={errors}
            savedId={savedId}
            isSaving={isSaving}
            saveError={saveError}
            accent={accent}
            onSave={save}
            onValidatePhase1={validatePhase1}
            onValidatePhase2={validatePhase2}
            onMusclesResolved={mergeResolvedMuscles}
            semanaActiva={semanaActiva}
            phase1={
              <>
                <FormField label="Nombre de la rutina" required error={getFieldError(errors, 'nombre')}>
                  <input
                    className="fp-input"
                    placeholder="Ej: Fuerza tren superior"
                    value={form.nombre}
                    onChange={(e) => setField('nombre', e.target.value)}
                  />
                </FormField>
                <FormField label="Categoría" required error={getFieldError(errors, 'categoria')}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {categoryOptions.map((cat) => {
                      const sel = form.categoria === cat.value;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setField('categoria', cat.value)}
                          className="rounded-[10px] cursor-pointer text-xs font-semibold py-2 px-1"
                          style={{
                            border: `1px solid ${sel ? 'rgba(88,166,255,.4)' : 'var(--border)'}`,
                            background: sel ? 'rgba(88,166,255,.12)' : 'var(--bg-elevated)',
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
                <RoutineScheduleSection {...scheduleProps} studioLayout>
                  {null}
                </RoutineScheduleSection>
              </>
            }
            phase2={
              <RoutineScheduleSection {...scheduleProps} studioLayout>
                <ExerciseListEditor
                  level="intermedia"
                  displayMode="studio"
                  ejercicios={form.ejercicios}
                  errors={errors}
                  selectedExerciseIds={selectedExerciseIds}
                  restBetweenSetsSec={form.rest_between_sets}
                  onAdd={addExercise}
                  onUpdate={updateExercise}
                  onRemove={removeExercise}
                  onCreateSuperset={createSuperset}
                  onRemoveSuperset={removeSuperset}
                />
              </RoutineScheduleSection>
            }
            phase3={
              <>
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
                <FormField label="Duración del día (min)" error={getFieldError(errors, 'duracion_min')}>
                  <CalculatedDurationField breakdown={durationBreakdown} accent={accent} />
                </FormField>
              </>
            }
          />
        }
      />

      {savedId !== null && step === 3 && (
        <Link
          to={ROUTES.library.rutinas}
          className="fp-btn fp-btn-secondary"
          style={{ width: '100%', justifyContent: 'center', gap: 7, marginTop: 8, textDecoration: 'none' }}
        >
          Ver mis rutinas
        </Link>
      )}
    </RoutineFormShell>
  );
};
