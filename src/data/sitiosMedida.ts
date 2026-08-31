import type { AnatomyView } from '../components/anatomy/anatomy.types';
import type { SitioMedidaId } from '../types';

export interface SitioMedidaDef {
  id: SitioMedidaId;
  label: string;
  hint: string;
  /** Nombres canónicos del anatomy que resaltan este sitio */
  canonicals: readonly string[];
  views: readonly AnatomyView[];
  bilateral: boolean;
}

export const SITIOS_MEDIDA: readonly SitioMedidaDef[] = [
  {
    id: 'cuello',
    label: 'Cuello',
    hint: 'Perímetro a la altura de la nuez (Adam\'s apple)',
    canonicals: ['Neck', 'Neck Flexors'],
    views: ['front', 'side'],
    bilateral: false,
  },
  {
    id: 'pecho',
    label: 'Pecho',
    hint: 'Perímetro a la altura de los pezones, brazos relajados',
    canonicals: ['Upper Chest', 'Mid Chest', 'Lower Chest'],
    views: ['front', 'side'],
    bilateral: false,
  },
  {
    id: 'brazo',
    label: 'Brazo',
    hint: 'Perímetro a mitad del bíceps, brazo relajado',
    canonicals: ['Biceps'],
    views: ['front', 'side'],
    bilateral: true,
  },
  {
    id: 'antebrazo',
    label: 'Antebrazo',
    hint: 'Perímetro en el punto más ancho, puño cerrado',
    canonicals: ['Forearms'],
    views: ['front', 'side', 'back'],
    bilateral: true,
  },
  {
    id: 'cintura',
    label: 'Cintura',
    hint: 'Perímetro a la altura del ombligo, abdomen relajado',
    canonicals: ['Abs'],
    views: ['front', 'side'],
    bilateral: false,
  },
  {
    id: 'cadera',
    label: 'Cadera',
    hint: 'Perímetro en el punto más ancho de glúteos/cadera',
    canonicals: ['Glutes', 'Glutes Medius'],
    views: ['back', 'side'],
    bilateral: false,
  },
  {
    id: 'muslo',
    label: 'Muslo',
    hint: 'Perímetro a mitad del muslo, pierna relajada',
    canonicals: ['Quads'],
    views: ['front', 'side'],
    bilateral: true,
  },
  {
    id: 'pantorrilla',
    label: 'Pantorrilla',
    hint: 'Perímetro en el punto más ancho de la pantorrilla',
    canonicals: ['Calves'],
    views: ['front', 'side', 'back'],
    bilateral: true,
  },
] as const;

const canonicalIndex = new Map<string, SitioMedidaDef[]>();

for (const sitio of SITIOS_MEDIDA) {
  for (const canonical of sitio.canonicals) {
    const list = canonicalIndex.get(canonical) ?? [];
    list.push(sitio);
    canonicalIndex.set(canonical, list);
  }
}

export function getSitioDef(id: SitioMedidaId): SitioMedidaDef {
  const def = SITIOS_MEDIDA.find((s) => s.id === id);
  if (!def) throw new Error(`Sitio de medida desconocido: ${id}`);
  return def;
}

export function getSitioForCanonical(
  canonical: string,
  view: AnatomyView,
): SitioMedidaDef | null {
  const candidates = canonicalIndex.get(canonical);
  if (!candidates?.length) return null;
  return candidates.find((s) => s.views.includes(view)) ?? candidates[0] ?? null;
}

export function getSitiosForView(view: AnatomyView): SitioMedidaDef[] {
  return SITIOS_MEDIDA.filter((s) => s.views.includes(view));
}
