import { cn } from '../../lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || props.name;

  return (
    <div className="form-field">
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn('form-input form-textarea', error && 'form-input--error', className)}
        {...props}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
