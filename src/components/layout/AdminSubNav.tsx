import {
  Activity,
  BookOpen,
  Database,
  Dumbbell,
  Ruler,
  Users,
} from 'lucide-react';
import { ScrollIconNav } from './ScrollIconNav';

const ADMIN_ACCENT = '#a371f7';

const SUB_ITEMS = [
  { to: '/admin', end: true, Icon: Dumbbell, label: 'Rutinas' },
  { to: '/admin/ejercicios', end: false, Icon: Activity, label: 'Ejercicios' },
  { to: '/admin/catalogo', end: false, Icon: BookOpen, label: 'Catálogo' },
  { to: '/admin/planes', end: false, Icon: Users, label: 'Planes' },
  { to: '/admin/unidades', end: false, Icon: Ruler, label: 'Unidades' },
  { to: '/admin/datos', end: false, Icon: Database, label: 'Datos' },
] as const;

export const AdminSubNav = () => (
  <ScrollIconNav items={SUB_ITEMS} accent={ADMIN_ACCENT} ariaLabel="Administración" />
);
