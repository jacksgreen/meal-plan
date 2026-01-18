import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  onClear?: () => void;
}

export function Input({
  label,
  error,
  className,
  id,
  onClear,
  value,
  ...props
}: InputProps) {
  const inputId = id || props.name;
  const showClear = onClear && value;

  return (
    <div className="form-field">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div className="form-input-wrapper">
        <input
          id={inputId}
          value={value}
          className={cn('form-input', showClear && 'form-input--clearable', error && 'form-input--error', className)}
          {...props}
        />
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            className="form-input-clear"
            aria-label="Clear field"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
