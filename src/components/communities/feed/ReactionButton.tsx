import { Flame, PartyPopper, ThumbsUp } from 'lucide-react';
import type { TipoReaccion } from '../../../types/community';

const META: Record<TipoReaccion, { icon: typeof ThumbsUp; label: string }> = {
  like: { icon: ThumbsUp, label: 'Me gusta' },
  fuego: { icon: Flame, label: 'Fuego' },
  aplauso: { icon: PartyPopper, label: 'Aplausos' },
};

interface ReactionButtonProps {
  tipo: TipoReaccion;
  count: number;
  active: boolean;
  onToggle: () => void;
}

export function ReactionButton({ tipo, count, active, onToggle }: ReactionButtonProps) {
  const { icon: Icon, label } = META[tipo];
  return (
    <button
      type="button"
      className={`fp-com-reaction-btn ${active ? 'is-active' : ''}`}
      onClick={onToggle}
      aria-pressed={active}
      aria-label={label}
    >
      <Icon size={15} />
      {count > 0 ? count : null}
    </button>
  );
}
