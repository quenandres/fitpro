/** View Transition del cambio de tema — paridad con fitpro-clients §18.3 */
export const DURACION_TEMA_MS = 350

export function prefiereMovimientoReducido(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
