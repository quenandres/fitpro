import { useParams } from 'react-router-dom';
import { Calendar, Globe, Lock } from 'lucide-react';
import { Avatar } from '../../components/common/Avatar';
import { CATEGORY_META } from '../../components/communities/shared/categoryMeta';
import { useCommunity, useCommunityMembers } from '../../store/useCommunitiesStore';

export function CommunityAboutPage() {
  const { id } = useParams<{ id: string }>();
  const comunidad = useCommunity(id);
  const miembros = useCommunityMembers(id);

  if (!comunidad) return null;

  const lideres = miembros.filter((m) => comunidad.liderIds.includes(m.id));
  const { label, icon: Icon } = CATEGORY_META[comunidad.categoria];

  return (
    <div className="flex flex-col gap-4">
      <div className="fp-com-card">
        <h2 className="font-sora font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
          Descripción
        </h2>
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{comunidad.descripcion}</p>

        <div className="flex flex-wrap gap-4 mt-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span className="flex items-center gap-1.5">
            <Icon size={13} />
            {label}
          </span>
          <span className="flex items-center gap-1.5">
            {comunidad.visibilidad === 'privada' ? <Lock size={13} /> : <Globe size={13} />}
            {comunidad.visibilidad === 'privada' ? 'Privada' : 'Pública'}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={13} />
            Creada el{' '}
            {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(
              new Date(comunidad.creadaEn),
            )}
          </span>
        </div>
      </div>

      <div className="fp-com-card">
        <h2 className="font-sora font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
          Reglas de la comunidad
        </h2>
        <ol className="flex flex-col gap-2 mt-3 list-decimal list-inside">
          {comunidad.reglas.map((regla, i) => (
            <li key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {regla}
            </li>
          ))}
        </ol>
      </div>

      <div className="fp-com-card">
        <h2 className="font-sora font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
          Líderes
        </h2>
        <div className="flex flex-col gap-3 mt-3">
          {lideres.map((l) => (
            <div key={l.id} className="flex items-center gap-3">
              <Avatar src={l.avatarUrl} nombre={l.nombre} size={40} />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{l.nombre}</p>
                {l.bio ? (
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{l.bio}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
