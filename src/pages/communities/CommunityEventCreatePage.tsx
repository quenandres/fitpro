import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageBackRow } from '../../components/common/PageBackButton';
import { useCreateEvento } from '../../lib/gateway/hooks';
import { ROUTES } from '../../routes/paths';
import { getCommunityEventsBack } from '../../utils/communityBackUtils';

const labelClass = 'fp-cal-label';

export function CommunityEventCreatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const createEvent = useCreateEvento(id ?? '');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [lugar, setLugar] = useState('');
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');
  const [cupoMax, setCupoMax] = useState('');

  if (!id) return null;

  const canSubmit = titulo.trim() && descripcion.trim() && lugar.trim() && inicio && fin;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    createEvent.mutate(
      {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        lugar: lugar.trim(),
        inicioEn: new Date(inicio).toISOString(),
        finEn: new Date(fin).toISOString(),
        cupoMax: cupoMax ? Number(cupoMax) : null,
      },
      {
        onSuccess: () => navigate(ROUTES.communities.events(id)),
      },
    );
  };

  const eventsBack = getCommunityEventsBack(id);

  return (
    <div className="fp-com-card">
      <PageBackRow to={eventsBack.to} label={eventsBack.label} />
      <h1 className="font-sora text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        Crear evento
      </h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className={labelClass} htmlFor="evento-titulo">Título</label>
          <input
            id="evento-titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className="fp-input w-full"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="evento-desc">Descripción</label>
          <textarea
            id="evento-desc"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            rows={3}
            className="fp-input w-full"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="evento-lugar">Lugar</label>
          <input
            id="evento-lugar"
            type="text"
            value={lugar}
            onChange={(e) => setLugar(e.target.value)}
            required
            className="fp-input w-full"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="evento-inicio">Inicio</label>
            <input
              id="evento-inicio"
              type="datetime-local"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              required
              className="fp-input w-full"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="evento-fin">Fin</label>
            <input
              id="evento-fin"
              type="datetime-local"
              value={fin}
              onChange={(e) => setFin(e.target.value)}
              required
              className="fp-input w-full"
            />
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="evento-cupo">Cupo máximo (opcional)</label>
          <input
            id="evento-cupo"
            type="number"
            min={1}
            value={cupoMax}
            onChange={(e) => setCupoMax(e.target.value)}
            className="fp-input w-full"
          />
        </div>
        <button
          type="submit"
          className="fp-btn fp-btn-primary"
          disabled={!canSubmit || createEvent.isPending}
        >
          Crear evento
        </button>
      </form>
    </div>
  );
}
