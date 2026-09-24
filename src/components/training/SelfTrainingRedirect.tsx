import { useEffect } from 'react';
import { useSelfTrainingNavigate } from '../../hooks/useSelfTrainingNavigate';

export function SelfTrainingRedirect() {
  const { goToSelfTraining, isPending } = useSelfTrainingNavigate();

  useEffect(() => {
    void goToSelfTraining();
  }, [goToSelfTraining]);

  return (
    <p
      className="text-sm animate-slide-up"
      style={{ color: 'var(--text-secondary)', padding: '24px 0' }}
      aria-live="polite"
    >
      {isPending ? 'Abriendo tu plan de entrenamiento…' : 'Redirigiendo…'}
    </p>
  );
}
