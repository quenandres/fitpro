import { useState } from 'react';
import { Sheet } from '../../common/Sheet';

interface CreateDiscussionSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (titulo: string, texto: string) => void;
}

export function CreateDiscussionSheet({ open, onClose, onSubmit }: CreateDiscussionSheetProps) {
  const [titulo, setTitulo] = useState('');
  const [texto, setTexto] = useState('');

  const canSubmit = titulo.trim() && texto.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(titulo.trim(), texto.trim());
    setTitulo('');
    setTexto('');
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Nueva discusión" flexColumn>
      <div className="flex flex-col min-h-0 flex-1 p-5">
        <h2 className="font-sora text-lg font-bold mb-4 shrink-0" style={{ color: 'var(--text-primary)' }}>
          Nueva discusión
        </h2>

        <div className="flex flex-col gap-3 min-h-0 flex-1 overflow-y-auto">
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título"
            className="fp-input w-full"
          />
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="¿De qué quieres hablar con la comunidad?"
            rows={5}
            className="fp-input w-full resize-none"
          />
        </div>

        <button
          type="button"
          className="fp-btn fp-btn-primary w-full shrink-0 mt-4"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          Publicar discusión
        </button>
      </div>
    </Sheet>
  );
}
