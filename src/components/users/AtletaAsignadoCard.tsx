import { User } from '@/components/animate-ui/icons/user';
import { Pencil } from 'lucide-react';

export interface AtletaAsignado {
  nombre: string;
  /** Protocolo o fase visible, p. ej. "Fuerza / R1". */
  detalle: string;
  pesoKg?: number | null;
  avatarUrl?: string | null;
}

interface Props {
  atleta?: AtletaAsignado | null;
  onCambiar?: () => void;
}

function formatPesoAsignado(peso?: number | null): string | null {
  if (peso == null || Number.isNaN(peso)) return null;
  return `${peso.toFixed(1)} kg`;
}

export function AtletaAsignadoCard({ atleta, onCambiar }: Props) {
  const nombre = atleta?.nombre.trim() ?? '';
  const asignado = nombre.length > 0;
  const peso = formatPesoAsignado(atleta?.pesoKg);

  return (
    <section className="fp-atleta-card" aria-label="Atleta asignado">
      <span className="fp-atleta-card-kicker">Atleta asignado</span>
      <div className="fp-atleta-card-row">
        <div className="fp-atleta-card-avatar" aria-hidden>
          <User animateOnHover size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="fp-atleta-card-name">{asignado ? nombre : 'Sin asignar'}</h3>
          <p className={asignado ? 'fp-atleta-card-meta fp-atleta-card-meta--line' : 'fp-atleta-card-meta'}>
            {asignado ? (
              <>
                <span className="fp-atleta-card-protocolo">
                  {atleta?.detalle.trim() || 'Sin protocolo'}
                </span>
                {peso ? (
                  <>
                    <span aria-hidden>•</span>
                    <span>{peso}</span>
                  </>
                ) : null}
              </>
            ) : (
              <span>Elige un cliente para personalizar el bloque</span>
            )}
          </p>
        </div>
        {onCambiar ? (
          <button
            type="button"
            className="fp-atleta-card-edit"
            title={asignado ? 'Cambiar atleta' : 'Asignar atleta'}
            aria-label={asignado ? 'Cambiar atleta' : 'Asignar atleta'}
            onClick={onCambiar}
          >
            <Pencil size={16} strokeWidth={2} aria-hidden />
          </button>
        ) : null}
      </div>
    </section>
  );
}
