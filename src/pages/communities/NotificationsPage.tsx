import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  MessageCircle,
  MessageSquareText,
  ShieldAlert,
  ThumbsUp,
  UserPlus,
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { EmptyState } from '../../components/common/EmptyState';
import { useCommunitiesStore } from '../../store/useCommunitiesStore';
import type { TipoNotificacion } from '../../types/community';

const TIPO_ICON: Record<TipoNotificacion, typeof Bell> = {
  reaccion: ThumbsUp,
  comentario: MessageCircle,
  evento: Calendar,
  invitacion: UserPlus,
  discusion: MessageSquareText,
  moderacion: ShieldAlert,
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const notificaciones = useCommunitiesStore((s) => s.notificaciones);
  const markNotificationRead = useCommunitiesStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useCommunitiesStore((s) => s.markAllNotificationsRead);

  const ordenadas = [...notificaciones].sort(
    (a, b) => new Date(b.creadaEn).getTime() - new Date(a.creadaEn).getTime(),
  );
  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-sora text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          Notificaciones
        </h1>
        {noLeidas > 0 ? (
          <button
            type="button"
            className="text-xs font-semibold"
            style={{ color: 'var(--accent-pink)' }}
            onClick={markAllNotificationsRead}
          >
            Marcar todas como leídas
          </button>
        ) : null}
      </div>

      {ordenadas.length === 0 ? (
        <EmptyState icon={Bell} title="Sin notificaciones" description="Aquí verás la actividad de tus comunidades." />
      ) : (
        <div className="flex flex-col gap-2">
          {ordenadas.map((n) => {
            const Icon = TIPO_ICON[n.tipo];
            return (
              <button
                key={n.id}
                type="button"
                className="fp-com-card flex items-start gap-3 text-left w-full"
                style={{ borderColor: n.leida ? undefined : 'var(--accent-pink)' }}
                onClick={() => {
                  markNotificationRead(n.id);
                  navigate(n.ruta);
                }}
              >
                <div
                  className="flex items-center justify-center rounded-full shrink-0"
                  style={{ width: 36, height: 36, background: 'var(--accent-pink-dim)', color: 'var(--accent-pink)' }}
                >
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: 'var(--text-primary)', fontWeight: n.leida ? 400 : 600 }}>
                    {n.texto}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
                      new Date(n.creadaEn),
                    )}
                  </p>
                </div>
                {!n.leida ? (
                  <span className="rounded-full shrink-0 mt-1.5" style={{ width: 8, height: 8, background: 'var(--accent-pink)' }} />
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
