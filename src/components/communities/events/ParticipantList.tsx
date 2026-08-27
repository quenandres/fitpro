import { Avatar } from '../../common/Avatar';
import { useMemberById } from '../../../store/useCommunitiesStore';
import type { Participante } from '../../../types/community';

function ParticipantRow({ participante }: { participante: Participante }) {
  const miembro = useMemberById(participante.miembroId);
  if (!miembro) return null;

  return (
    <div className="flex items-center gap-3 py-2">
      <Avatar src={miembro.avatarUrl} nombre={miembro.nombre} size={38} />
      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{miembro.nombre}</span>
    </div>
  );
}

interface ParticipantListProps {
  participantes: Participante[];
}

export function ParticipantList({ participantes }: ParticipantListProps) {
  const confirmados = participantes.filter((p) => p.estado === 'confirmado');
  const listaEspera = participantes.filter((p) => p.estado === 'lista_espera');

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-sora font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
          Confirmados ({confirmados.length})
        </h3>
        <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {confirmados.map((p) => (
            <ParticipantRow key={p.miembroId} participante={p} />
          ))}
        </div>
      </div>

      {listaEspera.length > 0 ? (
        <div>
          <h3 className="font-sora font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            Lista de espera ({listaEspera.length})
          </h3>
          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {listaEspera.map((p) => (
              <ParticipantRow key={p.miembroId} participante={p} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
