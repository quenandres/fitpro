import { AnatomyViewport } from './AnatomyViewport';
import { RecoveryInspector } from './RecoveryInspector';
import { RecoveryLegend } from './RecoveryLegend';
import { SegmentedControl } from './SegmentedControl';
import { GENDER_OPTIONS, VIEW_OPTIONS } from './anatomy.constants';
import { styles } from './anatomy.styles';
import { useAnatomyTracker } from './useAnatomyTracker';
import type { AnatomyView, Gender, RecoveryState } from './anatomy.types';
import './anatomy.css';

export interface AnatomyViewerProps {
  initialGender?: Gender;
  initialView?: AnatomyView;
  onRecoveryChange?: (state: RecoveryState) => void;
}

/**
 * Componente raíz del tracker de recuperación anatómica. Delega todo el
 * estado al hook `useAnatomyTracker` y se limita a componer la UI.
 */
export function AnatomyViewer({
  initialGender,
  initialView,
  onRecoveryChange,
}: AnatomyViewerProps) {
  const {
    gender,
    view,
    showHeatmap,
    selected,
    muscles,
    getLevel,
    selectMuscle,
    clearSelection,
    updateLevel,
    resetAll,
    toggleHeatmap,
    changeGender,
    changeView,
  } = useAnatomyTracker({ initialGender, initialView, onRecoveryChange });

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <p style={styles.title}>Built Recovery</p>

        <SegmentedControl
          ariaLabel="Género"
          options={GENDER_OPTIONS}
          value={gender}
          onChange={changeGender}
        />
        <SegmentedControl
          ariaLabel="Vista anatómica"
          options={VIEW_OPTIONS}
          value={view}
          onChange={changeView}
        />

        <AnatomyViewport
          view={view}
          gender={gender}
          muscles={muscles}
          selected={selected}
          showHeatmap={showHeatmap}
          getLevel={getLevel}
          onSelectMuscle={selectMuscle}
          onDismiss={clearSelection}
        />

        <RecoveryLegend />

        {selected && (
          <RecoveryInspector
            canonical={selected}
            level={getLevel(selected)}
            onClose={clearSelection}
            onChange={updateLevel}
          />
        )}

        <div style={styles.actionBar}>
          <button
            type="button"
            style={{ ...styles.btn, ...(showHeatmap ? styles.btnActive : {}) }}
            onClick={toggleHeatmap}
          >
            Heatmap
          </button>
          <button type="button" style={styles.btn} onClick={resetAll}>
            Reset todo
          </button>
        </div>
      </div>
    </div>
  );
}

export default AnatomyViewer;
