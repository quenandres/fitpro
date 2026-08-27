import { Sheet } from '../../common/Sheet';
import { CATEGORY_LIST } from '../shared/categoryMeta';
import type { CategoriaComunidad } from '../../../types/community';

interface ExploreFiltersSheetProps {
  open: boolean;
  onClose: () => void;
  selected: CategoriaComunidad[];
  onToggle: (categoria: CategoriaComunidad) => void;
  onClear: () => void;
}

export function ExploreFiltersSheet({ open, onClose, selected, onToggle, onClear }: ExploreFiltersSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Filtros">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sora text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Filtrar por categoría
          </h2>
          {selected.length > 0 ? (
            <button type="button" className="text-xs font-semibold" style={{ color: 'var(--accent-pink)' }} onClick={onClear}>
              Limpiar
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORY_LIST.map(([categoria, meta]) => {
            const isActive = selected.includes(categoria);
            return (
              <button
                key={categoria}
                type="button"
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors"
                style={
                  isActive
                    ? { background: 'var(--accent-pink-dim)', color: 'var(--accent-pink)' }
                    : { background: 'var(--bg-overlay)', color: 'var(--text-secondary)' }
                }
                onClick={() => onToggle(categoria)}
              >
                <meta.icon size={14} />
                {meta.label}
              </button>
            );
          })}
        </div>

        <button type="button" className="fp-btn fp-btn-primary w-full mt-6" onClick={onClose}>
          Ver resultados
        </button>
      </div>
    </Sheet>
  );
}
