import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import type { Comunidad } from '../../../types/community';
import { CATEGORY_META } from '../shared/categoryMeta';
import { CommunityStats } from '../shared/CommunityStats';
import { ROUTES } from '../../../routes/paths';

interface CommunityCardProps {
  comunidad: Comunidad;
  esMiembro: boolean;
  onJoin?: () => void;
}

export function CommunityCard({ comunidad, esMiembro, onJoin }: CommunityCardProps) {
  const { label, icon: Icon } = CATEGORY_META[comunidad.categoria];

  return (
    <div className="fp-com-community-card">
      <Link to={ROUTES.communities.home(comunidad.id)}>
        <img src={comunidad.portadaUrl} alt="" className="fp-com-community-card-cover" />
      </Link>
      <div className="fp-com-community-card-body">
        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--accent-pink)' }}>
          <Icon size={13} />
          {label}
          {comunidad.visibilidad === 'privada' ? (
            <span className="inline-flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Lock size={11} />
              Privada
            </span>
          ) : null}
        </div>

        <Link to={ROUTES.communities.home(comunidad.id)}>
          <h3 className="font-sora font-bold text-sm mt-1 line-clamp-1" style={{ color: 'var(--text-primary)' }}>
            {comunidad.nombre}
          </h3>
        </Link>
        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
          {comunidad.descripcion}
        </p>

        <CommunityStats comunidad={comunidad} className="mt-3" />

        {esMiembro ? (
          <Link
            to={ROUTES.communities.home(comunidad.id)}
            className="fp-btn fp-btn-secondary mt-3 w-full text-sm text-center"
          >
            Ver comunidad
          </Link>
        ) : onJoin ? (
          <button
            type="button"
            className="fp-btn mt-3 w-full text-sm"
            style={{ background: 'var(--accent-pink)', color: '#fff' }}
            onClick={onJoin}
          >
            Unirme
          </button>
        ) : null}
      </div>
    </div>
  );
}
