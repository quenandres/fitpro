import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { useToastHook } from '../../components/common/Toast';
import { CATEGORY_LIST } from '../../components/communities/shared/categoryMeta';
import { usePlatformRole } from '../../hooks/usePlatformRole';
import { useCommunitiesStore } from '../../store/useCommunitiesStore';
import type { CategoriaComunidad, VisibilidadComunidad } from '../../types/community';
import { ROUTES } from '../../routes/paths';

const labelClass = 'fp-cal-label';

export function CommunityCreatePage() {
  const navigate = useNavigate();
  const { isSuperadmin } = usePlatformRole();
  const createCommunity = useCommunitiesStore((s) => s.createCommunity);
  const toast = useToastHook();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState<CategoriaComunidad>('crossfit');
  const [visibilidad, setVisibilidad] = useState<VisibilidadComunidad>('publica');
  const [reglasTexto, setReglasTexto] = useState('');

  const canSubmit = nombre.trim().length > 0 && descripcion.trim().length > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const reglas = reglasTexto
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const id = createCommunity({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      categoria,
      visibilidad,
      reglas,
    });

    toast.success(`Comunidad «${nombre.trim()}» creada`);
    navigate(ROUTES.communities.home(id));
  };

  if (!isSuperadmin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Acceso restringido"
        description="Solo los superadministradores pueden crear comunidades."
        action={(
          <button
            type="button"
            className="fp-btn fp-btn-secondary"
            onClick={() => navigate(ROUTES.communities.root)}
          >
            Volver a explorar
          </button>
        )}
      />
    );
  }

  return (
    <div className="animate-slide-up max-w-xl mx-auto">
      <h1 className="font-sora text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        Crear comunidad
      </h1>
      <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
        Serás asignado como líder de la nueva comunidad.
      </p>

      <div className="fp-com-card">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className={labelClass} htmlFor="com-nombre">Nombre</label>
            <input
              id="com-nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="fp-input w-full"
              placeholder="Ej. CrossFit Box Sur"
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="com-descripcion">Descripción</label>
            <textarea
              id="com-descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              required
              className="fp-input w-full resize-none"
              placeholder="De qué trata la comunidad…"
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="com-categoria">Categoría</label>
            <select
              id="com-categoria"
              className="fp-input w-full"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaComunidad)}
            >
              {CATEGORY_LIST.map(([key, meta]) => (
                <option key={key} value={key}>{meta.label}</option>
              ))}
            </select>
          </div>

          <div>
            <span className={labelClass}>Visibilidad</span>
            <div className="flex gap-2 mt-1">
              {(['publica', 'privada'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`fp-cal-duration-chip${visibilidad === v ? ' is-active' : ''}`}
                  onClick={() => setVisibilidad(v)}
                >
                  {v === 'publica' ? 'Pública' : 'Privada'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="com-reglas">
              Reglas <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span>
            </label>
            <textarea
              id="com-reglas"
              value={reglasTexto}
              onChange={(e) => setReglasTexto(e.target.value)}
              rows={4}
              className="fp-input w-full resize-none"
              placeholder="Una regla por línea"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="button"
              className="fp-btn fp-btn-secondary flex-1"
              onClick={() => navigate(ROUTES.communities.root)}
            >
              Cancelar
            </button>
            <button type="submit" className="fp-btn fp-btn-primary flex-1" disabled={!canSubmit}>
              Crear comunidad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
