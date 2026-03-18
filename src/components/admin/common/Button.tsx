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
  ...props
}) => {
  const variants = {
    primary: {
      bg: 'bg-gradient-to-r from-orange-500 to-orange-600',
      hover: 'hover:from-orange-400 hover:to-orange-500',
      shadow: 'shadow-lg shadow-orange-500/25',
      text: 'text-white',
    },
    secondary: {
      bg: 'bg-white border border-gray-200',
      hover: 'hover:bg-gray-50',
      shadow: 'shadow-sm',
      text: 'text-gray-700',
    },
    ghost: {
      bg: 'bg-transparent',
      hover: 'hover:bg-gray-100',
      shadow: '',
      text: 'text-gray-500 hover:text-gray-700',
    },
    danger: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      hover: 'hover:from-red-400 hover:to-red-500',
      shadow: 'shadow-lg shadow-red-500/25',
      text: 'text-white',
    },
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-green-600',
      hover: 'hover:from-green-400 hover:to-green-500',
      shadow: 'shadow-lg shadow-green-500/25',
      text: 'text-white',
    },
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-base gap-2',
    lg: 'px-6 py-3.5 text-lg gap-2.5',
  };

  const variantStyle = variants[variant];
  const sizeStyle = sizes[size];

  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-200 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${variantStyle.bg} ${variantStyle.hover} ${variantStyle.shadow} ${variantStyle.text}
        ${sizeStyle}
        hover:scale-[1.02] active:scale-[0.98]
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  );
};

// Icon Button
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30',
    secondary: 'bg-white/10 text-white hover:bg-white/20',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/10',
    danger: 'bg-red-500/20 text-red-400 hover:bg-red-500/30',
  };

  const sizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  return (
    <button
      className={`
        rounded-lg transition-all duration-200
        hover:scale-110 active:scale-95
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

// Floating Action Button
export const FAB: React.FC<{ onClick: () => void; icon: React.ReactNode }> = ({ onClick, icon }) => (
  <button
    onClick={onClick}
    className="
      fixed bottom-6 right-6 z-40
      w-14 h-14 rounded-full
      bg-gradient-to-r from-orange-500 to-orange-600
      text-white
      shadow-lg shadow-orange-500/40
      flex items-center justify-center
      hover:scale-110 active:scale-95
      transition-transform duration-200
    "
  >
    {icon}
  </button>
);
