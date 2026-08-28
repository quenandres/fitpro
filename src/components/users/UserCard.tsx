import { Activity, Scale } from 'lucide-react';
import type { Usuario } from '../../types';
import { getUltimaSesion } from '../../store/useSesionesStore';
import { formatPesoKg, formatUltimoEntrenamiento, isNivelAvanzado } from '../../utils/userSummary';

const ACCENT = '#58a6ff';

interface Props {
  user: Usuario;
  onClick: () => void;
}

export function UserCard({ user, onClick }: Props) {
  const ultima = formatUltimoEntrenamiento(getUltimaSesion(user.id));
  const avanzado = isNivelAvanzado(user.nivel);

  return (
    <button
      type="button"
      className="fp-card fp-card-hover text-left w-full"
      onClick={onClick}
      style={{
        padding: 16,
        borderRadius: 13,
        border: avanzado ? '2px solid rgba(240,136,62,.35)' : '2px solid transparent',
      }}
    >
      <div className="flex items-center gap-3 mb-3 min-w-0">
        <div
          className="shrink-0 font-sora font-bold text-white flex items-center justify-center"
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: avanzado
              ? 'linear-gradient(135deg,#f0883e,#dc2626)'
              : `linear-gradient(135deg, ${ACCENT}, #2563eb)`,
            fontSize: 18,
          }}
        >
          {user.nombre
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-primary truncate">{user.nombre}</p>
          <p className="text-[11px] text-muted truncate">{user.email}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="badge badge-brand" style={{ fontSize: 10 }}>
          {user.objetivo}
        </span>
        {user.peso_kg != null ? (
          <span
            className="badge inline-flex items-center gap-1"
            style={{ fontSize: 10, background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: 'none' }}
          >
            <Scale size={10} />
            {formatPesoKg(user.peso_kg)}
          </span>
        ) : null}
        <span
          className="badge"
          style={{
            fontSize: 10,
            background: avanzado ? '#f0883e25' : '#58a6ff20',
            color: avanzado ? '#f0883e' : '#58a6ff',
            border: 'none',
            fontWeight: avanzado ? 700 : 600,
          }}
        >
          {avanzado ? 'Avanzado' : user.nivel}
        </span>
      </div>

      <div
        className="flex items-start gap-2 rounded-[10px] px-2.5 py-2"
        style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}
      >
        <Activity size={14} className="shrink-0 mt-0.5" style={{ color: ACCENT }} />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-primary">{ultima.label}</p>
          <p className="text-[10px] text-muted truncate">{ultima.detalle}</p>
        </div>
      </div>
    </button>
  );
}
