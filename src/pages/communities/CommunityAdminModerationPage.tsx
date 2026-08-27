import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { useCommunitiesStore, useCommunityReports, useMemberById } from '../../store/useCommunitiesStore';
import { ROUTES } from '../../routes/paths';
import type { EstadoReporte, MotivoReporte } from '../../types/community';

const MOTIVO_LABEL: Record<MotivoReporte, string> = {
  spam: 'Spam o publicidad',
  contenido_inapropiado: 'Contenido inapropiado',
  acoso: 'Acoso u hostigamiento',
  otro: 'Otro motivo',
};

function ReporteRow({
  reporte,
  comunidadId,
  onResolve,
}: {
  reporte: ReturnType<typeof useCommunityReports>[number];
  comunidadId: string;
  onResolve: () => void;
}) {
  const reportadoPor = useMemberById(reporte.reportadoPorId);
  const targetPath = reporte.postId
    ? ROUTES.communities.post(comunidadId, reporte.postId)
    : reporte.discusionId
      ? ROUTES.communities.discussion(comunidadId, reporte.discusionId)
      : null;

  return (
    <div className="fp-com-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {MOTIVO_LABEL[reporte.motivo]}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Reportado por {reportadoPor?.nombre ?? 'un miembro'} ·{' '}
            {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(reporte.creadoEn))}
          </p>
          {reporte.detalle ? (
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{reporte.detalle}</p>
          ) : null}
          {targetPath ? (
            <Link to={targetPath} className="inline-block mt-2 text-xs font-semibold" style={{ color: 'var(--accent-pink)' }}>
              Ver contenido reportado →
            </Link>
          ) : null}
        </div>
        {reporte.estado === 'pendiente' ? (
          <button
            type="button"
            className="fp-btn fp-btn-secondary text-xs shrink-0 flex items-center gap-1.5"
            onClick={onResolve}
          >
            <CheckCircle2 size={13} />
            Resolver
          </button>
        ) : (
          <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--brand)' }}>Resuelto</span>
        )}
      </div>
    </div>
  );
}

export function CommunityAdminModerationPage() {
  const { id } = useParams<{ id: string }>();
  const reportes = useCommunityReports(id);
  const resolveReport = useCommunitiesStore((s) => s.resolveReport);
  const [tab, setTab] = useState<EstadoReporte>('pendiente');

  const filtered = useMemo(() => reportes.filter((r) => r.estado === tab), [reportes, tab]);

  if (!id) return null;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-sora text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
        Moderación
      </h1>

      <div className="flex gap-1">
        <button
          type="button"
          className="fp-com-tab"
          style={tab === 'pendiente' ? { background: 'var(--accent-pink-dim)', color: 'var(--accent-pink)' } : undefined}
          onClick={() => setTab('pendiente')}
        >
          Pendientes
        </button>
        <button
          type="button"
          className="fp-com-tab"
          style={tab === 'resuelto' ? { background: 'var(--accent-pink-dim)', color: 'var(--accent-pink)' } : undefined}
          onClick={() => setTab('resuelto')}
        >
          Resueltos
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="Sin reportes" description={`No hay reportes ${tab === 'pendiente' ? 'pendientes' : 'resueltos'}.`} />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((reporte) => (
            <ReporteRow key={reporte.id} reporte={reporte} comunidadId={id} onResolve={() => resolveReport(reporte.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
