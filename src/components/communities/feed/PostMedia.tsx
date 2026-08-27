import { useState } from 'react';
import { MediaViewer } from '../../common/MediaViewer';
import type { MediaPost } from '../../../types/community';

interface PostMediaProps {
  media: MediaPost[];
}

/** Grid 2x2 (con `+N` en el último) para la multimedia de un post. */
export function PostMedia({ media }: PostMediaProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  if (media.length === 0) return null;

  const visible = media.slice(0, 4);
  const remaining = media.length - visible.length;

  return (
    <>
      <div className={`fp-com-post-media-grid count-${visible.length}`}>
        {visible.map((item, i) => {
          const isLastVisible = i === visible.length - 1;
          return (
            <button
              key={i}
              type="button"
              className="fp-com-post-media-item"
              onClick={() => setViewerIndex(i)}
              aria-label="Ver multimedia"
            >
              {item.tipo === 'video' ? (
                <video src={item.url} muted />
              ) : (
                <img src={item.url} alt="" />
              )}
              {isLastVisible && remaining > 0 ? (
                <span className="fp-com-post-media-overlay">+{remaining}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {viewerIndex !== null ? (
        <MediaViewer items={media} initialIndex={viewerIndex} onClose={() => setViewerIndex(null)} />
      ) : null}
    </>
  );
}
