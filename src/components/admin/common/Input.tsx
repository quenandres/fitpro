import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label, error, success, icon, fullWidth = true, className = '', id, ...props
}) => {
  const [showPwd, setShowPwd] = useState(false);
  const inputId   = id || `input-${Math.random().toString(36).slice(7)}`;
  const isPassword = props.type === 'password';

  return (
    <div style={{ width: fullWidth ? '100%' : undefined }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '.05em', color: error ? 'var(--accent-red)' : success ? 'var(--brand)' : 'var(--text-muted)' }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`fp-input ${className}`}
          style={{
            paddingLeft: icon ? 34 : undefined,
            paddingRight: isPassword || error || success ? 34 : undefined,
            borderColor: error ? 'rgba(248,81,73,.5)' : success ? 'rgba(34,197,94,.5)' : undefined,
          }}
          type={isPassword && showPwd ? 'text' : props.type}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
          >
            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
        {error && !isPassword && (
          <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
            <AlertCircle size={15} color="var(--accent-red)" />
          </div>
        )}
        {success && !error && !isPassword && (
          <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
            <CheckCircle size={15} color="var(--brand)" />
          </div>
        )}
      </div>
      {error   && <p style={{ marginTop: 5, fontSize: 12, color: 'var(--accent-red)' }}>{error}</p>}
      {success && !error && <p style={{ marginTop: 5, fontSize: 12, color: 'var(--brand)' }}>{success}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label, error, fullWidth = true, className = '', id, ...props
}) => {
  const inputId = id || `ta-${Math.random().toString(36).slice(7)}`;
  return (
    <div style={{ width: fullWidth ? '100%' : undefined }}>
      {label && (
        <label htmlFor={inputId} style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '.05em', color: error ? 'var(--accent-red)' : 'var(--text-muted)' }}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`fp-input ${className}`}
        style={{ resize: 'vertical', minHeight: 80, borderColor: error ? 'rgba(248,81,73,.5)' : undefined }}
        {...props}
      />
      {error && <p style={{ marginTop: 5, fontSize: 12, color: 'var(--accent-red)' }}>{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label, error, options, fullWidth = true, className = '', id, ...props
}) => {
  const inputId = id || `sel-${Math.random().toString(36).slice(7)}`;
  return (
    <div style={{ width: fullWidth ? '100%' : undefined }}>
      {label && (
        <label htmlFor={inputId} style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '.05em', color: error ? 'var(--accent-red)' : 'var(--text-muted)' }}>
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`fp-input ${className}`}
        style={{ borderColor: error ? 'rgba(248,81,73,.5)' : undefined }}
        {...props}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p style={{ marginTop: 5, fontSize: 12, color: 'var(--accent-red)' }}>{error}</p>}
    </div>
  );
};
