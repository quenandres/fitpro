import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SelfTrainingRedirect } from '../../../components/training/SelfTrainingRedirect';
import { useRoutineFormWithPreset } from '../../../hooks/useRoutineFormWithPreset';
import { CalculatedDurationField } from '../../../components/library/routines/CalculatedDurationField';
import { ExerciseListEditor } from '../../../components/library/routines/ExerciseListEditor';
import { RoutineBuilderShell } from '../../../components/library/routines/RoutineBuilderShell';
import { RoutineScheduleSection } from '../../../components/library/routines/RoutineScheduleSection';
import { FormField, LEVEL_ACCENTS, RoutineFormShell } from '../../../components/library/routines/RoutineFormShell';
import { RoutineTemplateMetaFields } from '../../../components/library/routines/RoutineTemplateMetaFields';
import { RoutineFormPageLayout } from '../../../components/library/routines/RoutineFormPageLayout';
import { getFieldError } from '../../../utils/routineFormValidators';
import { ROUTES } from '../../../routes/paths';
import { useUsuariosStore } from '../../../store/useUsuariosStore';
import {
  buildRoutineCreationReturnUrl,
  forwardRoutineCreationContext,
  parseRoutineCreationContext,
} from '../../../utils/routineCreationContext';
import type { RoutineFormPageProps } from '../../../utils/routineCreationEmbed';

export const BasicRoutineForm = ({ embed, presetState = null }: RoutineFormPageProps = {}) => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const formHook = useRoutineFormWithPreset('basica', embed ? presetState : undefined);
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
    navigate,
    isPlantillaMode,
    plantillaMeta,
    setPlantillaMeta,
  } = formHook;

  const accent = LEVEL_ACCENTS.basica;
  const creationCtx = embed?.creationContext ?? parseRoutineCreationContext(searchParams);
  const clienteObjetivo = useUsuariosStore((s) =>
    creationCtx ? s.usuarios.find((u) => u.id === creationCtx.usuarioId) : undefined,
  );

  if (!embed && searchParams.get('para') === 'mi') return <SelfTrainingRedirect />;

  const scheduleProps = { accent, schedule: formHook };

  const handleSave = async () => {
    const id = await save();
    if (id == null) return id;
    if (isPlantillaMode) {
      navigate(ROUTES.library.rutinasPlantillas);
      return id;
    }
    if (creationCtx) {
      if (embed) embed.onRoutineSaved(id);
      else navigate(buildRoutineCreationReturnUrl(creationCtx, id));
    }
    return id;
  };

  return (
    <RoutineFormShell
      level="basica"
      errors={errors}
      presetName={presetName}
      matchInfo={matchInfo}
      isEdit={isEdit}
      isPlantillaMode={isPlantillaMode}
      hideActions
      backOnClick={embed ? embed.onBackToHub : undefined}
      backTo={embed ? undefined : forwardRoutineCreationContext(ROUTES.library.rutinasNueva, searchParams)}
      contextBadge={
        clienteObjetivo ? (
          <span className="badge badge-brand" style={{ fontSize: 10, padding: '3px 8px' }}>
            Para {clienteObjetivo.nombre}
          </span>
        ) : null
      }
    >
      <RoutineFormPageLayout
        level="basica"
        form={form}
        savedId={savedId}
        presetName={presetName}
        isSaving={isSaving}
        onSaveDraft={save}
        embed={embed}
        builder={
          <RoutineBuilderShell
            level="basica"
            step={step}
            onStepChange={setStep}
            form={form}
            isEdit={isEdit}
            errors={errors}
            savedId={savedId}
            isSaving={isSaving}
            saveError={saveError}
            accent={accent}
            onSave={handleSave}
            onValidatePhase1={validatePhase1}
            onValidatePhase2={validatePhase2}
            onMusclesResolved={mergeResolvedMuscles}
            semanaActiva={semanaActiva}
            estado={form.estado}
            onEstadoChange={(v) => setField('estado', v)}
            phase1={
              <>
                <FormField label="Nombre de la rutina" required error={getFieldError(errors, 'nombre')}>
                  <input
                    className="fp-input"
                    placeholder="Ej: Full body principiante"
                    value={form.nombre}
                    onChange={(e) => setField('nombre', e.target.value)}
                  />
                </FormField>
                <RoutineScheduleSection {...scheduleProps} studioLayout>
                  {null}
                </RoutineScheduleSection>
                {isPlantillaMode ? (
                  <RoutineTemplateMetaFields
                    value={plantillaMeta}
                    level="basica"
                    accent={accent}
                    onChange={setPlantillaMeta}
                  />
                ) : null}
              </>
            }
            phase2={
              <RoutineScheduleSection {...scheduleProps} studioLayout>
                <ExerciseListEditor
                  level="basica"
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
              <FormField label="Duración del día (min)">
                <CalculatedDurationField breakdown={durationBreakdown} accent={accent} />
              </FormField>
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
