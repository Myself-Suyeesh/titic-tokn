import { describe, expect, it } from 'vitest';
import { estimateInputCost, estimateOutputCost } from './cost';
import type { ModelInfo } from './models';

const model: ModelInfo = {
  id: 'test',
  name: 'Test',
  family: 'openai',
  tokenizer: 'o200k_base',
  exact: true,
  contextWindow: 128_000,
  inputPerMTok: 2.5,
  outputPerMTok: 10,
};

describe('estimateInputCost', () => {
  it('multiplies tokens by the per-million input price', () => {
    expect(estimateInputCost(1_000_000, model)).toBeCloseTo(2.5);
    expect(estimateInputCost(24_860, model)).toBeCloseTo(0.06215, 5);
  });

  it('is zero for no tokens', () => {
    expect(estimateInputCost(0, model)).toBe(0);
  });
});

describe('estimateOutputCost', () => {
  it('multiplies tokens by the per-million output price', () => {
    expect(estimateOutputCost(800, model)).toBeCloseTo(0.008);
    expect(estimateOutputCost(0, model)).toBe(0);
  });
});
