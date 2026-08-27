import { useState } from 'react';

/**
 * Timestamp estable para el ciclo de vida del componente (inicializador perezoso
 * de `useState`, el patrón sancionado por React para una llamada impura única).
 * Evita invocar `Date.now()` directamente en el cuerpo del render.
 */
export function useNow(): number {
  const [now] = useState(() => Date.now());
  return now;
}
