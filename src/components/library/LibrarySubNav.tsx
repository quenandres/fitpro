import {
  BadgeCheck,
  ClipboardList,
  CreditCard,
  Dumbbell,
  LayoutTemplate,
  Sparkles,
} from 'lucide-react';
import { ScrollIconNav } from '../layout/ScrollIconNav';
import { ROUTES } from '../../routes/paths';

const LIBRARY_ACCENT = 'var(--accent-blue)';
const { library: lib } = ROUTES;

const SUB_ITEMS = [
  { to: lib.rutinas, end: false, Icon: ClipboardList, label: 'Rutinas' },
  { to: lib.catalogo.ejercicios, end: false, Icon: Dumbbell, label: 'Catálogo' },
  { to: lib.rutinasPlantillas, end: false, Icon: LayoutTemplate, label: 'Plantillas' },
  { to: lib.rutinasNueva, end: false, Icon: ClipboardList, label: 'Crear' },
  { to: lib.ia, end: false, Icon: Sparkles, label: 'IA' },
  { to: lib.suscripciones, end: false, Icon: BadgeCheck, label: 'Suscripciones' },
  { to: lib.pagos, end: false, Icon: CreditCard, label: 'Pagos' },
] as const;

export const LibrarySubNav = () => (
  <ScrollIconNav items={SUB_ITEMS} accent={LIBRARY_ACCENT} ariaLabel="Biblioteca" />
);
