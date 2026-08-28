import type { Usuario } from '../../types';

interface ClienteSelectorProps {
  usuarios: Usuario[];
  selectedId: number | null;
  onChange: (id: number) => void;
}

export function ClienteSelector({ usuarios, selectedId, onChange }: ClienteSelectorProps) {
  return (
    <div>
      <label htmlFor="tracking-cliente" className="fp-cal-label">Cliente</label>
      <select
        id="tracking-cliente"
        className="fp-input w-full"
        value={selectedId ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {usuarios.map((u) => (
          <option key={u.id} value={u.id}>{u.nombre}</option>
        ))}
      </select>
    </div>
  );
}
