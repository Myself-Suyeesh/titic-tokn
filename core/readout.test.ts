import { describe, expect, it } from 'vitest';
import type { ModelInfo } from './models';
import { buildReadout } from './readout';

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

describe('buildReadout', () => {
  it('has no cost, share or hint without a model', () => {
    expect(buildReadout({ tokens: 500, exact: false }, null)).toEqual({
      tokens: 500,
      exact: false,
      cost: null,
      ratio: null,
      level: null,
      hint: null,
      contextWindow: null,
    });
  });

  it('is healthy with no hint for a small prompt', () => {
    const r = buildReadout({ tokens: 24_860, exact: true }, model);
    expect(r.level).toBe('ok');
    expect(r.hint).toBeNull();
    expect(r.ratio).toBeCloseTo(0.194, 3);
    expect(r.cost).toBeCloseTo(0.06215, 5);
    expect(r.contextWindow).toBe(128_000);
  });

  it('warns near the limit with a trim hint', () => {
    const r = buildReadout({ tokens: 94_700, exact: true }, model);
    expect(r.level).toBe('warn');
    expect(r.hint).toBe('trim ~5.1k to get under 70%');
  });

  it('is danger over the limit', () => {
    const r = buildReadout({ tokens: 140_000, exact: true }, model);
    expect(r.level).toBe('danger');
    expect(r.hint).toBe('over the window by ~12k');
  });
});
