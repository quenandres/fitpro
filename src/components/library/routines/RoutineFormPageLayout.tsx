import type { ReactNode } from 'react';
import type { RoutineFormData, RoutineFormLevel } from '../../../types';
import type { ClientRoutineCreationEmbed } from '../../../utils/routineCreationEmbed';
import { RoutineCreationLayout } from './RoutineCreationLayout';
import { RoutineCreationMethodTabs } from './RoutineCreationMethodTabs';
import { RoutineBlockParamsPanel } from './RoutineBlockParamsPanel';

interface Props {
  level: RoutineFormLevel;
  form: RoutineFormData;
  savedId?: number | null;
  presetName?: string;
  isSaving?: boolean;
  onSaveDraft?: () => void;
  builder: ReactNode;
  /** Cuando el formulario se embebe (pestaña Entrenamientos del cliente), usa las tabs en modo in-place. */
  embed?: ClientRoutineCreationEmbed;
}

export const RoutineFormPageLayout = ({
  level,
  form,
  savedId,
  presetName,
  isSaving,
  onSaveDraft,
  builder,
  embed,
}: Props) => (
  <>
    <RoutineCreationMethodTabs
      mode={embed ? 'embedded' : 'route'}
      creationContext={embed?.creationContext ?? null}
      embeddedActiveTab={embed?.activeTab}
      inPlace={embed ? { activeTab: embed.activeTab, onTabChange: embed.onTabChange } : undefined}
    />
    <RoutineCreationLayout
      main={builder}
      sidebar={
        <RoutineBlockParamsPanel
          level={level}
          form={form}
          savedId={savedId}
          presetQueued={presetName ?? null}
          onSaveDraft={onSaveDraft}
          isSaving={isSaving}
          showProgressionChart={level !== 'basica'}
        />
      }
    />
  </>
);
