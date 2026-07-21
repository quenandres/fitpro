import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRoutineFormWithPreset } from '../../../hooks/useRoutineFormWithPreset';
import { CalculatedDurationField } from '../../../components/library/routines/CalculatedDurationField';
import { ExerciseListEditor } from '../../../components/library/routines/ExerciseListEditor';
import { RoutineBuilderShell } from '../../../components/library/routines/RoutineBuilderShell';
import { FormField, LEVEL_ACCENTS, RoutineFormShell } from '../../../components/library/routines/RoutineFormShell';
import { getFieldError } from '../../../utils/routineFormValidators';

export const BasicRoutineForm = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const {
    form,
    errors,
    savedId,
    presetName,
    matchInfo,
    fromAdmin,
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
  } = useRoutineFormWithPreset('basica');

  const accent = LEVEL_ACCENTS.basica;

  return (
    <RoutineFormShell
      level="basica"
      errors={errors}
      presetName={presetName}
      matchInfo={matchInfo}
      fromAdmin={fromAdmin}
      isEdit={isEdit}
      hideActions
    >
      <RoutineBuilderShell
        level="basica"
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
            placeholder="Ej: Full body principiante"
            value={form.nombre}
            onChange={(e) => setField('nombre', e.target.value)}
          />
        </FormField>

        <ExerciseListEditor
          level="basica"
          ejercicios={form.ejercicios}
          errors={errors}
          selectedNames={selectedNames}
          onAdd={addExercise}
          onUpdate={updateExercise}
          onRemove={removeExercise}
          onCreateSuperset={createSuperset}
          onRemoveSuperset={removeSuperset}
        />

        <FormField label="Duración total (min)">
          <CalculatedDurationField breakdown={durationBreakdown} accent={accent} />
        </FormField>
      </RoutineBuilderShell>

      {savedId !== null && step === 2 && (
        <Link
          to="/admin"
          className="fp-btn fp-btn-secondary"
          style={{ width: '100%', justifyContent: 'center', gap: 7, marginTop: 8, textDecoration: 'none' }}
        >
          Ver en Admin
        </Link>
      )}
    </RoutineFormShell>
  );
};
