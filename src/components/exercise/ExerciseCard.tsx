import { ChevronRight } from 'lucide-react';
import type { ExerciseListItem, ExerciseSearchItem } from '../../lib/exercisedb';

interface Props {
  item: ExerciseListItem | ExerciseSearchItem;
  onClick: () => void;
}

const LIBRARY_ACCENT = '#58a6ff';
const LIBRARY_BG = 'rgba(88,166,255,.12)';

function getTags(item: ExerciseListItem | ExerciseSearchItem): string[] {
  if ('bodyParts' in item && item.bodyParts.length > 0) {
    return item.bodyParts;
  }
  if ('targetMuscles' in item && item.targetMuscles.length > 0) {
    return item.targetMuscles;
  }
  return [];
}

export const ExerciseCard = ({ item, onClick }: Props) => {
  const tags = getTags(item);
  const exerciseType = 'exerciseType' in item ? item.exerciseType : undefined;

  return (
    <article
      onClick={onClick}
      className="fp-card fp-card-hover relative overflow-hidden cursor-pointer"
    >
      <div className="fp-accent-bar" style={{ background: LIBRARY_ACCENT }} />

      <div style={{ padding: '10px 12px 10px 15px' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="shrink-0 overflow-hidden"
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: LIBRARY_BG,
              border: '1px solid rgba(88,166,255,.2)',
            }}
          >
            <img
              src={item.imageUrl}
              alt=""
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div className="flex-1 min-w-0">
            {exerciseType && (
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="uppercase tracking-wider"
                  style={{ fontSize: 10, fontWeight: 600, color: LIBRARY_ACCENT }}
                >
                  {exerciseType}
                </span>
              </div>
            )}
            <p
              className="font-sora font-semibold truncate"
              style={{ fontSize: 12, color: 'var(--text-primary)' }}
            >
              {item.name}
            </p>
          </div>

          <ChevronRight size={14} color="var(--text-muted)" className="shrink-0" />
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  padding: '2px 7px',
                  borderRadius: 100,
                  whiteSpace: 'nowrap',
                  background: 'var(--bg-overlay)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  padding: '2px 7px',
                  borderRadius: 100,
                  background: 'var(--bg-overlay)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                +{tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
