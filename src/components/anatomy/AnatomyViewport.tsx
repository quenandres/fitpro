import type { MouseEvent, SyntheticEvent } from 'react';
import { MuscleLayer } from './MuscleLayer';
import { styles } from './anatomy.styles';
import { buildSilhouetteUrl, getCanonical, getMuscleFilter } from './anatomy.utils';
import type { AnatomyView, Gender } from './anatomy.types';

interface AnatomyViewportProps {
  view: AnatomyView;
  gender: Gender;
  muscles: readonly string[];
  selected: string | null;
  showHeatmap: boolean;
  getLevel: (canonical: string) => number;
  onSelectMuscle: (canonical: string) => void;
  onDismiss: () => void;
}

function hideOnError(e: SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = 'none';
}

/**
 * Área visual que combina la silueta de fondo con los SVG de cada músculo.
 * Los clics sobre el viewport (pero no sobre un músculo) cierran el inspector.
 */
export function AnatomyViewport({
  view,
  gender,
  muscles,
  selected,
  showHeatmap,
  getLevel,
  onSelectMuscle,
  onDismiss,
}: AnatomyViewportProps) {
  const handleBackgroundClick = (e: MouseEvent<HTMLDivElement>) => {
    const role = (e.target as HTMLElement).dataset.role;
    if (role === 'viewport' || role === 'silhouette') onDismiss();
  };

  return (
    <div
      style={styles.viewport}
      className="anatomy-viewport"
      data-role="viewport"
      onClick={handleBackgroundClick}
    >
      <img
        data-role="silhouette"
        src={buildSilhouetteUrl(view, gender)}
        style={styles.silhouette}
        alt=""
        onError={hideOnError}
      />

      {muscles.map((name) => {
        const canonical = getCanonical(name);
        const isSelected = selected === canonical;
        const filter = getMuscleFilter(getLevel(canonical), isSelected, showHeatmap);

        return (
          <MuscleLayer
            key={name}
            name={name}
            gender={gender}
            canonical={canonical}
            filter={filter}
            isSelected={isSelected}
            onSelect={onSelectMuscle}
          />
        );
      })}
    </div>
  );
}
