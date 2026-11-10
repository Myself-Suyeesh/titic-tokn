import { estimateInputCost, estimateOutputCost } from './cost';
import type { ConversationCount } from './conversation';
import { contextRatio, contextState, trimHint } from './meter';
import type { ContextState } from './meter';
import type { ModelInfo } from './models';
import type { TokenCount } from './tokenizer';

/** Everything the card shows about one count, with no UI in it. */
export interface Readout {
  /** Tokens in the prompt being typed (the big number). */
  tokens: number;
  /** Exact (the model's own tokenizer) or an estimate. */
  exact: boolean;
  /** Prompt plus the visible conversation: what the context bar, share and cost use. */
  contextTokens: number;
  /** True when the page has at least one message, so the "In context" line is shown. */
  hasHistory: boolean;
  /** Messages the site has unloaded and that were never seen, so the total is higher than shown. */
  notLoaded: number;
  /** API-equivalent input cost of the whole context in USD; null when no model is known. */
  cost: number | null;
  /** Tokens in the latest visible reply, and what they would cost as output. */
  replyTokens: number;
  replyCost: number | null;
  /** Share of the model's context window; null when no model is known. */
  ratio: number | null;
  level: ContextState | null;
  /** Replaces the unit line near the limit. */
  hint: string | null;
  contextWindow: number | null;
}

export function buildReadout(
  count: TokenCount,
  model: ModelInfo | null,
  history: ConversationCount | null = null,
): Readout {
  const contextTokens = count.tokens + (history?.tokens ?? 0);
  const replyTokens = history?.replyTokens ?? 0;
  const base = {
    ...count,
    contextTokens,
    hasHistory: (history?.messageCount ?? 0) > 0,
    notLoaded: history?.notLoaded ?? 0,
    replyTokens,
  };
  if (!model) {
    return { ...base, cost: null, replyCost: null, ratio: null, level: null, hint: null, contextWindow: null };
  }
  const ratio = contextRatio(contextTokens, model.contextWindow);
  return {
    ...base,
    cost: estimateInputCost(contextTokens, model),
    replyCost: replyTokens > 0 ? estimateOutputCost(replyTokens, model) : null,
    ratio,
    level: contextState(ratio),
    hint: trimHint(contextTokens, model.contextWindow),
    contextWindow: model.contextWindow,
  };
}
