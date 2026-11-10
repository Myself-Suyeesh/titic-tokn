import { describe, expect, it } from 'vitest';
import { loadModelId, saveModelId } from './settings';

function fakeArea(initial: Record<string, unknown> = {}) {
  const data = { ...initial };
  return {
    data,
    get: async (key: string) => ({ [key]: data[key] }),
    set: async (items: Record<string, unknown>) => {
      Object.assign(data, items);
    },
  };
}

describe('model settings', () => {
  it('returns null when nothing is saved', async () => {
    expect(await loadModelId('chatgpt', fakeArea())).toBeNull();
  });

  it('saves and loads per site', async () => {
    const area = fakeArea();
    await saveModelId('chatgpt', 'gpt-4o', area);
    await saveModelId('claude', 'claude-sonnet-5-5', area);
    expect(await loadModelId('chatgpt', area)).toBe('gpt-4o');
    expect(await loadModelId('claude', area)).toBe('claude-sonnet-5-5');
  });

  it('overwrites an earlier choice for the same site', async () => {
    const area = fakeArea();
    await saveModelId('chatgpt', 'gpt-4o', area);
    await saveModelId('chatgpt', 'gpt-5', area);
    expect(await loadModelId('chatgpt', area)).toBe('gpt-5');
  });

  it('ignores corrupt stored data', async () => {
    expect(await loadModelId('chatgpt', fakeArea({ modelBySite: 'oops' }))).toBeNull();
    expect(await loadModelId('chatgpt', fakeArea({ modelBySite: { chatgpt: 42 } }))).toBeNull();
  });
});
