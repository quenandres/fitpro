import {  
  BookOpen,
  ClipboardList,
  Dumbbell,  
  LayoutTemplate,
  Sparkles,
} from 'lucide-react';
import { ScrollIconNav } from '../layout/ScrollIconNav';

const LIBRARY_ACCENT = '#58a6ff';

const SUB_ITEMS = [
  { to: '/library', end: true, Icon: BookOpen, label: 'Inicio' },
  { to: '/library/rutinas', end: false, Icon: ClipboardList, label: 'Rutinas' },
  { to: '/library/ejercicios', end: false, Icon: Dumbbell, label: 'Ejercicios' },
  { to: '/library/rutina/plantillas', end: false, Icon: LayoutTemplate, label: 'Plantillas' },
  { to: '/library/rutina', end: true, Icon: ClipboardList, label: 'Crear' },
  { to: '/library/ia', end: false, Icon: Sparkles, label: 'IA' },
] as const;

export const LibrarySubNav = () => (
  <ScrollIconNav items={SUB_ITEMS} accent={LIBRARY_ACCENT} ariaLabel="Biblioteca" />
);
