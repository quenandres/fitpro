/** Frases que la API reconoce en el campo textual `keywords` (no los enums). */
const KEYWORD_ALIASES: Record<string, string> = {
  STRENGTH: 'strength',
  CARDIO: 'cardio',
  PLYOMETRICS: 'plyometric',
  // "stretch"/"stretching" casi no devuelven exerciseType=STRETCHING
  STRETCHING: 'flexibility',
  WEIGHTLIFTING: 'weightlifting',
  YOGA: 'yoga',
  AEROBIC: 'aerobic',
  'BODY WEIGHT': 'bodyweight',
  'RESISTANCE BAND': 'resistance band',
  'BATTLING ROPE': 'battling rope',
  'BOSU BALL': 'bosu',
  'EZ BARBELL': 'ez barbell',
  'LEVERAGE MACHINE': 'machine',
  'MEDICINE BALL': 'medicine ball',
  'OLYMPIC BARBELL': 'olympic barbell',
  'POWER SLED': 'sled',
  'SLED MACHINE': 'sled',
  'SMITH MACHINE': 'smith machine',
  'STABILITY BALL': 'stability ball',
  'TRAP BAR': 'trap bar',
  'VIBRATE PLATE': 'vibration',
  'WHEEL ROLLER': 'ab wheel',
  'FULL BODY': 'full body',
  'UPPER ARMS': 'arms',
};

/** Convierte un valor de catálogo (enum API) a texto usable en `keywords`. */
export const toKeywordTerm = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const alias = KEYWORD_ALIASES[trimmed.toUpperCase()];
  if (alias) return alias;
  return trimmed.toLowerCase();
};

/**
 * Keywords para GET /exercises.
 * La API hace match textual en el campo `keywords` del ejercicio — no entiende
 * enums crudos como `STRENGTH` o `CHEST`. Por eso normalizamos a frases.
 */
export const buildKeywords = (
  exerciseType: string,
  bodyPart: string,
  equipment: string,
  muscle = '',
  fallback = 'workout',
): string => {
  const parts = [
    toKeywordTerm(exerciseType),
    toKeywordTerm(bodyPart),
    toKeywordTerm(equipment),
    toKeywordTerm(muscle),
  ].filter(Boolean);

  if (parts.length === 0) return fallback;
  return parts.join(',');
};
