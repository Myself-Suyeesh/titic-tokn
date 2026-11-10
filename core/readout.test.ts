import { describe, expect, it } from 'vitest';
import type { ConversationCount } from './conversation';
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

const history = (tokens: number, replyTokens = 0, messageCount = 4): ConversationCount => ({
  tokens,
  replyTokens,
  exact: true,
  messageCount,
  notLoaded: 0,
});

describe('buildReadout without a conversation', () => {
  it('has no cost, share or hint without a model', () => {
    expect(buildReadout({ tokens: 500, exact: false }, null)).toEqual({
      tokens: 500,
      exact: false,
      contextTokens: 500,
      hasHistory: false,
      notLoaded: 0,
      replyTokens: 0,
      cost: null,
      replyCost: null,
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
    expect(r.hasHistory).toBe(false);
    expect(r.replyCost).toBeNull();
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

describe('buildReadout with a conversation', () => {
  it('keeps the prompt as the big number and uses prompt + history for everything else', () => {
    const r = buildReadout({ tokens: 1_240, exact: true }, model, history(93_460, 800));
    expect(r.tokens).toBe(1_240);
    expect(r.contextTokens).toBe(94_700);
    expect(r.hasHistory).toBe(true);
    expect(r.level).toBe('warn'); // 94,700 of 128k = 74%
    expect(r.hint).toBe('trim ~5.1k to get under 70%');
    expect(r.cost).toBeCloseTo(0.23675, 5); // 94,700 tokens x $2.5 per million
  });

  it('prices the latest reply as output', () => {
    const r = buildReadout({ tokens: 0, exact: true }, model, history(10_000, 800));
    expect(r.replyTokens).toBe(800);
    expect(r.replyCost).toBeCloseTo(0.008, 6);
  });

  it('has no reply cost when there is no reply yet', () => {
    expect(buildReadout({ tokens: 5, exact: true }, model, history(10, 0, 1)).replyCost).toBeNull();
  });

  it('shows no history line for an empty conversation, but still adds nothing', () => {
    const r = buildReadout({ tokens: 5, exact: true }, model, history(0, 0, 0));
    expect(r.hasHistory).toBe(false);
    expect(r.contextTokens).toBe(5);
  });

  it('passes the not-loaded count through', () => {
    expect(buildReadout({ tokens: 0, exact: true }, model, { ...history(50, 0, 16), notLoaded: 12 }).notLoaded).toBe(12);
  });

  it('still has a context total with no model, but no cost or share', () => {
    const r = buildReadout({ tokens: 10, exact: false }, null, history(90, 0, 2));
    expect(r.contextTokens).toBe(100);
    expect(r.hasHistory).toBe(true);
    expect(r.cost).toBeNull();
    expect(r.ratio).toBeNull();
  });
});
