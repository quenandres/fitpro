import { useEffect, useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { useExercise } from '../../lib/exercisedb';
import { Skeleton } from '../admin/common/Skeleton';

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
  const { data, isLoading, isError, refetch } = useExercise(exerciseId ?? undefined);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoFailed(false);
  }, [exerciseId]);

  if (!exerciseId) return null;

  const fallbackImage = data?.imageUrls?.['720p'] ?? data?.imageUrl;

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center"
      style={{
        background: 'rgba(0,0,0,.75)',
        backdropFilter: 'blur(8px)',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="fp-card animate-slide-up w-full max-w-md overflow-hidden"
        style={{ borderRadius: 20, maxHeight: '85vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
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
              Verifica tu conexion o la configuracion de la API
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
              {!videoFailed ? (
                <video
                  key={data.videoUrl}
                  src={data.videoUrl}
                  poster={data.imageUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  onError={() => setVideoFailed(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <img
                  src={fallbackImage}
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
                    {data.exerciseType}
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
                    {data.overview}
                  </p>
                </div>

                {data.instructions.length > 0 && (
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
                      Instrucciones
                    </p>
                    <ol
                      style={{
                        margin: 0,
                        paddingLeft: 18,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      {data.instructions.map((step: string, index: number) => (
                        <li
                          key={index}
                          style={{
                            fontSize: 13,
                            color: 'var(--text-secondary)',
                            lineHeight: 1.5,
                          }}
                        >
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <TagSection label="Musculos objetivo" tags={data.targetMuscles} />
                <TagSection
                  label="Musculos secundarios"
                  tags={data.secondaryMuscles}
                  variant="neutral"
                />
                <TagSection label="Partes del cuerpo" tags={data.bodyParts} />
                <TagSection
                  label="Equipamiento"
                  tags={data.equipments}
                  variant="neutral"
                />

                {data.exerciseTips.length > 0 && (
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
                      Consejos
                    </p>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: 18,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      {data.exerciseTips.map((tip: string, index: number) => (
                        <li
                          key={index}
                          style={{
                            fontSize: 13,
                            color: 'var(--text-secondary)',
                            lineHeight: 1.5,
                          }}
                        >
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.variations.length > 0 && (
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
                      Variaciones
                    </p>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: 18,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      {data.variations.map((variation: string, index: number) => (
                        <li
                          key={index}
                          style={{
                            fontSize: 13,
                            color: 'var(--text-secondary)',
                            lineHeight: 1.5,
                          }}
                        >
                          {variation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
