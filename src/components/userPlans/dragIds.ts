export const buildDragId = (semana: number, diaIndex: number): string =>
  `dia-S${semana}-D${diaIndex}`;

export const parseDragId = (id: string): { semana: number; diaIndex: number } | null => {
  const match = /^dia-S(\d+)-D(\d+)$/.exec(id);
  if (!match) return null;
  return { semana: parseInt(match[1], 10), diaIndex: parseInt(match[2], 10) };
};

export const buildEjId = (semana: number, diaIndex: number, ejIndex: number): string =>
  `ej-S${semana}-D${diaIndex}-E${ejIndex}`;

export const parseEjId = (
  id: string
): { semana: number; diaIndex: number; ejIndex: number } | null => {
  const match = /^ej-S(\d+)-D(\d+)-E(\d+)$/.exec(id);
  if (!match) return null;
  return {
    semana: parseInt(match[1], 10),
    diaIndex: parseInt(match[2], 10),
    ejIndex: parseInt(match[3], 10),
  };
};
