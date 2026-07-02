export const buildKeywords = (
  exerciseType: string,
  bodyPart: string,
  equipment: string,
  fallback = 'workout',
): string => {
  const parts = [fallback, exerciseType, bodyPart, equipment].filter(Boolean);
  return parts.join(',');
};
