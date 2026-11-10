import { countTokens } from 'gpt-tokenizer/encoding/o200k_base';
import type { ModelInfo } from './models';

/**
 * Exact token count for models that use the o200k_base encoding (GPT-4o family).
 * Runs locally; the text never leaves the page.
 */
export function countPromptTokens(text: string): number {
  return text === '' ? 0 : countTokens(text);
}

/** Generic estimate for unknown models: about 4 characters per token. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export interface TokenCount {
  tokens: number;
  /** True only when the model's own public tokenizer was used. */
  exact: boolean;
}

/**
 * Counts `text` for `model` with its encoding; exact only if the model's tokenizer is
 * verified. With no model, falls back to the generic estimate.
 */
export function countFor(model: ModelInfo | null, text: string): TokenCount {
  if (model) return { tokens: countPromptTokens(text), exact: model.exact };
  return { tokens: estimateTokens(text), exact: false };
}
