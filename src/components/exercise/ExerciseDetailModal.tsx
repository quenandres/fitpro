import { useEffect, useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { useGatewayExerciseDetailView } from '../../lib/gateway/exercise-catalog-hooks';
import { CATALOG_IMAGE_PLACEHOLDER } from '../../lib/gateway/exerciseCatalogAdapter';
import { Skeleton } from '../common/Skeleton';
import { Sheet } from '../common/Sheet';

interface Props {
  exerciseId: string | null;
  onClose: () => void;
}

const TagSection = ({
  label,
  tags,
  variant = 'brand',
}: {
  label: string;
  tags: string[];
  variant?: 'brand' | 'neutral';
}) => {
  if (tags.length === 0) return null;

  return (
    <div>
      <p
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '.06em',
          marginBottom: 7,
        }}
      >
        {label}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {tags.map((tag) => (
          <span
            key={tag}
            className={variant === 'brand' ? 'badge badge-brand' : 'badge'}
            style={
              variant === 'neutral'
                ? {
                    background: 'var(--bg-overlay)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }
                : undefined
            }
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export const ExerciseDetailModal = ({ exerciseId, onClose }: Props) => {
  const { data, isLoading, isError, refetch } = useGatewayExerciseDetailView(exerciseId);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoFailed(false);
  }, [exerciseId]);

  if (!exerciseId) return null;

  const poster =
    data?.media?.imagen_url ||
    (data?.image_url?.startsWith('http') ? data.image_url : CATALOG_IMAGE_PLACEHOLDER);
  const videoSrc = data?.media?.gif_url || data?.gif_url;

  return (
    <Sheet open ariaLabel="Detalle del ejercicio" onClose={onClose}>
        <div
          style={{
            height: 3,
            background: 'linear-gradient(90deg,var(--brand),var(--accent-blue))',
          }}
        />

        {isLoading && (
          <div style={{ padding: 18 }}>
            <Skeleton variant="rectangular" height={180} className="mb-4" />
            <Skeleton variant="text" width="70%" height={24} className="mb-2" />
            <Skeleton variant="text" width="100%" height={60} />
          </div>
        )}

        {isError && (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              No se pudo cargar el ejercicio
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Verifica tu conexión o inténtalo de nuevo
            </p>
            <button
              type="button"
              className="fp-btn fp-btn-secondary"
              onClick={() => refetch()}
            >
              <RefreshCw size={14} />
              Reintentar
            </button>
          </div>
        )}

        {data && (
          <>
            <div
              style={{
                width: '100%',
                aspectRatio: '16/10',
                background: 'var(--bg-overlay)',
                overflow: 'hidden',
              }}
            >
              {videoSrc && !videoFailed ? (
                <video
                  key={videoSrc}
                  src={videoSrc}
                  poster={poster}
                  autoPlay
                  loop
                  muted
                  playsInline
                  onError={() => setVideoFailed(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <img
                  src={poster}
                  alt={data.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>

            <div style={{ padding: 18 }}>
              <div
                className="flex items-start justify-between"
                style={{ marginBottom: 14 }}
              >
                <div className="flex-1 min-w-0" style={{ paddingRight: 12 }}>
                  <span
                    className="badge badge-brand"
                    style={{ marginBottom: 6, display: 'inline-flex' }}
                  >
                    {data.muscle_group}
                  </span>
                  <h2
                    className="font-sora"
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {data.name}
                  </h2>
                </div>
                <button
                  type="button"
                  className="fp-btn fp-btn-ghost"
                  style={{ padding: '6px 8px', borderRadius: 9, flexShrink: 0 }}
                  onClick={onClose}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                  style={{
                    padding: 12,
                    borderRadius: 11,
                    background: 'var(--bg-overlay)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                    }}
                  >
                    {data.body_part} · {data.equipment} · Objetivo: {data.target}
                  </p>
                </div>

                <TagSection label="Músculo objetivo" tags={data.target ? [data.target] : []} />
                <TagSection label="Parte del cuerpo" tags={data.body_part ? [data.body_part] : []} />
                <TagSection
                  label="Equipamiento"
                  tags={data.equipment ? [data.equipment] : []}
                  variant="neutral"
                />
                <TagSection
                  label="Grupo muscular"
                  tags={data.muscle_group ? [data.muscle_group] : []}
                  variant="neutral"
                />
              </div>
            </div>
          </>
        )}
    </Sheet>
  );
};
