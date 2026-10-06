import { useCallback, useMemo, useState } from 'react';
import type { Rutina, RoutineFormLevel, Usuario } from '../../types';
import type { usePlanMutations } from '../../hooks/usePlanMutations';
import type { RoutineCreationContext } from '../../utils/routineCreationContext';
import type { RoutinePresetLocationState } from '../../hooks/useRoutineFormWithPreset';
import {
  stepToTab,
  tabToStep,
  type ClientRoutineCreationEmbed,
  type ClientRoutineCreationStep,
} from '../../utils/routineCreationEmbed';
import { RoutineCreationChooserView } from '../library/routines/RoutineCreationChooserView';
import { RoutinePresetGallery } from '../../pages/library/RoutinePresetGalleryPage';
import { AIRoutineChat } from '../../pages/library/AIRoutineChatPage';
import { ClientEmbeddedRoutineForm } from './ClientEmbeddedRoutineForm';
import { UserCurrentRoutineCard } from './UserCurrentRoutineCard';
import { UserTrainingHistorySummary } from './UserTrainingHistorySummary';
import { ReplaceRoutineSheet } from './ReplaceRoutineSheet';
import { planHasConfiguredSessions } from '../../utils/guidedPlanUtils';
import { useToastHook } from '../common/Toast';

type Mutations = ReturnType<typeof usePlanMutations>;

interface Props {
  user: Usuario;
  rutinas: Rutina[];
  semana: number;
  mutations: Mutations;
  onGoToHistorial?: () => void;
  /** Rutina recién creada en la biblioteca (retorno de ?rutinaCreada=) pendiente de confirmar transición. */
  pendingLibraryRutina?: Rutina | null;
  onPendingLibraryRutinaHandled?: () => void;
}

export function UserEntrenamientosCreationPanel({
  user,
  rutinas,
  semana,
  mutations,
  onGoToHistorial,
  pendingLibraryRutina,
  onPendingLibraryRutinaHandled,
}: Props) {
  const toast = useToastHook();
  const [step, setStep] = useState<ClientRoutineCreationStep>('hub');
  const [pasoLevel, setPasoLevel] = useState<RoutineFormLevel>('intermedia');
  const [presetState, setPresetState] = useState<RoutinePresetLocationState | null>(null);
  const [pendingRutina, setPendingRutina] = useState<Rutina | null>(null);

  const context: RoutineCreationContext = useMemo(
    () => ({ usuarioId: user.id, semana, sesionIndex: 0 }),
    [user.id, semana],
  );

  const tieneRutina = planHasConfiguredSessions(user.plan);

  const requestAssign = useCallback(
    (rutinaId: number) => {
      const rutina = rutinas.find((r) => r.id === rutinaId);
      if (!rutina) return;
      if (!tieneRutina) {
        mutations.reemplazarRutina(rutina, 'reiniciar');
        toast.success('Rutina asignada', `${rutina.nombre} se asignó a ${user.nombre}.`);
        setStep('hub');
        setPresetState(null);
        return;
      }
      setPendingRutina(rutina);
    },
    [mutations, rutinas, tieneRutina, toast, user.nombre],
  );

  const embed: ClientRoutineCreationEmbed = useMemo(
    () => ({
      creationContext: context,
      activeTab: stepToTab(step),
      onTabChange: (tab) => {
        const next = tabToStep(tab);
        if (next === 'paso') {
          setPresetState(null);
          setPasoLevel('intermedia');
        }
        setStep(next);
      },
      onBackToHub: () => {
        setStep('hub');
        setPresetState(null);
      },
      onRoutineSaved: (rutinaId) => {
        requestAssign(rutinaId);
        setStep('hub');
        setPresetState(null);
      },
      onContinueToConstructor: ({ level, presetState: nextPresetState }) => {
        setPasoLevel(level);
        setPresetState(nextPresetState);
        setStep('paso');
      },
    }),
    [context, requestAssign, step],
  );

  const shellClass = 'max-w-5xl mx-auto w-full min-w-0';

  if (step === 'plantillas') {
    return (
      <div className={shellClass}>
        <RoutinePresetGallery embed={embed} />
      </div>
    );
  }

  if (step === 'paso') {
    return (
      <div className={shellClass}>
        <ClientEmbeddedRoutineForm level={pasoLevel} embed={embed} presetState={presetState} />
      </div>
    );
  }

  if (step === 'ia') {
    return (
      <div className={shellClass}>
        <AIRoutineChat embed={embed} />
      </div>
    );
  }

  const rutinaParaSheet = pendingLibraryRutina ?? pendingRutina;

  return (
    <div className={shellClass}>
      <UserCurrentRoutineCard user={user} rutinas={rutinas} onCancelarCola={mutations.cancelarRutinaEnCola} />
      {onGoToHistorial ? <UserTrainingHistorySummary user={user} onGoToHistorial={onGoToHistorial} /> : null}
      <RoutineCreationChooserView
        variant="library"
        context={context}
        clienteNombre={user.nombre}
        semana={semana}
        showDrafts
        onAssignDraft={requestAssign}
        inPlace={{
          activeTab: 'hub',
          onTabChange: embed.onTabChange,
          onSelectMethod: (method) => setStep(method),
        }}
      />

      <ReplaceRoutineSheet
        open={rutinaParaSheet != null}
        plan={user.plan}
        rutina={rutinaParaSheet}
        onClose={() => {
          setPendingRutina(null);
          onPendingLibraryRutinaHandled?.();
        }}
        onConfirm={(rutina, modo) => {
          mutations.reemplazarRutina(rutina, modo);
          toast.success(
            modo === 'reiniciar' ? 'Rutina reiniciada' : 'Rutina retomada',
            `${rutina.nombre} se asignó a ${user.nombre}.`,
          );
        }}
        onProgramar={(rutina, activarEn) => {
          mutations.programarRutinaEnCola(rutina, activarEn);
          toast.success('Rutina programada', `${rutina.nombre} se activará el ${activarEn}.`);
        }}
      />
    </div>
  );
}
