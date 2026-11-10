import { describe, expect, it } from 'vitest';
import { countPromptTokens } from './tokenizer';

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
