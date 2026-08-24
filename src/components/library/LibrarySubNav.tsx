import {
  BookOpen,
  ClipboardList,
  Dumbbell,
  LayoutTemplate,
  Sparkles,
} from 'lucide-react';
import { ScrollIconNav } from '../layout/ScrollIconNav';
import { ROUTES } from '../../routes/paths';

const LIBRARY_ACCENT = '#58a6ff';
const { library: lib } = ROUTES;

const SUB_ITEMS = [
  { to: lib.root, end: true, Icon: BookOpen, label: 'Inicio' },
  { to: lib.rutinas, end: false, Icon: ClipboardList, label: 'Rutinas' },
  { to: lib.catalogo.ejercicios, end: false, Icon: Dumbbell, label: 'Catálogo' },
  { to: lib.rutinasPlantillas, end: false, Icon: LayoutTemplate, label: 'Plantillas' },
  { to: lib.rutinasNueva, end: true, Icon: ClipboardList, label: 'Crear' },
  { to: lib.ia, end: false, Icon: Sparkles, label: 'IA' },
] as const;

export const LibrarySubNav = () => (
  <ScrollIconNav items={SUB_ITEMS} accent={LIBRARY_ACCENT} ariaLabel="Biblioteca" />
);
