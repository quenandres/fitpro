import type { Usuario } from '../../types';
import { ChevronRight, Dumbbell, Scale } from 'lucide-react';
import { User } from '@/components/animate-ui/icons/user';
import { useAuth } from '../../context/AuthContext';
import { isSelfTrainingUser } from '../../utils/selfTrainingClient';
import { getUltimaSesion } from '../../store/useSesionesStore';
import {
  formatPesoKg,
  formatUltimoEntrenamiento,
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
      <div className="fp-user-card-identity">
        <span className="fp-user-card-identity-mark" aria-hidden>
          <Dumbbell size={80} strokeWidth={1.2} />
        </span>
        <span className="fp-user-card-avatar" aria-hidden>
          <User animateOnHover animateOnTap size={30} />
        </span>
        <span className={`fp-user-card-status fp-user-card-status--${tone}`}>
          <span className="fp-user-card-status-dot" aria-hidden />
          {recencyCopy(tone)}
        </span>
      </div>

      <div className="fp-user-card-body">
        <div className="fp-user-card-heading">
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <p className="fp-user-card-name truncate">{user.nombre}</p>
              {esYo ? <span className="badge badge-brand fp-user-card-self">Tú</span> : null}
            </div>
            <p className="fp-user-card-plan truncate">{user.plan.nombre}</p>
          </div>
          <span className="fp-user-card-open" aria-hidden>
            <ChevronRight size={17} />
          </span>
        </div>

        {user.objetivo.trim() ? (
          <p className="fp-user-card-objective">{user.objetivo}</p>
        ) : null}

        <div className="fp-user-card-stats">
          <span className="fp-user-card-stat" aria-label={`Nivel: ${avanzado ? 'Avanzado' : user.nivel}`}>
            <Dumbbell size={14} aria-hidden />
            <span>
              <small>Nivel</small>
              <strong>{avanzado ? 'Avanzado' : user.nivel}</strong>
            </span>
          </span>
          <span className="fp-user-card-stat" aria-label={`${user.plan.dias_entrenar_semana} entrenamientos por semana`}>
            <strong>{user.plan.dias_entrenar_semana}</strong>
            <span>
              <small>Ritmo</small>
              <b>ent/sem</b>
            </span>
          </span>
          <span className="fp-user-card-stat" aria-label={`Peso: ${formatPesoKg(user.peso_kg)}`}>
            <Scale size={14} aria-hidden />
            <span>
              <small>Peso</small>
              <strong>{formatPesoKg(user.peso_kg)}</strong>
            </span>
          </span>
        </div>

        <div className="fp-user-card-foot">
          <div className="min-w-0">
            <p className="fp-user-card-foot-label">Última sesión</p>
            <p className="fp-user-card-when">{ultima.label}</p>
          </div>
          <p className="fp-user-card-what truncate">{ultima.detalle}</p>
        </div>
      </div>
    </button>
  );
}
