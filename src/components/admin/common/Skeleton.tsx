import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'wave',
}) => {
  const baseClasses = 'bg-gray-700/50';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
    backgroundImage: animation === 'wave' 
      ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' 
      : undefined,
    backgroundSize: animation === 'wave' ? '200% 100%' : undefined,
    animation: animation === 'wave' ? 'shimmer 1.5s infinite' : undefined,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

// Skeleton Card for lists
export const SkeletonCard: React.FC = () => (
  <div className="p-4 rounded-2xl bg-[#1a1a1a]/50 border border-white/5">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" height={20} className="mb-2" />
        <Skeleton variant="text" width="40%" height={14} />
      </div>
    </div>
    <Skeleton variant="rectangular" height={60} />
  </div>
);

// Skeleton Table Row
export const SkeletonRow: React.FC<{ columns?: number }> = ({ columns = 4 }) => (
  <div className="flex items-center gap-4 p-4 border-b border-white/5">
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton key={i} variant="text" width={`${100 / columns}%`} height={16} />
    ))}
  </div>
);

// Skeleton Form
export const SkeletonForm: React.FC = () => (
  <div className="space-y-4 p-4">
    <Skeleton variant="text" width={100} height={16} className="mb-2" />
    <Skeleton variant="rectangular" height={48} />
    <Skeleton variant="text" width={100} height={16} className="mt-4 mb-2" />
    <Skeleton variant="rectangular" height={48} />
    <Skeleton variant="text" width={100} height={16} className="mt-4 mb-2" />
    <Skeleton variant="rectangular" height={100} />
  </div>
);
