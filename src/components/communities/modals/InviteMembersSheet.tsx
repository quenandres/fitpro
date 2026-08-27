import { useState } from 'react';
import { Check } from 'lucide-react';
import { Sheet } from '../../common/Sheet';
import { Avatar } from '../../common/Avatar';

/** Contactos mock fuera de la comunidad, solo para la simulación visual de invitar. */
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
    <Sheet open={open} onClose={onClose} ariaLabel="Invitar miembros">
      <div className="p-5">
        <h2 className="font-sora text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Invitar miembros
        </h2>

        <div className="flex flex-col gap-1.5">
          {MOCK_CONTACTS.map((contact) => {
            const isSelected = selected.includes(contact.id);
            return (
              <button
                key={contact.id}
                type="button"
                className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left transition-colors hover:bg-[var(--bg-overlay)]"
                onClick={() => toggle(contact.id)}
              >
                <Avatar nombre={contact.nombre} size={38} />
                <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {contact.nombre}
                </span>
                <span
                  className="flex items-center justify-center rounded-full shrink-0"
                  style={{
                    width: 22,
                    height: 22,
                    background: isSelected ? 'var(--accent-pink)' : 'var(--bg-overlay)',
                    color: '#fff',
                  }}
                >
                  {isSelected ? <Check size={13} /> : null}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="fp-btn w-full mt-4"
          style={{ background: 'var(--accent-pink)', color: '#fff', opacity: selected.length > 0 ? 1 : 0.5 }}
          disabled={selected.length === 0}
          onClick={handleSubmit}
        >
          Enviar {selected.length > 0 ? `(${selected.length})` : ''} invitación{selected.length === 1 ? '' : 'es'}
        </button>
      </div>
    </Sheet>
  );
}
