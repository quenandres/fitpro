import { Flame, RotateCcw } from 'lucide-react';
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
    <div style={styles.root} className="animate-fade-in">      

      {/* ── Card principal ─────────────────────── */}
      <div className="fp-card animate-slide-up delay-50" style={styles.card}>
        <div style={styles.controlsRow}>
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
        </div>

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

        <div style={styles.actionBar}>
          <button
            type="button"
            className="anatomy-btn"
            style={{ ...styles.btn, ...(showHeatmap ? styles.btnActive : {}) }}
            onClick={toggleHeatmap}
            aria-pressed={showHeatmap}
          >
            <Flame size={14} strokeWidth={2.2} />
            Heatmap
          </button>
          <button
            type="button"
            className="anatomy-btn"
            style={styles.btn}
            onClick={resetAll}
          >
            <RotateCcw size={14} strokeWidth={2.2} />
            Reset todo
          </button>
        </div>
      </div>

      {/* ── Inspector (animado) ────────────────── */}
      {selected && (
        <RecoveryInspector
          canonical={selected}
          level={getLevel(selected)}
          onClose={clearSelection}
          onChange={updateLevel}
        />
      )}
    </div>
  );
}

export default AnatomyViewer;
