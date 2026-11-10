/** Compact token amounts: 800, 1.5k, 12k, 128k, 1.05M. */
export function formatCompact(n: number): string {
  const value = Math.max(0, Math.round(n));
  if (value >= 1_000_000) return `${+(value / 1_000_000).toFixed(2)}M`;
  if (value >= 10_000) return `${Math.round(value / 1000)}k`;
  if (value >= 1000) return `${+(value / 1000).toFixed(1)}k`;
  return String(value);
}

/** USD with three decimals; tiny non-zero amounts read "<$0.001". */
export function formatCost(usd: number): string {
  if (usd > 0 && usd < 0.001) return '<$0.001';
  return `$${usd.toFixed(3)}`;
}

/** Whole percent; a non-zero share under 1% reads "<1%". */
export function formatPercent(ratio: number): string {
  const percent = Math.round(ratio * 100);
  return ratio > 0 && percent < 1 ? '<1%' : `${percent}%`;
}
