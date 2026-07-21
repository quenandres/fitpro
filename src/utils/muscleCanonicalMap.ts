import { MUSCLE_CANONICAL } from '../components/anatomy/anatomy.canonicalMap';

/** Nombres canónicos válidos para el heatmap (valores del mapa anatómico). */
export const ANATOMY_CANONICAL_NAMES = [
  ...new Set(Object.values(MUSCLE_CANONICAL)),
] as string[];

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[_-]/g, ' ');

/** ExerciseDB / nombres comunes → nombres canónicos del visor. */
const MUSCLE_ALIASES: Record<string, readonly string[]> = {
  abs: ['Abs'],
  abdominals: ['Abs'],
  abdominal: ['Abs'],
  'rectus abdominis': ['Abs'],
  'lower abs': ['Abs'],
  'upper abs': ['Abs'],
  core: ['Abs', 'Obliques'],
  obliques: ['Obliques'],
  oblique: ['Obliques'],
  'external obliques': ['Obliques'],

  chest: ['Mid Chest'],
  pectorals: ['Mid Chest'],
  pectoralis: ['Mid Chest'],
  'pectoralis major': ['Mid Chest'],
  'upper chest': ['Upper Chest'],
  'lower chest': ['Lower Chest'],
  'mid chest': ['Mid Chest'],

  quadriceps: ['Quads'],
  quads: ['Quads'],
  quad: ['Quads'],
  thighs: ['Quads'],
  'vastus lateralis': ['Quads'],
  'vastus medialis': ['Quads'],
  'rectus femoris': ['Quads'],

  hamstrings: ['Hamstrings'],
  hamstring: ['Hamstrings'],
  'biceps femoris': ['Hamstrings'],

  glutes: ['Glutes'],
  gluteus: ['Glutes'],
  'gluteus maximus': ['Glutes'],
  'gluteus medius': ['Glutes Medius'],
  'glutes medius': ['Glutes Medius'],
  buttocks: ['Glutes'],

  calves: ['Calves'],
  calf: ['Calves'],
  gastrocnemius: ['Calves'],
  soleus: ['Calves'],
  shins: ['Shins'],
  tibialis: ['Shins'],
  'tibialis anterior': ['Shins'],

  biceps: ['Biceps'],
  bicep: ['Biceps'],
  'biceps brachii': ['Biceps'],

  triceps: ['Triceps'],
  tricep: ['Triceps'],
  'triceps brachii': ['Triceps'],

  forearms: ['Forearms'],
  forearm: ['Forearms'],
  wrists: ['Forearms'],
  grip: ['Forearms'],
  hands: ['Forearms'],

  shoulders: ['Front Delts', 'Side Delts'],
  delts: ['Front Delts', 'Side Delts'],
  deltoids: ['Front Delts', 'Side Delts'],
  'front delts': ['Front Delts'],
  'front deltoids': ['Front Delts'],
  'anterior deltoid': ['Front Delts'],
  'side delts': ['Side Delts'],
  'lateral delts': ['Side Delts'],
  'rear delts': ['Rear Delts'],
  'posterior deltoid': ['Rear Delts'],
  'rotator cuff': ['Rear Delts'],

  traps: ['Upper Traps', 'Mid Traps'],
  trapezius: ['Upper Traps', 'Mid Traps'],
  'upper traps': ['Upper Traps'],
  'lower traps': ['Mid Traps'],
  'front traps': ['Front Traps'],

  lats: ['Lats'],
  latissimus: ['Lats'],
  'latissimus dorsi': ['Lats'],
  back: ['Lats', 'Lower Back'],
  'upper back': ['Upper Traps', 'Mid Traps'],
  'lower back': ['Lower Back'],
  'erector spinae': ['Lower Back'],
  spine: ['Lower Back'],
  rhomboids: ['Rhomboids'],

  neck: ['Neck'],
  'neck flexors': ['Neck Flexors'],
  sternocleidomastoid: ['Neck'],

  'hip flexors': ['Hip Flexors'],
  hips: ['Hip Flexors', 'Glutes'],
  iliopsoas: ['Hip Flexors'],
  adductors: ['Quads'],
  abductors: ['Glutes Medius'],
};

/** Grupos musculares en español (ejercicios locales) → canónicos. */
const GRUPO_MUSCULAR_ALIASES: Record<string, readonly string[]> = {
  pecho: ['Mid Chest'],
  triceps: ['Triceps'],
  hombros: ['Front Delts', 'Side Delts'],
  piernas: ['Quads', 'Hamstrings'],
  gluteos: ['Glutes'],
  espalda: ['Lats', 'Lower Back'],
  biceps: ['Biceps'],
  core: ['Abs', 'Obliques'],
  abdominales: ['Abs'],
  abdomen: ['Abs'],
  antebrazos: ['Forearms'],
  pantorrillas: ['Calves'],
  trapecio: ['Upper Traps'],
  agarre: ['Forearms'],
  cardiovascular: [],
  'full body': ['Abs', 'Quads', 'Lats'],
};

const canonicalByNormalized = new Map(
  ANATOMY_CANONICAL_NAMES.map((name) => [normalize(name), name]),
);

const resolveAlias = (raw: string): string[] => {
  const key = normalize(raw);
  if (MUSCLE_ALIASES[key]) return [...MUSCLE_ALIASES[key]];
  if (GRUPO_MUSCULAR_ALIASES[key]) return [...GRUPO_MUSCULAR_ALIASES[key]];

  const direct = canonicalByNormalized.get(key);
  if (direct) return [direct];

  const partial: string[] = [];
  for (const [alias, canonicals] of Object.entries(MUSCLE_ALIASES)) {
    if (key.includes(alias) || alias.includes(key)) {
      partial.push(...canonicals);
    }
  }
  return [...new Set(partial)];
};

export const mapMusclesToCanonical = (muscles: readonly string[]): string[] => {
  const result = new Set<string>();
  for (const muscle of muscles) {
    for (const canonical of resolveAlias(muscle)) {
      result.add(canonical);
    }
  }
  return [...result];
};

export const musclesFromExerciseDb = (
  targetMuscles: readonly string[],
  secondaryMuscles: readonly string[] = [],
): string[] => mapMusclesToCanonical([...targetMuscles, ...secondaryMuscles]);

export const musclesFromGrupoMuscular = (grupos: readonly string[]): string[] =>
  mapMusclesToCanonical(grupos);
