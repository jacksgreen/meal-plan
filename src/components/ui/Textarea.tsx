import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  onClear?: () => void;
}

export function Textarea({
  label,
  error,
  className,
  id,
  onClear,
  value,
  ...props
}: TextareaProps) {
  const textareaId = id || props.name;
  const showClear = onClear && value;

  return (
    <div className="form-field">
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
        </label>
      )}
      <div className="form-input-wrapper">
        <textarea
          id={textareaId}
          value={value}
          className={cn('form-input form-textarea', showClear && 'form-input--clearable', error && 'form-input--error', className)}
          {...props}
        />
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            className="form-input-clear form-input-clear--textarea"
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
