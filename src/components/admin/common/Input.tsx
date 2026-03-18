import React, { useState, useRef } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  icon,
  fullWidth = true,
  className = '',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = id || `input-${Math.random().toString(36).substring(7)}`;
  const isPassword = props.type === 'password';
  const hasError = !!error;
  const hasSuccess = !!success;

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className={`
            block text-sm font-medium mb-2 transition-all duration-200
            ${hasError ? 'text-red-500' : hasSuccess ? 'text-green-500' : 'text-gray-600'}
          `}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          ref={inputRef}
          id={inputId}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-gray-50 border border-gray-200
            text-gray-800 placeholder-gray-400
            transition-all duration-200
            outline-none
            ${icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
            ${hasError 
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
              : hasSuccess
                ? 'border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                : 'border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
            }
            ${className}
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}

        {hasError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
        )}
        
        {hasSuccess && !hasError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
      
      {success && !error && (
        <p className="mt-1.5 text-sm text-green-400">{success}</p>
      )}
    </div>
  );
};

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  fullWidth = true,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `textarea-${Math.random().toString(36).substring(7)}`;

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className={`
            block text-sm font-medium mb-2 transition-all duration-200
            ${error ? 'text-red-400' : 'text-gray-400'}
          `}
        >
          {label}
        </label>
      )}
      
      <textarea
        id={inputId}
        className={`
          w-full px-4 py-3 rounded-xl
          bg-white/5 border-2
          text-white placeholder-gray-500
          transition-all duration-200
          outline-none resize-none
          ${error 
            ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
            : 'border-white/10 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20'
          }
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  fullWidth = true,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `select-${Math.random().toString(36).substring(7)}`;

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className={`
            block text-sm font-medium mb-2 transition-all duration-200
            ${error ? 'text-red-400' : 'text-gray-400'}
          `}
        >
          {label}
        </label>
      )}
      
      <select
        id={inputId}
        className={`
          w-full px-4 py-3 rounded-xl
          bg-white/5 border-2
          text-white
          transition-all duration-200
          outline-none cursor-pointer
          appearance-none
          ${error 
            ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
            : 'border-white/10 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20'
          }
          ${className}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1.25rem',
        }}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-gray-900">
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};
