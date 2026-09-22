export const buildDragId = (semana: number, sesionIndex: number): string =>
  `sesion-S${semana}-N${sesionIndex}`;

export const parseDragId = (id: string): { semana: number; sesionIndex: number } | null => {
  const match = /^sesion-S(\d+)-N(\d+)$/.exec(id);
  if (!match) return null;
  return { semana: parseInt(match[1], 10), sesionIndex: parseInt(match[2], 10) };
};

export const buildEjId = (semana: number, sesionIndex: number, ejIndex: number): string =>
  `ej-S${semana}-N${sesionIndex}-E${ejIndex}`;

export const parseEjId = (
  id: string,
): { semana: number; sesionIndex: number; ejIndex: number } | null => {
  const match = /^ej-S(\d+)-N(\d+)-E(\d+)$/.exec(id);
  if (!match) return null;
  return {
    semana: parseInt(match[1], 10),
    sesionIndex: parseInt(match[2], 10),
    ejIndex: parseInt(match[3], 10),
  };
};
