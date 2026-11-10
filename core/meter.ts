import { formatCompact } from './format';

export type ContextState = 'ok' | 'warn' | 'danger';

/** Defaults from the PRD: green below 70%, amber from 70%, red from 90%. */
export const WARN_AT = 0.7;
export const DANGER_AT = 0.9;

export function contextRatio(tokens: number, contextWindow: number): number {
  return contextWindow > 0 ? tokens / contextWindow : 0;
}

export function contextState(ratio: number): ContextState {
  if (ratio >= DANGER_AT) return 'danger';
  if (ratio >= WARN_AT) return 'warn';
  return 'ok';
}

/**
 * Hint shown in place of the unit line near the limit, written from the real
 * target: the amber threshold. Null while healthy.
 */
export function trimHint(tokens: number, contextWindow: number): string | null {
  const ratio = contextRatio(tokens, contextWindow);
  if (ratio >= 1) return `over the window by ~${formatCompact(tokens - contextWindow)}`;
  if (ratio >= WARN_AT) {
    const target = Math.floor(WARN_AT * contextWindow);
    return `trim ~${formatCompact(tokens - target)} to get under ${Math.round(WARN_AT * 100)}%`;
  }
  return null;
}
