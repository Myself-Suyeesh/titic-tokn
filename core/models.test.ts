import { describe, expect, it } from 'vitest';
import {
  MODELS,
  findModelByLabel,
  getModelById,
  isExact,
  modelsForFamily,
  normalizeLabel,
  resolveModel,
} from './models';

describe('model table', () => {
  it('has complete, sane data for every model', () => {
    expect(MODELS.length).toBeGreaterThan(0);
    for (const m of MODELS) {
      expect(m.contextWindow).toBeGreaterThan(0);
      expect(m.inputPerMTok).toBeGreaterThan(0);
      expect(m.outputPerMTok).toBeGreaterThan(0);
    }
  });

  it('includes the latest GPT-6 and GPT-5.6 models', () => {
    for (const id of ['gpt-6.1-sol', 'gpt-6-sol', 'gpt-6-luna', 'gpt-6-astra', 'gpt-5.6']) {
      expect(getModelById(id)).not.toBeNull();
    }
  });

  it('has unique ids', () => {
    expect(new Set(MODELS.map((m) => m.id)).size).toBe(MODELS.length);
  });
});

describe('normalizeLabel', () => {
  it('lower-cases, maps chatgpt to gpt and collapses punctuation', () => {
    expect(normalizeLabel('ChatGPT 5.5 Thinking')).toBe('gpt-5.5-thinking');
    expect(normalizeLabel('  GPT-4o  ')).toBe('gpt-4o');
  });
});

describe('findModelByLabel', () => {
  it('matches exact names', () => {
    expect(findModelByLabel('GPT-4o')?.id).toBe('gpt-4o');
    expect(findModelByLabel('o3')?.id).toBe('o3');
  });

  it('prefers the longest match (mini over base)', () => {
    expect(findModelByLabel('GPT-4o mini')?.id).toBe('gpt-4o-mini');
    expect(findModelByLabel('GPT-5.4 mini')?.id).toBe('gpt-5.4-mini');
  });

  it('matches labels with extra words around the name', () => {
    expect(findModelByLabel('ChatGPT 5.5 Thinking')?.id).toBe('gpt-5.5');
    expect(findModelByLabel('GPT-5')?.id).toBe('gpt-5');
  });

  it('does not match a prefix of a different version', () => {
    expect(findModelByLabel('GPT-5.50')).toBeNull();
    expect(findModelByLabel('GPT-5.9')).toBeNull();
  });

  it('ignores a trailing full stop', () => {
    expect(findModelByLabel('Using GPT-5.')?.id).toBe('gpt-5');
  });

  it('returns null for unknown names', () => {
    expect(findModelByLabel('Mystery model 9')).toBeNull();
    expect(findModelByLabel('')).toBeNull();
  });
});

describe('isExact', () => {
  it('is true for models the tokenizer library lists', () => {
    expect(isExact(getModelById('gpt-4o')!)).toBe(true);
    expect(isExact(getModelById('gpt-5.5')!)).toBe(true);
    expect(isExact(getModelById('gpt-5.6-sol')!)).toBe(true);
  });

  it('is false for models whose tokenizer is not verified (GPT-6 family)', () => {
    expect(isExact(getModelById('gpt-6-sol')!)).toBe(false);
    expect(isExact(getModelById('gpt-6.1-terra')!)).toBe(false);
  });
});

describe('lookups', () => {
  it('gets by id and by family', () => {
    expect(getModelById('gpt-4o')?.name).toBe('GPT-4o');
    expect(getModelById('nope')).toBeNull();
    expect(modelsForFamily('openai').length).toBe(MODELS.length);
  });
});

describe('resolveModel', () => {
  it('prefers a detected label over the saved choice', () => {
    expect(resolveModel('GPT-4o', 'gpt-5')?.id).toBe('gpt-4o');
  });

  it('falls back to the saved choice, then to null', () => {
    expect(resolveModel(null, 'gpt-5')?.id).toBe('gpt-5');
    expect(resolveModel('Unknown thing', 'gpt-5')?.id).toBe('gpt-5');
    expect(resolveModel(null, null)).toBeNull();
    expect(resolveModel(null, 'stale-id')).toBeNull();
  });
});
