import {
  HEATMAP_OFF_FILTER,
  RECOVERY_LEVELS,
} from './anatomy.constants';
import { MUSCLE_CANONICAL } from './anatomy.canonicalMap';
import { getLocalSvgUrl } from './anatomy.svgCache';
import type { AnatomyView, Gender, RecoveryLevel } from './anatomy.types';

/**
 * Heurística de respaldo: limpia sufijos comunes (Left/Right/Female/vistas) y
 * separa palabras camelCase, sólo se usa si un nombre no está en el diccionario.
 * Es imperfecta por la inconsistencia entre male/female (ej. `ChestUpper` vs
 * `UpperChest`), pero sirve como red de seguridad.
 */
const CANONICAL_FALLBACK_REGEX =
  /Left|Right|Female|\(FrontView\)|\(BackView\)|\(SideView\)|Frontview|Sideview|Backview|FrontView|SideView|BackView/gi;

function canonicalFallback(name: string): string {
  const stripped = name.replace(CANONICAL_FALLBACK_REGEX, '').trim();
  if (import.meta.env?.DEV) {
    // eslint-disable-next-line no-console
    console.warn(`[anatomy] missing canonical mapping for "${name}" → "${stripped}"`);
  }
  return stripped;
}

/**
 * Devuelve el nombre canónico de un músculo a partir de su nombre raw. El
 * canónico es estable entre géneros y vistas: `ChestUpperLeft` (male),
 * `ChestUpperRight` (male) y `UpperChestFemale` (female) retornan todos
 * `"Upper Chest"`, asegurando que el estado de recuperación persiste al
 * cambiar de género/vista.
 */
export function getCanonical(name: string): string {
  return MUSCLE_CANONICAL[name] ?? canonicalFallback(name);
}

/** Devuelve el nivel/estado correspondiente a un valor de recuperación `[0..1]`. */
export function getRecoveryLevel(level: number): RecoveryLevel {
  return RECOVERY_LEVELS.find((s) => level < s.max) ?? RECOVERY_LEVELS[RECOVERY_LEVELS.length - 1];
}

/** Construye el filtro CSS aplicado al SVG de un músculo según su estado. */
export function getMuscleFilter(
  level: number,
  isSelected: boolean,
  showHeatmap: boolean,
): string {
  if (!showHeatmap) return HEATMAP_OFF_FILTER;
  const base = getRecoveryLevel(level).filter;
  return isSelected ? `${base} drop-shadow(0 0 6px rgba(255,255,255,0.35))` : base;
}

/** Nombre de archivo físico del SVG (coincide con `data/anatomy_svgs/`). */
export function buildMuscleFileName(name: string, gender: Gender): string {
  return `${name}_${gender}.svg`;
}

/** Nombre de archivo físico del SVG de silueta. */
export function buildSilhouetteFileName(view: AnatomyView, gender: Gender): string {
  return `silhouette_${view}_${gender}.svg`;
}

/**
 * Devuelve la URL local (bundled por Vite) de la silueta desde
 * `data/anatomy_svgs/`. Lanza si el archivo no existe.
 */
export function buildSilhouetteUrl(view: AnatomyView, gender: Gender): string {
  const fileName = buildSilhouetteFileName(view, gender);
  const url = getLocalSvgUrl(fileName);
  if (!url) {
    throw new Error(`Silueta no encontrada en data/anatomy_svgs/: ${fileName}`);
  }
  return url;
}
