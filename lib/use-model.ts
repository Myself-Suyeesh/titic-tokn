import { useCallback, useEffect, useState } from 'react';
import type { SiteAdapter } from '../adapters/types';
import { findModelByLabel, modelsForFamily, resolveModel } from '../core/models';
import type { ModelInfo } from '../core/models';
import { loadModelId, saveModelId } from './settings';

export interface ModelState {
  /** The model in use, or null if nothing is detected or chosen. */
  model: ModelInfo | null;
  /** Models the picker offers on this site. */
  models: ModelInfo[];
  /** False when the page itself shows the model, so a manual pick would have no effect. */
  canPick: boolean;
  choose: (model: ModelInfo) => void;
}

/** Detected model (from the page) or the one the user picked and saved for this site. */
export function useModel(adapter: SiteAdapter): ModelState {
  const [savedId, setSavedId] = useState<string | null>(null);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadModelId(adapter.id).then((id) => {
      if (!cancelled) setSavedId(id);
    });
    return () => {
      cancelled = true;
    };
  }, [adapter]);

  useEffect(() => {
    const read = () => setLabel(adapter.getModelLabel(document));
    read();
    const timer = setInterval(read, 1000);
    return () => clearInterval(timer);
  }, [adapter]);

  const choose = useCallback(
    (model: ModelInfo) => {
      setSavedId(model.id);
      void saveModelId(adapter.id, model.id);
    },
    [adapter],
  );

  return {
    model: resolveModel(label, savedId),
    models: modelsForFamily(adapter.modelFamily),
    canPick: !(label !== null && findModelByLabel(label) !== null),
    choose,
  };
}
