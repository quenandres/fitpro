import { useEffect } from 'react';
import { loadDemoTrainingData } from '../demo/loadDemoTrainingData';

export function useMockTrainingHydrate() {
  useEffect(() => {
    loadDemoTrainingData();
  }, []);
}
