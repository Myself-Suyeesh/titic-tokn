import { isExact } from '../core/models';
import type { ModelInfo } from '../core/models';
import { CaretIcon } from './icons';

interface ModelChipProps {
  model: ModelInfo | null;
  /** False when the page already shows the model. */
  canPick: boolean;
  open: boolean;
  onToggle: () => void;
}

export function ModelChip({ model, canPick, open, onToggle }: ModelChipProps) {
  const text = model ? `${model.name} · ${isExact(model) ? 'exact' : 'est.'}` : 'Pick a model · est.';

  if (!canPick) return <span className="chip">{text}</span>;

  return (
    <button type="button" className="chip chip--button" aria-label="Choose model" aria-expanded={open} onClick={onToggle}>
      {text}
      <CaretIcon size={8} />
    </button>
  );
}
