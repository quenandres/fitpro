import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  glow = false,
  onClick 
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        backdrop-blur-xl
        rounded-2xl
        border border-white/10
        shadow-xl
        transition-all duration-300 ease-out
        ${hover ? 'hover:scale-[1.02] hover:shadow-2xl cursor-pointer' : ''}
        ${glow ? 'hover:shadow-[0_0_30px_rgba(255,107,0,0.3)]' : ''}
        ${className}
      `}
      style={{
        background: 'rgba(30, 30, 30, 0.8)',
      }}
    >
      {children}
    </div>
  );
};

export const GlassCardLight: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  glow = false,
  onClick 
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        backdrop-blur-xl
        rounded-2xl
        border border-black/10
        shadow-xl
        transition-all duration-300 ease-out
        ${hover ? 'hover:scale-[1.02] hover:shadow-2xl cursor-pointer' : ''}
        ${glow ? 'hover:shadow-[0_0_30px_rgba(255,107,0,0.2)]' : ''}
        ${className}
      `}
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
      }}
    >
      {children}
    </div>
  );
};
