import { describe, expect, it } from 'vitest';
import { contextRatio, contextState, trimHint } from './meter';

describe('contextState', () => {
  it('is ok below 70%', () => {
    expect(contextState(0)).toBe('ok');
    expect(contextState(0.699)).toBe('ok');
  });

  it('is warn from 70% up to 90%', () => {
    expect(contextState(0.7)).toBe('warn');
    expect(contextState(0.899)).toBe('warn');
  });

  it('is danger from 90%', () => {
    expect(contextState(0.9)).toBe('danger');
    expect(contextState(1.4)).toBe('danger');
  });
});

describe('contextRatio', () => {
  it('divides tokens by the window and guards a zero window', () => {
    expect(contextRatio(64_000, 128_000)).toBe(0.5);
    expect(contextRatio(10, 0)).toBe(0);
  });
});

describe('trimHint', () => {
  it('is null while healthy', () => {
    expect(trimHint(50_000, 128_000)).toBeNull();
  });

  it('targets the amber threshold, so the target is always below the reading', () => {
    // 94,700 of 128k = 74%; 70% of 128k = 89,600; trim ~5.1k
    expect(trimHint(94_700, 128_000)).toBe('trim ~5.1k to get under 70%');
    expect(trimHint(118_200, 128_000)).toBe('trim ~29k to get under 70%');
  });

  it('says how far over the window when at or above 100%', () => {
    expect(trimHint(140_000, 128_000)).toBe('over the window by ~12k');
    expect(trimHint(128_000, 128_000)).toBe('over the window by ~0');
  });
});
