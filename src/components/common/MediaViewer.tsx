import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface MediaViewerItem {
  tipo: 'imagen' | 'video';
  url: string;
}

interface MediaViewerProps {
  items: MediaViewerItem[];
  initialIndex?: number;
  onClose: () => void;
}

/** Visor fullscreen de imágenes/videos con navegación entre elementos. */
export function MediaViewer({ items, initialIndex = 0, onClose }: MediaViewerProps) {
  const [index, setIndex] = useState(initialIndex);
  const item = items[index];
  if (!item) return null;

  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Visor multimedia"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute top-4 right-4 fp-btn fp-btn-ghost"
        style={{ color: '#fff', padding: '8px' }}
        onClick={onClose}
        aria-label="Cerrar visor"
      >
        <X size={22} />
      </button>

      {hasPrev ? (
        <button
          type="button"
          className="absolute left-2 md:left-6 fp-btn fp-btn-ghost"
          style={{ color: '#fff', padding: '10px' }}
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => i - 1);
          }}
          aria-label="Anterior"
        >
          <ChevronLeft size={26} />
        </button>
      ) : null}

      <div className="max-w-[92vw] max-h-[88vh]" onClick={(e) => e.stopPropagation()}>
        {item.tipo === 'video' ? (
          <video src={item.url} controls autoPlay className="max-w-[92vw] max-h-[88vh] rounded-lg" />
        ) : (
          <img src={item.url} alt="" className="max-w-[92vw] max-h-[88vh] rounded-lg object-contain" />
        )}
      </div>

      {hasNext ? (
        <button
          type="button"
          className="absolute right-2 md:right-6 fp-btn fp-btn-ghost"
          style={{ color: '#fff', padding: '10px' }}
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => i + 1);
          }}
          aria-label="Siguiente"
        >
          <ChevronRight size={26} />
        </button>
      ) : null}

      {items.length > 1 ? (
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}
        >
          {index + 1} / {items.length}
        </div>
      ) : null}
    </div>
  );
}
