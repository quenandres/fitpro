import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const variantClass =
    variant === 'primary'   ? 'fp-btn-primary'   :
    variant === 'secondary' ? 'fp-btn-secondary' :
    variant === 'danger'    ? 'fp-btn-danger'     :
    variant === 'success'   ? 'fp-btn-primary'    :
    'fp-btn-ghost';

  const sizeStyle =
    size === 'sm' ? { padding: '6px 12px', fontSize: 12 } :
    size === 'lg' ? { padding: '12px 22px', fontSize: 15 } :
    { padding: '9px 16px', fontSize: 13 };

  const dangerStyle = variant === 'danger'
    ? { background: 'var(--accent-red)', color: '#fff', boxShadow: '0 0 14px rgba(248,81,73,.25)' }
    : {};

  return (
    <button
      className={`fp-btn ${variantClass} ${className}`}
      style={{ width: fullWidth ? '100%' : undefined, gap: 6, ...sizeStyle, ...dangerStyle, ...style }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
        </svg>
      ) : (
        <>
          {icon && iconPosition === 'left'  && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  );
};

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  variant = 'ghost',
  size = 'md',
  style,
  ...props
}) => {
  const sz = size === 'sm' ? 28 : size === 'lg' ? 38 : 32;
  const accentStyle =
    variant === 'primary' ? { background: 'var(--brand-dim)', color: 'var(--brand)' } :
    variant === 'danger'  ? { background: 'rgba(248,81,73,.1)', color: 'var(--accent-red)' } :
    { background: 'transparent', color: 'var(--text-secondary)' };

  return (
    <button
      className="fp-btn fp-btn-ghost"
      style={{ width: sz, height: sz, padding: 0, borderRadius: 9, ...accentStyle, ...style }}
      {...props}
    >
      {children}
    </button>
  );
};

export const FAB: React.FC<{ onClick: () => void; icon: React.ReactNode }> = ({ onClick, icon }) => (
  <button
    onClick={onClick}
    className="fp-btn fp-btn-primary"
    style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 40, width: 52, height: 52, padding: 0, borderRadius: '50%', fontSize: 22 }}
  >
    {icon}
  </button>
);
