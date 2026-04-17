import { memo, useEffect, useState, type MouseEvent } from 'react';
import { styles } from './anatomy.styles';
import { buildMuscleFileName } from './anatomy.utils';
import {
  getCachedSvgMarkup,
  loadSvgMarkup,
  normalizeSvgMarkup,
} from './anatomy.svgCache';
import type { Gender } from './anatomy.types';

interface MuscleLayerProps {
  /** Nombre crudo del músculo (ej. `BicepsLeft`, sin género ni extensión). */
  name: string;
  gender: Gender;
  /** Nombre canonicalizado (agrupa izquierdo/derecho/género). */
  canonical: string;
  filter: string;
  isSelected: boolean;
  onSelect: (canonical: string) => void;
}

function MuscleLayerBase({
  name,
  gender,
  canonical,
  filter,
  isSelected,
  onSelect,
}: MuscleLayerProps) {
  const fileName = buildMuscleFileName(name, gender);

  const [markup, setMarkup] = useState<string | null>(() => {
    const cached = getCachedSvgMarkup(fileName);
    return cached ? normalizeSvgMarkup(cached) : null;
  });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (markup !== null) return;
    let alive = true;
    loadSvgMarkup(fileName)
      .then((raw) => {
        if (alive) setMarkup(normalizeSvgMarkup(raw));
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
    // `markup` is intentionally excluded: once fulfilled we never re-fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileName]);

  if (failed || !markup) return null;

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onSelect(canonical);
  };

  return (
    <div
      className="anatomy-muscle-svg"
      role="button"
      aria-label={canonical}
      aria-pressed={isSelected}
      title={canonical}
      style={{
        ...styles.muscle,
        filter,
        zIndex: isSelected ? 30 : 10,
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
      }}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}

/**
 * Memoizado: sólo re-renderiza cuando cambia su propio estado (filter,
 * isSelected, etc.), no cuando cambia cualquier otro músculo.
 */
export const MuscleLayer = memo(MuscleLayerBase);
