import { useState } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';
import { Sheet } from '../../common/Sheet';

interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Ruta relativa a compartir (se resuelve a URL absoluta con `location.origin`). */
  path: string;
}

/** Modal de compartir: usa Web Share API si está disponible, o copia el enlace. */
export function ShareSheet({ open, onClose, title, path }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}${path}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        onClose();
      } catch {
        // el usuario canceló el share nativo; no hacer nada
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard no disponible; el usuario puede seleccionar el texto manualmente
    }
  };

  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Compartir">
      <div className="p-5">
        <h2 className="font-sora text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Compartir
        </h2>

        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm mb-4"
          style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)' }}
        >
          <Link2 size={15} className="shrink-0" />
          <span className="truncate">{url}</span>
        </div>

        <div className="flex gap-3">
          {typeof navigator !== 'undefined' && !!navigator.share ? (
            <button
              type="button"
              className="fp-btn fp-btn-primary flex-1 flex items-center justify-center gap-2"
              onClick={() => void handleNativeShare()}
            >
              <Share2 size={16} />
              Compartir
            </button>
          ) : null}
          <button
            type="button"
            className="fp-btn fp-btn-secondary flex-1 flex items-center justify-center gap-2"
            onClick={() => void handleCopy()}
          >
            {copied ? <Check size={16} /> : <Link2 size={16} />}
            {copied ? 'Copiado' : 'Copiar enlace'}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
