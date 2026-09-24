import type { ReactNode } from 'react';
import type { RoutineFormData, RoutineFormLevel } from '../../../types';
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
}

export const RoutineFormPageLayout = ({
  level,
  form,
  savedId,
  presetName,
  isSaving,
  onSaveDraft,
  builder,
}: Props) => (
  <>
    <RoutineCreationMethodTabs />
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
