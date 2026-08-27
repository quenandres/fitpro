import { useState } from 'react';
import { Send } from 'lucide-react';

interface CommentComposerProps {
  onSubmit: (texto: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function CommentComposer({ onSubmit, disabled = false, placeholder = 'Escribe un comentario…' }: CommentComposerProps) {
  const [texto, setTexto] = useState('');

  const handleSubmit = () => {
    const trimmed = texto.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setTexto('');
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-3.5 py-2.5 rounded-xl text-sm outline-none"
        style={{ background: 'var(--bg-overlay)', color: 'var(--text-primary)' }}
      />
      <button
        type="button"
        className="fp-btn fp-btn-ghost shrink-0"
        style={{ padding: '9px', borderRadius: 10 }}
        onClick={handleSubmit}
        disabled={disabled || !texto.trim()}
        aria-label="Enviar comentario"
      >
        <Send size={16} />
      </button>
    </div>
  );
}
