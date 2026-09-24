import type { Usuario } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { isSelfTrainingUser } from '../../utils/selfTrainingClient';
import { getUltimaSesion } from '../../store/useSesionesStore';
import {
  formatPesoKg,
  formatUltimoEntrenamiento,
  initialsOf,
  isNivelAvanzado,
  recencyCopy,
  recencyToneFromSesion,
} from '../../utils/userSummary';

interface Props {
  user: Usuario;
  onClick: () => void;
}

export function UserCard({ user, onClick }: Props) {
  const { user: authUser } = useAuth();
  const esYo = isSelfTrainingUser(user, authUser?.id);
  const sesion = getUltimaSesion(user.id);
  const ultima = formatUltimoEntrenamiento(sesion);
  const tone = recencyToneFromSesion(sesion);
  const avanzado = isNivelAvanzado(user.nivel);

  return (
    <button type="button" className="fp-card fp-card-hover fp-user-card" onClick={onClick}>
      <span className={`fp-user-card-rail fp-user-card-rail--${tone}`} aria-hidden />

      <div className="fp-user-card-top">
        <span className="fp-user-id">{initialsOf(user.nombre)}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <p className="fp-user-card-name truncate">{user.nombre}</p>
            {esYo ? (
              <span className="badge badge-brand shrink-0" style={{ fontSize: 9, padding: '2px 6px' }}>
                Tú
              </span>
            ) : null}
          </div>
          <p className="fp-user-card-plan truncate">{user.plan.nombre}</p>
        </div>
      </div>

      <div className="fp-user-card-meta">
        {user.objetivo.trim() ? <span className="badge badge-brand">{user.objetivo}</span> : null}
        <span className="badge" style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
          {avanzado ? 'Avanzado' : user.nivel}
        </span>
        <span className="badge" style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
          {user.plan.dias_entrenar_semana} ent/sem
        </span>
        {user.peso_kg != null ? (
          <span className="badge" style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
            {formatPesoKg(user.peso_kg)}
          </span>
        ) : null}
      </div>

      <div className="fp-user-card-foot">
        <div className="min-w-0">
          <p className="fp-user-card-when">{ultima.label}</p>
          <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {recencyCopy(tone)}
          </p>
        </div>
        <p className="fp-user-card-what truncate">{ultima.detalle}</p>
      </div>
    </button>
  );
}
