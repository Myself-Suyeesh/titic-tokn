import { describe, expect, it } from 'vitest';
import { formatCompact, formatCost, formatPercent } from './format';

describe('formatCompact', () => {
  it('formats small, thousand and million amounts', () => {
    expect(formatCompact(0)).toBe('0');
    expect(formatCompact(800)).toBe('800');
    expect(formatCompact(1500)).toBe('1.5k');
    expect(formatCompact(12_400)).toBe('12k');
    expect(formatCompact(128_000)).toBe('128k');
    expect(formatCompact(272_000)).toBe('272k');
    expect(formatCompact(1_000_000)).toBe('1M');
    expect(formatCompact(1_047_576)).toBe('1.05M');
  });
});

describe('formatCost', () => {
  it('uses three decimals', () => {
    expect(formatCost(0.0621)).toBe('$0.062');
    expect(formatCost(0.284)).toBe('$0.284');
    expect(formatCost(12.5)).toBe('$12.500');
  });

  it('handles zero and tiny amounts', () => {
    expect(formatCost(0)).toBe('$0.000');
    expect(formatCost(0.0004)).toBe('<$0.001');
  });
});

describe('formatPercent', () => {
  it('rounds to whole percent', () => {
    expect(formatPercent(0.19)).toBe('19%');
    expect(formatPercent(0.745)).toBe('75%');
    expect(formatPercent(1.2)).toBe('120%');
  });

  it('shows <1% for a tiny non-zero share and 0% for none', () => {
    expect(formatPercent(0.002)).toBe('<1%');
    expect(formatPercent(0)).toBe('0%');
  });
});
