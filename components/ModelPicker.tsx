import { useEffect } from 'react';
import { isExact } from '../core/models';
import type { ModelInfo } from '../core/models';
import { CheckIcon } from './icons';

interface ModelPickerProps {
  models: ModelInfo[];
  selectedId: string | null;
  onSelect: (model: ModelInfo) => void;
  onClose: () => void;
}

export function ModelPicker({ models, selectedId, onSelect, onClose }: ModelPickerProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <ul className="picker" aria-label="Choose model">
      {models.map((model) => (
        <li key={model.id}>
          <button
            type="button"
            aria-current={model.id === selectedId ? 'true' : undefined}
            onClick={() => onSelect(model)}
          >
            <span className="picker-name">
              {model.name}
              {model.id === selectedId && <CheckIcon className="picker-check" />}
            </span>
            <span className="tag">{isExact(model) ? 'exact' : 'est.'}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
