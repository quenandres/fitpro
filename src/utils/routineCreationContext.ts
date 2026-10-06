import { ROUTES } from '../routes/paths';

export interface RoutineCreationContext {
  usuarioId: number;
  semana: number;
  sesionIndex: number;
}

const PARAM_USUARIO = 'paraUsuario';
const PARAM_SEMANA = 'paraSemana';
const PARAM_SESION = 'paraSesion';

function appendParams(path: string, entries: Array<[string, string]>): string {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${entries.map(([k, v]) => `${k}=${v}`).join('&')}`;
}

/** Lee el contexto "crear rutina para esta sesión del plan" desde la URL de Biblioteca. */
export function parseRoutineCreationContext(
  searchParams: URLSearchParams,
): RoutineCreationContext | null {
  const usuarioRaw = searchParams.get(PARAM_USUARIO);
  const semanaRaw = searchParams.get(PARAM_SEMANA);
  const sesionRaw = searchParams.get(PARAM_SESION);
  if (usuarioRaw == null || semanaRaw == null || sesionRaw == null) return null;
  const usuarioId = Number(usuarioRaw);
  const semana = Number(semanaRaw);
  const sesionIndex = Number(sesionRaw);
  if (Number.isNaN(usuarioId) || Number.isNaN(semana) || Number.isNaN(sesionIndex)) return null;
  return { usuarioId, semana, sesionIndex };
}

/** Construye la ruta de Biblioteca a la que saltar desde el plan de un cliente. */
export function buildRoutineCreationTarget(target: string, ctx: RoutineCreationContext): string {
  return appendParams(target, [
    [PARAM_USUARIO, String(ctx.usuarioId)],
    [PARAM_SEMANA, String(ctx.semana)],
    [PARAM_SESION, String(ctx.sesionIndex)],
  ]);
}

/** Reenvía el contexto ya presente en la URL actual hacia otra ruta de Biblioteca (navegación entre métodos). */
export function forwardRoutineCreationContext(target: string, searchParams: URLSearchParams): string {
  const ctx = parseRoutineCreationContext(searchParams);
  if (!ctx) return target;
  return buildRoutineCreationTarget(target, ctx);
}

/** Ruta de vuelta al plan del cliente tras guardar la rutina recién creada, para auto-asignarla. */
export function buildRoutineCreationReturnUrl(ctx: RoutineCreationContext, rutinaId: number): string {
  return appendParams(ROUTES.usuarioEntrenamientos(ctx.usuarioId), [
    ['semana', String(ctx.semana)],
    ['paraSesion', String(ctx.sesionIndex)],
    ['rutinaCreada', String(rutinaId)],
  ]);
}
