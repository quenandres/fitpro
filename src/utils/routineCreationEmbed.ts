import type { RoutineFormLevel } from '../types';
import type { RoutineCreationContext } from './routineCreationContext';
import type { RoutineCreationTabId } from '../components/library/routines/RoutineCreationMethodTabs';
import type { RoutinePresetLocationState } from '../hooks/useRoutineFormWithPreset';

export type ClientRoutineCreationStep = 'hub' | 'plantillas' | 'paso' | 'ia';

export type RoutineCreationMethodId = 'plantillas' | 'paso' | 'ia';

export interface ClientRoutineCreationEmbed {
  creationContext: RoutineCreationContext;
  activeTab: RoutineCreationTabId;
  onTabChange: (tab: RoutineCreationTabId) => void;
  onBackToHub: () => void;
  onRoutineSaved: (rutinaId: number) => void;
  onContinueToConstructor: (payload: {
    level: RoutineFormLevel;
    presetState: RoutinePresetLocationState;
  }) => void;
}

export interface RoutineFormPageProps {
  embed?: ClientRoutineCreationEmbed;
  presetState?: RoutinePresetLocationState | null;
}

export function stepToTab(step: ClientRoutineCreationStep): RoutineCreationTabId {
  if (step === 'hub') return 'hub';
  return step;
}

export function tabToStep(tab: RoutineCreationTabId): ClientRoutineCreationStep {
  if (tab === 'hub') return 'hub';
  if (tab === 'plantillas' || tab === 'paso' || tab === 'ia') return tab;
  return 'hub';
}

export function methodToStep(method: RoutineCreationMethodId): ClientRoutineCreationStep {
  return method;
}
