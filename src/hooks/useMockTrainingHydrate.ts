import { useEffect } from 'react';
import { seedDemoMedidas } from '../demo/demoMedidasSeed';
import { loadDemoTrainingData } from '../demo/loadDemoTrainingData';
import { useMedidasStore } from '../store/useMedidasStore';

function applyDemoTraining() {
  loadDemoTrainingData();
  seedDemoMedidas();
}

export function useMockTrainingHydrate() {
  useEffect(() => {
    applyDemoTraining();

    if (useMedidasStore.persist.hasHydrated()) return;

    return useMedidasStore.persist.onFinishHydration(() => {
      seedDemoMedidas();
    });
  }, []);
}
