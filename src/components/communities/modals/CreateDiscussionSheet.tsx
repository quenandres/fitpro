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
      <div className="p-5">
        <h2 className="font-sora text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Nueva discusión
        </h2>

        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título"
          className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none mb-3"
          style={{ background: 'var(--bg-overlay)', color: 'var(--text-primary)' }}
        />
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="¿De qué quieres hablar con la comunidad?"
          rows={5}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
          style={{ background: 'var(--bg-overlay)', color: 'var(--text-primary)' }}
        />

        <button
          type="button"
          className="fp-btn w-full mt-4"
          style={{ background: 'var(--accent-pink)', color: '#fff', opacity: canSubmit ? 1 : 0.5 }}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          Publicar discusión
        </button>
      </div>
    </Sheet>
  );
}
