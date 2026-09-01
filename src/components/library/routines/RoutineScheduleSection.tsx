import type { ReactNode } from 'react';
import type { RoutineCreateMode, Rutina } from '../../../types';
import { RoutineCreateModeTabs } from './RoutineCreateModeTabs';
import { RoutineTemplatePicker } from './RoutineTemplatePicker';
import { RoutineWeekDayNav } from './RoutineWeekDayNav';

interface ScheduleHookSlice {
  form: { semanas: number };
  createMode: RoutineCreateMode;
  setCreateMode: (mode: RoutineCreateMode) => void;
  semanaActiva: number;
  setSemanaActiva: (semana: number) => void;
  diaIndex: number;
  setDiaActivo: (index: number) => void;
  templateApplied: boolean;
  modeSwitchNotice: string | null;
  activeSemanaPlan?: import('../../../types').RoutineFormSemana;
  setSemanas: (n: number) => void;
  applyToAllWeeks: () => void;
  copyWeekFrom: (origen: number) => void;
  applyTemplate: (source: Rutina | import('../../../types').RoutineFormData, n: number) => void;
  editingId?: string | null;
}

interface Props {
  accent: string;
  schedule: ScheduleHookSlice;
  children: ReactNode;
}

export const RoutineScheduleSection = ({ accent, schedule, children }: Props) => {
  const {
    form,
    createMode,
    setCreateMode,
    semanaActiva,
    setSemanaActiva,
    diaIndex,
    setDiaActivo,
    templateApplied,
    modeSwitchNotice,
    activeSemanaPlan,
    setSemanas,
    applyToAllWeeks,
    copyWeekFrom,
    applyTemplate,
    editingId,
  } = schedule;

  const showTemplatePicker = createMode === 'desde_plantilla' && !templateApplied;
  const showEditor = createMode !== 'desde_plantilla' || templateApplied;

  return (
    <>
      <RoutineCreateModeTabs
        mode={createMode}
        onChange={setCreateMode}
        accent={accent}
        notice={modeSwitchNotice}
      />

      {showTemplatePicker ? (
        <RoutineTemplatePicker
          accent={accent}
          excludeId={editingId}
          onApply={(source, n) => applyTemplate(source, n)}
        />
      ) : null}

      {showEditor ? (
        <>
          <RoutineWeekDayNav
            semanas={form.semanas}
            semanaActiva={semanaActiva}
            diaIndex={diaIndex}
            activeSemanaPlan={activeSemanaPlan}
            createMode={createMode}
            accent={accent}
            onSemanasChange={setSemanas}
            onSemanaChange={setSemanaActiva}
            onDiaChange={setDiaActivo}
            onApplyToAll={applyToAllWeeks}
            onCopyWeekFrom={copyWeekFrom}
          />
          {children}
        </>
      ) : null}
    </>
  );
};
