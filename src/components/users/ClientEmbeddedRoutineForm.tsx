import type { RoutineFormLevel } from '../../types';
import type { RoutinePresetLocationState } from '../../hooks/useRoutineFormWithPreset';
import type { ClientRoutineCreationEmbed, RoutineFormPageProps } from '../../utils/routineCreationEmbed';

export type { RoutineFormPageProps };
import { BasicRoutineForm } from '../../pages/library/routines/BasicRoutineForm';
import { IntermediateRoutineForm } from '../../pages/library/routines/IntermediateRoutineForm';
import { AdvancedRoutineForm } from '../../pages/library/routines/AdvancedRoutineForm';

interface Props {
  level: RoutineFormLevel;
  embed: ClientRoutineCreationEmbed;
  presetState?: RoutinePresetLocationState | null;
}

/** Las 3 fases del constructor, embebidas en la pestaña Entrenamientos. La barra de
 * métodos la pinta `RoutineFormPageLayout` (recibe `embed`) — no se duplica aquí. */
export function ClientEmbeddedRoutineForm({ level, embed, presetState }: Props) {
  const formProps: RoutineFormPageProps = { embed, presetState: presetState ?? null };

  return (
    <div>
      {level === 'basica' ? <BasicRoutineForm {...formProps} /> : null}
      {level === 'intermedia' ? <IntermediateRoutineForm {...formProps} /> : null}
      {level === 'avanzada' ? <AdvancedRoutineForm {...formProps} /> : null}
    </div>
  );
}
