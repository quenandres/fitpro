export type Gender = 'male' | 'female';
export type AnatomyView = 'front' | 'side' | 'back';

export type RecoveryState = Record<string, number>;

export interface RecoveryLevel {
  /** Valor máximo (exclusivo) de nivel de recuperación para este estado. */
  max: number;
  label: string;
  color: string;
  bg: string;
  /** Filtro CSS aplicado al SVG del músculo. */
  filter: string;
}

export interface LegendItem {
  label: string;
  color: string;
}

export interface SegmentOption<T extends string = string> {
  label: string;
  value: T;
}

export type MuscleMap = Record<AnatomyView, Record<Gender, readonly string[]>>;
