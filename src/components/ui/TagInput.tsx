import { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  error?: string;
}

export function TagInput({
  label,
  value,
  onChange,
  placeholder = 'Type and press comma to add',
  error,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue('');
  }, [value, onChange]);

  const removeTag = useCallback((tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  }, [value, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <div className="form-field">
      {label && <label className="form-label">{label}</label>}
      <div className={cn('tag-input-container', error && 'tag-input-container--error')}>
        {value.map((tag) => (
          <span key={tag} className="tag-input-tag">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="tag-input-remove"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : ''}
          className="tag-input-field"
        />
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
