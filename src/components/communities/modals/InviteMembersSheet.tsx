import { useState } from 'react';
import { Check } from 'lucide-react';
import { Sheet } from '../../common/Sheet';
import { Avatar } from '../../common/Avatar';

const MOCK_CONTACTS = [
  { id: 'contact-1', nombre: 'Valeria Ponce' },
  { id: 'contact-2', nombre: 'Rodrigo Aguilar' },
  { id: 'contact-3', nombre: 'Camila Duarte' },
  { id: 'contact-4', nombre: 'Sebastián Rojas' },
];

interface InviteMembersSheetProps {
  open: boolean;
  onClose: () => void;
  onInvited: (count: number) => void;
}

export function InviteMembersSheet({ open, onClose, onInvited }: InviteMembersSheetProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (contactId: string) =>
    setSelected((prev) => (prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]));

  const handleSubmit = () => {
    onInvited(selected.length);
    setSelected([]);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Invitar miembros" flexColumn>
      <div className="flex flex-col min-h-0 flex-1">
        <div className="shrink-0 px-5 pt-5 pb-3">
          <h2 className="font-sora text-lg font-bold text-primary">Invitar miembros</h2>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 flex flex-col gap-1.5">
          {MOCK_CONTACTS.map((contact) => {
            const isSelected = selected.includes(contact.id);
            return (
              <button
                key={contact.id}
                type="button"
                className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left transition-colors hover:bg-overlay"
                onClick={() => toggle(contact.id)}
              >
                <Avatar nombre={contact.nombre} size={38} />
                <span className="flex-1 text-sm font-medium text-primary">{contact.nombre}</span>
                <span
                  className="flex items-center justify-center rounded-full shrink-0 w-[22px] h-[22px]"
                  style={{
                    background: isSelected ? 'var(--accent-pink)' : 'var(--bg-overlay)',
                    color: isSelected ? '#fff' : 'transparent',
                  }}
                >
                  {isSelected ? <Check size={13} /> : null}
                </span>
              </button>
            );
          })}
        </div>

        <div className="shrink-0 px-5 py-4 border-t border-line">
          <button
            type="button"
            className="fp-btn fp-btn-primary w-full"
            disabled={selected.length === 0}
            onClick={handleSubmit}
          >
            Enviar {selected.length > 0 ? `(${selected.length})` : ''} invitación{selected.length === 1 ? '' : 'es'}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
