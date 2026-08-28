import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCommunitiesStore, CURRENT_MEMBER_ID } from '../../store/useCommunitiesStore';
import { ROUTES } from '../../routes/paths';

const labelClass = 'fp-cal-label';

export function CommunityEventCreatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addEvent = useCommunitiesStore((s) => s.addEvent);
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
    addEvent({
      comunidadId: id,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      lugar: lugar.trim(),
      inicioEn: new Date(inicio).toISOString(),
      finEn: new Date(fin).toISOString(),
      cupoMax: cupoMax ? Number(cupoMax) : null,
      creadoPorId: CURRENT_MEMBER_ID,
    });
    navigate(ROUTES.communities.events(id));
  };

  return (
    <div className="fp-com-card">
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
          <label className={labelClass} htmlFor="evento-descripcion">Descripción</label>
          <textarea
            id="evento-descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            required
            className="fp-input w-full resize-none"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            placeholder="Sin límite"
            className="fp-input w-full"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" className="fp-btn fp-btn-secondary text-sm" onClick={() => navigate(ROUTES.communities.events(id))}>
            Cancelar
          </button>
          <button
            type="submit"
            className="fp-btn fp-btn-primary text-sm"
            disabled={!canSubmit}
          >
            Crear evento
          </button>
        </div>
      </form>
    </div>
  );
}
