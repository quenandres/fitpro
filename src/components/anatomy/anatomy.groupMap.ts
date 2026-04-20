/**
 * Mapeo de nombres canónicos (devueltos por `getCanonical`) a los grupos
 * musculares de alto nivel en español usados por `ExerciseForm`
 * (`MUSCLE_GROUPS`). Sirve para derivar automáticamente `grupo_muscular`
 * del ejercicio a partir de los músculos seleccionados en el visor de
 * anatomía.
 */
export const CANONICAL_TO_GRUPO: Readonly<Record<string, string>> = {
  // Espalda
  'Upper Traps': 'Espalda',
  'Mid Traps': 'Espalda',
  'Front Traps': 'Espalda',
  Lats: 'Espalda',
  Rhomboids: 'Espalda',
  'Lower Back': 'Espalda',

  // Hombros
  'Front Delts': 'Hombros',
  'Side Delts': 'Hombros',
  'Rear Delts': 'Hombros',

  // Pecho
  'Upper Chest': 'Pecho',
  'Mid Chest': 'Pecho',
  'Lower Chest': 'Pecho',

  // Brazos
  Biceps: 'Bíceps',
  Triceps: 'Tríceps',
  Forearms: 'Antebrazos',

  // Core
  Abs: 'Core',
  Obliques: 'Core',
  'Hip Flexors': 'Core',

  // Piernas
  Quads: 'Cuadriceps',
  Hamstrings: 'Isquiotibiales',
  Glutes: 'Glúteos',
  'Glutes Medius': 'Glúteos',
  Calves: 'Gemelos',
  Shins: 'Piernas',
};

/**
 * Convierte una lista de nombres canónicos de músculos en una lista
 * deduplicada de grupos de alto nivel. Los músculos sin mapeo
 * (`Neck`, `Neck Flexors`) se omiten.
 */
export function canonicalsToGrupos(canonicals: string[]): string[] {
  const grupos = new Set<string>();
  for (const c of canonicals) {
    const g = CANONICAL_TO_GRUPO[c];
    if (g) grupos.add(g);
  }
  return [...grupos];
}
