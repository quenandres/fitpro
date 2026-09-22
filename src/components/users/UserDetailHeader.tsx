import type { Usuario } from '../../types';
import { PageBackButton } from '../common/PageBackButton';
import { getUltimaSesion } from '../../store/useSesionesStore';
import {
  formatUltimoEntrenamiento,
  initialsOf,
  recencyCopy,
  recencyToneFromSesion,
} from '../../utils/userSummary';
import { UserDetailTabSwitcher, type UserDetailTab } from './UserDetailTabSwitcher';
import { ROUTES } from '../../routes/paths';

interface Props {
  user: Usuario;
  tab: UserDetailTab;
  onTabChange: (tab: UserDetailTab) => void;
}

export function UserDetailHeader({ user, tab, onTabChange }: Props) {
  const sesion = getUltimaSesion(user.id);
  const ultima = formatUltimoEntrenamiento(sesion);
  const tone = recencyToneFromSesion(sesion);

  return (
    <header className="fp-user-file animate-slide-up">
      <span className={`fp-user-file-rail fp-user-card-rail--${tone}`} aria-hidden />

      <div className="fp-user-file-head">
        <PageBackButton to={ROUTES.usuarios} label="Volver a usuarios" />
        <span className="fp-user-id fp-user-id--file">{initialsOf(user.nombre)}</span>
        <div className="fp-user-file-copy">
          <h1 className="font-sora fp-user-file-name truncate">{user.nombre}</h1>
          <p className="fp-user-file-plan truncate">{user.plan.nombre}</p>
        </div>
      </div>

      <p className="fp-user-file-status">
        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          {recencyCopy(tone)}
        </span>
        {' · '}
        {ultima.label.toLowerCase()}
        {sesion ? ` · ${ultima.detalle}` : ''}
      </p>

      <div className="mt-4">
        <UserDetailTabSwitcher tab={tab} onChange={onTabChange} />
      </div>
    </header>
  );
}
