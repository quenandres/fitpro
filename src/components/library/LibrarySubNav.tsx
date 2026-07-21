import {
  Activity,
  Armchair,
  BicepsFlexed,
  BookOpen,
  ClipboardList,
  Dumbbell,
  Layers,
  LayoutTemplate,
  Sparkles,
} from 'lucide-react';
import { ScrollIconNav } from '../layout/ScrollIconNav';

const LIBRARY_ACCENT = '#58a6ff';

const SUB_ITEMS = [
  { to: '/library', end: true, Icon: BookOpen, label: 'Inicio' },
  { to: '/library/ejercicios', end: false, Icon: Dumbbell, label: 'Ejercicios' },
  { to: '/library/rutina/plantillas', end: false, Icon: LayoutTemplate, label: 'Plantillas' },
  { to: '/library/rutina', end: true, Icon: ClipboardList, label: 'Rutina' },
  { to: '/library/ia', end: false, Icon: Sparkles, label: 'IA' },
  { to: '/library/partes', end: false, Icon: Layers, label: 'Partes' },
  { to: '/library/equipo', end: false, Icon: Armchair, label: 'Equipo' },
  { to: '/library/tipos', end: false, Icon: Activity, label: 'Tipos' },
  { to: '/library/musculos', end: false, Icon: BicepsFlexed, label: 'Músculos' },
] as const;

export const LibrarySubNav = () => (
  <ScrollIconNav items={SUB_ITEMS} accent={LIBRARY_ACCENT} ariaLabel="Biblioteca" />
);
