import { estimateInputCost } from './cost';
import { contextRatio, contextState, trimHint } from './meter';
import type { ContextState } from './meter';
import type { ModelInfo } from './models';
import type { TokenCount } from './tokenizer';

/** Everything the card shows about one count, with no UI in it. */
export interface Readout {
  tokens: number;
  /** Exact (the model's own tokenizer) or an estimate. */
  exact: boolean;
  /** API-equivalent input cost in USD; null when no model is known. */
  cost: number | null;
  /** Share of the model's context window; null when no model is known. */
  ratio: number | null;
  level: ContextState | null;
  /** Replaces the unit line near the limit. */
  hint: string | null;
  contextWindow: number | null;
}

export function buildReadout(count: TokenCount, model: ModelInfo | null): Readout {
  if (!model) {
    return { ...count, cost: null, ratio: null, level: null, hint: null, contextWindow: null };
  }
  const ratio = contextRatio(count.tokens, model.contextWindow);
  return {
    ...count,
    cost: estimateInputCost(count.tokens, model),
    ratio,
    level: contextState(ratio),
    hint: trimHint(count.tokens, model.contextWindow),
    contextWindow: model.contextWindow,
  };
}
