import type { ModelInfo } from './models';

/** API-equivalent cost of `tokens` input tokens, in USD. */
export function estimateInputCost(tokens: number, model: ModelInfo): number {
  return (tokens * model.inputPerMTok) / 1_000_000;
}

/** API-equivalent cost of `tokens` output tokens (a reply), in USD. */
export function estimateOutputCost(tokens: number, model: ModelInfo): number {
  return (tokens * model.outputPerMTok) / 1_000_000;
}
