import type { LegendItem, MuscleMap, RecoveryLevel } from './anatomy.types';

export const MUSCLE_MAP: MuscleMap = {
  front: {
    male: [
      'Sternocleidomastoid', 'TrapeziusAnterior', 'DeltoidFrontLeft', 'DeltoidFrontRight',
      'DeltoidSide', 'ChestUpperLeft', 'ChestUpperRight', 'ChestMiddleLeft', 'ChestMiddleRight',
      'ChestLowerLeft', 'ChestLowerRight', 'BicepsLeft', 'BicepsRight', 'TricepsFrontView',
      'Forearms', 'Abs', 'ObliquesLeft', 'ObliquesRight', 'HipFlexors', 'QuadsLeft', 'QuadsRight',
      'CalvesFrontLeft', 'CalvesFrontRight',
    ],
    female: [
      'SternocleidomastoidFemale', 'Trapezius(Frontview)Female', 'FrontDeltoidFemale',
      'SideDelts(FrontView)Female', 'UpperChestFemale', 'MidChestFemale', 'LowerChestFemale',
      'BicepsFemale', 'Triceps(FrontView)Female', 'Forearms(FrontView)Female', 'AbsFemale',
      'ObliquesFemale', 'HipFlexorsFemale', 'QuadsFemale', 'LateralShinFemale',
      'Gastrocnemius(frontview)Female',
    ],
  },
  side: {
    male: [
      'UpperTrapsSideView', 'NeckFlexorsSideView', 'TrapsSideView', 'FrontDelt', 'SideDelt',
      'RearDelt', 'ChestSideView', 'Triceps', 'BicepSideView', 'ForearmsSideView', 'AbsSideView',
      'ObliquesSideView', 'GlutesSideView', 'QuadsSideView', 'HamstringSideView', 'CalvesSideView',
      'TibialisSideView',
    ],
    female: [
      'UpperTraps(SideView)Female', 'NeckFlexors(SideView)Female', 'Traps(SideView)Female',
      'FrontDelts(SideView)Female', 'SideDelts(SideView)Female', 'RearDelts(SideView)Female',
      'UpperChest(SideView)Female', 'MidChest(sideView)Female', 'LowerChest(SideView)Female',
      'Triceps(SideView)Female', 'Bicep(SideView)Female', 'Forearms(SideView)Female',
      'Abs(SideView)Female', 'Obliques(SideView)Female', 'HipFlexors(SideView)Female',
      'Glutes(SideView)Female', 'Quads(SideView)Female', 'HamString(SideView)Female',
      'Calves(SideView)Female', 'Tibialis(SideView)Female',
    ],
  },
  back: {
    male: [
      'UpperTrapsLeft', 'UpperTrapsRight', 'MidTrapsLeft', 'MidTrapsRight', 'RearDeltsLeft',
      'RearDeltsRight', 'RearShoulderBlade', 'TricepsLongheadLeft', 'TricepsLongHeadRight',
      'ForearmsPosterior', 'LatsLeft', 'LatsRight', 'LowerBack', 'ObliquesBackView',
      'GlutesMedius', 'GlutesMaximus', 'HamstringsLeft', 'HamstringsRight', 'CalvesLateral',
      'CalvesMedial',
    ],
    female: [
      'UpperTraps(BackView)Female', 'MidTraps(BackView)Female', 'RearDelts(BackView)Female',
      'RearShoulderBlade(BackView)Female', 'TricepsLonghead(BackView)Female',
      'Forearms(BackView)Female', 'Lats(BackView)Female', 'LowerBack(BackView)Female',
      'Obliques(BackView)Female', 'GlutesMedius(BackView)Female', 'GlutesMaximus(BackView)Female',
      'HamString(BackView)Female', 'CalvesLateral(BackView)Female', 'CalvesMedial(BackView)Female',
    ],
  },
};

/**
 * Los niveles están ordenados de menor a mayor `max`; se elige el primero cuyo
 * `max` supera el nivel de recuperación actual. El último actúa como fallback.
 */
export const RECOVERY_LEVELS: readonly RecoveryLevel[] = [
  {
    max: 0.35,
    label: 'Muy fatigado',
    color: '#E24B4A',
    bg: 'rgba(226,75,74,0.12)',
    filter:
      'invert(23%) sepia(99%) saturate(4800%) hue-rotate(354deg) brightness(96%) contrast(120%)',
  },
  {
    max: 0.70,
    label: 'Recuperándose',
    color: '#EF9F27',
    bg: 'rgba(239,159,39,0.12)',
    filter:
      'invert(67%) sepia(65%) saturate(600%) hue-rotate(5deg) brightness(105%) contrast(105%)',
  },
  {
    max: 0.95,
    label: 'Casi listo',
    color: '#97C459',
    bg: 'rgba(151,196,89,0.12)',
    filter:
      'invert(70%) sepia(25%) saturate(800%) hue-rotate(55deg) brightness(100%) contrast(100%)',
  },
  {
    max: 1.01,
    label: 'Óptimo',
    color: '#888780',
    bg: 'rgba(136,135,128,0.12)',
    filter:
      'invert(55%) sepia(5%) saturate(200%) hue-rotate(0deg) brightness(95%) contrast(90%)',
  },
];

export const LEGEND: readonly LegendItem[] = [
  { label: 'Fatigado',      color: '#E24B4A' },
  { label: 'Recuperándose', color: '#EF9F27' },
  { label: 'Casi listo',    color: '#97C459' },
  { label: 'Óptimo',        color: '#888780' },
];

export const GENDER_OPTIONS = [
  { label: 'Male',   value: 'male' as const },
  { label: 'Female', value: 'female' as const },
];

export const VIEW_OPTIONS = [
  { label: 'Front', value: 'front' as const },
  { label: 'Side',  value: 'side' as const },
  { label: 'Back',  value: 'back' as const },
];

/** Nivel de recuperación por defecto (músculo totalmente recuperado). */
export const DEFAULT_RECOVERY = 1.0;

/** Filtro CSS usado cuando el heatmap está desactivado. */
export const HEATMAP_OFF_FILTER = 'invert(1) brightness(0.25) opacity(0.5)';

/** Filtros para el modo de medidas corporales (sitios con valor / seleccionado). */
export const MEASUREMENT_FILLED_FILTER =
  'invert(58%) sepia(72%) saturate(520%) hue-rotate(95deg) brightness(95%) contrast(92%)';
export const MEASUREMENT_SELECTED_FILTER =
  `${MEASUREMENT_FILLED_FILTER} drop-shadow(0 0 8px rgba(34,197,94,0.45))`;
