import { Avatar } from '../../common/Avatar';
import type { Participante } from '../../../types/community';

export type MiembroResumen = {
  nombre: string;
  avatarUrl?: string;
};

function ParticipantRow({
  participante,
  miembrosPorId,
}: {
  participante: Participante;
  miembrosPorId: Map<string, MiembroResumen>;
}) {
  const miembro = miembrosPorId.get(participante.miembroId);
  const nombre = miembro?.nombre ?? 'Miembro';

  return (
    <div className="flex items-center gap-3 py-2">
      <Avatar src={miembro?.avatarUrl ?? ''} nombre={nombre} size={38} />
      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{nombre}</span>
    </div>
  );
}

interface ParticipantListProps {
  participantes: Participante[];
  miembrosPorId: Map<string, MiembroResumen>;
}

export function ParticipantList({ participantes, miembrosPorId }: ParticipantListProps) {
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
            <ParticipantRow key={p.miembroId} participante={p} miembrosPorId={miembrosPorId} />
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
              <ParticipantRow key={p.miembroId} participante={p} miembrosPorId={miembrosPorId} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
