/** Compara IDs de rutina entre mock numérico y UUID de Supabase */
export function sameRutinaId(a: string | number | null | undefined, b: string | number | null | undefined): boolean {
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

export function findRutinaById<T extends { id: string | number }>(
  rutinas: readonly T[],
  id: string | number | null | undefined,
): T | undefined {
  if (id == null) return undefined;
  return rutinas.find((r) => sameRutinaId(r.id, id));
}
