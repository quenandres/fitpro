import { useEffect, useState } from 'react';
import { Clock, RefreshCw, X } from 'lucide-react';
import { useExercise } from '../../../lib/exercisedb';
import { useDataStore } from '../../../store/useDataStore';
import type { RoutineFormExercise } from '../../../types';
import { calculateExerciseDuration } from '../../../utils/calculateRoutineDuration';
import { Skeleton } from '../../common/Skeleton';

interface Props {
  ejercicio: RoutineFormExercise | null;
  restBetweenSetsSec: number;
  onClose: () => void;
}

const formatDuration = (seconds: number): string => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  if (min === 0) return `${sec} s`;
  if (sec === 0) return `${min} min`;
  return `${min} min ${sec} s`;
};

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

export const ExercisePreviewModal = ({
  ejercicio,
  restBetweenSetsSec,
  onClose,
}: Props) => {
  const { data, isLoading, isError, refetch } = useExercise(ejercicio?.exerciseDbId);
  const ejerciciosLocales = useDataStore((s) => s.ejercicios);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoFailed(false);
  }, [ejercicio?.exerciseDbId, ejercicio?._key]);

  useEffect(() => {
    if (!ejercicio) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [ejercicio, onClose]);

  if (!ejercicio) return null;

  const duration = calculateExerciseDuration(ejercicio, restBetweenSetsSec);
  const localMatch = ejerciciosLocales.find(
    (ej) => ej.nombre.toLowerCase() === ejercicio.nombre.toLowerCase(),
  );
  const description =
    data?.overview?.trim() ||
    localMatch?.descripcion_larga?.trim() ||
    localMatch?.descripcion?.trim() ||
    '';
  const targetMuscles = data?.targetMuscles ?? [];
  const secondaryMuscles = data?.secondaryMuscles ?? [];
  const fallbackMuscles = ejercicio.musculos_anatomia?.length
    ? ejercicio.musculos_anatomia
    : (localMatch?.grupo_muscular ?? []);
  const waitingApi = Boolean(ejercicio.exerciseDbId) && isLoading;
  const videoUrl = data?.videoUrl;
  const motionImage =
    data?.imageUrls?.['720p'] ?? data?.imageUrl ?? ejercicio.imageUrl ?? localMatch?.imagen;
  const showVideo = Boolean(videoUrl) && !videoFailed;
  const showMedia = waitingApi || showVideo || Boolean(motionImage);

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center"
      style={{
        background: 'rgba(0,0,0,.75)',
        backdropFilter: 'blur(8px)',
        padding: 16,
      }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="fp-card animate-slide-up w-full max-w-md overflow-hidden"
        style={{ borderRadius: 20, maxHeight: '85vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exercise-preview-title"
      >
        <div
          style={{
            height: 3,
            background: 'linear-gradient(90deg,var(--brand),var(--accent-blue))',
          }}
        />

        {showMedia && (
          <div
            style={{
              width: '100%',
              aspectRatio: '16/10',
              background: 'var(--bg-overlay)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {waitingApi && !motionImage ? (
              <Skeleton variant="rectangular" height="100%" />
            ) : showVideo ? (
              <video
                key={videoUrl}
                src={videoUrl}
                poster={motionImage}
                autoPlay
                loop
                muted
                playsInline
                onError={() => setVideoFailed(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              motionImage && (
                <img
                  src={motionImage}
                  alt={`Movimiento de ${ejercicio.nombre}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )
            )}
          </div>
        )}

        <div style={{ padding: 18 }}>
          <div className="flex items-start justify-between" style={{ marginBottom: 14 }}>
            <div className="min-w-0 flex-1" style={{ paddingRight: 12 }}>
              <h2
                id="exercise-preview-title"
                className="font-sora"
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                {ejercicio.nombre}
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {ejercicio.series} series · {ejercicio.valor} reps
              </p>
            </div>
            <button
              type="button"
              className="fp-btn fp-btn-ghost"
              style={{ padding: '6px 8px', borderRadius: 9, flexShrink: 0 }}
              onClick={onClose}
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 12,
                border: '1px solid rgba(88,166,255,.25)',
                background: 'rgba(88,166,255,.1)',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(88,166,255,.18)',
                  flexShrink: 0,
                }}
              >
                <Clock size={18} color="#58a6ff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  className="font-sora"
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#58a6ff',
                    lineHeight: 1.1,
                  }}
                >
                  {formatDuration(duration.totalSeconds)}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Trabajo {formatDuration(duration.workSeconds)} · Descanso{' '}
                  {formatDuration(duration.restSeconds)}
                </p>
              </div>
            </div>

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
                Descripción
              </p>
              {waitingApi ? (
                <>
                  <Skeleton variant="text" width="100%" height={14} className="mb-2" />
                  <Skeleton variant="text" width="80%" height={14} />
                </>
              ) : isError && ejercicio.exerciseDbId ? (
                <div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
                    No se pudo cargar la descripción desde la biblioteca
                  </p>
                  <button
                    type="button"
                    className="fp-btn fp-btn-secondary"
                    style={{ gap: 6, fontSize: 12 }}
                    onClick={() => refetch()}
                  >
                    <RefreshCw size={14} />
                    Reintentar
                  </button>
                </div>
              ) : (
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
                    {description || 'Sin descripción disponible para este ejercicio.'}
                  </p>
                </div>
              )}
            </div>

            {waitingApi ? (
              <div>
                <Skeleton variant="text" width="40%" height={12} className="mb-2" />
                <div style={{ display: 'flex', gap: 6 }}>
                  <Skeleton variant="rectangular" width={72} height={22} />
                  <Skeleton variant="rectangular" width={88} height={22} />
                </div>
              </div>
            ) : (
              <>
                <TagSection label="Músculos objetivo" tags={targetMuscles} />
                <TagSection
                  label="Músculos secundarios"
                  tags={secondaryMuscles}
                  variant="neutral"
                />
                {targetMuscles.length === 0 && secondaryMuscles.length === 0 && (
                  <TagSection label="Músculos en los que trabaja" tags={fallbackMuscles} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
