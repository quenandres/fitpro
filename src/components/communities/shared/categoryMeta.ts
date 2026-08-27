import {
  Activity,
  Apple,
  Bike,
  Dumbbell,
  Footprints,
  PersonStanding,
  Weight,
} from 'lucide-react';
import type { CategoriaComunidad } from '../../../types/community';

export const CATEGORY_META: Record<CategoriaComunidad, { label: string; icon: typeof Dumbbell }> = {
  crossfit: { label: 'CrossFit', icon: Dumbbell },
  running: { label: 'Running', icon: Footprints },
  fuerza: { label: 'Fuerza', icon: Weight },
  yoga: { label: 'Yoga', icon: PersonStanding },
  nutricion: { label: 'Nutrición', icon: Apple },
  ciclismo: { label: 'Ciclismo', icon: Bike },
  calistenia: { label: 'Calistenia', icon: Activity },
};

export const CATEGORY_LIST = Object.entries(CATEGORY_META) as Array<
  [CategoriaComunidad, (typeof CATEGORY_META)[CategoriaComunidad]]
>;
