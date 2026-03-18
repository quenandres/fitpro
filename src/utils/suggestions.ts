import type { Ejercicio } from '../types';

// Intelligent exercise suggestions based on routine context
export interface ExerciseSuggestion {
  ejercicio: Ejercicio;
  reason: string;
  type: 'contramusculo' | 'complementario' | 'frecuente' | 'categoria';
}

const muscleGroups: Record<string, string[]> = {
  'Pecho': ['Espalda', 'Hombros'],
  'Espalda': ['Pecho', 'Bíceps'],
  'Piernas': ['Glúteos', 'Core'],
  'Hombros': ['Pecho', 'Tríceps'],
  'Bíceps': ['Espalda', 'Tríceps'],
  'Tríceps': ['Hombros', 'Pecho'],
  'Core': ['Piernas', 'Glúteos'],
};

const complementaryExercises: Record<string, string[]> = {
  'Press de Banca': ['Remo', 'Face Pulls', 'Filetes'],
  'Sentadilla con Barra': ['Peso Muerto', 'Prensa de Piernas'],
  'Peso Muerto': ['Sentadilla con Barra', 'Hip Thrust'],
  'Dominadas': ['Remo con Barra', 'Curl de Bíceps'],
  'Press Militar': ['Elevaciones Lateral', 'Face Pulls'],
  'Hip Thrust': ['Peso Muerto Rumano', 'Zancadas'],
};

export const getSuggestions = (
  exercises: { nombre: string }[],
  allExercises: Ejercicio[],
  categoria?: string
): ExerciseSuggestion[] => {
  const suggestions: ExerciseSuggestion[] = [];
  const addedNames = new Set(exercises.map(e => e.nombre.toLowerCase()));

  // 1. Contramusculo suggestions
  for (const ex of exercises) {
    const exData = allExercises.find(e => e.nombre.toLowerCase() === ex.nombre.toLowerCase());
    if (exData) {
      for (const muscle of exData.grupo_muscular) {
        const antagonists = muscleGroups[muscle];
        if (antagonists) {
          for (const ant of antagonists) {
            const suggestionsByMuscle = allExercises
              .filter(e => 
                e.grupo_muscular.includes(ant) && 
                !addedNames.has(e.nombre.toLowerCase())
              )
              .slice(0, 1);
            
            suggestionsByMuscle.forEach(sugg => {
              if (!suggestions.find(s => s.ejercicio.id === sugg.id)) {
                suggestions.push({
                  ejercicio: sugg,
                  reason: `Contramusculo de ${muscle}`,
                  type: 'contramusculo',
                });
              }
            });
          }
        }
      }
    }
  }

  // 2. Complementary exercises
  for (const ex of exercises) {
    const complements = complementaryExercises[ex.nombre];
    if (complements) {
      for (const comp of complements) {
        const sugg = allExercises.find(e => 
          e.nombre.toLowerCase().includes(comp.toLowerCase()) &&
          !addedNames.has(e.nombre.toLowerCase())
        );
        if (sugg && !suggestions.find(s => s.ejercicio.id === sugg.id)) {
          suggestions.push({
            ejercicio: sugg,
            reason: `Complementa a ${ex.nombre}`,
            type: 'complementario',
          });
        }
      }
    }
  }

  // 3. Same category suggestions
  if (categoria) {
    const categorySuggestions = allExercises
      .filter(e => 
        e.categoria === categoria && 
        !addedNames.has(e.nombre.toLowerCase())
      )
      .slice(0, 2);
    
    categorySuggestions.forEach(sugg => {
      if (!suggestions.find(s => s.ejercicio.id === sugg.id)) {
        suggestions.push({
          ejercicio: sugg,
          reason: `También en ${categoria}`,
          type: 'categoria',
        });
      }
    });
  }

  return suggestions.slice(0, 5);
};

// Get frequently used exercise pairs
export const getFrequentlyUsedPairs = (
  _allExercises: Ejercicio[]
): { nombre: string; frequency: number }[] => {
  // This would ideally come from usage history
  // For now, return common pairs
  return [
    { nombre: 'Press de Banca', frequency: 95 },
    { nombre: 'Sentadilla con Barra', frequency: 90 },
    { nombre: 'Peso Muerto', frequency: 85 },
    { nombre: 'Dominadas', frequency: 80 },
    { nombre: 'Remo', frequency: 75 },
  ];
};
