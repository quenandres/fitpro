import { ChevronLeft, ChevronRight, FileText, ListChecks, Save } from 'lucide-react';
import type { ReactNode } from 'react';
import type { RoutineFormData, RoutineFormLevel } from '../../../types';
import type { ValidationError } from '../../../utils/validators';
import { RoutineReviewStep } from './RoutineReviewStep';

const STEPS = [
  { id: 1, label: 'Editar', Icon: ListChecks },
  { id: 2, label: 'Revisar', Icon: FileText },
] as const;

interface Props {
  level: RoutineFormLevel;
  step: 1 | 2;
  onStepChange: (step: 1 | 2) => void;
  form: RoutineFormData;
  isEdit: boolean;
  errors: ValidationError[];
  savedId: string | null;
  accent: string;
  onSave: () => void;
  onValidateStep1: () => boolean;
  onMusclesResolved?: (updates: Array<{ key: string; musculos_anatomia: string[] }>) => void;
  children: ReactNode;
}

export const RoutineBuilderShell = ({
  step,
  onStepChange,
  form,
  isEdit,
  errors,
  savedId,
  accent,
  onSave,
  onValidateStep1,
  onMusclesResolved,
  children,
}: Props) => {
  const progress = step === 1 ? 50 : 100;

  const handleNext = () => {
    if (onValidateStep1()) onStepChange(2);
  };

  return (
    <div>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          {STEPS.map(({ id, label, Icon }) => {
            const active = step === id;
            const done = step > id;
            return (
              <div
                key={id}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
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
                    fontSize: 10,
                    fontWeight: 600,
                    color: active ? accent : 'var(--text-muted)',
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {step === 1 ? children : (
        <RoutineReviewStep
          form={form}
          isEdit={isEdit}
          onMusclesResolved={onMusclesResolved}
        />
      )}

      {errors.length > 0 && step === 2 && (
        <p style={{ fontSize: 12, color: 'var(--accent-red)', marginTop: 10 }}>
          Revisa los campos marcados antes de guardar.
        </p>
      )}

      <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
        {step === 1 ? (
          <button
            type="button"
            className="fp-btn fp-btn-primary"
            style={{ width: '100%', justifyContent: 'center', gap: 7 }}
            onClick={handleNext}
          >
            Siguiente: Revisar <ChevronRight size={14} />
          </button>
        ) : (
          <>
            <button
              type="button"
              className="fp-btn fp-btn-secondary"
              style={{ width: '100%', justifyContent: 'center', gap: 7 }}
              onClick={() => onStepChange(1)}
            >
              <ChevronLeft size={14} /> Volver a editar
            </button>
            <button
              type="button"
              className="fp-btn fp-btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: 7 }}
              onClick={onSave}
            >
              <Save size={14} /> {isEdit ? 'Guardar cambios' : 'Crear rutina'}
            </button>
          </>
        )}

        {savedId !== null && step === 2 && (
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
            Rutina guardada. Puedes verla en Admin → Rutinas.
          </p>
        )}
      </div>
    </div>
  );
};
