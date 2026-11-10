import { describe, expect, it } from 'vitest';
import type { ModelInfo } from './models';
import { countFor, countPromptTokens, estimateTokens } from './tokenizer';

describe('countPromptTokens', () => {
  it('returns 0 for an empty string', () => {
    expect(countPromptTokens('')).toBe(0);
  });

  it('counts "Hello world" as 2 tokens (o200k_base reference value)', () => {
    expect(countPromptTokens('Hello world')).toBe(2);
  });

  it('counts unicode and emoji without throwing', () => {
    expect(countPromptTokens('héllo 世界 🚀')).toBeGreaterThan(0);
  });

  it('grows with longer text', () => {
    const short = countPromptTokens('one two three');
    const long = countPromptTokens('one two three '.repeat(100));
    expect(long).toBeGreaterThan(short);
  });

  it('counts a ~10k-token prompt well under 100 ms', () => {
    const text = 'The quick brown fox jumps over the lazy dog. '.repeat(1000);
    countPromptTokens(text); // warm up the encoder
    const start = performance.now();
    const tokens = countPromptTokens(text);
    const elapsed = performance.now() - start;
    expect(tokens).toBeGreaterThan(9000);
    expect(elapsed).toBeLessThan(100);
  });
});

const gpt: ModelInfo = {
  id: 'gpt-4o',
  name: 'GPT-4o',
  family: 'openai',
  tokenizer: 'o200k_base',
  exact: true,
  contextWindow: 128_000,
  inputPerMTok: 2.5,
  outputPerMTok: 10,
};

describe('estimateTokens', () => {
  it('is about 4 characters per token, rounded up', () => {
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens('abcd')).toBe(1);
    expect(estimateTokens('abcde')).toBe(2);
  });
});

describe('countFor', () => {
  it('is exact with a known model', () => {
    expect(countFor(gpt, 'Hello world')).toEqual({ tokens: 2, exact: true });
  });

  it('counts with the encoding but labels it an estimate when the tokenizer is unverified', () => {
    expect(countFor({ ...gpt, exact: false }, 'Hello world')).toEqual({ tokens: 2, exact: false });
  });

  it('is an estimate with no model', () => {
    expect(countFor(null, 'Hello world')).toEqual({ tokens: 3, exact: false });
  });
});
