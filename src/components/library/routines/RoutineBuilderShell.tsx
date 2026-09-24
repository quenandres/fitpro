import { ChevronLeft, ChevronRight, FileText, ListChecks, Save, Settings2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { RoutineFormData, RoutineFormLevel } from '../../../types';
import type { ValidationError } from '../../../utils/validators';
import { RoutineReviewStep } from './RoutineReviewStep';
import { RoutinePhaseMetrics } from './RoutinePhaseMetrics';

const STEPS = [
  { id: 1 as const, label: 'Estructura semanal', short: 'Fase 01', Icon: Settings2 },
  { id: 2 as const, label: 'Ejercicios', short: 'Fase 02', Icon: ListChecks },
  { id: 3 as const, label: 'Cargas y descansos', short: 'Fase 03', Icon: FileText },
];

export type BuilderPhase = 1 | 2 | 3;

interface Props {
  level: RoutineFormLevel;
  step: BuilderPhase;
  onStepChange: (step: BuilderPhase) => void;
  form: RoutineFormData;
  isEdit: boolean;
  errors: ValidationError[];
  savedId: number | null;
  isSaving?: boolean;
  saveError?: string | null;
  accent: string;
  onSave: () => void | Promise<void | number | null>;
  onValidatePhase1: () => boolean;
  onValidatePhase2: () => boolean;
  onMusclesResolved?: (updates: Array<{ key: string; musculos_anatomia: string[] }>) => void;
  semanaActiva?: number;
  phase1: ReactNode;
  phase2: ReactNode;
  phase3: ReactNode;
}

export const RoutineBuilderShell = ({
  level,
  step,
  onStepChange,
  form,
  isEdit,
  errors,
  savedId,
  isSaving,
  saveError,
  accent,
  onSave,
  onValidatePhase1,
  onValidatePhase2,
  onMusclesResolved,
  semanaActiva = 1,
  phase1,
  phase2,
  phase3,
}: Props) => {
  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

  const handleNextFrom1 = () => {
    if (onValidatePhase1()) onStepChange(2);
  };

  const handleNextFrom2 = () => {
    if (onValidatePhase2()) onStepChange(3);
  };

  const phaseContent = step === 1 ? phase1 : step === 2 ? phase2 : phase3;

  const phaseStatus = (id: BuilderPhase): string => {
    if (step > id) return 'Completado';
    if (step === id) return 'En curso';
    return 'Pendiente';
  };

  return (
    <div>
      <RoutinePhaseMetrics
        metrics={[
          { label: 'Microciclo', value: `Sem ${semanaActiva}/${form.semanas}` },
          {
            label: 'Precisión',
            value: level === 'avanzada' ? 'RPE / RIR' : level === 'intermedia' ? 'Descanso' : 'Series × reps',
          },
          { label: 'Sincronización', value: 'Activa', hint: 'Biblioteca local' },
        ]}
      />

      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            height: 3,
            borderRadius: 2,
            background: 'var(--border-subtle)',
            overflow: 'hidden',
            marginBottom: 12,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: accent,
              transition: 'width .3s ease',
              borderRadius: 2,
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
          {STEPS.map(({ id, label, short, Icon }) => {
            const active = step === id;
            const done = step > id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  if (id < step) onStepChange(id);
                  if (id === 2 && step === 1 && onValidatePhase1()) onStepChange(2);
                  if (id === 3 && step <= 2) {
                    if (step === 1 && !onValidatePhase1()) return;
                    if (!onValidatePhase2()) return;
                    onStepChange(3);
                  }
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  background: 'none',
                  border: 'none',
                  cursor: id <= step ? 'pointer' : 'default',
                  padding: 0,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: done || active ? `${accent}22` : 'var(--bg-overlay)',
                    border: `1px solid ${active || done ? accent : 'var(--border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={14} color={active || done ? accent : 'var(--text-muted)'} />
                </div>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: active ? accent : 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '.04em',
                  }}
                >
                  {short}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  {label}
                </span>
                <span
                  className="badge"
                  style={{
                    fontSize: 8,
                    padding: '1px 6px',
                    marginTop: 2,
                    background:
                      step > id
                        ? 'var(--brand-dim)'
                        : step === id
                          ? 'color-mix(in srgb, var(--accent-purple) 20%, transparent)'
                          : 'var(--bg-overlay)',
                    color: step > id ? 'var(--brand)' : step === id ? 'var(--accent-purple)' : 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {phaseStatus(id)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{phaseContent}</div>

      {errors.length > 0 && step >= 2 && (
        <p style={{ fontSize: 12, color: 'var(--accent-red)', marginTop: 10 }}>
          Revisa los campos marcados antes de continuar.
        </p>
      )}

      {step === 3 ? (
        <RoutineReviewStep
          form={form}
          isEdit={isEdit}
          onMusclesResolved={onMusclesResolved}
        />
      ) : null}

      <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
        {step === 1 ? (
          <button
            type="button"
            className="fp-btn fp-btn-primary"
            style={{ width: '100%', justifyContent: 'center', gap: 7 }}
            onClick={handleNextFrom1}
          >
            Siguiente: ejercicios <ChevronRight size={14} />
          </button>
        ) : null}

        {step === 2 ? (
          <>
            <button
              type="button"
              className="fp-btn fp-btn-secondary"
              style={{ width: '100%', justifyContent: 'center', gap: 7 }}
              onClick={() => onStepChange(1)}
            >
              <ChevronLeft size={14} /> Estructura semanal
            </button>
            <button
              type="button"
              className="fp-btn fp-btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: 7 }}
              onClick={handleNextFrom2}
            >
              Siguiente: cargas y descansos <ChevronRight size={14} />
            </button>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <button
              type="button"
              className="fp-btn fp-btn-secondary"
              style={{ width: '100%', justifyContent: 'center', gap: 7 }}
              onClick={() => onStepChange(2)}
            >
              <ChevronLeft size={14} /> Volver a ejercicios
            </button>
            <button
              type="button"
              className="fp-btn fp-btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: 7 }}
              onClick={() => void onSave()}
              disabled={isSaving}
            >
              <Save size={14} /> {isSaving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear rutina'}
            </button>
            {saveError ? (
              <p role="alert" style={{ fontSize: 12, color: 'var(--accent-red)', textAlign: 'center', margin: 0 }}>
                {saveError}
              </p>
            ) : null}
          </>
        ) : null}

        {savedId !== null && step === 3 && (
          <p
            style={{
              fontSize: 12,
              color: 'var(--brand)',
              textAlign: 'center',
              padding: '8px 10px',
              borderRadius: 9,
              background: 'var(--brand-dim)',
            }}
          >
            Rutina guardada en tu biblioteca. Asígnala a un cliente desde Entrenamientos.
          </p>
        )}
      </div>
    </div>
  );
};
