import { Megaphone, MessageCircleQuestion, Sparkles, Type } from 'lucide-react';
import { Sheet } from '../../common/Sheet';
import type { TipoPost } from '../../../types/community';

const TIPOS: Array<{ value: TipoPost; label: string; description: string; icon: typeof Type }> = [
  { value: 'general', label: 'Publicación general', description: 'Comparte algo con la comunidad', icon: Type },
  { value: 'logro', label: 'Logro', description: 'Celebra un PR, una meta o un avance', icon: Sparkles },
  { value: 'pregunta', label: 'Pregunta', description: 'Pide consejo o ayuda a la comunidad', icon: MessageCircleQuestion },
  { value: 'anuncio', label: 'Anuncio', description: 'Solo líderes y moderadores', icon: Megaphone },
];

interface PostTypeSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (tipo: TipoPost) => void;
  puedeAnunciar: boolean;
}

export function PostTypeSheet({ open, onClose, onSelect, puedeAnunciar }: PostTypeSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Tipo de publicación">
      <div className="p-5">
        <h2 className="font-sora text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          ¿Qué quieres publicar?
        </h2>
        <div className="flex flex-col gap-2">
          {TIPOS.filter((t) => t.value !== 'anuncio' || puedeAnunciar).map((t) => (
            <button
              key={t.value}
              type="button"
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-colors hover:bg-[var(--bg-overlay)]"
              onClick={() => {
                onSelect(t.value);
                onClose();
              }}
            >
              <div
                className="flex items-center justify-center rounded-xl shrink-0"
                style={{ width: 40, height: 40, background: 'var(--accent-pink-dim)', color: 'var(--accent-pink)' }}
              >
                <t.icon size={19} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.label}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  );
}
